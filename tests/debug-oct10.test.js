import test from "node:test";
import assert from "node:assert/strict";
import { getMathUnit } from "../src/data/courses/mathFoundations.js";
import {
  createStudySession,
  submitStudyAnswer,
  advanceStudySession,
} from "../src/utils/studySession.js";
import { createRecallSession, submitRecall } from "../src/utils/ruleMatch.js";
import { numericValue, equivalentAnswer } from "../src/utils/answerChecking.js";
import {
  getRecallSession,
  saveRecallSession,
  getStudySession,
  commitStudySession,
} from "../src/utils/storage.js";
import {
  pushToGist,
  pullFromGist,
  saveSyncConfig,
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

test("broken recall sessions are excluded without deleting their recovery data", () => {
  for (const recallSession of [
    null,
    {},
    { questions: [], answers: [] },
    { ...createRecallSession("addition", 4), index: 99 },
    {
      ...createRecallSession("addition", 4),
      questions: [{ question: "Broken", options: null }],
    },
  ]) {
    const data = fixture({ recallSession });
    const raw = data.get("mathfoundry_data");
    assert.equal(getRecallSession(), null);
    assert.equal(data.get("mathfoundry_data"), raw);
  }
  fixture();
  const session = createRecallSession("addition", 4);
  saveRecallSession(session);
  assert.deepEqual(getRecallSession(), session);
  const before = localStorage.getItem("mathfoundry_data");
  assert.throws(() => saveRecallSession({ ...session, answers: null }));
  assert.equal(localStorage.getItem("mathfoundry_data"), before);
});

test("a stale study tab cannot erase newer answers, advance, replace, or resurrect a session", () => {
  const data = fixture();
  const key = "math/arithmetic:practice";
  const original = createStudySession(getMathUnit("arithmetic"), "practice", 3);
  commitStudySession(key, original, { expectedSession: null });
  const newer = advanceStudySession(
    submitStudyAnswer(original, String(original.questions[0].answer)),
  );
  commitStudySession(key, newer, { expectedSession: original });
  const before = data.get("mathfoundry_data");
  for (const stale of [
    { ...original, input: "0" },
    createStudySession(getMathUnit("arithmetic")),
    submitStudyAnswer(original, "1"),
  ]) {
    assert.throws(
      () => commitStudySession(key, stale, { expectedSession: original }),
      /another tab|changed/i,
    );
    assert.equal(data.get("mathfoundry_data"), before);
  }
  assert.equal(getStudySession(key).index, 1);
  data.set("mathfoundry_data", "{}");
  assert.throws(() =>
    commitStudySession(key, newer, { expectedSession: newer }),
  );
  assert.equal(data.get("mathfoundry_data"), "{}");
});

test("recall tabs protect newer recognition attempts from stale writes", () => {
  const data = fixture();
  const original = createRecallSession("addition", 4);
  saveRecallSession(original, { expectedSession: null });
  const answered = submitRecall({
    ...original,
    input: String(original.questions[0].answer),
  });
  saveRecallSession(answered, { expectedSession: original });
  const before = data.get("mathfoundry_data");
  assert.throws(() =>
    saveRecallSession(
      { ...original, input: "1" },
      { expectedSession: original },
    ),
  );
  assert.equal(data.get("mathfoundry_data"), before);
});

test("starting a new block tolerates damaged archived entries and keeps their recovery records", () => {
  const key = "math/arithmetic:practice";
  const previous = createStudySession(getMathUnit("arithmetic"), "practice", 3);
  const data = fixture({
    studySessions: { [key]: previous },
    studyHistory: [null, "unreadable"],
  });
  const next = createStudySession(getMathUnit("arithmetic"), "practice", 9);
  commitStudySession(key, next, { expectedSession: previous });
  const store = JSON.parse(data.get("mathfoundry_data"));
  assert.deepEqual(store.studyHistory.slice(0, 2), [null, "unreadable"]);
  assert.deepEqual(store.studyHistory.at(-1), previous);
  assert.equal(getStudySession(key).id, next.id);
});

test("invalid numeric or choice input never becomes a graded learning attempt", () => {
  const huge = "9".repeat(400);
  assert.equal(numericValue(huge), null);
  assert.equal(numericValue(`${huge}/1`), null);
  assert.equal(numericValue(`1/${huge}`), null);
  assert.equal(equivalentAnswer(huge, huge), false);
  const original = createStudySession(getMathUnit("arithmetic"), "practice", 3);
  for (const input of ["", " ", "-1", "99", "0.0", "0x0"])
    assert.equal(submitStudyAnswer(original, input), original);
  const numeric = { ...original, index: 1 };
  for (const input of ["", " ", "2/0", huge, "2 + 2"])
    assert.equal(submitStudyAnswer(numeric, input), numeric);
  assert.equal(
    submitStudyAnswer(numeric, "", "", true).answers.at(-1).skipped,
    true,
  );
  const recall = createRecallSession("addition", 4);
  for (const input of [" ", "-1", "99", "0.0"])
    assert.equal(submitRecall({ ...recall, input }).answers.length, 0);
});

test("a slow cloud restore cannot overwrite work saved while its request was pending", async () => {
  const data = fixture({ learningAttempts: [{ id: "before" }] });
  const oldFetch = global.fetch;
  let finishRequest;
  global.fetch = () =>
    new Promise((resolve) => {
      finishRequest = resolve;
    });
  try {
    const restoring = pullFromGist("test-token", "test-gist");
    const edited = JSON.stringify({
      learningAttempts: [{ id: "before" }, { id: "new-work" }],
    });
    data.set("mathfoundry_data", edited);
    finishRequest({
      ok: true,
      json: async () => ({
        files: {
          "mathfoundry_data.json": {
            content: JSON.stringify({ learningAttempts: [{ id: "remote" }] }),
          },
        },
      }),
    });
    await assert.rejects(restoring, /changed|newer|saved/i);
    assert.equal(data.get("mathfoundry_data"), edited);
    assert.equal(data.has("mathfoundry_data_before_sync"), false);
  } finally {
    global.fetch = oldFetch;
  }
});

test("cloud writes and restores cannot run over one another, and errors release the operation guard", async () => {
  fixture();
  saveSyncConfig({ token: "test-token", gistId: "test-gist", autoSync: false });
  const oldFetch = global.fetch;
  let finishRequest,
    calls = 0;
  global.fetch = () => {
    calls++;
    return new Promise((resolve) => {
      finishRequest = resolve;
    });
  };
  try {
    const pushing = pushToGist();
    await assert.rejects(pullFromGist(), /already|wait|running/i);
    await assert.rejects(pushToGist(), /already|wait|running/i);
    assert.equal(calls, 1);
    finishRequest({ ok: false, status: 503, json: async () => ({}) });
    await assert.rejects(pushing, /503/);
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ id: "test-gist" }),
    });
    assert.equal((await pushToGist()).gistId, "test-gist");
  } finally {
    global.fetch = oldFetch;
  }
});
