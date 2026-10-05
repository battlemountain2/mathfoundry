/**
 * Math Foundations Course Definition (Milestone 1)
 *
 * 12-unit Khan Academy-style curriculum for MathFoundry.
 * Encapsulates the prerequisite directed acyclic graph (DAG),
 * unit capabilities (lessons, labs, practice, quizzes),
 * and legacy concept mapping for non-destructive data migration.
 */

export const MATH_COURSE_ID = 'math';
export const MATH_COURSE_TITLE = 'Math Foundations';

/**
 * The 12 units of the Math Foundations course in pedagogical sequence.
 * Prerequisite DAG guarantees topological ordering.
 */
export const mathFoundationsUnits = [
  {
    order: 1,
    id: 'arithmetic',
    courseId: 'math',
    unitPath: 'math/arithmetic',
    title: 'Arithmetic Relationships',
    description: 'Use the four operations and decomposition with paper or mentally.',
    prerequisites: [],
    legacyConceptId: 'arithmetic',
    hasLesson: true,
    hasLab: false,
    labType: null,
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 20,
    icon: '➕',
  },
  {
    order: 2,
    id: 'equivalent-fractions',
    courseId: 'math',
    unitPath: 'math/equivalent-fractions',
    title: 'Equivalent Fractions',
    description: 'Change the parts without changing the amount.',
    prerequisites: ['arithmetic'],
    legacyConceptId: 'equivalence',
    hasLesson: false,
    hasLab: true,
    labType: 'fraction-bars',
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '🍰',
  },
  {
    order: 3,
    id: 'compare-fractions',
    courseId: 'math',
    unitPath: 'math/compare-fractions',
    title: 'Compare Fractions',
    description: 'Reason about size before doing a calculation.',
    prerequisites: ['equivalent-fractions'],
    legacyConceptId: 'comparison',
    hasLesson: false,
    hasLab: true,
    labType: 'number-line',
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '⚖️',
  },
  {
    order: 4,
    id: 'add-subtract-fractions',
    courseId: 'math',
    unitPath: 'math/add-subtract-fractions',
    title: 'Add & Subtract Fractions',
    description: 'Use equal-sized parts, then combine them.',
    prerequisites: ['equivalent-fractions'],
    legacyConceptId: 'addition',
    hasLesson: true, // Authored 8-step Brilliant-style lesson (R1)
    hasLab: true,
    labType: 'fraction-bars',
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 30,
    icon: '➕',
  },
  {
    order: 5,
    id: 'multiply-fractions',
    courseId: 'math',
    unitPath: 'math/multiply-fractions',
    title: 'Multiply Fractions',
    description: 'Find a fraction of a fraction.',
    prerequisites: ['arithmetic', 'equivalent-fractions'],
    legacyConceptId: 'multiplication',
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '✖️',
  },
  {
    order: 6,
    id: 'divide-fractions',
    courseId: 'math',
    unitPath: 'math/divide-fractions',
    title: 'Divide Fractions',
    description: 'Count how many groups fit into an amount.',
    prerequisites: ['multiply-fractions'],
    legacyConceptId: 'division',
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '➗',
  },
  {
    order: 7,
    id: 'negative-numbers',
    courseId: 'math',
    unitPath: 'math/negative-numbers',
    title: 'Negative Numbers',
    description: 'Understand signed values, direction on the number line, and operations with negative quantities.',
    prerequisites: ['arithmetic'],
    legacyConceptId: null,
    hasLesson: false,
    hasLab: true,
    labType: 'number-line',
    hasPractice: false,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '➖',
  },
  {
    order: 8,
    id: 'decimals-place-value',
    courseId: 'math',
    unitPath: 'math/decimals-place-value',
    title: 'Decimals & Place Value',
    description: 'Connect fractional parts to base-10 positional notation and metric measurement.',
    prerequisites: ['arithmetic'],
    legacyConceptId: null,
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: false,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '0️⃣',
  },
  {
    order: 9,
    id: 'ratios-percentages',
    courseId: 'math',
    unitPath: 'math/ratios-percentages',
    title: 'Ratios & Percentages',
    description: 'Scale quantities proportionally, compare parts to wholes, and interpret percent as hundredths.',
    prerequisites: ['add-subtract-fractions', 'decimals-place-value'],
    legacyConceptId: null,
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: false,
    hasQuiz: true,
    estimatedMinutes: 30,
    icon: '％',
  },
  {
    order: 10,
    id: 'factors-multiples',
    courseId: 'math',
    unitPath: 'math/factors-multiples',
    title: 'Factors & Multiples',
    description: 'Deconstruct numbers into prime factors, greatest common divisors, and least common multiples.',
    prerequisites: ['arithmetic'],
    legacyConceptId: null,
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: false,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '🔢',
  },
  {
    order: 11,
    id: 'order-of-operations',
    courseId: 'math',
    unitPath: 'math/order-of-operations',
    title: 'Order of Operations',
    description: 'Resolve expressions reliably with grouping, exponentiation, and operational precedence.',
    prerequisites: ['arithmetic'],
    legacyConceptId: null,
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: false,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '📋',
  },
  {
    order: 12,
    id: 'intro-algebra',
    courseId: 'math',
    unitPath: 'math/intro-algebra',
    title: 'Intro to Algebra',
    description: 'Transition from arithmetic to symbolic representation, balancing equations, and solving for unknowns.',
    prerequisites: ['order-of-operations', 'negative-numbers'],
    legacyConceptId: null,
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: false,
    hasQuiz: true,
    estimatedMinutes: 30,
    icon: '𝑥',
  },
];

