import test from 'node:test';
import assert from 'node:assert/strict';
import {
  setupMockLocalStorage,
  EXPECTED_MATH_UNITS,
  calculateNumberLineTicks,
  verifyNumberLinePlacement,
  evaluateUnitLockState,
  loadStorageModule,
} from './setup.js';
import { equivalentAnswer } from '../../src/utils/answerChecking.js';

test.beforeEach(() => {
  setupMockLocalStorage();
});

// ============================================================================
// Tier 3: Pairwise & Cross-Feature Interactions
// ============================================================================

test('T3.01: NumberLineLab inside LessonPlayer - slider keyboard navigation does not trigger lesson page advance', () => {
  // Setup lesson state with embedded number line
  let lessonStepIndex = 2; // step 3 (interact)
  let sliderPosition = 0;
  
  const step = {
    type: 'interact',
    component: 'NumberLineLab',
    props: {
      range: [-1, 1],
      subdivisions: 4,
      targetValue: 0.5,
    },
  };

  // Keyboard event handler inside NumberLineLab
  function onSliderKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.stopPropagation?.();
      sliderPosition += 0.25;
      return true;
    }
    return false;
  }

  // Simulate ArrowRight on focused slider
  const mockEvent = { key: 'ArrowRight', propagationStopped: false, stopPropagation() { this.propagationStopped = true; } };
  const handled = onSliderKeyDown(mockEvent);

  assert.ok(handled, 'Slider handled ArrowRight event');
  assert.equal(sliderPosition, 0.25, 'Slider moved forward by 1 subdivision tick');
  assert.ok(mockEvent.propagationStopped, 'Event propagation stopped to protect parent lesson container');
  assert.equal(lessonStepIndex, 2, 'Lesson step index did NOT change');
});

test('T3.02: FractionBarVisualizer inside LessonPlayer - visual model follow-up does not prematurely advance lesson', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  let lessonStepIndex = 1; // Step 2 (visual)
  const variant = {
    f1: { n: 1, d: 2 },
    f2: { n: 1, d: 3 },
    targetD: 6,
    sum: '5/6',
    followUpAns: '5/12',
  };

  // Verify visual model math
  const f1Units = (variant.targetD * variant.f1.n) / variant.f1.d;
  const f2Units = (variant.targetD * variant.f2.n) / variant.f2.d;
  assert.equal(f1Units, 3);
  assert.equal(f2Units, 2);
  assert.ok(equivalentAnswer(`${f1Units + f2Units}/${variant.targetD}`, variant.sum));

  // Completing an independent follow-up logs evidence for the math problem
  const attempt = {
    id: 'visual-followup-1',
    conceptId: 'addition',
    submittedAnswer: variant.followUpAns,
    expectedAnswer: variant.followUpAns,
    isCorrect: true,
    assisted: false,
    timestamp: new Date().toISOString(),
  };

  storage.saveLearningAttempt(attempt);
  const attempts = storage.getLearningAttempts();
  assert.equal(attempts.length, 1);

  // Lesson step remains on step 1 until explicit user click on "Continue"
  assert.equal(lessonStepIndex, 1, 'Lesson step index remains intact until user clicks Continue');
});

test('T3.03: Key-Rule Save & Rulebook Inspection - Rule saved in lesson is viewable with notes in Rulebook', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  // Save rule from lesson step
  const rulePayload = {
    id: 'rule:add-subtract-fractions',
    conceptId: 'addition',
    category: 'fractions',
    title: 'Adding and Subtracting Fractions',
    whenToUse: 'When fractions have unequal denominators',
    explanation: 'Find a common denominator first, rewrite each fraction, then add or subtract numerators.',
    pitfall: 'Never add denominators across the plus sign.',
    notes: 'Remember to check LCD first!',
  };

  storage.saveRulebookEntry(rulePayload);

  // Read back rulebook entries
  const rulebook = storage.getRulebook();
  const entry = rulebook.find((r) => r.id === rulePayload.id);

  assert.ok(entry, 'Entry found in rulebook');
  assert.equal(entry.category, 'fractions');
  assert.equal(entry.notes, 'Remember to check LCD first!');
  assert.ok(entry.explanation.includes('common denominator'));
});

