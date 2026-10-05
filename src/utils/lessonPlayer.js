/**
 * src/utils/lessonPlayer.js
 *
 * Companion pure helper functions for Guided Lesson System (Milestone 3).
 * Provides pure business logic, schema validation, navigation bounds calculation,
 * micro-check evaluation, and state resolution without JSX or React DOM dependencies.
 */

import { equivalentAnswer } from './answerChecking.js';

export const VALID_STEP_TYPES = [
  'explain',
  'visual',
  'interact',
  'micro-check',
  'key-rule',
  'transition',
];

/**
 * Validates a lesson definition object against the authoritative Milestone 3 schema.
 *
 * @param {object} lesson - The lesson object to validate
 * @returns {{ isValid: boolean, errors: string[] }} Validation result
 */
export function validateLessonSchema(lesson) {
  const errors = [];

  if (!lesson || typeof lesson !== 'object') {
    return { isValid: false, errors: ['Lesson definition must be a non-null object.'] };
  }

  if (!lesson.id || typeof lesson.id !== 'string') {
    errors.push('Lesson requires a valid non-empty string "id".');
  }
  if (!lesson.unitId || typeof lesson.unitId !== 'string') {
    errors.push('Lesson requires a valid non-empty string "unitId".');
  }
  if (!lesson.courseId || typeof lesson.courseId !== 'string') {
    errors.push('Lesson requires a valid non-empty string "courseId".');
  }
  if (!lesson.title || typeof lesson.title !== 'string') {
    errors.push('Lesson requires a valid non-empty string "title".');
  }

  if (!Array.isArray(lesson.steps)) {
    errors.push('Lesson requires a "steps" array.');
    return { isValid: false, errors };
  }

  if (lesson.steps.length < 6 || lesson.steps.length > 10) {
    errors.push(`Lesson steps count must be between 6 and 10 (inclusive). Found: ${lesson.steps.length}.`);
  }

  const stepTypes = lesson.steps.map((s) => s?.type);

  for (let i = 0; i < lesson.steps.length; i++) {
    const step = lesson.steps[i];
    if (!step || typeof step !== 'object') {
      errors.push(`Step at index ${i} must be a valid object.`);
      continue;
    }

    if (!VALID_STEP_TYPES.includes(step.type)) {
      errors.push(`Step at index ${i} has invalid type "${step.type}". Must be one of: ${VALID_STEP_TYPES.join(', ')}.`);
    }

    if (step.type === 'explain') {
      if (!step.title || typeof step.title !== 'string') {
        errors.push(`Explain step at index ${i} requires a non-empty string "title".`);
      }
      if (!step.content || typeof step.content !== 'string') {
        errors.push(`Explain step at index ${i} requires a non-empty string "content".`);
      }
    }

    if (step.type === 'visual') {
      if (!step.visualizer && !step.component) {
        errors.push(`Visual step at index ${i} requires a "visualizer" or "component" property.`);
      }
    }

    if (step.type === 'micro-check') {
      if (!step.question || typeof step.question !== 'string') {
        errors.push(`Micro-check step at index ${i} requires a non-empty string "question".`);
      }
      if (step.expectedAnswer === undefined || step.expectedAnswer === null) {
        errors.push(`Micro-check step at index ${i} requires an "expectedAnswer".`);
      }
    }

    if (step.type === 'key-rule') {
      const ruleId = step.ruleId || step.id;
      if (!ruleId || typeof ruleId !== 'string') {
        errors.push(`Key-rule step at index ${i} requires a string "ruleId" or "id".`);
      }
      if (!step.title || typeof step.title !== 'string') {
        errors.push(`Key-rule step at index ${i} requires a non-empty string "title".`);
      }
      if (!step.explanation || typeof step.explanation !== 'string') {
        errors.push(`Key-rule step at index ${i} requires a non-empty string "explanation".`);
      }
    }

    if (step.type === 'transition') {
      if (!step.targetUrl || typeof step.targetUrl !== 'string') {
        errors.push(`Transition step at index ${i} requires a non-empty string "targetUrl".`);
      }
      if (!Array.isArray(step.summary) || step.summary.length === 0) {
        errors.push(`Transition step at index ${i} requires a non-empty "summary" array.`);
      }
    }
  }

  if (!stepTypes.includes('visual')) {
    errors.push('Lesson must contain at least one "visual" step.');
  }

  const microCheckCount = stepTypes.filter((t) => t === 'micro-check').length;
  if (microCheckCount < 2) {
    errors.push(`Lesson must contain at least two "micro-check" steps. Found: ${microCheckCount}.`);
  }

  if (!stepTypes.includes('key-rule')) {
    errors.push('Lesson must contain at least one "key-rule" step.');
  }

  if (lesson.steps.length > 0 && lesson.steps[lesson.steps.length - 1]?.type !== 'transition') {
    errors.push('The final step of the lesson must be a "transition" step.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates navigation boundary flags, step counters, and progress bar ratio.
 *
 * @param {number} currentStepIndex - 0-based index of the current step
 * @param {number} totalSteps - Total number of steps in the lesson
 * @returns {object} Navigation state model
 */
export function getNavigationState(currentStepIndex, totalSteps) {
  const total = Math.max(1, typeof totalSteps === 'number' && Number.isFinite(totalSteps) ? Math.floor(totalSteps) : 1);
  const rawIndex = typeof currentStepIndex === 'number' && Number.isFinite(currentStepIndex) ? Math.floor(currentStepIndex) : 0;
  const clampedIndex = Math.max(0, Math.min(total - 1, rawIndex));

  const isFirstStep = clampedIndex === 0;
  const isFinalStep = clampedIndex === total - 1;
  const canGoBack = !isFirstStep;
  const canContinue = true;

  // Formula per F-01 & AC 106: (step + 1) / totalSteps
  const progressRatio = Number(((clampedIndex + 1) / total).toFixed(4));
  const progressPercent = Math.round(progressRatio * 100);

  return {
    currentStepIndex: clampedIndex,
    totalSteps: total,
    isFirstStep,
    isFinalStep,
    canGoBack,
    canContinue,
    progressRatio,
    progressPercent,
  };
}

/**
 * Returns the clamped next step index advancing forward.
 *
 * @param {number} currentStepIndex - 0-based index
 * @param {number} totalSteps - Total steps
 * @returns {number} Next step index (clamped to totalSteps - 1)
 */
export function getNextStepIndex(currentStepIndex, totalSteps) {
  const total = Math.max(1, typeof totalSteps === 'number' && Number.isFinite(totalSteps) ? Math.floor(totalSteps) : 1);
  const current = typeof currentStepIndex === 'number' && Number.isFinite(currentStepIndex) ? Math.floor(currentStepIndex) : 0;
  return Math.min(total - 1, Math.max(0, current) + 1);
}

/**
 * Returns the clamped previous step index moving backward.
 *
 * @param {number} currentStepIndex - 0-based index
 * @returns {number} Previous step index (clamped to 0)
 */
export function getPreviousStepIndex(currentStepIndex) {
  const current = typeof currentStepIndex === 'number' && Number.isFinite(currentStepIndex) ? Math.floor(currentStepIndex) : 0;
  return Math.max(0, current - 1);
}

/**
 * Evaluates a formative micro-check answer with tolerance and descriptive feedback.
 *
 * @param {string|number} userAnswer - Learner's input
 * @param {string|number} expectedAnswer - Expected answer
 * @returns {{ isAnswered: boolean, isCorrect: boolean, feedback: string }}
 */
export function evaluateMicroCheck(userAnswer, expectedAnswer) {
  if (userAnswer === null || userAnswer === undefined || String(userAnswer).trim() === '') {
    return {
      isAnswered: false,
      isCorrect: false,
      feedback: 'Please enter an answer before checking.',
    };
  }

  const isCorrect = equivalentAnswer(String(userAnswer).trim(), String(expectedAnswer).trim());

  return {
    isAnswered: true,
    isCorrect,
    feedback: isCorrect
      ? 'Correct! Well done.'
      : 'Not quite. Check your calculation and try again.',
  };
}

/**
 * Resolves the initial lesson state by merging stored progress safely with bounds.
 *
 * @param {object|null} savedProgress - Record retrieved from getLessonProgress()
 * @param {number} totalSteps - Total steps in lesson
 * @returns {object} Safe initialized state
 */
export function resolveInitialLessonState(savedProgress, totalSteps) {
  const total = Math.max(1, typeof totalSteps === 'number' && Number.isFinite(totalSteps) ? Math.floor(totalSteps) : 1);

  if (!savedProgress || typeof savedProgress !== 'object') {
    return {
      currentStepIndex: 0,
      microCheckAnswers: {},
      completed: false,
      completedAt: null,
    };
  }

  const rawIndex = typeof savedProgress.currentStepIndex === 'number' ? savedProgress.currentStepIndex : 0;
  const safeIndex = Math.max(0, Math.min(total - 1, Math.floor(rawIndex)));
  const safeAnswers = savedProgress.microCheckAnswers && typeof savedProgress.microCheckAnswers === 'object'
    ? { ...savedProgress.microCheckAnswers }
    : {};

  return {
    currentStepIndex: safeIndex,
    microCheckAnswers: safeAnswers,
    completed: Boolean(savedProgress.completed),
    completedAt: savedProgress.completedAt || null,
  };
}

/**
 * Resolves the practice route URL for a given course and unit.
 *
 * @param {string} courseId - Course identifier (e.g. 'math')
 * @param {string} unitId - Unit identifier (e.g. 'add-subtract-fractions')
 * @returns {string} Route URL
 */
export function getLessonPracticeUrl(courseId = 'math', unitId = 'add-subtract-fractions') {
  const cleanCourse = String(courseId || 'math').trim();
  const cleanUnit = String(unitId || 'add-subtract-fractions').trim();
  return `/courses/${cleanCourse}/${cleanUnit}/practice`;
}

/**
 * Constructs a clean rulebook entry payload from a key-rule step definition.
 *
 * @param {object} step - The key-rule step object
 * @returns {object|null} Clean rulebook entry payload
 */
export function createRulebookPayload(step) {
  if (!step || typeof step !== 'object') return null;

  return {
    id: step.ruleId || step.id || 'rule:add-subtract-fractions',
    category: step.category || 'fractions',
    title: step.title || 'Adding and Subtracting Fractions',
    explanation: step.explanation || '',
    whenToUse: step.whenToUse || '',
    pitfall: step.pitfall || '',
  };
}
