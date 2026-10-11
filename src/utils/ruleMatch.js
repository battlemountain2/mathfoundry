import { concepts, makeProblem } from "../data/foundations.js";
import { choiceIndex } from "./answerChecking.js";

// Authored choices cover rule recall, a next step, and repairing a misapplied rule.
// Each has one unambiguous answer; answer positions rotate below.
const puzzles = {
  arithmetic: [
    [
      "A division check says 48 ÷ 6 = 8. Which calculation verifies it?",
      ["8 × 6 = 48", "8 + 6 = 14", "48 × 6 = 288"],
      "Multiplying the quotient by the divisor should recover the original amount: 8 × 6 = 48.",
      "Use the operation that undoes division.",
    ],
    [
      "To find 7 × 6, someone splits 7 into 5 + 2, then writes 30 + 2. What needs fixing?",
      [
        "Both groups must be multiplied by 6: 30 + 12",
        "The two groups should be divided by 6",
        "The split must always be into equal groups",
      ],
      "Distribute the multiplication to both groups: (5 + 2) × 6 = 5 × 6 + 2 × 6 = 30 + 12.",
      "What does the second group of 2 represent in the original multiplication?",
    ],
  ],
  equivalence: [
    [
      "You are rewriting 2/5 with denominator 15. What should happen to the numerator?",
      ["Multiply 2 by 3", "Add 10 to 2", "Keep the numerator as 2"],
      "The denominator was multiplied by 3, so the numerator must be too: 2/5 = 6/15.",
      "Use the same scale factor for both parts of the fraction.",
    ],
    [
      "A student changes 2/5 to 2/15. What needs fixing?",
      [
        "The numerator must also be multiplied by 3",
        "The numerator must also have 10 added",
        "Nothing; the fractions are equivalent",
      ],
      "5 became 15 by multiplying by 3. The same scale factor must apply to the numerator: 2/5 = 6/15.",
      "Compare the amount represented before and after changing the denominator.",
    ],
  ],
  comparison: [
    [
      "Which pair can be compared directly using only the numerators?",
      ["3/8 and 5/8", "3/4 and 5/6", "1/2 and 1/3"],
      "With the same positive denominator, the pieces are equal-sized: five eighths is more than three eighths.",
      "For numerators alone to tell the size, what must be true about the pieces?",
    ],
    [
      "Someone says 3/8 is larger than 5/8 because fewer pieces are bigger. What needs fixing?",
      [
        "The pieces are the same size; compare how many are shaded",
        "A smaller numerator always makes a larger fraction",
        "Double both denominators before any comparison",
      ],
      "Both fractions use eighths. Five of the same-sized pieces cover more than three, so 5/8 is larger.",
      "Are the pieces actually different sizes in this pair?",
    ],
  ],
  addition: [
    [
      "You rewrote 1/2 + 1/3 as 3/6 + 2/6. Which next step fits?",
      [
        "Add 3 + 2 and keep denominator 6",
        "Add both denominators to get 12",
        "Multiply 3 × 2 and keep denominator 6",
      ],
      "The parts are now sixths. Combine the number of sixths: 3/6 + 2/6 = 5/6.",
      "Which quantity counts the pieces, and which describes their size?",
    ],
    [
      "A student writes 2/5 + 1/5 = 3/10. What needs fixing?",
      [
        "Keep the denominator 5; the pieces are still fifths",
        "Multiply the numerators instead",
        "Invert the second fraction first",
      ],
      "Adding two fifths and one fifth gives three fifths. The size of each piece stays the same.",
      "Does combining pieces change the size of each piece?",
    ],
  ],
  multiplication: [
    [
      "Which setup finds 2/3 of 3/5?",
      ["(2 × 3) / (3 × 5)", "2/3 + 3/5", "(2 × 5) / (3 × 3)"],
      "“Of” means multiplication here. Multiply numerators and denominators: 6/15 = 2/5.",
      "Think about taking part of an amount.",
    ],
    [
      "A student writes 2/3 × 1/4 = 3/7. Which rule needs fixing?",
      [
        "Multiply across instead of adding across",
        "Invert both fractions before multiplying",
        "Keep the first denominator for every product",
      ],
      "The product is (2 × 1)/(3 × 4) = 2/12 = 1/6. Adding across does not represent taking a fraction of a fraction.",
      "How are the top and bottom numbers combined in multiplication?",
    ],
  ],
  division: [
    [
      "Which setup finds how many 1/4 portions fit into 3/4?",
      ["(3/4) × (4/1)", "(3/4) × (1/4)", "(4/3) × (4/1)"],
      "Divide by the portion size: (3/4) ÷ (1/4) = (3/4) × (4/1) = 3 portions.",
      "The portion size is the divisor. Which fraction gets inverted?",
    ],
    [
      "Someone solves (2/3) ÷ (1/5) by inverting both fractions. What needs fixing?",
      [
        "Keep 2/3 and multiply by the reciprocal of 1/5",
        "Invert only the first fraction",
        "Find a common denominator and add",
      ],
      "Only the divisor is inverted: (2/3) ÷ (1/5) = (2/3) × 5 = 10/3.",
      "Keep track of which quantity is being divided and which is the divisor.",
    ],
  ],
};

