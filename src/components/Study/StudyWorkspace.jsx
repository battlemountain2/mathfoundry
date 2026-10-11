import { useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getMathUnit } from "../../data/courses/mathFoundations";
import { getGeometryUnit } from "../../data/courses/geometryFoundations";
import {
  getStudySession,
  commitStudySession,
  setModuleProgress,
  saveUnitQuizResult,
} from "../../utils/storage";
import {
  createStudySession,
  submitStudyAnswer,
  advanceStudySession,
  studyReviewAnswers,
  studySummary,
  studyTimestamp,
} from "../../utils/studySession";
import {
  numericValue,
  choiceIndex,
  analyzeIntermediateStep,
} from "../../utils/answerChecking";
import { getProblemHint } from "../../utils/hints";
import { useStudyActivity } from "../../hooks/useStudyActivity";
import SessionReview from "./SessionReview";
import ProblemFigure from "./ProblemFigure";
import ConceptGuide from "./ConceptGuide";
import {
  enrichStudyProblem,
  makeTeachingExample,
} from "../../utils/studyTeaching";
import { resolveStudyUnit } from "../../utils/studyNavigation";
import MathBlock from "../Lesson/MathBlock";

export default function StudyWorkspace({
  mode = "practice",
  initialSupport = null,
}) {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();
  const unit =
    courseId === "geometry" ? getGeometryUnit(unitId) : getMathUnit(unitId);
  const key = `${courseId}/${unitId}:${mode}`;
  const [initialSaved] = useState(() => getStudySession(key));
  const savedRef = useRef(initialSaved);
  const [session, setSession] = useState(() => {
    const saved = initialSaved;
    if (initialSupport !== "learn" || !saved) return saved;
    if (saved.completed) return null;
    return {
      ...saved,
      help: "learn",
      assisted: true,
      helpEvents: [
        ...(saved.helpEvents || []),
        {
          kind: "learn",
          problemIndex: saved.index,
          timestamp: studyTimestamp(),
        },
      ],
    };
  });
  const stateRef = useRef(session);
  const [error, setError] = useState("");
  const [panelWidth, setPanelWidth] = useState(38);
  const q = enrichStudyProblem(session?.questions[session.index]);
  const activeUnit = resolveStudyUnit(q || {}) || unit;
  const example = q && activeUnit ? makeTeachingExample(activeUnit, q) : null;
  const supportingExample =
    session?.help === "example" ||
    (session?.help === "learn" && session.guideStep > 0);
  const last = session?.answers
    .filter((a) => a.problemInstanceId === `${session.id}:${session.index}`)
    .at(-1);
  useStudyActivity({
    moduleTitle: unit?.title,
    conceptId: q?.conceptId,
    question: supportingExample ? example?.question : q?.question,
    submittedAnswer: supportingExample ? null : last?.submittedAnswer,
    feedback: supportingExample
      ? example?.explanation
      : session?.help === "solution" || last?.isCorrect
        ? q?.explanation
        : null,
  });
  const supported =
    unit &&
    (mode === "application"
      ? courseId === "math" && unit.legacyConceptId === "addition"
      : unit.hasPractice && (mode !== "quiz" || unit.hasQuiz));
  function persist(next) {
    next = { ...next, updatedAt: studyTimestamp() };
    try {
      commitStudySession(key, next, { expectedSession: savedRef.current });
      savedRef.current = next;
      stateRef.current = next;
      setSession(next);
      setError("");
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }
  function start(support = null) {
    const fresh = createStudySession(unit, mode);
    if (support) {
      fresh.help = support;
      fresh.assisted = true;
      fresh.guideStep = 0;
      fresh.helpEvents = [
        { kind: support, problemIndex: 0, timestamp: studyTimestamp() },
      ];
    }
    persist(fresh);
  }
  function help(kind) {
    const active = stateRef.current;
    persist({
      ...active,
      help: kind,
      ...(kind === "learn" ? { guideStep: 0 } : {}),
      assisted: true,
      helpEvents: [
        ...(active.helpEvents || []),
        { kind, problemIndex: active.index, timestamp: studyTimestamp() },
      ],
    });
  }
  function check(skipped = false) {
    const current = stateRef.current;
    if (current.checked) return;
    if (
      !skipped &&
      (q.options
        ? choiceIndex(current.input, q.options) === null
        : numericValue(current.input) === null)
    ) {
      setError(
        q.options
          ? "Choose an answer before checking. Your attempt has not been graded."
          : "Enter a number or a fraction, such as 5/12. Your attempt has not been graded.",
      );
      return;
    }
    const next = submitStudyAnswer(
      current,
      current.input,
      current.step,
      skipped,
    );
    const stepAnalysis = analyzeIntermediateStep(q, current.step);
    if (stepAnalysis)
      next.answers[next.answers.length - 1].stepAnalysis = stepAnalysis;
    persist(next);
  }
  function next() {
    const nextSession = advanceStudySession(stateRef.current);
    if (persist(nextSession) && nextSession.completed && mode === "quiz") {
      const summary = studySummary(nextSession);
      const quizPassed =
        summary.independent / nextSession.questions.length >= 0.75;
      try {
        setModuleProgress(unit.unitPath, {
          quizPassed,
          quizScore: summary.independent / nextSession.questions.length,
          lastUpdated: studyTimestamp(),
        });
        saveUnitQuizResult(unit.unitPath, {
          passed: quizPassed,
          score: (summary.independent / nextSession.questions.length) * 100,
          sessionId: nextSession.id,
        });
      } catch (e) {
        setError(e.message);
      }
    }
  }
  if (!unit || !supported)
    return (
      <div className="study-page">
        <p className="eyebrow">Content in preparation</p>
        <h1>This activity is not ready yet.</h1>
        <p>
          Explore available lessons and labs while practice is being authored.
        </p>
        <Link to={`/courses/${courseId}`} className="study-button secondary">
          Back to course
        </Link>
      </div>
    );
  const summary = session ? studySummary(session) : null;
  return (
    <div className="v3-workspace" style={{ "--help-width": `${panelWidth}%` }}>
      <nav className="v3-breadcrumb">
        <Link to="/">Today</Link>
        <span>/</span>
        <Link to={`/courses/${courseId}/${unitId}`}>{unit.title}</Link>
        <span>/</span>
        <span>
          {mode === "quiz"
            ? "Unit check"
            : mode === "application"
              ? "Engineering connection"
              : "Study session"}
        </span>
      </nav>
      {error && (
        <p className="study-notice" role="alert">
          {error}
        </p>
      )}
      {!session ? (
        <section className="v3-start">
          <p className="eyebrow">Your paper. Your pace.</p>
          <h1>
            {mode === "application"
              ? "Build with measured pieces."
              : `Let’s work on ${unit.title.toLowerCase()}.`}
          </h1>
          <p className="study-intro">
            {mode === "quiz"
              ? "Four fresh questions, with feedback after each. Your first answers stay separate from helped retries."
              : "Try a short block first. Bring an example or a visual into the workspace whenever you need it."}
          </p>
          <div className="study-actions">
            <button className="study-button" onClick={() => start()}>
              {mode === "quiz"
                ? "Start unit check"
                : mode === "application"
                  ? "Try two applied problems"
                  : "Let me try first"}
            </button>
            {mode === "practice" && (
              <button
                className="study-button secondary"
                onClick={() => start("learn")}
              >
                {initialSupport === "learn"
                  ? "Begin the guided introduction"
                  : "Start with an explanation"}
              </button>
            )}
          </div>
          {mode === "application" && (
            <p className="study-muted">
              Useful preparation:{" "}
              <Link to="/courses/math/equivalent-fractions">
                equivalent fractions
              </Link>
              ,{" "}
              <Link to="/courses/math/add-subtract-fractions">
                adding fractions
              </Link>
              , and{" "}
              <Link to="/courses/math/multiply-fractions">
                multiplying fractions
              </Link>
              . Two small applications; open an example whenever you need it.
            </p>
          )}
          <p className="study-muted">
            Untimed · Paper welcome · Saves as you go
          </p>
        </section>
      ) : session.completed ? (
        <>
          <header className="v3-session-end">
            <p className="eyebrow">A useful stopping point</p>
            <h1>Your work, understood.</h1>
            <p className="study-intro">
              {summary.applied} independent applications · {summary.recognized}{" "}
              independently recognized methods ·{" "}
              {summary.correct - summary.independent} supported first answers ·{" "}
              {summary.recovered} recovered after retry
            </p>
            <div className="study-actions">
              <button className="study-button" onClick={() => start()}>
                Try a fresh block
              </button>
              <Link className="study-button secondary" to="/recall">
                Refresh the rules
              </Link>
              <Link className="study-text-button" to="/">
                Back to your desk
              </Link>
            </div>
            <p className="study-muted">
              This block records what happened today. Later independent recall
              is a separate check.
            </p>
          </header>
          <SessionReview
            key={session.id}
            answers={studyReviewAnswers(session)}
            sessionId={session.id}
          />
        </>
      ) : (
        <>
          <header className="v3-session-heading">
            <div>
              <p className="eyebrow">
                {mode === "quiz"
                  ? "Unit check · Feedback each question"
                  : mode === "application"
                    ? "Engineering connection · Keep the units"
                    : "Study session · Paper welcome"}
              </p>
              <h1>{mode === "application" ? "Measured pieces" : unit.title}</h1>
            </div>
            <span className="v3-count">
              {session.index + 1} / {session.questions.length}
            </span>
          </header>
          <div
            className="v3-progress"
            aria-label={`Question ${session.index + 1} of ${session.questions.length}`}
          >
            {session.questions.map((_, i) => (
              <span key={i} className={i <= session.index ? "filled" : ""} />
            ))}
          </div>
          <div
            className={`v3-work-area ${session.help && session.help !== "learn" ? "with-help" : ""}`}
          >
            {session.help === "learn" ? (
              <section className="v3-problem-canvas v3-guided-canvas">
                <ConceptGuide
                  unit={activeUnit}
                  returnLabel={
                    mode === "quiz"
                      ? "Return to your unit check"
                      : mode === "application"
                        ? "Return to the applied problem"
                        : "Try the practice problem"
                  }
                  problem={q}
                  step={session.guideStep || 0}
                  onStep={(step) =>
                    persist({ ...stateRef.current, guideStep: step })
                  }
                  onPractice={() => {
                    if (
                      persist({ ...stateRef.current, help: null }) &&
                      initialSupport === "learn"
                    )
                      navigate(`/courses/${courseId}/${unitId}/practice`, {
                        replace: true,
                      });
                  }}
                />
              </section>
            ) : (
              <>
                <section className="v3-problem-canvas">
                  <p className="eyebrow">
                    {q.options ? "Choose a method" : "Work it through"}
                  </p>
                  <div className="v3-question">
                    <MathBlock content={q.question} />
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      check();
                    }}
                  >
                    {q.options ? (
                      <fieldset
                        className="v3-answer-options"
                        disabled={session.checked}
                      >
                        <legend className="sr-only">Choose your answer</legend>
                        {q.options.map((option, i) => (
                          <label
                            className={`v3-choice ${session.input === String(i) ? "selected" : ""}`}
                            key={option}
                          >
                            <input
                              type="radio"
                              name="answer"
                              value={i}
                              checked={session.input === String(i)}
                              onChange={() =>
                                persist({
                                  ...stateRef.current,
                                  input: String(i),
                                })
                              }
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </fieldset>
                    ) : (
                      <label className="v3-answer-label">
                        Your answer
                        <input
                          className="study-answer"
                          aria-label="Your answer"
                          inputMode="text"
                          autoComplete="off"
                          value={session.input}
                          disabled={session.checked}
                          onChange={(e) =>
                            persist({
                              ...stateRef.current,
                              input: e.target.value,
                            })
                          }
                          placeholder="e.g. 5/12"
                        />
                      </label>
                    )}
                    {q.conceptId === "addition" && !q.options && (
                      <details className="v3-step">
                        <summary>
                          Add one step from your paper (optional)
                        </summary>
                        <label>
                          Common denominator or a step
                          <input
                            aria-label="Intermediate step"
                            disabled={session.checked}
                            value={session.step}
                            onChange={(e) =>
                              persist({
                                ...stateRef.current,
                                step: e.target.value,
                              })
                            }
                          />
                        </label>
                      </details>
                    )}
                    {!session.checked && (
                      <div className="study-actions">
                        <button
                          className="study-button"
                          type="submit"
                          disabled={session.input === ""}
                        >
                          Check answer
                        </button>
                        <button
                          className="study-text-button"
                          type="button"
                          onClick={() => check(true)}
                        >
                          Skip for now
                        </button>
                      </div>
                    )}
                  </form>
                  {session.checked && (
                    <div
                      className={`v3-feedback ${last?.isCorrect ? "correct" : "incorrect"}`}
                      role="status"
                    >
                      <strong>
                        {last?.skipped
                          ? "Saved for another look"
                          : last?.isCorrect
                            ? last.assisted
                              ? "Correct with support"
                              : "Correct independently"
                            : "Not quite yet"}
                      </strong>
                      {last?.isCorrect ? (
                        <MathBlock content={q.explanation} />
                      ) : (
                        <p>
                          {last?.skipped
                            ? "You can revisit this question in the block review."
                            : "Your first answer is kept. Try the hint, or choose a walkthrough."}
                        </p>
                      )}
                      <div className="study-actions">
                        {!last?.isCorrect && !last?.skipped && (
                          <button
                            className="study-button secondary"
                            onClick={() =>
                              persist({
                                ...stateRef.current,
                                checked: false,
                                help: "hint",
                                assisted: true,
                              })
                            }
                          >
                            Try again
                          </button>
                        )}
                        <button className="study-button" onClick={next}>
                          {session.index + 1 === session.questions.length
                            ? "Review this block"
                            : "Continue"}
                        </button>
                      </div>
                    </div>
                  )}
                  <div
                    className="v3-support-tools"
                    role="group"
                    aria-label="Learning support"
                  >
                    <button onClick={() => help("hint")}>One hint</button>
                    <button onClick={() => help("solution")}>
                      Walk me through it
                    </button>
                    {example && (
                      <button onClick={() => help("example")}>
                        Show a worked example
                      </button>
                    )}
                    <button onClick={() => help("learn")}>
                      Understand this idea
                    </button>
                    {q.visual && (
                      <button onClick={() => help("visual")}>
                        Show visually
                      </button>
                    )}
                    <Link to={`/courses/${courseId}/${unitId}`}>
                      Explore this unit
                    </Link>
                  </div>
                </section>
                {session.help && (
                  <aside
                    className="v3-context-panel"
                    aria-label="Learning support"
                  >
                    <div className="v3-panel-header">
                      <span className="eyebrow">
                        {session.help === "hint"
                          ? "One hint"
                          : session.help === "visual"
                            ? "See the relationship"
                            : "Worked explanation"}
                      </span>
                      <button
                        aria-label="Close learning support"
                        onClick={() =>
                          persist({ ...stateRef.current, help: null })
                        }
                      >
                        Close
                      </button>
                    </div>
                    <label className="v3-panel-resize">
                      Panel width
                      <input
                        aria-label="Explanation panel width"
                        type="range"
                        min="30"
                        max="48"
                        value={panelWidth}
                        onChange={(e) => setPanelWidth(Number(e.target.value))}
                      />
                    </label>
                    {session.help === "hint" ? (
                      <>
                        <h2>A place to start.</h2>
                        <p>{getProblemHint(q)}</p>
                        <button
                          className="study-button secondary"
                          onClick={() => help("solution")}
                        >
                          Walk me through it
                        </button>
                      </>
                    ) : session.help === "example" ? (
                      <>
                        <h2>A different problem. The same idea.</h2>
                        <MathBlock content={example?.question} />
                        {example?.visual && (
                          <ProblemFigure key={example.id} problem={example} />
                        )}
                        <ol className="v3-worked-steps">
                          {example?.steps.map((s, i) => (
                            <li key={i}>
                              <MathBlock content={s} />
                            </li>
                          ))}
                        </ol>
                      </>
                    ) : session.help === "visual" ? (
                      <ProblemFigure key={q.id} problem={q} />
                    ) : (
                      <>
                        <h2>One step at a time.</h2>
                        <ol className="v3-worked-steps">
                          {(q.steps || [q.explanation]).map((s) => (
                            <li key={s}>
                              <MathBlock content={s} />
                            </li>
                          ))}
                        </ol>
                        {q.example && (
                          <details>
                            <summary>See another worked example</summary>
                            <MathBlock content={q.example.question} />
                            <ol>
                              {q.example.steps.map((s) => (
                                <li key={s}>
                                  <MathBlock content={s} />
                                </li>
                              ))}
                            </ol>
                          </details>
                        )}
                        <Link className="study-text-button" to="/rulebook">
                          Open your rulebook
                        </Link>
                      </>
                    )}
                  </aside>
                )}
              </>
            )}
          </div>
          <p className="v3-save-note">
            Saved on this device. You can leave and resume from Today.
          </p>
        </>
      )}
    </div>
  );
}
