/**
 * src/utils/githubSync.js
 *
 * Background GitHub Gist Auto-Sync Engine
 * Provides serverless, private, zero-backend cross-device progress synchronization
 * via personal GitHub Access Tokens.
 */

const SYNC_CONFIG_KEY = 'mathfoundry_sync_config';
let syncTimeout = null;

export function getSyncConfig() {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    return raw ? JSON.parse(raw) : { token: '', gistId: '', lastSynced: null, autoSync: false, status: 'idle' };
  } catch {
    return { token: '', gistId: '', lastSynced: null, autoSync: false, status: 'idle' };
  }
}

export function saveSyncConfig(config) {
  try {
    const current = getSyncConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

/**
 * Pushes local learning data to a private GitHub Gist.
 */
export async function pushToGist(tokenOverride = null, gistIdOverride = null) {
  const config = getSyncConfig();
  const token = tokenOverride || config.token;
  const gistId = gistIdOverride || config.gistId;

  if (!token) {
    throw new Error('No GitHub token provided.');
  }

  const rawData = localStorage.getItem('mathfoundry_data') || '{}';
  const payload = {
    description: 'MathFoundry Private Progress Backup',
    public: false,
    files: {
      'mathfoundry_data.json': {
        content: rawData,
      },
    },
  };

  const headers = {
    'Authorization': `Bearer ${token.trim()}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  let response;
  if (gistId) {
    // Update existing Gist
    response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
  } else {
    // Create new private Gist
    response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `GitHub sync failed with status ${response.status}`);
  }

  const result = await response.json();
  const newGistId = result.id;
  const now = new Date().toISOString();

  saveSyncConfig({
    token,
    gistId: newGistId,
    lastSynced: now,
    status: 'synced',
  });

  return { gistId: newGistId, lastSynced: now };
}

/**
 * Pulls remote progress from GitHub Gist and merges into local storage.
 */
export async function pullFromGist(tokenOverride = null, gistIdOverride = null) {
  const config = getSyncConfig();
  const token = tokenOverride || config.token;
  const gistId = gistIdOverride || config.gistId;

  if (!token || !gistId) {
    throw new Error('GitHub token and Gist ID are required to pull progress.');
  }

  const headers = {
    'Authorization': `Bearer ${token.trim()}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Gist: ${response.status}`);
  }

  const result = await response.json();
  const file = result.files?.['mathfoundry_data.json'];
  if (!file || !file.content) {
    throw new Error('No mathfoundry_data.json found in Gist.');
  }

  // Parse and validate imported payload
  const importedData = JSON.parse(file.content);
  if (typeof importedData !== 'object' || !importedData) {
    throw new Error('Corrupted or invalid data format in Gist.');
  }

  // Backup current state before overwriting
  const currentRaw = localStorage.getItem('mathfoundry_data');
  if (currentRaw) {
    localStorage.setItem('mathfoundry_data_before_sync', currentRaw);
  }

  // Apply imported state
  localStorage.setItem('mathfoundry_data', JSON.stringify({ ...importedData, schemaVersion: 2 }));

  const now = new Date().toISOString();
  saveSyncConfig({
    lastSynced: now,
    status: 'synced',
  });

  return { success: true, lastSynced: now };
}

/**
 * Debounced background push triggered automatically after completing lessons/practice.
 */
export function triggerBackgroundAutoSync() {
  const config = getSyncConfig();
  if (!config.autoSync || !config.token) return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      await pushToGist();
      console.log('[MathFoundry] Background auto-sync complete.');
    } catch (e) {
      console.warn('[MathFoundry] Background auto-sync notice:', e.message);
    }
  }, 2500); // 2.5 second debounce
}
