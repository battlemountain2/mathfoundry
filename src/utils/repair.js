import { topicRepair } from "../data/repairProblems.js";
import { makeProblem } from "../data/foundations.js";
import { practiceBank } from "../data/practiceBank.js";
export function makeRepairDraft(attempt, previous = []) {
  let problem;
  const seen = new Set([attempt.question, ...previous.map((a) => a.question)]);
  if (attempt.conceptId) {
    // Choose a genuinely different numeric task; procedure-only prompts are scaffolding.
    for (let seed = 0; seed < 24; seed++) {
      const candidate = makeProblem(attempt.conceptId, seed);
      if (
        !seen.has(candidate.question) &&
        candidate.question !== attempt.problem?.example?.question
      ) {
        problem = candidate;
        break;
      }
    }
    if (!problem)
      problem = novelFoundationProblem(attempt.conceptId, previous.length);
  } else {
    problem = practiceBank.find(
      (q) =>
        q.moduleId === attempt.moduleId &&
        !seen.has(q.question || q.statement) &&
        ["mcq", "fill"].includes(q.format),
    );
  }
  if (!problem && attempt.moduleId)
    problem = topicRepair(attempt.moduleId, previous.length);
  if (!problem) return null;
  if (!problem.example && !problem.conceptId) {
    const sample = practiceBank.find(
      (q) =>
        q.moduleId === problem.moduleId &&
        q.id !== problem.id &&
        ["mcq", "fill"].includes(q.format),
    );
    if (sample)
      problem = {
        ...problem,
        example: { question: sample.question, steps: [sample.explanation] },
      };
  }
  return {
    id: crypto.randomUUID(),
    source: attempt,
    problem,
    stage: "review",
    input: "",
    assisted: false,
    checked: false,
    createdAt: new Date().toISOString(),
  };
}

function novelFoundationProblem(conceptId, seed) {
  const base = makeProblem(conceptId, 0);
  const n = 11 + seed;
  switch (conceptId) {
    case "arithmetic":
      return {
        ...base,
        id: `repair-arithmetic-${n}`,
        question: `What is ${n} × 7?`,
        answer: String(n * 7),
        explanation: `Split ${n} into 10 + ${n - 10}. 10 × 7 = 70; ${n - 10} × 7 = ${(n - 10) * 7}. Add them: ${n * 7}. Check by dividing by 7.`,
      };
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
    case "addition":
      return {
        ...base,
        id: `repair-addition-${n}`,
        question: `Add 1/${n} + 1/${n + 1}. Enter a fraction.`,
        answer: `${2 * n + 1}/${n * (n + 1)}`,
        explanation: `Use denominator ${n * (n + 1)}. Rewrite as ${n + 1}/${n * (n + 1)} + ${n}/${n * (n + 1)} = ${2 * n + 1}/${n * (n + 1)}.`,
      };
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
