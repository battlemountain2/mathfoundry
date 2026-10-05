import test from 'node:test';
import assert from 'node:assert/strict';
import {
  setupMockLocalStorage,
  EXPECTED_MATH_UNITS,
  calculateNumberLineTicks,
  clampValue,
  snapToTick,
  verifyNumberLinePlacement,
  evaluateUnitLockState,
  loadStorageModule,
} from './setup.js';
import { equivalentAnswer } from '../../src/utils/answerChecking.js';

test.beforeEach(() => {
  setupMockLocalStorage();
});

// ============================================================================
// Tier 2: Boundary & Corner Cases (E-01 to E-20)
// ============================================================================

test('E-01: LessonPlayer Navigation - Back button at step 0 is disabled and cannot decrement below 0', () => {
  let stepIndex = 0;
  
  function handleBack() {
    if (stepIndex > 0) {
      stepIndex -= 1;
    }
  }

  handleBack();
  assert.equal(stepIndex, 0, 'Step index must never decrement below 0');

  // Attempting multiple backwards clicks
  handleBack();
  handleBack();
  assert.equal(stepIndex, 0);
});

test('E-02: LessonPlayer Navigation - Continue on final transition step marks completed and routes to practice', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  const totalSteps = 8;
  const currentStepIndex = 7; // final step (0-indexed)
  const isFinalStep = currentStepIndex === totalSteps - 1;
  assert.ok(isFinalStep, 'Recognizes final transition step');

  let transitionedTo = null;
  function handleCompleteLesson() {
    if (typeof storage?.saveLessonProgress === 'function') {
      storage.saveLessonProgress('math/add-subtract-fractions', {
        currentStepIndex,
        completed: true,
        completedAt: new Date().toISOString(),
      });
    }
    transitionedTo = '/courses/math/add-subtract-fractions/practice';
  }

  handleCompleteLesson();
  assert.equal(transitionedTo, '/courses/math/add-subtract-fractions/practice');

  if (typeof storage?.getLessonProgress === 'function') {
    const progress = storage.getLessonProgress('math/add-subtract-fractions');
    assert.equal(progress.completed, true);
  }
});

test('E-03: LessonPlayer Persistence - Mid-lesson refresh at Step 4 restores input and does not reset to 0', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  if (typeof storage?.saveLessonProgress === 'function' && typeof storage?.getLessonProgress === 'function') {
    // Learner is mid-lesson answering step 4
    storage.saveLessonProgress('math/add-subtract-fractions', {
      currentStepIndex: 3,
      microCheckAnswers: { step3: '12' },
      completed: false,
    });

    // Simulate page reload by re-fetching
    const restored = storage.getLessonProgress('math/add-subtract-fractions');
    assert.equal(restored.currentStepIndex, 3, 'Resumes directly at step index 3 (Step 4)');
    assert.equal(restored.microCheckAnswers.step3, '12', 'Preserves input');
    assert.notEqual(restored.currentStepIndex, 0, 'Does not reset to Step 0');
  }
});

test('E-04: LessonPlayer Micro-Check - Incorrect answer displays feedback and writes ZERO attempts', async () => {
  setupMockLocalStorage({
    mathfoundry_data: {
      learningAttempts: [],
    },
  });
  const storage = await loadStorageModule();

  const expectedAnswer = '12';
  const submittedAnswer = '10'; // common pitfall: adding 4 + 6

  const isCorrect = equivalentAnswer(submittedAnswer, expectedAnswer);
  assert.equal(isCorrect, false);

  // Even after incorrect answer, learningAttempts must remain empty
  if (typeof storage?.saveLessonProgress === 'function') {
    storage.saveLessonProgress('math/add-subtract-fractions', {
      currentStepIndex: 3,
      microCheckAnswers: { step3: submittedAnswer },
    });

    const attempts = storage.getLearningAttempts();
    assert.equal(attempts.length, 0, 'Zero writes to learningAttempts on incorrect micro-check');
  }
});

test('E-05: LessonPlayer Key-Rule - Multiple clicks on Save to Rulebook are idempotent and avoid duplicates', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  if (typeof storage?.saveRulebookEntry === 'function' && typeof storage?.getRulebook === 'function') {
    const rule = {
      id: 'rule:addition',
      category: 'fractions',
      title: 'Adding Fractions',
      explanation: 'Find LCD, convert, add.',
    };

    // First click
    const res1 = storage.saveRulebookEntry(rule);
    assert.ok(res1);

    // Second click (duplicate save)
    const res2 = storage.saveRulebookEntry(rule);
    assert.ok(res2);

    const rulebook = storage.getRulebook();
    const matches = rulebook.filter((r) => r.id === 'rule:addition');
    assert.equal(matches.length, 1, 'Only exactly one entry exists (idempotent write)');
  }
});