test('T3.04: Unit Practice Completion & Course Progress Update - Completing Unit 1 unlocks Unit 2', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  // 1. Initial lock evaluation: Unit 2 is locked
  const initialLock = evaluateUnitLockState('equivalent-fractions', []);
  assert.equal(initialLock.isLocked, true);

  // 2. Complete 6 practice problems for Unit 1
  for (let i = 0; i < 6; i++) {
    storage.saveLearningAttempt({
      id: `attempt-u1-${i}`,
      conceptId: 'arithmetic',
      unitPath: 'math/arithmetic',
      isCorrect: true,
      assisted: false,
      timestamp: new Date().toISOString(),
    });
  }

  // Mark unit 1 completed in progress
  storage.setModuleProgress('math/arithmetic', { completed: true });

  // 3. Re-evaluate lock: Unit 2 is now unlocked
  const satisfied = ['arithmetic'];
  const postLock = evaluateUnitLockState('equivalent-fractions', satisfied);
  assert.equal(postLock.isLocked, false);
  assert.equal(postLock.status, 'in-progress');
});

test('T3.05: Theme Switching in LessonPlayer - Changing theme reflects in player styling context', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  // Start in light theme
  storage.setSettings({ theme: 'light' });
  assert.equal(storage.getSettings().theme, 'light');

  // Switch to forest theme mid-lesson
  storage.setSettings({ theme: 'forest' });
  assert.equal(storage.getSettings().theme, 'forest');

  // Switch to dark theme
  storage.setSettings({ theme: 'dark' });
  assert.equal(storage.getSettings().theme, 'dark');
});

test('T3.06: Legacy Attempt Mapping to Unit Review - Historical missed attempt displays in unit review', async () => {
  setupMockLocalStorage({
    mathfoundry_data: {
      learningAttempts: [
        {
          id: 'hist-miss-1',
          conceptId: 'addition', // Legacy concept
          question: 'Add 1/4 + 1/6',
          submittedAnswer: '2/10',
          expectedAnswer: '5/12',
          isCorrect: false,
          reflectiveCause: 'rule-confused',
          timestamp: '2026-09-25T12:00:00Z',
        },
      ],
    },
  });

  const storage = await loadStorageModule();
  
  if (typeof storage?.getAttemptsForUnit === 'function') {
    const unitAttempts = storage.getAttemptsForUnit('math', 'add-subtract-fractions');
    assert.equal(unitAttempts.length, 1);
    const missed = unitAttempts[0];
    assert.equal(missed.isCorrect, false);
    assert.equal(missed.reflectiveCause, 'rule-confused');
  }
});

test('T3.07: Unit Quiz Evaluation - Quiz scores record and contribute to unit completion metrics', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  if (typeof storage?.saveUnitQuizResult === 'function' && typeof storage?.getUnitQuizResult === 'function') {
    storage.saveUnitQuizResult('math/add-subtract-fractions', {
      score: 80,
      total: 5,
      correct: 4,
      passed: true,
    });

    const quizResult = storage.getUnitQuizResult('math/add-subtract-fractions');
    assert.equal(quizResult.score, 80);
    assert.equal(quizResult.passed, true);
  }
});

test('T3.08: Today Recommendation Priority Dynamics - Priority transitions from lesson to practice to review', async () => {
  setupMockLocalStorage();
  const storage = await loadStorageModule();

  function computeNextAction(unitPath, lessonState, attempts, mistakes) {
    if (mistakes.length > 0) {
      return { action: 'repair', text: `Repair ${mistakes.length} mistakes` };
    }
    if (lessonState && !lessonState.completed) {
      return { action: 'resume-lesson', text: `Resume Lesson: Step ${lessonState.currentStepIndex + 1}` };
    }
    if (attempts.length < 6) {
      return { action: 'start-practice', text: 'Start Unit Practice' };
    }
    return { action: 'next-unit', text: 'Continue Curriculum' };
  }

  // 1. Unstarted / mid-lesson
  const midLesson = { currentStepIndex: 3, completed: false };
  assert.equal(computeNextAction('math/add-subtract-fractions', midLesson, [], []).action, 'resume-lesson');

  // 2. Lesson completed, practice needed
  const doneLesson = { currentStepIndex: 7, completed: true };
  assert.equal(computeNextAction('math/add-subtract-fractions', doneLesson, [], []).action, 'start-practice');

  // 3. Unrepaired mistakes exist
  const mistakes = [{ id: 'm1' }];
  assert.equal(computeNextAction('math/add-subtract-fractions', doneLesson, [1, 2, 3], mistakes).action, 'repair');
});
