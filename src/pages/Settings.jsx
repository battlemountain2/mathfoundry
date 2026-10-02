import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { clearAllData, getSettings, setSettings } from '../utils/storage';
import { clearTutorChatHistory } from '../utils/aiTutor';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [showClearModal, setShowClearModal] = useState(false);
  
  // AI Settings state
  const initialSettings = getSettings();
  const [apiKey, setApiKey] = useState(initialSettings.aiApiKey || '');
  const [provider, setProvider] = useState(initialSettings.aiProvider || 'gemini');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAi = (e) => {
    e.preventDefault();
    setSettings({ aiApiKey: apiKey.trim(), aiProvider: provider });
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
    <div className="animate-fade-in max-w-3xl mx-auto px-4 py-6 space-y-6 font-mono">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Configuration & Telemetry
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage system preferences, AI copilot connectivity, and data persistence.
        </p>
      </div>

      {/* AI Copilot Setup Card */}
      <Card className="border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-zinc-900/90 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">⚡</span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                AI Engineering Math Tutor
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Connect your Google Gemini or OpenAI API key to enable Ada, your personal Socratic copilot.
            </p>
          </div>
          {savedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in">
              ✓ Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveAi} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Select Provider
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  provider === 'gemini'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                Google Gemini (Recommended & Free)
              </button>
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  provider === 'openai'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                OpenAI (ChatGPT / GPT-4o)
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {provider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
              </label>
              {provider === 'gemini' && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Get free key at Google AI Studio ↗
                </a>
              )}
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              className="w-full max-w-lg px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">
              Stored exclusively in your browser's <code className="text-indigo-500">localStorage</code>. Never proxied through third-party servers.
            </p>
          </div>

          <div className="pt-1">
            <Button size="sm" variant="primary" type="submit">
              Save AI Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Appearance Card */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          Display & Appearance
        </h2>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Color Palette</div>
            <div className="text-[11px] text-zinc-500">Switch between dark technical IDE and clean light blueprint mode</div>
          </div>
          <button 
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {theme === 'dark' ? '☀ Switch to Light Mode' : '☾ Switch to Dark Mode'}
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Typography</div>
            <div className="text-[11px] text-zinc-500">Engineering font family</div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            JetBrains Mono
          </span>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <h2 className="text-base font-bold text-rose-600 dark:text-rose-400 border-b border-rose-100 dark:border-rose-900/30 pb-3">
          Memory & Reset
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div>
            <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Clear All Stored Progress</div>
            <div className="text-[11px] text-zinc-500">
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
        <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-6 font-mono leading-relaxed">
          This will wipe your diagnostic evaluation, module progress, achievement badges, and tutor chat history. This action is irreversible.
        </p>
        <div className="flex justify-end gap-3 font-mono">
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
