import test from 'node:test';
import assert from 'node:assert/strict';

// Course definitions and catalog
import {
  mathFoundationsUnits,
  getMathUnit,
  checkUnitPrerequisites,
  getNextMathUnit,
  getPreviousMathUnit,
  getDownstreamMathUnits,
  getTransitivePrerequisites,
} from '../src/data/courses/mathFoundations.js';

import {
  courseCatalog,
  getCourses,
  getCourse,
  getActiveCourses,
  isCourseActive,
} from '../src/data/courses/courseCatalog.js';

// Storage mapping layer and accessors
import * as storage from '../src/utils/storage.js';

// ============================================================================
// Storage Isolation Test Harness
// ============================================================================

const localMemory = new Map();

if (typeof global.localStorage === 'undefined' || !global.localStorage) {
  global.localStorage = {
    getItem: (key) => localMemory.get(key) ?? null,
    setItem: (key, value) => localMemory.set(key, String(value)),
    removeItem: (key) => localMemory.delete(key),
    clear: () => localMemory.clear(),
  };
}

/**
 * Resets the localStorage state and optionally seeds an initial document.
 */
function resetStorage(initialData = null) {
  if (typeof global.localStorage.clear === 'function') {
    global.localStorage.clear();
  }
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
// GROUP 1: Bidirectional Mapping & Identifier Normalization (Requirement R4)
// ============================================================================

test('M1.1: Bidirectional mapping constants and lookup tables match specification', () => {
  // Concept to unit path
  assert.equal(storage.CONCEPT_TO_UNIT_PATH.arithmetic, 'math/arithmetic');
  assert.equal(storage.CONCEPT_TO_UNIT_PATH.equivalence, 'math/equivalent-fractions');
  assert.equal(storage.CONCEPT_TO_UNIT_PATH.comparison, 'math/compare-fractions');
  assert.equal(storage.CONCEPT_TO_UNIT_PATH.addition, 'math/add-subtract-fractions');
  assert.equal(storage.CONCEPT_TO_UNIT_PATH.multiplication, 'math/multiply-fractions');
  assert.equal(storage.CONCEPT_TO_UNIT_PATH.division, 'math/divide-fractions');

  // Unit path to concept
  assert.equal(storage.UNIT_PATH_TO_CONCEPT['math/arithmetic'], 'arithmetic');
  assert.equal(storage.UNIT_PATH_TO_CONCEPT['math/equivalent-fractions'], 'equivalence');
  assert.equal(storage.UNIT_PATH_TO_CONCEPT['math/compare-fractions'], 'comparison');
  assert.equal(storage.UNIT_PATH_TO_CONCEPT['math/add-subtract-fractions'], 'addition');
  assert.equal(storage.UNIT_PATH_TO_CONCEPT['math/multiply-fractions'], 'multiplication');
  assert.equal(storage.UNIT_PATH_TO_CONCEPT['math/divide-fractions'], 'division');

  // Unit ID to concept
  assert.equal(storage.UNIT_ID_TO_CONCEPT['arithmetic'], 'arithmetic');
  assert.equal(storage.UNIT_ID_TO_CONCEPT['equivalent-fractions'], 'equivalence');
  assert.equal(storage.UNIT_ID_TO_CONCEPT['compare-fractions'], 'comparison');
  assert.equal(storage.UNIT_ID_TO_CONCEPT['add-subtract-fractions'], 'addition');
  assert.equal(storage.UNIT_ID_TO_CONCEPT['multiply-fractions'], 'multiplication');
  assert.equal(storage.UNIT_ID_TO_CONCEPT['divide-fractions'], 'division');

  // Concept to unit ID
  assert.equal(storage.CONCEPT_TO_UNIT_ID['arithmetic'], 'arithmetic');
  assert.equal(storage.CONCEPT_TO_UNIT_ID['equivalence'], 'equivalent-fractions');
  assert.equal(storage.CONCEPT_TO_UNIT_ID['comparison'], 'compare-fractions');
  assert.equal(storage.CONCEPT_TO_UNIT_ID['addition'], 'add-subtract-fractions');
  assert.equal(storage.CONCEPT_TO_UNIT_ID['multiplication'], 'multiply-fractions');
  assert.equal(storage.CONCEPT_TO_UNIT_ID['division'], 'divide-fractions');
});

test('M1.2: Normalization helpers toUnitPath and toConceptId resolve identifiers symmetrically', () => {
  // toUnitPath resolution
  assert.equal(storage.toUnitPath('addition'), 'math/add-subtract-fractions');
  assert.equal(storage.toUnitPath('add-subtract-fractions'), 'math/add-subtract-fractions');
  assert.equal(storage.toUnitPath('math/add-subtract-fractions'), 'math/add-subtract-fractions');
  assert.equal(storage.toUnitPath('negative-numbers'), 'math/negative-numbers');
  assert.equal(storage.toUnitPath('math/negative-numbers'), 'math/negative-numbers');
  assert.equal(storage.toUnitPath('physics/mechanics'), 'physics/mechanics');
  assert.equal(storage.toUnitPath(null), null);
  assert.equal(storage.toUnitPath(''), null);
  assert.equal(storage.toUnitPath(undefined), null);

  // toConceptId resolution
  assert.equal(storage.toConceptId('math/add-subtract-fractions'), 'addition');
  assert.equal(storage.toConceptId('add-subtract-fractions'), 'addition');
  assert.equal(storage.toConceptId('addition'), 'addition');
  assert.equal(storage.toConceptId('math/negative-numbers'), 'negative-numbers');
  assert.equal(storage.toConceptId('negative-numbers'), 'negative-numbers');
  assert.equal(storage.toConceptId(null), null);
  assert.equal(storage.toConceptId(''), null);
});

test('M1.3: normalizeAttempt virtualizes legacy conceptId and new unitPath attempts', () => {
  // Legacy attempt with only conceptId
  const legacyAttempt = {
    id: 'att-leg-1',
    conceptId: 'addition',
    question: '1/4 + 1/6',
    isCorrect: true,
  };
  const normLegacy = storage.normalizeAttempt(legacyAttempt);
  assert.equal(normLegacy.conceptId, 'addition');
  assert.equal(normLegacy.unitId, 'add-subtract-fractions');
  assert.equal(normLegacy.unitPath, 'math/add-subtract-fractions');
  assert.equal(normLegacy.question, '1/4 + 1/6');
  assert.equal(normLegacy.isCorrect, true);

  // New attempt with unitPath and unitId
  const newAttempt = {
    id: 'att-new-1',
    unitId: 'add-subtract-fractions',
    unitPath: 'math/add-subtract-fractions',
    question: '2/5 + 1/10',
    isCorrect: true,
  };
  const normNew = storage.normalizeAttempt(newAttempt);
  assert.equal(normNew.conceptId, 'addition');
  assert.equal(normNew.unitId, 'add-subtract-fractions');
  assert.equal(normNew.unitPath, 'math/add-subtract-fractions');

  // Attempt for Unit 7 without legacy alias
  const unit7Attempt = {
    id: 'att-u7-1',
    unitId: 'negative-numbers',
    unitPath: 'math/negative-numbers',
    isCorrect: false,
  };
  const normU7 = storage.normalizeAttempt(unit7Attempt);
  assert.equal(normU7.unitPath, 'math/negative-numbers');
  assert.equal(normU7.unitId, 'negative-numbers');

  // Null input handling
  assert.equal(storage.normalizeAttempt(null), null);
  assert.equal(storage.normalizeAttempt(undefined), null);
});

test('M1.4: getAttemptsForUnit resolves legacy addition attempts via unit path math/add-subtract-fractions', () => {
  resetStorage({
    schemaVersion: 2,
    learningAttempts: [
      { id: 'att-add-1', conceptId: 'addition', question: '1/3 + 1/6', isCorrect: true, timestamp: '2026-10-01T00:00:00Z' },
      { id: 'att-arith-1', conceptId: 'arithmetic', question: '7 + 8', isCorrect: true, timestamp: '2026-10-01T01:00:00Z' },
      { id: 'att-add-2', conceptId: 'addition', question: '3/4 - 1/2', isCorrect: false, timestamp: '2026-10-02T00:00:00Z' },
    ],
  });

  // Query with courseId and unitId
  const attempts = storage.getAttemptsForUnit('math', 'add-subtract-fractions');
  assert.equal(attempts.length, 2);
  assert.ok(attempts.some((a) => a.id === 'att-add-1'));
  assert.ok(attempts.some((a) => a.id === 'att-add-2'));
  assert.ok(!attempts.some((a) => a.id === 'att-arith-1'));

  // Verify normalized fields on retrieved attempts
  const first = attempts.find((a) => a.id === 'att-add-1');
  assert.equal(first.unitPath, 'math/add-subtract-fractions');
  assert.equal(first.unitId, 'add-subtract-fractions');
  assert.equal(first.conceptId, 'addition');

  // Query with combined unitPath string
  const attemptsByPath = storage.getAttemptsForUnit('math/add-subtract-fractions');
  assert.equal(attemptsByPath.length, 2);
});

test('M1.5: getAttemptsForUnit accurately maps all 6 legacy concept IDs to their respective units', () => {
  const legacyConcepts = [
    { conceptId: 'arithmetic', unitId: 'arithmetic' },
    { conceptId: 'equivalence', unitId: 'equivalent-fractions' },
    { conceptId: 'comparison', unitId: 'compare-fractions' },
    { conceptId: 'addition', unitId: 'add-subtract-fractions' },
    { conceptId: 'multiplication', unitId: 'multiply-fractions' },
    { conceptId: 'division', unitId: 'divide-fractions' },
  ];

  resetStorage({
    schemaVersion: 2,
    learningAttempts: legacyConcepts.map(({ conceptId }, idx) => ({
      id: `att-concept-${idx}`,
      conceptId,
      question: `Question for ${conceptId}`,
      isCorrect: true,
      timestamp: `2026-10-01T0${idx}:00:00Z`,
    })),
  });

  for (const { conceptId, unitId } of legacyConcepts) {
    const results = storage.getAttemptsForUnit('math', unitId);
    assert.equal(results.length, 1, `Failed to retrieve attempt for unit ${unitId}`);
    assert.equal(results[0].conceptId, conceptId);
    assert.equal(results[0].unitPath, `math/${unitId}`);
    assert.equal(results[0].unitId, unitId);
  }
});

test('M1.6: getAttemptsForUnit aggregates attempts across learningAttempts, practiceHistory, and reviewHistory without duplicates', () => {
  resetStorage({
    schemaVersion: 2,
    learningAttempts: [
      { id: 'att-source-1', conceptId: 'addition', question: 'Q1', isCorrect: true, timestamp: '2026-10-01T00:00:00Z' },
    ],
    practiceHistory: [
      {
        id: 'sess-p-1',
        timestamp: '2026-10-02T00:00:00Z',
        answers: [
          { id: 'att-source-2', moduleId: 'addition', format: 'fill', isCorrect: false, question: 'Q2' },
          { id: 'att-source-1', moduleId: 'addition', format: 'fill', isCorrect: true, question: 'Q1' }, // Duplicate ID
        ],
      },
    ],
    reviewHistory: [
      {
        id: 'sess-r-1',
        timestamp: '2026-10-03T00:00:00Z',
        answers: [
          { id: 'att-source-3', conceptId: 'addition', isCorrect: true, question: 'Q3' },
        ],
      },
    ],
  });

  const aggregated = storage.getAttemptsForUnit('math', 'add-subtract-fractions');
  assert.equal(aggregated.length, 3, 'Must aggregate across 3 sources and deduplicate att-source-1');
  assert.ok(aggregated.some((a) => a.id === 'att-source-1'));
  assert.ok(aggregated.some((a) => a.id === 'att-source-2'));
  assert.ok(aggregated.some((a) => a.id === 'att-source-3'));
});

test('M1.7: getAttemptsForUnit retrieves new-format attempts for units 7-12 without legacy mappings', () => {
  resetStorage({
    schemaVersion: 2,
    learningAttempts: [
      { id: 'att-u7', unitPath: 'math/negative-numbers', unitId: 'negative-numbers', isCorrect: true },
      { id: 'att-u12', unitPath: 'math/intro-algebra', unitId: 'intro-algebra', isCorrect: false },
    ],
  });

  const u7 = storage.getAttemptsForUnit('math', 'negative-numbers');
  assert.equal(u7.length, 1);
  assert.equal(u7[0].id, 'att-u7');
  assert.equal(u7[0].unitPath, 'math/negative-numbers');

  const u12 = storage.getAttemptsForUnit('math', 'intro-algebra');
  assert.equal(u12.length, 1);
  assert.equal(u12[0].id, 'att-u12');
  assert.equal(u12[0].unitPath, 'math/intro-algebra');

  const emptyUnit = storage.getAttemptsForUnit('math', 'factors-multiples');
  assert.equal(emptyUnit.length, 0);
});

// ============================================================================
// GROUP 2: Raw LocalStorage Record Preservation (Requirement R4, AC 131-133)
// ============================================================================

test('M1.8: Raw localStorage records are strictly preserved without deletion or mutation during read queries', () => {
  const initialFixture = {
    schemaVersion: 2,
    settings: { theme: 'forest', fontSize: 'small', aiApiKey: 'user-fixture-secret-999' },
    streak: { current: 5, best: 14, lastDate: '2026-10-03' },
    diagnostic: { overallScore: 88, categories: {} },
    rulebook: [{ id: 'rule:add', title: 'Fraction Addition', notes: 'Keep common denominators!' }],
    learningAttempts: [
      {
        id: 'att-pure-1',
        conceptId: 'addition',
        question: '1/4 + 1/6',
        initialAnswer: '2/10',
        submittedAnswer: '5/12',
        reflectiveCause: 'rule-confused',
        explanation: 'Find common multiple 12',
      },
    ],
    customUserData: { pinnedUnit: 'math/add-subtract-fractions' },
  };

  resetStorage(initialFixture);
  const rawBefore = global.localStorage.getItem('mathfoundry_data');

  // Perform multiple read operations
  storage.getAttemptsForUnit('math', 'add-subtract-fractions');
  storage.getLessonProgress('math/add-subtract-fractions');
  storage.getUnitQuizResult('math/add-subtract-fractions');
  storage.getSettings();
  storage.getStreak();
  storage.getDiagnosticResults();
  storage.getRulebook();

  const rawAfter = global.localStorage.getItem('mathfoundry_data');
  assert.equal(rawAfter, rawBefore, 'Read operations must not mutate or rewrite the raw localStorage document');

  // Verify raw attempt properties remain unchanged
  const parsed = JSON.parse(rawAfter);
  assert.equal(parsed.learningAttempts[0].unitPath, undefined, 'Raw legacy attempt must not have fields injected into raw storage on read');
  assert.equal(parsed.learningAttempts[0].initialAnswer, '2/10');
  assert.equal(parsed.learningAttempts[0].reflectiveCause, 'rule-confused');
  assert.equal(parsed.settings.aiApiKey, 'user-fixture-secret-999');
  assert.equal(parsed.customUserData.pinnedUnit, 'math/add-subtract-fractions');
});

test('M1.9: saveLearningAttempt additively enriches new attempts without mutating or dropping raw legacy fields', () => {
  const legacyAttempt = {
    id: 'att-legacy-save',
    conceptId: 'addition',
    question: '1/3 + 1/6',
    initialAnswer: '2/9',
    reflectiveCause: 'calc-slip',
  };

  resetStorage({
    schemaVersion: 2,
    learningAttempts: [legacyAttempt],
  });

  const newAttempt = {
    id: 'att-new-save',
    conceptId: 'addition',
    unitId: 'add-subtract-fractions',
    unitPath: 'math/add-subtract-fractions',
    question: '2/5 + 1/10',
    isCorrect: true,
  };

  assert.equal(storage.saveLearningAttempt(newAttempt), true);

  const rawStore = JSON.parse(global.localStorage.getItem('mathfoundry_data'));
  assert.equal(rawStore.learningAttempts.length, 2);

  // Original record remains identical
  assert.equal(rawStore.learningAttempts[0].id, 'att-legacy-save');
  assert.equal(rawStore.learningAttempts[0].initialAnswer, '2/9');
  assert.equal(rawStore.learningAttempts[0].reflectiveCause, 'calc-slip');

  // New record saved with normalized fields
  assert.equal(rawStore.learningAttempts[1].id, 'att-new-save');
  assert.equal(rawStore.learningAttempts[1].unitPath, 'math/add-subtract-fractions');

  // Idempotency check: duplicate attempt is rejected
  assert.equal(storage.saveLearningAttempt(newAttempt), false);
  assert.equal(storage.getLearningAttempts().length, 2);
});

test('M1.10: exportLearningData preserves historical data while stripping sensitive API keys', () => {
  resetStorage({
    schemaVersion: 2,
    settings: { theme: 'dark', aiApiKey: 'secret-tutor-token-888' },
    learningAttempts: [{ id: 'att-1', conceptId: 'arithmetic' }],
    rulebook: [{ id: 'rule-1', notes: 'Private student rule' }],
  });

  const exportedJson = storage.exportLearningData();
  const backup = JSON.parse(exportedJson);

  assert.equal(backup.learningAttempts.length, 1);
  assert.equal(backup.rulebook[0].notes, 'Private student rule');
  assert.equal(backup.settings.theme, 'dark');
  assert.equal(backup.settings.aiApiKey, undefined, 'API key must be stripped from exported data');

  // exportRawData retains raw storage verbatim
  const rawExport = storage.exportRawData();
  assert.ok(rawExport.includes('secret-tutor-token-888'));
});

// ============================================================================
// GROUP 3: 12-Unit Prerequisite DAG & Topological Sorting (Requirement R5)
// ============================================================================

test('M1.11: 12-unit Math Foundations course definitions have consecutive orders, complete metadata, and correct capabilities', () => {
  assert.equal(mathFoundationsUnits.length, 12);

  const seenIds = new Set();
  const seenOrders = new Set();

  mathFoundationsUnits.forEach((unit, idx) => {
    assert.equal(unit.order, idx + 1);
    assert.ok(unit.id && typeof unit.id === 'string');
    assert.ok(!seenIds.has(unit.id), `Duplicate unit id: ${unit.id}`);
    seenIds.add(unit.id);
    seenOrders.add(unit.order);

    assert.equal(unit.courseId, 'math');
    assert.equal(unit.unitPath, `math/${unit.id}`);
    assert.ok(unit.title && unit.title.length > 0);
    assert.ok(unit.description && unit.description.length > 0);
    assert.ok(Array.isArray(unit.prerequisites));
    assert.equal(typeof unit.hasLesson, 'boolean');
    assert.equal(typeof unit.hasLab, 'boolean');
    assert.equal(typeof unit.hasPractice, 'boolean');
    assert.equal(typeof unit.hasQuiz, 'boolean');

    // Units 1-6 have legacy concept IDs and practice content
    if (idx < 6) {
      assert.ok(unit.legacyConceptId !== null, `Unit ${unit.id} must have legacyConceptId`);
      assert.equal(unit.hasPractice, true);
    } else {
      assert.equal(unit.legacyConceptId, null);
      assert.equal(unit.hasPractice, false);
    }

    // Authored lesson is active for Unit 4 only
    if (unit.id === 'add-subtract-fractions') {
      assert.equal(unit.hasLesson, true);
    } else {
      assert.equal(unit.hasLesson, false);
    }

    // Lab types
    if (unit.hasLab) {
      assert.ok(['fraction-bars', 'number-line'].includes(unit.labType));
    } else {
      assert.equal(unit.labType, null);
    }
  });

  assert.equal(seenOrders.size, 12);
});

test('M1.12: Topological sorting confirms zero cycles in the 12-unit prerequisite DAG and Unit 1 has 0 prerequisites', () => {
  // 1. Build adjacency list and in-degrees
  const inDegree = new Map();
  const adjList = new Map(); // prereq -> dependents

  for (const unit of mathFoundationsUnits) {
    inDegree.set(unit.id, unit.prerequisites.length);
    adjList.set(unit.id, []);
  }

  for (const unit of mathFoundationsUnits) {
    for (const prereq of unit.prerequisites) {
      assert.ok(adjList.has(prereq), `Prerequisite "${prereq}" must exist in mathFoundationsUnits`);
      adjList.get(prereq).push(unit.id);
    }
  }

  // 2. Queue nodes with 0 prerequisites
  const queue = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  // Unit 1 is the sole root with 0 prerequisites
  assert.equal(queue.length, 1);
  assert.equal(queue[0], 'arithmetic');
  assert.equal(mathFoundationsUnits[0].prerequisites.length, 0);

  // 3. Execute Kahn's algorithm
  const topoOrder = [];
  while (queue.length > 0) {
    const current = queue.shift();
    topoOrder.push(current);

    for (const dep of adjList.get(current)) {
      const newDeg = inDegree.get(dep) - 1;
      inDegree.set(dep, newDeg);
      if (newDeg === 0) {
        queue.push(dep);
      }
    }
  }

  // Zero cycles proof: all 12 units were reached and sorted
  assert.equal(topoOrder.length, 12);

  // Invariant verification: for every unit, all prerequisites appear before it in topoOrder
  for (const unit of mathFoundationsUnits) {
    const unitIdx = topoOrder.indexOf(unit.id);
    for (const prereq of unit.prerequisites) {
      const prereqIdx = topoOrder.indexOf(prereq);
      assert.ok(
        prereqIdx < unitIdx,
        `Topological violation: prereq "${prereq}" (index ${prereqIdx}) must precede "${unit.id}" (index ${unitIdx})`
      );
    }
  }
});

test('M1.13: Multi-prerequisite evaluation for Unit 5 (multiply-fractions) requires both arithmetic and equivalent-fractions', () => {
  const unit5 = getMathUnit('multiply-fractions');
  assert.ok(unit5);
  assert.deepEqual(unit5.prerequisites, ['arithmetic', 'equivalent-fractions']);

  // Case 1: None satisfied
  const checkEmpty = checkUnitPrerequisites('multiply-fractions', []);
  assert.equal(checkEmpty.eligible, false);
  assert.equal(checkEmpty.isLocked, true);
  assert.deepEqual(checkEmpty.missingPrerequisites, ['arithmetic', 'equivalent-fractions']);

  // Case 2: Only arithmetic satisfied
  const checkArith = checkUnitPrerequisites('multiply-fractions', ['arithmetic']);
  assert.equal(checkArith.eligible, false);
  assert.equal(checkArith.isLocked, true);
  assert.deepEqual(checkArith.missingPrerequisites, ['equivalent-fractions']);

  // Case 3: Only equivalent-fractions satisfied
  const checkEquiv = checkUnitPrerequisites('multiply-fractions', ['equivalent-fractions']);
  assert.equal(checkEquiv.eligible, false);
  assert.equal(checkEquiv.isLocked, true);
  assert.deepEqual(checkEquiv.missingPrerequisites, ['arithmetic']);

  // Case 4: Both satisfied
  const checkBoth = checkUnitPrerequisites('multiply-fractions', ['arithmetic', 'equivalent-fractions']);
  assert.equal(checkBoth.eligible, true);
  assert.equal(checkBoth.isLocked, false);
  assert.deepEqual(checkBoth.missingPrerequisites, []);
});

test('M1.14: Multi-prerequisite evaluation for Unit 9 (ratios-percentages) requires both add-subtract-fractions and decimals-place-value', () => {
  const unit9 = getMathUnit('ratios-percentages');
  assert.ok(unit9);
  assert.deepEqual(unit9.prerequisites, ['add-subtract-fractions', 'decimals-place-value']);

  // Case 1: None satisfied
  const checkEmpty = checkUnitPrerequisites('ratios-percentages', []);
  assert.equal(checkEmpty.eligible, false);
  assert.equal(checkEmpty.isLocked, true);
  assert.deepEqual(checkEmpty.missingPrerequisites, ['add-subtract-fractions', 'decimals-place-value']);

  // Case 2: Only add-subtract-fractions satisfied
  const checkAdd = checkUnitPrerequisites('ratios-percentages', ['add-subtract-fractions']);
  assert.equal(checkAdd.eligible, false);
  assert.deepEqual(checkAdd.missingPrerequisites, ['decimals-place-value']);

  // Case 3: Only decimals-place-value satisfied
  const checkDec = checkUnitPrerequisites('ratios-percentages', ['decimals-place-value']);
  assert.equal(checkDec.eligible, false);
  assert.deepEqual(checkDec.missingPrerequisites, ['add-subtract-fractions']);

  // Case 4: Both satisfied
  const checkBoth = checkUnitPrerequisites('ratios-percentages', ['add-subtract-fractions', 'decimals-place-value']);
  assert.equal(checkBoth.eligible, true);
  assert.equal(checkBoth.isLocked, false);
  assert.deepEqual(checkBoth.missingPrerequisites, []);
});

test('M1.15: Multi-prerequisite evaluation for Unit 12 (intro-algebra) requires both order-of-operations and negative-numbers', () => {
  const unit12 = getMathUnit('intro-algebra');
  assert.ok(unit12);
  assert.deepEqual(unit12.prerequisites, ['order-of-operations', 'negative-numbers']);

  // Case 1: None satisfied
  const checkEmpty = checkUnitPrerequisites('intro-algebra', []);
  assert.equal(checkEmpty.eligible, false);
  assert.equal(checkEmpty.isLocked, true);
  assert.deepEqual(checkEmpty.missingPrerequisites, ['order-of-operations', 'negative-numbers']);

  // Case 2: Only order-of-operations satisfied
  const checkOrder = checkUnitPrerequisites('intro-algebra', ['order-of-operations']);
  assert.equal(checkOrder.eligible, false);
  assert.deepEqual(checkOrder.missingPrerequisites, ['negative-numbers']);

  // Case 3: Only negative-numbers satisfied
  const checkNeg = checkUnitPrerequisites('intro-algebra', ['negative-numbers']);
  assert.equal(checkNeg.eligible, false);
  assert.deepEqual(checkNeg.missingPrerequisites, ['order-of-operations']);

  // Case 4: Both satisfied
  const checkBoth = checkUnitPrerequisites('intro-algebra', ['order-of-operations', 'negative-numbers']);
  assert.equal(checkBoth.eligible, true);
  assert.equal(checkBoth.isLocked, false);
  assert.deepEqual(checkBoth.missingPrerequisites, []);
});

test('M1.16: Unit lookup and navigation helpers (getMathUnit, getNextMathUnit, getPreviousMathUnit, getDownstreamMathUnits, getTransitivePrerequisites)', () => {
  // getMathUnit
  assert.equal(getMathUnit('arithmetic')?.id, 'arithmetic');
  assert.equal(getMathUnit('math/arithmetic')?.id, 'arithmetic');
  assert.equal(getMathUnit('addition')?.id, 'add-subtract-fractions');
  assert.equal(getMathUnit('unknown-unit'), null);
  assert.equal(getMathUnit(null), null);

  // Sequential navigation
  assert.equal(getNextMathUnit('arithmetic')?.id, 'equivalent-fractions');
  assert.equal(getPreviousMathUnit('equivalent-fractions')?.id, 'arithmetic');
  assert.equal(getPreviousMathUnit('arithmetic'), null);
  assert.equal(getNextMathUnit('intro-algebra'), null);

  // Downstream dependents
  const downstreamOfEquiv = getDownstreamMathUnits('equivalent-fractions').map((u) => u.id);
  assert.ok(downstreamOfEquiv.includes('compare-fractions'));
  assert.ok(downstreamOfEquiv.includes('add-subtract-fractions'));
  assert.ok(downstreamOfEquiv.includes('multiply-fractions'));

  // Transitive prerequisites closure
  const transitive12 = getTransitivePrerequisites('intro-algebra');
  assert.ok(transitive12.includes('order-of-operations'));
  assert.ok(transitive12.includes('negative-numbers'));
  assert.ok(transitive12.includes('arithmetic'));
});

// ============================================================================
// GROUP 4: Lesson Progress Persistence & Evidence Isolation (Requirement R1, AC 107, 111)
// ============================================================================

test('M1.17: Lesson progress persists step index and accumulates micro-check answers across multiple updates', () => {
  resetStorage();

  // Initial read is default empty progress
  const initial = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(initial.currentStepIndex, 0);
  assert.equal(initial.completed, false);
  assert.equal(initial.completedAt, null);
  assert.deepEqual(initial.microCheckAnswers, {});

  // Step 2: Answer first micro-check
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 2,
    microCheckAnswers: {
      'mc-step-2': { answer: '2/6', isCorrect: true, timestamp: '2026-10-04T01:00:00Z' },
    },
  });

  const progressStep2 = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(progressStep2.currentStepIndex, 2);
  assert.equal(progressStep2.microCheckAnswers['mc-step-2'].answer, '2/6');
  assert.equal(progressStep2.microCheckAnswers['mc-step-2'].isCorrect, true);
  assert.equal(progressStep2.completed, false);

  // Step 5: Answer second micro-check (must not erase step 2's answer)
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 5,
    microCheckAnswers: {
      'mc-step-5': { answer: '5/12', isCorrect: true, timestamp: '2026-10-04T01:02:00Z' },
    },
  });

  const progressStep5 = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(progressStep5.currentStepIndex, 5);
  assert.ok(progressStep5.microCheckAnswers['mc-step-2']);
  assert.ok(progressStep5.microCheckAnswers['mc-step-5']);

  // Complete lesson
  storage.completeLesson('math/add-subtract-fractions');
  const completed = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(completed.completed, true);
  assert.ok(completed.completedAt);
  assert.equal(completed.currentStepIndex, 5);
});