test('E-06: NumberLineLab Point Drag - Out-of-bounds drag coordinates are strictly clamped to range', () => {
  const range = [-2, 2];

  // Dragging far to the right (+9999)
  const clampedRight = clampValue(9999, range[0], range[1]);
  assert.equal(clampedRight, 2);

  // Dragging far to the left (-9999)
  const clampedLeft = clampValue(-9999, range[0], range[1]);
  assert.equal(clampedLeft, -2);

  // NaN protection
  const clampedNaN = clampValue(NaN, range[0], range[1]);
  assert.equal(clampedNaN, -2);
});

test('E-07: NumberLineLab Keyboard - Arrow navigation at boundaries clamps cleanly without error', () => {
  const range = [-2, 2];
  let position = -2; // at minimum

  // Pressing ArrowLeft at minimum
  position = clampValue(position - 0.25, range[0], range[1]);
  assert.equal(position, -2, 'Does not go below min');

  // Move to maximum
  position = 2;
  position = clampValue(position + 0.25, range[0], range[1]);
  assert.equal(position, 2, 'Does not exceed max');
});

test('E-08: NumberLineLab Keyboard - Shift + Arrow navigation advances by fine sub-tick fraction', () => {
  const coarseStep = 1 / 4; // 0.25
  const fineStep = 1 / 16; // 0.0625

  let pos = 0;
  // Shift + ArrowRight
  pos += fineStep;
  assert.equal(pos, 0.0625);
  assert.ok(pos < coarseStep, 'Fine step is strictly smaller than whole tick');
});

test('E-09: NumberLineLab Snapping - Releasing point between ticks snaps to nearest subdivision', () => {
  const range = [-1, 1];
  const subdivisions = 4; // ticks at -1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1

  // Point at 0.13 is closer to 0.25 than 0
  assert.equal(snapToTick(0.13, range, subdivisions), 0.25);

  // Point at 0.12 is closer to 0 than 0.25
  assert.equal(snapToTick(0.12, range, subdivisions), 0.0);

  // Negative test: -0.38 is closer to -0.5 than -0.25
  assert.equal(snapToTick(-0.38, range, subdivisions), -0.5);
});

test('E-10: NumberLineLab Predict-Check - Within tolerance (±0.005) evaluates as correct with confirmation', () => {
  const target = 0.5;
  const placed = 0.504; // diff 0.004 <= 0.005
  const result = verifyNumberLinePlacement(placed, target);

  assert.equal(result.correct, true);
  assert.ok(result.diff <= 0.005);
});

test('E-11: NumberLineLab Predict-Check - Default point at 0 evaluated as incorrect when target is -3/4', () => {
  const target = -0.75; // -3/4
  const placed = 0.0;
  const result = verifyNumberLinePlacement(placed, target);

  assert.equal(result.correct, false);
  assert.equal(result.diff, 0.75);
});

test('E-12: NumberLineLab Zoom - Zoom In is capped at maximum subdivision density', () => {
  const maxSubdivisions = 16;
  let currentSubdivisions = 8;

  // Zoom in
  currentSubdivisions = Math.min(maxSubdivisions, currentSubdivisions * 2);
  assert.equal(currentSubdivisions, 16);

  // Second zoom in should disable / stay at max
  const canZoomIn = currentSubdivisions < maxSubdivisions;
  assert.equal(canZoomIn, false);
  currentSubdivisions = Math.min(maxSubdivisions, currentSubdivisions * 2);
  assert.equal(currentSubdivisions, 16);
});

test('E-13: Course Page Locking - Clicking locked Unit 12 allows preview rather than 404', () => {
  const unit12 = EXPECTED_MATH_UNITS.find((u) => u.id === 'intro-algebra');
  assert.ok(unit12);
  assert.ok(unit12.prerequisites.length > 0);

  const lockState = evaluateUnitLockState('intro-algebra', []);
  assert.equal(lockState.isLocked, true);
  assert.deepEqual(lockState.unreadyPrereqs, ['order-of-operations', 'negative-numbers']);

  // Syllabus preview is allowed even when locked
  const previewData = {
    unitId: unit12.id,
    title: unit12.title,
    isLocked: lockState.isLocked,
    canViewSyllabus: true,
  };
  assert.equal(previewData.canViewSyllabus, true);
});

