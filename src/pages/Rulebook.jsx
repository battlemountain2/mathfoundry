import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getRulebook,
  saveRulebookEntry,
  removeRulebookEntry,
  getFoundationSession,
  setFoundationSession,
  getRepairDraft,
  setRepairDraft,
} from "../utils/storage";
import { RULEBOOK_CATEGORIES } from "../data/rulebookData.js";
import MathBlock from "../components/Lesson/MathBlock";

function Entry({ entry, isHighlighted, from, activeId, onRefresh, onError }) {
  const [notes, setNotes] = useState(entry.notes ?? entry.suggestedNotes ?? "");
  const [savedFeedback, setSavedFeedback] = useState(false);

  function save() {
    try {
      saveRulebookEntry({ ...entry, notes });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
      onRefresh();
    } catch (e) {
      onError(e.message);
    }
  }

  const categoryLabel =
    RULEBOOK_CATEGORIES.find((c) => c.id === entry.category)?.label ||
    (entry.conceptId ? "Foundations" : entry.moduleId ? "Curriculum" : "Custom Note");

  return (
    <article
      id={`rule-${entry.id}`}
      className={`study-card rulebook-entry-card ${isHighlighted ? "rulebook-highlighted" : ""}`}
    >
      <div className="rulebook-entry-header">
        <div style={{ flex: 1 }}>
          <span className="study-badge neutral" style={{ marginBottom: 6, display: "inline-block" }}>
            {categoryLabel}
          </span>
          <h2 style={{ margin: "4px 0 10px" }}>
            <MathBlock content={entry.title} />
          </h2>
        </div>
        {isHighlighted && (
          <span className="study-badge supported">Referenced in study</span>
        )}
      </div>

      {entry.whenToUse && (
        <div className="rulebook-when-box">
          <div className="callout-header">
            <span className="callout-icon">🎯</span>
            <span className="callout-title">When to use</span>
          </div>
          <p>{entry.whenToUse}</p>
        </div>
      )}

      <div className="rulebook-method-section">
        <h3 className="section-mini-heading">Core method</h3>
        <MathBlock content={entry.explanation} />
      </div>

      {entry.pitfall && (
        <div className="rulebook-pitfall-box">
          <div className="callout-header">
            <span className="callout-icon">⚠️</span>
            <span className="callout-title">Common pitfall to avoid</span>
          </div>
          <p>{entry.pitfall}</p>
        </div>
      )}

      {entry.example && (
        <div className="worked-example">
          <h3>Checked worked example</h3>
          <p><strong>{entry.example.question}</strong></p>
          <ol>
            {entry.example.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="rulebook-notes-section">
        <label>
          <span style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            Personal notes & memory cues
          </span>
          <textarea
            className="study-answer"
            style={{ minHeight: 72 }}
            placeholder="Write reminders in your own words. These survive re-saves and data backups."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <button type="button" className="study-button secondary" onClick={save}>
            Save notes
          </button>
          {savedFeedback && (
            <span className="study-muted" style={{ color: "var(--good)", fontWeight: 600 }}>
              ✓ Saved to storage
            </span>
          )}
        </div>
      </div>

      <div className="study-actions" style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        {from === "repair" && activeId && (
          <Link
            className="study-button"
            to={`/repair?draftId=${encodeURIComponent(activeId)}`}
          >
            ← Return to repair
          </Link>
        )}
        {from === "foundations" && activeId && (
          <Link className="study-button" to="/foundations">
            ← Return to foundations
          </Link>
        )}
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
          Practice this topic →
        </Link>
        <button
          type="button"
          className="study-text-button"
          style={{ marginLeft: "auto", color: "var(--ink-2)" }}
          onClick={() => {
            try {
              removeRulebookEntry(entry.id);
              onRefresh();
            } catch (e) {
              onError(e.message);
            }
          }}
        >
          Remove entry
        </button>
      </div>
    </article>
  );
}

export default function Rulebook() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const activeId = searchParams.get("activeId");
  const activeRuleId = searchParams.get("ruleId");

  const [entries, setEntries] = useState(getRulebook);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Scoped assistance: ONLY mark active session as assisted if explicitly referred from active study
  useEffect(() => {
    if (!from || !activeId) return;
    try {
      if (from === "foundations") {
        const block = getFoundationSession();
        if (block && block.id === activeId && block.questions?.[block.index] && !block.checked && !block.assisted) {
          setFoundationSession({ ...block, assisted: true });
        }
      } else if (from === "repair") {
        const repair = getRepairDraft(activeId);
        if (repair && repair.id === activeId && repair.stage === "practice" && !repair.checked && !repair.assisted) {
          setRepairDraft({ ...repair, assisted: true });
        }
      }
    } catch (e) {
      setError(e.message);
    }
  }, [from, activeId]);

  // Scroll to active rule if present
  useEffect(() => {
    if (activeRuleId) {
      const el = document.getElementById(`rule-${activeRuleId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeRuleId, entries]);

  const categories = [
    { id: "all", label: "All Rules" },
    ...RULEBOOK_CATEGORIES,
    { id: "notes", label: "My Notes" },
  ];

  const filteredEntries = entries.filter((entry) => {
    if (selectedCategory === "notes" && !entry.notes?.trim()) return false;
    if (selectedCategory !== "all" && selectedCategory !== "notes" && entry.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.title?.toLowerCase().includes(q);
      const matchWhen = entry.whenToUse?.toLowerCase().includes(q);
      const matchPitfall = entry.pitfall?.toLowerCase().includes(q);
      const matchNotes = entry.notes?.toLowerCase().includes(q);
      const matchExplanation = entry.explanation?.toLowerCase().includes(q);
      return matchTitle || matchWhen || matchPitfall || matchNotes || matchExplanation;
    }
    return true;
  });

  return (
    <div className="study-page">
      <p className="eyebrow">Useful methods, within reach</p>
      <h1>Your rulebook</h1>
      <p className="study-intro">
        Checked procedures, diagnostic triggers, and common pitfalls. Add notes in your
        own words; they survive re-saves and learning backups.
      </p>

      {/* Return to active study banner when arriving from study flow */}
      {from === "repair" && activeId && (
        <aside className="return-study-banner">
          <div className="return-study-info">
            <span className="study-badge supported">Consulting rulebook for active repair</span>
            <p>Support has been recorded for your repair task. Review the method, then return to solve your follow-up.</p>
          </div>
          <Link className="study-button" to={`/repair?draftId=${encodeURIComponent(activeId)}`}>
            ← Return to active repair task
          </Link>
        </aside>
      )}

      {from === "foundations" && activeId && (
        <aside className="return-study-banner">
          <div className="return-study-info">
            <span className="study-badge supported">Consulting rulebook for active foundations</span>
            <p>Support has been recorded for this question. Read the method and return to proceed.</p>
          </div>
          <Link className="study-button" to="/foundations">
            ← Return to foundation session
          </Link>
        </aside>
      )}

      {error && (
        <p role="alert" className="study-notice">
          {error}
        </p>
      )}

      {/* Search and Category Filter Nav */}
      <section className="rulebook-controls-section" aria-label="Rulebook filters">
        <div className="rulebook-search-row">
          <input
            type="search"
            className="study-answer"
            placeholder="Search rules, triggers, or pitfalls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <nav className="rulebook-category-nav" aria-label="Rule categories">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`rulebook-nav-pill ${selectedCategory === c.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </nav>
      </section>

      {!filteredEntries.length && (
        <section className="study-card">
          <h2>No matching rules found</h2>
          <p>
            {searchQuery
              ? `No entries match "${searchQuery}". Try a different keyword.`
              : "No rules in this category yet. Save explanations from past problems or add your own notes."}
          </p>
          <div className="study-actions">
            {searchQuery && (
              <button
                type="button"
                className="study-button secondary"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            )}
            <Link className="study-button" to="/review">
              Review past work
            </Link>
          </div>
        </section>
      )}

      <div className="rulebook-entries-list">
        {filteredEntries.map((entry) => (
          <Entry
            key={entry.id}
            entry={entry}
            isHighlighted={entry.id === activeRuleId}
            from={from}
            activeId={activeId}
            onRefresh={() => setEntries(getRulebook())}
            onError={setError}
          />
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link className="study-text-button" to="/">
          ← Return to Today
        </Link>
      </div>
    </div>
  );
}
