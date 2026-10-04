import { topicRepair } from "../data/repairProblems.js";
import { makeProblem } from "../data/foundations.js";
import { practiceBank } from "../data/practiceBank.js";

export function detectSubskill(item) {
  if (!item) return null;
  const question = item.question || item.statement || item.problem?.question || (typeof item === "string" ? item : "");
  const conceptId = item.conceptId || item.problem?.conceptId;
  const moduleId = item.moduleId || item.problem?.moduleId;
  const text = `${question} ${item.explanation || ""} ${item.problem?.explanation || ""}`.toLowerCase();

  // Foundations: Arithmetic
  if (conceptId === "arithmetic") {
    if (question.includes("−") || question.includes(" - ") || text.includes("subtract") || text.includes("difference")) {
      return "arithmetic-subtraction";
    }
    if (question.includes("+") || text.includes("add") || text.includes("sum")) {
      return "arithmetic-addition";
    }
    if (question.includes("÷") || text.includes("divide") || text.includes("quotient")) {
      return "arithmetic-division";
    }
    if (question.includes("×") || question.includes("*") || text.includes("multiply") || text.includes("product")) {
      return "arithmetic-multiplication";
    }
  }

  // Foundations: Addition / Subtraction of fractions
  if (conceptId === "addition") {
    if (question.includes("−") || question.includes(" - ") || text.includes("subtract") || text.includes("difference")) {
      return "fraction-subtraction";
    }
    if (question.includes("+") || text.includes("add") || text.includes("sum")) {
      return "fraction-addition";
    }
  }

  // Geometry: Area & Perimeter
  if (moduleId === "area-perimeter" || text.includes("perimeter") || text.includes("circumference") || text.includes("area")) {
    if (text.includes("perimeter") || text.includes("circumference")) {
      return "perimeter";
    }
    if (text.includes("area")) {
      return "area";
    }
  }

  // Geometry: Angles
  if (moduleId === "angles" || text.includes("complementary") || text.includes("supplementary")) {
    if (text.includes("complement")) return "complementary-angles";
    if (text.includes("supplement")) return "supplementary-angles";
    if (text.includes("vertical")) return "vertical-angles";
    if (text.includes("adjacent")) return "adjacent-angles";
  }

  // Geometry: Pythagorean
  if (moduleId === "pythagorean" || text.includes("pythagorean") || text.includes("hypotenuse")) {
    if (text.includes("leg")) return "pythagorean-leg";
    if (text.includes("hypotenuse") || text.includes("diagonal") || text.includes("triple")) return "pythagorean-hypotenuse";
  }

  // Geometry: Triangles
  if (moduleId === "triangles") {
    if (text.includes("form a triangle") || text.includes("inequality") || text.includes("side lengths")) {
      return "triangle-inequality";
    }
    if (text.includes("angle") || text.includes("sum")) {
      return "triangle-angles";
    }
  }

  // Algebra: Linear equations
  if (moduleId === "linear-equations") {
    if (text.includes("/") || text.includes("fraction")) return "linear-equations-fraction";
    return "linear-equations-twostep";
  }

  // Algebra: Quadratic equations
  if (moduleId === "quadratic-equations") {
    if (text.includes("root") || text.includes("factor") || text.includes("solve")) return "quadratic-roots";
    if (text.includes("vertex") || text.includes("symmetry") || text.includes("intercept") || text.includes("parabola")) return "quadratic-properties";
  }

  return null;
}

export function findRulebookEntryId(subskill, conceptId, moduleId) {
  if (subskill === "arithmetic-subtraction") return "rule:arithmetic-subtraction";
  if (subskill === "fraction-subtraction") return "rule:subtraction-fractions";
  if (subskill === "perimeter" || subskill === "area") return "rule:area-vs-perimeter";
  if (subskill === "complementary-angles" || subskill === "supplementary-angles") return "rule:angles";
  if (subskill === "pythagorean-hypotenuse" || subskill === "pythagorean-leg") return "rule:pythagorean";
  if (conceptId === "addition") return "rule:addition";
  if (conceptId === "equivalence") return "rule:equivalence";
  if (conceptId === "multiplication") return "rule:multiplication";
  if (conceptId === "division") return "rule:division";
  if (conceptId === "arithmetic") return "rule:arithmetic-decomposition";
  if (moduleId === "area-perimeter") return "rule:area-vs-perimeter";
  if (moduleId === "pythagorean") return "rule:pythagorean";
  if (moduleId === "angles") return "rule:angles";
  if (moduleId === "linear-equations") return "rule:linear-equations";
  if (moduleId === "linear-inequalities") return "rule:linear-inequalities";
  return null;
}

