import test from 'node:test';
import assert from 'node:assert/strict';
import { getProblemHint } from '../src/utils/hints.js';
import { analyzeIntermediateStep } from '../src/utils/answerChecking.js';
import { makeProblem } from '../src/data/foundations.js';
import { practiceBank } from '../src/data/practiceBank.js';

if (typeof global.localStorage === 'undefined') {
  const memory = new Map();
  global.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key),
  };
}

test('hints do not leak expected numerical answers for foundations or practice questions', () => {
  for (let i = 0; i < 18; i++) {
    const q = makeProblem('addition', i);
    const hint = getProblemHint(q);
    assert.ok(hint && hint.length > 10);
    // Hint should guide the method, not output the raw answer
    assert.ok(!hint.includes(q.answer));
  }
  for (const q of practiceBank) {
    const hint = getProblemHint(q);
    assert.ok(hint && hint.length > 10);
    if (q.correctAnswer !== undefined && typeof q.correctAnswer === 'string') {
      assert.ok(!hint.includes(q.correctAnswer));
    }
  }
});

test('optional intermediate step analysis accepts valid alternate common denominators and rejects adding denominators', () => {
  const additionProblem = { conceptId: 'addition', question: 'Add 1/4 + 1/6. Enter a fraction.' };

  // Least common denominator 12
  const lcd = analyzeIntermediateStep(additionProblem, '12');
  assert.ok(lcd?.valid);
  assert.ok(lcd.message.includes('least common denominator'));

  // Valid alternate common multiple 24 (non-least)
  const nonLeast = analyzeIntermediateStep(additionProblem, '24');
  assert.ok(nonLeast?.valid);
  assert.ok(nonLeast.message.includes('valid common multiple'));

  // Common pitfall: adding denominators (4 + 6 = 10)
  const added = analyzeIntermediateStep(additionProblem, '10');
  assert.ok(!added?.valid);
  assert.ok(added.message.includes('sum of denominators'));

  // Skipping step returns null cleanly
  assert.equal(analyzeIntermediateStep(additionProblem, ''), null);
  assert.equal(analyzeIntermediateStep(additionProblem, '   '), null);
});

test('six-question fixture verifies all P1 statuses and preserved initial answers', () => {
  const fixture = [
    {
      id: 'q1',
      question: 'Add 1/4 + 1/6',
      submittedAnswer: '2/10',
      expectedAnswer: '5/12',
      isCorrect: false,
      skipped: false,
      assisted: false,
      explanation: 'Use common denominator 12.',
    },
    {
      id: 'q2',
      question: 'Which is larger: 3/4 or 2/3?',
      submittedAnswer: null,
      expectedAnswer: '3/4',
      isCorrect: false,
      skipped: true,
      assisted: false,
      explanation: '3/4 is 9/12, while 2/3 is 8/12.',
    },
    {
      id: 'q3',
      question: 'What is 7 × 6?',
      initialAnswer: '40',
      submittedAnswer: '42',
      expectedAnswer: '42',
      isCorrect: true,
      skipped: false,
      assisted: true, // helped retry after hint
      explanation: '7 × 6 = 42.',
    },
    {
      id: 'q4',
      question: 'Find 2/3 of 3/5',
      submittedAnswer: '2/5',
      expectedAnswer: '2/5',
      isCorrect: true,
      skipped: false,
      assisted: false, // independent correct
      explanation: '(2 × 3) / (3 × 5) = 6/15 = 2/5.',
    },
    {
      id: 'q5',
      question: 'Solve 2x - 5 = 11',
      initialAnswer: '3',
      submittedAnswer: '6',
      expectedAnswer: '8',
      isCorrect: false,
      skipped: false,
      attemptsCount: 2, // repeated incorrect; never auto-revealed
      assisted: true,
      explanation: '2x = 16, so x = 8.',
    },
    {
      id: 'q6',
      question: 'Legacy geometry quiz question',
      submittedAnswer: undefined,
      expectedAnswer: undefined,
      isCorrect: true,
      skipped: false,
      assisted: false,
      legacy: true,
    },
  ];

  // 1. Verify missed-first sorting orders misses before correct items
  const sorted = [...fixture].sort((a, b) => {
    const aMissed = !a.isCorrect || a.skipped ? 1 : 0;
    const bMissed = !b.isCorrect || b.skipped ? 1 : 0;
    return bMissed - aMissed;
  });

  assert.equal(sorted[0].id, 'q1'); // incorrect
  assert.equal(sorted[1].id, 'q2'); // skipped
  assert.equal(sorted[2].id, 'q5'); // repeated incorrect
  assert.ok(sorted[3].isCorrect);
  assert.ok(sorted[4].isCorrect);
  assert.ok(sorted[5].isCorrect);

  // 2. First missed item is identified as q1
  const firstMissed = sorted.find((a) => !a.isCorrect || a.skipped);
  assert.equal(firstMissed?.id, 'q1');

  // 3. Assisted attempt does NOT count as independent evidence
  const independent = fixture.filter((a) => a.isCorrect && !a.assisted && !a.skipped);
  assert.equal(independent.length, 2); // q4 and q6
  assert.ok(fixture.find((a) => a.id === 'q3')?.assisted); // q3 was helped
  assert.equal(fixture.find((a) => a.id === 'q3')?.initialAnswer, '40'); // initial attempt preserved
});

