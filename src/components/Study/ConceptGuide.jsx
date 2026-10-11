import ProblemFigure from "./ProblemFigure";
import MathBlock from "../Lesson/MathBlock";
import {
  makeTeachingExample,
  teachingPrinciples,
} from "../../utils/studyTeaching";

export default function ConceptGuide({
  unit,
  problem,
  step = 0,
  onStep,
  onPractice,
  returnLabel = "Try the practice problem",
}) {
  const example = makeTeachingExample(unit, problem);
  const [title, principle] = teachingPrinciples[
    unit.legacyConceptId || unit.id
  ] || [unit.title, unit.description];
  return (
    <section className="concept-guide" aria-label="Guided introduction">
      <p className="eyebrow">{step + 1} / 3 · Understand → See → Try</p>
      {step === 0 ? (
        <>
          <h2>{title}</h2>
          <p>{principle}</p>
          <p className="study-muted">
            Start with one example. Bring your paper, and move through this at
            your own pace.
          </p>
        </>
      ) : (
        <>
          <h2>
            {step === 1
              ? "One example, made visible."
              : "Follow the reasoning."}
          </h2>
          <p className="study-muted">
            This example uses a different problem from the one you’ll solve.
          </p>
          <MathBlock content={example?.question} />
          {step === 1 && example?.visual && (
            <ProblemFigure key={example.id} problem={example} />
          )}
          {step === 1 && !example?.visual && <p>{principle}</p>}
          {step === 2 && (
            <ol className="v3-worked-steps">
              {example?.steps.map((s, i) => (
                <li key={i}>
                  <MathBlock content={s} />
                </li>
              ))}
            </ol>
          )}
        </>
      )}
      <div className="study-actions">
        {step > 0 && (
          <button
            className="study-text-button"
            onClick={() => onStep(step - 1)}
          >
            Back
          </button>
        )}
        <button
          className="study-button"
          onClick={() => (step < 2 ? onStep(step + 1) : onPractice())}
        >
          {step < 2 ? "Continue" : returnLabel}
        </button>
        {step < 2 && (
          <button className="study-text-button" onClick={onPractice}>
            {returnLabel}
          </button>
        )}
      </div>
      <p className="study-muted">
        Viewing an example is support; it does not establish independent
        understanding.
      </p>
    </section>
  );
}
