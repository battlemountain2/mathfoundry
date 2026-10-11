import {
  makeProblem,
  fraction,
  makeEngineeringSession,
} from "../data/foundations.js";
import {
  makeGeometryStudyProblem,
  enrichStudyProblem,
  makeTeachingExample,
} from "./studyTeaching.js";
import { makeExtendedMathProblem } from "./extendedMath.js";
import {
  equivalentAnswer,
  numericValue,
  choiceIndex,
} from "./answerChecking.js";
import { getMathUnit } from "../data/courses/mathFoundations.js";

export function makeStudyProblem(conceptId, seed, format = "numeric") {
  const extended = makeExtendedMathProblem(conceptId, seed);
  if (extended) return extended;
  if (conceptId !== "addition" || format === "rule") {
    const q = makeProblem(conceptId, seed, format);
    if (conceptId === "equivalence" && format !== "rule")
      q.visual = {
        a: q.numerator,
        d: q.sourceDenominator,
        b: Number(q.answer),
        e: q.denominator,
        kind: "equivalence",
      };
    if (conceptId === "comparison" && format !== "rule") {
      const match = q.question.match(/(\d+)\/(\d+) or (\d+)\/(\d+)/);
      if (match)
        q.visual = {
          a: Number(match[1]),
          d: Number(match[2]),
          b: Number(match[3]),
          e: Number(match[4]),
          kind: "comparison",
        };
    }
    return enrichStudyProblem(q);
  }
  const d = 2 + (seed % 6),
    e = 3 + (Math.floor(seed / 6) % 6);
  let a = 1 + (Math.floor(seed / 36) % (d - 1)),
    b = 1 + (Math.floor(seed / 72) % (e - 1));
  const subtract = seed % 3 === 1;
  // Keep the chosen denominators and guarantee a nonnegative subtraction.
  if (subtract && a / d < b / e) {
    a = d - 1;
    b = 1;
  }
  const common = d * e,
    numerator = subtract ? a * e - b * d : a * e + b * d;
  const op = subtract ? "−" : "+";
  const answer = fraction(numerator, common);
  const steps = [
    `Use a common denominator of ${common}.`,
    `${a}/${d} = ${a * e}/${common}; ${b}/${e} = ${b * d}/${common}.`,
    `${a * e}/${common} ${op} ${b * d}/${common} = ${numerator}/${common}${answer === `${numerator}/${common}` ? "" : ` = ${answer}`}.`,
  ];
  return {
    ...makeProblem(conceptId, seed),
    example: makeProblem(conceptId, subtract ? 1 : 0).example,
    id: `fraction-v3-${seed}`,
    seed,
    family: "fraction-operation",
    subskill: subtract ? "fraction-subtraction" : "fraction-addition",
    question: `${subtract ? "Subtract" : "Add"} ${a}/${d} ${op} ${b}/${e}. Enter a fraction.`,
    answer,
    steps,
    explanation: steps.join(" "),
    visual: { a, d, b, e, subtract },
    keyIssue:
      "The fractions need equal-sized parts before their numerators can be combined.",
  };
}
export function createStudySession(
  unit,
  mode = "practice",
  seed = Date.now() % 10000,
) {
  const conceptId = unit.legacyConceptId || unit.id;
  const count = mode === "quiz" ? 4 : 6;
  const application =
    mode === "application" ? makeEngineeringSession().questions : [];
  if (mode === "application") {
    const n = 1 + (seed % 4),
      d = n + 2 + (Math.floor(seed / 4) % 3);
    const drawing = fraction(n, 2 * d);
    application[0] = {
      ...application[0],
      id: `scale-half-${seed}`,
      question: `A model drawing uses half the real length. A real beam is ${n}/${d} metre long. How many metres long is it in the drawing? Enter the number only.`,
      answer: drawing,
      explanation: `The drawing length is (1/2) × (${n}/${d}) = ${drawing} metre. The drawing is shorter than the real beam.`,
      subskill: "fraction-multiplication",
      visual: { kind: "fraction-product", a: 1, d: 2, b: n, e: d },
      steps: [
        `Scale the real length by one half.`,
        `(1/2) × (${n}/${d}) = ${drawing} metre.`,
      ],
    };
    const pieces = makeStudyProblem(
      "addition",
      seed % 3 === 1 ? seed + 1 : seed,
    );
    const { a, d: denA, b, e } = pieces.visual;
    application[1] = {
      ...pieces,
      id: `measure-sections-${seed}`,
      question: `Two straight sections end to end measure ${a}/${denA} metre and ${b}/${e} metre. Ignore any overlap. Calculate ${a}/${denA} + ${b}/${e}. What is the total length in metres? Enter the number only.`,
      explanation: `${pieces.explanation} Both inputs and the total are lengths in metres.`,
    };
  }
  const questions =
    mode === "application"
      ? application.map((q) => {
          const skill = getMathUnit(q.conceptId);
          return { ...q, unitId: skill.id, unitPath: skill.unitPath };
        })
      : Array.from({ length: count }, (_, i) => {
          const format = i === 0 ? "rule" : "numeric";
          const q =
            unit.courseId === "geometry"
              ? makeGeometryStudyProblem(unit.id, seed + i * 7, format)
              : makeStudyProblem(conceptId, seed + i * 7, format);
          const example = makeTeachingExample(unit, q);
          if (example) q.example = example;
          q.evidenceType =
            format === "rule" && q.format === "rule"
              ? "recognition"
              : "application";
          const geometryModule =
            {
              "angles-lines": "angles",
              "triangles-pythagoras": "pythagorean",
              "circles-radians": "circles",
              "volume-surface-area": "volume-surface",
              "coordinate-geometry": "coordinate",
            }[unit.id] || unit.id;
          return {
            ...q,
            ...(unit.courseId === "geometry"
              ? { moduleId: geometryModule }
              : {}),
            family: q.family || q.conceptId,
            seed: seed + i * 7,
          };
        });
  return {
    id: crypto.randomUUID(),
    unitId: unit.id,
    unitPath: unit.unitPath,
    courseId: unit.courseId || "math",
    title:
      mode === "application"
        ? "Measured pieces · Engineering connection"
        : unit.title,
    mode,
    seed,
    questions,
    index: 0,
    answers: [],
    input: "",
    step: "",
    checked: false,
    help: null,
    helpEvents: [],
    assisted: false,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}
export function submitStudyAnswer(session, input, step = "", skipped = false) {
  if (session.checked || session.completed) return session;
  const q = session.questions[session.index];
  if (
    !skipped &&
    (q.options
      ? choiceIndex(input, q.options) === null
      : numericValue(input) === null)
  )
    return session;
  const sameProblem = session.answers.filter(
    (a) => a.problemInstanceId === `${session.id}:${session.index}`,
  );
  const correct =
    !skipped &&
    (q.options
      ? Number(input) === Number(q.answer)
      : equivalentAnswer(input, q.answer));
  const display = q.options ? q.options[Number(input)] : input;
  const expected = q.options ? q.options[Number(q.answer)] : String(q.answer);
  const attempt = {
    id: `${session.id}:${session.index}:${sameProblem.length}`,
    sessionId: session.id,
    problemInstanceId: `${session.id}:${session.index}`,
    submissionIndex: sameProblem.length,
    problemId: q.id,
    problem: q,
    unitId: q.unitId || session.unitId,
    unitPath: q.unitPath || session.unitPath,
    conceptId: q.conceptId,
    evidenceType: q.evidenceType || "application",
    moduleId: q.moduleId,
    subskill: q.subskill,
    question: q.question,
    submittedAnswer: skipped ? null : display,
    initialAnswer: sameProblem[0]?.submittedAnswer ?? display,
    expectedAnswer: expected,
    explanation: q.explanation,
    intermediateStep: step || undefined,
    isCorrect: correct,
    skipped,
    assisted: session.assisted || sameProblem.length > 0,
    mode: `unit-${session.mode}`,
    format: q.format,
    assistanceEvents: (session.helpEvents || []).filter(
      (e) => e.problemIndex === session.index,
    ),
    timestamp: new Date().toISOString(),
  };
  return {
    ...session,
    answers: [...session.answers, attempt],
    checked: true,
    input,
    step,
    help: correct || skipped ? session.help : "hint",
    assisted: correct || skipped ? session.assisted : true,
    helpEvents:
      correct || skipped
        ? session.helpEvents || []
        : [
            ...(session.helpEvents || []),
            {
              kind: "hint",
              problemIndex: session.index,
              timestamp: studyTimestamp(),
            },
          ],
  };
}
export function advanceStudySession(session) {
  if (!session.checked) return session;
  const index = session.index + 1;
  return {
    ...session,
    index,
    completed: index >= session.questions.length,
    input: "",
    step: "",
    checked: false,
    help: null,
    assisted: false,
    updatedAt: new Date().toISOString(),
  };
}
export function studyReviewAnswers(session) {
  return session.questions.flatMap((q, index) => {
    const rows = session.answers.filter(
      (a) => a.problemInstanceId === `${session.id}:${index}`,
    );
    return rows.length
      ? [
          {
            ...rows[0],
            retries: rows.slice(1),
            eventualCorrect: rows.at(-1).isCorrect,
          },
        ]
      : [];
  });
}
export function studySummary(session) {
  const first = studyReviewAnswers(session);
  return {
    total: first.length,
    correct: first.filter((a) => a.isCorrect && !a.skipped).length,
    independent: first.filter((a) => a.isCorrect && !a.assisted && !a.skipped)
      .length,
    recognized: first.filter(
      (a) =>
        a.evidenceType === "recognition" &&
        a.isCorrect &&
        !a.assisted &&
        !a.skipped,
    ).length,
    applied: first.filter(
      (a) =>
        a.evidenceType !== "recognition" &&
        a.isCorrect &&
        !a.assisted &&
        !a.skipped,
    ).length,
    recovered: first.filter((a) => !a.isCorrect && a.eventualCorrect).length,
  };
}

export function studyTimestamp() {
  return new Date().toISOString();
}

export function studyTime() {
  return Date.now();
}
