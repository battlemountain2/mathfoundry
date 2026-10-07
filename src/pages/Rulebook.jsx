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
  toUnitPath,
} from "../utils/storage";
import { RULEBOOK_CATEGORIES } from "../data/rulebookData.js";
import MathBlock from "../components/Lesson/MathBlock";

function Entry({
  entry,
  isHighlighted,
  from,
  activeId,
  defaultExpanded,
  onRefresh,
  onError,
}) {
  const [notes, setNotes] = useState(entry.notes ?? entry.suggestedNotes ?? "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isHighlighted || defaultExpanded);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync expanded state if highlighted or global view mode changes
  useEffect(() => {
    if (isHighlighted) {
      setIsExpanded(true);
    } else {
      setIsExpanded(defaultExpanded);
    }
  }, [isHighlighted, defaultExpanded]);

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
    (entry.conceptId ? "Foundations" : entry.moduleId ? "Geometry" : "Custom Note");

  const practicePath = entry.conceptId
    ? `/courses/${toUnitPath(entry.conceptId) || `math/${entry.conceptId}`}/practice`
    : entry.moduleId
      ? `/courses/geometry/${entry.moduleId}/practice`
      : "/courses";

  return (
    <article
      id={`rule-${entry.id}`}
      className={`study-card rulebook-entry-card ${isHighlighted ? "rulebook-highlighted" : ""} p-5 sm:p-6 mb-4 transition-all`}
    >
      {/* Card Header */}
      <div className="rulebook-entry-header flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="study-badge neutral text-xs font-medium">
              {categoryLabel}
            </span>
            {entry.notes?.trim() && (
              <span
                className="study-badge text-xs"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                📝 Has Note
              </span>
            )}
            {isHighlighted && (
              <span className="study-badge supported text-xs">
                Referenced in study
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--ink)] tracking-tight">
            <MathBlock content={entry.title} />
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[var(--ink-2)] hover:text-[var(--ink)] bg-[var(--surface-2)] hover:bg-[var(--surface)] border border-[var(--line)] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
          title={isExpanded ? "Collapse card details" : "Expand card details"}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "▴ Less" : "▾ Details"}
        </button>
      </div>

      {/* Core Method (Always Visible & Prominent) */}
      <div className="rulebook-method-section text-sm sm:text-base leading-relaxed text-[var(--ink)] my-2">
        <MathBlock content={entry.explanation} />
      </div>

      {/* Detailed Content (Expandable) */}
      {isExpanded && (
        <div className="rulebook-expanded-content pt-2 animate-fade-in">
          {/* Side-by-side When to Use and Pitfall grid */}
          {(entry.whenToUse || entry.pitfall) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
              {entry.whenToUse && (
                <div className="rulebook-when-box m-0">
                  <div className="callout-header">
                    <span className="callout-icon">🎯</span>
                    <span className="callout-title">When to use</span>
                  </div>
                  <p className="text-sm leading-relaxed">{entry.whenToUse}</p>
                </div>
              )}
              {entry.pitfall && (
                <div className="rulebook-pitfall-box m-0">
                  <div className="callout-header">
                    <span className="callout-icon">⚠️</span>
                    <span className="callout-title">Pitfall to avoid</span>
                  </div>
                  <p className="text-sm leading-relaxed">{entry.pitfall}</p>
                </div>
              )}
            </div>
          )}

          {/* Worked Example */}
          {entry.example && (
            <details className="rulebook-example-box my-3 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
              <summary className="cursor-pointer font-semibold text-xs uppercase tracking-wider text-[var(--accent)] select-none">
                💡 View worked example: <span className="text-[var(--ink)] normal-case font-medium">{entry.example.question}</span>
              </summary>
              <ol className="list-decimal pl-5 space-y-1.5 mt-3 text-sm text-[var(--ink-2)] leading-relaxed">
                {entry.example.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </details>
          )}

          {/* Personal Notes Section */}
          <div className="rulebook-notes-section mt-3 pt-3 border-t border-dashed border-[var(--line)]">
            {notes?.trim() && !isEditingNotes ? (
              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
                    <span>📝</span> Personal memory cues & notes
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs text-[var(--accent)] hover:underline font-medium cursor-pointer"
                  >
                    Edit note
                  </button>
                </div>
                <p className="text-sm text-[var(--ink)] whitespace-pre-wrap leading-relaxed">{notes}</p>
              </div>
            ) : !isEditingNotes ? (
              <button
                type="button"
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-[var(--ink-2)] hover:text-[var(--accent)] inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-[var(--surface-2)]"
              >
                <span>✏️</span> Add personal memory note...
              </button>
            ) : (
              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] space-y-2.5">
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  Personal notes & memory cues:
                </label>
                <textarea
                  className="study-answer w-full text-xs sm:text-sm"
                  style={{ minHeight: 70 }}
                  placeholder="Write reminders in your own words. These survive re-saves and data backups."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="study-button py-1.5 px-3 text-xs"
                    onClick={() => {
                      save();
                      setIsEditingNotes(false);
                    }}
                  >
                    Save note
                  </button>
                  <button
                    type="button"
                    className="study-button secondary py-1.5 px-3 text-xs"
                    onClick={() => {
                      setNotes(entry.notes ?? entry.suggestedNotes ?? "");
                      setIsEditingNotes(false);
                    }}
                  >
                    Cancel
                  </button>
                  {savedFeedback && (
                    <span className="text-xs text-[var(--good)] font-semibold">
                      ✓ Saved to storage
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Action Footer */}
      <div className="rulebook-card-actions flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-[var(--line)] text-xs">
        {from === "repair" && activeId && (
          <Link
            className="study-button py-1.5 px-3 text-xs"
            to={`/repair?draftId=${encodeURIComponent(activeId)}`}
          >
            ← Return to repair
          </Link>
        )}
        {from === "foundations" && activeId && (
          <Link className="study-button py-1.5 px-3 text-xs" to="/foundations">
            ← Return to foundations
          </Link>
        )}

        <button
          type="button"
          className="text-xs text-[var(--accent)] hover:underline font-medium cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "▴ Less details" : "▾ More details (when to use, pitfalls, example)"}
        </button>

        <Link className="study-text-button text-xs ml-auto" to={practicePath}>
          Practice this topic →
        </Link>

        {confirmRemove ? (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-rose-500 font-medium">Remove rule?</span>
            <button
              type="button"
              className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
              onClick={() => {
                try {
                  removeRulebookEntry(entry.id);
                  onRefresh();
                } catch (e) {
                  onError(e.message);
                }
              }}
            >
              Yes
            </button>
            <button
              type="button"
              className="text-xs text-[var(--ink-2)] hover:underline cursor-pointer"
              onClick={() => setConfirmRemove(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="text-xs text-[var(--ink-3)] hover:text-rose-500 transition-colors cursor-pointer ml-2"
            onClick={() => setConfirmRemove(true)}
            title="Remove from rulebook"
          >
            Remove
          </button>
        )}
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
  const [viewMode, setViewMode] = useState("detailed"); // 'compact' or 'detailed'

  // Scoped assistance: ONLY mark active session as assisted if explicitly referred from active study
  useEffect(() => {
    if (!from || !activeId) return;
    try {
      if (from === "foundations") {
        const block = getFoundationSession();
        if (
          block &&
          block.id === activeId &&
          block.questions?.[block.index] &&
          !block.checked &&
          !block.assisted
        ) {
          setFoundationSession({ ...block, assisted: true });
        }
      } else if (from === "repair") {
        const repair = getRepairDraft(activeId);
        if (
          repair &&
          repair.id === activeId &&
          repair.stage === "practice" &&
          !repair.checked &&
          !repair.assisted
        ) {
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
    if (
      selectedCategory !== "all" &&
      selectedCategory !== "notes" &&
      entry.category !== selectedCategory
    )
      return false;
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

  const notesCount = entries.filter((e) => e.notes?.trim()).length;

  return (
    <div className="study-page max-w-5xl mx-auto">
      {/* Header and Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <p className="eyebrow">Useful methods, within reach</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">Your rulebook</h1>
          <p className="study-intro text-sm sm:text-base mt-1 text-[var(--ink-2)] max-w-xl">
            Checked procedures, diagnostic triggers, and personal memory cues.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-[var(--surface-2)] border border-[var(--line)] px-3 py-1.5 rounded-xl text-xs text-[var(--ink-2)]">
          <span className="font-semibold text-[var(--ink)]">{entries.length}</span> methods
          <span>·</span>
          <span className="font-semibold text-[var(--ink)]">{notesCount}</span> notes
        </div>
      </div>

      {/* Return to active study banner when arriving from study flow */}
      {from === "repair" && activeId && (
        <aside className="return-study-banner mb-6">
          <div className="return-study-info">
            <span className="study-badge supported">Consulting rulebook for active repair</span>
            <p>Support has been recorded for your repair task. Review the method, then return to solve your follow-up.</p>
          </div>
          <Link className="study-button py-2 px-4 text-xs" to={`/repair?draftId=${encodeURIComponent(activeId)}`}>
            ← Return to active repair task
          </Link>
        </aside>
      )}

      {from === "foundations" && activeId && (
        <aside className="return-study-banner mb-6">
          <div className="return-study-info">
            <span className="study-badge supported">Consulting rulebook for active foundations</span>
            <p>Support has been recorded for this question. Read the method and return to proceed.</p>
          </div>
          <Link className="study-button py-2 px-4 text-xs" to="/foundations">
            ← Return to foundation session
          </Link>
        </aside>
      )}

      {error && (
        <p role="alert" className="study-notice mb-4">
          {error}
        </p>
      )}

      {/* Search and Category Filter Toolbar */}
      <section className="rulebook-controls-section mb-6 space-y-3" aria-label="Rulebook filters">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-[var(--ink-3)]">
              🔍
            </span>
            <input
              type="search"
              className="study-answer w-full !py-2 !pl-8 !pr-8 text-xs sm:text-sm !m-0 rounded-lg"
              placeholder="Search rules, procedures, triggers, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Density Mode Toggle */}
          <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-lg border border-[var(--line)] shrink-0 self-end sm:self-auto">
            <button
              type="button"
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "compact"
                  ? "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] shadow-xs"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)]"
              }`}
              onClick={() => setViewMode("compact")}
              title="Compact view (titles and core methods only)"
            >
              ⊟ Compact
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "detailed"
                  ? "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] shadow-xs"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)]"
              }`}
              onClick={() => setViewMode("detailed")}
              title="Detailed view (full methods, examples, and pitfalls)"
            >
              ⊞ Detailed
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <nav className="rulebook-category-nav flex flex-wrap gap-2 pt-1" aria-label="Rule categories">
          {categories.map((c) => {
            const count =
              c.id === "all"
                ? entries.length
                : c.id === "notes"
                  ? notesCount
                  : entries.filter((e) => e.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                className={`rulebook-nav-pill ${selectedCategory === c.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(c.id)}
              >
                <span>{c.label}</span>
                <span className="opacity-75 text-xs ml-1 font-mono">({count})</span>
              </button>
            );
          })}
        </nav>

        {/* Filter / Search Status */}
        {(searchQuery || selectedCategory !== "all") && (
          <div className="flex items-center justify-between text-xs text-[var(--ink-2)] px-1 pt-1">
            <span>
              Showing {filteredEntries.length} of {entries.length} methods
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs text-[var(--accent)] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Empty State */}
      {!filteredEntries.length && (
        <section className="study-card text-center py-12 px-6">
          <div className="text-3xl mb-3">📖</div>
          <h2 className="text-xl font-bold text-[var(--ink)] mb-2">No matching rules found</h2>
          <p className="text-sm text-[var(--ink-2)] max-w-md mx-auto mb-6">
            {searchQuery
              ? `No entries match "${searchQuery}". Try a different keyword or topic.`
              : "No rules in this category yet. Save rules during guided lessons or problem reviews."}
          </p>
          <div className="flex justify-center gap-3">
            {searchQuery && (
              <button
                type="button"
                className="study-button secondary text-xs py-2 px-4"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            )}
            <Link className="study-button text-xs py-2 px-4" to="/courses">
              Explore courses
            </Link>
          </div>
        </section>
      )}

      {/* Entries List */}
      <div className="rulebook-entries-list space-y-4">
        {filteredEntries.map((entry) => (
          <Entry
            key={entry.id}
            entry={entry}
            isHighlighted={entry.id === activeRuleId}
            from={from}
            activeId={activeId}
            defaultExpanded={viewMode === "detailed"}
            onRefresh={() => setEntries(getRulebook())}
            onError={setError}
          />
        ))}
      </div>

      {/* Return to Dashboard */}
      <div className="mt-8 pt-4 border-t border-[var(--line)]">
        <Link className="study-text-button text-sm" to="/">
          ← Return to Today
        </Link>
      </div>
    </div>
  );
}
