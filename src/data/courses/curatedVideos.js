/**
 * src/data/courses/curatedVideos.js
 *
 * Curated high-yield video lectures for Math Foundations units.
 * Features Professor Leonard, The Organic Chemistry Tutor, and 3Blue1Brown.
 */

export const curatedUnitVideos = {
  'arithmetic': {
    title: 'Mental Math Tricks — Addition, Subtraction, Multiplication & Division',
    creator: 'The Organic Chemistry Tutor',
    channel: 'Math Foundations',
    embedId: 'kGg16-Xq9oM',
    duration: '14 min',
    takeaways: [
      'Decompose difficult products: 7 × 6 = (5 × 6) + (2 × 6) = 30 + 12 = 42',
      'Check division with multiplication: 42 ÷ 6 = 7 because 7 × 6 = 42',
      'Use paper for scratch calculations without mental strain',
    ],
  },
  'equivalent-fractions': {
    title: 'Equivalent Fractions Made Easy',
    creator: 'The Organic Chemistry Tutor',
    channel: 'Algebra Foundations',
    embedId: 'qcSHAXPrWlo',
    duration: '10 min',
    takeaways: [
      'Multiplying or dividing top and bottom by the same number preserves the fraction value',
      'Smaller slices increase the count of pieces, not the physical quantity',
      'Simplifying means dividing by the greatest common factor',
    ],
  },
  'compare-fractions': {
    title: 'Comparing Fractions with Different Denominators',
    creator: 'The Organic Chemistry Tutor',
    channel: 'Math Tutorials',
    embedId: 'v8JtGfW1g7Q',
    duration: '8 min',
    takeaways: [
      'Reason about size: compare to benchmarks like 1/2 and 1',
      'Convert both fractions to a common denominator to compare equal-sized pieces',
      'Cross-multiplication check: a/b vs c/d -> compare a×d with b×c',
    ],
  },
  'add-subtract-fractions': {
    title: 'Adding and Subtracting Fractions with Unlike Denominators',
    creator: 'The Organic Chemistry Tutor',
    channel: 'Essential Math',
    embedId: '5juto2ze8Lg',
    duration: '11 min',
    takeaways: [
      'Never add denominators: 1/4 + 1/6 is NOT 2/10',
      'Find the Least Common Denominator (LCD) to slice both wholes into equal pieces',
      'Add or subtract the numerators and keep the common denominator constant',
      'Check if the resulting fraction can be simplified',
    ],
  },
  'multiply-fractions': {
    title: 'Multiplying Fractions — Visual Explanation',
    creator: 'The Organic Chemistry Tutor',
    channel: 'Math Foundations',
    embedId: 'qmfXyR7Z6Lk',
    duration: '9 min',
    takeaways: [
      'Multiplication means finding a fraction of a fraction: 1/2 of 1/3',
      'Multiply numerators straight across; multiply denominators straight across',
      'No common denominator required for multiplication',
    ],
  },
  'divide-fractions': {
    title: 'Dividing Fractions: Why Do We Invert and Multiply?',
    creator: 'Professor Leonard',
    channel: 'Basic Mathematics',
    embedId: '4lkq3DgvmJo',
    duration: '14 min',
    takeaways: [
      'Division asks: "How many of this size fit inside that amount?"',
      'Dividing by a fraction is equivalent to multiplying by its reciprocal',
      'Check division by multiplying your quotient by the original divisor',
    ],
  },
};

export function getCuratedVideo(unitId) {
  if (!unitId) return null;
  const cleanId = unitId.replace(/^math\//, '');
  return curatedUnitVideos[cleanId] || null;
}
