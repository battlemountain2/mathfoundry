import test from "node:test";
import assert from "node:assert/strict";
import {
  getAttemptsForUnit,
  normalizeAttempt,
  getStudySessions,
  getStudyHistory,
  commitStudySession,
  getStudySession,
  getStreak,
  setSettings,
  clearAllData,
} from "../src/utils/storage.js";
import { subscribeStore, getStoreRevision } from "../src/utils/storeEvents.js";
import { getMathUnit } from "../src/data/courses/mathFoundations.js";
import {
  createStudySession,
  submitStudyAnswer,
} from "../src/utils/studySession.js";
import { themePreferences } from "../src/utils/themePreferences.js";
import {
  getSyncConfig,
  saveSyncConfig,
  pushToGist,
  pullFromGist,
} from "../src/utils/githubSync.js";

function fixture(value = {}) {
  const data = new Map([["mathfoundry_data", JSON.stringify(value)]]);
  global.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
  return data;
}

test("course paths outrank overlapping IDs and historical geometry resolves without rewriting data", () => {
  const data = fixture({
    learningAttempts: [
      { id: "math", unitPath: "math/arithmetic", unitId: "arithmetic" },
      {
        id: "other-course",
        unitPath: "geometry/arithmetic",
        unitId: "arithmetic",
      },
      { id: "old-geometry", moduleId: "angles", question: "Find the angle" },
    ],
  });
  const before = data.get("mathfoundry_data");
  assert.deepEqual(
    getAttemptsForUnit("math/arithmetic").map((a) => a.id),
    ["math"],
  );
  assert.deepEqual(
    getAttemptsForUnit("geometry/angles-lines").map((a) => a.id),
    ["old-geometry"],
  );
  assert.equal(
    normalizeAttempt({ moduleId: "circles" }).unitPath,
    "geometry/circles-radians",
  );
  assert.equal(data.get("mathfoundry_data"), before);
});

test("malformed saved session collections cannot crash Today or review and remain recoverable", () => {
  const data = fixture({
    studySessions: {
      bad: { id: "broken", questions: [], answers: [] },
      empty: null,
    },
    studyHistory: [null, "wrong", { answers: [] }],
  });
  const raw = data.get("mathfoundry_data");
  assert.deepEqual(getStudySessions(), {});
  assert.deepEqual(getStudyHistory(), []);
  assert.throws(() =>
    commitStudySession("math/arithmetic:practice", {
      id: "broken",
      questions: [],
      answers: [],
    }),
  );
  assert.equal(data.get("mathfoundry_data"), raw);
  data.set(
    "mathfoundry_data",
    JSON.stringify({ studySessions: [], studyHistory: {} }),
  );
  assert.deepEqual(getStudySessions(), {});
  assert.deepEqual(getStudyHistory(), []);
});

test("only answered study work updates the streak; idempotent saves keep the same count", () => {
  fixture();
  let session = createStudySession(getMathUnit("arithmetic"), "practice", 3);
  commitStudySession("math/arithmetic:practice", session);
  assert.equal(getStreak().current, 0);
  session = submitStudyAnswer(session, String(session.questions[0].answer));
  commitStudySession("math/arithmetic:practice", session);
  commitStudySession("math/arithmetic:practice", session);
  assert.equal(getStreak().current, 1);
  assert.equal(getStudySession("math/arithmetic:practice").answers.length, 1);
});

test("settings and study tools receive the same store notification without redundant state copies", () => {
  fixture();
  const revision = getStoreRevision();
  let updates = 0;
  const unsubscribe = subscribeStore(() => updates++);
  setSettings({ theme: "forest" });
  assert.equal(updates, 1);
  assert.equal(getStoreRevision(), revision + 1);
  assert.equal(
    themePreferences(
      JSON.parse(localStorage.getItem("mathfoundry_data")).settings,
    ).theme,
    "forest",
  );
  unsubscribe();
  setSettings({ headingStyle: "serif" });
  assert.equal(updates, 1);
});

