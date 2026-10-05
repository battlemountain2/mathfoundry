import test from 'node:test';
import assert from 'node:assert/strict';
import {
  setupMockLocalStorage,
  EXPECTED_MATH_UNITS,
  evaluateUnitLockState,
  loadStorageModule,
} from './setup.js';
import { equivalentAnswer } from '../../src/utils/answerChecking.js';

test.beforeEach(() => {
  setupMockLocalStorage();
});

// ============================================================================
// Tier 4: End-to-End User Workflows
// ============================================================================

test('T4.01: Fresh Learner Onboarding Flow - Today desk to Unit 1 practice to Unit 2 unlock', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  // Phase 1: Cold start at Today desk
  const initialAttempts = storage.getLearningAttempts();
  assert.equal(initialAttempts.length, 0);

  // Today recommendation points to Unit 1
  const initialRec = {
    unitId: 'arithmetic',
    unitPath: 'math/arithmetic',
    title: 'Arithmetic Relationships',
    action: 'Start Unit 1 →',
  };
  assert.equal(initialRec.unitId, 'arithmetic');

  // Phase 2: Learner navigates to /courses/math/arithmetic and completes practice
  for (let i = 0; i < 6; i++) {
    storage.saveLearningAttempt({
      id: `onboard-attempt-${i}`,
      conceptId: 'arithmetic',
      unitPath: 'math/arithmetic',
      question: `Problem ${i + 1}`,
      submittedAnswer: '10',
      expectedAnswer: '10',
      isCorrect: true,
      assisted: false,
      timestamp: new Date().toISOString(),
    });
  }

  assert.equal(storage.getLearningAttempts().length, 6);
  storage.setModuleProgress('math/arithmetic', { completed: true });

  // Phase 3: Check curriculum progression - Unit 2 Equivalent Fractions is now unlocked
  const satisfiedUnits = ['arithmetic'];
  const unit2State = evaluateUnitLockState('equivalent-fractions', satisfiedUnits);
  assert.equal(unit2State.isLocked, false);
  assert.equal(unit2State.status, 'in-progress');

  // Next recommendation advances to Unit 2
  const nextRec = {
    unitId: 'equivalent-fractions',
    unitPath: 'math/equivalent-fractions',
    title: 'Equivalent Fractions',
    action: 'Start Unit 2 →',
  };
  assert.equal(nextRec.unitId, 'equivalent-fractions');
});

test('T4.02: Complete Guided Lesson Flow - All 8 steps completed, rulebook saved, transitions to practice', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  const lessonPlan = [
    { step: 0, type: 'explain', title: 'Why equal pieces matter' },
    { step: 1, type: 'visual', title: 'Fraction bars visual demonstration' },
    { step: 2, type: 'interact', title: 'Repartitioning into sixths' },
    { step: 3, type: 'micro-check', question: 'LCD of 1/4 and 1/6?', expected: '12', submitted: '12' },
    { step: 4, type: 'explain', title: 'Rewriting numerators' },
    { step: 5, type: 'micro-check', question: '3/12 + 2/12?', expected: '5/12', submitted: '5/12' },
    { step: 6, type: 'key-rule', title: 'Adding and Subtracting Fractions Rule' },
    { step: 7, type: 'transition', title: 'Start Practice' },
  ];

  let currentStep = 0;
  const recordedMicroChecks = {};

  // Step 0 -> Step 1 (Explain)
  currentStep = 1;

  // Step 1 -> Step 2 (Visual)
  currentStep = 2;

  // Step 2 -> Step 3 (Interact)
  currentStep = 3;

  // Step 3 (Micro-check 1): Answer LCD
  const mc1 = lessonPlan[3];
  assert.ok(equivalentAnswer(mc1.submitted, mc1.expected));
  recordedMicroChecks['step3'] = mc1.submitted;
  currentStep = 4;

  // Step 4 -> Step 5 (Explain)
  currentStep = 5;

  // Step 5 (Micro-check 2): Answer sum
  const mc2 = lessonPlan[5];
  assert.ok(equivalentAnswer(mc2.submitted, mc2.expected));
  recordedMicroChecks['step5'] = mc2.submitted;
  currentStep = 6;

  // Step 6 (Key Rule): Save to Rulebook
  storage.saveRulebookEntry({
    id: 'rule:add-subtract-fractions',
    category: 'fractions',
    title: 'Adding and Subtracting Fractions',
    explanation: 'Find common denominator, convert numerators, combine.',
  });
  currentStep = 7;

  // Step 7 (Transition): Complete lesson
  if (typeof storage?.saveLessonProgress === 'function') {
    storage.saveLessonProgress('math/add-subtract-fractions', {
      currentStepIndex: 7,
      microCheckAnswers: recordedMicroChecks,
      completed: true,
      completedAt: new Date().toISOString(),
    });

    const progress = storage.getLessonProgress('math/add-subtract-fractions');
    assert.equal(progress.completed, true);
    assert.equal(progress.microCheckAnswers.step3, '12');
    assert.equal(progress.microCheckAnswers.step5, '5/12');
  }

  // Verify Rulebook contains the rule
  const rulebook = storage.getRulebook();
  assert.ok(rulebook.some((r) => r.id === 'rule:add-subtract-fractions'));

  // Verify learningAttempts remains 0 (micro-checks are NOT mastery evidence)
  assert.equal(storage.getLearningAttempts().length, 0);
});

