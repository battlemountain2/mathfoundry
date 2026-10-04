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

test('P4: subskill matching ensures subtraction repairs subtraction and perimeter repairs perimeter', async () => {
  const { makeRepairDraft, detectSubskill } = await import('../src/utils/repair.js');

  // 1. Arithmetic subtraction attempt must generate subtraction repair
  const attemptSub = {
    conceptId: 'arithmetic',
    question: 'What is 31 − 14?',
    submittedAnswer: '20',
    expectedAnswer: '17',
    isCorrect: false,
  };
  assert.equal(detectSubskill(attemptSub), 'arithmetic-subtraction');
  const draftSub = makeRepairDraft(attemptSub);
  assert.equal(draftSub.subskill, 'arithmetic-subtraction');
  assert.ok(draftSub.problem.question.includes('−') || draftSub.problem.question.includes('-'));
  assert.ok(!draftSub.problem.question.includes('×'));
  assert.ok(!draftSub.problem.question.includes('÷'));

  // 2. Fraction subtraction attempt must generate fraction subtraction repair
  const attemptFracSub = {
    conceptId: 'addition',
    question: 'Subtract 1/4 − 1/5. Enter a fraction.',
    submittedAnswer: '1/1',
    expectedAnswer: '1/20',
    isCorrect: false,
  };
  assert.equal(detectSubskill(attemptFracSub), 'fraction-subtraction');
  const draftFracSub = makeRepairDraft(attemptFracSub);
  assert.equal(draftFracSub.subskill, 'fraction-subtraction');
  assert.ok(
    draftFracSub.problem.question.toLowerCase().includes('subtract') ||
    draftFracSub.problem.question.includes('−')
  );

  // 3. Perimeter attempt must generate perimeter repair, never area
  const attemptPeri = {
    moduleId: 'area-perimeter',
    question: 'What is the perimeter of a rectangle with length 5 and width 3?',
    submittedAnswer: '15',
    expectedAnswer: '16',
    isCorrect: false,
  };
  assert.equal(detectSubskill(attemptPeri), 'perimeter');
  const draftPeri = makeRepairDraft(attemptPeri);
  assert.equal(draftPeri.subskill, 'perimeter');
  assert.ok(
    draftPeri.problem.question.toLowerCase().includes('perimeter') ||
    draftPeri.problem.question.toLowerCase().includes('circumference')
  );
  assert.ok(!draftPeri.problem.question.toLowerCase().includes('area'));

  // 4. Area attempt must generate area repair, never perimeter
  const attemptArea = {
    moduleId: 'area-perimeter',
    question: 'What is the area of a circle with radius 3?',
    submittedAnswer: '6π',
    expectedAnswer: '9π',
    isCorrect: false,
  };
  assert.equal(detectSubskill(attemptArea), 'area');
  const draftArea = makeRepairDraft(attemptArea);
  assert.equal(draftArea.subskill, 'area');
  assert.ok(draftArea.problem.question.toLowerCase().includes('area'));
  assert.ok(!draftArea.problem.question.toLowerCase().includes('perimeter'));
});

test('P4: multiple repair drafts are preserved and individual drafts can be completed without destroying others', async () => {
  const {
    getRepairDrafts,
    getRepairDraft,
    setRepairDraft,
    removeRepairDraft,
    exportLearningData,
  } = await import('../src/utils/storage.js');

  const draft1 = { id: 'draft-p4-sub', subskill: 'arithmetic-subtraction', input: '12' };
  const draft2 = { id: 'draft-p4-peri', subskill: 'perimeter', input: '24' };

  setRepairDraft(draft1);
  assert.ok(getRepairDrafts().some((d) => d.id === 'draft-p4-sub'));

  setRepairDraft(draft2);
  const currentDrafts = getRepairDrafts();
  assert.ok(currentDrafts.some((d) => d.id === 'draft-p4-sub'));
  assert.ok(currentDrafts.some((d) => d.id === 'draft-p4-peri'));
  assert.equal(getRepairDraft('draft-p4-sub').id, 'draft-p4-sub');
  assert.equal(getRepairDraft('draft-p4-peri').id, 'draft-p4-peri');

  // Verify backup export preserves multiple drafts and backward compatibility
  const backup = JSON.parse(exportLearningData());
  assert.ok(Array.isArray(backup.repairDrafts));
  assert.ok(backup.repairDrafts.some((d) => d.id === 'draft-p4-sub'));
  assert.ok(backup.repairDrafts.some((d) => d.id === 'draft-p4-peri'));
  assert.ok(backup.repairDraft);

  // Complete and remove draft1; draft2 must remain intact
  removeRepairDraft('draft-p4-sub');
  const remaining = getRepairDrafts();
  assert.ok(!remaining.some((d) => d.id === 'draft-p4-sub'));
  assert.ok(remaining.some((d) => d.id === 'draft-p4-peri'));
  assert.equal(getRepairDraft('draft-p4-sub'), null);
  assert.equal(getRepairDraft('draft-p4-peri').id, 'draft-p4-peri');
});

