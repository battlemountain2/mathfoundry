/**
 * tests/m3-navigation-persistence-stress.test.js
 *
 * Adversarial Empirical Stress Test Suite for Milestone 3: LessonPlayer Navigation & Persistence
 *
 * Tests:
 * - SUITE 1: Extreme Navigation Sequences & Rapid State Transitions (1,000 clicks, underflow/overflow clamping)
 * - SUITE 2: Mid-Lesson Browser Reload & Progress Restoration Simulation (step indices, microCheckAnswers, rulebook)
 * - SUITE 3: Corrupt & Hostile localStorage States & Graceful Fallback (null, non-numeric, invalid JSON, NaN)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import * as storage from '../src/utils/storage.js';
import {
  getNavigationState,
  getNextStepIndex,
  getPreviousStepIndex,
  resolveInitialLessonState,
  getLessonPracticeUrl,
  createRulebookPayload,
  validateLessonSchema,
} from '../src/utils/lessonPlayer.js';
import { addSubtractFractionsLesson, getStep } from '../src/data/lessons/addition.js';

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
    global.localStorage.setItem(
      'mathfoundry_data',
      typeof initialData === 'string' ? initialData : JSON.stringify(initialData)
    );
  }
}

test.beforeEach(() => {
  resetStorage();
});

// ============================================================================
// SUITE 1: Extreme Navigation Sequences & Rapid State Machine Stress
// ============================================================================

test('NAV-STRESS 1.1: 1,000 rapid forward "next" clicks clamp at max step (overflow protection)', () => {
  const totalSteps = addSubtractFractionsLesson.totalSteps; // 8
  const maxIndex = totalSteps - 1; // 7
  const unitPath = 'math/add-subtract-fractions';

  let currentStepIndex = 0;
  let saveCount = 0;

  // Simulate 1,000 rapid forward clicks through LessonPlayer logic
  for (let click = 1; click <= 1000; click++) {
    if (currentStepIndex < totalSteps - 1) {
      currentStepIndex = getNextStepIndex(currentStepIndex, totalSteps);
      storage.saveLessonProgress(unitPath, { currentStepIndex });
      saveCount++;
    } else {
      // At final step, getNextStepIndex clamps to maxIndex
      currentStepIndex = getNextStepIndex(currentStepIndex, totalSteps);
    }

    assert.ok(
      currentStepIndex <= maxIndex,
      `Step index must never exceed max step ${maxIndex}. Found ${currentStepIndex} on click ${click}`
    );
    assert.ok(
      Number.isInteger(currentStepIndex),
      `Step index must remain an integer. Found ${currentStepIndex}`
    );
  }

  // Exactly reached the max step (7)
  assert.equal(currentStepIndex, maxIndex, 'Step index must clamp exactly at final step');
  assert.equal(saveCount, maxIndex, 'Should have persisted exactly 7 step transitions to reach step 7');

  // Verify stored progress reflects final step
  const stored = storage.getLessonProgress(unitPath);
  assert.equal(stored.currentStepIndex, maxIndex, 'Persisted index must match final step index');

  // Verify navigation state model at final step
  const nav = getNavigationState(currentStepIndex, totalSteps);
  assert.equal(nav.isFinalStep, true, 'Must flag isFinalStep');
  assert.equal(nav.canGoBack, true, 'Back button must remain enabled on final step');
  assert.equal(nav.progressPercent, 100, 'Progress must reach 100%');
  assert.equal(nav.progressRatio, 1.0, 'Progress ratio must be exactly 1.0');
});

test('NAV-STRESS 1.2: 1,000 rapid backward "prev" clicks clamp at step 0 (underflow protection)', () => {
  const totalSteps = 8;
  const unitPath = 'math/add-subtract-fractions';

  // Start at the final step
  let currentStepIndex = 7;
  storage.saveLessonProgress(unitPath, { currentStepIndex });

  let saveCount = 0;

  // Simulate 1,000 rapid backward clicks
  for (let click = 1; click <= 1000; click++) {
    if (currentStepIndex > 0) {
      currentStepIndex = getPreviousStepIndex(currentStepIndex);
      storage.saveLessonProgress(unitPath, { currentStepIndex });
      saveCount++;
    } else {
      // At first step, getPreviousStepIndex clamps to 0
      currentStepIndex = getPreviousStepIndex(currentStepIndex);
    }

    assert.ok(
      currentStepIndex >= 0,
      `Step index must never drop below 0. Found ${currentStepIndex} on click ${click}`
    );
    assert.ok(
      Number.isInteger(currentStepIndex),
      `Step index must remain an integer. Found ${currentStepIndex}`
    );
  }

  assert.equal(currentStepIndex, 0, 'Step index must clamp exactly at 0');
  assert.equal(saveCount, 7, 'Should have persisted exactly 7 step decrements');

  // Verify stored progress reflects step 0
  const stored = storage.getLessonProgress(unitPath);
  assert.equal(stored.currentStepIndex, 0, 'Persisted index must be 0');

  // Verify navigation state model at step 0
  const nav = getNavigationState(currentStepIndex, totalSteps);
  assert.equal(nav.isFirstStep, true, 'Must flag isFirstStep');
  assert.equal(nav.canGoBack, false, 'Back button must be disabled at step 0');
  assert.equal(nav.isFinalStep, false, 'Cannot be final step');
  assert.equal(nav.progressPercent, 13, '1/8 is ~13%');
  assert.equal(nav.progressRatio, 0.125, 'Progress ratio must be 1/8');
});

test('NAV-STRESS 1.3: 1,000 randomized & burst navigation transitions strictly preserve boundary invariants', () => {
  const totalSteps = 8;
  const unitPath = 'math/add-subtract-fractions';
  let currentStepIndex = 0;

  // Pseudo-random deterministic sequence of forward and backward clicks
  // Includes single steps, bursts of 50 forwards, bursts of 30 backwards
  const actions = [];
  for (let i = 0; i < 200; i++) actions.push('next');
  for (let i = 0; i < 150; i++) actions.push('prev');
  for (let i = 0; i < 300; i++) actions.push('next');
  for (let i = 0; i < 200; i++) actions.push('prev');
  for (let i = 0; i < 150; i++) actions.push(i % 2 === 0 ? 'next' : 'prev');

  assert.equal(actions.length, 1000);

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    if (action === 'next') {
      currentStepIndex = getNextStepIndex(currentStepIndex, totalSteps);
    } else {
      currentStepIndex = getPreviousStepIndex(currentStepIndex);
    }

    // Invariant 1: Strictly within [0, totalSteps - 1]
    assert.ok(
      currentStepIndex >= 0 && currentStepIndex < totalSteps,
      `Step ${currentStepIndex} out of bounds on transition ${i}`
    );

    // Invariant 2: Step definition exists and is valid
    const stepDef = getStep(currentStepIndex);
    assert.ok(stepDef, `Valid step definition must exist for index ${currentStepIndex}`);
    assert.ok(stepDef.type, `Step must have a type`);

    // Invariant 3: getNavigationState returns valid coherent model
    const nav = getNavigationState(currentStepIndex, totalSteps);
    assert.equal(nav.currentStepIndex, currentStepIndex);
    assert.equal(nav.canGoBack, currentStepIndex > 0);
    assert.equal(nav.isFirstStep, currentStepIndex === 0);
    assert.equal(nav.isFinalStep, currentStepIndex === totalSteps - 1);
    assert.ok(nav.progressRatio >= 0.125 && nav.progressRatio <= 1.0);
    assert.ok(nav.progressPercent >= 12 && nav.progressPercent <= 100);
  }
});

test('NAV-STRESS 1.4: Extreme out-of-bounds inputs to pure navigation helper functions do not throw', () => {
  const totalSteps = 8;

  // Overflow tests for getNextStepIndex
  assert.equal(getNextStepIndex(7, totalSteps), 7, 'Clamped at 7');
  assert.equal(getNextStepIndex(8, totalSteps), 7, 'Over max clamped to 7');
  assert.equal(getNextStepIndex(999999, totalSteps), 7, 'Extreme overflow clamped to 7');
  assert.equal(getNextStepIndex(Infinity, totalSteps), 1, 'Non-finite index handled safely');
  assert.equal(getNextStepIndex(NaN, totalSteps), 1, 'NaN index defaults to 0 and advances to 1');
  assert.equal(getNextStepIndex(-50, totalSteps), 1, 'Negative index clamped to 0 and advances to 1');

  // Underflow tests for getPreviousStepIndex
  assert.equal(getPreviousStepIndex(0), 0, 'Cannot decrement below 0');
  assert.equal(getPreviousStepIndex(-1), 0, 'Negative 1 clamped to 0');
  assert.equal(getPreviousStepIndex(-999999), 0, 'Extreme negative clamped to 0');
  assert.equal(getPreviousStepIndex(NaN), 0, 'NaN clamped to 0');
  assert.equal(getPreviousStepIndex(-Infinity), 0, '-Infinity clamped to 0');
  assert.equal(getPreviousStepIndex(Infinity), 0, 'Infinity clamped safely');

  // Extreme totalSteps parameters
  assert.equal(getNextStepIndex(0, 0), 0, 'totalSteps 0 clamped to at least 1 total');
  assert.equal(getNextStepIndex(0, -10), 0, 'Negative totalSteps clamped to 1 total');
  assert.equal(getNextStepIndex(0, NaN), 0, 'NaN totalSteps clamped to 1 total');

  // Navigation state with pathological inputs
  const navExtreme1 = getNavigationState(-100, 8);
  assert.equal(navExtreme1.currentStepIndex, 0);
  assert.equal(navExtreme1.isFirstStep, true);

  const navExtreme2 = getNavigationState(500, 8);
  assert.equal(navExtreme2.currentStepIndex, 7);
  assert.equal(navExtreme2.isFinalStep, true);

  const navExtreme3 = getNavigationState(NaN, 8);
  assert.equal(navExtreme3.currentStepIndex, 0);

  const navExtreme4 = getNavigationState(3, -5);
  assert.equal(navExtreme4.totalSteps, 1);
  assert.equal(navExtreme4.currentStepIndex, 0);
});

// ============================================================================
// SUITE 2: Mid-Lesson Browser Reload & Progress Restoration Simulation
// ============================================================================

test('RELOAD-STRESS 2.1: Full step-by-step walkthrough with reload simulation at every step', () => {
  const unitPath = 'math/add-subtract-fractions';
  const totalSteps = 8;

  // Step 0: Initial cold start
  let restored = storage.getLessonProgress(unitPath);
  assert.equal(restored.currentStepIndex, 0);
  assert.equal(restored.completed, false);
  assert.deepEqual(restored.microCheckAnswers, {});

  // Simulate learner advancing step by step and reloading at each step
  for (let step = 0; step < totalSteps; step++) {
    // 1. User is on step
    storage.saveLessonProgress(unitPath, { currentStepIndex: step });

    // 2. Browser reload simulation: read directly from fresh storage query
    const reloaded = storage.getLessonProgress(unitPath);
    const resolvedState = resolveInitialLessonState(reloaded, totalSteps);

    // 3. Verify exact restoration
    assert.equal(
      reloaded.currentStepIndex,
      step,
      `Step ${step} failed to persist in storage across reload`
    );
    assert.equal(
      resolvedState.currentStepIndex,
      step,
      `Step ${step} failed to restore in resolved initial state`
    );
    assert.equal(resolvedState.completed, false);
  }
});

test('RELOAD-STRESS 2.2: Micro-check answers survive mid-lesson reloads without data loss or overwrites', () => {
  const unitPath = 'math/add-subtract-fractions';
  const totalSteps = 8;

  // Step 0 -> Step 1 -> Step 2 -> Step 3 (First micro-check)
  storage.saveLessonProgress(unitPath, { currentStepIndex: 3 });
  
  // Submit first micro-check answer: step3 LCD is '12'
  const firstAnswer = '12';
  storage.saveLessonProgress(unitPath, {
    currentStepIndex: 3,
    microCheckAnswers: { step3: firstAnswer },
  });

  // RELOAD 1: Immediately after Step 3 answer
  let reload1 = storage.getLessonProgress(unitPath);
  let state1 = resolveInitialLessonState(reload1, totalSteps);
  assert.equal(reload1.currentStepIndex, 3);
  assert.equal(reload1.microCheckAnswers.step3, '12');
  assert.equal(state1.microCheckAnswers.step3, '12');

  // Advance to Step 4 (explain) without answering new micro-checks
  storage.saveLessonProgress(unitPath, { currentStepIndex: 4 });

  // RELOAD 2: At Step 4
  let reload2 = storage.getLessonProgress(unitPath);
  assert.equal(reload2.currentStepIndex, 4);
  assert.equal(reload2.microCheckAnswers.step3, '12', 'Step 3 answer preserved when advancing to step 4');

  // Advance to Step 5 (Second micro-check) and submit answer '5/12'
  const secondAnswer = '5/12';
  storage.saveLessonProgress(unitPath, {
    currentStepIndex: 5,
    microCheckAnswers: { step5: secondAnswer },
  });

  // RELOAD 3: Immediately after Step 5 answer
  let reload3 = storage.getLessonProgress(unitPath);
  let state3 = resolveInitialLessonState(reload3, totalSteps);
  assert.equal(reload3.currentStepIndex, 5);
  assert.equal(reload3.microCheckAnswers.step3, '12', 'Step 3 answer still intact');
  assert.equal(reload3.microCheckAnswers.step5, '5/12', 'Step 5 answer present');
  assert.deepEqual(state3.microCheckAnswers, { step3: '12', step5: '5/12' });

  // Advance to Step 6 (Key Rule)
  storage.saveLessonProgress(unitPath, { currentStepIndex: 6 });

  // RELOAD 4: At Step 6
  let reload4 = storage.getLessonProgress(unitPath);
  assert.equal(reload4.currentStepIndex, 6);
  assert.equal(reload4.microCheckAnswers.step3, '12');
  assert.equal(reload4.microCheckAnswers.step5, '5/12');
});

test('RELOAD-STRESS 2.3: Key-rule save at Step 6 persists in Rulebook across simulated reload', () => {
  const unitPath = 'math/add-subtract-fractions';
  const keyRuleStep = addSubtractFractionsLesson.steps.find((s) => s.type === 'key-rule');
  assert.ok(keyRuleStep, 'Key rule step must exist in lesson');

  // Advance to Step 6
  storage.saveLessonProgress(unitPath, { currentStepIndex: 6 });

  // Save rulebook entry
  const payload = createRulebookPayload(keyRuleStep);
  assert.ok(payload);
  const saveSuccess = storage.saveRulebookEntry(payload);
  assert.equal(saveSuccess, true);

  // RELOAD: Check rulebook in new simulated session
  const rulebook = storage.getRulebook();
  const found = rulebook.find((r) => r.id === 'rule:add-subtract-fractions');
  assert.ok(found, 'Rule must exist in rulebook after reload');
  assert.equal(found.category, 'fractions');
  assert.equal(found.title, 'Adding and Subtracting Fractions');

  // Lesson progress at Step 6 is also preserved
  const reloadedLesson = storage.getLessonProgress(unitPath);
  assert.equal(reloadedLesson.currentStepIndex, 6);
});

test('RELOAD-STRESS 2.4: Lesson completion persists completed flag and timestamp across reload without step regression', () => {
  const unitPath = 'math/add-subtract-fractions';

  // Advance to transition step (7) and complete
  storage.saveLessonProgress(unitPath, {
    currentStepIndex: 7,
    completed: true,
    completedAt: '2026-10-05T04:20:00.000Z',
  });

  // RELOAD
  const reloaded = storage.getLessonProgress(unitPath);
  assert.equal(reloaded.currentStepIndex, 7, 'Completed step index must remain at final step 7');
  assert.equal(reloaded.completed, true, 'completed flag must be true');
  assert.equal(reloaded.completedAt, '2026-10-05T04:20:00.000Z');

  const resolved = resolveInitialLessonState(reloaded, 8);
  assert.equal(resolved.currentStepIndex, 7);
  assert.equal(resolved.completed, true);
  assert.equal(resolved.completedAt, '2026-10-05T04:20:00.000Z');
});

test('RELOAD-STRESS 2.5: Path aliasing across reloads (short unit ID vs canonical unitPath)', () => {
  // Store using short unit ID
  storage.saveLessonProgress('add-subtract-fractions', {
    currentStepIndex: 4,
    microCheckAnswers: { step3: '12' },
  });

  // Query using full path 'math/add-subtract-fractions'
  const canonical = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(canonical.currentStepIndex, 4);
  assert.equal(canonical.microCheckAnswers.step3, '12');

  // Query using short path
  const short = storage.getLessonProgress('add-subtract-fractions');
  assert.equal(short.currentStepIndex, 4);
  assert.equal(short.microCheckAnswers.step3, '12');

  // Save using canonical path
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 6,
  });

  // Both aliases reflect the update
  assert.equal(storage.getLessonProgress('add-subtract-fractions').currentStepIndex, 6);
  assert.equal(storage.getLessonProgress('math/add-subtract-fractions').currentStepIndex, 6);
});

test('RELOAD-STRESS 2.6: Multiple lessons progress isolation across simulated reloads', () => {
  const lesson1 = 'math/add-subtract-fractions';
  const lesson2 = 'math/arithmetic';
  const lesson3 = 'math/equivalent-fractions';

  storage.saveLessonProgress(lesson1, { currentStepIndex: 5, microCheckAnswers: { step3: '12' } });
  storage.saveLessonProgress(lesson2, { currentStepIndex: 2, microCheckAnswers: { q1: '42' } });
  storage.saveLessonProgress(lesson3, { currentStepIndex: 7, completed: true });

  // Simulate reload
  const reload1 = storage.getLessonProgress(lesson1);
  const reload2 = storage.getLessonProgress(lesson2);
  const reload3 = storage.getLessonProgress(lesson3);

  assert.equal(reload1.currentStepIndex, 5);
  assert.equal(reload1.microCheckAnswers.step3, '12');
  assert.equal(reload1.completed, false);

  assert.equal(reload2.currentStepIndex, 2);
  assert.equal(reload2.microCheckAnswers.q1, '42');
  assert.equal(reload2.completed, false);

  assert.equal(reload3.currentStepIndex, 7);
  assert.equal(reload3.completed, true);
});

// ============================================================================
// SUITE 3: Corrupt & Hostile localStorage States & Graceful Fallback
// ============================================================================

test('CORRUPT-STRESS 3.1: Completely unparseable JSON strings in localStorage trigger graceful fallback without throwing', () => {
  const corruptedPayloads = [
    'INVALID_JSON_CORRUPTED{{{',
    '{"incomplete_json": ',
    'undefined',
    'NaN',
    '[{unclosed_bracket',
    '<<<xml>not json</xml>>>',
    ' \t\n ',
  ];

  for (const payload of corruptedPayloads) {
    global.localStorage.setItem('mathfoundry_data', payload);

    // Reading lesson progress must not crash
    let progress = null;
    assert.doesNotThrow(() => {
      progress = storage.getLessonProgress('math/add-subtract-fractions');
    }, `Failed on corrupted payload: ${payload}`);

    assert.ok(progress, 'Must return a fallback progress object');
    assert.equal(progress.currentStepIndex, 0, 'Default step index must be 0');
    assert.equal(progress.completed, false, 'Default completed must be false');
    assert.deepEqual(progress.microCheckAnswers, {}, 'Default microCheckAnswers must be empty object');

    // Resolving initial lesson state must also not crash
    let state = null;
    assert.doesNotThrow(() => {
      state = resolveInitialLessonState(progress, 8);
    });
    assert.equal(state.currentStepIndex, 0);
    assert.equal(state.completed, false);
    assert.deepEqual(state.microCheckAnswers, {});
  }
});

test('CORRUPT-STRESS 3.2: Non-record root values in mathfoundry_data handled safely', () => {
  const invalidRoots = [
    'null',
    '12345',
    '"just a string"',
    'true',
    'false',
    '[1, 2, 3]',
  ];

  for (const root of invalidRoots) {
    global.localStorage.setItem('mathfoundry_data', root);

    const progress = storage.getLessonProgress('math/add-subtract-fractions');
    assert.ok(progress);
    assert.equal(progress.currentStepIndex, 0);
    assert.equal(progress.completed, false);
    assert.deepEqual(progress.microCheckAnswers, {});
  }
});

test('CORRUPT-STRESS 3.3: Missing, null, or corrupted lessonProgress property in store handled with clean defaults', () => {
  const corruptedLessonProgressStates = [
    { lessonProgress: null },
    { lessonProgress: undefined },
    { lessonProgress: 'corrupted_string' },
    { lessonProgress: 12345 },
    { lessonProgress: [1, 2, 3] },
    { lessonProgress: true },
    { lessonProgress: { 'math/add-subtract-fractions': null } },
    { lessonProgress: { 'math/add-subtract-fractions': 'string' } },
    { lessonProgress: { 'math/add-subtract-fractions': 42 } },
    { lessonProgress: { 'math/add-subtract-fractions': [] } },
    { lessonProgress: { 'math/add-subtract-fractions': true } },
  ];

  for (let i = 0; i < corruptedLessonProgressStates.length; i++) {
    resetStorage(corruptedLessonProgressStates[i]);

    let progress = null;
    assert.doesNotThrow(() => {
      progress = storage.getLessonProgress('math/add-subtract-fractions');
    }, `Failed on state ${i}`);

    assert.equal(progress.currentStepIndex, 0, `State ${i}: currentStepIndex must default to 0`);
    assert.equal(progress.completed, false, `State ${i}: completed must default to false`);
    assert.deepEqual(progress.microCheckAnswers, {}, `State ${i}: microCheckAnswers must default to {}`);

    // Writing to damaged lessonProgress repairs the entry without crashing
    assert.doesNotThrow(() => {
      storage.saveLessonProgress('math/add-subtract-fractions', { currentStepIndex: 1 });
    }, `Save failed on state ${i}`);

    const updated = storage.getLessonProgress('math/add-subtract-fractions');
    assert.equal(updated.currentStepIndex, 1, `State ${i}: save should update step index to 1`);
  }
});

test('CORRUPT-STRESS 3.4: Hostile / Non-numeric currentStepIndex values in stored record fallback gracefully', () => {
  const hostileIndices = [
    { input: '3', expectedFallback: 0 }, // string
    { input: 'step-2', expectedFallback: 0 },
    { input: '', expectedFallback: 0 },
    { input: null, expectedFallback: 0 },
    { input: undefined, expectedFallback: 0 },
    { input: true, expectedFallback: 0 },
    { input: false, expectedFallback: 0 },
    { input: {}, expectedFallback: 0 },
    { input: [2], expectedFallback: 0 },
    { input: { index: 2 }, expectedFallback: 0 },
    { input: () => 3, expectedFallback: 0 },
  ];

  for (const { input, expectedFallback } of hostileIndices) {
    resetStorage({
      lessonProgress: {
        'math/add-subtract-fractions': {
          currentStepIndex: input,
          completed: false,
          microCheckAnswers: {},
        },
      },
    });

    const progress = storage.getLessonProgress('math/add-subtract-fractions');
    assert.equal(
      progress.currentStepIndex,
      expectedFallback,
      `Input ${JSON.stringify(input)} failed fallback in getLessonProgress`
    );

    const resolved = resolveInitialLessonState(progress, 8);
    assert.equal(
      resolved.currentStepIndex,
      expectedFallback,
      `Input ${JSON.stringify(input)} failed fallback in resolveInitialLessonState`
    );
  }
});

test('CORRUPT-STRESS 3.5: Out-of-bounds numeric currentStepIndex in storage clamps correctly upon load', () => {
  const boundaryTests = [
    { stored: -10, expectedResolved: 0 },
    { stored: -1, expectedResolved: 0 },
    { stored: 0, expectedResolved: 0 },
    { stored: 3, expectedResolved: 3 },
    { stored: 7, expectedResolved: 7 },
    { stored: 8, expectedResolved: 7 }, // max index for 8 steps is 7
    { stored: 999999, expectedResolved: 7 },
    { stored: 3.7, expectedResolved: 3 }, // float floored to 3
    { stored: 0.9, expectedResolved: 0 },
  ];

  for (const { stored, expectedResolved } of boundaryTests) {
    resetStorage({
      lessonProgress: {
        'math/add-subtract-fractions': {
          currentStepIndex: stored,
        },
      },
    });

    const progress = storage.getLessonProgress('math/add-subtract-fractions');
    const resolved = resolveInitialLessonState(progress, 8);
    assert.equal(
      resolved.currentStepIndex,
      expectedResolved,
      `Stored ${stored} should resolve to ${expectedResolved}`
    );
  }
});

test('CORRUPT-STRESS 3.6: Non-finite numeric edge cases (NaN, Infinity, -Infinity) in state resolution', () => {
  const totalSteps = 8;

  // 1. In getNavigationState: Number.isFinite() is used
  // Non-finite values (NaN, Infinity, -Infinity) safely fallback to 0
  const navNaN = getNavigationState(NaN, totalSteps);
  assert.equal(navNaN.currentStepIndex, 0, 'getNavigationState defaults NaN to 0');

  const navInf = getNavigationState(Infinity, totalSteps);
  assert.equal(navInf.currentStepIndex, 0, 'getNavigationState defaults Infinity to 0 due to Number.isFinite check');

  const navNegInf = getNavigationState(-Infinity, totalSteps);
  assert.equal(navNegInf.currentStepIndex, 0, 'getNavigationState defaults -Infinity to 0');

  // 2. In resolveInitialLessonState:
  // Infinity clamped via Math.min to maxIndex (7)
  const infinityState = resolveInitialLessonState({ currentStepIndex: Infinity }, totalSteps);
  assert.equal(infinityState.currentStepIndex, 7, 'Infinity clamped to max step 7');

  // -Infinity clamped via Math.max to 0
  const negInfinityState = resolveInitialLessonState({ currentStepIndex: -Infinity }, totalSteps);
  assert.equal(negInfinityState.currentStepIndex, 0, '-Infinity clamped to 0');

  // EMPIRICAL OBSERVATION / DEFECT SURFACE:
  // resolveInitialLessonState uses `typeof savedProgress.currentStepIndex === 'number'` without Number.isFinite()
  // As a result, Math.max(0, Math.min(7, NaN)) yields NaN instead of falling back to 0
  const nanState = resolveInitialLessonState({ currentStepIndex: NaN }, totalSteps);
  assert.ok(
    Number.isNaN(nanState.currentStepIndex),
    'Empirical confirmation: resolveInitialLessonState produces NaN when given in-memory NaN'
  );
});

test('CORRUPT-STRESS 3.7: Corrupted microCheckAnswers field does not crash state merge or reading', () => {
  const corruptedAnswerFields = [
    null,
    'not an object',
    12345,
    true,
    [1, 2, 3],
  ];

  for (const badAnswers of corruptedAnswerFields) {
    resetStorage({
      lessonProgress: {
        'math/add-subtract-fractions': {
          currentStepIndex: 3,
          microCheckAnswers: badAnswers,
        },
      },
    });

    const progress = storage.getLessonProgress('math/add-subtract-fractions');
    assert.ok(progress);
    assert.deepEqual(progress.microCheckAnswers, {}, 'Bad microCheckAnswers must fallback to {}');

    const resolved = resolveInitialLessonState(progress, 8);
    assert.deepEqual(resolved.microCheckAnswers, {});

    // Saving a new answer over the corrupted answers field must merge cleanly
    assert.doesNotThrow(() => {
      storage.saveLessonProgress('math/add-subtract-fractions', {
        microCheckAnswers: { step3: '12' },
      });
    });

    const repaired = storage.getLessonProgress('math/add-subtract-fractions');
    assert.equal(repaired.microCheckAnswers.step3, '12');
  }
});

test('CORRUPT-STRESS 3.8: Simulated LessonPlayer Component Lifecycle with Corrupted Storage', () => {
  // Simulate LessonPlayer component mounting and user interaction across 5 pathological scenarios
  const totalSteps = addSubtractFractionsLesson.totalSteps; // 8

  function simulateLessonPlayerMount(storedPayload) {
    if (storedPayload !== null) {
      global.localStorage.setItem('mathfoundry_data', storedPayload);
    } else {
      resetStorage();
    }

    // 1. Component mount initializers (exact copy of LessonPlayer.jsx lines 564-578)
    const activeUnitPath = 'math/add-subtract-fractions';
    const saved = storage.getLessonProgress(activeUnitPath);
    
    // In LessonPlayer.jsx:
    let stepIndex = 0;
    if (saved && typeof saved.currentStepIndex === 'number' && Number.isFinite(saved.currentStepIndex)) {
      stepIndex = Math.max(0, Math.min(totalSteps - 1, Math.floor(saved.currentStepIndex)));
    }

    let answers = saved?.microCheckAnswers && typeof saved.microCheckAnswers === 'object'
      ? { ...saved.microCheckAnswers }
      : {};

    // 2. Computed navigation properties (LessonPlayer.jsx lines 603-608)
    const currentStep = addSubtractFractionsLesson.steps[stepIndex] || addSubtractFractionsLesson.steps[0] || {};
    const isFirstStep = stepIndex === 0;
    const isFinalStep = stepIndex === totalSteps - 1;
    const progressRatio = (stepIndex + 1) / totalSteps;
    const progressPercent = Math.round(progressRatio * 100);

    return {
      stepIndex,
      answers,
      currentStep,
      isFirstStep,
      isFinalStep,
      progressPercent,
      progressRatio,
    };
  }

  // Scenario A: Fresh blank storage
  const scA = simulateLessonPlayerMount(null);
  assert.equal(scA.stepIndex, 0);
  assert.equal(scA.isFirstStep, true);
  assert.equal(scA.isFinalStep, false);
  assert.equal(scA.progressPercent, 13);
  assert.ok(scA.currentStep.id === 'step-0');

  // Scenario B: Corrupted JSON string
  const scB = simulateLessonPlayerMount('MALFORMED_JSON_{{{');
  assert.equal(scB.stepIndex, 0);
  assert.equal(scB.isFirstStep, true);
  assert.equal(scB.progressPercent, 13);

  // Scenario C: Non-numeric currentStepIndex: "five"
  const scC = simulateLessonPlayerMount(JSON.stringify({
    lessonProgress: { 'math/add-subtract-fractions': { currentStepIndex: 'five' } },
  }));
  assert.equal(scC.stepIndex, 0);
  assert.equal(scC.isFirstStep, true);

  // Scenario D: Extreme overflow index: 99999
  const scD = simulateLessonPlayerMount(JSON.stringify({
    lessonProgress: { 'math/add-subtract-fractions': { currentStepIndex: 99999 } },
  }));
  assert.equal(scD.stepIndex, 7);
  assert.equal(scD.isFinalStep, true);
  assert.equal(scD.progressPercent, 100);
  assert.equal(scD.currentStep.id === 'step-7', true);

  // Scenario E: Extreme negative index: -99999
  const scE = simulateLessonPlayerMount(JSON.stringify({
    lessonProgress: { 'math/add-subtract-fractions': { currentStepIndex: -99999 } },
  }));
  assert.equal(scE.stepIndex, 0);
  assert.equal(scE.isFirstStep, true);
  assert.equal(scE.progressPercent, 13);
});
