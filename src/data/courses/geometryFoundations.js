/**
 * src/data/courses/geometryFoundations.js
 *
 * Geometry Foundations Curriculum Definition & Prerequisite DAG
 * Prepares the learner for Calculus 1, Physics mechanics, and spatial engineering analysis.
 */

export const geometryFoundationsUnits = [
  {
    order: 1,
    id: 'angles-lines',
    courseId: 'geometry',
    unitPath: 'geometry/angles-lines',
    title: 'Angles & Lines',
    description: 'Explore angles, transversals, and parallel line relationships with live visual models.',
    prerequisites: [],
    hasLesson: true,
    hasLab: true,
    labType: 'angle-explorer',
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '📐',
  },
  {
    order: 2,
    id: 'triangles-pythagoras',
    courseId: 'geometry',
    unitPath: 'geometry/triangles-pythagoras',
    title: 'Triangles & The Pythagorean Theorem',
    description: 'Master right triangles, square-tile area proofs, and the fundamental theorem of distance.',
    prerequisites: ['angles-lines'],
    hasLesson: true,
    hasLab: true,
    labType: 'pythagoras',
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 30,
    icon: '🔺',
  },
  {
    order: 3,
    id: 'area-perimeter',
    courseId: 'geometry',
    unitPath: 'geometry/area-perimeter',
    title: 'Area & Composite Shapes',
    description: 'Decompose complex engineering cross-sections into basic triangles and rectangles.',
    prerequisites: ['triangles-pythagoras'],
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '⬛',
  },
  {
    order: 4,
    id: 'circles-radians',
    courseId: 'geometry',
    unitPath: 'geometry/circles-radians',
    title: 'Circles & Radian Intuition',
    description: 'Unwrap circular paths into radius lengths to prepare for angular velocity and trigonometry.',
    prerequisites: ['area-perimeter'],
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 25,
    icon: '⭕',
  },
  {
    order: 5,
    id: 'volume-surface-area',
    courseId: 'geometry',
    unitPath: 'geometry/volume-surface-area',
    title: '3D Volume & Surface Area',
    description: 'Calculate capacities and boundary areas of prisms, cylinders, tanks, and spherical shells.',
    prerequisites: ['area-perimeter'],
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 30,
    icon: '📦',
  },
  {
    order: 6,
    id: 'coordinate-geometry',
    courseId: 'geometry',
    unitPath: 'geometry/coordinate-geometry',
    title: 'Coordinate Geometry & Slope',
    description: 'Bridge geometric lines with Cartesian coordinates (distance, midpoint, slope as rate of change).',
    prerequisites: ['triangles-pythagoras'],
    hasLesson: false,
    hasLab: false,
    labType: null,
    hasPractice: true,
    hasQuiz: true,
    estimatedMinutes: 35,
    icon: '📈',
  },
];

export function getGeometryUnit(identifier) {
  if (!identifier || typeof identifier !== 'string') return null;
  const clean = identifier.replace(/^geometry\//, '').trim();
  return (
    geometryFoundationsUnits.find((u) => u.id === clean || u.unitPath === identifier) ||
    null
  );
}

export function checkGeometryPrerequisites(unitId, satisfiedUnitIds = new Set()) {
  const unit = getGeometryUnit(unitId);
  if (!unit) {
    return { isLocked: true, missingPrerequisites: [], eligible: false };
  }

  if (unit.prerequisites.length === 0) {
    return { isLocked: false, missingPrerequisites: [], eligible: true };
  }

  const satisfied = satisfiedUnitIds instanceof Set ? satisfiedUnitIds : new Set(satisfiedUnitIds);
  const missing = unit.prerequisites.filter((p) => !satisfied.has(p));

  return {
    isLocked: missing.length > 0,
    missingPrerequisites: missing,
    eligible: missing.length === 0,
  };
}

export function getNextGeometryUnit(currentUnitId) {
  const unit = getGeometryUnit(currentUnitId);
  if (!unit) return geometryFoundationsUnits[0];
  const next = geometryFoundationsUnits.find((u) => u.order === unit.order + 1);
  return next || null;
}
