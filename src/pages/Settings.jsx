import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import {
  clearAllData,
  getSettings,
  setSettings,
  exportLearningData,
  exportRawData,
} from "../utils/storage";
import {
  getSyncConfig,
  saveSyncConfig,
  pushToGist,
  pullFromGist,
} from "../utils/githubSync";
import { clearTutorChatHistory } from "../utils/aiTutor";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import ThemeComponentSheet from "../components/Study/ThemeComponentSheet";

const themes = [
  { id: "light", name: "Paper", note: "Warm paper. Clear daylight." },
  { id: "dark", name: "Charcoal", note: "Original dark. Indigo accents." },
  { id: "forest", name: "Deep pine", note: "Forest shade. Warm cream." },
];

function download(data, name) {
  const url = URL.createObjectURL(
    new Blob([data], { type: "application/json" }),
  );
  const link = document.createElement("a");
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
  const [settings] = useState(getSettings);
  const [syncConfig] = useState(getSyncConfig);
  const [apiKey, setApiKey] = useState(settings.aiApiKey || "");
  const [provider, setProvider] = useState(settings.aiProvider || "gemini");
  const [syncToken, setSyncToken] = useState(syncConfig.token || "");
  const [gistId, setGistId] = useState(syncConfig.gistId || "");
  const [autoSync, setAutoSync] = useState(Boolean(syncConfig.autoSync));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const showComponentSheet =
    new URLSearchParams(window.location.search).get("sheet") === "true";

  function backup(raw = false) {
    try {
      download(
        raw ? exportRawData() : exportLearningData(),
        `athena-${raw ? "raw-data" : "study-backup"}-${new Date().toISOString().slice(0, 10)}.json`,
      );
      setNotice("Backup downloaded. Keep it somewhere you can find again.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function saveSync() {
    saveSyncConfig({
      token: syncToken.trim(),
      gistId: gistId.trim(),
      autoSync,
    });
  }

  async function sync(action) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (action === "push") {
        saveSync();
        const result = await pushToGist(syncToken.trim(), gistId.trim());
        setGistId(result.gistId);
        setNotice(
          "Cloud backup saved. Keep the backup ID to restore on another device.",
        );
      } else {
        await pullFromGist(syncToken.trim(), gistId.trim());
        saveSync();
        setNotice(
          "Cloud backup restored. Your previous local snapshot was kept as a recovery copy.",
        );
      }
      setConfirmation(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function saveTutor(event) {
    event.preventDefault();
    try {
      setSettings({ aiApiKey: apiKey.trim(), aiProvider: provider });
      setNotice("Tutor settings saved.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function reset() {
    try {
      clearAllData();
      clearTutorChatHistory();
      setConfirmation(null);
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="study-page athena-settings">
      <header className="athena-settings-heading">
        <p className="eyebrow">Make room for good work</p>
        <h1>Settings & backup</h1>
        <p className="study-intro">
          Shape your study space, keep your work, and choose optional tutoring.
        </p>
      </header>
      {(error || themeError) && (
        <p className="study-notice" role="alert">
          {error || themeError}
        </p>
      )}
      {notice && (
        <p className="settings-status" role="status">
          {notice}
        </p>
      )}

      <section
        className="settings-section"
        aria-labelledby="appearance-heading"
      >
        <p className="eyebrow">01 / Your surroundings</p>
        <h2 id="appearance-heading">Appearance</h2>
        <fieldset className="settings-theme-grid">
          <legend className="sr-only">Color theme</legend>
          {themes.map((item) => (
            <label
              key={item.id}
              className={`settings-theme ${theme === item.id ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="theme"
                value={item.id}
                checked={theme === item.id}
                onChange={() => setTheme(item.id)}
              />
              <span className={`settings-swatch ${item.id}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <strong>{item.name}</strong>
              <span>{item.note}</span>
            </label>
          ))}
        </fieldset>
        <div className="settings-row">
          <div>
            <label htmlFor="heading-style">Heading style</label>
            <p>JetBrains Mono stays on numbers and compact labels.</p>
          </div>
          <select
            id="heading-style"
            value={headingStyle}
            onChange={(event) => setHeadingStyle(event.target.value)}
          >
            <option value="sans">Modern sans</option>
            <option value="serif">Editorial serif</option>
          </select>
        </div>
        <div className="settings-row">
          <div>
            <strong>Sidebar</strong>
            <p>
              Keep the path nearby, or make more room for your paper and
              problem.
            </p>
          </div>
          <button
            className="study-button secondary"
            type="button"
            aria-pressed={compactSidebar}
            onClick={() => setCompactSidebar(!compactSidebar)}
          >
            {compactSidebar ? "Compact focus" : "Always visible"}
          </button>
        </div>
      </section>
      {showComponentSheet && <ThemeComponentSheet currentTheme={theme} />}

      <section className="settings-section" aria-labelledby="backup-heading">
        <p className="eyebrow">02 / Your work, kept</p>
        <h2 id="backup-heading">Progress & backup</h2>
        <p>
          Study sessions, mistakes, repairs, and your rulebook are saved in this
          browser. A download gives you a separate copy; it leaves out your
          tutor key.
        </p>
        <div className="study-actions">
          <Button onClick={() => backup()}>Download study backup</Button>
          <Button variant="secondary" onClick={() => backup(true)}>
            Download original saved data
          </Button>
        </div>
        <p className="study-muted">
          The original-data file is useful for recovery and can include your
          saved tutor key. Keep it private. File import is still in preparation.
        </p>
        <details className="settings-details">
          <summary>Optional cloud backup</summary>
          <p>
            Save a snapshot to a secret GitHub Gist, or restore it on another
            device. Restoring replaces this browser’s study history; it does not
            combine histories.
          </p>
          <div className="settings-form-grid">
            <label>
              GitHub token
              <input
                aria-label="GitHub token"
                type="password"
                autoComplete="off"
                value={syncToken}
                onChange={(event) => setSyncToken(event.target.value)}
                placeholder="Token with Gist access"
              />
            </label>
            <label>
              Cloud backup ID
              <input
                aria-label="Cloud backup ID"
                value={gistId}
                onChange={(event) => setGistId(event.target.value)}
                placeholder="Created when you first save"
              />
            </label>
          </div>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(event) => setAutoSync(event.target.checked)}
            />
            Save study changes to this cloud backup automatically
          </label>
          <div className="study-actions">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                try {
                  saveSync();
                  setNotice("Cloud settings saved.");
                  setError("");
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              Save cloud settings
            </Button>
            <Button
              disabled={busy || !syncToken.trim()}
              onClick={() => sync("push")}
            >
              {busy ? "Working…" : "Save cloud backup"}
            </Button>
            <Button
              variant="secondary"
              disabled={busy || !syncToken.trim() || !gistId.trim()}
              onClick={() => setConfirmation("restore")}
            >
              Restore cloud backup
            </Button>
          </div>
        </details>
      </section>

      <section className="settings-section" aria-labelledby="tutor-heading">
        <p className="eyebrow">03 / Another way to think it through</p>
        <h2 id="tutor-heading">Optional study tutor</h2>
        <p>
          Use Ada for a hint, an explanation, or a check of your reasoning.
          Lessons, visuals, and worked examples work without an AI connection.
        </p>
        <form onSubmit={saveTutor} className="settings-form-grid">
          <label>
            Provider
            <select
              aria-label="Tutor provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
          </label>
          <label>
            Provider API key
            <input
              aria-label="Provider API key"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Your provider key"
            />
          </label>
          <p className="study-muted">
            The key stays in this browser and is sent directly to your chosen
            provider. Tutor requests may incur provider charges.
          </p>
          <div>
            <Button type="submit">Save tutor settings</Button>
          </div>
        </form>
      </section>

      <section
        className="settings-section settings-reset"
        aria-labelledby="reset-heading"
      >
        <h2 id="reset-heading">Start over</h2>
        <p>
          Clear this browser’s study history, rulebook changes, preferences, and
          tutor conversations.
        </p>
        <Button variant="secondary" onClick={() => setConfirmation("reset")}>
          Reset study data
        </Button>
      </section>
      <Modal
        isOpen={Boolean(confirmation)}
        onClose={() => {
          if (!busy) setConfirmation(null);
        }}
        title={
          confirmation === "restore"
            ? "Restore this cloud snapshot?"
            : "Clear your study data?"
        }
      >
        <p>
          {confirmation === "restore"
            ? "This replaces your local study history with the cloud snapshot. Download a backup first if you want a copy of your current work. Your local tutor key is kept."
            : "This clears sessions, progress, repairs, rulebook changes, preferences, and tutor conversations in this browser. Download a backup if you want to keep your work."}
        </p>
        <div className="study-actions">
          <Button variant="secondary" onClick={() => backup()}>
            Download a backup
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => setConfirmation(null)}
          >
            Cancel
          </Button>
          <Button
            disabled={busy}
            variant={confirmation === "reset" ? "danger" : "primary"}
            onClick={() =>
              confirmation === "restore" ? sync("pull") : reset()
            }
          >
            {busy
              ? "Restoring…"
              : confirmation === "restore"
                ? "Replace with cloud snapshot"
                : "Clear study data"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