test("all themes and preview controls resolve together with validated defaults", () => {
  for (const theme of ["light", "dark", "forest"])
    assert.equal(themePreferences({ theme }).theme, theme);
  assert.deepEqual(
    themePreferences(
      { theme: "forest", headingStyle: "sans" },
      "?theme=dark&heading=serif&compact=true",
    ),
    { theme: "dark", headingStyle: "serif", compactSidebar: true },
  );
  assert.deepEqual(
    themePreferences({ theme: "unknown", headingStyle: "unknown" }),
    { theme: "light", headingStyle: "sans", compactSidebar: false },
  );
});

test("both engineering problems have visuals whose quantities agree with their answers", () => {
  for (let seed = 0; seed < 50; seed++) {
    const session = createStudySession(
      getMathUnit("addition"),
      "application",
      seed,
    );
    const visual = session.questions[0].visual;
    assert.equal(visual.kind, "fraction-product");
    assert.equal(visual.a, 1);
    assert.equal(visual.d, 2);
    assert.equal(session.questions[0].steps.length, 2);
    assert(session.questions[1].visual);
  }
});

test("cloud restore rejects invalid payloads, backs up local work and keeps the local key/provider pair", async () => {
  const data = fixture({
    learningAttempts: [{ id: "local" }],
    settings: {
      aiApiKey: "local-test-key",
      aiProvider: "openai",
      theme: "forest",
    },
  });
  const oldRaw = data.get("mathfoundry_data");
  const oldFetch = global.fetch;
  const imported = {
    learningAttempts: [{ id: "remote" }],
    settings: {
      aiApiKey: "remote-test-key",
      aiProvider: "gemini",
      theme: "dark",
    },
  };
  let content = "[]";
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ files: { "mathfoundry_data.json": { content } } }),
  });
  let notifications = 0;
  const unsubscribe = subscribeStore(() => notifications++);
  try {
    await assert.rejects(pullFromGist("test-token", "test-gist"));
    assert.equal(data.get("mathfoundry_data"), oldRaw);
    content = JSON.stringify({ studySessions: [] });
    await assert.rejects(pullFromGist("test-token", "test-gist"));
    assert.equal(data.get("mathfoundry_data"), oldRaw);
    content = JSON.stringify(imported);
    await pullFromGist("test-token", "test-gist");
    const restored = JSON.parse(data.get("mathfoundry_data"));
    assert.equal(restored.settings.aiApiKey, "local-test-key");
    assert.equal(restored.settings.aiProvider, "openai");
    assert.equal(restored.learningAttempts[0].id, "remote");
    assert.equal(data.get("mathfoundry_data_before_sync"), oldRaw);
    assert.equal(notifications, 1);
  } finally {
    global.fetch = oldFetch;
    unsubscribe();
  }
});

test("clearing the backup ID creates a new snapshot rather than updating a remembered Gist", async () => {
  fixture({ settings: { aiApiKey: "private-test-key", theme: "forest" } });
  saveSyncConfig({ token: "test-token", gistId: "old-gist", autoSync: false });
  const oldFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.github.com/gists");
    assert.equal(options.method, "POST");
    const body = JSON.parse(options.body);
    assert.equal(
      JSON.parse(body.files["mathfoundry_data.json"].content).settings.aiApiKey,
      undefined,
    );
    return { ok: true, json: async () => ({ id: "new-gist" }) };
  };
  try {
    assert.equal((await pushToGist("test-token", "")).gistId, "new-gist");
  } finally {
    global.fetch = oldFetch;
  }
});

test("resetting study data disables automatic cloud saves so an empty reset is not uploaded", () => {
  fixture();
  saveSyncConfig({ autoSync: true, token: "test-token", gistId: "test-gist" });
  clearAllData();
  assert.equal(getSyncConfig().autoSync, false);
  assert.equal(localStorage.getItem("mathfoundry_data"), null);
});
