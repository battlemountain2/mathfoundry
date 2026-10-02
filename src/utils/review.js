// Human-readable answers retain format-specific meaning, rather than raw indices.
export function displayAnswer(problem, answer) {
  if (answer === null || answer === undefined) return "Not answered";
  if (problem.format === "sequence")
    return answer.map((i) => problem.steps?.[i] ?? `Step ${i + 1}`).join(" → ");
  if (problem.format === "blunder")
    return `Step ${answer + 1}: ${problem.steps?.[answer] ?? ""}`;
  if (problem.format === "tf-reason")
    return `${answer.isTrue ? "True" : "False"} — ${problem.reasonOptions?.[answer.reasonIdx] ?? ""}`;
  if (problem.options && typeof answer === "number")
    return problem.options[answer] ?? String(answer);
  return String(answer);
}
export function expectedAnswer(problem) {
  if (problem.format === "sequence")
    return displayAnswer(problem, problem.correctOrder);
  if (problem.format === "blunder")
    return displayAnswer(problem, problem.correctStep);
  if (problem.format === "tf-reason")
    return displayAnswer(problem, {
      isTrue: problem.isTrue,
      reasonIdx: problem.correctReason,
    });
  return displayAnswer(problem, problem.correctAnswer ?? problem.answer);
}
export function quizReview(questions, answers) {
  return questions.map((problem, i) => ({
    id: `question-${i}`,
    question: problem.question,
    problem: { ...problem, format: "mcq" },
    moduleId:
      problem.moduleId ||
      { "basic-shapes": "points-lines", "coordinate-geometry": "coordinate" }[
        problem.category
      ] ||
      problem.category,
    submittedAnswer: displayAnswer(problem, answers[i]),
    expectedAnswer: expectedAnswer(problem),
    explanation: problem.explanation,
    isCorrect: answers[i] === problem.correctAnswer,
    skipped: answers[i] === undefined,
  }));
}
export function foundationHistory(attempts) {
  const groups = new Map();
  for (const attempt of attempts) {
    const id = attempt.sessionId || "legacy-foundations";
    if (!groups.has(id))
      groups.set(id, {
        id,
        title: "Arithmetic & fractions",
        answers: [],
        timestamp: attempt.timestamp,
      });
    const group = groups.get(id);
    group.answers.push(attempt);
    group.timestamp = attempt.timestamp;
  }
  return [...groups.values()];
}
