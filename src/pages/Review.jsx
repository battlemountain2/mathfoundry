import { useSearchParams, Link } from "react-router-dom";
import {
  getLearningAttempts,
  getPracticeHistory,
  getReviewHistory,
  getFoundationSession,
  getStudySessions,
  getStudyHistory,
  normalizeAttempt,
} from "../utils/storage";
import { foundationHistory } from "../utils/review";
import { useStoreChange } from "../hooks/useStoreChange";
import { studyReviewAnswers } from "../utils/studySession";
import SessionReview from "../components/Study/SessionReview";
export default function Review() {
  useStoreChange();
  const [params, setParams] = useSearchParams();
  const baseSessions = [
    ...[...getStudyHistory(), ...Object.values(getStudySessions())]
      .filter((s) => s.answers?.length)
      .map((s) => ({
        ...s,
        timestamp: s.createdAt,
        answers: studyReviewAnswers(s),
      })),
    ...foundationHistory(
      getLearningAttempts().filter((a) => !a.problemInstanceId),
    ),
    ...getPracticeHistory()
      .filter(Boolean)
      .map((s, i) => ({
        ...s,
        id: s.id || `legacy-practice-${i}`,
        title: s.title || "Mixed math practice",
      })),
    ...getReviewHistory().filter(Boolean),
  ].sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  const unitFilter = params.get("unit");
  const visibleSessions = unitFilter
    ? baseSessions.filter((s) =>
        s.answers?.some((a) => normalizeAttempt(a)?.unitPath === unitFilter),
      )
    : baseSessions;
  const sessions = visibleSessions;
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
              onChange={(e) =>
                setParams({
                  session: e.target.value,
                  ...(unitFilter ? { unit: unitFilter } : {}),
                })
              }
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
            sessionId={selected.id}
            highlightAttemptId={params.get("attempt")}
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
