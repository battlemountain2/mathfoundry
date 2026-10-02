/**
 * Score a diagnostic quiz and identify weak areas.
 * Each question has a `category` field. We group by category and calculate percentages.
 */
export function scoreDiagnostic(questions, answers) {
  const categories = {};

  questions.forEach((q, idx) => {
    const cat = q.category;
    if (!categories[cat]) {
      categories[cat] = { total: 0, correct: 0 };
    }
    categories[cat].total += 1;
    if (answers[idx] === q.correctAnswer) {
      categories[cat].correct += 1;
    }
  });

  const results = {};
  let totalCorrect = 0;
  let totalQuestions = 0;

  Object.entries(categories).forEach(([cat, data]) => {
    const pct = Math.round((data.correct / data.total) * 100);
    results[cat] = {
      correct: data.correct,
      total: data.total,
      percentage: pct,
      level: pct >= 80 ? 'strong' : pct >= 50 ? 'moderate' : 'weak',
    };
    totalCorrect += data.correct;
    totalQuestions += data.total;
  });

  return {
    categories: results,
    overallScore: Math.round((totalCorrect / totalQuestions) * 100),
    totalCorrect,
    totalQuestions,
    weakAreas: Object.entries(results)
      .filter(([, data]) => data.level === 'weak')
      .map(([cat]) => cat),
    moderateAreas: Object.entries(results)
      .filter(([, data]) => data.level === 'moderate')
      .map(([cat]) => cat),
    strongAreas: Object.entries(results)
      .filter(([, data]) => data.level === 'strong')
      .map(([cat]) => cat),
  };
}

/**
 * Score a module quiz. Returns score object.
 */
export function scoreQuiz(questions, answers) {
  let correct = 0;
  const details = questions.map((q, idx) => {
    const isCorrect = answers[idx] === q.correctAnswer;
    if (isCorrect) correct += 1;
    return {
      questionIndex: idx,
      isCorrect,
      userAnswer: answers[idx],
      correctAnswer: q.correctAnswer,
    };
  });

  return {
    correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
    passed: correct / questions.length >= 0.7,
    details,
  };
}

/**
 * Get recommended modules based on diagnostic results.
 */
export function getRecommendedModules(diagnosticResults, modules) {
  if (!diagnosticResults) return modules;

  const { weakAreas, moderateAreas } = diagnosticResults;

  // Sort: weak areas first, then moderate, then strong
  return [...modules].sort((a, b) => {
    const aIsWeak = weakAreas.includes(a.category);
    const bIsWeak = weakAreas.includes(b.category);
    const aIsMod = moderateAreas.includes(a.category);
    const bIsMod = moderateAreas.includes(b.category);

    if (aIsWeak && !bIsWeak) return -1;
    if (!aIsWeak && bIsWeak) return 1;
    if (aIsMod && !bIsMod) return -1;
    if (!aIsMod && bIsMod) return 1;
    return a.order - b.order;
  });
}
