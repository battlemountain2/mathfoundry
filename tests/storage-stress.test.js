import test from 'node:test';
import assert from 'node:assert/strict';
import * as storage from '../src/utils/storage.js';

// ============================================================================
// In-Memory LocalStorage Mock Setup for Stress Testing
// ============================================================================

const memory = new Map();

if (typeof global.localStorage === 'undefined' || !global.localStorage) {
  global.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key),
    clear: () => memory.clear(),
  };
}

function resetStorage(initialData = null) {
  if (typeof global.localStorage.clear === 'function') {
    global.localStorage.clear();
  }
  memory.clear();
  global.localStorage.removeItem('mathfoundry_data');
  global.localStorage.removeItem('mathfoundry_data_before_v2');

  if (initialData !== null) {
    global.localStorage.setItem(
      'mathfoundry_data',
      typeof initialData === 'string' ? initialData : JSON.stringify(initialData)
    );
  }
}

// ============================================================================
// SUITE 1: Corrupted JSON & Malformed Storage Robustness
// ============================================================================

test('STRESS-1: Non-destructive reads and write protection across corrupted JSON payloads', () => {
  const corruptedPayloads = [
    '{ truncated: "json',
    '<<<NOT_JSON>>>',
    'null',
    '12345',
    '"plain string"',
    'true',
    '[1, 2, 3]',
    '{"schemaVersion": 2, "learningAttempts": [unclosed',
    '{"settings": undefined}',
  ];

  for (const payload of corruptedPayloads) {
    resetStorage(payload);
    const rawBefore = global.localStorage.getItem('mathfoundry_data');
    assert.equal(rawBefore, payload, 'Seed corrupted payload must be stored');

    // 1. All read accessors must survive without throwing unhandled exceptions
    assert.doesNotThrow(() => {
      const attempts = storage.getAttemptsForUnit('math', 'add-subtract-fractions');
      assert.ok(Array.isArray(attempts));
      assert.equal(attempts.length, 0);
    });

    assert.doesNotThrow(() => {
      const lesson = storage.getLessonProgress('math/add-subtract-fractions');
      assert.ok(lesson && typeof lesson === 'object');
      assert.equal(lesson.currentStepIndex, 0);
      assert.equal(lesson.completed, false);
      assert.deepEqual(lesson.microCheckAnswers, {});
    });

    assert.doesNotThrow(() => {
      const quiz = storage.getUnitQuizResult('math/add-subtract-fractions');
      assert.equal(quiz, null);
    });

    assert.doesNotThrow(() => {
      const unitProg = storage.getUnitProgress('math', 'add-subtract-fractions');
      assert.ok(unitProg);
      assert.equal(unitProg.unitPath, 'math/add-subtract-fractions');
    });

    assert.doesNotThrow(() => {
      const settings = storage.getSettings();
      assert.ok(settings && typeof settings === 'object');
    });

    assert.doesNotThrow(() => {
      const streak = storage.getStreak();
      assert.ok(streak && typeof streak === 'object');
    });

    assert.doesNotThrow(() => {
      const rulebook = storage.getRulebook();
      assert.ok(Array.isArray(rulebook));
    });

    // 2. Raw corrupted data must NOT have been wiped or mutated during reads
    const rawAfterReads = global.localStorage.getItem('mathfoundry_data');
    assert.equal(rawAfterReads, payload, 'Reads must be non-destructive even under corrupted JSON');

    // 3. exportRawData must return the corrupted string verbatim
    assert.equal(storage.exportRawData(), payload, 'exportRawData must preserve corrupted raw string');

    // 4. Writes must be safely blocked and throw without overwriting corrupted data
    assert.throws(
      () => {
        storage.saveLessonProgress('math/add-subtract-fractions', { currentStepIndex: 1 });
      },
      /Your saved data could not be read|backup in Settings/,
      'saveLessonProgress must reject write onto corrupted storage'
    );

    assert.throws(
      () => {
        storage.saveUnitQuizResult('math/add-subtract-fractions', { score: 100 });
      },
      /Your saved data could not be read|backup in Settings/,
      'saveUnitQuizResult must reject write onto corrupted storage'
    );

    assert.throws(
      () => {
        storage.saveLearningAttempt({ id: 'att-fail', conceptId: 'addition' });
      },
      /Your saved data could not be read|backup in Settings/,
      'saveLearningAttempt must reject write onto corrupted storage'
    );

    const rawAfterWriteAttempts = global.localStorage.getItem('mathfoundry_data');
    assert.equal(rawAfterWriteAttempts, payload, 'Failed writes must preserve corrupted storage on disk');
  }
});

