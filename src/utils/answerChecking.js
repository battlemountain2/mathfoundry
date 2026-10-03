// Restricted numeric parser: no eval, expressions, or executable input.
export function numericValue(input) {
  const text = String(input).trim().replaceAll('−', '-');
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return Number(text);
  const fraction = text.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
  if (fraction && Number(fraction[2]) !== 0) return Number(fraction[1]) / Number(fraction[2]);
  return null;
}
export function equivalentAnswer(answer, expected) {
  if (!String(answer).trim()) return false;
  const a = numericValue(answer), b = numericValue(expected);
  return a !== null && b !== null ? Math.abs(a-b) <= 1e-9 * Math.max(1,Math.abs(b)) : String(answer).trim() === String(expected).trim();
}
export function checkPracticeAnswer(q, answer) {
  switch(q.format) {
    case 'mcq': return answer === q.correctAnswer;
    case 'blunder': return answer === q.correctStep;
    case 'fill': return q.acceptableAnswers.some(expected => equivalentAnswer(answer, expected));
    case 'sequence': return [q.correctOrder, ...(q.acceptableOrders || [])].some(order => JSON.stringify(answer) === JSON.stringify(order));
    case 'tf-reason': return answer.isTrue === q.isTrue && answer.reasonIdx === q.correctReason;
    default: return false;
  }
}

const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);

// Analyzes an optional learner-submitted intermediate step without guessing unwritten work.
// Supports valid alternative methods (including non-least common denominators) and detects common pitfalls.
export function analyzeIntermediateStep(problem, stepText) {
  if (!stepText || !String(stepText).trim()) return null;
  const text = String(stepText).trim();
  const num = numericValue(text);

  if (problem?.conceptId === 'addition' && problem.question) {
    const match = problem.question.match(/1\/(\d+)\s*([+−-])\s*1\/(\d+)/);
    if (match) {
      const d1 = Number(match[1]);
      const d2 = Number(match[3]);
      if (num !== null && Number.isInteger(num) && num > 0) {
        if (num % d1 === 0 && num % d2 === 0) {
          const lcm = (d1 * d2) / gcd(d1, d2);
          const isLcm = num === lcm;
          return {
            valid: true,
            type: 'common-denominator',
            message: isLcm
              ? `Common denominator ${num} is the least common denominator.`
              : `Common denominator ${num} is a valid common multiple of ${d1} and ${d2}.`,
          };
        }
        if (num === d1 + d2) {
          return {
            valid: false,
            type: 'added-denominators',
            message: `Entered ${num} is the sum of denominators (${d1} + ${d2}), but combining fractions requires a common multiple.`,
          };
        }
      }
    }
  }

  if (problem?.conceptId === 'arithmetic') {
    if (num !== null) {
      return {
        valid: true,
        type: 'intermediate-value',
        message: `Intermediate value noted: ${text}`,
      };
    }
  }

  return {
    valid: true,
    type: 'learner-step',
    message: `Step noted: ${text}`,
  };
}