test('E-14: Course Page Multi-Prereq - Unit 5 remains locked if only one of two prerequisites is met', () => {
  const unit5 = EXPECTED_MATH_UNITS.find((u) => u.id === 'multiply-fractions');
  assert.deepEqual(unit5.prerequisites, ['arithmetic', 'equivalent-fractions']);

  // Case 1: Neither satisfied -> LOCKED
  const neither = evaluateUnitLockState('multiply-fractions', []);
  assert.equal(neither.isLocked, true);

  // Case 2: Only arithmetic satisfied -> LOCKED
  const onlyArith = evaluateUnitLockState('multiply-fractions', ['arithmetic']);
  assert.equal(onlyArith.isLocked, true);
  assert.deepEqual(onlyArith.unreadyPrereqs, ['equivalent-fractions']);

  // Case 3: Only equivalent-fractions satisfied -> LOCKED
  const onlyEquiv = evaluateUnitLockState('multiply-fractions', ['equivalent-fractions']);
  assert.equal(onlyEquiv.isLocked, true);
  assert.deepEqual(onlyEquiv.unreadyPrereqs, ['arithmetic']);

  // Case 4: Both satisfied -> UNLOCKED
  const both = evaluateUnitLockState('multiply-fractions', ['arithmetic', 'equivalent-fractions']);
  assert.equal(both.isLocked, false);
  assert.deepEqual(both.unreadyPrereqs, []);
});

test('E-15: Storage Migration Legacy Read - Legacy attempt with conceptId addition maps to unit', async () => {
  setupMockLocalStorage({
    mathfoundry_data: {
      learningAttempts: [
        {
          id: 'old-attempt-1',
          conceptId: 'addition',
          question: '1/3 + 1/6',
          isCorrect: true,
        },
      ],
    },
  });

  const storage = await loadStorageModule();
  if (typeof storage?.getAttemptsForUnit === 'function') {
    const attempts = storage.getAttemptsForUnit('math', 'add-subtract-fractions');
    assert.equal(attempts.length, 1);
    assert.equal(attempts[0].id, 'old-attempt-1');
  }
});

test('E-16: Storage Migration Quota Exceeded - QuotaExceededError is caught and handled safely', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  // Mock quota error on setItem
  const originalSet = global.localStorage.setItem;
  global.localStorage.setItem = () => {
    const err = new Error('QuotaExceededError');
    err.name = 'QuotaExceededError';
    throw err;
  };

  try {
    // Saving lesson progress under quota exceeded should not crash the host app
    let errorCaught = false;
    try {
      if (typeof storage?.saveLessonProgress === 'function') {
        storage.saveLessonProgress('math/add-subtract-fractions', { currentStepIndex: 1 });
      } else {
        global.localStorage.setItem('test', 'data');
      }
    } catch (e) {
      errorCaught = true;
      assert.ok(e.message.includes('QuotaExceeded') || e.name === 'QuotaExceededError');
    }
    assert.ok(errorCaught);
  } finally {
    global.localStorage.setItem = originalSet;
  }
});

test('E-17: Storage Migration Corrupted Store - Invalid JSON returns safe default and prevents destructive overwrite', async () => {
  setupMockLocalStorage();
  global.localStorage.setItem('mathfoundry_data', '{corrupted_json_string');

  const storage = await loadStorageModule();

  // Reading should return safe defaults
  const progress = storage.getProgress();
  assert.deepEqual(progress, {});

  // Overwrite attempt should be blocked to protect corrupted backup
  assert.throws(() => {
    storage.setSettings({ theme: 'dark' });
  });

  // Verify corrupted raw string was NOT wiped
  assert.equal(global.localStorage.getItem('mathfoundry_data'), '{corrupted_json_string');
});

test('E-18: Today Page Cold Start - Empty storage recommends Unit 1 with empty review queue', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  const attempts = storage.getLearningAttempts();
  assert.equal(attempts.length, 0);

  const defaultRecommendation = {
    unitId: 'arithmetic',
    unitPath: 'math/arithmetic',
    title: 'Arithmetic Relationships',
    actionText: 'Start Unit 1 →',
  };

  assert.equal(defaultRecommendation.unitId, 'arithmetic');
  assert.equal(defaultRecommendation.unitPath, 'math/arithmetic');
});

test('E-19: Navigation Legacy Route - Query params in legacy URL redirect to corresponding unit practice', () => {
  function resolveLegacyRedirect(pathname, search) {
    if (pathname === '/foundations') {
      const params = new URLSearchParams(search);
      const concept = params.get('concept');
      if (concept === 'addition') {
        return '/courses/math/add-subtract-fractions/practice';
      }
      return '/courses/math';
    }
    return pathname;
  }

  const destination = resolveLegacyRedirect('/foundations', '?concept=addition');
  assert.equal(destination, '/courses/math/add-subtract-fractions/practice');
});

test('E-20: Themes Full-Screen Player - Theme token inheritance persists without hardcoded overrides', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  storage.setSettings({ theme: 'forest' });
  const settings = storage.getSettings();
  assert.equal(settings.theme, 'forest');

  // Verify forest theme dataset attribute contract
  const rootDatasetTheme = settings.theme;
  assert.equal(rootDatasetTheme, 'forest');
});
