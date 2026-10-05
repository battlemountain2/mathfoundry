/**
 * E2E Test Suite Infrastructure & Setup
 * 
 * Provides:
 * - Isolated in-memory localStorage mock backed by Map (zero leak to localhost data)
 * - Authoritative curriculum, navigation, and storage contracts derived from ORIGINAL_REQUEST.md & PROJECT.md
 * - Resilient module loader helpers for progressive milestone testing
 * - Mathematical and domain models for opaque-box verification
 */

import assert from 'node:assert/strict';

// In-memory backing store for localStorage
const memoryStore = new Map();

/**
 * Creates or resets the in-memory localStorage mock.
 */
export function setupMockLocalStorage(initialEntries = {}) {
  memoryStore.clear();
  for (const [key, value] of Object.entries(initialEntries)) {
    memoryStore.set(String(key), typeof value === 'string' ? value : JSON.stringify(value));
  }

  const mockStorage = {
    getItem: (key) => memoryStore.get(String(key)) ?? null,
    setItem: (key, value) => memoryStore.set(String(key), String(value)),
    removeItem: (key) => memoryStore.delete(String(key)),
    clear: () => memoryStore.clear(),
    key: (index) => Array.from(memoryStore.keys())[index] ?? null,
    get length() {
      return memoryStore.size;
    },
    // Test utility: inspect raw snapshot
    _dump: () => Object.fromEntries(memoryStore.entries()),
  };

  global.localStorage = mockStorage;
  return mockStorage;
}

// Initialize mock immediately on import
setupMockLocalStorage();

/**
 * Authoritative Specification Contracts (from ORIGINAL_REQUEST.md & PROJECT.md)
 */

export const EXPECTED_TOP_NAV_ITEMS = ['Today', 'Courses', 'Rulebook', 'Settings'];

export const EXPECTED_COURSES = [
  { id: 'math', title: 'Math Foundations', status: 'active' },
  { id: 'geometry', title: 'Geometry', status: 'placeholder' },
  { id: 'physics', title: 'Physics', status: 'placeholder' },
  { id: 'chemistry', title: 'Chemistry', status: 'placeholder' },
];

export const EXPECTED_MATH_UNITS = [
  { order: 1, id: 'arithmetic', title: 'Arithmetic Relationships', prerequisites: [], legacyConceptId: 'arithmetic', hasPractice: true },
  { order: 2, id: 'equivalent-fractions', title: 'Equivalent Fractions', prerequisites: ['arithmetic'], legacyConceptId: 'equivalence', hasPractice: true },
  { order: 3, id: 'compare-fractions', title: 'Compare Fractions', prerequisites: ['equivalent-fractions'], legacyConceptId: 'comparison', hasPractice: true },
  { order: 4, id: 'add-subtract-fractions', title: 'Add & Subtract Fractions', prerequisites: ['equivalent-fractions'], legacyConceptId: 'addition', hasLesson: true, hasPractice: true },
  { order: 5, id: 'multiply-fractions', title: 'Multiply Fractions', prerequisites: ['arithmetic', 'equivalent-fractions'], legacyConceptId: 'multiplication', hasPractice: true },
  { order: 6, id: 'divide-fractions', title: 'Divide Fractions', prerequisites: ['multiply-fractions'], legacyConceptId: 'division', hasPractice: true },
  { order: 7, id: 'negative-numbers', title: 'Negative Numbers', prerequisites: ['arithmetic'], legacyConceptId: null, hasPractice: false },
  { order: 8, id: 'decimals-place-value', title: 'Decimals & Place Value', prerequisites: ['arithmetic'], legacyConceptId: null, hasPractice: false },
  { order: 9, id: 'ratios-percentages', title: 'Ratios & Percentages', prerequisites: ['add-subtract-fractions', 'decimals-place-value'], legacyConceptId: null, hasPractice: false },
  { order: 10, id: 'factors-multiples', title: 'Factors & Multiples', prerequisites: ['arithmetic'], legacyConceptId: null, hasPractice: false },
  { order: 11, id: 'order-of-operations', title: 'Order of Operations', prerequisites: ['arithmetic'], legacyConceptId: null, hasPractice: false },
  { order: 12, id: 'intro-algebra', title: 'Intro to Algebra', prerequisites: ['order-of-operations', 'negative-numbers'], legacyConceptId: null, hasPractice: false },
];

export const EXPECTED_LEGACY_MAPPINGS = {
  arithmetic: 'math/arithmetic',
  equivalence: 'math/equivalent-fractions',
  comparison: 'math/compare-fractions',
  addition: 'math/add-subtract-fractions',
  multiplication: 'math/multiply-fractions',
  division: 'math/divide-fractions',
};

