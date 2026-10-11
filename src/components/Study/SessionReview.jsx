import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MathBlock from "../Lesson/MathBlock";
import {
  saveRulebookEntry,
  setRepairDraft,
  updateAttemptReflectiveCause,
  getCompletedRepairs,
} from "../../utils/storage";
import { useStudyActivity } from "../../hooks/useStudyActivity";
import { makeRepairDraft } from "../../utils/repair";
import ProblemFigure from "./ProblemFigure";
import { studyTopicLink } from "../../utils/studyNavigation";
import { enrichStudyProblem } from "../../utils/studyTeaching";

const REFLECTIVE_OPTIONS = [
  { id: "calc-slip", label: "Calculation slip", icon: "🧮" },
  { id: "rule-confused", label: "Confused rule", icon: "📖" },
  { id: "misread", label: "Misread numbers", icon: "👁️" },
  { id: "unsure-start", label: "Unsure where to start", icon: "❓" },
  { id: "other", label: "Other", icon: "💡" },
];

export default function SessionReview({
  answers = [],
  title = "Review this session",
  sessionId = null,
  highlightAttemptId = null,
}) {
  const navigate = useNavigate();
  const completedRepairs = getCompletedRepairs();
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
  const [sortOrder, setSortOrder] = useState("missed-first");
  const [notice, setNotice] = useState("");
  const [reportedReasons, setReportedReasons] = useState({});

  const incorrectCount = answers.filter(
    (a) => !a.isCorrect && !a.skipped,
  ).length;
  const skippedCount = answers.filter((a) => a.skipped).length;
  const correctCount = answers.filter((a) => a.isCorrect && !a.skipped).length;
  const usedSupport = (a) => a.assisted || a.retries?.some((r) => r.assisted);
  const assistedCount = answers.filter(usedSupport).length;
  const allCorrect =
    answers.length > 0 && incorrectCount === 0 && skippedCount === 0;

  // Filter questions
  const filtered = answers.filter((a) => {
    if (filter === "revisit") return !a.isCorrect || a.skipped;
    if (filter === "supported") return usedSupport(a);
    if (filter === "correct") return a.isCorrect && !a.skipped;
    return true;
  });

  // Sort questions: missed-first by default if misses exist, or original order
  const shown = [...filtered].sort((a, b) => {
    if (sortOrder === "missed-first") {
      const aMissed = !a.isCorrect || a.skipped ? 1 : 0;
      const bMissed = !b.isCorrect || b.skipped ? 1 : 0;
      if (aMissed !== bMissed) return bMissed - aMissed;
    }
    return 0; // preserve original order
  });

  // Find index of first item to expand by default (first missed item, or first item)
  const firstMissedId =
    shown.find((a) => a.id === highlightAttemptId)?.id ||
    shown.find((a) => !a.isCorrect || a.skipped)?.id ||
    shown[0]?.id;

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
      navigate(`/repair?draftId=${encodeURIComponent(draft.id)}`);
    } catch (error) {
      setNotice(error.message);
    }
  }

  function getBadge(a) {
    if (a.skipped) {
      return <span className="study-badge skipped">— Skipped</span>;
    }
    if (!a.isCorrect) {
      return (
        <span className="study-badge incorrect">
          ✗ Incorrect{a.eventualCorrect && " · Recovered with support"}
        </span>
      );
    }
    if (a.assisted) {
      return <span className="study-badge supported">✓ Correct · Helped</span>;
    }
    if (a.isCorrect) {
      return <span className="study-badge correct">✓ Correct</span>;
    }
    return <span className="study-badge legacy">Earlier record</span>;
  }

  function getQuickCompare(a) {
    const isLegacy =
      a.submittedAnswer === undefined && a.expectedAnswer === undefined;
    if (isLegacy) {
      return (
        <span className="summary-quick-compare legacy">
          Score recorded · individual steps not retained
        </span>
      );
    }
    if (a.skipped) {
      return (
        <span className="summary-quick-compare skipped">
          Skipped · Expected: <strong>{String(a.expectedAnswer ?? "—")}</strong>
        </span>
      );
    }
    if (!a.isCorrect) {
      return (
        <span className="summary-quick-compare error">
          Your answer: <strong>{String(a.submittedAnswer ?? "None")}</strong> ·
          Expected: <strong>{String(a.expectedAnswer ?? "—")}</strong>
        </span>
      );
    }
    return (
      <span className="summary-quick-compare correct">
        Answer: <strong>{String(a.submittedAnswer ?? "—")}</strong>
        {a.assisted ? " (with support)" : ""}
      </span>
    );
  }

  return (
    <section className="study-card session-review">
      <p className="eyebrow">Keep learning from your work</p>
      <h2>{title}</h2>

      {allCorrect ? (
        <div className="all-correct-card" role="status">
          <h3>✓ Complete accuracy across all {answers.length} problems</h3>
          <p>
            You answered every problem in this session correctly without skips.
            This records today’s performance. Helped answers and later
            independent recall remain separate.
          </p>
        </div>
      ) : (
        <p className="study-muted">
          {correctCount} correct · {incorrectCount} incorrect · {skippedCount}{" "}
          skipped.{" "}
          {assistedCount > 0 && `${assistedCount} questions used support.`}
        </p>
      )}

      {sessionId && (
        <p
          className="study-muted"
          style={{ fontSize: "12px", marginTop: "-10px" }}
        >
          Source session:{" "}
          <Link to={`/review?session=${encodeURIComponent(sessionId)}`}>
            Open this block in your history
          </Link>
        </p>
      )}

      <div className="review-controls-bar">
        <div
          className="review-filters"
          role="group"
          aria-label="Filter session questions"
        >
          {[
            ["all", "All questions"],
            [
              "revisit",
              `Incorrect & skipped (${incorrectCount + skippedCount})`,
            ],
            ["supported", `With support (${assistedCount})`],
            ["correct", `Correct (${correctCount})`],
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

        {incorrectCount + skippedCount > 0 && (
          <div
            className="review-sort"
            role="group"
            aria-label="Sort session questions"
          >
            <button
              className="study-button secondary"
              style={{ fontSize: "11px", padding: "6px 10px" }}
              aria-pressed={sortOrder === "missed-first"}
              onClick={() =>
                setSortOrder(
                  sortOrder === "missed-first" ? "original" : "missed-first",
                )
              }
            >
              {sortOrder === "missed-first"
                ? "Showing misses first"
                : "Showing original order"}
            </button>
          </div>
        )}
      </div>

      {notice && (
        <p role="status" className="study-notice">
          {notice}{" "}
          {notice.startsWith("Saved") && (
            <Link to="/rulebook">Open rulebook</Link>
          )}
        </p>
      )}

      {!shown.length && (
        <p className="study-muted">No questions in this filter.</p>
      )}

      {shown.map((record, index) => {
        const a = {
          ...record,
          problem: enrichStudyProblem(record.problem),
          reflectiveCause: reportedReasons[record.id] || record.reflectiveCause,
        };
        const topicLink = studyTopicLink(a, "lesson");
        const itemId = a.id || a.questionId || `q-${index}`;
        const isMissed = !a.isCorrect || a.skipped;
        const defaultExpanded = itemId === firstMissedId;

        return (
          <details
            open={defaultExpanded}
            onToggle={(e) => {
              if (e.currentTarget.open) setSelected(a);
            }}
            className={`work-record ${isMissed ? "record-missed" : ""}`}
            key={itemId}
          >
            <summary>
              <div className="summary-meta-line">
                <div>
                  {getBadge(a)}
                  {a.evidenceType === "recognition" && (
                    <span className="study-muted"> · Method recognition</span>
                  )}
                </div>
                <div>{getQuickCompare(a)}</div>
              </div>
              <div style={{ marginTop: "4px" }}>
                <MathBlock content={a.question || "Earlier problem"} />
              </div>
            </summary>

            {/* Answer Comparison Box */}
            <div className="answer-comparison-box">
              <div
                className={`comparison-col your-answer ${
                  !a.isCorrect && !a.skipped
                    ? "is-wrong"
                    : a.isCorrect
                      ? "is-correct"
                      : ""
                }`}
              >
                <span className="comparison-label">
                  Your Answer{" "}
                  {!a.isCorrect && !a.skipped
                    ? "(Incorrect)"
                    : a.isCorrect
                      ? "(Correct)"
                      : "(Skipped)"}
                </span>
                <span className="comparison-value">
                  {a.submittedAnswer == null
                    ? "Not answered"
                    : typeof a.submittedAnswer === "object"
                      ? JSON.stringify(a.submittedAnswer)
                      : String(a.submittedAnswer)}
                </span>
                {a.initialAnswer && a.initialAnswer !== a.submittedAnswer && (
                  <span className="comparison-subtext">
                    Initial attempt: <strong>{String(a.initialAnswer)}</strong>{" "}
                    (Incorrect)
                  </span>
                )}
                {a.intermediateStep && (
                  <span className="comparison-subtext">
                    Intermediate step entered:{" "}
                    <strong>{String(a.intermediateStep)}</strong>
                  </span>
                )}
                {a.assisted && (
                  <span
                    className="comparison-subtext"
                    style={{ color: "var(--accent)" }}
                  >
                    Support was used before this answer was submitted.
                  </span>
                )}
                {a.reflectiveCause && (
                  <span
                    className="comparison-subtext"
                    style={{ color: "var(--accent)" }}
                  >
                    Learner-reported factor:{" "}
                    <strong>
                      {REFLECTIVE_OPTIONS.find(
                        (o) => o.id === a.reflectiveCause,
                      )?.label || a.reflectiveCause}
                    </strong>
                  </span>
                )}
              </div>

              <div className="comparison-col expected-answer">
                <span className="comparison-label">Expected Answer</span>
                <span className="comparison-value">
                  {String(
                    a.expectedAnswer ?? "Not recorded in this older session",
                  )}
                </span>
              </div>
            </div>

            {!a.isCorrect && (
              <div className="v3-key-issue">
                <h3>What to check</h3>
                <p>
                  {a.stepAnalysis?.valid === false
                    ? a.stepAnalysis.message
                    : a.problem?.keyIssue ||
                      "Compare your answer with the method below. A final answer alone does not tell us which step went wrong."}
                </p>
              </div>
            )}
            {a.retries?.length > 0 && (
              <div className="v3-retries">
                <h3>Your retries</h3>
                <ol>
                  {a.retries.map((r) => (
                    <li key={r.id}>
                      {r.submittedAnswer} ·{" "}
                      {r.isCorrect ? "Correct with support" : "Incorrect"}{" "}
                      {r.stepAnalysis?.message && (
                        <span> · {r.stepAnalysis.message}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {(a.problem?.options ||
              a.problem?.reasonOptions ||
              a.problem?.format === "visual" ||
              ["sequence", "blunder"].includes(a.problem?.format)) && (
              <details className="v3-review-explanation">
                <summary>Original problem details</summary>
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
                      {Array.from(
                        { length: a.problem.sourceDenominator },
                        (_, i) => (
                          <span
                            key={i}
                            className={i < a.problem.numerator ? "filled" : ""}
                          />
                        ),
                      )}
                    </div>
                  </div>
                )}

                {a.problem?.steps &&
                  ["sequence", "blunder"].includes(a.problem.format) && (
                    <ol className="review-options">
                      {a.problem.steps.map((step, i) => (
                        <li key={i}>
                          <MathBlock content={step} />
                        </li>
                      ))}
                    </ol>
                  )}
              </details>
            )}
            <details className="v3-review-explanation">
              <summary>Expand the full steps</summary>
              <h3>Solution & why the method works</h3>
              <MathBlock
                content={
                  a.explanation ||
                  "This earlier record did not retain a solution."
                }
              />

              {a.problem?.example && (
                <div className="worked-example">
                  <h3>A worked example with intermediate steps</h3>
                  <MathBlock content={a.problem.example.question} />
                  <ol>
                    {a.problem.example.steps.map((step) => (
                      <li key={step}>
                        <MathBlock content={step} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </details>
            {a.problem?.visual && (
              <details className="v3-review-explanation">
                <summary>Show a visual explanation</summary>
                <ProblemFigure problem={a.problem} />
              </details>
            )}
            {!a.isCorrect && !a.skipped && (
              <details className="v3-review-reflection">
                <summary>
                  Add your own note about the mistake (optional)
                </summary>
                <p className="study-muted">
                  Choose a reason if it fits. This is your observation, not an
                  automatic diagnosis.
                </p>
                <div className="reflective-pill-row">
                  {REFLECTIVE_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`reflective-pill ${a.reflectiveCause === c.id ? "active" : ""}`}
                      onClick={() => {
                        try {
                          updateAttemptReflectiveCause(a.id, c.id);
                          setReportedReasons((previous) => ({
                            ...previous,
                            [a.id]: c.id,
                          }));
                          setNotice(`Recorded "${c.label}" for this question.`);
                        } catch (error) {
                          setNotice(error.message);
                        }
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </details>
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
              {completedRepairs[a.id] && (
                <p className="study-muted">
                  Fresh repair completed · Original attempt preserved
                </p>
              )}
              {isMissed && !completedRepairs[a.id] && (
                <button className="study-button" onClick={() => repair(a)}>
                  Repair this skill →
                </button>
              )}
              {(a.moduleId || a.conceptId) && (
                <Link className="study-text-button" to={topicLink.path}>
                  {topicLink.label}
                </Link>
              )}
            </div>
          </details>
        );
      })}
    </section>
  );
}