export function createRecallSession(focus = "mixed", seed = Date.now() % 1000) {
  const pool =
    focus === "mixed" ? concepts : concepts.filter((c) => c.id === focus);
  if (!pool.length) throw new Error("Choose an available skill.");
  const questions = Array.from({ length: 6 }, (_, i) => {
    const concept = pool[(seed + i) % pool.length];
    let q = makeProblem(concept.id, seed + i, "rule");
    const variant = (Math.floor(seed / pool.length) + i) % 3;
    if (variant > 0) {
      const [question, options, explanation, hint] =
        puzzles[concept.id][variant - 1];
      q = { ...q, question, options, explanation, hint, answer: 0 };
    }
    q.family = ["rule-recall", "next-step", "repair-rule"][variant];
    const indexed = q.options.map((label, index) => ({
      label,
      correct: index === q.answer,
    }));
    const shift = (seed + i) % indexed.length;
    const shuffled = [...indexed.slice(shift), ...indexed.slice(0, shift)];
    return {
      ...q,
      id: `recall-${seed}-${i}`,
      options: shuffled.map((o) => o.label),
      answer: shuffled.findIndex((o) => o.correct),
      hint:
        q.hint ||
        "Think about what the operation means, and which choice preserves that meaning.",
    };
  });
  return {
    id: crypto.randomUUID(),
    focus,
    questions,
    index: 0,
    input: "",
    checked: false,
    helped: false,
    reveal: false,
    hint: false,
    answers: [],
    completed: false,
    createdAt: new Date().toISOString(),
  };
}
export function submitRecall(session) {
  if (session.checked || session.input === "" || session.completed)
    return session;
  const q = session.questions[session.index];
  if (choiceIndex(session.input, q.options) === null) return session;
  const previous = session.answers.filter(
    (a) => a.problemInstanceId === `${session.id}:${session.index}`,
  );
  const correct = Number(session.input) === q.answer;
  const record = {
    id: `${session.id}:${session.index}:${previous.length}`,
    sessionId: session.id,
    problemInstanceId: `${session.id}:${session.index}`,
    conceptId: q.conceptId,
    question: q.question,
    submittedAnswer: q.options[Number(session.input)],
    expectedAnswer: q.options[q.answer],
    explanation: q.explanation,
    isCorrect: correct,
    assisted: session.helped || previous.length > 0,
    evidenceType: "recognition",
    timestamp: new Date().toISOString(),
  };
  return {
    ...session,
    answers: [...session.answers, record],
    checked: true,
    hint: !correct,
    helped: session.helped || !correct,
  };
}
