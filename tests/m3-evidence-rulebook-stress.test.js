/**
 * tests/m3-evidence-rulebook-stress.test.js
 *
 * Adversarial Empirical Stress Test Suite for Milestone 3: Guided Lesson System
 *
 * Evaluates:
 * 1. Evidence Isolation: 1,000 hostile micro-check inputs (empty, extreme, symbols, spaces, correct, incorrect)
 *    -> Verifies storage.getLearningAttempts() remains EXACTLY 0 and mastery remains untouched.
 * 2. Key-Rule Persistence: 50 rapid-fire saves
 *    -> Verifies strict idempotency (exactly 1 entry), custom notes preservation, zero duplication.
 * 3. Transition Step Completion:
 *    -> Verifies completed: true in lessonProgress without affecting attempt history or mastery.
 * 4. End-to-End Lesson Lifecycle State Machine Simulation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import * as storage from '../src/utils/storage.js';
import { evaluateMicroCheck, createRulebookPayload, getNavigationState } from '../src/utils/lessonPlayer.js';
import { addSubtractFractionsLesson } from '../src/data/lessons/addition.js';

// ============================================================================
// Storage Isolation Test Harness
// ============================================================================

const localMemory = new Map();

if (typeof global.localStorage === 'undefined' || !global.localStorage) {
  global.localStorage = {
    getItem: (key) => localMemory.get(String(key)) ?? null,
    setItem: (key, value) => localMemory.set(String(key), String(value)),
    removeItem: (key) => localMemory.delete(String(key)),
    clear: () => localMemory.clear(),
  };
}

function resetStorage(initialData = null) {
  localMemory.clear();
  if (typeof global.localStorage.clear === 'function') {
    global.localStorage.clear();
  }
  global.localStorage.removeItem('mathfoundry_data');
  global.localStorage.removeItem('mathfoundry_data_before_v2');

  if (initialData !== null) {
    const payload = (initialData && typeof initialData === 'object' && initialData.mathfoundry_data)
      ? initialData.mathfoundry_data
      : initialData;
    global.localStorage.setItem(
      'mathfoundry_data',
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    );
  }
}

test.beforeEach(() => {
  resetStorage();
});

// ============================================================================
// Helper: 1,000 Hostile Input Generator
// ============================================================================

function generate1000HostileInputs() {
  const inputs = [];

  // Category 1: Empty and whitespace strings (50 variants)
  const whitespaces = [
    '',
    ' ',
    '  ',
    '   ',
    '\t',
    '\n',
    '\r\n',
    ' \t\n\r ',
    '\u00A0', // non-breaking space
    '\u200B', // zero-width space
    '\uFEFF', // byte order mark
    '\u202F', // narrow no-break space
    '\u3000', // ideographic space
  ];
  for (let i = 0; i < 50; i++) {
    const ws = whitespaces[i % whitespaces.length] + ' '.repeat(i % 5);
    inputs.push({ value: ws, category: 'whitespace', desc: `ws-${i}` });
  }

  // Category 2: Extreme numeric values and scientific notation (100 variants)
  const extremeNumerics = [
    '0',
    '-0',
    '+0',
    '0.0',
    '-0.0',
    '1e308',
    '-1e308',
    '1e-308',
    '1e+308',
    '1e309', // evaluates to Infinity in JS
    '-1e309',
    'Infinity',
    '-Infinity',
    'NaN',
    '9007199254740991', // MAX_SAFE_INTEGER
    '-9007199254740991', // MIN_SAFE_INTEGER
    '9007199254740992',
    '-9007199254740992',
    '9999999999999999999999999999999999999999999',
    '-9999999999999999999999999999999999999999999',
    '0.00000000000000000000000000000000000000001',
    '12.00000000000000000000000000000000000000001',
    '0000012',
    '0000000',
    '0000.0000',
  ];
  for (let i = 0; i < 100; i++) {
    const base = extremeNumerics[i % extremeNumerics.length];
    const val = i >= extremeNumerics.length ? `${base}.${i}` : base;
    inputs.push({ value: val, category: 'extreme-number', desc: `num-${i}` });
  }

  // Category 3: Symbols, Punctuations, and ASCII noise (150 variants)
  const symbolSets = [
    '!@#$%^&*()',
    '~`-_=+[{]}\\|',
    ';:\'",<.>/?',
    '$$$katex$$$',
    '\\frac{1}{2}',
    '\\sqrt{12}',
    '#VALUE!',
    '#REF!',
    '#DIV/0!',
    'undefined',
    'null',
    'false',
    'true',
    '[object Object]',
  ];
  for (let i = 0; i < 150; i++) {
    const s = symbolSets[i % symbolSets.length] + `_${i}`;
    inputs.push({ value: s, category: 'symbol-noise', desc: `sym-${i}` });
  }

  // Category 4: Code injections (XSS, SQL, shell) (100 variants)
  const injectionPatterns = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert("xss")</script>',
    '<svg onload=alert(1)>',
    "'; DROP TABLE attempts; --",
    "' OR '1'='1",
    '" OR ""="',
    '1; SELECT * FROM users',
    '{{7*7}}',
    '${7*7}',
    'javascript:alert(1)',
    '`rm -rf /`',
    '$(whoami)',
    '&lt;script&gt;',
  ];
  for (let i = 0; i < 100; i++) {
    const inj = injectionPatterns[i % injectionPatterns.length] + ` /* ${i} */`;
    inputs.push({ value: inj, category: 'injection', desc: `inj-${i}` });
  }

  // Category 5: Unicode, Math glyphs, Emojis, and Foreign Alphabets (150 variants)
  const unicodeGlyphs = [
    '½', '⅓', '⅔', '¼', '¾', '⅕', '⅖', '⅗', '⅘', '⅙', '⅚', '⅛', '⅜', '⅝', '⅞',
    'π', '∞', '∑', '√', '±', '≠', '≤', '≥', '÷', '×',
    '🍎', '🍏', '🍕', '🎉', '💯', '🔥', '💩', '👾', '🚀',
    '十二', 'اثنا عشر', 'двенадцать', 'שנים עשר', 'สิบสอง',
    'ñ', 'ü', 'é', 'ç', 'ø', 'å', 'æ', 'ß',
  ];
  for (let i = 0; i < 150; i++) {
    const glyph = unicodeGlyphs[i % unicodeGlyphs.length] + `_${i}`;
    inputs.push({ value: glyph, category: 'unicode', desc: `uni-${i}` });
  }

  // Category 6: Malformed fractions and Division-by-Zero (100 variants)
  const malformedFractions = [
    '1/0',
    '0/0',
    '-1/0',
    '12/0',
    '0/12',
    '1/2/3',
    '1/2/3/4',
    '///',
    '/12',
    '12/',
    '5//12',
    '--5/12',
    '5/-12',
    '-5/-12',
    '+5/+12',
    '1..2/3',
    '1/2.3',
  ];
  for (let i = 0; i < 100; i++) {
    const frac = malformedFractions[i % malformedFractions.length] + (i >= malformedFractions.length ? `_${i}` : '');
    inputs.push({ value: frac, category: 'malformed-fraction', desc: `frac-${i}` });
  }

  // Category 7: Mathematical operations and expressions (100 variants)
  const mathExpressions = [
    '6+6',
    '24/2',
    '3*4',
    '13-1',
    '10+2',
    'sqrt(144)',
    '12^1',
    'x=12',
    '3/12 + 2/12',
    '1/4 + 1/6',
    '2+2=4',
    'log(100)',
  ];
  for (let i = 0; i < 100; i++) {
    const expr = mathExpressions[i % mathExpressions.length] + ` + ${i}`;
    inputs.push({ value: expr, category: 'math-expression', desc: `math-${i}` });
  }

  // Category 8: Typical Incorrect Answers / Common Misconceptions (100 variants)
  const incorrectAnswers = [
    '10', // 4 + 6 added denominators
    '24', // 4 * 6 not LCD
    '2/5', // straight addition 1+1 / 2+3
    '5/24', // added denominators
    '2',
    '3',
    '4',
    '6',
    '8',
    '16',
    '18',
    '36',
    '48',
    '-12',
    '5/10',
    '1/2',
    '1/12',
  ];
  for (let i = 0; i < 100; i++) {
    const inc = incorrectAnswers[i % incorrectAnswers.length] + (i >= incorrectAnswers.length ? `_${i}` : '');
    inputs.push({ value: inc, category: 'misconception-wrong', desc: `wrong-${i}` });
  }

  // Category 9: Boundary Correct Answer Equivalents & Padded Variants (100 variants)
  const correctVariants = [
    '12',
    ' 12 ',
    '  12  ',
    '\t12\t',
    '12.0',
    '12.00',
    '12/1',
    '+12',
    '012',
    '0012',
  ];
  for (let i = 0; i < 100; i++) {
    const c = correctVariants[i % correctVariants.length];
    // Add varying whitespace
    const padded = ' '.repeat(i % 5) + c + ' '.repeat(i % 4);
    inputs.push({ value: padded, category: 'correct-equivalent', desc: `correct-${i}` });
  }

  // Category 10: Long String Stress & Buffer Overflow probes (50 variants)
  for (let i = 0; i < 50; i++) {
    const len = 50 + i * 20; // 50 to 1030 chars
    const str = '12'.repeat(Math.floor(len / 2)) + (i % 2 === 0 ? 'X' : ' ');
    inputs.push({ value: str, category: 'long-string', desc: `long-${i}` });
  }

  assert.equal(inputs.length, 1000, `Must generate exactly 1,000 hostile inputs; generated ${inputs.length}`);
  return inputs;
}

// ============================================================================
// SUITE 1: Evidence Isolation Stress Harness (1,000 Hostile Inputs)
// ============================================================================

test('CHALLENGE 1.1: 1,000 Hostile micro-check submissions leave learningAttempts === 0 and mastery untouched', () => {
  resetStorage({
    mathfoundry_data: {
      learningAttempts: [],
      mastery: {},
      practiceHistory: [],
      recentMistakes: [],
      lessonProgress: {},
    },
  });

  const hostileInputs = generate1000HostileInputs();
  const unitPath = 'math/add-subtract-fractions';
  const expectedAnswer = '12';

  for (let i = 0; i < hostileInputs.length; i++) {
    const { value, category, desc } = hostileInputs[i];

    // 1. Pure evaluation must never throw and must return safe feedback contract
    const evalResult = evaluateMicroCheck(value, expectedAnswer);
    assert.equal(typeof evalResult.isAnswered, 'boolean', `${desc}: isAnswered must be boolean`);
    assert.equal(typeof evalResult.isCorrect, 'boolean', `${desc}: isCorrect must be boolean`);
    assert.equal(typeof evalResult.feedback, 'string', `${desc}: feedback must be string`);

    // 2. Submit micro-check answer into lesson progress
    storage.saveLessonProgress(unitPath, {
      currentStepIndex: 3,
      microCheckAnswers: { step3: value },
    });

    // 3. Periodic verification of strict evidence isolation (check every 50 and last)
    if (i % 50 === 0 || i === hostileInputs.length - 1) {
      const attempts = storage.getLearningAttempts();
      assert.equal(
        attempts.length,
        0,
        `FATAL EVIDENCE LEAK: learningAttempts has length ${attempts.length} after hostile input #${i} (${category}: ${desc})`
      );

      const mastery = storage.getMastery();
      assert.equal(
        Object.keys(mastery).length,
        0,
        `FATAL MASTERY LEAK: mastery modified after hostile input #${i} (${category}: ${desc})`
      );

      const practiceHistory = storage.getPracticeHistory();
      assert.equal(
        practiceHistory.length,
        0,
        `FATAL PRACTICE LEAK: practiceHistory modified after hostile input #${i}`
      );

      const mistakes = storage.getRecentMistakes();
      assert.equal(
        mistakes.length,
        0,
        `FATAL MISTAKE LEAK: recentMistakes modified after hostile input #${i}`
      );
    }
  }

  // Final assertions after all 1,000 hostile inputs
  const finalAttempts = storage.getLearningAttempts();
  assert.equal(finalAttempts.length, 0, 'learningAttempts MUST remain EXACTLY 0 after 1,000 hostile micro-checks');

  const finalMastery = storage.getMastery();
  assert.deepEqual(finalMastery, {}, 'mastery MUST remain EXACTLY empty ({}) after 1,000 hostile micro-checks');

  const finalProgress = storage.getLessonProgress(unitPath);
  assert.ok(finalProgress, 'Lesson progress must be readable');
  assert.equal(finalProgress.currentStepIndex, 3, 'Current step index must be 3');
});

