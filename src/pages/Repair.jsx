import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getRepairDraft,
  setRepairDraft,
  saveLearningAttempt,
  savePracticeSession,
} from "../utils/storage";
import {
  equivalentAnswer,
  numericValue,
  checkPracticeAnswer,
} from "../utils/answerChecking";
import { displayAnswer, expectedAnswer } from "../utils/review";
import { getProblemHint } from "../utils/hints";
import MathBlock from "../components/Lesson/MathBlock";
import { useStudyActivity } from "../components/Study/ActivityContext";

export default function Repair() {
  const [draft, setDraft] = useState(getRepairDraft);
  const [error, setError] = useState("");
  const q = draft?.problem;
  useStudyActivity({
    moduleTitle: "Repair session",
    question: draft?.stage === "review" ? draft?.source?.question : q?.question,
    submittedAnswer: draft?.checked ? draft.input : null,
    feedback: draft?.checked ? q?.explanation : null,
  });
  function persist(next) {
    try {
      setRepairDraft(next);
      setDraft(next);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  function check(e) {
    e.preventDefault();
    if (draft.checked || draft.input === "") return;
    const choice = Boolean(q.options);
    if (!choice && numericValue(draft.input) === null) {
      setError("Enter a number or fraction.");
      return;
    }
    const raw = choice ? Number(draft.input) : draft.input;
    const correct = q.conceptId
      ? choice
        ? raw === q.answer
        : equivalentAnswer(raw, q.answer)
      : checkPracticeAnswer(q, raw);
    const attemptsCount = (draft.attemptsOnCurrent || 0) + 1;
    const isHelped = Boolean(draft.assisted || attemptsCount > 1 || draft.showHint);
    const initialAnswer = draft.initialAnswer ?? displayAnswer(q, raw);

    const attempt = {
      id: `${draft.id}:follow-up`,
      sessionId: draft.id,
      conceptId: q.conceptId,
      moduleId: q.moduleId,
      problemId: q.id,
      problem: q,
      question: q.question,
      submittedAnswer: displayAnswer(q, raw),
      initialAnswer,
      expectedAnswer: expectedAnswer(q),
      explanation: q.explanation,
      isCorrect: correct,
      assisted: isHelped,
      mode: "repair",
      format: q.format,
      timestamp: new Date().toISOString(),
    };
    try {
      if (q.conceptId) saveLearningAttempt(attempt);
      else
        savePracticeSession({
          id: draft.id,
          title: "Repair follow-up",
          answers: [attempt],
          correct: Number(correct),
          total: 1,
          score: correct ? 100 : 0,
        });

      if (correct) {
        persist({ ...draft, checked: true, showSolution: true, showHint: false, attemptsOnCurrent: attemptsCount, attempt });
      } else {
        persist({ ...draft, checked: true, showSolution: false, showHint: true, attemptsOnCurrent: attemptsCount, initialAnswer, attempt });
      }
    } catch (error) {
      setError(error.message);
    }
  }

  function handleRetry() {
    persist({ ...draft, checked: false, showHint: true, assisted: true });
  }

  function handleWalkThrough() {
    persist({ ...draft, showSolution: true, assisted: true });
  }
  if (!draft)
    return (
      <div className="study-page">
        <h1>Repair a skill</h1>
        <p>Choose a problem from your saved session review to begin.</p>
        <Link className="study-button" to="/review">
          Open session history
        </Link>
      </div>
    );
  return (
    <div className="study-page">
      <p className="eyebrow">A little support, then a fresh start</p>
      <h1>Repair a skill</h1>
      <p className="study-intro">
        Your original attempt stays in your record. This follow-up adds new
        evidence.
      </p>
      {error && (
        <p className="study-notice" role="alert">
          {error}
        </p>
      )}
      {draft.stage === "review" ? (
        <section className="study-card">
          <h2>Start with your original problem</h2>
          <MathBlock content={draft.source.question} />
          <p>
            Your answer:{" "}
            {String(draft.source.submittedAnswer ?? "Not answered")}
          </p>
          <p>Expected: {draft.source.expectedAnswer ?? "Not recorded"}</p>
          <MathBlock
            content={
              draft.source.explanation ||
              "Review the related lesson for the explanation."
            }
          />
          {q.example && (
            <div className="worked-example">
              <h3>A worked example</h3>
              <p>{q.example.question}</p>
              <ol>
                {q.example.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
          <p className="study-muted">
            Next you’ll get a different problem. Immediate follow-up shows
            practice; later recall is checked separately.
          </p>
          <button
            className="study-button"
            onClick={() => persist({ ...draft, stage: "practice" })}
          >
            Try a fresh problem
          </button>
        </section>
      ) : (
        <section className="study-card problem-card">
          <p className="eyebrow">Fresh follow-up · Paper welcome</p>
          <h2>{q.question}</h2>
          <form onSubmit={check}>
            {q.options ? (
              <fieldset className="study-options" disabled={draft.checked}>
                <legend>Choose your answer</legend>
                {q.options.map((option, i) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="repair-answer"
                      checked={draft.input === String(i)}
                      onChange={() => persist({ ...draft, input: String(i) })}
                    />
                    {option}
                  </label>
                ))}
              </fieldset>
            ) : (
              <label>
                Your answer
                <input
                  className="study-answer"
                  disabled={draft.checked}
                  value={draft.input}
                  onChange={(e) => persist({ ...draft, input: e.target.value })}
                />
              </label>
            )}
            {!draft.checked && (
              <div className="study-actions">
                <button className="study-button" disabled={draft.input === ""}>
                  Check answer
                </button>
                {q.example && (
                  <button
                    type="button"
                    className="study-button secondary"
                    onClick={() => persist({ ...draft, assisted: true })}
                  >
                    Help me remember
                  </button>
                )}
                <Link
                  className="study-text-button"
                  to="/rulebook"
                  onClick={() => persist({ ...draft, assisted: true })}
                >
                  Consult rulebook
                </Link>
              </div>
            )}
            {draft.assisted && !draft.checked && q.example && (
              <div className="worked-example">
                <p>{q.example.question}</p>
                <ol>
                  {q.example.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="study-muted">
                  This attempt will be recorded with support.
                </p>
              </div>
            )}
          </form>
          {draft.checked && (
            <div
              className={`study-feedback ${
                draft.attempt?.isCorrect
                  ? "feedback-correct"
                  : "feedback-incorrect"
              }`}
            >
              {draft.attempt?.isCorrect ? (
                <>
                  <div className="study-badge correct" style={{ marginBottom: 8 }}>
                    {draft.assisted || (draft.attemptsOnCurrent || 0) > 1
                      ? "✓ Correct after hint"
                      : "✓ Correct"}
                  </div>
                  <h3>
                    {draft.assisted || (draft.attemptsOnCurrent || 0) > 1
                      ? "Solid work"
                      : "✓ Correct follow-up"}
                  </h3>
                  <div className="answer-comparison-box">
                    <div className="comparison-col your-answer is-correct">
                      <span className="comparison-label">Your answer</span>
                      <span className="comparison-value">{draft.attempt?.submittedAnswer}</span>
                    </div>
                  </div>
                  <MathBlock content={q.explanation} />
                  <p className="study-muted">
                    {draft.assisted
                      ? "Recorded as supported practice."
                      : "Recorded as an independent follow-up."}{" "}
                    Return later to check recall.
                  </p>
                  <Link
                    className="study-button"
                    to={
                      draft.source?.sessionId
                        ? `/review?session=${encodeURIComponent(draft.source.sessionId)}`
                        : "/review"
                    }
                  >
                    Return to source session →
                  </Link>
                </>
              ) : !draft.showSolution ? (
                <>
                  <div className="study-badge incorrect" style={{ marginBottom: 8 }}>
                    ✗ Incorrect
                  </div>
                  <h3>Not quite</h3>
                  <p>
                    Your answer: <strong>{draft.attempt?.submittedAnswer}</strong>
                  </p>

                  <div className="hint-callout">
                    <p className="hint-title">Targeted Hint</p>
                    <p>{getProblemHint(q)}</p>
                  </div>

                  <div className="study-actions" style={{ marginTop: 14 }}>
                    <button className="study-button" onClick={handleRetry}>
                      Try again
                    </button>
                    <button className="study-button secondary" onClick={handleWalkThrough}>
                      Walk me through it
                    </button>
                    <Link
                      className="study-text-button"
                      to={
                        draft.source?.sessionId
                          ? `/review?session=${encodeURIComponent(draft.source.sessionId)}`
                          : "/review"
                      }
                      style={{ display: "inline-block", marginLeft: 8 }}
                    >
                      Return to source session
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="study-badge incorrect" style={{ marginBottom: 8 }}>
                    ✗ Solution Revealed
                  </div>
                  <h3>Walk me through it</h3>
                  <div className="answer-comparison-box">
                    <div className="comparison-col your-answer is-wrong">
                      <span className="comparison-label">Your answer</span>
                      <span className="comparison-value">{draft.attempt?.submittedAnswer}</span>
                    </div>
                    <div className="comparison-col expected-answer">
                      <span className="comparison-label">Expected answer</span>
                      <span className="comparison-value">{draft.attempt?.expectedAnswer}</span>
                    </div>
                  </div>
                  <h3>Why the method works</h3>
                  <MathBlock content={q.explanation} />
                  <p className="study-muted">
                    Recorded with support. You can revisit this topic anytime.
                  </p>
                  <Link
                    className="study-button"
                    to={
                      draft.source?.sessionId
                        ? `/review?session=${encodeURIComponent(draft.source.sessionId)}`
                        : "/review"
                    }
                  >
                    Return to source session →
                  </Link>
                </>
              )}
            </div>
          )}
        </section>
      )}
      <Link className="study-text-button" to="/">
        Pause & return to Today
      </Link>
    </div>
  );
}
