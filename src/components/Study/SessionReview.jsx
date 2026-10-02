import { useState } from "react";
import { Link } from "react-router-dom";
import MathBlock from "../Lesson/MathBlock";
import { saveRulebookEntry, setRepairDraft } from "../../utils/storage";
import { useStudyActivity } from "./ActivityContext";
import { makeRepairDraft } from "../../utils/repair";

export default function SessionReview({
  answers = [],
  title = "Review this session",
}) {
  const [selected, setSelected] = useState(null);
  useStudyActivity({
    moduleTitle: "Session review",
    question: selected?.question,
    submittedAnswer: selected?.submittedAnswer,
    feedback: selected?.explanation,
    moduleId: selected?.moduleId,
    conceptId: selected?.conceptId,
  });
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [repairReady, setRepairReady] = useState(null);
  const shown = answers.filter(
    (a) =>
      filter === "all" ||
      (filter === "revisit"
        ? !a.isCorrect || a.skipped
        : filter === "supported"
          ? a.assisted
          : a.isCorrect),
  );
  function save(a) {
    try {
      saveRulebookEntry({
        id: `rule:${a.conceptId || a.moduleId || "general"}:${a.question}`,
        title: a.question,
        conceptId: a.conceptId,
        moduleId: a.moduleId,
        explanation: a.explanation,
        example: a.problem?.example,
      });
      setNotice("Saved to your personal rulebook.");
    } catch (error) {
      setNotice(error.message);
    }
  }
  function repair(a) {
    try {
      const draft = makeRepairDraft(a, answers);
      if (!draft) {
        setNotice(
          "A fresh repair problem is not authored for this topic yet. Use the lesson link to review its examples.",
        );
        return;
      }
      setRepairDraft(draft);
      setRepairReady(a.id || a.questionId || a.question);
      setNotice("Your repair session is ready.");
    } catch (error) {
      setNotice(error.message);
    }
  }
  return (
    <section className="study-card session-review">
      <p className="eyebrow">Keep learning from your work</p>
      <h2>{title}</h2>
      <p className="study-muted">
        {answers.filter((a) => a.isCorrect && !a.skipped).length} correct ·{" "}
        {answers.filter((a) => !a.isCorrect && !a.skipped).length} incorrect ·{" "}
        {answers.filter((a) => a.skipped).length} skipped.{" "}
        {answers.filter((a) => a.assisted).length} attempts used support.
      </p>
      <div
        className="review-filters"
        role="group"
        aria-label="Filter session questions"
      >
        {[
          ["all", "All questions"],
          ["revisit", "Incorrect & skipped"],
          ["supported", "With support"],
          ["correct", "Correct"],
        ].map(([value, label]) => (
          <button
            className="study-button secondary"
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {notice && (
        <p role="status" className="study-notice">
          {notice}{" "}
          {notice.startsWith("Saved") && (
            <Link to="/rulebook">Open rulebook</Link>
          )}
        </p>
      )}
      {!shown.length && <p>No questions in this group.</p>}
      {shown.map((a, index) => (
        <details
          onToggle={(e) => {
            if (e.currentTarget.open) setSelected(a);
          }}
          className="work-record"
          key={a.id || a.questionId || index}
        >
          <summary>
            <span className="study-badge">
              {a.skipped ? "Skipped" : a.isCorrect ? "Correct" : "Revisit"}
              {a.assisted ? " · Supported" : ""}
            </span>
            <MathBlock content={a.question || "Earlier problem"} />
          </summary>
          {a.problem?.options && (
            <ol className="review-options">
              {a.problem.options.map((option, i) => (
                <li key={i}>
                  <MathBlock content={option} />
                </li>
              ))}
            </ol>
          )}
          {a.problem?.reasonOptions && (
            <ol className="review-options">
              {a.problem.reasonOptions.map((reason, i) => (
                <li key={i}>
                  <MathBlock content={reason} />
                </li>
              ))}
            </ol>
          )}
          {a.problem?.format === "visual" && (
            <div className="fraction-lab">
              <p>
                Original amount: {a.problem.numerator}/
                {a.problem.sourceDenominator}
              </p>
              <div
                className="fraction-strip"
                aria-label={`Original fraction ${a.problem.numerator} over ${a.problem.sourceDenominator}`}
                style={{
                  gridTemplateColumns: `repeat(${a.problem.sourceDenominator},1fr)`,
                }}
              >
                {Array.from({ length: a.problem.sourceDenominator }, (_, i) => (
                  <span
                    key={i}
                    className={i < a.problem.numerator ? "filled" : ""}
                  />
                ))}
              </div>
            </div>
          )}
          {a.problem?.steps && (
            <ol className="review-options">
              {a.problem.steps.map((step, i) => (
                <li key={i}>
                  <MathBlock content={step} />
                </li>
              ))}
            </ol>
          )}
          <div className="review-answer">
            <strong>Your answer</strong>
            <MathBlock
              content={
                a.submittedAnswer == null
                  ? "Not answered"
                  : typeof a.submittedAnswer === "object"
                    ? JSON.stringify(a.submittedAnswer)
                    : String(a.submittedAnswer)
              }
            />
          </div>
          <div className="review-answer">
            <strong>Expected answer</strong>
            <MathBlock
              content={String(
                a.expectedAnswer ?? "Not recorded in this older session",
              )}
            />
          </div>
          <h3>Solution & explanation</h3>
          <MathBlock
            content={
              a.explanation || "This earlier record did not retain a solution."
            }
          />
          {a.problem?.example && (
            <div className="worked-example">
              <h3>A different worked example</h3>
              <p>{a.problem.example.question}</p>
              <ol>
                {a.problem.example.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
          <div className="study-actions">
            {a.explanation && (
              <button
                className="study-button secondary"
                onClick={() => save(a)}
              >
                Save to rulebook
              </button>
            )}
            <button className="study-button" onClick={() => repair(a)}>
              Prepare a repair session
            </button>
            {repairReady === (a.id || a.questionId || a.question) && (
              <Link className="study-button" to="/repair">
                Start repair
              </Link>
            )}
            {a.moduleId && (
              <Link className="study-text-button" to={`/module/${a.moduleId}`}>
                Review lesson examples
              </Link>
            )}
          </div>
        </details>
      ))}
    </section>
  );
}