test('CHALLENGE 1.2: Hostile micro-check submissions do NOT mutate or corrupt pre-existing learningAttempts', () => {
  // Pre-populate with realistic historical attempts across other concepts/units
  const existingAttempts = [
    { id: 'att-1', conceptId: 'arithmetic', unitPath: 'math/arithmetic', isCorrect: true, timestamp: '2026-10-01T10:00:00Z' },
    { id: 'att-2', conceptId: 'arithmetic', unitPath: 'math/arithmetic', isCorrect: false, reflectiveCause: 'calculation_error', timestamp: '2026-10-01T10:02:00Z' },
    { id: 'att-3', conceptId: 'equivalence', unitPath: 'math/equivalent-fractions', isCorrect: true, timestamp: '2026-10-02T11:00:00Z' },
    { id: 'att-4', conceptId: 'addition', unitPath: 'math/add-subtract-fractions', isCorrect: true, timestamp: '2026-10-03T12:00:00Z' },
  ];

  const existingMastery = {
    arithmetic: { correct: 5, total: 6 },
    equivalence: { correct: 4, total: 4 },
  };

  resetStorage({
    mathfoundry_data: {
      learningAttempts: [...existingAttempts],
      mastery: { ...existingMastery },
      practiceHistory: [],
      recentMistakes: [],
      lessonProgress: {},
    },
  });

  const hostileInputs = generate1000HostileInputs();
  const unitPath = 'math/add-subtract-fractions';

  // Rapidly submit all 1,000 hostile micro-checks
  for (let i = 0; i < hostileInputs.length; i++) {
    storage.saveLessonProgress(unitPath, {
      currentStepIndex: 5,
      microCheckAnswers: { step5: hostileInputs[i].value },
    });
  }

  // Verify pre-existing attempts are 100% preserved and untouched
  const currentAttempts = storage.getLearningAttempts();
  assert.equal(currentAttempts.length, existingAttempts.length, 'No attempts added or deleted');
  assert.deepEqual(currentAttempts, existingAttempts, 'Existing attempts content remains completely untouched');

  // Verify mastery remains exactly the pre-existing state
  const currentMastery = storage.getMastery();
  assert.deepEqual(currentMastery, existingMastery, 'Mastery state remains completely untouched');
});

