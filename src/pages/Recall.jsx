import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { concepts } from "../data/foundations";
import {
  getRecallSession,
  saveRecallSession,
  saveRulebookEntry,
} from "../utils/storage";
import { createRecallSession, submitRecall } from "../utils/ruleMatch";
import { CONCEPT_TO_UNIT_ID } from "../utils/storage";

export default function Recall() {
  const [params] = useSearchParams();
  const [session, setSession] = useState(getRecallSession);
  const savedRef = useRef(session);
  const current = useRef(session);
  const [focus, setFocus] = useState(() =>
    concepts.some((c) => c.id === params.get("focus"))
      ? params.get("focus")
      : "mixed",
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function remember(a) {
    try {
      saveRulebookEntry({
        id: `rule:recall:${a.conceptId}:${a.question}`,
        title: a.question,
        conceptId: a.conceptId,
        explanation: a.explanation,
      });
      setNotice("Saved to your personal rulebook.");
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  function save(next) {
    try {
      saveRecallSession(next, { expectedSession: savedRef.current });
      savedRef.current = next;
      current.current = next;
      setSession(next);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  const q = session?.questions[session.index];
  const result = session?.answers.at(-1);
  const first =
    session?.answers.filter(
      (a, i, rows) =>
        rows.findIndex((r) => r.problemInstanceId === a.problemInstanceId) ===
        i,
    ) || [];
  return (
    <div className="v3-recall">
      <p className="eyebrow">Recall studio · Untimed</p>
      <h1>Rule Match</h1>
      <p className="study-intro">
        A quiet puzzle for remembering what to do—and why.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && (
        <p role="status">
          {notice} <Link to="/rulebook">Open rulebook</Link>
        </p>
      )}
      {!session || session.completed ? (
        <>
          {session?.completed && (
            <section className="v3-round-summary">
              <h2>Review your matches.</h2>
              <p>
                {first.filter((a) => a.isCorrect && !a.assisted).length} of{" "}
                {session.questions.length} rules recognized independently.
              </p>
              <p className="study-muted">
                Recognizing a method is different from applying it. Try a fresh
                paper problem when you’re ready.
              </p>
              {first
                .filter((a) => !a.isCorrect)
                .map((a) => (
                  <details
                    key={a.id}
                    open={a.id === first.find((row) => !row.isCorrect)?.id}
                  >
                    <summary>
                      {concepts.find((c) => c.id === a.conceptId)?.title}:
                      revisit this rule
                    </summary>
                    <p>{a.question}</p>
                    <p>
                      <strong>Your first answer:</strong> {a.submittedAnswer}
                    </p>
                    <p>
                      <strong>Correct match:</strong> {a.expectedAnswer}
                    </p>
                    {session.answers.some(
                      (row) =>
                        row.problemInstanceId === a.problemInstanceId &&
                        row.isCorrect,
                    ) && (
                      <p className="study-muted">
                        Matched on retry with support. Your first answer is kept
                        above.
                      </p>
                    )}
                    <p>{a.explanation}</p>
                    <div className="study-actions">
                      <button
                        className="study-text-button"
                        onClick={() => remember(a)}
                      >
                        Save this rule
                      </button>
                      <Link
                        to={`/courses/math/${CONCEPT_TO_UNIT_ID[a.conceptId]}/practice`}
                        className="study-text-button"
                      >
                        Try one on paper
                      </Link>
                    </div>
                  </details>
                ))}
            </section>
          )}
          <section className="v3-recall-start">
            <label>
              What would you like to refresh?
              <select value={focus} onChange={(e) => setFocus(e.target.value)}>
                <option value="mixed">Mix arithmetic & fractions</option>
                {concepts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="study-button"
              onClick={() => save(createRecallSession(focus))}
            >
              {session ? "Play a fresh round" : "Start six quiet puzzles"}
            </button>
            <p className="study-muted">
              No timer. No lives to lose. Phone or computer.
            </p>
          </section>
        </>
      ) : (
        <section className="v3-puzzle">
          <div className="v3-puzzle-meta">
            <span className="eyebrow">
              {concepts.find((c) => c.id === q.conceptId)?.title}
            </span>
            <span className="v3-count">{session.index + 1} / 6</span>
          </div>
          <h2>{q.question}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save(submitRecall(current.current));
            }}
          >
            <fieldset className="v3-answer-options" disabled={session.checked}>
              <legend className="sr-only">Choose a rule</legend>
              {q.options.map((o, i) => (
                <label
                  key={o}
                  className={`v3-choice ${session.input === String(i) ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="rule"
                    checked={session.input === String(i)}
                    onChange={() =>
                      save({ ...current.current, input: String(i) })
                    }
                  />
                  <span>{o}</span>
                </label>
              ))}
            </fieldset>
            {!session.checked && (
              <button disabled={session.input === ""} className="study-button">
                Check match
              </button>
            )}
          </form>
          {session.checked && (
            <div
              className={`v3-feedback ${result?.isCorrect ? "correct" : "incorrect"}`}
              role="status"
            >
              <strong>
                {result?.isCorrect
                  ? result.assisted
                    ? "Matched with support"
                    : "Matched independently"
                  : "Not quite. Take another look."}
              </strong>
              {result?.isCorrect && <p>{q.explanation}</p>}
              <div className="study-actions">
                {!result?.isCorrect && (
                  <button
                    className="study-button secondary"
                    onClick={() =>
                      save({ ...current.current, checked: false, helped: true })
                    }
                  >
                    Try again
                  </button>
                )}
                <button
                  className="study-button"
                  onClick={() =>
                    save({
                      ...current.current,
                      index: session.index + 1,
                      input: "",
                      checked: false,
                      helped: false,
                      reveal: false,
                      hint: false,
                      completed: session.index === 5,
                    })
                  }
                >
                  {session.index === 5 ? "Review the round" : "Next puzzle"}
                </button>
              </div>
            </div>
          )}
          {(session.hint || session.reveal) && (
            <div className="v3-puzzle-help" aria-live="polite">
              {session.reveal ? q.explanation : q.hint}
            </div>
          )}
          <div className="v3-support-tools">
            <button
              onClick={() =>
                save({ ...current.current, hint: true, helped: true })
              }
            >
              One hint
            </button>
            <button
              onClick={() =>
                save({ ...current.current, reveal: true, helped: true })
              }
            >
              Explain the rule
            </button>
            <Link to="/">Pause and return to Today</Link>
          </div>
        </section>
      )}
    </div>
  );
}
