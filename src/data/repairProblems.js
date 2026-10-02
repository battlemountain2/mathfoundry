// Small checked follow-up families for topics without a mixed-practice bank.
// Numeric tasks explicitly ask for one number so grading remains deterministic.
export function topicRepair(moduleId, seed = 0) {
  const n = 4 + (seed % 11);
  const examples = {
    "points-lines": [
      "Three non-collinear points lie in one unique plane.",
      "Non-collinear means the points do not all lie on a single line.",
    ],
    circles: [
      "For radius 2 and π = 3.14, circumference = 2 × 3.14 × 2 = 12.56.",
      "Circumference is the distance around a circle, not its area.",
    ],
    polygons: [
      "A hexagon has 6 × (6 − 3) / 2 = 9 diagonals.",
      "Each vertex connects to all but itself and its two neighbors; divide by 2 to avoid counting each diagonal twice.",
    ],
    "volume-surface": [
      "A 2 × 3 × 4 rectangular box has volume 24 cubic units.",
      "Multiply length, width and height; volume uses cubic units.",
    ],
    coordinate: [
      "The midpoint of x-coordinates 2 and 8 is (2 + 8)/2 = 5.",
      "Average the coordinates separately; this example concerns only the x-coordinate.",
    ],
    transformations: [
      "Translating (2, 3) by (4, −1) gives (6, 2).",
      "Add the translation to each matching coordinate.",
    ],
    "variables-expressions": [
      "For x = 2, 3x + 4 = 3 × 2 + 4 = 10.",
      "Substitute the value, then multiply before adding.",
    ],
    "linear-inequalities": [
      "2x + 1 < 9 gives 2x < 8, so x < 4. The greatest integer solution is 3.",
      "Subtract 1, then divide by positive 2; the inequality direction stays the same.",
    ],
    "linear-functions": [
      "For y = 2x + 1 at x = 3, y = 2 × 3 + 1 = 7.",
      "Substitute the input into the function to calculate the output.",
    ],
    "systems-equations": [
      "If x + y = 8 and x − y = 2, adding gives 2x = 10, so x = 5 and y = 3.",
      "The opposite y terms cancel; check both original equations.",
    ],
    "exponents-radicals": [
      "2⁴ = 2 × 2 × 2 × 2 = 16.",
      "An exponent counts repeated factors, not multiplication of the base by the exponent.",
    ],
    "polynomials-factoring": [
      "x² + 5x + 6 = (x + 2)(x + 3).",
      "2 + 3 = 5 and 2 × 3 = 6; expand to check.",
    ],
  };
  const example = examples[moduleId];
  if (!example) return null;
  const base = {
    id: `repair-${moduleId}-${n}`,
    moduleId,
    format: "fill",
    example: { question: "Remember the method", steps: example },
  };
  const tasks = {
    "points-lines": {
      format: "mcq",
      question:
        "Three distinct points that do not lie on one line determine exactly one:",
      options: ["Plane", "Ray", "Line"],
      correctAnswer: 0,
      explanation:
        "Three non-collinear points determine one plane. They cannot all lie on a single line.",
    },
    circles: {
      question: `A circle has radius ${n} cm. Using π = 3.14, what is its circumference in cm? Enter the number only.`,
      correctAnswer: String(2 * 3.14 * n),
      explanation: `C = 2πr = 2 × 3.14 × ${n} = ${2 * 3.14 * n} cm.`,
    },
    polygons: {
      question: `How many diagonals does a convex ${n + 3}-sided polygon have?`,
      correctAnswer: String(((n + 3) * n) / 2),
      explanation: `For s sides, diagonals = s(s − 3)/2. Here: ${n + 3} × ${n} / 2 = ${((n + 3) * n) / 2}.`,
    },
    "volume-surface": {
      question: `A rectangular box is ${n} cm long, 3 cm wide, and 2 cm high. What is its volume in cubic cm? Enter the number only.`,
      correctAnswer: String(n * 6),
      explanation: `V = length × width × height = ${n} × 3 × 2 = ${n * 6} cubic cm.`,
    },
    coordinate: {
      question: `A segment joins (2, 1) and (${n * 2}, 7). What is the x-coordinate of its midpoint?`,
      correctAnswer: String(n + 1),
      explanation: `Average the x-coordinates: (2 + ${n * 2})/2 = ${n + 1}. The full midpoint is (${n + 1}, 4).`,
    },
    transformations: {
      question: `Translate (${n}, 3) by the vector (2, −1). What is the new x-coordinate?`,
      correctAnswer: String(n + 2),
      explanation: `Add 2 to x and −1 to y. The translated point is (${n + 2}, 2), so its x-coordinate is ${n + 2}.`,
    },
    "variables-expressions": {
      question: `Evaluate 3x + 4 when x = ${n}.`,
      correctAnswer: String(3 * n + 4),
      explanation: `Substitute x: 3 × ${n} + 4 = ${3 * n} + 4 = ${3 * n + 4}.`,
    },
    "linear-inequalities": {
      question: `What is the greatest integer satisfying 2x + 1 < ${2 * n + 1}?`,
      correctAnswer: String(n - 1),
      explanation: `Subtract 1: 2x < ${2 * n}. Divide by 2: x < ${n}. The greatest integer strictly less than ${n} is ${n - 1}.`,
    },
    "linear-functions": {
      question: `For y = 2x + 1, what is y when x = ${n}?`,
      correctAnswer: String(2 * n + 1),
      explanation: `Substitute x: y = 2 × ${n} + 1 = ${2 * n + 1}.`,
    },
    "systems-equations": {
      question: `Solve x + y = ${n + 3} and x − y = ${n - 3}. Enter x only.`,
      correctAnswer: String(n),
      explanation: `Add the equations: 2x = ${2 * n}, so x = ${n}. Substitute into the first equation: y = 3. Both equations check.`,
    },
    "exponents-radicals": {
      question: `Calculate 2 to the power ${n}.`,
      correctAnswer: String(2 ** n),
      explanation: `Multiply ${n} factors of 2 to obtain ${2 ** n}. This is different from 2 × ${n}.`,
    },
    "polynomials-factoring": {
      question: `x² + ${n + 2}x + ${2 * n} = (x + 2)(x + k). Enter k.`,
      correctAnswer: String(n),
      explanation: `The two constants must sum to ${n + 2} and multiply to ${2 * n}. They are 2 and ${n}; expand (x + 2)(x + ${n}) to check.`,
    },
  };
  const task = tasks[moduleId];
  return {
    ...base,
    ...task,
    acceptableAnswers: task.format === "mcq" ? undefined : [task.correctAnswer],
  };
}
