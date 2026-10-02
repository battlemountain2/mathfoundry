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
