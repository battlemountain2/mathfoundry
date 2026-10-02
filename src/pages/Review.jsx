import { useSearchParams, Link } from "react-router-dom";
import {
  getLearningAttempts,
  getPracticeHistory,
  getReviewHistory,
  getFoundationSession,
} from "../utils/storage";
import { foundationHistory } from "../utils/review";
import { useProgress } from "../hooks/useProgress";
import SessionReview from "../components/Study/SessionReview";
export default function Review() {
  useProgress();
  const [params, setParams] = useSearchParams();
  const sessions = [
    ...foundationHistory(getLearningAttempts()),
    ...getPracticeHistory().map((s, i) => ({
      ...s,
      id: s.id || `legacy-practice-${i}`,
      title: s.title || "Mixed math practice",
    })),
    ...getReviewHistory(),
  ].sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  const draft = getFoundationSession();
  const selected =
    sessions.find((s) => s.id === params.get("session")) || sessions[0];
  return (
    <div className="study-page">
      <p className="eyebrow">Your work, kept together</p>
      <h1>Session history</h1>
      <p className="study-intro">
        Revisit answers, save explanations, and repair skills without losing
        your original work.
      </p>
      <Link className="study-text-button" to="/rulebook">
        Open personal rulebook
      </Link>
      {!sessions.length ? (
        <p>Your completed answers will appear here.</p>
      ) : (
        <>
          <label className="study-controls">
            Choose a session
            <select
              value={selected.id}
              onChange={(e) => setParams({ session: e.target.value })}
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title || "Mixed math practice"} ·{" "}
                  {new Date(s.timestamp).toLocaleString()} ·{" "}
                  {s.answers?.length || 0} questions
                </option>
              ))}
            </select>
          </label>
          <SessionReview
            key={selected.id}
            answers={selected.answers?.map((a, i) => ({
              ...a,
              problem:
                a.problem ||
                (draft?.id === selected.id ? draft.questions[i] : undefined),
            }))}
          />
        </>
      )}
    </div>
  );
}
