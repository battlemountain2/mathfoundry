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
const P1_FIXTURE_SESSION = {
  id: "fixture-session-p1",
  title: "Arithmetic & fractions block",
  timestamp: "2026-10-02T19:30:00.000Z",
  answers: [
    {
      id: "q1",
      question: "Add 1/4 + 1/6. Enter a fraction.",
      submittedAnswer: "2/10",
      expectedAnswer: "5/12",
      isCorrect: false,
      skipped: false,
      assisted: false,
      explanation: "Use common denominator 12: 3/12 + 2/12 = 5/12.",
      problem: {
        question: "Add 1/4 + 1/6. Enter a fraction.",
        conceptId: "addition",
        example: {
          question: "Add 1/3 + 1/4.",
          steps: ["Common denominator is 12.", "4/12 + 3/12 = 7/12."],
        },
      },
    },
    {
      id: "q2",
      question: "Which is larger: 3/4 or 2/3?",
      submittedAnswer: null,
      expectedAnswer: "3/4",
      isCorrect: false,
      skipped: true,
      assisted: false,
      explanation: "Use denominator 12: 3/4 is 9/12, while 2/3 is 8/12.",
      problem: {
        question: "Which is larger: 3/4 or 2/3?",
        conceptId: "comparison",
        options: ["3/4", "2/3"],
      },
    },
    {
      id: "q3",
      question: "What is 7 × 6?",
      initialAnswer: "40",
      submittedAnswer: "42",
      expectedAnswer: "42",
      isCorrect: true,
      skipped: false,
      assisted: true,
      explanation: "7 × 6 = 42. Check: 42 ÷ 6 = 7.",
      problem: {
        question: "What is 7 × 6?",
        conceptId: "arithmetic",
      },
    },
    {
      id: "q4",
      question: "Find 2/3 of 3/5. Enter a fraction.",
      submittedAnswer: "2/5",
      expectedAnswer: "2/5",
      isCorrect: true,
      skipped: false,
      assisted: false,
      explanation: "(2 × 3) / (3 × 5) = 6/15 = 2/5.",
      problem: {
        question: "Find 2/3 of 3/5. Enter a fraction.",
        conceptId: "multiplication",
      },
    },
    {
      id: "q5",
      question: "Solve for x: 2x - 5 = 11",
      initialAnswer: "3",
      submittedAnswer: "6",
      expectedAnswer: "8",
      isCorrect: false,
      skipped: false,
      assisted: true,
      explanation: "2x = 16 => x = 8.",
      problem: {
        question: "Solve for x: 2x - 5 = 11",
        moduleId: "linear-equations",
      },
    },
    {
      id: "q6",
      question: "Point and line basic geometric definitions",
      submittedAnswer: undefined,
      expectedAnswer: undefined,
      isCorrect: true,
      skipped: false,
      assisted: false,
      explanation: "Recorded in earlier quiz session before full step logging.",
    },
  ],
};

export default function Review() {
  useProgress();
  const [params, setParams] = useSearchParams();
  const baseSessions = [
    ...foundationHistory(getLearningAttempts()),
    ...getPracticeHistory().map((s, i) => ({
      ...s,
      id: s.id || `legacy-practice-${i}`,
      title: s.title || "Mixed math practice",
    })),
    ...getReviewHistory(),
  ].sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  const isFixture = params.get("fixture") === "p1";
  const sessions = isFixture ? [P1_FIXTURE_SESSION, ...baseSessions] : baseSessions;
  const draft = getFoundationSession();
  const selected =
    sessions.find((s) => s.id === params.get("session")) || (isFixture ? P1_FIXTURE_SESSION : sessions[0]);
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
