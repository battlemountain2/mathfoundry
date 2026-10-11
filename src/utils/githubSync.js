/**
 * src/utils/githubSync.js
 *
 * GitHub Gist snapshot backups. Restores replace local history; they do not merge it.
 */

import { notifyStore } from "./storeEvents.js";

const SYNC_CONFIG_KEY = "mathfoundry_sync_config";
let syncTimeout = null;
let activeOperation = null;

async function runCloudOperation(kind, action) {
  if (activeOperation)
    throw new Error(
      "A cloud backup operation is already running. Wait for it to finish before saving or restoring another snapshot.",
    );
  activeOperation = kind;
  cancelBackgroundAutoSync();
  try {
    return await action();
  } finally {
    activeOperation = null;
  }
}

export function cancelBackgroundAutoSync() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = null;
}

export function getSyncConfig() {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && typeof data === "object" && !Array.isArray(data)
      ? data
      : {
          token: "",
          gistId: "",
          lastSynced: null,
          autoSync: false,
          status: "idle",
        };
  } catch {
    return {
      token: "",
      gistId: "",
      lastSynced: null,
      autoSync: false,
      status: "idle",
    };
  }
}

export function saveSyncConfig(config) {
  try {
    const current = getSyncConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    throw new Error("Cloud settings could not be saved in this browser.");
  }
}

/**
 * Pushes local learning data to a private GitHub Gist.
 */
export async function pushToGist(tokenOverride = null, gistIdOverride = null) {
  return runCloudOperation("push", () =>
    pushSnapshot(tokenOverride, gistIdOverride),
  );
}

async function pushSnapshot(tokenOverride, gistIdOverride) {
  const config = getSyncConfig();
  const token = tokenOverride ?? config.token;
  const gistId = gistIdOverride ?? config.gistId;

  if (!token) {
    throw new Error("No GitHub token provided.");
  }

  const backupData = JSON.parse(
    localStorage.getItem("mathfoundry_data") || "{}",
  );
  if (backupData.settings) delete backupData.settings.aiApiKey;
  const rawData = JSON.stringify(backupData);
  const payload = {
    description: "Athena Study Progress Backup",
    public: false,
    files: {
      "mathfoundry_data.json": {
        content: rawData,
      },
    },
  };

  const headers = {
    Authorization: `Bearer ${token.trim()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  let response;
  if (gistId) {
    // Update existing Gist
    response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });
  } else {
    // Create new private Gist
    response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.message || `GitHub sync failed with status ${response.status}`,
    );
  }

  const result = await response.json();
  const newGistId = result.id;
  const now = new Date().toISOString();

  saveSyncConfig({
    token,
    gistId: newGistId,
    lastSynced: now,
    status: "synced",
  });

  return { gistId: newGistId, lastSynced: now };
}

/**
 * Restores a remote snapshot. Keeps a recovery copy and the device's tutor key.
 */
export async function pullFromGist(
  tokenOverride = null,
  gistIdOverride = null,
) {
  return runCloudOperation("restore", () =>
    restoreSnapshot(tokenOverride, gistIdOverride),
  );
}

async function restoreSnapshot(tokenOverride, gistIdOverride) {
  const initialRaw = localStorage.getItem("mathfoundry_data");
  const config = getSyncConfig();
  const token = tokenOverride ?? config.token;
  const gistId = gistIdOverride ?? config.gistId;

  if (!token || !gistId) {
    throw new Error("GitHub token and Gist ID are required to pull progress.");
  }
  // A pending automatic push must not race a user-initiated restore.
  cancelBackgroundAutoSync();

  const headers = {
    Authorization: `Bearer ${token.trim()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Gist: ${response.status}`);
  }

  const result = await response.json();
  const file = result.files?.["mathfoundry_data.json"];
  if (!file || !file.content) {
    throw new Error("No mathfoundry_data.json found in Gist.");
  }

  // Parse and validate imported payload
  const importedData = JSON.parse(file.content);
  if (
    typeof importedData !== "object" ||
    !importedData ||
    Array.isArray(importedData)
  ) {
    throw new Error("Corrupted or invalid data format in Gist.");
  }
  const arrayFields = [
    "learningAttempts",
    "practiceHistory",
    "reviewHistory",
    "studyHistory",
    "recognitionAttempts",
    "repairDrafts",
  ];
  const recordFields = [
    "settings",
    "studySessions",
    "completedRepairs",
    "lessonProgress",
    "unitQuizResults",
    "progress",
  ];
  if (
    arrayFields.some(
      (key) =>
        importedData[key] !== undefined && !Array.isArray(importedData[key]),
    ) ||
    recordFields.some(
      (key) =>
        importedData[key] !== undefined &&
        (!importedData[key] ||
          typeof importedData[key] !== "object" ||
          Array.isArray(importedData[key])),
    )
  ) {
    throw new Error(
      "This cloud backup has invalid study data. Your local work was not replaced.",
    );
  }

  // Backup current state before overwriting
  const currentRaw = localStorage.getItem("mathfoundry_data");
  if (currentRaw !== initialRaw)
    throw new Error(
      "Your local work changed while this cloud backup was loading. Nothing was replaced. Download your latest work before trying the restore again.",
    );
  let localSettings;
  try {
    localSettings = JSON.parse(currentRaw || "{}").settings;
  } catch {
    /* Recovery copy still retains unreadable data. */
  }
  if (currentRaw) {
    localStorage.setItem("mathfoundry_data_before_sync", currentRaw);
  }

  // Apply imported state
  const settings = { ...importedData.settings };
  delete settings.aiApiKey;
  if (localSettings?.aiApiKey) {
    settings.aiApiKey = localSettings.aiApiKey;
    settings.aiProvider = localSettings.aiProvider;
  }
  localStorage.setItem(
    "mathfoundry_data",
    JSON.stringify({ ...importedData, settings, schemaVersion: 2 }),
  );
  notifyStore();

  const now = new Date().toISOString();
  saveSyncConfig({
    lastSynced: now,
    status: "synced",
  });

  return { success: true, lastSynced: now };
}

/**
 * Debounced background push triggered automatically after completing lessons/practice.
 */
export function triggerBackgroundAutoSync() {
  const config = getSyncConfig();
  if (!config.autoSync || !config.token || activeOperation === "restore")
    return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    syncTimeout = null;
    // Wait for a slow save, then upload the latest snapshot rather than racing it.
    if (activeOperation) {
      triggerBackgroundAutoSync();
      return;
    }
    try {
      await pushToGist();
      console.log("[MathFoundry] Background auto-sync complete.");
    } catch (e) {
      console.warn("[MathFoundry] Background auto-sync notice:", e.message);
    }
  }, 2500); // 2.5 second debounce
}
