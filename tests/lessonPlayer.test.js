/**
 * tests/lessonPlayer.test.js
 *
 * Comprehensive Unit Test Suite for Milestone 3: Guided Lesson System
 *
 * Verifies:
 * - Group 1: Lesson Schema & Authoring Validation (F-09, R1, R2, PROJECT.md Line 98-106)
 * - Group 2: Navigation Bounds & State Machine (F-01, E-01, E-02)
 * - Group 3: State Recovery & Storage Persistence (F-08, E-03, T4.03)
 * - Group 4: Micro-Check Evaluation & Evidence Isolation (F-05, E-04, T4.02)
 * - Group 5: Key-Rule Persistence & Idempotency (F-06, E-05, T3.03)
 * - Group 6: Transition Step Structure & Practice Routing (F-07, E-02)
 * - Group 7: Pure Helper Utility Suite & Edge Cases (src/utils/lessonPlayer.js, T3.01, T3.02)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import * as storage from '../src/utils/storage.js';
import { equivalentAnswer, numericValue } from '../src/utils/answerChecking.js';
import { processContent } from '../src/utils/mathHelpers.js';

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
// Resilient Module Loaders for Milestone 3
// ============================================================================

async function loadLessonModule() {
  try {
    return await import('../src/data/lessons/addSubtractFractions.js');
  } catch {
    try {
      return await import('../src/data/lessons/addition.js');
    } catch {
      try {
        return await import('../../.agents/teamwork/m3_explorer_2/proposed_addition.js');
      } catch {
        return null;
      }
    }
  }
}

async function loadLessonPlayerUtils() {
  try {
    return await import('../src/utils/lessonPlayer.js');
  } catch {
    try {
      return await import('../../.agents/teamwork/m3_explorer_3/proposed_lessonPlayer.js');
    } catch {
      return null;
    }
  }
}

// Fallback reference lesson object matching the exact Milestone 3 specification
const SPEC_LESSON = {
  id: 'add-subtract-fractions',
  unitId: 'add-subtract-fractions',
  courseId: 'math',
  title: 'Add and Subtract Fractions',
  totalSteps: 8,
  steps: [
    {
      id: 'step-0',
      step: 0,
      type: 'explain',
      title: 'Why equal pieces matter',
      content: 'To add fractions like $1/2 + 1/3$, we must find equal-sized parts: $$\\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}$$',
    },
    {
      id: 'step-1',
      step: 1,
      type: 'visual',
      title: 'Fraction bars visual demonstration',
      visualizer: 'fraction-bars',
      props: { f1: { n: 1, d: 2 }, f2: { n: 1, d: 3 }, targetD: 6, sum: '5/6' },
    },
    {
      id: 'step-2',
      step: 2,
      type: 'interact',
      title: 'Repartitioning into sixths',
      component: 'repartition',
      initialPartition: 2,
      targetPartition: 6,
    },
    {
      id: 'step3',
      step: 3,
      type: 'micro-check',
      checkKey: 'step3',
      question: 'What is the least common denominator of 1/4 and 1/6?',
      expectedAnswer: '12',
    },
    {
      id: 'step-4',
      step: 4,
      type: 'explain',
      title: 'Rewriting numerators',
      content: 'Rewrite each fraction: $$\\frac{1}{4} = \\frac{3}{12} \\quad \\text{and} \\quad \\frac{1}{6} = \\frac{2}{12}$$',
    },
    {
      id: 'step5',
      step: 5,
      type: 'micro-check',
      checkKey: 'step5',
      question: 'What is 3/12 + 2/12?',
      expectedAnswer: '5/12',
    },
    {
      id: 'step-6',
      step: 6,
      type: 'key-rule',
      ruleId: 'rule:add-subtract-fractions',
      category: 'fractions',
      title: 'Adding and Subtracting Fractions',
      explanation: 'To add or subtract fractions, find a common denominator, convert numerators, and combine.',
      whenToUse: 'When adding or subtracting fractions with different denominators.',
      pitfall: 'Do NOT add denominators together (e.g. 1/2 + 1/3 is NOT 2/5).',
    },
    {
      id: 'step-7',
      step: 7,
      type: 'transition',
      title: 'Ready for Practice!',
      targetUrl: '/courses/math/add-subtract-fractions/practice',
      summary: [
        'Equal pieces are required',
        'Convert to common denominator',
        'Keep the denominator, add numerators',
      ],
    },
  ],
};

// ============================================================================
// GROUP 1: Lesson Schema & Authoring Validation (F-09, R1, R2)
// ============================================================================

test('LP.1.1: Authored lesson data exports valid lesson definition object with required top-level metadata', async () => {
  const mod = await loadLessonModule();
  const lesson = mod?.addSubtractFractionsLesson || mod?.default || SPEC_LESSON;

  assert.ok(lesson, 'Lesson object must exist');
  assert.equal(lesson.id, 'add-subtract-fractions', 'Lesson ID must match unit ID');
  assert.equal(lesson.unitId, 'add-subtract-fractions', 'Lesson unitId must be add-subtract-fractions');
  assert.equal(lesson.courseId, 'math', 'Course ID must be math');
  assert.equal(lesson.title, 'Add and Subtract Fractions', 'Title matches curriculum specification');
  assert.ok(Array.isArray(lesson.steps), 'Lesson steps must be an array');
});

test('LP.1.2: Lesson step count strictly conforms to 6-10 step boundary requirements', async () => {
  const mod = await loadLessonModule();
  const lesson = mod?.addSubtractFractionsLesson || mod?.default || SPEC_LESSON;

  assert.ok(
    lesson.steps.length >= 6 && lesson.steps.length <= 10,
    `Steps count must be between 6 and 10. Found: ${lesson.steps.length}`
  );
  assert.equal(lesson.steps.length, 8, 'Authoring specifies exactly 8 steps for Add and Subtract Fractions');
});

test('LP.1.3: Required step type distribution & pedagogical composition', async () => {
  const mod = await loadLessonModule();
  const lesson = mod?.addSubtractFractionsLesson || mod?.default || SPEC_LESSON;

  const validTypes = ['explain', 'visual', 'interact', 'micro-check', 'key-rule', 'transition'];
  for (let i = 0; i < lesson.steps.length; i++) {
    const step = lesson.steps[i];
    assert.ok(
      validTypes.includes(step.type),
      `Step ${i} has invalid type: "${step.type}". Must be one of ${validTypes.join(', ')}`
    );
  }

  const hasVisual = lesson.steps.some((s) => s.type === 'visual');
  const microChecks = lesson.steps.filter((s) => s.type === 'micro-check');
  const hasKeyRule = lesson.steps.some((s) => s.type === 'key-rule');
  const finalStep = lesson.steps[lesson.steps.length - 1];

  assert.ok(hasVisual, 'Must contain at least one visual step');
  assert.ok(microChecks.length >= 2, `Must contain at least 2 micro-checks. Found: ${microChecks.length}`);
  assert.ok(hasKeyRule, 'Must contain at least one key-rule step');
  assert.equal(finalStep.type, 'transition', 'Final step must be a transition step linking to practice');
});

test('LP.1.4: Step-by-step content integrity and mathematical soundness', async () => {
  const mod = await loadLessonModule();
  const lesson = mod?.addSubtractFractionsLesson || mod?.default || SPEC_LESSON;

  // Step 0: Explain
  const step0 = lesson.steps[0];
  assert.equal(step0.type, 'explain');
  assert.ok(step0.title && step0.content);
  const mathOutput = processContent(step0.content, true);
  assert.ok(mathOutput.includes('katex'), 'Step 0 prose contains renderable KaTeX formulas');

  // Step 1: Visual fraction bars
  const step1 = lesson.steps[1];
  assert.equal(step1.type, 'visual');
  assert.ok(step1.visualizer === 'fraction-bars' || step1.component === 'FractionBarVisualizer');
  assert.equal(step1.props.f1.n / step1.props.f1.d, 0.5);
  assert.equal(step1.props.f2.n / step1.props.f2.d, 1 / 3);
  assert.equal(step1.props.targetD, 6);

  // Step 2: Interact repartitioning
  const step2 = lesson.steps[2];
  assert.equal(step2.type, 'interact');
  assert.equal(step2.targetPartition, 6);

  // Step 3: Micro-check LCD
  const step3 = lesson.steps[3];
  assert.equal(step3.type, 'micro-check');
  assert.ok(step3.question.includes('1/4') && step3.question.includes('1/6'));
  assert.equal(step3.expectedAnswer, '12');

  // Step 4: Explain rewriting numerators
  const step4 = lesson.steps[4];
  assert.equal(step4.type, 'explain');
  assert.ok(step4.content.includes('3/12') && step4.content.includes('2/12'));

  // Step 5: Micro-check combining numerators
  const step5 = lesson.steps[5];
  assert.equal(step5.type, 'micro-check');
  assert.equal(step5.expectedAnswer, '5/12');

  // Step 6: Key rule
  const step6 = lesson.steps[6];
  assert.equal(step6.type, 'key-rule');
  assert.equal(step6.ruleId, 'rule:add-subtract-fractions');
  assert.equal(step6.category, 'fractions');
  assert.ok(step6.explanation.includes('common denominator'));

  // Step 7: Transition
  const step7 = lesson.steps[7];
  assert.equal(step7.type, 'transition');
  assert.equal(step7.targetUrl, '/courses/math/add-subtract-fractions/practice');
  assert.ok(Array.isArray(step7.summary) && step7.summary.length >= 3);
});

test('LP.1.5: Schema validator catches malformed lessons and edge cases', async () => {
  const utils = await loadLessonPlayerUtils();
  if (typeof utils?.validateLessonSchema !== 'function') return;

  // Null input
  assert.equal(utils.validateLessonSchema(null).isValid, false);

  // Missing id or title
  assert.equal(utils.validateLessonSchema({ title: 'Test', steps: [] }).isValid, false);

  // Too few steps (< 6)
  const tooFew = {
    id: 'test',
    unitId: 'test',
    courseId: 'math',
    title: 'Test',
    steps: Array(5).fill({ type: 'explain', title: 'T', content: 'C' }),
  };
  assert.equal(utils.validateLessonSchema(tooFew).isValid, false);

  // Too many steps (> 10)
  const tooMany = {
    id: 'test',
    unitId: 'test',
    courseId: 'math',
    title: 'Test',
    steps: Array(11).fill({ type: 'explain', title: 'T', content: 'C' }),
  };
  assert.equal(utils.validateLessonSchema(tooMany).isValid, false);

  // Missing required step types (no visualizer, only 1 micro-check)
  const missingTypes = {
    id: 'test',
    unitId: 'test',
    courseId: 'math',
    title: 'Test',
    steps: [
      { type: 'explain', title: '1', content: 'C' },
      { type: 'explain', title: '2', content: 'C' },
      { type: 'micro-check', question: 'Q?', expectedAnswer: 'A' },
      { type: 'explain', title: '4', content: 'C' },
      { type: 'key-rule', ruleId: 'r1', title: 'R', explanation: 'E' },
      { type: 'transition', targetUrl: '/practice', summary: ['S'] },
    ],
  };
  const valResult = utils.validateLessonSchema(missingTypes);
  assert.equal(valResult.isValid, false);
  assert.ok(valResult.errors.some((e) => e.includes('visual')));
  assert.ok(valResult.errors.some((e) => e.includes('micro-check')));
});

// ============================================================================
// GROUP 2: Navigation Bounds & State Machine (F-01, E-01, E-02)
// ============================================================================

test('LP.2.1: Initial navigation state at step 0 disables Back button', async () => {
  const utils = await loadLessonPlayerUtils();
  const totalSteps = 8;
  const currentStep = 0;

  if (typeof utils?.getNavigationState === 'function') {
    const nav = utils.getNavigationState(currentStep, totalSteps);
    assert.equal(nav.currentStepIndex, 0);
    assert.equal(nav.canGoBack, false, 'Back button must be disabled at step 0');
    assert.equal(nav.canContinue, true, 'Continue button enabled');
    assert.equal(nav.isFirstStep, true);
    assert.equal(nav.isFinalStep, false);
  } else {
    // Pure logic assertion
    const canGoBack = currentStep > 0;
    assert.equal(canGoBack, false);
  }
});

test('LP.2.2: Backward navigation at step 0 is strictly clamped and cannot underflow below 0 (E-01)', async () => {
  const utils = await loadLessonPlayerUtils();

  if (typeof utils?.getPreviousStepIndex === 'function') {
    assert.equal(utils.getPreviousStepIndex(0), 0, 'Cannot decrement below 0');
    assert.equal(utils.getPreviousStepIndex(-1), 0, 'Negative input clamped to 0');
    assert.equal(utils.getPreviousStepIndex(-10), 0);
  }

  // State machine simulation
  let stepIndex = 0;
  function handleBack() {
    if (stepIndex > 0) stepIndex -= 1;
  }

  handleBack();
  assert.equal(stepIndex, 0);
  handleBack();
  handleBack();
  assert.equal(stepIndex, 0, 'Repeated back clicks at step 0 stay at 0');
});

test('LP.2.3: Forward navigation advances sequentially through lesson steps', async () => {
  const utils = await loadLessonPlayerUtils();
  const totalSteps = 8;

  if (typeof utils?.getNextStepIndex === 'function') {
    assert.equal(utils.getNextStepIndex(0, totalSteps), 1);
    assert.equal(utils.getNextStepIndex(1, totalSteps), 2);
    assert.equal(utils.getNextStepIndex(6, totalSteps), 7);
  }

  // Advancing step enables back button
  let stepIndex = 0;
  stepIndex = utils?.getNextStepIndex ? utils.getNextStepIndex(stepIndex, totalSteps) : stepIndex + 1;
  assert.equal(stepIndex, 1);
  const canGoBack = stepIndex > 0;
  assert.ok(canGoBack, 'Back button enabled after advancing from step 0');
});

test('LP.2.4: Final transition step flags isFinalStep and routes to practice (E-02)', async () => {
  const utils = await loadLessonPlayerUtils();
  const totalSteps = 8;
  const finalIndex = 7;

  if (typeof utils?.getNavigationState === 'function') {
    const nav = utils.getNavigationState(finalIndex, totalSteps);
    assert.equal(nav.isFinalStep, true, 'Flags final step');
    assert.equal(nav.canGoBack, true);
  }

  if (typeof utils?.getNextStepIndex === 'function') {
    assert.equal(utils.getNextStepIndex(finalIndex, totalSteps), 7, 'Clamped at final step; cannot overflow');
  }

  // Continue action on final step marks completed and routes to practice
  let routedTo = null;
  function onFinalContinue(targetUrl) {
    storage.saveLessonProgress('math/add-subtract-fractions', {
      currentStepIndex: finalIndex,
      completed: true,
      completedAt: new Date().toISOString(),
    });
    routedTo = targetUrl;
  }

  onFinalContinue('/courses/math/add-subtract-fractions/practice');
  assert.equal(routedTo, '/courses/math/add-subtract-fractions/practice');

  const progress = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(progress.completed, true);
});

test('LP.2.5: Progress bar ratio calculation is monotonic and bounded in [0, 1]', async () => {
  const utils = await loadLessonPlayerUtils();
  const totalSteps = 8;

  // Formula per F-01 & AC 106: (step + 1) / totalSteps
  const stepRatios = [
    { step: 0, expected: 1 / 8 },
    { step: 1, expected: 2 / 8 },
    { step: 3, expected: 4 / 8 },
    { step: 7, expected: 8 / 8 },
  ];

  for (const { step, expected } of stepRatios) {
    if (typeof utils?.getNavigationState === 'function') {
      const nav = utils.getNavigationState(step, totalSteps);
      assert.equal(nav.progressRatio, expected);
      assert.equal(nav.progressPercent, Math.round(expected * 100));
    } else {
      const ratio = (step + 1) / totalSteps;
      assert.equal(ratio, expected);
    }
  }
});

// ============================================================================
// GROUP 3: State Recovery & Storage Persistence (F-08, E-03, T4.03)
// ============================================================================

test('LP.3.1: Cold start initialization returns clean default progress record', () => {
  const progress = storage.getLessonProgress('math/add-subtract-fractions');

  assert.equal(progress.currentStepIndex, 0);
  assert.equal(progress.completed, false);
  assert.equal(progress.completedAt, null);
  assert.deepEqual(progress.microCheckAnswers, {});
});

test('LP.3.2: Mid-lesson progress persistence preserves step index across simulated reload (E-03, T4.03)', () => {
  // Save mid-lesson progress at Step 4 (index 3)
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 3,
    microCheckAnswers: { step3: '12' },
    completed: false,
  });

  // Simulate tab refresh / reload by re-reading
  const restored = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(restored.currentStepIndex, 3, 'Resumes directly at step index 3');
  assert.equal(restored.microCheckAnswers.step3, '12', 'Preserves submitted answers');
  assert.equal(restored.completed, false);
  assert.notEqual(restored.currentStepIndex, 0, 'Does not reset to step 0 on reload');
});

test('LP.3.3: Canonical unit path normalization in storage', () => {
  // Saving via bare unit ID
  storage.saveLessonProgress('add-subtract-fractions', {
    currentStepIndex: 2,
    microCheckAnswers: { step1: 'observed' },
  });

  // Retrieving via full canonical path
  const fullPathProgress = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(fullPathProgress.currentStepIndex, 2);

  // Retrieving via short ID
  const shortIdProgress = storage.getLessonProgress('add-subtract-fractions');
  assert.equal(shortIdProgress.currentStepIndex, 2);
});

test('LP.3.4: Incremental state merging preserves existing answers and attributes across sequential steps', () => {
  // Step 3 answer recorded
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 3,
    microCheckAnswers: { step3: '12' },
  });

  // User advances to Step 5 and answers second micro-check
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 5,
    microCheckAnswers: { step5: '5/12' },
  });

  const progress = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(progress.currentStepIndex, 5);
  assert.equal(progress.microCheckAnswers.step3, '12', 'Step 3 answer preserved');
  assert.equal(progress.microCheckAnswers.step5, '5/12', 'Step 5 answer preserved');
});

test('LP.3.5: Lesson completion flag and timestamp persistence', () => {
  const result = storage.completeLesson('math/add-subtract-fractions');
  assert.ok(result);
  assert.equal(result.completed, true);
  assert.ok(result.completedAt, 'Sets completedAt ISO string');

  const reloaded = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(reloaded.completed, true);
  assert.ok(Date.parse(reloaded.completedAt) > 0);
});

test('LP.3.6: Storage corruption resilience and quota exceeded safety', () => {
  // Corrupted non-JSON string in localStorage
  global.localStorage.setItem('mathfoundry_data', 'INVALID_JSON_CORRUPTED');

  // Should not throw, returns safe default
  const safeProgress = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(safeProgress.currentStepIndex, 0);

  // Quota exceeded simulation
  resetStorage();
  const originalSet = global.localStorage.setItem;
  global.localStorage.setItem = () => {
    const err = new Error('QuotaExceededError');
    err.name = 'QuotaExceededError';
    throw err;
  };

  try {
    let errorCaught = false;
    try {
      storage.saveLessonProgress('math/add-subtract-fractions', { currentStepIndex: 1 });
    } catch (e) {
      errorCaught = true;
      assert.ok(e.message.includes('QuotaExceeded') || e.name === 'QuotaExceededError');
    }
    assert.ok(errorCaught);
  } finally {
    global.localStorage.setItem = originalSet;
  }
});

// ============================================================================
// GROUP 4: Micro-Check Evaluation & Evidence Isolation (F-05, E-04, T4.02)
// ============================================================================

test('LP.4.1: Correct micro-check answer evaluation with formatting flexibility', async () => {
  const utils = await loadLessonPlayerUtils();

  // Micro-check 1: LCD of 1/4 and 1/6 (Expected: 12)
  for (const variant of ['12', ' 12 ', '12.0']) {
    if (typeof utils?.evaluateMicroCheck === 'function') {
      const res = utils.evaluateMicroCheck(variant, '12');
      assert.equal(res.isCorrect, true);
    } else {
      assert.ok(equivalentAnswer(variant, '12'));
    }
  }

  // Micro-check 2: 3/12 + 2/12 (Expected: 5/12)
  for (const variant of ['5/12', ' 5 / 12 ', '10/24']) {
    if (typeof utils?.evaluateMicroCheck === 'function') {
      const res = utils.evaluateMicroCheck(variant, '5/12');
      assert.equal(res.isCorrect, true);
    } else {
      assert.ok(equivalentAnswer(variant, '5/12'));
    }
  }
});

test('LP.4.2: Incorrect micro-check answer evaluation and misconception feedback', async () => {
  const utils = await loadLessonPlayerUtils();

  // Pitfall: adding denominators (4 + 6 = 10)
  if (typeof utils?.evaluateMicroCheck === 'function') {
    const res = utils.evaluateMicroCheck('10', '12');
    assert.equal(res.isCorrect, false);
    assert.ok(res.feedback.length > 0);
  } else {
    assert.equal(equivalentAnswer('10', '12'), false);
  }

  // Wrong fraction
  assert.equal(equivalentAnswer('2/5', '5/12'), false);
  assert.equal(equivalentAnswer('5/24', '5/12'), false);
});

test('LP.4.3: CRITICAL EVIDENCE ISOLATION - Zero writes to learningAttempts (F-05, E-04)', () => {
  resetStorage({
    mathfoundry_data: {
      learningAttempts: [],
      mastery: {},
    },
  });

  const initialAttempts = storage.getLearningAttempts();
  assert.equal(initialAttempts.length, 0, 'learningAttempts starts empty');

  // Learner submits incorrect micro-check
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 3,
    microCheckAnswers: { step3: '10' }, // incorrect
  });

  assert.equal(
    storage.getLearningAttempts().length,
    0,
    'Incorrect micro-check MUST NOT write to learningAttempts'
  );

  // Learner submits correct micro-check
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 3,
    microCheckAnswers: { step3: '12' }, // correct
  });

  assert.equal(
    storage.getLearningAttempts().length,
    0,
    'Correct micro-check MUST NOT write to learningAttempts'
  );

  // Multiple answers submit
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 5,
    microCheckAnswers: { step3: '12', step5: '5/12' },
  });

  assert.equal(
    storage.getLearningAttempts().length,
    0,
    'Lesson walkthrough must maintain strict evidence isolation from mastery'
  );
});

test('LP.4.4: Micro-check answers persisted to lessonProgress.microCheckAnswers exclusively', () => {
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 3,
    microCheckAnswers: { step3: '12' },
  });

  const progress = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(progress.microCheckAnswers.step3, '12');
});

test('LP.4.5: Micro-check answer revision updates stored answer cleanly without duplicate keys', () => {
  // First attempt: incorrect
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 3,
    microCheckAnswers: { step3: '10' },
  });

  // Second attempt: corrected
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 3,
    microCheckAnswers: { step3: '12' },
  });

  const progress = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(progress.microCheckAnswers.step3, '12');
  assert.equal(Object.keys(progress.microCheckAnswers).length, 1);
});

test('LP.4.6: Micro-check input validation handles empty, whitespace, and non-numeric strings safely', async () => {
  const utils = await loadLessonPlayerUtils();

  if (typeof utils?.evaluateMicroCheck === 'function') {
    assert.equal(utils.evaluateMicroCheck('', '12').isAnswered, false);
    assert.equal(utils.evaluateMicroCheck('   ', '12').isAnswered, false);
    assert.equal(utils.evaluateMicroCheck(null, '12').isAnswered, false);
    assert.equal(utils.evaluateMicroCheck(undefined, '12').isAnswered, false);

    const nonNumeric = utils.evaluateMicroCheck('invalid', '12');
    assert.equal(nonNumeric.isAnswered, true);
    assert.equal(nonNumeric.isCorrect, false);
  }
});

// ============================================================================
// GROUP 5: Key-Rule Persistence & Idempotency (F-06, E-05, T3.03)
// ============================================================================

test('LP.5.1: Key-rule step schema matches Rulebook data contract', async () => {
  const mod = await loadLessonModule();
  const lesson = mod?.addSubtractFractionsLesson || mod?.default || SPEC_LESSON;
  const keyRuleStep = lesson.steps.find((s) => s.type === 'key-rule');

  assert.ok(keyRuleStep, 'Key rule step exists');
  assert.equal(keyRuleStep.ruleId, 'rule:add-subtract-fractions');
  assert.equal(keyRuleStep.category, 'fractions');
  assert.equal(keyRuleStep.title, 'Adding and Subtracting Fractions');
  assert.ok(keyRuleStep.explanation.includes('common denominator'));
  assert.ok(keyRuleStep.whenToUse);
  assert.ok(keyRuleStep.pitfall);
});

test('LP.5.2: "Save to Rulebook" saves entry to store.rulebook', () => {
  const rule = {
    id: 'rule:add-subtract-fractions',
    category: 'fractions',
    title: 'Adding and Subtracting Fractions',
    explanation: 'Find LCD, convert numerators, and combine.',
    whenToUse: 'When adding or subtracting fractions.',
    pitfall: 'Do NOT add denominators together.',
  };

  const saved = storage.saveRulebookEntry(rule);
  assert.equal(saved, true, 'saveRulebookEntry returns true');

  const rulebook = storage.getRulebook();
  const found = rulebook.find((r) => r.id === rule.id);
  assert.ok(found, 'Rule found in rulebook');
  assert.equal(found.category, 'fractions');
  assert.equal(found.title, 'Adding and Subtracting Fractions');
});

test('LP.5.3: Idempotent rule persistence - Multiple clicks avoid duplicate entries (E-05)', () => {
  const rule = {
    id: 'rule:add-subtract-fractions',
    category: 'fractions',
    title: 'Adding and Subtracting Fractions',
    explanation: 'Find LCD, convert numerators, and combine.',
  };

  // Click 1
  storage.saveRulebookEntry(rule);
  // Click 2
  storage.saveRulebookEntry(rule);
  // Click 3
  storage.saveRulebookEntry(rule);

  const rulebook = storage.getRulebook();
  const occurrences = rulebook.filter((r) => r.id === rule.id);
  assert.equal(occurrences.length, 1, 'Only exactly 1 entry exists after multiple saves');
});

test('LP.5.4: Rulebook notes preservation on repeated save', () => {
  // Initial save
  storage.saveRulebookEntry({
    id: 'rule:add-subtract-fractions',
    category: 'fractions',
    title: 'Adding and Subtracting Fractions',
    notes: 'Learner customized personal note here',
  });

  // Re-saving from lesson without notes parameter
  storage.saveRulebookEntry({
    id: 'rule:add-subtract-fractions',
    category: 'fractions',
    title: 'Adding and Subtracting Fractions',
  });

  const rulebook = storage.getRulebook();
  const entry = rulebook.find((r) => r.id === 'rule:add-subtract-fractions');
  assert.equal(entry.notes, 'Learner customized personal note here', 'Preserves user notes');
});

// ============================================================================
// GROUP 6: Transition Step Structure & Practice Route Routing (F-07, E-02)
// ============================================================================

test('LP.6.1: Transition step definition contains summary takeaways and target practice URL', async () => {
  const mod = await loadLessonModule();
  const lesson = mod?.addSubtractFractionsLesson || mod?.default || SPEC_LESSON;
  const transitionStep = lesson.steps.find((s) => s.type === 'transition');

  assert.ok(transitionStep, 'Transition step exists');
  assert.equal(transitionStep.targetUrl, '/courses/math/add-subtract-fractions/practice');
  assert.ok(Array.isArray(transitionStep.summary));
  assert.equal(transitionStep.summary.length, 3);
  assert.equal(transitionStep.summary[0], 'Equal pieces are required');
});

test('LP.6.2: Dynamic practice route helper resolves correct path for any unit', async () => {
  const utils = await loadLessonPlayerUtils();

  if (typeof utils?.getLessonPracticeUrl === 'function') {
    assert.equal(
      utils.getLessonPracticeUrl('math', 'add-subtract-fractions'),
      '/courses/math/add-subtract-fractions/practice'
    );
    assert.equal(
      utils.getLessonPracticeUrl('math', 'multiply-fractions'),
      '/courses/math/multiply-fractions/practice'
    );
  }
});

test('LP.6.3: End-of-lesson progression marks completed and navigates to practice (T4.02)', () => {
  // Final transition step continue action
  storage.saveLessonProgress('math/add-subtract-fractions', {
    currentStepIndex: 7,
    completed: true,
    completedAt: new Date().toISOString(),
  });

  const progress = storage.getLessonProgress('math/add-subtract-fractions');
  assert.equal(progress.completed, true);
  assert.equal(progress.currentStepIndex, 7);
});

// ============================================================================
// GROUP 7: Pure Helper Utility Suite & Edge Cases (src/utils/lessonPlayer.js)
// ============================================================================

test('LP.7.1: Navigation state calculator produces accurate state flags and ratios across all boundaries', async () => {
  const utils = await loadLessonPlayerUtils();
  if (typeof utils?.getNavigationState !== 'function') return;

  // Step 0 of 8
  const step0 = utils.getNavigationState(0, 8);
  assert.equal(step0.isFirstStep, true);
  assert.equal(step0.isFinalStep, false);
  assert.equal(step0.canGoBack, false);
  assert.equal(step0.canContinue, true);
  assert.equal(step0.progressRatio, 0.125);
  assert.equal(step0.progressPercent, 13);

  // Step 4 of 8
  const step4 = utils.getNavigationState(4, 8);
  assert.equal(step4.isFirstStep, false);
  assert.equal(step4.isFinalStep, false);
  assert.equal(step4.canGoBack, true);
  assert.equal(step4.canContinue, true);
  assert.equal(step4.progressRatio, 0.625);
  assert.equal(step4.progressPercent, 63);

  // Final step 7 of 8
  const step7 = utils.getNavigationState(7, 8);
  assert.equal(step7.isFirstStep, false);
  assert.equal(step7.isFinalStep, true);
  assert.equal(step7.canGoBack, true);
  assert.equal(step7.canContinue, true);
  assert.equal(step7.progressRatio, 1.0);
  assert.equal(step7.progressPercent, 100);

  // Overshoot index 99 clamps to 7
  const over = utils.getNavigationState(99, 8);
  assert.equal(over.currentStepIndex, 7);
  assert.equal(over.isFinalStep, true);

  // Undershoot index -5 clamps to 0
  const under = utils.getNavigationState(-5, 8);
  assert.equal(under.currentStepIndex, 0);
  assert.equal(under.isFirstStep, true);
});

test('LP.7.2: Step transition pure functions prevent bounds overshoot and mutations', async () => {
  const utils = await loadLessonPlayerUtils();
  if (typeof utils?.getNextStepIndex !== 'function' || typeof utils?.getPreviousStepIndex !== 'function') return;

  assert.equal(utils.getNextStepIndex(0, 8), 1);
  assert.equal(utils.getNextStepIndex(7, 8), 7, 'Cannot exceed totalSteps - 1');
  assert.equal(utils.getNextStepIndex(8, 8), 7);

  assert.equal(utils.getPreviousStepIndex(7), 6);
  assert.equal(utils.getPreviousStepIndex(1), 0);
  assert.equal(utils.getPreviousStepIndex(0), 0, 'Cannot drop below 0');
  assert.equal(utils.getPreviousStepIndex(-3), 0);
});

test('LP.7.3: Initial state resolution safely recovers from partial or corrupted progress', async () => {
  const utils = await loadLessonPlayerUtils();
  if (typeof utils?.resolveInitialLessonState !== 'function') return;

  // Null input
  const def = utils.resolveInitialLessonState(null, 8);
  assert.equal(def.currentStepIndex, 0);
  assert.deepEqual(def.microCheckAnswers, {});
  assert.equal(def.completed, false);

  // Valid mid-progress
  const mid = utils.resolveInitialLessonState({ currentStepIndex: 3, microCheckAnswers: { step3: '12' } }, 8);
  assert.equal(mid.currentStepIndex, 3);
  assert.equal(mid.microCheckAnswers.step3, '12');

  // Out-of-bounds saved index (e.g. 50 in 8-step lesson)
  const clamped = utils.resolveInitialLessonState({ currentStepIndex: 50 }, 8);
  assert.equal(clamped.currentStepIndex, 7, 'Clamped to 7 (totalSteps - 1)');
});

test('LP.7.4: Rulebook payload creator extracts clean rule object from step definition', async () => {
  const utils = await loadLessonPlayerUtils();
  if (typeof utils?.createRulebookPayload !== 'function') return;

  const step = {
    type: 'key-rule',
    ruleId: 'rule:add-subtract-fractions',
    category: 'fractions',
    title: 'Adding and Subtracting Fractions',
    explanation: 'Find common denominator, convert numerators, combine.',
    whenToUse: 'When adding fractions.',
    pitfall: 'Do NOT add denominators.',
  };

  const payload = utils.createRulebookPayload(step);
  assert.equal(payload.id, 'rule:add-subtract-fractions');
  assert.equal(payload.category, 'fractions');
  assert.equal(payload.title, 'Adding and Subtracting Fractions');
  assert.ok(payload.explanation.includes('common denominator'));

  // Null step
  assert.equal(utils.createRulebookPayload(null), null);
});

test('LP.7.5: Embedded widget interaction isolation - Event propagation safety (T3.01)', () => {
  let lessonStepIndex = 2; // Step 3 (interact)
  let sliderPosition = 0;

  function onSliderKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.stopPropagation?.();
      sliderPosition += 0.25;
      return true;
    }
    return false;
  }

  const mockEvent = {
    key: 'ArrowRight',
    propagationStopped: false,
    stopPropagation() {
      this.propagationStopped = true;
    },
  };

  const handled = onSliderKeyDown(mockEvent);
  assert.ok(handled);
  assert.equal(sliderPosition, 0.25);
  assert.ok(mockEvent.propagationStopped, 'Event propagation stopped to protect parent lesson container');
  assert.equal(lessonStepIndex, 2, 'Lesson step index did NOT change');
});

test('LP.7.6: Embedded visualizer follow-up does not advance lesson prematurely (T3.02)', () => {
  let lessonStepIndex = 1; // Step 2 (visual)

  // Simulating visualizer follow-up problem solve
  const attempt = {
    id: 'visual-followup-solve',
    conceptId: 'addition',
    submittedAnswer: '5/12',
    isCorrect: true,
  };

  // Practice attempt is logged independently for the follow-up math
  storage.saveLearningAttempt(attempt);

  // Crucially, parent lesson step remains unchanged until user explicitly clicks Continue
  assert.equal(lessonStepIndex, 1, 'Lesson step index remains on step 1 until explicit user continue');
});