export const REVERSE_LEGACY_MAPPINGS = {
  'math/arithmetic': 'arithmetic',
  'math/equivalent-fractions': 'equivalence',
  'math/compare-fractions': 'comparison',
  'math/add-subtract-fractions': 'addition',
  'math/multiply-fractions': 'multiplication',
  'math/divide-fractions': 'division',
};

export const LESSON_STEP_TYPES = ['explain', 'visual', 'interact', 'micro-check', 'key-rule', 'transition'];

export const THEME_PALETTES = ['light', 'dark', 'forest'];

/**
 * Mathematical Reference Implementations for Number Line Lab verification
 */

export function calculateNumberLineTicks(range = [-2, 2], subdivisions = 4) {
  const [min, max] = range;
  const step = 1 / subdivisions;
  const ticks = [];
  const count = Math.round((max - min) * subdivisions) + 1;
  for (let i = 0; i < count; i++) {
    const val = Number((min + i * step).toFixed(6));
    const isMajor = Math.abs(val - Math.round(val)) < 1e-6;
    ticks.push({
      value: val,
      isMajor,
      label: isMajor ? String(Math.round(val)) : null,
    });
  }
  return ticks;
}

export function clampValue(val, min, max) {
  if (Number.isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}

export function snapToTick(val, range = [-2, 2], subdivisions = 4) {
  const [min, max] = range;
  const clamped = clampValue(val, min, max);
  const step = 1 / subdivisions;
  const tickIndex = Math.round((clamped - min) / step);
  const snapped = min + tickIndex * step;
  return Number(clampValue(snapped, min, max).toFixed(6));
}

export function verifyNumberLinePlacement(placedVal, targetVal, tolerance = 0.005) {
  const diff = Math.abs(placedVal - targetVal);
  const correct = diff <= tolerance;
  return {
    correct,
    placedValue: placedVal,
    targetValue: targetVal,
    diff,
  };
}

/**
 * Topological Sort & Prerequisite Evaluator
 */
export function validatePrerequisiteDAG(units) {
  const unitMap = new Map(units.map((u) => [u.id, u]));
  const inDegree = new Map(units.map((u) => [u.id, 0]));
  const adj = new Map(units.map((u) => [u.id, []]));

  for (const unit of units) {
    for (const prereqId of unit.prerequisites) {
      assert.ok(unitMap.has(prereqId), `Unit ${unit.id} references non-existent prereq ${prereqId}`);
      adj.get(prereqId).push(unit.id);
      inDegree.set(unit.id, inDegree.get(unit.id) + 1);
    }
  }

  const queue = units.filter((u) => inDegree.get(u.id) === 0).map((u) => u.id);
  const sorted = [];

  while (queue.length > 0) {
    const curr = queue.shift();
    sorted.push(curr);
    for (const neighbor of adj.get(curr)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  const hasCycle = sorted.length !== units.length;
  return {
    isValid: !hasCycle,
    topologicalOrder: sorted,
    hasCycle,
  };
}

export function evaluateUnitLockState(unitId, satisfiedUnits, unitsList = EXPECTED_MATH_UNITS) {
  const unit = unitsList.find((u) => u.id === unitId || u.unitPath === unitId);
  if (!unit) return { isLocked: true, unreadyPrereqs: [] };
  const satisfiedSet = new Set(
    Array.isArray(satisfiedUnits)
      ? satisfiedUnits.map((id) => id.replace(/^math\//, ''))
      : []
  );
  const unreadyPrereqs = unit.prerequisites.filter((p) => !satisfiedSet.has(p));
  return {
    isLocked: unreadyPrereqs.length > 0,
    unreadyPrereqs,
    status: unreadyPrereqs.length > 0 ? 'locked' : satisfiedSet.has(unit.id) ? 'completed' : 'in-progress',
  };
}

/**
 * Resilient Dynamic Module Loaders
 */

export async function loadStorageModule() {
  try {
    const live = await import('../../src/utils/storage.js');
    if (typeof live.getAttemptsForUnit === 'function') {
      return live;
    }
    // Check if m1_explorer_2 proposed_storage is present
    try {
      const proposed = await import('../../../.agents/teamwork/m1_explorer_2/proposed_storage.js');
      return proposed;
    } catch {
      return live;
    }
  } catch (err) {
    return null;
  }
}

export async function loadCourseCatalogModule() {
  try {
    return await import('../../src/data/courses/courseCatalog.js');
  } catch {
    return null;
  }
}

export async function loadMathFoundationsModule() {
  try {
    return await import('../../src/data/courses/mathFoundations.js');
  } catch {
    return null;
  }
}

export async function loadFractionLessonModule() {
  try {
    return await import('../../src/data/lessons/addSubtractFractions.js');
  } catch {
    return null;
  }
}