test('M1.18: Formative lesson micro-checks NEVER write to learningAttempts, practiceHistory, or mastery models', () => {
  const initialAttempt = { id: 'pre-existing-att', conceptId: 'arithmetic', isCorrect: true };
  const initialMastery = { angles: { correct: 3, total: 3 } };

  resetStorage({
    schemaVersion: 2,
    learningAttempts: [initialAttempt],
    mastery: initialMastery,
    practiceHistory: [],
  });

  const attemptsBefore = storage.getLearningAttempts();
  const practiceBefore = storage.getPracticeHistory();
  const masteryBefore = storage.getMastery();

  // Execute interactive lesson with multiple micro-checks
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 2,
    microCheckAnswers: {
      'check-1': { answer: 'wrong-ans', isCorrect: false },
    },
  });
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 6,
    microCheckAnswers: {
      'check-2': { answer: 'right-ans', isCorrect: true },
    },
  });
  storage.completeLesson('math/add-subtract-fractions');

  // Strict assertion: Zero writes to mastery, attempts, or practice history
  assert.deepEqual(storage.getLearningAttempts(), attemptsBefore);
  assert.deepEqual(storage.getPracticeHistory(), practiceBefore);
  assert.deepEqual(storage.getMastery(), masteryBefore);
});

test('M1.19: Lesson progress is isolated across different units', () => {
  resetStorage();

  storage.saveLessonProgress('math/add-subtract-fractions', { currentStepIndex: 4, completed: false });
  storage.saveLessonProgress('math/equivalent-fractions', { currentStepIndex: 1, completed: true });

  const asf = storage.getLessonProgress('math/add-subtract-fractions');
  const equiv = storage.getLessonProgress('math/equivalent-fractions');

  assert.equal(asf.currentStepIndex, 4);
  assert.equal(asf.completed, false);

  assert.equal(equiv.currentStepIndex, 1);
  assert.equal(equiv.completed, true);
});