// ============================================================================
// SUITE 2: Key-Rule Saving Mechanics & Strict Idempotency
// ============================================================================

test('CHALLENGE 2.1: 50 rapid-fire clicks on "Save to Rulebook" produces exactly 1 entry in rulebook', () => {
  resetStorage({
    mathfoundry_data: {
      rulebook: [],
    },
  });

  const stepDefinition = addSubtractFractionsLesson.steps.find((s) => s.type === 'key-rule');
  assert.ok(stepDefinition, 'Key-rule step must exist in lesson');

  const rulePayload = createRulebookPayload(stepDefinition);
  assert.ok(rulePayload, 'Rule payload must be created');
  assert.equal(rulePayload.id, 'rule:add-subtract-fractions');

  // Simulate 50 clicks in rapid succession
  for (let click = 1; click <= 50; click++) {
    const success = storage.saveRulebookEntry(rulePayload);
    assert.equal(success, true, `Click #${click}: saveRulebookEntry must return true`);
  }

  const rulebook = storage.getRulebook();
  const occurrences = rulebook.filter((r) => r.id === rulePayload.id);

  assert.equal(
    occurrences.length,
    1,
    `STRICT IDEMPOTENCY VIOLATION: Expected exactly 1 entry for ${rulePayload.id}, found ${occurrences.length}`
  );

  const entry = occurrences[0];
  assert.equal(entry.id, 'rule:add-subtract-fractions');
  assert.equal(entry.category, 'fractions');
  assert.equal(entry.title, 'Adding and Subtracting Fractions');
  assert.ok(entry.explanation.includes('common denominator'));
  assert.ok(entry.savedAt, 'savedAt timestamp must be populated');
});