export function makeRepairDraft(attempt, previous = []) {
  let problem;
  const seen = new Set([attempt.question, ...previous.map((a) => a.question)]);
  const targetSubskill = detectSubskill(attempt);

  if (attempt.conceptId) {
    // Search candidates matching the exact subskill first
    for (let seed = 0; seed < 48; seed++) {
      const candidate = makeProblem(attempt.conceptId, seed);
      if (
        !seen.has(candidate.question) &&
        candidate.question !== attempt.problem?.example?.question &&
        (!targetSubskill || detectSubskill(candidate) === targetSubskill)
      ) {
        problem = candidate;
        break;
      }
    }
    // If not found with targetSubskill, search without subskill filter before novel fallback
    if (!problem && !targetSubskill) {
      for (let seed = 0; seed < 48; seed++) {
        const candidate = makeProblem(attempt.conceptId, seed);
        if (
          !seen.has(candidate.question) &&
          candidate.question !== attempt.problem?.example?.question
        ) {
          problem = candidate;
          break;
        }
      }
    }
    if (!problem) {
      problem = novelFoundationProblem(attempt.conceptId, previous.length, targetSubskill);
    }
  } else {
    // Practice bank questions: search for matching subskill
    if (targetSubskill) {
      problem = practiceBank.find(
        (q) =>
          q.moduleId === attempt.moduleId &&
          !seen.has(q.question || q.statement) &&
          ["mcq", "fill"].includes(q.format) &&
          detectSubskill(q) === targetSubskill,
      );
    }
    // Specific targeted novelty for area-perimeter if bank exhausted or doesn't match
    if (!problem && attempt.moduleId === "area-perimeter") {
      const n = 5 + (previous.length % 9);
      if (targetSubskill === "perimeter") {
        const length = n + 4;
        const width = n;
        const perimeter = 2 * (length + width);
        problem = {
          id: `repair-perimeter-${n}`,
          moduleId: "area-perimeter",
          format: "fill",
          subskill: "perimeter",
          question: `What is the perimeter of a rectangle with length ${length} and width ${width}?`,
          correctAnswer: String(perimeter),
          acceptableAnswers: [String(perimeter)],
          explanation: `Perimeter is the distance around: P = 2(l + w) = 2(${length} + ${width}) = 2 × ${length + width} = ${perimeter}.`,
          example: {
            question: "What is the perimeter of a rectangle with length 5 and width 3?",
            steps: ["Perimeter = 2 × (length + width)", "P = 2 × (5 + 3) = 2 × 8 = 16."],
          },
        };
      } else if (targetSubskill === "area") {
        const side = n;
        problem = {
          id: `repair-area-${n}`,
          moduleId: "area-perimeter",
          format: "fill",
          subskill: "area",
          question: `What is the area of a square with side ${side}?`,
          correctAnswer: String(side * side),
          acceptableAnswers: [String(side * side)],
          explanation: `Area is the enclosed surface: A = s² = ${side} × ${side} = ${side * side}.`,
          example: {
            question: "Area of square with side 6",
            steps: ["Area = side × side", "A = 6 × 6 = 36."],
          },
        };
      }
    }
    // Fallback: any mcq/fill in practiceBank for this module
    if (!problem) {
      problem = practiceBank.find(
        (q) =>
          q.moduleId === attempt.moduleId &&
          !seen.has(q.question || q.statement) &&
          ["mcq", "fill"].includes(q.format),
      );
    }
  }

  if (!problem && attempt.moduleId) {
    problem = topicRepair(attempt.moduleId, previous.length);
  }
  if (!problem) return null;

  if (!problem.example && !problem.conceptId) {
    const sample = practiceBank.find(
      (q) =>
        q.moduleId === problem.moduleId &&
        q.id !== problem.id &&
        ["mcq", "fill"].includes(q.format) &&
        (!targetSubskill || detectSubskill(q) === targetSubskill),
    ) || practiceBank.find(
      (q) =>
        q.moduleId === problem.moduleId &&
        q.id !== problem.id &&
        ["mcq", "fill"].includes(q.format),
    );
    if (sample) {
      problem = {
        ...problem,
        example: { question: sample.question, steps: [sample.explanation] },
      };
    }
  }

  const assignedSubskill = targetSubskill || detectSubskill(problem);
  const rulebookId = findRulebookEntryId(assignedSubskill, attempt.conceptId, attempt.moduleId);

  return {
    id: crypto.randomUUID(),
    source: attempt,
    subskill: assignedSubskill,
    rulebookId,
    problem,
    stage: "review",
    input: "",
    assisted: false,
    checked: false,
    createdAt: new Date().toISOString(),
  };
}

