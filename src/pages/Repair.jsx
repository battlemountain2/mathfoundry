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
    const attempt = {
      id: `${draft.id}:follow-up`,
      sessionId: draft.id,
      conceptId: q.conceptId,
      moduleId: q.moduleId,
      problemId: q.id,
      problem: q,
      question: q.question,
      submittedAnswer: displayAnswer(q, raw),
      expectedAnswer: expectedAnswer(q),
      explanation: q.explanation,
      isCorrect: correct,
      assisted: draft.assisted,
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
      persist({ ...draft, checked: true, attempt });
    } catch (error) {
      setError(error.message);
    }
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
            <div className="study-feedback">
              <h3>
                {draft.attempt.isCorrect
                  ? "Correct"
                  : "Let’s revisit the method"}
              </h3>
              <p>Expected: {draft.attempt.expectedAnswer}</p>
              <MathBlock content={q.explanation} />
              <p>
                {draft.assisted
                  ? "Recorded as supported practice."
                  : "Recorded as an independent follow-up."}{" "}
                Return later to check recall.
              </p>
              <Link className="study-button secondary" to="/review">
                Return to your work
              </Link>
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