test('CHALLENGE 2.2: 50 rapid-fire saves preserve custom user notes without erasure or duplication', () => {
  resetStorage({
    mathfoundry_data: {
      rulebook: [],
    },
  });

  const stepDefinition = addSubtractFractionsLesson.steps.find((s) => s.type === 'key-rule');
  const rulePayload = createRulebookPayload(stepDefinition);

  // 1. Initial save from lesson
  storage.saveRulebookEntry(rulePayload);

  // 2. User goes to Rulebook and writes custom personal notes
  const customNotes = 'Personal mnemonic: Denominators are name tags, do NOT add them!';
  storage.saveRulebookEntry({
    ...rulePayload,
    notes: customNotes,
  });

  const rulebookAfterNote = storage.getRulebook();
  const entryAfterNote = rulebookAfterNote.find((r) => r.id === rulePayload.id);
  assert.equal(entryAfterNote.notes, customNotes, 'Custom note must be saved');

  // 3. User returns to lesson and clicks "Save to Rulebook" 50 times in rapid succession
  for (let click = 1; click <= 50; click++) {
    // createRulebookPayload does NOT include notes (notes is undefined)
    const freshPayloadFromLesson = createRulebookPayload(stepDefinition);
    assert.equal(freshPayloadFromLesson.notes, undefined, 'Payload from lesson must have undefined notes');

    storage.saveRulebookEntry(freshPayloadFromLesson);
  }

  // 4. Verify rulebook state
  const finalRulebook = storage.getRulebook();
  const occurrences = finalRulebook.filter((r) => r.id === rulePayload.id);

  assert.equal(occurrences.length, 1, 'Exactly 1 entry exists (no duplicates)');
  assert.equal(
    occurrences[0].notes,
    customNotes,
    'CUSTOM NOTES PRESERVATION FAILURE: User notes were overwritten or cleared by repeated saves!'
  );
});