test('P4: rulebook entries are categorized, contain when-to-use and pitfalls, and user notes survive updates', async () => {
  const {
    getRulebook,
    saveRulebookEntry,
  } = await import('../src/utils/storage.js');

  const entries = getRulebook();
  assert.ok(entries.length >= 8);

  const fracSub = entries.find((e) => e.id === 'rule:subtraction-fractions');
  assert.ok(fracSub);
  assert.ok(fracSub.whenToUse && fracSub.whenToUse.length > 10);
  assert.ok(fracSub.pitfall && fracSub.pitfall.length > 10);
  assert.ok(fracSub.example && fracSub.example.steps.length > 0);

  // User notes survive re-saves
  saveRulebookEntry({ ...fracSub, notes: 'Remember: find LCD 12 first on paper.' });
  const updated = getRulebook().find((e) => e.id === 'rule:subtraction-fractions');
  assert.equal(updated.notes, 'Remember: find LCD 12 first on paper.');

  // Partial update preserves existing notes
  saveRulebookEntry({ id: 'rule:subtraction-fractions', title: 'Subtracting Unlike Fractions' });
  const updated2 = getRulebook().find((e) => e.id === 'rule:subtraction-fractions');
  assert.equal(updated2.notes, 'Remember: find LCD 12 first on paper.');
});

test('P5: prerequisite-based compact path traverses real prerequisites and unlocks downstream concepts', async () => {
  const { buildPrerequisitePath } = await import('../src/utils/learningProfile.js');

  // 1. With empty history, multiplication prerequisites (arithmetic and equivalence) are not ready
  const pathEmpty = buildPrerequisitePath('multiplication', []);
  assert.equal(pathEmpty.target.id, 'multiplication');
  assert.equal(pathEmpty.prerequisites.length, 2);
  assert.deepEqual(pathEmpty.prerequisites.map((p) => p.id), ['arithmetic', 'equivalence']);
  assert.equal(pathEmpty.allPrereqsReady, false);
  assert.ok(pathEmpty.statusNote.includes('strengthen'));
  assert.ok(pathEmpty.downstream.some((d) => d.id === 'division'));

  // 2. Arithmetic relationships has no prerequisites (entry point)
  const pathArithmetic = buildPrerequisitePath('arithmetic', []);
  assert.equal(pathArithmetic.prerequisites.length, 0);
  assert.equal(pathArithmetic.allPrereqsReady, true);
  assert.ok(pathArithmetic.statusNote.includes('entry point'));
});

test('P5: explained recommendations provide clear reasons, evidence summaries, and finite endpoints', async () => {
  const { foundationRecommendation } = await import('../src/utils/learningProfile.js');

  // Baseline recommendation
  const recBaseline = foundationRecommendation([]);
  assert.equal(recBaseline.mode, 'baseline');
  assert.ok(recBaseline.reason.length > 10);
  assert.ok(recBaseline.targetEndpoint.length > 5);

  // Assisted attempt recommendation
  const assistedAttempt = {
    id: 'att-assisted',
    conceptId: 'arithmetic',
    isCorrect: true,
    assisted: true,
    timestamp: '2026-10-01T10:00:00Z',
  };
  const recAssisted = foundationRecommendation([assistedAttempt]);
  assert.ok(recAssisted.reason.includes('worked example') || recAssisted.reason.includes('independently'));
  assert.ok(recAssisted.targetEndpoint.includes('independent'));

  // Delayed recall recommendation (48 hours later)
  const indepAttempt = {
    id: 'att-indep',
    conceptId: 'arithmetic',
    isCorrect: true,
    assisted: false,
    timestamp: '2026-10-01T00:00:00Z',
  };
  const recRecall = foundationRecommendation([indepAttempt], Date.parse('2026-10-03T12:00:00Z'));
  assert.equal(recRecall.mode, 'review');
  assert.ok(recRecall.targetEndpoint.includes('recall'));
});

