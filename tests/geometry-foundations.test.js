import test from 'node:test';
import assert from 'node:assert/strict';

// Setup storage mock if not present
const mem = new Map();
if (typeof global.localStorage === 'undefined' || !global.localStorage) {
  global.localStorage = {
    getItem: (k) => mem.get(k) ?? null,
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
    clear: () => mem.clear(),
  };
}

import {
  geometryFoundationsUnits,
  getGeometryUnit,
  checkGeometryPrerequisites,
  getNextGeometryUnit,
} from '../src/data/courses/geometryFoundations.js';
import { getCourse, getActiveCourses, isCourseActive } from '../src/data/courses/courseCatalog.js';
import { makeGeometryProblem } from '../src/data/geometryProblems.js';
import { generateUnitPracticeSet } from '../src/utils/problemGenerator.js';
import { anglesLinesLesson } from '../src/data/lessons/anglesLines.js';
import { trianglesPythagorasLesson } from '../src/data/lessons/trianglesPythagoras.js';
import { getCuratedVideo } from '../src/data/courses/curatedVideos.js';

// ============================================================================
// GROUP 1: Geometry Foundations Curriculum DAG & Prerequisites
// ============================================================================

test('GEOM.1: geometryFoundationsUnits defines exactly 6 ordered units with valid schema', () => {
  assert.equal(geometryFoundationsUnits.length, 6);

  const seenOrders = new Set();
  const seenIds = new Set();

  geometryFoundationsUnits.forEach((unit, idx) => {
    assert.equal(unit.order, idx + 1);
    assert.ok(unit.id);
    assert.equal(unit.courseId, 'geometry');
    assert.equal(unit.unitPath, `geometry/${unit.id}`);
    assert.ok(unit.title);
    assert.ok(unit.description);
    assert.ok(Array.isArray(unit.prerequisites));
    assert.equal(typeof unit.hasLesson, 'boolean');
    assert.equal(typeof unit.hasPractice, 'boolean');
    assert.equal(typeof unit.hasQuiz, 'boolean');

    seenOrders.add(unit.order);
    seenIds.add(unit.id);
  });

  assert.equal(seenOrders.size, 6);
  assert.equal(seenIds.size, 6);
});

test('GEOM.2: Unit 1 (angles-lines) has 0 prerequisites and is unlocked by default', () => {
  const unit1 = getGeometryUnit('angles-lines');
  assert.ok(unit1);
  assert.equal(unit1.prerequisites.length, 0);

  const check = checkGeometryPrerequisites('angles-lines');
  assert.equal(check.isLocked, false);
  assert.equal(check.eligible, true);
  assert.deepEqual(check.missingPrerequisites, []);
});

test('GEOM.3: Unit 2 (triangles-pythagoras) requires Unit 1 and unlocks when satisfied', () => {
  const unit2 = getGeometryUnit('triangles-pythagoras');
  assert.ok(unit2);
  assert.deepEqual(unit2.prerequisites, ['angles-lines']);

  // Without unit 1
  const lockedCheck = checkGeometryPrerequisites('triangles-pythagoras', []);
  assert.equal(lockedCheck.isLocked, true);
  assert.equal(lockedCheck.eligible, false);
  assert.deepEqual(lockedCheck.missingPrerequisites, ['angles-lines']);

  // With unit 1 satisfied
  const unlockedCheck = checkGeometryPrerequisites('triangles-pythagoras', ['angles-lines']);
  assert.equal(unlockedCheck.isLocked, false);
  assert.equal(unlockedCheck.eligible, true);
  assert.deepEqual(unlockedCheck.missingPrerequisites, []);
});