test('CHALLENGE 2.3: Interleaved saves across multiple distinct rules maintain independent state', () => {
  resetStorage({
    mathfoundry_data: {
      rulebook: [],
    },
  });

  const rule1 = {
    id: 'rule:add-subtract-fractions',
    category: 'fractions',
    title: 'Adding and Subtracting Fractions',
    explanation: 'Common denominators required.',
    whenToUse: 'Adding unlike fractions.',
    pitfall: 'Adding denominators.',
  };

  const rule2 = {
    id: 'rule:equivalent-fractions',
    category: 'fractions',
    title: 'Equivalent Fractions',
    explanation: 'Scale by same non-zero factor.',
    whenToUse: 'Converting denominators.',
    pitfall: 'Adding instead of multiplying.',
  };

  // Interleave 50 saves alternating between rule1 and rule2
  for (let i = 0; i < 25; i++) {
    storage.saveRulebookEntry(rule1);
    storage.saveRulebookEntry(rule2);
  }

  const rulebook = storage.getRulebook();
  const r1List = rulebook.filter((r) => r.id === rule1.id);
  const r2List = rulebook.filter((r) => r.id === rule2.id);

  assert.equal(r1List.length, 1, 'Rule 1 has exactly 1 entry');
  assert.equal(r2List.length, 1, 'Rule 2 has exactly 1 entry');
});