function novelFoundationProblem(conceptId, seed, subskill = null) {
  const base = makeProblem(conceptId, 0);
  const n = 11 + seed;
  switch (conceptId) {
    case "arithmetic": {
      if (subskill === "arithmetic-subtraction") {
        const a = 25 + n;
        const b = 10 + (seed % 7) + 2;
        return {
          ...base,
          id: `repair-arithmetic-sub-${n}`,
          subskill: "arithmetic-subtraction",
          question: `What is ${a} − ${b}?`,
          answer: String(a - b),
          explanation: `Decompose ${b} into tens and ones. ${a} − ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}, then subtract ${b % 10} = ${a - b}. Check: ${a - b} + ${b} = ${a}.`,
          example: {
            question: "What is 43 − 17?",
            steps: ["Split 17 into 10 + 7.", "43 − 10 = 33.", "33 − 7 = 26. Check: 26 + 17 = 43."],
          },
        };
      }
      if (subskill === "arithmetic-addition") {
        const x = 20 + n;
        const y = 10 + (seed % 7) + 3;
        return {
          ...base,
          id: `repair-arithmetic-add-${n}`,
          subskill: "arithmetic-addition",
          question: `What is ${x} + ${y}?`,
          answer: String(x + y),
          explanation: `${x} + ${y} = ${x + y}. Check with subtraction: ${x + y} − ${y} = ${x}.`,
          example: {
            question: "What is 27 + 18?",
            steps: ["Split 18 into 10 + 8.", "27 + 10 = 37.", "37 + 8 = 45. Check: 45 − 18 = 27."],
          },
        };
      }
      if (subskill === "arithmetic-division") {
        const divisor = 3 + (seed % 5);
        const dividend = divisor * (8 + seed);
        return {
          ...base,
          id: `repair-arithmetic-div-${n}`,
          subskill: "arithmetic-division",
          question: `What is ${dividend} ÷ ${divisor}?`,
          answer: String(8 + seed),
          explanation: `${divisor} × ${8 + seed} = ${dividend}, so ${dividend} ÷ ${divisor} = ${8 + seed}.`,
          example: {
            question: "What is 42 ÷ 6?",
            steps: ["Multiplication undos division: 6 × 7 = 42.", "Therefore 42 ÷ 6 = 7."],
          },
        };
      }
      return {
        ...base,
        id: `repair-arithmetic-${n}`,
        subskill: "arithmetic-multiplication",
        question: `What is ${n} × 7?`,
        answer: String(n * 7),
        explanation: `Split ${n} into 10 + ${n - 10}. 10 × 7 = 70; ${n - 10} × 7 = ${(n - 10) * 7}. Add them: ${n * 7}. Check by dividing by 7.`,
      };
    }
    case "equivalence":
      return {
        ...base,
        id: `repair-equivalence-${n}`,
        question: `2/${n} = ?/${n * 3}. Enter the missing numerator.`,
        answer: "6",
        explanation: `The denominator is multiplied by 3. Multiply 2 by 3 as well: 2/${n} = 6/${n * 3}.`,
      };
    case "comparison":
      return {
        ...base,
        id: `repair-comparison-${n}`,
        question: `Which is larger: 2/${n} or 3/${n + 2}?`,
        options: [`2/${n}`, `3/${n + 2}`],
        answer: 1,
        explanation: `Use denominator ${n * (n + 2)}. The numerators become ${2 * (n + 2)} and ${3 * n}; ${3 * n} is larger, so 3/${n + 2} is larger.`,
      };
    case "addition": {
      if (subskill === "fraction-subtraction") {
        const d = 3 + (seed % 4);
        const e = d + 1;
        return {
          ...base,
          id: `repair-addition-sub-${n}`,
          subskill: "fraction-subtraction",
          question: `Subtract 1/${d} − 1/${e}. Enter a fraction.`,
          answer: `1/${d * e}`,
          explanation: `Use denominator ${d * e}. ${e}/${d * e} − ${d}/${d * e} = 1/${d * e}. Check: 1/${d * e} + 1/${e} = ${e}/${d * e} = 1/${d}.`,
          example: {
            question: "Subtract 3/4 − 1/6.",
            steps: ["Use common denominator 12.", "3/4 = 9/12; 1/6 = 2/12.", "9/12 − 2/12 = 7/12. Check: 7/12 + 2/12 = 9/12."],
          },
        };
      }
      return {
        ...base,
        id: `repair-addition-${n}`,
        subskill: "fraction-addition",
        question: `Add 1/${n} + 1/${n + 1}. Enter a fraction.`,
        answer: `${2 * n + 1}/${n * (n + 1)}`,
        explanation: `Use denominator ${n * (n + 1)}. Rewrite as ${n + 1}/${n * (n + 1)} + ${n}/${n * (n + 1)} = ${2 * n + 1}/${n * (n + 1)}.`,
      };
    }
    case "multiplication":
      return {
        ...base,
        id: `repair-multiplication-${n}`,
        question: `Find 2/${n} of 1/3. Enter a fraction.`,
        answer: `2/${n * 3}`,
        explanation: `Multiply numerators: 2 × 1 = 2. Multiply denominators: ${n} × 3 = ${n * 3}. The result is 2/${n * 3}; simplify if possible.`,
      };
    case "division":
      return {
        ...base,
        id: `repair-division-${n}`,
        question: `How many 1/${n + 2} portions fit into ${n}/${n + 2}?`,
        answer: String(n),
        explanation: `Multiply by the reciprocal: ${n}/${n + 2} × ${n + 2}/1 = ${n}. Check: ${n} × 1/${n + 2} equals the original amount.`,
      };
    default:
      return null;
  }
}
