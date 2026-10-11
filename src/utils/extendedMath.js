const gcd = (a, b) => b ? gcd(b, a % b) : a;

// Vetted introductory families. Each model carries the same parameters as its question.
export function makeExtendedMathProblem(id, seed = 0) {
  const s = Math.abs(Math.trunc(seed));
  const n = 2 + s % 8, k = 2 + Math.floor(s / 8) % 5;
  const base = {id:`${id}-studio-${s}`, conceptId:id, format:'numeric', evidenceType:'application'};
  let q;
  switch (id) {
    case 'negative-numbers': {
      const a = -n, b = k, subtract = s % 2 === 1;
      const answer = subtract ? a - b : a + b;
      q = {question:`Calculate ${a} ${subtract ? '−' : '+'} ${b}.`, answer:String(answer), steps:[`Start at ${a} on the number line.`, `Move ${b} places ${subtract ? 'left to subtract' : 'right to add'}.`, `Finish at ${answer}.`], visual:{kind:'number-line', start:a, change:subtract ? -b : b}, keyIssue:'Adding a positive quantity moves right; subtracting it moves left.'}; break;
    }
    case 'decimals-place-value': {
      const hundredths = 10 + s % 80;
      q = {question:`Write ${hundredths} hundredths as a decimal.`,answer:String(hundredths / 100),steps:['One whole contains 100 hundredths.',`${hundredths} hundredths is ${hundredths}/100.`,`${hundredths}/100 = ${(hundredths / 100).toFixed(2)}.`],visual:{kind:'hundred-grid',count:hundredths},keyIssue:'Hundredths belong two places to the right of the decimal point.'}; break;
    }
    case 'ratios-percentages': {
      const percent = 10 * (1 + s % 9), total = 10 * (2 + Math.floor(s / 9) % 8);
      q = {question:`What is ${percent}% of ${total}?`,answer:String(percent * total / 100),steps:[`${percent}% means ${percent}/100.`,`Multiply ${total} by ${percent}/100.`,`${total} × ${percent}/100 = ${percent * total / 100}.`],visual:{kind:'ratio',percent,total},keyIssue:'Percent describes a part of the stated whole; first identify which quantity is the whole.'}; break;
    }
    case 'factors-multiples': {
      const a = n * k, b = n * (k + 1), answer = gcd(a,b);
      q = {question:`Find the greatest common divisor of ${a} and ${b}.`,answer:String(answer),steps:[`${a} = ${n} × ${k}; ${b} = ${n} × ${k + 1}.`,`${k} and ${k + 1} share no factor greater than 1.`,`The greatest shared factor is ${answer}.`],visual:{kind:'factors',a,b},keyIssue:'A common divisor must divide both numbers without a remainder; choose the largest such divisor.'}; break;
    }
    case 'order-of-operations': {
      const a = n + 3, b = k, c = 2 + s % 4;
      q = {question:`Evaluate ${a} + ${b} × ${c}.`,answer:String(a + b * c),steps:['There are no brackets or exponents here.',`Multiply first: ${b} × ${c} = ${b * c}.`,`Then add: ${a} + ${b * c} = ${a + b * c}.`],visual:{kind:'expression',a,b,c},keyIssue:'Multiplication takes precedence over addition in this expression.'}; break;
    }
    case 'intro-algebra': {
      const a = k, b = n, x = 1 + s % 8, total = a * x + b;
      q = {question:`Solve ${a}x + ${b} = ${total}. Enter x.`,answer:String(x),steps:[`Subtract ${b} from both sides: ${a}x = ${total - b}.`,`Divide both sides by ${a}: x = ${x}.`,`Check: ${a} × ${x} + ${b} = ${total}.`],visual:{kind:'balance',a,b,total},moduleId:'linear-equations',subskill:'linear-equations-twostep',keyIssue:'Keep both sides equal: undo the added amount on both sides, then undo multiplication.'}; break;
    }
    default: return null;
  }
  return {...base,...q,explanation:q.steps.join(' '),hint:q.steps[0]};
}