// ============================================================================
// SUITE 3: Transition Step Completion Mechanics
// ============================================================================

test('CHALLENGE 3.1: Finishing lesson sets completed: true in lessonProgress without affecting attempt history', () => {
  resetStorage({
    mathfoundry_data: {
      learningAttempts: [],
      mastery: {},
      lessonProgress: {},
    },
  });

  const unitPath = 'math/add-subtract-fractions';
  const initialAttempts = storage.getLearningAttempts();
  assert.equal(initialAttempts.length, 0);

  // Transition step completion
  const completedAt = new Date().toISOString();
  const saveResult = storage.saveLessonProgress(unitPath, {
    currentStepIndex: 7,
    completed: true,
    completedAt,
  });

  assert.ok(saveResult);
  assert.equal(saveResult.completed, true);
  assert.equal(saveResult.currentStepIndex, 7);
  assert.equal(saveResult.completedAt, completedAt);

  // completeLesson helper call
  const completeResult = storage.completeLesson(unitPath);
  assert.equal(completeResult.completed, true);

  // Verify learning attempts remains EXACTLY 0
  const postAttempts = storage.getLearningAttempts();
  assert.equal(postAttempts.length, 0, 'Transition completion must NOT record learning attempts');

  // Verify mastery remains untouched
  const postMastery = storage.getMastery();
  assert.deepEqual(postMastery, {}, 'Transition completion must NOT alter mastery');

  // Verify read from getLessonProgress
  const readProgress = storage.getLessonProgress(unitPath);
  assert.equal(readProgress.completed, true);
  assert.equal(readProgress.currentStepIndex, 7);
  assert.ok(readProgress.completedAt);
});

test('CHALLENGE 3.2: Lesson completion is accessible via all canonical path aliases', () => {
  resetStorage();
  storage.completeLesson('math/add-subtract-fractions');

  // Canonical unit path
  const canonical = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(canonical.completed, true);

  // Short unitId
  const shortId = storage.getLessonProgress('add-subtract-fractions');
  assert.equal(shortId.completed, true);

  // Legacy conceptId
  const legacyConcept = storage.getLessonProgress('addition');
  assert.equal(legacyConcept.completed, true);
});

test('CHALLENGE 3.3: Unit progress composite evaluation accurately reflects completed lesson without false practice completion', () => {
  resetStorage({
    mathfoundry_data: {
      learningAttempts: [],
      lessonProgress: {},
    },
  });

  // Complete lesson only
  storage.completeLesson('math/add-subtract-fractions');

  const unitProgress = storage.getUnitProgress('math', 'add-subtract-fractions');
  assert.ok(unitProgress);

  // Lesson section must be marked completed
  assert.equal(unitProgress.sections.lesson.completed, true);

  // Practice section must NOT be marked completed (0 attempts)
  assert.equal(unitProgress.sections.practice.completed, false);
  assert.equal(unitProgress.sections.practice.attemptCount, 0);

  // Attempts array in unit progress must be empty
  assert.equal(unitProgress.attempts.length, 0);
});

// ============================================================================
// SUITE 4: Full Guided Lesson Lifecycle State Machine Simulation
// ============================================================================