/**
 * Retrieve a unit by unitId, unitPath, or legacyConceptId.
 *
 * @param {string} unitId - e.g. 'arithmetic', 'math/arithmetic', or 'addition'
 * @returns {object|null} The unit definition object or null if not found
 */
export function getMathUnit(unitId) {
  if (!unitId || typeof unitId !== 'string') return null;
  const clean = unitId.trim();
  const cleanId = clean.replace(/^math\//, '');

  return (
    mathFoundationsUnits.find(
      (u) => u.id === cleanId || u.unitPath === clean || (u.legacyConceptId && u.legacyConceptId === cleanId)
    ) || null
  );
}

/**
 * Evaluate whether all prerequisites for a unit are satisfied.
 *
 * @param {string} unitId - The target unit ID or path
 * @param {Array<string>|Set<string>} satisfiedUnitIds - Set or array of satisfied unit IDs or paths
 * @returns {{ eligible: boolean, isLocked: boolean, missingPrerequisites: Array<string>, prerequisites: Array<string>, unit: object|null }}
 */
export function checkUnitPrerequisites(unitId, satisfiedUnitIds = []) {
  const unit = getMathUnit(unitId);
  if (!unit) {
    return {
      eligible: false,
      isLocked: true,
      missingPrerequisites: [],
      prerequisites: [],
      unit: null,
    };
  }

  if (!unit.prerequisites || unit.prerequisites.length === 0) {
    return {
      eligible: true,
      isLocked: false,
      missingPrerequisites: [],
      prerequisites: [],
      unit,
    };
  }

  // Build normalized set of satisfied IDs
  const satisfiedSet = new Set();
  const inputList = Array.isArray(satisfiedUnitIds)
    ? satisfiedUnitIds
    : satisfiedUnitIds instanceof Set
      ? Array.from(satisfiedUnitIds)
      : [];

  for (const id of inputList) {
    if (typeof id === 'string') {
      const stripped = id.trim().replace(/^math\//, '');
      satisfiedSet.add(stripped);
      satisfiedSet.add(`math/${stripped}`);
      const foundUnit = getMathUnit(stripped);
      if (foundUnit) {
        satisfiedSet.add(foundUnit.id);
        if (foundUnit.legacyConceptId) {
          satisfiedSet.add(foundUnit.legacyConceptId);
        }
      }
    }
  }

  const missingPrerequisites = unit.prerequisites.filter((prereqId) => !satisfiedSet.has(prereqId));

  return {
    eligible: missingPrerequisites.length === 0,
    isLocked: missingPrerequisites.length > 0,
    missingPrerequisites,
    prerequisites: [...unit.prerequisites],
    unit,
  };
}

/**
 * Get the next sequential unit in the course.
 *
 * @param {string} currentUnitId
 * @returns {object|null} Next unit or null if at end
 */
export function getNextMathUnit(currentUnitId) {
  const current = getMathUnit(currentUnitId);
  if (!current) return null;
  return mathFoundationsUnits.find((u) => u.order === current.order + 1) || null;
}

/**
 * Get the previous sequential unit in the course.
 *
 * @param {string} currentUnitId
 * @returns {object|null} Previous unit or null if at start
 */
export function getPreviousMathUnit(currentUnitId) {
  const current = getMathUnit(currentUnitId);
  if (!current) return null;
  return mathFoundationsUnits.find((u) => u.order === current.order - 1) || null;
}

/**
 * Retrieve all downstream units that directly depend on a given unit.
 *
 * @param {string} unitId
 * @returns {Array<object>} Downstream units
 */
export function getDownstreamMathUnits(unitId) {
  const unit = getMathUnit(unitId);
  if (!unit) return [];
  return mathFoundationsUnits.filter((u) => u.prerequisites.includes(unit.id));
}

/**
 * Recursively collect all upstream prerequisites (transitive closure) for a unit.
 *
 * @param {string} unitId
 * @returns {Array<string>} All recursive prerequisite unit IDs
 */
export function getTransitivePrerequisites(unitId) {
  const unit = getMathUnit(unitId);
  if (!unit) return [];

  const visited = new Set();
  function traverse(currentId) {
    const target = getMathUnit(currentId);
    if (!target) return;
    for (const pId of target.prerequisites) {
      if (!visited.has(pId)) {
        visited.add(pId);
        traverse(pId);
      }
    }
  }
  traverse(unit.id);
  return Array.from(visited);
}