// ============================================================================
// SUITE 2: Massive History Scale & Stress Testing
// ============================================================================

test('STRESS-2: Large-scale attempt history (11,000+ records) performance and memory stability', () => {
  const legacyConcepts = ['arithmetic', 'equivalence', 'comparison', 'addition', 'multiplication', 'division'];
  const newUnits = ['negative-numbers', 'decimals-place-value', 'ratios-percentages', 'factors-multiples', 'order-of-operations', 'intro-algebra'];

  const largeLearningAttempts = [];
  const largePracticeHistory = [];
  const largeReviewHistory = [];

  // 1. Generate 4,800 foundation learning attempts
  for (let i = 0; i < 4800; i++) {
    const isLegacy = i % 2 === 0;
    const target = isLegacy
      ? legacyConcepts[i % legacyConcepts.length]
      : newUnits[i % newUnits.length];

    largeLearningAttempts.push({
      id: `bulk-att-${i}`,
      ...(isLegacy ? { conceptId: target } : { unitId: target, unitPath: `math/${target}` }),
      question: `Question for attempt ${i}`,
      isCorrect: i % 3 !== 0,
      timestamp: new Date(Date.now() - (4800 - i) * 60000).toISOString(),
    });
  }

  // 2. Generate 1,000 practice sessions with 5 answers each (= 5,000 practice attempts)
  for (let s = 0; s < 1000; s++) {
    const concept = legacyConcepts[s % legacyConcepts.length];
    const answers = [];
    for (let a = 0; a < 5; a++) {
      answers.push({
        id: `bulk-p-ans-${s}-${a}`,
        moduleId: concept,
        question: `Practice Q ${s}:${a}`,
        isCorrect: (s + a) % 2 === 0,
        timestamp: new Date(Date.now() - (1000 - s) * 120000).toISOString(),
      });
    }
    largePracticeHistory.push({
      id: `bulk-sess-${s}`,
      timestamp: new Date(Date.now() - (1000 - s) * 120000).toISOString(),
      answers,
    });
  }

  // 3. Generate 400 review sessions with 3 answers each (= 1,200 review attempts)
  for (let r = 0; r < 400; r++) {
    const concept = legacyConcepts[r % legacyConcepts.length];
    const answers = [];
    for (let a = 0; a < 3; a++) {
      answers.push({
        id: `bulk-r-ans-${r}-${a}`,
        conceptId: concept,
        question: `Review Q ${r}:${a}`,
        isCorrect: true,
        timestamp: new Date(Date.now() - (400 - r) * 180000).toISOString(),
      });
    }
    largeReviewHistory.push({
      id: `bulk-rev-${r}`,
      timestamp: new Date(Date.now() - (400 - r) * 180000).toISOString(),
      answers,
    });
  }

  // Total attempt records = 4,800 + 5,000 + 1,200 = 11,000 records
  resetStorage({
    schemaVersion: 2,
    learningAttempts: largeLearningAttempts,
    practiceHistory: largePracticeHistory,
    reviewHistory: largeReviewHistory,
  });

  const rawBefore = global.localStorage.getItem('mathfoundry_data');

  // Measure execution time of getAllLearningAttempts over 11,000 items
  const startAll = performance.now();
  const all = storage.getAllLearningAttempts();
  const durationAll = performance.now() - startAll;

  assert.equal(all.length, 11000, 'All 11,000 unified attempts must be retrieved and deduplicated');
  assert.ok(durationAll < 300, `getAllLearningAttempts must execute in < 300ms (actual: ${durationAll.toFixed(2)}ms)`);

  // Measure getAttemptsForUnit for 'math/add-subtract-fractions'
  const startUnit = performance.now();
  const additionAttempts = storage.getAttemptsForUnit('math', 'add-subtract-fractions');
  const durationUnit = performance.now() - startUnit;

  assert.ok(additionAttempts.length > 1000, 'Must retrieve all filtered addition attempts');
  assert.ok(durationUnit < 300, `getAttemptsForUnit must execute in < 300ms (actual: ${durationUnit.toFixed(2)}ms)`);

  // Verify non-destructive reads
  const rawAfter = global.localStorage.getItem('mathfoundry_data');
  assert.equal(rawAfter, rawBefore, 'Bulk queries must not alter raw storage');
});