test('CHALLENGE 4.1: Simulated End-to-End Lesson Run: 8 steps traversal, micro-checks, 50 key-rule saves, completion', () => {
  resetStorage({
    mathfoundry_data: {
      learningAttempts: [],
      mastery: {},
      rulebook: [],
      lessonProgress: {},
    },
  });

  const lesson = addSubtractFractionsLesson;
  const unitPath = lesson.unitPath;
  const totalSteps = lesson.totalSteps;

  assert.equal(totalSteps, 8, 'Lesson must have 8 steps');

  // --- Step 0: Explain ---
  let nav = getNavigationState(0, totalSteps);
  assert.equal(nav.isFirstStep, true);
  assert.equal(nav.canGoBack, false);
  assert.equal(nav.canContinue, true);
  storage.saveLessonProgress(unitPath, { currentStepIndex: 0 });

  // --- Step 1: Visual ---
  nav = getNavigationState(1, totalSteps);
  assert.equal(nav.canGoBack, true);
  storage.saveLessonProgress(unitPath, { currentStepIndex: 1 });

  // --- Step 2: Interact ---
  nav = getNavigationState(2, totalSteps);
  storage.saveLessonProgress(unitPath, { currentStepIndex: 2 });

  // --- Step 3: Micro-check 1 (LCD of 1/4 and 1/6) ---
  nav = getNavigationState(3, totalSteps);
  const step3 = lesson.steps[3];

  // Try 5 hostile/incorrect answers
  const badAnswers = ['', '10', '24', '1/0', 'banana'];
  for (const bad of badAnswers) {
    const res = evaluateMicroCheck(bad, step3.expectedAnswer);
    assert.equal(res.isCorrect, false);
    storage.saveLessonProgress(unitPath, {
      currentStepIndex: 3,
      microCheckAnswers: { step3: bad },
    });
  }

  // Now submit correct answer '12'
  const goodRes3 = evaluateMicroCheck('12', step3.expectedAnswer);
  assert.equal(goodRes3.isCorrect, true);
  storage.saveLessonProgress(unitPath, {
    currentStepIndex: 3,
    microCheckAnswers: { step3: '12' },
  });

  // --- Step 4: Explain ---
  storage.saveLessonProgress(unitPath, { currentStepIndex: 4 });

  // --- Step 5: Micro-check 2 (3/12 + 2/12) ---
  const step5 = lesson.steps[5];

  // Try 3 incorrect answers
  for (const bad of ['5/24', '2/5', '1/2']) {
    const res = evaluateMicroCheck(bad, step5.expectedAnswer);
    assert.equal(res.isCorrect, false);
  }

  // Submit correct answer '5/12'
  const goodRes5 = evaluateMicroCheck('5/12', step5.expectedAnswer);
  assert.equal(goodRes5.isCorrect, true);
  storage.saveLessonProgress(unitPath, {
    currentStepIndex: 5,
    microCheckAnswers: { step3: '12', step5: '5/12' },
  });

  // --- Step 6: Key-Rule ---
  const step6 = lesson.steps[6];
  const rulePayload = createRulebookPayload(step6);

  // Click 50 times
  for (let i = 0; i < 50; i++) {
    storage.saveRulebookEntry(rulePayload);
  }

  // --- Step 7: Transition ---
  nav = getNavigationState(7, totalSteps);
  assert.equal(nav.isFinalStep, true);

  storage.saveLessonProgress(unitPath, {
    currentStepIndex: 7,
    completed: true,
    completedAt: new Date().toISOString(),
  });
  storage.completeLesson(unitPath);

  // === FINAL SYSTEM INTEGRITY VERIFICATION ===

  // 1. Evidence Isolation: learningAttempts is EXACTLY 0
  assert.equal(storage.getLearningAttempts().length, 0, 'FINAL: learningAttempts must be exactly 0');

  // 2. Mastery untouched
  assert.deepEqual(storage.getMastery(), {}, 'FINAL: mastery must be empty');

  // 3. Rulebook: exactly 1 entry for this rule
  const rulebook = storage.getRulebook();
  const ruleMatches = rulebook.filter((r) => r.id === rulePayload.id);
  assert.equal(ruleMatches.length, 1, 'FINAL: exactly 1 rulebook entry');

  // 4. Lesson Progress: completed with both micro-check answers saved
  const finalProgress = storage.getLessonProgress(unitPath);
  assert.equal(finalProgress.completed, true, 'FINAL: completed must be true');
  assert.equal(finalProgress.currentStepIndex, 7, 'FINAL: currentStepIndex must be 7');
  assert.equal(finalProgress.microCheckAnswers.step3, '12', 'FINAL: step3 answer preserved');
  assert.equal(finalProgress.microCheckAnswers.step5, '5/12', 'FINAL: step5 answer preserved');
});