// ============================================================================
// GROUP 5: Unit Quiz Persistence (Requirement R3)
// ============================================================================

test('M1.20: Unit quiz persistence saves and retrieves quiz results under store.unitQuizzes', () => {
  resetStorage();

  assert.equal(storage.getUnitQuizResult('math/add-subtract-fractions'), null);

  const quizResult = {
    score: 100,
    correct: 4,
    total: 4,
    passed: true,
    reviewSessionId: 'quiz-sess-101',
  };

  storage.saveUnitQuizResult('math/add-subtract-fractions', quizResult);

  const saved = storage.getUnitQuizResult('math/add-subtract-fractions');
  assert.ok(saved);
  assert.equal(saved.score, 100);
  assert.equal(saved.correct, 4);
  assert.equal(saved.passed, true);
  assert.equal(saved.unitPath, 'math/add-subtract-fractions');
  assert.ok(saved.completedAt);
});

// ============================================================================
// GROUP 6: Course Catalog Exports & Placeholders (Requirement R3, AC 123)
// ============================================================================

test('M1.21: Course catalog exports math as active with 12 units, and geometry, physics, and chemistry as placeholders', () => {
  assert.equal(courseCatalog.length, 4);
  assert.equal(getCourses().length, 4);

  // Active math course
  const math = getCourse('math');
  assert.ok(math);
  assert.equal(math.status, 'active');
  assert.equal(math.unitCount, 12);
  assert.equal(math.path, '/courses/math');
  assert.equal(isCourseActive('math'), true);
  assert.equal(math.units.length, 12);

  // Placeholder courses
  const geometry = getCourse('geometry');
  assert.ok(geometry);
  assert.equal(geometry.status, 'placeholder');
  assert.equal(isCourseActive('geometry'), false);

  const physics = getCourse('physics');
  assert.ok(physics);
  assert.equal(physics.status, 'placeholder');
  assert.equal(isCourseActive('physics'), false);

  const chemistry = getCourse('chemistry');
  assert.ok(chemistry);
  assert.equal(chemistry.status, 'placeholder');
  assert.equal(isCourseActive('chemistry'), false);

  // Active course filter
  const activeCourses = getActiveCourses();
  assert.equal(activeCourses.length, 1);
  assert.equal(activeCourses[0].id, 'math');
});

