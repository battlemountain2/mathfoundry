import { Link } from "react-router-dom";
import { useState } from "react";
import {
  getLearningAttempts,
  getFoundationSession,
  getRepairDraft,
  getPracticeHistory,
  getReviewHistory,
} from "../utils/storage";
import { concepts } from "../data/foundations";
import {
  conceptProfile,
  foundationRecommendation,
} from "../utils/learningProfile";
import { useProgress } from "../hooks/useProgress";
export default function Home() {
  useProgress();
  const attempts = getLearningAttempts();
  const session = getFoundationSession();
  const repair = getRepairDraft();
  const resume = session?.questions?.[session.index];
  const recommendation = foundationRecommendation(attempts);
  const [minutes, setMinutes] = useState(30);
  const index = Math.max(
    0,
    concepts.findIndex(
      (c) => c.id === (resume?.conceptId || recommendation.id),
    ),
  );
  const nearby = concepts.slice(
    Math.max(0, index - 1),
    Math.min(concepts.length, index + 2),
  );
  const allWork = [
    ...attempts,
    ...[...getPracticeHistory(), ...getReviewHistory()].flatMap((s) =>
      (s.answers || []).map((a) => ({
        ...a,
        sessionId: s.id,
        timestamp: s.timestamp,
      })),
    ),
  ].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  const revisit = allWork.filter((a) => !a.isCorrect || a.skipped).at(-1);
  const latest = attempts.at(-1);
  return (
    <div className="study-page today-page">
      <div className="today-heading">
        <div>
          <p className="eyebrow">Room to think. A path to follow.</p>
          <h1>Your study desk.</h1>
          <p className="study-intro">
            Build your foundations, one clear step at a time.
          </p>
        </div>
      </div>
      <div className="today-grid">
        <section className="study-card today-main">
          <p className="eyebrow">
            {resume ? "Continue where you left off" : "Your next study block"}
          </p>
          <h2>
            {resume
              ? concepts.find((c) => c.id === resume.conceptId)?.title
              : !attempts.length
                ? "Find your starting point"
                : recommendation.title}
          </h2>
          <p>
            {resume
              ? `Question ${session.index + 1} of ${session.questions.length}. Your work is saved.`
              : !attempts.length
                ? "A short arithmetic and fractions check helps choose a useful place to begin."
                : recommendation.reason}
          </p>
          <div className="study-time">
            <span>Study time you’re planning</span>
            <div role="group" aria-label="Study plan duration">
              {[30, 45, 60].map((n) => (
                <button
                  key={n}
                  aria-pressed={minutes === n}
                  onClick={() => setMinutes(n)}
                  className={minutes === n ? "active" : ""}
                >
                  {n} min
                </button>
              ))}
            </div>
          </div>
          <Link
            className="study-button"
            to={`/foundations?minutes=${minutes}&concept=${recommendation.id}`}
          >
            {resume
              ? "Resume my block"
              : !attempts.length
                ? "Find my starting point"
                : "Start studying"}
          </Link>
          <p className="study-muted" style={{ marginTop: 18 }}>
            Six-question blocks · Untimed · Paper welcome
          </p>
          <div className="desk-tools">
            <Link to="/review">Review my work</Link>
            <Link to="/rulebook">Personal rulebook</Link>
            {repair && !repair.checked && (
              <Link to="/repair">Resume repair session</Link>
            )}
          </div>
        </section>
        <aside className="study-card today-side">
          <p className="eyebrow">Your compact path</p>
          <h2>One step connects to the next.</h2>
          <ol className="compact-path">
            {nearby.map((c) => (
              <li
                className={c.id === concepts[index].id ? "current" : ""}
                key={c.id}
              >
                <Link to={`/foundations?concept=${c.id}`}>{c.title}</Link>
                <span>
                  {c.id === concepts[index].id ? "Current focus · " : ""}
                  {conceptProfile(c.id, attempts).state}
                </span>
              </li>
            ))}
          </ol>
          <p className="study-muted">{concepts[index].bridge}</p>
          <Link className="study-text-button" to="/foundations">
            Open the full foundation map
          </Link>
        </aside>
      </div>
      <div className="today-grid">
        <section className="study-card">
          <p className="eyebrow">A useful second look</p>
          <h2>{revisit ? "Make room for a repair" : "Your review space"}</h2>
          <p>
            {revisit
              ? `Revisit: ${revisit.question}`
              : "Your saved problems and explanations will stay here as you study."}
          </p>
          <Link
            className="study-text-button"
            to={revisit ? `/review?session=${revisit.sessionId}` : "/review"}
          >
            {revisit ? "Review this session" : "Open session history"}
          </Link>
        </section>
        <section className="study-card">
          <p className="eyebrow">What your work shows</p>
          <h2>
            {latest
              ? latest.isCorrect
                ? "A step forward"
                : "A starting point for practice"
              : "Understanding takes evidence"}
          </h2>
          <p>
            {latest
              ? `${latest.question} — ${latest.skipped ? "skipped" : latest.isCorrect ? "correct" : "needs another look"}${latest.assisted ? ", with support" : ""}.`
              : "Independent attempts and later recall will help distinguish practice from what sticks."}
          </p>
          <Link className="study-text-button" to="/progress">
            See your learning evidence
          </Link>
        </section>
      </div>
      <section className="study-card today-paths">
        <div>
          <p className="eyebrow">Connect it to something real</p>
          <h2>Fractions in a scale drawing</h2>
          <p>
            Use a simple drawing to see how a fraction connects to a real
            measurement.
          </p>
        </div>
        <Link
          className="study-button secondary"
          to="/foundations?application=scale"
        >
          Try a small application
        </Link>
      </section>
    </div>
  );
}
