/**
 * Course Catalog (Milestone 1)
 *
 * Defines top-level courses available in MathFoundry.
 * Math Foundations is active; Geometry, Physics, and Chemistry
 * are structured placeholders for future phases.
 */

import { mathFoundationsUnits } from './mathFoundations.js';
import { geometryFoundationsUnits } from './geometryFoundations.js';

export const courseCatalog = [
  {
    id: 'math',
    slug: 'math',
    title: 'Math Foundations',
    subtitle: 'Core numerical intuition & rational operations',
    description: 'Master the fundamental building blocks of mathematical thinking: operations, fraction arithmetic, decimals, ratios, and introductory symbolic algebra.',
    icon: '🧮',
    category: 'mathematics',
    status: 'active',
    unitCount: mathFoundationsUnits.length,
    path: '/courses/math',
    units: mathFoundationsUnits,
    accentColor: 'indigo',
    badge: '12 Units',
    estimatedHours: 6,
  },
  {
    id: 'geometry',
    slug: 'geometry',
    title: 'Geometry Foundations',
    subtitle: 'Shapes, spatial reasoning & measurement',
    description: 'Explore angles, triangles, polygons, coordinate systems, perimeter, area, and physical spatial relationships essential for visual engineering.',
    icon: '📐',
    category: 'mathematics',
    status: 'active',
    unitCount: geometryFoundationsUnits.length,
    path: '/courses/geometry',
    units: geometryFoundationsUnits,
    accentColor: 'emerald',
    badge: '6 Units',
    estimatedHours: 5,
  },
  {
    id: 'physics',
    slug: 'physics',
    title: 'Physics',
    subtitle: 'Mechanics, kinematics & physical conservation',
    description: 'Build intuition for kinematics, Newton’s laws of motion, work, energy, momentum, and physical problem-solving models.',
    icon: '⚡',
    category: 'science',
    status: 'placeholder',
    unitCount: 0,
    path: '/courses/physics',
    units: [],
    accentColor: 'amber',
    badge: 'Coming Soon',
    estimatedHours: 6,
  },
  {
    id: 'chemistry',
    slug: 'chemistry',
    title: 'Chemistry',
    subtitle: 'Matter, atomic structure & reactions',
    description: 'Understand atomic structure, periodic trends, chemical bonding, stoichiometry, and energy transformations.',
    icon: '🧪',
    category: 'science',
    status: 'placeholder',
    unitCount: 0,
    path: '/courses/chemistry',
    units: [],
    accentColor: 'rose',
    badge: 'Coming Soon',
    estimatedHours: 6,
  },
];

/**
 * Backward compatibility alias
 */
export const courses = courseCatalog;

/**
 * Get all courses in the catalog.
 * @returns {Array<object>}
 */
export function getCourses() {
  return courseCatalog;
}

/**
 * Retrieve a specific course by ID.
 * @param {string} courseId - 'math', 'geometry', 'physics', or 'chemistry'
 * @returns {object|null}
 */
export function getCourse(courseId) {
  if (!courseId) return null;
  return courseCatalog.find((c) => c.id === courseId) || null;
}

/**
 * Retrieve active functional courses.
 * @returns {Array<object>}
 */
export function getActiveCourses() {
  return courseCatalog.filter((c) => c.status === 'active');
}

/**
 * Check if a course is functional and ready for study.
 * @param {string} courseId
 * @returns {boolean}
 */
export function isCourseActive(courseId) {
  const course = getCourse(courseId);
  return course ? course.status === 'active' : false;
}