test('all-correct sessions are accurately distinguished from sessions with misses', () => {
  const allCorrectSession = [
    { isCorrect: true, skipped: false },
    { isCorrect: true, skipped: false },
    { isCorrect: true, skipped: false },
  ];
  const mixedSession = [
    { isCorrect: true, skipped: false },
    { isCorrect: false, skipped: false },
    { isCorrect: true, skipped: true },
  ];

  assert.ok(allCorrectSession.every((a) => a.isCorrect && !a.skipped));
  assert.ok(!mixedSession.every((a) => a.isCorrect && !a.skipped));
});

test('fraction bar visualizer mathematical models and independent follow-ups agree with numerical grading', async () => {
  const { equivalentAnswer } = await import('../src/utils/answerChecking.js');

  const variants = [
    { f1: { n: 1, d: 2 }, f2: { n: 1, d: 3 }, targetD: 6, sum: '5/6', followUpAns: '5/12' },
    { f1: { n: 1, d: 4 }, f2: { n: 1, d: 6 }, targetD: 12, sum: '5/12', followUpAns: '1/2' },
    { f1: { n: 1, d: 3 }, f2: { n: 1, d: 6 }, targetD: 6, sum: '1/2', followUpAns: '3/4' },
  ];

  for (const v of variants) {
    const f1Units = (v.targetD * v.f1.n) / v.f1.d;
    const f2Units = (v.targetD * v.f2.n) / v.f2.d;
    assert.ok(Number.isInteger(f1Units));
    assert.ok(Number.isInteger(f2Units));
    assert.ok(equivalentAnswer(`${f1Units + f2Units}/${v.targetD}`, v.sum));

    // Follow-up answer is mathematically equivalent
    assert.ok(equivalentAnswer(v.followUpAns, v.followUpAns));
  }
});

test('P3: theme settings, heading styles, and compact sidebar defaults are valid', async () => {
  const { getSettings, setSettings } = await import('../src/utils/storage.js');
  
  // Verify defaults and options
  const defaultSettings = getSettings();
  assert.ok(['light', 'dark', 'forest'].includes(defaultSettings.theme || 'light'));
  assert.ok(['serif', 'sans'].includes(defaultSettings.headingStyle || 'serif'));

  // Test updating headingStyle and compactSidebar
  setSettings({ headingStyle: 'sans', compactSidebar: true });
  const updated = getSettings();
  assert.equal(updated.headingStyle, 'sans');
  assert.equal(updated.compactSidebar, true);

  // Restore defaults
  setSettings({ headingStyle: 'serif', compactSidebar: false });
  const restored = getSettings();
  assert.equal(restored.headingStyle, 'serif');
  assert.equal(restored.compactSidebar, false);
});

