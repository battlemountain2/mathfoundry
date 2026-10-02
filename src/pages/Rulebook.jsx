import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getRulebook,
  saveRulebookEntry,
  removeRulebookEntry,
  getFoundationSession,
  setFoundationSession,
  getRepairDraft,
  setRepairDraft,
} from "../utils/storage";
import MathBlock from "../components/Lesson/MathBlock";
function Entry({ entry, onRefresh, onError }) {
  const [notes, setNotes] = useState(entry.notes || "");
  function save() {
    try {
      saveRulebookEntry({ ...entry, notes });
      onRefresh();
    } catch (e) {
      onError(e.message);
    }
  }
  return (
    <article className="study-card">
      <h2>
        <MathBlock content={entry.title} />
      </h2>
      <MathBlock content={entry.explanation} />
      {entry.example && (
        <div className="worked-example">
          <h3>Worked example</h3>
          <p>{entry.example.question}</p>
          <ol>
            {entry.example.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      <label>
        Your notes
        <textarea
          className="study-answer"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <div className="study-actions">
        <button className="study-button secondary" onClick={save}>
          Save notes
        </button>
        <Link
          className="study-text-button"
          to={
            entry.conceptId
              ? `/foundations?concept=${entry.conceptId}`
              : entry.moduleId
                ? `/module/${entry.moduleId}`
                : "/practice"
          }
        >
          Practice this topic
        </Link>
        <button
          className="study-text-button"
          onClick={() => {
            try {
              removeRulebookEntry(entry.id);
              onRefresh();
            } catch (e) {
              onError(e.message);
            }
          }}
        >
          Remove saved entry
        </button>
      </div>
    </article>
  );
}
export default function Rulebook() {
  const [entries, setEntries] = useState(getRulebook);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const block = getFoundationSession();
      if (block?.questions?.[block.index] && !block.checked && !block.assisted)
        setFoundationSession({ ...block, assisted: true });
      const repair = getRepairDraft();
      if (repair?.stage === "practice" && !repair.checked && !repair.assisted)
        setRepairDraft({ ...repair, assisted: true });
    } catch (e) {
      setError(e.message);
    }
  }, []);
  return (
    <div className="study-page">
      <p className="eyebrow">Useful methods, within reach</p>
      <h1>Your rulebook</h1>
      <p className="study-intro">
        Save explanations and examples from session review. Add notes in your
        own words. Your entries are included in learning backups.
      </p>
      {error && (
        <p role="alert" className="study-notice">
          {error}
        </p>
      )}
      {!entries.length && (
        <section className="study-card">
          <h2>Start with a rule you want to remember</h2>
          <p>Open a past problem and select “Save to rulebook.”</p>
          <Link className="study-button" to="/review">
            Review your work
          </Link>
        </section>
      )}
      {entries.map((entry) => (
        <Entry
          key={entry.id}
          entry={entry}
          onRefresh={() => setEntries(getRulebook())}
          onError={setError}
        />
      ))}
    </div>
  );
}