// ============================================================================
// SUITE 5: Advanced Cross-Subsystem & Prototype Pollution Hardening
// ============================================================================

test('CHALLENGE 5.1: High-Frequency Interleaved Concurrent Writes between Lesson and Practice', () => {
  resetStorage({
    mathfoundry_data: {
      learningAttempts: [],
      mastery: {},
      practiceHistory: [],
      lessonProgress: {},
    },
  });

  const unitPath = 'math/add-subtract-fractions';

  // Interleave 50 micro-check updates and 20 practice attempts
  let practiceCount = 0;
  for (let cycle = 0; cycle < 50; cycle++) {
    // 1. Lesson micro-check write
    storage.saveLessonProgress(unitPath, {
      currentStepIndex: 3,
      microCheckAnswers: { [`check_${cycle}`]: `ans_${cycle}` },
    });

    // 2. Periodic practice attempt write
    if (cycle % 2 === 0) {
      practiceCount++;
      storage.saveLearningAttempt({
        id: `practice-attempt-${practiceCount}`,
        conceptId: 'addition',
        unitPath,
        isCorrect: true,
        submittedAnswer: '5/6',
      });
    }
  }

  // Verify learning attempts contains EXACTLY practiceCount attempts and 0 lesson attempts
  const allAttempts = storage.getLearningAttempts();
  assert.equal(
    allAttempts.length,
    practiceCount,
    `learningAttempts must contain EXACTLY ${practiceCount} attempts; found ${allAttempts.length}`
  );
  assert.ok(
    allAttempts.every((a) => a.id.startsWith('practice-attempt-')),
    'All recorded attempts must originate exclusively from practice'
  );

  // Verify lessonProgress recorded all microCheckAnswers
  const progress = storage.getLessonProgress(unitPath);
  assert.equal(Object.keys(progress.microCheckAnswers).length, 50, 'All 50 micro-check answers preserved');
});

test('CHALLENGE 5.2: Prototype pollution resistance during hostile micro-check input processing', () => {
  resetStorage();
  const unitPath = 'math/add-subtract-fractions';

  const maliciousPayloads = [
    { '__proto__': { polluted: 'yes' } },
    { 'constructor': { 'prototype': { polluted: 'yes' } } },
  ];

  for (const malicious of maliciousPayloads) {
    storage.saveLessonProgress(unitPath, {
      currentStepIndex: 3,
      microCheckAnswers: malicious,
    });
  }

  assert.equal(Object.prototype.polluted, undefined, 'Object.prototype must NOT be polluted');
  assert.equal({}.polluted, undefined, 'Plain objects must not inherit polluted property');
});

test('CHALLENGE 5.3: saveRulebookEntry rejection of malformed, null, and non-object inputs', () => {
  resetStorage();

  const invalidInputs = [
    null,
    undefined,
    '',
    123,
    [],
    {}, // missing id
    { id: '' }, // empty id
    { id: null },
    { id: undefined },
    { noId: true },
  ];

  for (const invalid of invalidInputs) {
    const result = storage.saveRulebookEntry(invalid);
    assert.equal(result, false, `saveRulebookEntry must return false for ${JSON.stringify(invalid)}`);
  }

  const rulebook = storage.getRulebook();
  // Only default rulebook entries should exist, zero corrupted entries
  assert.ok(rulebook.every((r) => Boolean(r && r.id && typeof r.id === 'string')));
});

test('CHALLENGE 5.4: completeLesson idempotency across 50 consecutive invocations', () => {
  resetStorage();
  const unitPath = 'math/add-subtract-fractions';

  for (let i = 0; i < 50; i++) {
    const res = storage.completeLesson(unitPath);
    assert.ok(res);
    assert.equal(res.completed, true);
  }

  assert.equal(storage.getLearningAttempts().length, 0);
  assert.deepEqual(storage.getMastery(), {});
  assert.equal(storage.getLessonProgress(unitPath).completed, true);
});

