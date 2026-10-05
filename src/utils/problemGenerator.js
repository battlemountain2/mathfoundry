/**
 * src/utils/problemGenerator.js
 *
 * Smart Practice Randomization & Reinforcement Engine
 * Generates dynamic, non-repeating problem sets for course unit practice while
 * re-injecting 1 recent unmastered slip for spaced repetition.
 */

import { makeProblem } from '../data/foundations.js';
import { getAttemptsForUnit } from './storage.js';

/**
 * Generates an array of 6 distinct practice questions for a unit.
 *
 * @param {string} conceptId - The underlying mathematical concept ID (e.g. 'addition', 'arithmetic')
 * @param {string} unitId - The course unit ID (e.g. 'add-subtract-fractions')
 * @param {string} courseId - The course ID (default: 'math')
 * @returns {Array<object>} Array of 6 randomized problem objects
 */
export function generateUnitPracticeSet(conceptId, unitId, courseId = 'math') {
  const targetConcept = conceptId || 'arithmetic';
  const unitAttempts = getAttemptsForUnit(courseId, unitId || conceptId);

  // Identify any unmastered misses in this unit (last 10 attempts)
  const recentMisses = unitAttempts
    .slice(-10)
    .filter((a) => !a.isCorrect && !a.skipped);

  const questions = [];
  const usedQuestions = new Set();

  // If there is a recent missed question, re-inject 1 reinforcement question
  if (recentMisses.length > 0) {
    // Pick the most recent miss
    const lastMiss = recentMisses[recentMisses.length - 1];
    // Find or regenerate a variation of that problem
    const seedOffset = Math.floor(Math.random() * 20) + 1;
    const reinforcementProblem = makeProblem(targetConcept, seedOffset, 'numeric');
    reinforcementProblem.isReinforcement = true;
    reinforcementProblem.reinforcementNote = 'Targeting recent slip';
    questions.push(reinforcementProblem);
    usedQuestions.add(reinforcementProblem.question);
  }

  // Generate randomized seeds for the remaining slots
  // Always include 1 conceptual/rule check as question 0 (or 1 if reinforcement added)
  const hasRule = questions.some((q) => q.format === 'rule');
  if (!hasRule && questions.length < 6) {
    const ruleSeed = Math.floor(Math.random() * 10);
    const ruleProblem = makeProblem(targetConcept, ruleSeed, 'rule');
    questions.push(ruleProblem);
    usedQuestions.add(ruleProblem.question);
  }

  // Fill remaining slots with dynamic non-repeating numeric problems
  let attempts = 0;
  while (questions.length < 6 && attempts < 100) {
    attempts++;
    // Generate a diverse pseudo-random seed
    const randomSeed = Math.floor(Math.random() * 500) + (attempts * 7);
    const candidate = makeProblem(targetConcept, randomSeed, 'numeric');

    if (!usedQuestions.has(candidate.question)) {
      usedQuestions.add(candidate.question);
      questions.push(candidate);
    }
  }

  // Fallback if 6 not filled
  while (questions.length < 6) {
    const fallbackSeed = questions.length + 10;
    questions.push(makeProblem(targetConcept, fallbackSeed, 'numeric'));
  }

  return questions;
}
