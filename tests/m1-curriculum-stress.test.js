import test from 'node:test';
import assert from 'node:assert/strict';

// Curriculum and Course Definitions
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

// Storage Layer
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
// Helper: Generic Kahn's Algorithm Implementation for Arbitrary Node Definitions
// ============================================================================

function runKahnsAlgorithm(nodes) {
  const inDegree = new Map();
  const adjList = new Map();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  }

  for (const node of nodes) {
    for (const prereq of node.prerequisites) {
      if (!adjList.has(prereq)) {
        throw new Error(`Prerequisite "${prereq}" referenced by "${node.id}" does not exist in graph`);
      }
      adjList.get(prereq).push(node.id);
      inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
    }
  }

  const queue = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

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

  const hasCycle = topoOrder.length < nodes.length;
  return {
    topoOrder,
    hasCycle,
    initialRoots: queue.length,
    unresolvedCount: nodes.length - topoOrder.length,
  };
}

// Pseudo-random Fisher-Yates shuffle with deterministic seed
function seededShuffle(array, seed) {
  const arr = [...array];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================================================
// CHALLENGE SUITE 1: Topological Ordering & Random Graph Permutations
// ============================================================================

test('CHALLENGE 1.1: Math Foundations DAG has strict linear order compatibility and single root', () => {
  assert.equal(mathFoundationsUnits.length, 12, 'Must contain exactly 12 units');

  // Verify exactly one root unit
  const roots = mathFoundationsUnits.filter((u) => u.prerequisites.length === 0);
  assert.equal(roots.length, 1, 'Exactly one root node with 0 prerequisites must exist');
  assert.equal(roots[0].id, 'arithmetic', 'Unit 1 (arithmetic) must be the sole root');

  // Verify all other 11 units declare at least one prerequisite
  const nonRoots = mathFoundationsUnits.filter((u) => u.prerequisites.length > 0);
  assert.equal(nonRoots.length, 11, 'All 11 non-root units must declare at least one prerequisite');

  // Every prerequisite must point backwards in the default order
  mathFoundationsUnits.forEach((unit, idx) => {
    for (const prereqId of unit.prerequisites) {
      const prereqIdx = mathFoundationsUnits.findIndex((u) => u.id === prereqId);
      assert.ok(prereqIdx !== -1, `Prerequisite "${prereqId}" must exist in mathFoundationsUnits`);
      assert.ok(
        prereqIdx < idx,
        `Topological violation in authoring order: prereq "${prereqId}" at ${prereqIdx} must precede "${unit.id}" at ${idx}`
      );
    }
  });
});

test('CHALLENGE 1.2: 500 Random Graph Permutations all resolve to valid topological orderings', () => {
  const originalNodes = mathFoundationsUnits.map((u) => ({
    id: u.id,
    prerequisites: [...u.prerequisites],
  }));

  for (let seed = 1; seed <= 500; seed++) {
    const shuffled = seededShuffle(originalNodes, seed);
    const result = runKahnsAlgorithm(shuffled);

    assert.equal(
      result.hasCycle,
      false,
      `Kahn algorithm failed on permutation seed ${seed}: cycle detected where none exists`
    );
    assert.equal(
      result.topoOrder.length,
      12,
      `Topological order must include all 12 units on permutation seed ${seed}`
    );

    // Verify ordering invariant on the resulting topoOrder:
    // for all nodes, every prerequisite must appear before the node
    for (const node of originalNodes) {
      const nodePos = result.topoOrder.indexOf(node.id);
      for (const prereq of node.prerequisites) {
        const prereqPos = result.topoOrder.indexOf(prereq);
        assert.ok(
          prereqPos < nodePos,
          `Topological invariant violated on seed ${seed}: prereq "${prereq}" (${prereqPos}) does not precede "${node.id}" (${nodePos})`
        );
      }
    }
  }
});

// ============================================================================
// CHALLENGE SUITE 2: Adversarial Cycle Injections
// ============================================================================

test('CHALLENGE 2.1: Adversarial Self-Loop Cycle Injection is reliably detected across all 12 units', () => {
  for (const targetUnit of mathFoundationsUnits) {
    const mutatedNodes = mathFoundationsUnits.map((u) => ({
      id: u.id,
      prerequisites: u.id === targetUnit.id ? [...u.prerequisites, u.id] : [...u.prerequisites],
    }));

    const result = runKahnsAlgorithm(mutatedNodes);
    assert.equal(
      result.hasCycle,
      true,
      `Self-loop on unit "${targetUnit.id}" must trigger cycle detection`
    );
    assert.ok(
      !result.topoOrder.includes(targetUnit.id),
      `Unit "${targetUnit.id}" with self-loop must not be resolved in topological order`
    );
  }
});

test('CHALLENGE 2.2: Adversarial 2-Cycle Injection between adjacent and distant nodes', () => {
  // Direct 2-cycle between Unit 1 (arithmetic) and Unit 2 (equivalent-fractions)
  // arithmetic -> equivalent-fractions AND equivalent-fractions -> arithmetic
  const mutatedNodes = mathFoundationsUnits.map((u) => {
    if (u.id === 'arithmetic') {
      return { id: u.id, prerequisites: ['equivalent-fractions'] };
    }
    return { id: u.id, prerequisites: [...u.prerequisites] };
  });

  const result = runKahnsAlgorithm(mutatedNodes);
  assert.equal(result.hasCycle, true, '2-cycle between arithmetic and equivalent-fractions must be detected');
  assert.equal(result.topoOrder.length, 0, 'No nodes should resolve when the sole root is part of a 2-cycle');
  assert.equal(result.unresolvedCount, 12);
});

test('CHALLENGE 2.3: Global 12-Node Ring Cycle Injection renders entire graph unresolvable', () => {
  // Inject back-edge from Unit 1 (arithmetic) to Unit 12 (intro-algebra)
  const mutatedNodes = mathFoundationsUnits.map((u) => {
    if (u.id === 'arithmetic') {
      return { id: u.id, prerequisites: ['intro-algebra'] };
    }
    return { id: u.id, prerequisites: [...u.prerequisites] };
  });

  const result = runKahnsAlgorithm(mutatedNodes);
  assert.equal(result.hasCycle, true, 'Back-edge intro-algebra -> arithmetic creates a global cycle');
  assert.equal(result.topoOrder.length, 0, 'Graph with 0 in-degree nodes must immediately halt');
  assert.equal(result.unresolvedCount, 12);
});

test('CHALLENGE 2.4: Local Internal Cycle leaves upstream nodes resolvable and downstream nodes blocked', () => {
  // Inject cycle between Unit 5 (multiply-fractions) and Unit 6 (divide-fractions):
  // divide-fractions requires multiply-fractions; inject multiply-fractions requires divide-fractions
  const mutatedNodes = mathFoundationsUnits.map((u) => {
    if (u.id === 'multiply-fractions') {
      return { id: u.id, prerequisites: [...u.prerequisites, 'divide-fractions'] };
    }
    return { id: u.id, prerequisites: [...u.prerequisites] };
  });

  const result = runKahnsAlgorithm(mutatedNodes);
  assert.equal(result.hasCycle, true, 'Mutual dependency between multiply-fractions and divide-fractions must be detected');
  // Units 1, 2, 3, 4, 7, 8, 10, 11 do not depend on 5 or 6, so they should resolve
  assert.ok(result.topoOrder.includes('arithmetic'));
  assert.ok(result.topoOrder.includes('equivalent-fractions'));
  assert.ok(result.topoOrder.includes('compare-fractions'));
  assert.ok(result.topoOrder.includes('add-subtract-fractions'));
  assert.ok(!result.topoOrder.includes('multiply-fractions'), 'Mutually cyclic multiply-fractions must not resolve');
  assert.ok(!result.topoOrder.includes('divide-fractions'), 'Mutually cyclic divide-fractions must not resolve');
});

test('CHALLENGE 2.5: Transitive Prerequisite Traversal terminates without stack overflow on cyclic graphs', () => {
  // Emulate getTransitivePrerequisites logic under an adversarial cycle
  const cyclicMap = new Map([
    ['A', ['B']],
    ['B', ['C']],
    ['C', ['A', 'D']],
    ['D', []],
  ]);

  const visited = new Set();
  function traverse(currentId) {
    const prereqs = cyclicMap.get(currentId) || [];
    for (const pId of prereqs) {
      if (!visited.has(pId)) {
        visited.add(pId);
        traverse(pId);
      }
    }
  }

  // Traversal must terminate in finite steps and avoid RangeError: Maximum call stack size exceeded
  traverse('A');
  assert.deepEqual(Array.from(visited).sort(), ['A', 'B', 'C', 'D'].sort());
});

// ============================================================================
// CHALLENGE SUITE 3: Multi-Prerequisite Lock State Evaluation
// ============================================================================

test('CHALLENGE 3.1: Complete Power Set Evaluation of Multi-Prerequisite Units (Units 5, 9, 12)', () => {
  const multiPrereqUnits = [
    { id: 'multiply-fractions', prereqs: ['arithmetic', 'equivalent-fractions'] },
    { id: 'ratios-percentages', prereqs: ['add-subtract-fractions', 'decimals-place-value'] },
    { id: 'intro-algebra', prereqs: ['order-of-operations', 'negative-numbers'] },
  ];

  for (const { id, prereqs } of multiPrereqUnits) {
    const [p1, p2] = prereqs;

    // Subset 0: Empty set -> LOCKED
    const resEmpty = checkUnitPrerequisites(id, []);
    assert.equal(resEmpty.eligible, false, `${id} with empty prereqs must be locked`);
    assert.equal(resEmpty.isLocked, true);
    assert.deepEqual(resEmpty.missingPrerequisites.sort(), prereqs.sort());

    // Subset 1: {p1} only -> LOCKED
    const resP1 = checkUnitPrerequisites(id, [p1]);
    assert.equal(resP1.eligible, false, `${id} with only ${p1} must be locked`);
    assert.equal(resP1.isLocked, true);
    assert.deepEqual(resP1.missingPrerequisites, [p2]);

    // Subset 2: {p2} only -> LOCKED
    const resP2 = checkUnitPrerequisites(id, [p2]);
    assert.equal(resP2.eligible, false, `${id} with only ${p2} must be locked`);
    assert.equal(resP2.isLocked, true);
    assert.deepEqual(resP2.missingPrerequisites, [p1]);

    // Subset 3: {p1, p2} (Both satisfied) -> UNLOCKED
    const resBoth = checkUnitPrerequisites(id, [p1, p2]);
    assert.equal(resBoth.eligible, true, `${id} with both prereqs must be unlocked`);
    assert.equal(resBoth.isLocked, false);
    assert.deepEqual(resBoth.missingPrerequisites, []);

    // Subset 4: Both satisfied in reverse order -> UNLOCKED
    const resRev = checkUnitPrerequisites(id, [p2, p1]);
    assert.equal(resRev.eligible, true);
    assert.equal(resRev.isLocked, false);
    assert.deepEqual(resRev.missingPrerequisites, []);
  }
});

test('CHALLENGE 3.2: Prerequisite satisfaction accepts mixed identifier formats (slugs, paths, legacy aliases, Sets)', () => {
  // Test Unit 5 (multiply-fractions) requiring arithmetic and equivalent-fractions
  // Using:
  // - canonical unit paths: 'math/arithmetic'
  // - legacy aliases: 'equivalence' (for equivalent-fractions)
  const satisfiedSet = new Set(['math/arithmetic', 'equivalence']);
  const evalSet = checkUnitPrerequisites('multiply-fractions', satisfiedSet);
  assert.equal(evalSet.eligible, true, 'Set with path math/arithmetic and legacy alias equivalence must unlock Unit 5');
  assert.equal(evalSet.isLocked, false);
  assert.deepEqual(evalSet.missingPrerequisites, []);

  // Test Unit 4 (add-subtract-fractions) requiring equivalent-fractions
  // Satisfied with legacy alias 'equivalence'
  const evalLegacy = checkUnitPrerequisites('math/add-subtract-fractions', ['equivalence']);
  assert.equal(evalLegacy.eligible, true, 'math/add-subtract-fractions must unlock via legacy alias equivalence');

  // Test Unit 9 (ratios-percentages) requiring add-subtract-fractions and decimals-place-value
  // Satisfied with legacy alias 'addition' for add-subtract-fractions and slug 'decimals-place-value'
  const evalMixed = checkUnitPrerequisites('ratios-percentages', ['addition', 'math/decimals-place-value']);
  assert.equal(evalMixed.eligible, true, 'Unit 9 must unlock via mixed legacy alias and canonical path');
});

test('CHALLENGE 3.3: Prerequisite evaluation handles hostile, malformed, and noisy inputs gracefully', () => {
  // Input containing noisy null, undefined, empty strings, numbers, foreign slugs
  const noisyInput = [null, undefined, '', '   ', 42, 'geometry/triangles', 'math/arithmetic', 'equivalence'];
  const resNoisy = checkUnitPrerequisites('multiply-fractions', noisyInput);
  assert.equal(resNoisy.eligible, true, 'Noisy input containing valid prereqs must cleanly unlock');
  assert.equal(resNoisy.isLocked, false);

  // Non-existent target unit
  const nonExistent = checkUnitPrerequisites('non-existent-quantum-mechanics', ['arithmetic']);
  assert.equal(nonExistent.eligible, false);
  assert.equal(nonExistent.isLocked, true);
  assert.equal(nonExistent.unit, null);
  assert.deepEqual(nonExistent.missingPrerequisites, []);

  // Null / undefined / invalid target unitId
  assert.equal(checkUnitPrerequisites(null).eligible, false);
  assert.equal(checkUnitPrerequisites(undefined).isLocked, true);
  assert.equal(checkUnitPrerequisites('').isLocked, true);
  assert.equal(checkUnitPrerequisites({}).isLocked, true);
});

// ============================================================================
// CHALLENGE SUITE 4: Graph Traversal, Transitive Closure & Sequential Navigation
// ============================================================================

test('CHALLENGE 4.1: Transitive prerequisites calculation accurately reflects full upstream ancestry', () => {
  // Unit 1: Root node has 0 transitive prerequisites
  assert.deepEqual(getTransitivePrerequisites('arithmetic'), []);

  // Unit 2: Direct dependency on arithmetic
  assert.deepEqual(getTransitivePrerequisites('equivalent-fractions'), ['arithmetic']);

  // Unit 3: compare-fractions -> equivalent-fractions -> arithmetic
  const u3Prereqs = getTransitivePrerequisites('compare-fractions');
  assert.equal(u3Prereqs.length, 2);
  assert.ok(u3Prereqs.includes('equivalent-fractions'));
  assert.ok(u3Prereqs.includes('arithmetic'));

  // Unit 6: divide-fractions -> multiply-fractions -> [arithmetic, equivalent-fractions] -> arithmetic
  const u6Prereqs = getTransitivePrerequisites('divide-fractions');
  assert.equal(u6Prereqs.length, 3);
  assert.ok(u6Prereqs.includes('multiply-fractions'));
  assert.ok(u6Prereqs.includes('equivalent-fractions'));
  assert.ok(u6Prereqs.includes('arithmetic'));

  // Unit 9: ratios-percentages -> [add-subtract-fractions, decimals-place-value]
  // add-subtract-fractions -> equivalent-fractions -> arithmetic
  // decimals-place-value -> arithmetic
  const u9Prereqs = getTransitivePrerequisites('ratios-percentages');
  assert.equal(u9Prereqs.length, 4);
  assert.ok(u9Prereqs.includes('add-subtract-fractions'));
  assert.ok(u9Prereqs.includes('decimals-place-value'));
  assert.ok(u9Prereqs.includes('equivalent-fractions'));
  assert.ok(u9Prereqs.includes('arithmetic'));

  // Unit 12: intro-algebra -> [order-of-operations, negative-numbers]
  // order-of-operations -> arithmetic
  // negative-numbers -> arithmetic
  const u12Prereqs = getTransitivePrerequisites('intro-algebra');
  assert.equal(u12Prereqs.length, 3);
  assert.ok(u12Prereqs.includes('order-of-operations'));
  assert.ok(u12Prereqs.includes('negative-numbers'));
  assert.ok(u12Prereqs.includes('arithmetic'));

  // Non-existent unit returns empty array
  assert.deepEqual(getTransitivePrerequisites('non-existent'), []);
  assert.deepEqual(getTransitivePrerequisites(null), []);
});

test('CHALLENGE 4.2: Direct downstream dependencies accurately partition between hub nodes and leaf nodes', () => {
  // Hub node: arithmetic has exactly 6 direct dependents
  const downstreamArith = getDownstreamMathUnits('arithmetic');
  assert.equal(downstreamArith.length, 6);
  const downstreamIds = downstreamArith.map((u) => u.id);
  assert.deepEqual(
    downstreamIds.sort(),
    [
      'equivalent-fractions',
      'multiply-fractions',
      'negative-numbers',
      'decimals-place-value',
      'factors-multiples',
      'order-of-operations',
    ].sort()
  );

  // Intermediate node: equivalent-fractions has 3 direct dependents
  const downstreamEquiv = getDownstreamMathUnits('equivalent-fractions');
  const equivDepIds = downstreamEquiv.map((u) => u.id);
  assert.deepEqual(
    equivDepIds.sort(),
    ['compare-fractions', 'add-subtract-fractions', 'multiply-fractions'].sort()
  );

  // Terminal / Leaf nodes have 0 downstream units
  assert.deepEqual(getDownstreamMathUnits('divide-fractions'), []);
  assert.deepEqual(getDownstreamMathUnits('ratios-percentages'), []);
  assert.deepEqual(getDownstreamMathUnits('factors-multiples'), []);
  assert.deepEqual(getDownstreamMathUnits('intro-algebra'), []);
  assert.deepEqual(getDownstreamMathUnits('non-existent'), []);
  assert.deepEqual(getDownstreamMathUnits(null), []);
});

test('CHALLENGE 4.3: Bidirectional sequential navigation walks the full 12 units without gaps or loops', () => {
  // Forward traversal from order 1 to 12
  let current = mathFoundationsUnits[0];
  let forwardCount = 1;
  while (current) {
    const next = getNextMathUnit(current.id);
    if (next) {
      assert.equal(next.order, current.order + 1);
      forwardCount++;
    }
    current = next;
  }
  assert.equal(forwardCount, 12, 'Forward traversal must visit all 12 units sequentially');

  // Backward traversal from order 12 to 1
  current = mathFoundationsUnits[11];
  let backwardCount = 1;
  while (current) {
    const prev = getPreviousMathUnit(current.id);
    if (prev) {
      assert.equal(prev.order, current.order - 1);
      backwardCount++;
    }
    current = prev;
  }
  assert.equal(backwardCount, 12, 'Backward traversal must visit all 12 units in reverse order');

  // Boundaries
  assert.equal(getPreviousMathUnit('arithmetic'), null, 'Root unit must have no previous unit');
  assert.equal(getNextMathUnit('intro-algebra'), null, 'Last unit must have no next unit');
  assert.equal(getNextMathUnit('unknown'), null);
  assert.equal(getPreviousMathUnit(null), null);
});

// ============================================================================
// CHALLENGE SUITE 5: Storage Layer Virtualization & Evidence Isolation Stress
// ============================================================================

test('CHALLENGE 5.1: High-volume attempt deduplication and aggregation across disparate schemas', () => {
  // Construct 1,000 attempts with simulated legacy and new schemas
  const legacyAttempts = [];
  const practiceAnswers = [];
  const reviewAnswers = [];

  for (let i = 1; i <= 500; i++) {
    // 500 unique legacy addition attempts
    legacyAttempts.push({
      id: `att-legacy-${i}`,
      conceptId: 'addition',
      question: `Fraction Addition Problem #${i}`,
      isCorrect: i % 2 === 0,
      timestamp: new Date(Date.now() - i * 1000).toISOString(),
    });
  }

  // 250 duplicate attempts shared in practiceHistory, plus 250 new practice attempts
  for (let i = 1; i <= 250; i++) {
    practiceAnswers.push({
      id: `att-legacy-${i}`, // Duplicate ID
      moduleId: 'addition',
      isCorrect: true,
      question: `Fraction Addition Problem #${i}`,
    });
    practiceAnswers.push({
      id: `att-practice-new-${i}`, // New ID
      unitId: 'add-subtract-fractions',
      unitPath: 'math/add-subtract-fractions',
      isCorrect: true,
    });
  }

  // 250 duplicate attempts in reviewHistory, plus 250 new review attempts
  for (let i = 251; i <= 500; i++) {
    reviewAnswers.push({
      id: `att-legacy-${i}`, // Duplicate ID
      conceptId: 'addition',
      isCorrect: true,
    });
  }
  for (let i = 1; i <= 250; i++) {
    reviewAnswers.push({
      id: `att-review-new-${i}`, // New ID
      unitPath: 'math/add-subtract-fractions',
      isCorrect: false,
    });
  }

  resetStorage({
    schemaVersion: 2,
    learningAttempts: legacyAttempts,
    practiceHistory: [{ id: 'sess-p', answers: practiceAnswers }],
    reviewHistory: [{ id: 'sess-r', answers: reviewAnswers }],
  });

  const aggregated = storage.getAttemptsForUnit('math', 'add-subtract-fractions');
  // Total unique IDs:
  // - 500 from legacyAttempts
  // - 250 from att-practice-new
  // - 250 from att-review-new
  // Total = 1,000 unique records
  assert.equal(aggregated.length, 1000, 'Must aggregate exactly 1,000 unique attempts with zero duplicate IDs');

  // Verify all items are properly virtualized with canonical unitPath and unitId
  for (const item of aggregated) {
    assert.equal(item.unitPath, 'math/add-subtract-fractions');
    assert.equal(item.unitId, 'add-subtract-fractions');
    assert.equal(item.conceptId, 'addition');
  }
});

test('CHALLENGE 5.2: 100 Sequential Lesson Progress updates strictly maintain evidence isolation', () => {
  resetStorage({
    schemaVersion: 2,
    learningAttempts: [{ id: 'att-sentinel', conceptId: 'arithmetic', isCorrect: true }],
    practiceHistory: [{ id: 'sess-sentinel', answers: [] }],
    reviewHistory: [{ id: 'rev-sentinel', answers: [] }],
  });

  const unitPath = 'math/add-subtract-fractions';

  // Perform 100 sequential lesson updates (progressing steps and micro-checks)
  for (let step = 0; step < 100; step++) {
    storage.saveLessonProgress(unitPath, {
      currentStepIndex: step,
      microCheckAnswers: {
        [`step_${step}`]: { answer: step * 10, passed: step % 2 === 0 },
      },
    });
  }

  // Complete lesson
  storage.completeLesson(unitPath);

  // 1. Verify lesson progress state is fully intact
  const lesson = storage.getLessonProgress(unitPath);
  assert.equal(lesson.completed, true);
  assert.ok(lesson.completedAt);
  assert.equal(Object.keys(lesson.microCheckAnswers).length, 100);
  assert.equal(lesson.microCheckAnswers.step_99.answer, 990);

  // 2. Strict evidence isolation verification:
  // Learning attempts, practice history, and review history MUST remain completely untouched!
  const attempts = storage.getLearningAttempts();
  assert.equal(attempts.length, 1, 'Mastery learningAttempts must remain exactly 1 record');
  assert.equal(attempts[0].id, 'att-sentinel');

  const store = JSON.parse(global.localStorage.getItem('mathfoundry_data'));
  assert.equal(store.learningAttempts.length, 1);
  assert.equal(store.practiceHistory.length, 1);
  assert.equal(store.reviewHistory.length, 1);
  assert.equal(store.learningAttempts[0].id, 'att-sentinel');
});

test('CHALLENGE 5.3: Raw document preservation under corrupted and non-standard attempt fields', () => {
  const corruptedAttempt = {
    id: 'att-corrupt-1',
    // Missing conceptId and unitId
    someArbitraryField: 'custom_value',
    nestedObject: { flag: true },
    numbers: [1, 2, 3],
  };

  resetStorage({
    schemaVersion: 2,
    learningAttempts: [corruptedAttempt],
  });

  const rawBefore = global.localStorage.getItem('mathfoundry_data');

  // normalizeAttempt handles missing identifiers without throwing
  const norm = storage.normalizeAttempt(corruptedAttempt);
  assert.ok(norm);
  assert.equal(norm.id, 'att-corrupt-1');
  assert.equal(norm.someArbitraryField, 'custom_value');
  assert.equal(norm.conceptId, null);
  assert.equal(norm.unitId, null);
  assert.equal(norm.unitPath, null);

  // Read attempts for arbitrary unit
  const attempts = storage.getAttemptsForUnit('math', 'arithmetic');
  assert.equal(attempts.length, 0);

  // Raw storage is untouched
  const rawAfter = global.localStorage.getItem('mathfoundry_data');
  assert.equal(rawAfter, rawBefore, 'Corrupted payloads must not alter raw storage upon read queries');
});

// ============================================================================
// CHALLENGE SUITE 6: Course Catalog Structure and Robustness
// ============================================================================

test('CHALLENGE 6.1: Course catalog exports required 4 courses with active/placeholder status fidelity', () => {
  const coursesList = getCourses();
  assert.equal(coursesList.length, 4, 'Catalog must contain exactly 4 courses');

  const courseIds = coursesList.map((c) => c.id);
  assert.deepEqual(courseIds.sort(), ['chemistry', 'geometry', 'math', 'physics'].sort());

  // Math course must be active with 12 units
  const mathCourse = getCourse('math');
  assert.ok(mathCourse);
  assert.equal(mathCourse.status, 'active');
  assert.equal(mathCourse.unitCount, 12);
  assert.equal(mathCourse.units.length, 12);
  assert.equal(isCourseActive('math'), true);

  // Placeholders
  for (const placeholderId of ['geometry', 'physics', 'chemistry']) {
    const course = getCourse(placeholderId);
    assert.ok(course, `Course ${placeholderId} must exist`);
    assert.equal(course.status, 'placeholder');
    assert.equal(course.units.length, 0);
    assert.equal(isCourseActive(placeholderId), false);
  }

  // Edge cases
  assert.equal(getCourse('unknown-astronomy'), null);
  assert.equal(getCourse(null), null);
  assert.equal(getCourse(''), null);
  assert.equal(isCourseActive('unknown'), false);
  assert.equal(isCourseActive(null), false);
});
