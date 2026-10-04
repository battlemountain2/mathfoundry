import { Link } from "react-router-dom";
import { useState } from "react";
import {
  getLearningAttempts,
  getFoundationSession,
  clearFoundationSession,
  getRepairDrafts,
  getAllLearningAttempts,
} from "../utils/storage";
import { concepts } from "../data/foundations";
import {
  conceptProfile,
  foundationRecommendation,
  buildPrerequisitePath,
  getPrioritizedReviewQueue,
  summarizeEvidence,
} from "../utils/learningProfile";
import { useProgress } from "../hooks/useProgress";

export default function Home() {
  useProgress();
  const attempts = getLearningAttempts();
  const allWork = getAllLearningAttempts();
  const [session, setSession] = useState(getFoundationSession);
  const repairDrafts = getRepairDrafts();
  const resume = session?.questions?.[session.index];
  const recommendation = foundationRecommendation(attempts);
  const [minutes, setMinutes] = useState(30);

  const activeConceptId = resume?.conceptId || recommendation.id;
  const path = buildPrerequisitePath(activeConceptId, attempts);
  const reviewQueue = getPrioritizedReviewQueue(allWork);
  const evidence = summarizeEvidence(activeConceptId, attempts);
  const latest = attempts.at(-1);

  function handleShelveSession() {
    clearFoundationSession();
    setSession(null);
  }

  return (
    <div className="study-page today-page">
      <div className="today-heading">
        <div>
          <p className="eyebrow">Room to think. A path to follow.</p>
          <h1>Your study desk.</h1>
          <p className="study-intro">
            Build your foundations with real prerequisite tracking and honest evidence.
          </p>
        </div>
      </div>

      <div className="today-grid">
        {/* Main Recommendation or Resumable Session */}
        <section className="study-card today-main">
          {resume ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <p className="eyebrow" style={{ margin: 0 }}>Active study block · In progress</p>
                <span className="study-badge supported">Resumable</span>
              </div>
              <h2>{concepts.find((c) => c.id === resume.conceptId)?.title || "Active Block"}</h2>
              <p>
                Question {session.index + 1} of {session.questions.length}. Your work and checked answers are saved in local storage.
              </p>
              <div className="resumable-progress-bar" style={{ margin: "14px 0" }}>
                <div
                  className="resumable-progress-fill"
                  style={{ width: `${((session.index) / session.questions.length) * 100}%` }}
                />
              </div>
              <div className="study-actions" style={{ marginTop: 16 }}>
                <Link className="study-button" to="/foundations">
                  Resume study block →
                </Link>
                <button
                  type="button"
                  className="study-text-button"
                  onClick={handleShelveSession}
                  title="Pause this block and clear it from active view"
                >
                  Shelve & pause session
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">Your next study block · Explained recommendation</p>
              <h2>{!attempts.length ? "Find your starting point" : recommendation.title}</h2>
              <p>
                {!attempts.length
                  ? "A short arithmetic and fractions check helps choose a useful place to begin."
                  : recommendation.reason}
              </p>

              {recommendation.evidenceSummary && (
                <div className="recommendation-evidence-callout">
                  <span className="callout-evidence-tag">Evidence basis:</span>{" "}
                  <span>{recommendation.evidenceSummary}</span>
                </div>
              )}

              {recommendation.targetEndpoint && (
                <div className="recommendation-endpoint-callout">
                  <span className="callout-endpoint-tag">🎯 Concrete goal:</span>{" "}
                  <span>{recommendation.targetEndpoint}</span>
                </div>
              )}

              <div className="study-time" style={{ marginTop: 18 }}>
                <span>Study time you’re planning</span>
                <div role="group" aria-label="Study plan duration">
                  {[30, 45, 60, 90].map((n) => (
                    <button
                      key={n}
                      aria-pressed={minutes === n}
                      onClick={() => setMinutes(n)}
                      className={minutes === n ? "active" : ""}
                    >
                      {n === 90 ? "90 min (Extended)" : `${n} min`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="study-actions" style={{ marginTop: 18 }}>
                <Link
                  className="study-button"
                  to={`/foundations?minutes=${minutes}&concept=${recommendation.id}`}
                >
                  {!attempts.length ? "Find my starting point" : "Start recommended block →"}
                </Link>
                <Link className="study-text-button" to="/foundations">
                  Browse all topics
                </Link>
              </div>
            </>
          )}

          <p className="study-muted" style={{ marginTop: 18 }}>
            Resumable blocks · Untimed · Paper-first problem solving
          </p>

          <div className="desk-tools" style={{ marginTop: 14 }}>
            <Link to="/review">Session history</Link>
            <Link to="/rulebook">Personal rulebook</Link>
            {repairDrafts.length > 0 && (
              <Link to="/repair">
                Pending repairs ({repairDrafts.length})
              </Link>
            )}
          </div>
        </section>

        {/* Real Prerequisite-Based Compact Path */}
        <aside className="study-card today-side">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <p className="eyebrow" style={{ margin: 0 }}>Prerequisite path</p>
            <span className="study-badge neutral" style={{ fontSize: 11 }}>
              {path.allPrereqsReady ? "Prereqs Met" : "In Progress"}
            </span>
          </div>
          <h2>One step connects to the next.</h2>

          <div className="prerequisite-path-container">
            {/* Prerequisites Chain */}
            {path.prerequisites.length > 0 && (
              <div className="path-prereqs-section">
                <span className="path-subhead">Required Prerequisites:</span>
                <ul className="path-node-list">
                  {path.prerequisites.map((p) => (
                    <li key={p.id} className="path-node prereq-node">
                      <Link to={`/foundations?concept=${p.id}`}>{p.title}</Link>
                      <span className={`study-badge ${p.isReady ? "correct" : p.state === "Learning" ? "supported" : "skipped"}`}>
                        {p.isReady ? "✓ Ready" : p.state === "Learning" ? "⏳ In progress" : "— Unassessed"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Current Focus Node */}
            <div className="path-current-section">
              <span className="path-subhead">Current Study Target:</span>
              <div className="path-node current-node">
                <div>
                  <strong>{path.target.title}</strong>
                  <span className="study-muted text-xs block" style={{ marginTop: 2 }}>
                    {path.target.state} · {path.target.assessed} assessed attempts
                  </span>
                </div>
                <span className="study-badge supported">Active Focus</span>
              </div>
            </div>

            {/* Downstream Unlocks */}
            {path.downstream.length > 0 && (
              <div className="path-downstream-section">
                <span className="path-subhead">Unlocks Downstream:</span>
                <p className="study-muted text-xs" style={{ margin: "4px 0 0" }}>
                  {path.downstream.map((d) => d.title).join(", ")}
                </p>
              </div>
            )}

            {/* Readiness Note */}
            <div className="path-status-note">
              <p>{path.statusNote}</p>
            </div>
          </div>

          <p className="study-muted text-xs" style={{ marginTop: 12 }}>
            {path.target.bridge}
          </p>
          <Link className="study-text-button" to="/foundations">
            Open full foundation map →
          </Link>
        </aside>
      </div>

      <div className="today-grid">
        {/* Prioritized Review Queue */}
        <section className="study-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <p className="eyebrow" style={{ margin: 0 }}>Review queue</p>
            {reviewQueue.length > 0 && (
              <span className="study-badge incorrect" style={{ fontSize: 11 }}>
                {reviewQueue.length} Priority Item{reviewQueue.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <h2>Prioritized for revisit</h2>

          {reviewQueue.length > 0 ? (
            <div className="review-queue-list">
              {reviewQueue.slice(0, 2).map((item) => (
                <div key={item.id} className="review-queue-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <strong>{item.title}</strong>
                    <span className={`study-badge ${item.priority === "high" ? "incorrect" : item.priority === "medium" ? "supported" : "neutral"}`}>
                      {item.priority === "high" ? "High: Repair" : item.priority === "medium" ? "Medium: Recall" : "Low: Practice"}
                    </span>
                  </div>
                  <p className="queue-reason" style={{ margin: "6px 0 2px", fontSize: 13, color: "var(--ink)" }}>
                    {item.reason}
                  </p>
                  <p className="queue-endpoint study-muted text-xs" style={{ margin: "2px 0 8px" }}>
                    🎯 Goal: {item.targetEndpoint}
                  </p>
                  <Link className="study-text-button" to={item.actionUrl}>
                    Revisit this item →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p>Your review queue is clear! All recent missed problems have been repaired and no delayed checks are due.</p>
              <Link className="study-text-button" to="/review">
                Browse past sessions →
              </Link>
            </>
          )}
        </section>

        {/* Evidence Transparency Model */}
        <section className="study-card">
          <p className="eyebrow">Evidence integrity</p>
          <h2>What your work shows</h2>
          <div className="evidence-metrics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "14px 0" }}>
            <div className="evidence-metric-box">
              <span className="metric-num font-mono">{evidence.independent}</span>
              <span className="metric-label">Independent</span>
            </div>
            <div className="evidence-metric-box">
              <span className="metric-num font-mono">{evidence.supported}</span>
              <span className="metric-label">Helped</span>
            </div>
            <div className="evidence-metric-box">
              <span className="metric-num font-mono">{evidence.missed}</span>
              <span className="metric-label">Needs look</span>
            </div>
            <div className="evidence-metric-box">
              <span className="metric-num font-mono">{evidence.total}</span>
              <span className="metric-label">Total answers</span>
            </div>
          </div>

          <p className="evidence-claim-note" style={{ fontSize: 13, color: "var(--ink)", margin: "8px 0" }}>
            {evidence.claim}
          </p>

          <p className="study-muted text-xs">
            Helped success and delayed recall remain distinct. No mastery claims are made from sparse evidence.
          </p>

          <Link className="study-text-button" to="/progress" style={{ marginTop: 10, display: "inline-block" }}>
            Inspect full learning profile →
          </Link>
        </section>
      </div>

      {/* Real Application Bridge */}
      <section className="study-card today-paths">
        <div>
          <p className="eyebrow">Connect it to something real</p>
          <h2>Fractions in engineering scale drawings</h2>
          <p>
            Use a simple drawing to see how a fraction connects to a physical
            measurement and engineering tolerance.
          </p>
        </div>
        <Link
          className="study-button secondary"
          to="/foundations?application=scale"
        >
          Try small application →
        </Link>
      </section>
    </div>
  );
}