// ============================================================================
// GROUP 7: Composite Progress & Backward Compatibility
// ============================================================================

test('M1.22: getUnitProgress evaluates composite status across lesson, quiz, and attempt history', () => {
  resetStorage({
    schemaVersion: 2,
    learningAttempts: [
      { id: 'att-comp-1', conceptId: 'addition', isCorrect: true },
    ],
  });

  storage.saveLessonProgress('math/add-subtract-fractions', { currentStepIndex: 3, completed: false });
  storage.saveUnitQuizResult('math/add-subtract-fractions', { score: 75, passed: true });

  const progress = storage.getUnitProgress('math', 'add-subtract-fractions');
  assert.equal(progress.unitPath, 'math/add-subtract-fractions');
  assert.equal(progress.lesson.currentStepIndex, 3);
  assert.equal(progress.quiz.score, 75);
  assert.equal(progress.attempts.length, 1);
  assert.equal(progress.attempts[0].id, 'att-comp-1');
});

test('M1.23: Existing store operations (settings, streak, rulebook, repair) remain 100% backward-compatible', () => {
  resetStorage();

  // Settings
  storage.setSettings({ theme: 'dark', compactSidebar: true });
  assert.equal(storage.getSettings().theme, 'dark');

  // Streak
  const streak = storage.updateStreak();
  assert.ok(typeof streak.current === 'number');

  // Module Progress
  storage.setModuleProgress('angles', { completed: true });
  assert.equal(storage.getProgress().angles.completed, true);

  // Practice Session
  const sessionSaved = storage.savePracticeSession({
    id: 'compat-sess-1',
    score: 100,
    answers: [{ moduleId: 'angles', format: 'fill', isCorrect: true }],
  });
  assert.equal(sessionSaved, true);
  assert.equal(storage.getPracticeHistory().length, 1);
  assert.deepEqual(storage.getMastery().angles, { correct: 1, total: 1 });

  // Rulebook
  storage.saveRulebookEntry({ id: 'rule:compat', title: 'Test Rule', explanation: 'Test explanation', notes: 'Keep this note' });
  const rule = storage.getRulebook().find((r) => r.id === 'rule:compat');
  assert.ok(rule);
  assert.equal(rule.notes, 'Keep this note');
});
