import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { clearAllData, getSettings, setSettings, exportLearningData, exportRawData } from '../utils/storage';
import { getSyncConfig, saveSyncConfig, pushToGist, pullFromGist } from '../utils/githubSync';
import { clearTutorChatHistory } from '../utils/aiTutor';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ThemeComponentSheet from '../components/Study/ThemeComponentSheet';

function download(data, name) {
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Settings() {
  const {
    theme,
    setTheme,
    headingStyle,
    setHeadingStyle,
    compactSidebar,
    setCompactSidebar,
    error: themeError,
  } = useTheme();

  const [showComponentSheet, setShowComponentSheet] = useState(() => {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('sheet') === 'true';
  });
  const [showClearModal, setShowClearModal] = useState(false);

  // AI Settings state
  const initialSettings = getSettings();
  const [apiKey, setApiKey] = useState(initialSettings.aiApiKey || '');
  const [provider, setProvider] = useState(initialSettings.aiProvider || 'gemini');
  const [saveError, setSaveError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // GitHub Gist Sync State
  const initialSync = getSyncConfig();
  const [syncToken, setSyncToken] = useState(initialSync.token || '');
  const [gistId, setGistId] = useState(initialSync.gistId || '');
  const [autoSync, setAutoSync] = useState(initialSync.autoSync || false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(
    initialSync.lastSynced
      ? `Synced ${new Date(initialSync.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : ''
  );

  const handlePushGist = async () => {
    setIsSyncing(true);
    setSaveError('');
    try {
      saveSyncConfig({ token: syncToken.trim(), gistId: gistId.trim(), autoSync });
      const res = await pushToGist(syncToken.trim(), gistId.trim());
      setGistId(res.gistId);
      setSyncStatus(`✓ Cloud Backup Saved`);
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullGist = async () => {
    setIsSyncing(true);
    setSaveError('');
    try {
      saveSyncConfig({ token: syncToken.trim(), gistId: gistId.trim(), autoSync });
      await pullFromGist(syncToken.trim(), gistId.trim());
      setSyncStatus(`✓ Cloud State Loaded`);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveAi = (e) => {
    e.preventDefault();
    try {
      setSettings({ aiApiKey: apiKey.trim(), aiProvider: provider });
      setSaveError('');
    } catch (error) {
      setSaveError(error.message);
      return;
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearData = () => {
    clearAllData();
    clearTutorChatHistory();
    setShowClearModal(false);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Page Title & Intro */}
      <div>
        <p className="eyebrow">Personalization & System</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
          Settings & backup
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)] mt-1">
          Choose your study theme, manage cloud sync and backups, and configure optional AI assistance.
        </p>
      </div>

      {(saveError || themeError) && (
        <p role="alert" className="study-notice">
          {saveError || themeError}
        </p>
      )}

      {/* Section 1: Display & Appearance */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--line)]">
          <h2 className="text-base font-bold text-[var(--ink)]">
            🎨 Display & Appearance
          </h2>
        </div>

        {/* Theme Palette */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
          <div>
            <div className="font-semibold text-xs text-[var(--ink)]">Color Palette</div>
            <div className="text-[11px] text-[var(--ink-2)]">
              Choose Light Paper, Deep Pine Forest, or Original Dark palette
            </div>
          </div>
          <select
            aria-label="Color theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] text-xs font-medium cursor-pointer focus:outline-none focus:border-[var(--accent)] shrink-0"
          >
            <option value="light">Light paper</option>
            <option value="forest">Deep pine forest</option>
            <option value="dark">Original dark</option>
          </select>
        </div>

        {/* Heading Typography Option */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-t border-[var(--line)]">
          <div>
            <div className="font-semibold text-xs text-[var(--ink)]">Heading Typography</div>
            <div className="text-[11px] text-[var(--ink-2)]">
              Choose editorial serif or modern sans-serif headings
            </div>
          </div>
          <select
            aria-label="Heading typography"
            value={headingStyle}
            onChange={(e) => setHeadingStyle(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] text-xs font-medium cursor-pointer focus:outline-none focus:border-[var(--accent)] shrink-0"
          >
            <option value="serif">Editorial Serif (Georgia)</option>
            <option value="sans">Modern Sans (Inter)</option>
          </select>
        </div>

        {/* Zen Compact Mode Option */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-t border-[var(--line)]">
          <div>
            <div className="font-semibold text-xs text-[var(--ink)]">Zen Workspace Layout</div>
            <div className="text-[11px] text-[var(--ink-2)]">
              Choose standard persistent sidebar or compact focus canvas
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCompactSidebar(!compactSidebar)}
            className={`h-9 px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              compactSidebar
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]'
            }`}
          >
            <span>{compactSidebar ? '◨ Focus Mode (Active)' : '◫ Standard View'}</span>
          </button>
        </div>

        {/* Monospace for Numbers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-t border-[var(--line)]">
          <div>
            <div className="font-semibold text-xs text-[var(--ink)]">Numeric & Aligned Notation</div>
            <div className="text-[11px] text-[var(--ink-2)]">High-legibility font for calculations and answers</div>
          </div>
          <span className="h-8 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] text-xs font-mono inline-flex items-center self-start sm:self-auto shrink-0">
            JetBrains Mono
          </span>
        </div>

        {/* Design System Verification Sheet Toggle */}
        <div className="pt-2 border-t border-[var(--line)]">
          <button
            type="button"
            className="w-full h-9 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-medium transition-colors cursor-pointer"
            onClick={() => setShowComponentSheet(!showComponentSheet)}
          >
            {showComponentSheet ? '▲ Hide Design System & Component Sheet' : '▼ Inspect Theme Component Sheet'}
          </button>
        </div>
      </Card>

      {/* Component Sheet Viewer */}
      {showComponentSheet && <ThemeComponentSheet currentTheme={theme} />}

      {/* Section 2: Learning Data & Cloud Sync */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <h2 className="text-base font-bold text-[var(--ink)]">
            💾 Learning Data & Sync
          </h2>
          {syncStatus && (
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)]">
              {syncStatus}
            </span>
          )}
        </div>

        {/* Local Storage & Data Export */}
        <div className="space-y-2 py-1">
          <div className="font-semibold text-xs text-[var(--ink)]">Local Browser Data Backup</div>
          <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
            Progress is saved in your browser's localStorage. Download a backup file to safeguard your study history or transfer to another device.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => download(exportLearningData(), 'mathfoundry-learning-backup.json')}
            >
              Download Learning Backup (JSON)
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => download(exportRawData(), 'mathfoundry-raw-recovery.json')}
            >
              Download Raw Recovery Data
            </Button>
          </div>
          <p className="text-[11px] text-[var(--ink-2)] opacity-80 pt-1">
            Raw recovery data can contain your locally saved API key. Keep that file private.
          </p>
        </div>

        {/* GitHub Gist Cross-Device Auto-Sync */}
        <div className="space-y-3 pt-4 border-t border-[var(--line)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[var(--ink)]">Cross-Device Sync (GitHub Gist)</div>
              <div className="text-[11px] text-[var(--ink-2)]">
                Sync your learning progress across your laptop and desktop automatically using a private GitHub Gist. Zero server required.
              </div>
            </div>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[var(--accent)] hover:underline shrink-0"
            >
              Create token on GitHub ↗
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                GitHub Personal Access Token (classic or fine-grained with Gist permission)
              </label>
              <input
                type="password"
                value={syncToken}
                onChange={(e) => setSyncToken(e.target.value)}
                placeholder="ghp_... or github_pat_..."
                className="w-full max-w-lg h-9 px-3 text-xs rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Gist ID (auto-created on first push; paste on another computer to pull)
              </label>
              <input
                type="text"
                value={gistId}
                onChange={(e) => setGistId(e.target.value)}
                placeholder="e.g. 7f8a9b2c..."
                className="w-full max-w-lg h-9 px-3 text-xs rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoSyncToggle"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <label htmlFor="autoSyncToggle" className="text-xs text-[var(--ink-2)] font-medium cursor-pointer">
                Enable background auto-sync (silently updates your private Gist after each lesson & practice)
              </label>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handlePushGist}
                disabled={isSyncing || !syncToken.trim()}
              >
                {isSyncing ? 'Syncing…' : 'Push to Gist (Save Cloud Backup)'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePullGist}
                disabled={isSyncing || !syncToken.trim() || !gistId.trim()}
              >
                Pull from Gist (Load on this Device)
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: Optional AI Study Tutor */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">
              ⚡ Optional AI Study Tutor
            </h2>
            <p className="text-xs text-[var(--ink-2)] mt-0.5">
              Connect your Google Gemini or OpenAI API key to enable Ada, your personal Socratic copilot.
            </p>
          </div>
          {savedSuccess && (
            <span className="text-xs text-[var(--good)] font-bold animate-fade-in shrink-0">
              ✓ Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveAi} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              Select Provider
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  provider === 'gemini'
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-semibold shadow-xs'
                    : 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:text-[var(--ink)]'
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  provider === 'openai'
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-semibold shadow-xs'
                    : 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:text-[var(--ink)]'
                }`}
              >
                OpenAI (ChatGPT / GPT-4o)
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 max-w-lg">
              <label className="text-xs font-semibold text-[var(--ink)]">
                {provider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
              </label>
              {provider === 'gemini' && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Get API key at Google AI Studio ↗
                </a>
              )}
            </div>
            <input
              aria-label="Provider API key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              className="w-full max-w-lg h-9 px-3 text-xs rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
            />
            <p className="text-[11px] text-[var(--ink-2)] mt-1.5">
              Stored exclusively in your browser's <code className="text-[var(--accent)] font-mono">localStorage</code>. Never proxied through third-party servers.
            </p>
          </div>

          <div className="pt-1">
            <Button size="sm" variant="primary" type="submit">
              Save AI Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Section 4: Memory & Reset (Danger Zone) */}
      <Card className="p-6 space-y-4" style={{ borderColor: 'var(--heat)' }}>
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--line)]">
          <h2 className="text-base font-bold text-[var(--heat)]">
            ⚠️ Memory & Reset
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div>
            <div className="font-semibold text-xs text-[var(--ink)]">Clear All Stored Progress</div>
            <div className="text-[11px] text-[var(--ink-2)]">
              Permanently purges completed modules, streaks, diagnostic scores, and chat logs from localStorage.
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setShowClearModal(true)}>
            Reset Everything
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="Reset All Data?">
        <p className="text-xs text-[var(--ink-2)] mb-6 leading-relaxed">
          This will wipe your diagnostic evaluation, module progress, achievement badges, and tutor chat history. This action is irreversible.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleClearData}>
            Confirm Hard Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
}
