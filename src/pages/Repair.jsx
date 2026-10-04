import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getRepairDrafts,
  getRepairDraft,
  setRepairDraft,
  removeRepairDraft,
  saveLearningAttempt,
  savePracticeSession,
  updateAttemptReflectiveCause,
} from "../utils/storage";

const REFLECTIVE_OPTIONS = [
  { id: "calc-slip", label: "Calculation slip", icon: "🧮" },
  { id: "rule-confused", label: "Confused the rule", icon: "📖" },
  { id: "misread", label: "Misread numbers", icon: "👁️" },
  { id: "unsure-start", label: "Unsure where to start", icon: "❓" },
  { id: "other", label: "Other reason", icon: "💡" },
];
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
  const [searchParams, setSearchParams] = useSearchParams();
  const draftIdParam = searchParams.get("draftId");

  const [drafts, setDrafts] = useState(getRepairDrafts);
  const [selectedId, setSelectedId] = useState(null);
  const [draftOverride, setDraftOverride] = useState(null);
  const [error, setError] = useState("");

  const activeId =
    draftIdParam && drafts.some((d) => d.id === draftIdParam)
      ? draftIdParam
      : selectedId && drafts.some((d) => d.id === selectedId)
        ? selectedId
        : drafts[0]?.id || null;

  const draft =
    draftOverride && draftOverride.id === activeId
      ? draftOverride
      : activeId
        ? getRepairDraft(activeId)
        : null;

  const q = draft?.problem;

  useStudyActivity({
    moduleTitle: "Repair session",
    question: draft?.stage === "review" ? draft?.source?.question : q?.question,
    submittedAnswer: draft?.checked ? draft.input : null,
    feedback: draft?.checked ? q?.explanation : null,
  });

  function switchDraft(id) {
    setSelectedId(id);
    setDraftOverride(null);
    setSearchParams({ draftId: id });
    setError("");
  }

  function dismissDraft(id) {
    removeRepairDraft(id);
    const remaining = getRepairDrafts();
    setDrafts(remaining);
    setDraftOverride(null);
    const next = remaining[0] || null;
    setSelectedId(next?.id || null);
    if (next) {
      setSearchParams({ draftId: next.id });
    } else {
      setSearchParams({});
    }
  }

  function persist(next) {
    try {
      setRepairDraft(next);
      setDraftOverride(next);
      setDrafts(getRepairDrafts());
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
      subskill: draft.subskill,
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
        // Remove completed draft from pending drafts so it won't linger
        removeRepairDraft(draft.id);
        const remaining = getRepairDrafts();
        setDrafts(remaining);
        persist({
          ...draft,
          checked: true,
          showSolution: true,
          showHint: false,
          attemptsOnCurrent: attemptsCount,
          completed: true,
          attempt,
        });
      } else {
        persist({
          ...draft,
          checked: true,
          showSolution: false,
          showHint: true,
          attemptsOnCurrent: attemptsCount,
          initialAnswer,
          attempt,
        });
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

  function handleSelectReflectiveCause(causeId) {
    if (!draft?.attempt) return;
    const updatedAttempt = { ...draft.attempt, reflectiveCause: causeId };
    updateAttemptReflectiveCause(draft.attempt.id, causeId);
    persist({ ...draft, attempt: updatedAttempt });
  }

  if (!draft)
    return (
      <div className="study-page">
        <p className="eyebrow">Targeted mastery recovery</p>
        <h1>Repair a skill</h1>
        <p>You have no active repair tasks in progress. Choose a missed problem from session review to begin.</p>
        <div className="study-actions">
          <Link className="study-button" to="/review">
            Open session history
          </Link>
          <Link className="study-text-button" to="/rulebook">
            Browse rulebook
          </Link>
        </div>
      </div>
    );

  const remainingDrafts = drafts.filter((d) => d.id !== draft.id);

  return (
    <div className="study-page">
      <p className="eyebrow">A little support, then a fresh start</p>
      <h1>Repair a skill</h1>
      <p className="study-intro">
        Your original attempt stays in your record. This follow-up adds new
        evidence.
      </p>

      {/* Multiple repair drafts switcher */}
      {drafts.length > 1 && (
        <section className="repair-draft-selector" aria-label="Pending repairs">
          <div className="repair-selector-header">
            <span className="repair-selector-title">Pending Repairs ({drafts.length})</span>
            <span className="study-muted text-xs">Switch between active drafts</span>
          </div>
          <div className="repair-pills-row">
            {drafts.map((d, idx) => {
              const isActive = d.id === draft.id;
              const title = d.subskill
                ? d.subskill.replace(/-/g, " ")
                : d.problem?.conceptId || d.problem?.moduleId || `Task ${idx + 1}`;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => switchDraft(d.id)}
                  className={`repair-pill ${isActive ? "active" : ""}`}
                >
                  <span className="pill-index">{idx + 1}.</span>
                  <span className="pill-title">{title}</span>
                  {isActive && <span className="pill-badge">Active</span>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {error && (
        <p className="study-notice" role="alert">
          {error}
        </p>
      )}

      {draft.stage === "review" ? (
        <section className="study-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <h2>Start with your original problem</h2>
            <button
              type="button"
              className="study-text-button"
              style={{ fontSize: 13, color: "var(--ink-2)" }}
              onClick={() => dismissDraft(draft.id)}
              title="Discard this repair task"
            >
              Dismiss task
            </button>
          </div>
          <MathBlock content={draft.source.question} />
          <p>
            Your answer:{" "}
            <strong>{String(draft.source.submittedAnswer ?? "Not answered")}</strong>
          </p>
          <p>Expected: <strong>{draft.source.expectedAnswer ?? "Not recorded"}</strong></p>
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
            Next you’ll get a different problem testing this exact subskill.
          </p>
          <div className="study-actions">
            <button
              className="study-button"
              onClick={() => persist({ ...draft, stage: "practice" })}
            >
              Try a fresh problem
            </button>
            <Link
              className="study-text-button"
              to={`/rulebook?from=repair&activeId=${encodeURIComponent(draft.id)}${
                draft.rulebookId ? `&ruleId=${encodeURIComponent(draft.rulebookId)}` : ""
              }`}
            >
              Consult rulebook entry
            </Link>
          </div>
        </section>
      ) : (
        <section className="study-card problem-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p className="eyebrow" style={{ margin: 0 }}>Fresh follow-up · Paper welcome</p>
            {draft.subskill && (
              <span className="study-badge neutral" style={{ textTransform: "capitalize" }}>
                {draft.subskill.replace(/-/g, " ")}
              </span>
            )}
          </div>

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
                  to={`/rulebook?from=repair&activeId=${encodeURIComponent(draft.id)}${
                    draft.rulebookId ? `&ruleId=${encodeURIComponent(draft.rulebookId)}` : ""
                  }`}
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
                    The original mistake remains preserved in your record for diagnostic clarity.
                  </p>
                  <div className="study-actions" style={{ marginTop: 16 }}>
                    {remainingDrafts.length > 0 ? (
                      <button
                        type="button"
                        className="study-button"
                        onClick={() => switchDraft(remainingDrafts[0].id)}
                      >
                        Continue to next repair ({remainingDrafts.length} remaining) →
                      </button>
                    ) : (
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
                    )}
                    <Link className="study-text-button" to="/">
                      Return to Today
                    </Link>
                  </div>
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

                  <div className="reflective-cause-container">
                    <span className="reflective-label">What happened here? (Optional · Diagnostic only)</span>
                    <div className="reflective-pill-row">
                      {REFLECTIVE_OPTIONS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`reflective-pill ${draft.attempt?.reflectiveCause === c.id ? "active" : ""}`}
                          onClick={() => handleSelectReflectiveCause(c.id)}
                        >
                          <span>{c.icon}</span> {c.label}
                        </button>
                      ))}
                    </div>
                    {draft.attempt?.reflectiveCause && (
                      <p className="study-muted text-xs" style={{ marginTop: 6, color: "var(--accent)" }}>
                        ✓ Recorded: {REFLECTIVE_OPTIONS.find((c) => c.id === draft.attempt.reflectiveCause)?.label}
                      </p>
                    )}
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
                      to={`/rulebook?from=repair&activeId=${encodeURIComponent(draft.id)}${
                        draft.rulebookId ? `&ruleId=${encodeURIComponent(draft.rulebookId)}` : ""
                      }`}
                    >
                      Consult rulebook
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

                  <div className="reflective-cause-container">
                    <span className="reflective-label">What happened here? (Optional · Diagnostic only)</span>
                    <div className="reflective-pill-row">
                      {REFLECTIVE_OPTIONS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`reflective-pill ${draft.attempt?.reflectiveCause === c.id ? "active" : ""}`}
                          onClick={() => handleSelectReflectiveCause(c.id)}
                        >
                          <span>{c.icon}</span> {c.label}
                        </button>
                      ))}
                    </div>
                    {draft.attempt?.reflectiveCause && (
                      <p className="study-muted text-xs" style={{ marginTop: 6, color: "var(--accent)" }}>
                        ✓ Recorded: {REFLECTIVE_OPTIONS.find((c) => c.id === draft.attempt.reflectiveCause)?.label}
                      </p>
                    )}
                  </div>

                  <h3>Why the method works</h3>
                  <MathBlock content={q.explanation} />
                  <p className="study-muted">
                    Recorded with support. You can revisit this topic anytime.
                  </p>
                  <div className="study-actions" style={{ marginTop: 16 }}>
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
                    <button
                      type="button"
                      className="study-text-button"
                      onClick={() => dismissDraft(draft.id)}
                    >
                      Dismiss repair
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}

      <div style={{ marginTop: 24 }}>
        <Link className="study-text-button" to="/">
          ← Return to Today
        </Link>
      </div>
    </div>
  );
}