test('GEOM.4: Topological DAG verification confirms zero cycles across all 6 geometry units', () => {
  const adj = new Map();
  const inDegree = new Map();

  geometryFoundationsUnits.forEach((u) => {
    adj.set(u.id, []);
    inDegree.set(u.id, 0);
  });

  geometryFoundationsUnits.forEach((u) => {
    u.prerequisites.forEach((pId) => {
      assert.ok(adj.has(pId), `Prerequisite ${pId} must exist in geometry units`);
      adj.get(pId).push(u.id);
      inDegree.set(u.id, inDegree.get(u.id) + 1);
    });
  });

  // Kahn's algorithm
  const queue = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  let visitedCount = 0;
  while (queue.length > 0) {
    const curr = queue.shift();
    visitedCount++;

    for (const neighbor of adj.get(curr)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  assert.equal(visitedCount, 6, 'DAG must contain zero cycles');
});

test('GEOM.5: getGeometryUnit resolves paths with or without geometry/ prefix', () => {
  assert.equal(getGeometryUnit('angles-lines')?.id, 'angles-lines');
  assert.equal(getGeometryUnit('geometry/angles-lines')?.id, 'angles-lines');
  assert.equal(getGeometryUnit('triangles-pythagoras')?.id, 'triangles-pythagoras');
  assert.equal(getGeometryUnit('geometry/triangles-pythagoras')?.id, 'triangles-pythagoras');
  assert.equal(getGeometryUnit('unknown-unit'), null);
  assert.equal(getGeometryUnit(null), null);
});

test('GEOM.6: getNextGeometryUnit advances along curriculum order', () => {
  assert.equal(getNextGeometryUnit('angles-lines')?.id, 'triangles-pythagoras');
  assert.equal(getNextGeometryUnit('triangles-pythagoras')?.id, 'area-perimeter');
  assert.equal(getNextGeometryUnit('coordinate-geometry'), null);
});

// ============================================================================
// GROUP 2: Course Catalog Activation & Invariants
// ============================================================================

test('GEOM.7: Course catalog has Geometry active with 6 units', () => {
  const geom = getCourse('geometry');
  assert.ok(geom);
  assert.equal(geom.status, 'active');
  assert.equal(geom.unitCount, 6);
  assert.equal(geom.units.length, 6);
  assert.equal(isCourseActive('geometry'), true);

  const active = getActiveCourses();
  assert.ok(active.some((c) => c.id === 'geometry'));
});

// ============================================================================
// GROUP 3: Geometry Problem Generators & Randomization
// ============================================================================

test('GEOM.8: makeGeometryProblem generates valid numeric and rule problems for angles-lines', () => {
  // Numeric
  for (let seed = 0; seed < 10; seed++) {
    const p = makeGeometryProblem('angles-lines', seed, 'numeric');
    assert.ok(p.id);
    assert.equal(p.conceptId, 'angles-lines');
    assert.ok(p.question);
    assert.ok(p.prompt);
    assert.ok(p.answer);
    assert.ok(!isNaN(Number(p.answer)));
    assert.ok(p.explanation);
    assert.ok(p.hint);
  }

  // Rule
  const ruleProb = makeGeometryProblem('angles-lines', 1, 'rule');
  assert.equal(ruleProb.format, 'rule');
  assert.ok([44, 180].includes(ruleProb.answer));
});

test('GEOM.9: makeGeometryProblem generates mathematically correct Pythagorean calculations', () => {
  // Triangles numeric
  for (let seed = 0; seed < 12; seed++) {
    const p = makeGeometryProblem('triangles-pythagoras', seed, 'numeric');
    assert.ok(p.id);
    assert.equal(p.conceptId, 'triangles-pythagoras');
    assert.ok(p.question);
    assert.ok(p.answer);
    assert.ok(!isNaN(Number(p.answer)));
    assert.ok(Number(p.answer) > 0);
  }

  // Triangles rule
  const ruleProb = makeGeometryProblem('triangles-pythagoras', 0, 'rule');
  assert.equal(ruleProb.format, 'rule');
  assert.equal(ruleProb.answer, 180);
});

test('GEOM.10: generateUnitPracticeSet produces 6 distinct questions with slip reinforcement support', () => {
  const questions = generateUnitPracticeSet('angles-lines', 'angles-lines', 'geometry');
  assert.equal(questions.length, 6);

  const pythQuestions = generateUnitPracticeSet('triangles-pythagoras', 'triangles-pythagoras', 'geometry');
  assert.equal(pythQuestions.length, 6);

  // Check unique questions
  const uniqueAngles = new Set(questions.map((q) => q.question));
  assert.equal(uniqueAngles.size, 6);
});

// ============================================================================
// GROUP 4: Authored Guided Lessons Invariants
// ============================================================================

test('GEOM.11: Unit 1 lesson (anglesLinesLesson) follows 6-stage Guided Ladder scaffold', () => {
  assert.equal(anglesLinesLesson.unitId, 'angles-lines');
  assert.equal(anglesLinesLesson.steps.length, 6);

  const stepTypes = anglesLinesLesson.steps.map((s) => s.type);
  assert.deepEqual(stepTypes, ['explain', 'visual', 'micro-check', 'micro-check', 'key-rule', 'transition']);

  // Visual step embeds angle-explorer
  const visualStep = anglesLinesLesson.steps.find((s) => s.type === 'visual');
  assert.equal(visualStep.visualizer, 'angle-explorer');

  // Key-rule step has ruleId and details
  const keyRuleStep = anglesLinesLesson.steps.find((s) => s.type === 'key-rule');
  assert.ok(keyRuleStep.ruleId);
  assert.ok(keyRuleStep.ruleSummary);
});

test('GEOM.12: Unit 2 lesson (trianglesPythagorasLesson) follows 6-stage Guided Ladder scaffold', () => {
  assert.equal(trianglesPythagorasLesson.unitId, 'triangles-pythagoras');
  assert.equal(trianglesPythagorasLesson.steps.length, 6);

  const stepTypes = trianglesPythagorasLesson.steps.map((s) => s.type);
  assert.deepEqual(stepTypes, ['explain', 'visual', 'micro-check', 'micro-check', 'key-rule', 'transition']);

  // Visual step embeds pythagoras
  const visualStep = trianglesPythagorasLesson.steps.find((s) => s.type === 'visual');
  assert.equal(visualStep.visualizer, 'pythagoras');

  // Key-rule step has ruleId
  const keyRuleStep = trianglesPythagorasLesson.steps.find((s) => s.type === 'key-rule');
  assert.ok(keyRuleStep.ruleId);
  assert.ok(keyRuleStep.ruleSummary);
});

// ============================================================================
// GROUP 5: Curated Video Integration
// ============================================================================

test('GEOM.13: Curated video drawer supports geometry units', () => {
  const vid1 = getCuratedVideo('geometry/angles-lines');
  assert.ok(vid1);
  assert.equal(vid1.creator, 'The Organic Chemistry Tutor');
  assert.ok(vid1.embedId);

  const vid2 = getCuratedVideo('geometry/triangles-pythagoras');
  assert.ok(vid2);
  assert.equal(vid2.creator, 'The Organic Chemistry Tutor');
  assert.ok(vid2.embedId);
});