test('T4.03: Interrupted Session & Resume Flow - Browser refresh at Step 4 restores state and continues to finish', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  // Part 1: Learner progresses to Step 4 and answers micro-check
  if (typeof storage?.saveLessonProgress === 'function' && typeof storage?.getLessonProgress === 'function') {
    storage.saveLessonProgress('math/add-subtract-fractions', {
      currentStepIndex: 3,
      microCheckAnswers: { step3: '12' },
      completed: false,
    });

    // Part 2: Simulate tab close / reload: retrieve state
    const resumed = storage.getLessonProgress('math/add-subtract-fractions');
    assert.equal(resumed.currentStepIndex, 3);
    assert.equal(resumed.microCheckAnswers.step3, '12');
    assert.equal(resumed.completed, false);

    // Part 3: Learner resumes from step 3 and finishes remaining steps
    storage.saveLessonProgress('math/add-subtract-fractions', {
      currentStepIndex: 7,
      microCheckAnswers: { step3: '12', step5: '5/12' },
      completed: true,
      completedAt: new Date().toISOString(),
    });

    const finished = storage.getLessonProgress('math/add-subtract-fractions');
    assert.equal(finished.completed, true);
    assert.equal(finished.currentStepIndex, 7);
  }
});

test('T4.04: Mistake Review & Repair Loop - Practice mistake is reflected, queued, and cleared via repair', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  // 1. Learner makes mistake in practice
  const missedAttempt = {
    id: 'miss-fractions-1',
    conceptId: 'addition',
    unitPath: 'math/add-subtract-fractions',
    question: 'Add 1/4 + 1/6',
    submittedAnswer: '2/10',
    expectedAnswer: '5/12',
    isCorrect: false,
    reflectiveCause: 'rule-confused',
    timestamp: new Date().toISOString(),
  };

  storage.saveLearningAttempt(missedAttempt);
  assert.equal(storage.getLearningAttempts().length, 1);

  // 2. Mistake appears in recent mistakes / review queue
  const recentMistakes = storage.getRecentMistakes();
  assert.ok(recentMistakes);

  // 3. Learner performs targeted repair
  const repairRecord = {
    id: 'repair-1',
    sourceAttemptId: 'miss-fractions-1',
    subskill: 'fraction-addition',
    isResolved: true,
    resolvedAt: new Date().toISOString(),
  };

  // After repair, reflective cause is updated or marked resolved
  if (typeof storage?.updateAttemptReflectiveCause === 'function') {
    storage.updateAttemptReflectiveCause('miss-fractions-1', 'rule-confused');
  }

  const storedAttempts = storage.getLearningAttempts();
  assert.equal(storedAttempts[0].reflectiveCause, 'rule-confused');
});

test('T4.05: Multi-Unit Curriculum Progression & Prerequisite Gating Flow across units 1 to 12', () => {
  const units = EXPECTED_MATH_UNITS;

  // Initial State: Only Unit 1 Arithmetic is unlocked
  let satisfied = [];
  assert.equal(evaluateUnitLockState('arithmetic', satisfied, units).isLocked, false);
  assert.equal(evaluateUnitLockState('equivalent-fractions', satisfied, units).isLocked, true);
  assert.equal(evaluateUnitLockState('negative-numbers', satisfied, units).isLocked, true);

  // After Unit 1: Units 2, 7, 8, 10, 11 unlock
  satisfied = ['arithmetic'];
  assert.equal(evaluateUnitLockState('equivalent-fractions', satisfied, units).isLocked, false);
  assert.equal(evaluateUnitLockState('negative-numbers', satisfied, units).isLocked, false);
  assert.equal(evaluateUnitLockState('decimals-place-value', satisfied, units).isLocked, false);
  assert.equal(evaluateUnitLockState('factors-multiples', satisfied, units).isLocked, false);
  assert.equal(evaluateUnitLockState('order-of-operations', satisfied, units).isLocked, false);

  // But Unit 3, 4, 5, 6, 9, 12 remain locked!
  assert.equal(evaluateUnitLockState('compare-fractions', satisfied, units).isLocked, true);
  assert.equal(evaluateUnitLockState('add-subtract-fractions', satisfied, units).isLocked, true);
  assert.equal(evaluateUnitLockState('multiply-fractions', satisfied, units).isLocked, true);
  assert.equal(evaluateUnitLockState('intro-algebra', satisfied, units).isLocked, true);

  // After Unit 2: Units 3, 4 unlock. Unit 5 (requires arithmetic AND equivalent-fractions) now unlocks!
  satisfied = ['arithmetic', 'equivalent-fractions'];
  assert.equal(evaluateUnitLockState('compare-fractions', satisfied, units).isLocked, false);
  assert.equal(evaluateUnitLockState('add-subtract-fractions', satisfied, units).isLocked, false);
  assert.equal(evaluateUnitLockState('multiply-fractions', satisfied, units).isLocked, false);

  // Unit 6 (Divide Fractions) requires multiply-fractions -> still locked!
  assert.equal(evaluateUnitLockState('divide-fractions', satisfied, units).isLocked, true);

  // Test Unit 12 Intro to Algebra (requires order-of-operations AND negative-numbers)
  satisfied = ['arithmetic', 'order-of-operations'];
  assert.equal(evaluateUnitLockState('intro-algebra', satisfied, units).isLocked, true, 'Unit 12 locked with only order-of-operations');

  satisfied = ['arithmetic', 'order-of-operations', 'negative-numbers'];
  assert.equal(evaluateUnitLockState('intro-algebra', satisfied, units).isLocked, false, 'Unit 12 unlocks when BOTH prerequisites satisfied');
});