// ============================================================================
// SUITE 3: Rapid Concurrent/Interleaved Writes & Evidence Isolation
// ============================================================================

test('STRESS-3: High-frequency rapid concurrent writes and strict isolation of lesson progress from learningAttempts', () => {
  const baselineAttempts = [
    { id: 'base-att-1', conceptId: 'addition', isCorrect: true, question: '1/2 + 1/3' },
    { id: 'base-att-2', conceptId: 'arithmetic', isCorrect: false, question: '9 * 8' },
  ];

  const baselineMastery = {
    addition: { correct: 1, total: 1 },
    arithmetic: { correct: 0, total: 1 },
  };

  resetStorage({
    schemaVersion: 2,
    learningAttempts: [...baselineAttempts],
    mastery: { ...baselineMastery },
    practiceHistory: [],
    lessonProgress: {},
    unitQuizzes: {},
  });

  const TOTAL_CYCLES = 200;
  const unitPaths = [
    'math/add-subtract-fractions',
    'math/equivalent-fractions',
    'math/arithmetic',
    'math/negative-numbers',
  ];

  // Interleave lesson progress writes, quiz writes, and attempt writes in rapid succession
  for (let i = 0; i < TOTAL_CYCLES; i++) {
    const unitPath = unitPaths[i % unitPaths.length];
    const stepIdx = i % 8;

    // 1. Write Lesson Progress (formative step + micro-check)
    storage.saveLessonProgress(unitPath, {
      currentStepIndex: stepIdx,
      microCheckAnswers: {
        [`mc-step-${stepIdx}`]: {
          answer: `user-input-${i}`,
          isCorrect: i % 2 === 0,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // 2. Interleave Learning Attempt write on odd cycles
    if (i % 2 === 1) {
      storage.saveLearningAttempt({
        id: `valid-practice-att-${i}`,
        conceptId: 'addition',
        isCorrect: true,
        question: `Practice fraction problem ${i}`,
      });
    }

    // 3. Interleave Unit Quiz write every 20 cycles
    if (i % 20 === 0) {
      storage.saveUnitQuizResult(unitPath, {
        score: (i * 7) % 100,
        correct: 3,
        total: 4,
        passed: true,
      });
    }

    // 4. Mark completed at step 7
    if (stepIdx === 7) {
      storage.completeLesson(unitPath);
    }
  }

  // Read current storage state
  const rawStore = JSON.parse(global.localStorage.getItem('mathfoundry_data'));

  // 1. STABILITY CHECK: Learning attempts must contain EXACTLY baseline + practice attempts
  const expectedPracticeAttemptsCount = TOTAL_CYCLES / 2; // 100
  const expectedTotalAttempts = baselineAttempts.length + expectedPracticeAttemptsCount; // 2 + 100 = 102
  assert.equal(rawStore.learningAttempts.length, expectedTotalAttempts);

  // 2. STRICT ISOLATION PROOF: Zero lesson progress data in learningAttempts
  for (const attempt of rawStore.learningAttempts) {
    assert.equal(attempt.currentStepIndex, undefined, 'Lesson step index must never exist in learningAttempts');
    assert.equal(attempt.microCheckAnswers, undefined, 'microCheckAnswers must never exist in learningAttempts');
    assert.equal(attempt.completed, undefined, 'Lesson completion status must never exist in learningAttempts');
    assert.ok(!attempt.id.startsWith('mc-'), 'Micro-check IDs must never enter learningAttempts');
  }

  // 3. ZERO LEAKS IN PRACTICE HISTORY & MASTERY
  assert.equal(rawStore.practiceHistory.length, 0, 'Practice history must not receive any writes from lessons');
  assert.deepEqual(rawStore.mastery, baselineMastery, 'Mastery stats must remain strictly untouched by lesson progress');

  // 4. LESSON PROGRESS PERSISTENCE & MICRO-CHECK ACCUMULATION
  for (const unitPath of unitPaths) {
    const lesson = storage.getLessonProgress(unitPath);
    assert.ok(lesson, `Lesson progress for ${unitPath} must exist`);
    assert.equal(typeof lesson.currentStepIndex, 'number');
    assert.ok(Object.keys(lesson.microCheckAnswers).length > 0, `Micro-checks must accumulate for ${unitPath}`);
  }

  // 5. getAttemptsForUnit query isolation
  const queriedAdditionAttempts = storage.getAttemptsForUnit('math', 'add-subtract-fractions');
  assert.equal(queriedAdditionAttempts.length, 101, 'Must return 1 baseline addition attempt + 100 practice attempts');
  for (const qa of queriedAdditionAttempts) {
    assert.equal(qa.microCheckAnswers, undefined, 'Queried attempt must not contain microCheckAnswers');
    assert.equal(qa.currentStepIndex, undefined, 'Queried attempt must not contain currentStepIndex');
  }
});

// ============================================================================
// SUITE 4: Backup Snapshot Preservation
// ============================================================================

test('STRESS-4: mathfoundry_data_before_v2 snapshot is created and never overwritten on subsequent writes', () => {
  const originalV1State = {
    settings: { theme: 'light' },
    learningAttempts: [{ id: 'v1-att', conceptId: 'arithmetic', isCorrect: true }],
  };

  resetStorage(originalV1State);

  // First write creates backup snapshot
  storage.saveLessonProgress('math/add-subtract-fractions', { currentStepIndex: 1 });

  const backupSnapshot1 = global.localStorage.getItem('mathfoundry_data_before_v2');
  assert.ok(backupSnapshot1, 'Backup before v2 must be created on first write');
  const parsedBackup = JSON.parse(backupSnapshot1);
  assert.equal(parsedBackup.learningAttempts[0].id, 'v1-att');

  // Second and third writes
  storage.saveLessonProgress('math/add-subtract-fractions', { currentStepIndex: 2 });
  storage.saveLearningAttempt({ id: 'v2-att', conceptId: 'arithmetic', isCorrect: true });

  const backupSnapshot2 = global.localStorage.getItem('mathfoundry_data_before_v2');
  assert.equal(backupSnapshot2, backupSnapshot1, 'Backup snapshot must remain locked and never overwritten');
});

// ============================================================================
// SUITE 5: Empirical Adversarial Failure Modes (Exposing Implementation Bugs)
// ============================================================================

test('STRESS-DEFECT-1: Legacy practice attempts with moduleId fail canonical unitPath and unitId virtualization', () => {
  // Practice sessions in MathFoundry store answers with { moduleId: 'addition' }, { moduleId: 'equivalence' }, etc.
  const practiceAttempts = [
    { id: 'p-equiv', moduleId: 'equivalence', format: 'fill', isCorrect: true },
    { id: 'p-add', moduleId: 'addition', format: 'fill', isCorrect: true },
    { id: 'p-comp', moduleId: 'comparison', format: 'fill', isCorrect: true },
    { id: 'p-mult', moduleId: 'multiplication', format: 'fill', isCorrect: true },
    { id: 'p-div', moduleId: 'division', format: 'fill', isCorrect: true },
  ];

  // Requirement R4 specifies:
  // equivalence -> math/equivalent-fractions (unitId: equivalent-fractions)
  // addition -> math/add-subtract-fractions (unitId: add-subtract-fractions)
  // comparison -> math/compare-fractions (unitId: compare-fractions)
  // multiplication -> math/multiply-fractions (unitId: multiply-fractions)
  // division -> math/divide-fractions (unitId: divide-fractions)

  const normalizedEquiv = storage.normalizeAttempt(practiceAttempts[0]);
  const normalizedAdd = storage.normalizeAttempt(practiceAttempts[1]);
  const normalizedComp = storage.normalizeAttempt(practiceAttempts[2]);
  const normalizedMult = storage.normalizeAttempt(practiceAttempts[3]);
  const normalizedDiv = storage.normalizeAttempt(practiceAttempts[4]);

  // Asserting specification requirement per R4:
  assert.equal(
    normalizedEquiv.unitPath,
    'math/equivalent-fractions',
    'normalizeAttempt must map legacy moduleId "equivalence" to canonical unitPath "math/equivalent-fractions"'
  );
  assert.equal(
    normalizedEquiv.unitId,
    'equivalent-fractions',
    'normalizeAttempt must map legacy moduleId "equivalence" to canonical unitId "equivalent-fractions"'
  );

  assert.equal(
    normalizedAdd.unitPath,
    'math/add-subtract-fractions',
    'normalizeAttempt must map legacy moduleId "addition" to canonical unitPath "math/add-subtract-fractions"'
  );
  assert.equal(
    normalizedAdd.unitId,
    'add-subtract-fractions',
    'normalizeAttempt must map legacy moduleId "addition" to canonical unitId "add-subtract-fractions"'
  );

  assert.equal(
    normalizedComp.unitPath,
    'math/compare-fractions',
    'normalizeAttempt must map legacy moduleId "comparison" to canonical unitPath "math/compare-fractions"'
  );

  assert.equal(
    normalizedMult.unitPath,
    'math/multiply-fractions',
    'normalizeAttempt must map legacy moduleId "multiplication" to canonical unitPath "math/multiply-fractions"'
  );

  assert.equal(
    normalizedDiv.unitPath,
    'math/divide-fractions',
    'normalizeAttempt must map legacy moduleId "division" to canonical unitPath "math/divide-fractions"'
  );
});

test('STRESS-DEFECT-2: Array with null/sparse elements in legacy arrays causes unhandled TypeError in getAllLearningAttempts', () => {
  // If legacy localStorage has sparse or null array elements
  resetStorage({
    schemaVersion: 2,
    learningAttempts: [null, { id: 'att-valid-1', conceptId: 'arithmetic', isCorrect: true }],
    practiceHistory: [null, { id: 'sess-1', answers: [null, { id: 'att-valid-2', moduleId: 'arithmetic' }] }],
    reviewHistory: [null],
  });

  // Non-destructive read must NOT throw TypeError: Cannot read properties of null
  assert.doesNotThrow(() => {
    const attempts = storage.getAllLearningAttempts();
    assert.ok(Array.isArray(attempts));
  }, 'getAllLearningAttempts must not throw unhandled TypeError when encountering null entries in arrays');
});

test('STRESS-DEFECT-3: saveLessonProgress with null data throws unhandled TypeError', () => {
  resetStorage({ schemaVersion: 2 });

  // Calling saveLessonProgress with null data (e.g. from an uninitialized component prop)
  assert.doesNotThrow(() => {
    storage.saveLessonProgress('math/add-subtract-fractions', null);
  }, 'saveLessonProgress must safely handle null data argument');
});
