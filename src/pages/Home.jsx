import { Link } from "react-router-dom";
import {
  getAllLearningAttempts,
  getStudySessions,
  getRecallSession,
  getCompletedRepairs,
} from "../utils/storage";
import { foundationRecommendation } from "../utils/learningProfile";
import {
  getMathUnit,
  mathFoundationsUnits,
} from "../data/courses/mathFoundations";
import { useStoreChange } from "../hooks/useStoreChange";
import { resolveStudyUnit } from "../utils/studyNavigation";
import { makeTeachingExample } from "../utils/studyTeaching";
import MathBlock from "../components/Lesson/MathBlock";
import ProblemFigure from "../components/Study/ProblemFigure";

export default function Home() {
  useStoreChange();
  const attempts = getAllLearningAttempts();
  const recommendation = foundationRecommendation(attempts);
  const unit =
    getMathUnit(recommendation.id || recommendation.conceptId) ||
    mathFoundationsUnits[0];
  const sessions = Object.entries(getStudySessions())
    .filter(([, s]) => !s.completed)
    .sort((a, b) =>
      String(b[1].updatedAt || b[1].createdAt).localeCompare(
        String(a[1].updatedAt || a[1].createdAt),
      ),
    );
  const pending = sessions[0]?.[1];
  const deskUnit =
    resolveStudyUnit(pending?.questions[pending.index] || pending || {}) ||
    unit;
  const deskExample = makeTeachingExample(
    deskUnit,
    pending?.questions[pending.index],
  );
  const target = pending
    ? `/courses/${pending.courseId}/${pending.unitId}/${pending.mode === "application" ? "application" : pending.mode === "quiz" ? "quiz" : "practice"}`
    : `/courses/math/${unit.id}/practice`;
  const recall = getRecallSession();
  const completedRepairs = getCompletedRepairs();
  const misses = attempts
    .filter((a) => !a.isCorrect && !a.skipped && !completedRepairs[a.id])
    .slice(-3)
    .reverse();
  return (
    <div className="v3-desk">
      <header className="v3-desk-heading">
        <p className="eyebrow">Athena / Your study desk</p>
        <h1>
          Build understanding.
          <br />
          <span>One idea at a time.</span>
        </h1>
        <p>A space to think, work on paper, and come back to what matters.</p>
      </header>
      <section className="v3-desk-main">
        <div className="v3-next">
          <p className="eyebrow">
            {pending ? "Continue your thread" : "A good place to begin"}
          </p>
          <h2>{pending?.title || unit.title}</h2>
          <p>
            {pending
              ? `Your questions and work are saved. Resume at question ${pending.index + 1} of ${pending.questions.length}.`
              : recommendation.reason}
          </p>
          <div className="study-actions">
            <Link className="study-button" to={target}>
              {pending ? "Resume session" : "Start a study session"}
            </Link>
            <Link
              className="study-text-button"
              to={
                pending
                  ? `/courses/${pending.courseId}/${pending.unitId}`
                  : `/courses/math/${unit.id}`
              }
            >
              Explore the idea
            </Link>
          </div>
          <p className="v3-save-note">
            Untimed · Paper welcome · Help when you choose
          </p>
        </div>
        <section
          className="v3-desk-preview"
          aria-label={`Visual example for ${deskUnit.title}`}
        >
          <p className="eyebrow">Explore the idea / {deskUnit.title}</p>
          <ProblemFigure problem={deskExample} />
          <p className="study-muted">
            A separate example to explore. Your session questions stay saved.
          </p>
        </section>
      </section>
      <section className="v3-compact-path">
        <span className="eyebrow">Your foundation</span>
        <Link to="/courses/math/arithmetic">Arithmetic</Link>
        <span>→</span>
        <Link to="/courses/math/equivalent-fractions">Fraction meaning</Link>
        <span>→</span>
        <Link to="/courses/math/add-subtract-fractions">
          Working with fractions
        </Link>
        <Link to="/courses/math" className="v3-path-map">
          View the path
        </Link>
      </section>
      <div className="v3-desk-bottom">
        <section>
          <p className="eyebrow">Remember the method</p>
          <h2>A small puzzle. A useful rule.</h2>
          <p>
            Refresh a method with a quiet six-question round. Choose the topic
            you want to revisit.
          </p>
          <Link className="study-button secondary" to="/recall">
            {recall && !recall.completed
              ? "Resume Rule Match"
              : "Open Rule Match"}
          </Link>
        </section>
        <section>
          <p className="eyebrow">Connect it to something real</p>
          <h2>Build with measured pieces.</h2>
          <p>
            Combine lengths and explore scale. Bring your paper and keep track
            of the units.
          </p>
          <Link
            className="study-text-button"
            to="/courses/math/add-subtract-fractions/application"
          >
            Try an engineering connection
          </Link>
        </section>
      </div>
      {misses.length > 0 && (
        <section className="v3-revisit">
          <p className="eyebrow">Worth another look</p>
          <h2>Your recent work</h2>
          <p>A missed answer is a place to investigate, not a diagnosis.</p>
          {misses.map((a, i) => (
            <Link
              key={a.id || `miss-${i}`}
              to={`/review?session=${encodeURIComponent(a.sessionId || "")}&attempt=${encodeURIComponent(a.id || "")}`}
              className="v3-work-link"
            >
              <MathBlock content={a.question} />
              <span>Review</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