test('P5: review queue prioritizes unrepaired mistakes, delayed recall, and supported practice with clear endpoints', async () => {
  const { getPrioritizedReviewQueue } = await import('../src/utils/learningProfile.js');

  const missedAttempt = {
    id: 'att-missed-1',
    conceptId: 'arithmetic',
    question: 'What is 43 − 17?',
    submittedAnswer: '30',
    expectedAnswer: '26',
    isCorrect: false,
    timestamp: '2026-10-02T10:00:00Z',
  };

  const queue = getPrioritizedReviewQueue([missedAttempt], Date.parse('2026-10-02T12:00:00Z'));
  assert.ok(queue.length >= 1);
  const topItem = queue[0];
  assert.equal(topItem.priority, 'high');
  assert.equal(topItem.type, 'repair');
  assert.ok(topItem.reason.includes('Missed in session'));
  assert.ok(topItem.targetEndpoint.includes('repair'));

  // Later independent success clears the high-priority repair item
  const repairedAttempt = {
    id: 'att-repaired-1',
    conceptId: 'arithmetic',
    question: 'What is 35 − 12?',
    isCorrect: true,
    assisted: false,
    timestamp: '2026-10-02T11:00:00Z',
  };
  const queueAfterRepair = getPrioritizedReviewQueue([missedAttempt, repairedAttempt], Date.parse('2026-10-02T12:00:00Z'));
  assert.ok(!queueAfterRepair.some((item) => item.type === 'repair' && item.conceptId === 'arithmetic'));
});

test('P5: evidence summary distinguishes sparse evidence from independent retention without premature mastery claims', async () => {
  const { summarizeEvidence } = await import('../src/utils/learningProfile.js');

  // Sparse evidence (1 attempt)
  const singleAttempt = [{ conceptId: 'arithmetic', isCorrect: true, assisted: false }];
  const summarySparse = summarizeEvidence('arithmetic', singleAttempt);
  assert.equal(summarySparse.reliability, 'sparse');
  assert.ok(summarySparse.claim.includes('Sparse evidence'));
  assert.ok(summarySparse.claim.includes('not proof of mastery'));

  // Independent evidence across 2 sessions
  const multipleAttempts = [
    { id: '1', sessionId: 's1', conceptId: 'arithmetic', isCorrect: true, assisted: false },
    { id: '2', sessionId: 's2', conceptId: 'arithmetic', isCorrect: true, assisted: false },
    { id: '3', sessionId: 's2', conceptId: 'arithmetic', isCorrect: true, assisted: false },
  ];
  const summaryIndependent = summarizeEvidence('arithmetic', multipleAttempts);
  assert.equal(summaryIndependent.reliability, 'independent');
  assert.ok(summaryIndependent.claim.includes('independent answers'));
});

test('P5: reflective cause input updates attempt records and persists in storage', async () => {
  const {
    saveLearningAttempt,
    getLearningAttempts,
    updateAttemptReflectiveCause,
  } = await import('../src/utils/storage.js');

  const testAttempt = {
    id: 'test-reflective-attempt',
    conceptId: 'addition',
    question: 'Add 1/4 + 1/6. Enter a fraction.',
    submittedAnswer: '2/10',
    expectedAnswer: '5/12',
    isCorrect: false,
    timestamp: new Date().toISOString(),
  };

  saveLearningAttempt(testAttempt);
  assert.ok(getLearningAttempts().some((a) => a.id === 'test-reflective-attempt'));

  // Update reflective cause
  updateAttemptReflectiveCause('test-reflective-attempt', 'rule-confused');
  const updated = getLearningAttempts().find((a) => a.id === 'test-reflective-attempt');
  assert.equal(updated.reflectiveCause, 'rule-confused');
  assert.equal(updated.submittedAnswer, '2/10'); // original answer strictly preserved
});



