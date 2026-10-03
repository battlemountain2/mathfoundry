import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { clearAllData, getSettings, setSettings, exportLearningData, exportRawData } from '../utils/storage';
import { clearTutorChatHistory } from '../utils/aiTutor';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ThemeComponentSheet from '../components/Study/ThemeComponentSheet';

function download(data,name) {
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url);
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
  const [saveError,setSaveError]=useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAi = (e) => {
    e.preventDefault();
    try { setSettings({ aiApiKey: apiKey.trim(), aiProvider: provider });setSaveError(''); }
    catch(error) {setSaveError(error.message);return;}
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--ink)' }}>
          Settings & backup
        </h1>
        <p className="text-xs study-muted mt-1">
          Choose your study theme, back up progress, and configure optional AI support.
        </p>
      </div>

      {(saveError || themeError) && <p role="alert" className="study-notice">{saveError || themeError}</p>}
      {/* AI Copilot Setup Card */}
      <Card className="p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
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
                Google Gemini
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
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold border-b border-[var(--line)] pb-3" style={{ color: 'var(--ink)' }}>
          Display & Appearance
        </h2>
        
        {/* Theme Palette */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-semibold text-xs" style={{ color: 'var(--ink)' }}>Color Palette</div>
            <div className="text-[11px] study-muted">Choose light paper, deep pine forest, or original dark palette</div>
          </div>
          <select aria-label="Color theme" value={theme} onChange={e=>setTheme(e.target.value)} className="study-answer" style={{ width: 'auto', margin: 0 }}>
            <option value="light">Light paper</option>
            <option value="forest">Deep pine forest</option>
            <option value="dark">Original dark</option>
          </select>
        </div>

        {/* Heading Typography Option */}
        <div className="flex items-center justify-between py-2 border-t border-[var(--line)]">
          <div>
            <div className="font-semibold text-xs" style={{ color: 'var(--ink)' }}>Heading Typography</div>
            <div className="text-[11px] study-muted">Choose editorial serif or modern sans-serif headings</div>
          </div>
          <select
            aria-label="Heading typography"
            value={headingStyle}
            onChange={(e) => setHeadingStyle(e.target.value)}
            className="study-answer"
            style={{ width: 'auto', margin: 0 }}
          >
            <option value="serif">Editorial Serif (Georgia)</option>
            <option value="sans">Modern Sans (Inter)</option>
          </select>
        </div>

        {/* Zen Compact Mode Option */}
        <div className="flex items-center justify-between py-2 border-t border-[var(--line)]">
          <div>
            <div className="font-semibold text-xs" style={{ color: 'var(--ink)' }}>Zen Workspace Layout</div>
            <div className="text-[11px] study-muted">Choose standard persistent sidebar or compact focus canvas</div>
          </div>
          <button
            type="button"
            onClick={() => setCompactSidebar(!compactSidebar)}
            className={`zen-compact-toggle ${compactSidebar ? 'active' : ''}`}
          >
            {compactSidebar ? '◨ Focus Mode (Active)' : '◫ Standard View'}
          </button>
        </div>

        {/* Monospace for Numbers */}
        <div className="flex items-center justify-between py-2 border-t border-[var(--line)]">
          <div>
            <div className="font-semibold text-xs" style={{ color: 'var(--ink)' }}>Numeric & Aligned Notation</div>
            <div className="text-[11px] study-muted">High-legibility font for calculations and answers</div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded border border-[var(--line)] font-mono" style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}>
            JetBrains Mono
          </span>
        </div>

        {/* Design System Verification Sheet Toggle */}
        <div className="pt-2 border-t border-[var(--line)]">
          <button
            type="button"
            className="study-button secondary"
            style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
            onClick={() => setShowComponentSheet(!showComponentSheet)}
          >
            {showComponentSheet ? '▲ Hide Design System & Component Sheet' : '▼ Inspect Theme Component Sheet'}
          </button>
        </div>
      </Card>

      {/* Component Sheet Viewer */}
      {showComponentSheet && (
        <ThemeComponentSheet currentTheme={theme} />
      )}

      <section className="study-card">
        <h2>Your learning data</h2><p>Progress is saved in this browser on this address. Download a backup before moving browsers or changing addresses. The learning backup excludes your API key.</p>
        <div className="study-actions"><button className="study-button" onClick={()=>download(exportLearningData(),'mathfoundry-learning-backup.json')}>Download learning backup</button><button className="study-button secondary" onClick={()=>download(exportRawData(),'mathfoundry-raw-recovery.json')}>Download raw recovery data</button></div>
        <p className="study-muted">Raw recovery data can contain your locally saved API key. Keep that file private. Import/restore tools are planned; these files preserve the data for recovery.</p>
      </section>
      {/* Danger Zone */}
      <Card className="p-6 space-y-4" style={{ borderColor: 'var(--heat)' }}>
        <h2 className="text-base font-bold pb-3 border-b border-[var(--line)]" style={{ color: 'var(--heat)' }}>
          Memory & Reset
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div>
            <div className="font-semibold text-xs" style={{ color: 'var(--ink)' }}>Clear All Stored Progress</div>
            <div className="text-[11px] study-muted">
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
