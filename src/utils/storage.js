import { defaultRulebookEntries } from '../data/rulebookData.js';
import { getMathUnit } from '../data/courses/mathFoundations.js';
import { triggerBackgroundAutoSync } from './githubSync.js';

const STORAGE_KEY = 'mathfoundry_data';
const listeners = new Set();
export function subscribeStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function notify() { listeners.forEach(listener => listener()); }
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (!event.key || event.key === STORAGE_KEY) notify();
});
function isRecord(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) throw new Error('Invalid learning data');
    return parsed;
  } catch {
    // Reads remain usable, but writes must not overwrite the original.
    return {};
  }
}
function setStore(data) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      if (!isRecord(JSON.parse(raw))) throw new Error();
    } catch { throw new Error('Your saved data could not be read. Download a backup in Settings before recovering it. Nothing was overwritten.'); }
    if (!localStorage.getItem('mathfoundry_data_before_v2')) {
      localStorage.setItem('mathfoundry_data_before_v2', raw);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, schemaVersion: 2 }));
  notify();
  if (typeof window !== 'undefined') {
    triggerBackgroundAutoSync();
  }
}

// ============================================================================
// Bidirectional Mapping Constants & Helpers (Requirement R4)
// ============================================================================

export const CONCEPT_TO_UNIT_PATH = {
  arithmetic: 'math/arithmetic',
  equivalence: 'math/equivalent-fractions',
  comparison: 'math/compare-fractions',
  addition: 'math/add-subtract-fractions',
  multiplication: 'math/multiply-fractions',
  division: 'math/divide-fractions',
};

export const UNIT_PATH_TO_CONCEPT = {
  'math/arithmetic': 'arithmetic',
  'math/equivalent-fractions': 'equivalence',
  'math/compare-fractions': 'comparison',
  'math/add-subtract-fractions': 'addition',
  'math/multiply-fractions': 'multiplication',
  'math/divide-fractions': 'division',
};

export const UNIT_ID_TO_CONCEPT = {
  'arithmetic': 'arithmetic',
  'equivalent-fractions': 'equivalence',
  'compare-fractions': 'comparison',
  'add-subtract-fractions': 'addition',
  'multiply-fractions': 'multiplication',
  'divide-fractions': 'division',
};

export const CONCEPT_TO_UNIT_ID = {
  'arithmetic': 'arithmetic',
  'equivalence': 'equivalent-fractions',
  'comparison': 'compare-fractions',
  'addition': 'add-subtract-fractions',
  'multiplication': 'multiply-fractions',
  'division': 'divide-fractions',
};

/**
 * Resolves any conceptId, unitId, or unitPath to its canonical unitPath ('math/...').
 */
export function toUnitPath(identifier) {
  if (!identifier || typeof identifier !== 'string') return null;
  const trimmed = identifier.trim();
  if (!trimmed) return null;
  if (CONCEPT_TO_UNIT_PATH[trimmed]) return CONCEPT_TO_UNIT_PATH[trimmed];
  if (trimmed.includes('/')) {
    const [coursePart, unitPart] = trimmed.split('/');
    if (coursePart === 'math' && CONCEPT_TO_UNIT_PATH[unitPart]) {
      return CONCEPT_TO_UNIT_PATH[unitPart];
    }
    return trimmed;
  }
  return `math/${trimmed}`;
}

/**
 * Resolves a unitPath or unitId to its legacy conceptId if one exists.
 */
export function toConceptId(identifier) {
  if (!identifier || typeof identifier !== 'string') return null;
  const trimmed = identifier.trim();
  if (!trimmed) return null;
  if (UNIT_PATH_TO_CONCEPT[trimmed]) return UNIT_PATH_TO_CONCEPT[trimmed];
  if (UNIT_ID_TO_CONCEPT[trimmed]) return UNIT_ID_TO_CONCEPT[trimmed];
  if (trimmed.includes('/')) {
    const unitPart = trimmed.split('/')[1];
    if (UNIT_ID_TO_CONCEPT[unitPart]) return UNIT_ID_TO_CONCEPT[unitPart];
    return unitPart || trimmed;
  }
  return trimmed;
}

/**
 * Virtualizes an attempt object to guarantee access via both legacy and new properties
 * without mutating raw localStorage records.
 */
export function normalizeAttempt(attempt) {
  if (!attempt || typeof attempt !== 'object') return null;

  const rawConcept = attempt.conceptId;
  const rawUnitId = attempt.unitId || attempt.moduleId;
  const rawUnitPath = attempt.unitPath;

  const unitPath =
    (rawUnitPath && toUnitPath(rawUnitPath)) ||
    (rawConcept && CONCEPT_TO_UNIT_PATH[rawConcept]) ||
    (rawUnitId && CONCEPT_TO_UNIT_PATH[rawUnitId]) ||
    toUnitPath(rawUnitPath || rawConcept || rawUnitId) ||
    null;

  const unitId =
    (rawConcept && CONCEPT_TO_UNIT_ID[rawConcept]) ||
    (rawUnitId && CONCEPT_TO_UNIT_ID[rawUnitId]) ||
    (attempt.unitId && CONCEPT_TO_UNIT_ID[attempt.unitId]) ||
    (unitPath && unitPath.includes('/') ? unitPath.split('/')[1] : null) ||
    attempt.unitId ||
    rawUnitId ||
    null;

  const conceptId =
    rawConcept ||
    (rawUnitId && UNIT_ID_TO_CONCEPT[rawUnitId]) ||
    (unitId && UNIT_ID_TO_CONCEPT[unitId]) ||
    (unitPath && toConceptId(unitPath)) ||
    (rawUnitId && toConceptId(rawUnitId)) ||
    unitId ||
    null;

  return {
    ...attempt,
    conceptId,
    unitId,
    unitPath,
  };
}

/**
 * Retrieve all attempts associated with a given unit, resolving both historical concept IDs
 * and newly formatted unit attempts across learningAttempts, practiceHistory, and reviewHistory.
 */
export function getAttemptsForUnit(courseIdOrPath, maybeUnitId) {
  let courseId = courseIdOrPath;
  let unitId = maybeUnitId;

  if (typeof courseIdOrPath === 'string' && courseIdOrPath.includes('/')) {
    const parts = courseIdOrPath.split('/');
    courseId = parts[0];
    unitId = parts.slice(1).join('/');
  } else if (!unitId && typeof courseIdOrPath === 'string') {
    courseId = 'math';
    unitId = courseIdOrPath;
  }

  if (!unitId || typeof unitId !== 'string') return [];

  const targetPath = `${courseId}/${unitId}`;
  const legacyConcept = UNIT_ID_TO_CONCEPT[unitId] || null;
  const allAttempts = getAllLearningAttempts();

  return allAttempts
    .map(normalizeAttempt)
    .filter((a) => {
      if (!a) return false;
      return (
        a.unitPath === targetPath ||
        a.unitId === unitId ||
        (legacyConcept && (a.conceptId === legacyConcept || a.moduleId === legacyConcept)) ||
        a.moduleId === unitId
      );
    });
}

// ============================================================================
// Core Export & Progress APIs
// ============================================================================

export function exportLearningData() {
  const store = getStore();
  const settings = { ...getSettings() };
  delete settings.aiApiKey;
  return JSON.stringify({ ...store, settings, exportedAt: new Date().toISOString() }, null, 2);
}
export function exportRawData() { return localStorage.getItem(STORAGE_KEY) || '{}'; }
export function getProgress() {
  const store = getStore();
  return isRecord(store.progress) ? store.progress : {};
}

export function setModuleProgress(moduleId, data) {
  const store = getStore();
  if (!store.progress) store.progress = {};
  store.progress[moduleId] = {
    ...store.progress[moduleId],
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  setStore(store);
  return store.progress;
}

export function getDiagnosticResults() {
  const store = getStore();
  return isRecord(store.diagnostic) ? store.diagnostic : null;
}

export function setDiagnosticResults(results) {
  const store = getStore();
  store.diagnostic = {
    ...results,
    completedAt: new Date().toISOString(),
  };
  setStore(store);
}

export function getStreak() {
  const store = getStore();
  const streak = store.streak || { current: 0, best: 0, lastDate: null };
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDay(yesterdayDate);
  return { ...streak, current: [localDay(), yesterday].includes(streak.lastDate) ? streak.current : 0 };
}

function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function activityStreak(store) {
  const old = isRecord(store.streak) ? store.streak : { current: 0, best: 0, lastDate: null };
  const today = localDay();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  if (old.lastDate === today) return old;
  const current = old.lastDate === localDay(yesterdayDate) ? old.current + 1 : 1;
  return { current, best: Math.max(old.best || 0, current), lastDate: today };
}

export function updateStreak() {
  const store = getStore();
  const streak = activityStreak(store);
  setStore({ ...store, streak });
  return streak;
}

export function getSettings() {
  const store = getStore();
  return isRecord(store.settings) ? store.settings : { theme: 'light', fontSize: 'medium' };
}

export function setSettings(settings) {
  const store = getStore();
  store.settings = { ...store.settings, ...settings };
  setStore(store);
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('mathfoundry_data_before_v2');
  notify();
}

export function getPracticeHistory() {
  const store = getStore();
  return Array.isArray(store.practiceHistory) ? store.practiceHistory : [];
}

export function addPracticeSession(session) {
  const store = getStore();
  if (!store.practiceHistory) store.practiceHistory = [];
  store.practiceHistory.push({ ...session, timestamp: new Date().toISOString() });
  setStore(store);
}

export function getMastery() {
  const store = getStore();
  return isRecord(store.mastery) ? store.mastery : {};
}

export function updateMastery(moduleId, correct, total) {
  const store = getStore();
  if (!store.mastery) store.mastery = {};
  const prev = store.mastery[moduleId] || { correct: 0, total: 0 };
  store.mastery[moduleId] = {
    correct: prev.correct + correct,
    total: prev.total + total,
  };
  setStore(store);
}

export function getFormatPerformance() {
  const store = getStore();
  return isRecord(store.formatPerformance) ? store.formatPerformance : {};
}

export function updateFormatPerformance(format, correct, total) {
  const store = getStore();
  if (!store.formatPerformance) store.formatPerformance = {};
  const prev = store.formatPerformance[format] || { correct: 0, total: 0 };
  store.formatPerformance[format] = {
    correct: prev.correct + correct,
    total: prev.total + total,
  };
  setStore(store);
}

export function getRecentMistakes() {
  const store = getStore();
  return Array.isArray(store.recentMistakes) ? store.recentMistakes : [];
}

export function addMistake(mistake) {
  const store = getStore();
  if (!store.recentMistakes) store.recentMistakes = [];
  store.recentMistakes.unshift({ ...mistake, timestamp: new Date().toISOString() });
  if (store.recentMistakes.length > 20) {
    store.recentMistakes = store.recentMistakes.slice(0, 20);
  }
  setStore(store);
}

export function accuracy(record) {
  return record?.total > 0 ? Math.round(record.correct / record.total * 100) : null;
}

// One atomic, idempotent write: replaying a completed session changes nothing.
export function savePracticeSession(session) {
  if (!session.id) throw new Error('A session ID is required');
  const store = getStore();
  const history = Array.isArray(store.practiceHistory) ? store.practiceHistory : [];
  if (history.some(item => item.id === session.id)) return false;
  const mastery = { ...getMastery() };
  const formats = { ...getFormatPerformance() };
  let mistakes = [...getRecentMistakes()];
  for (const answer of session.answers) {
    for (const [stats, key] of [[mastery, answer.moduleId], [formats, answer.format]]) {
      const old = stats[key] || { correct: 0, total: 0 };
      stats[key] = { correct: old.correct + Number(answer.isCorrect), total: old.total + 1 };
    }
    if (!answer.isCorrect) mistakes.unshift({ ...answer, sessionId: session.id, timestamp: new Date().toISOString() });
  }
  setStore({ ...store, practiceHistory: [...history, { ...session, timestamp: new Date().toISOString() }], mastery, formatPerformance: formats, recentMistakes: mistakes.slice(0, 20), streak: activityStreak(store) });
  return true;
}

export function getLearningAttempts() {
  const data = getStore().learningAttempts;
  return Array.isArray(data) ? data : [];
}

/**
 * Additive attempt saving: Enrich new attempts with unitPath, unitId, conceptId
 * without deleting or mutating existing legacy attempts.
 */
export function saveLearningAttempt(attempt, session = null) {
  if (!attempt || typeof attempt !== 'object') return false;
  const store = getStore();
  const attempts = getLearningAttempts();
  if (attempts.some(item => item.id === attempt.id)) return false;

  const rawConcept = attempt.conceptId;
  const rawUnitId = attempt.unitId || attempt.moduleId;
  const rawUnitPath = attempt.unitPath;

  const unitPath =
    (rawUnitPath && toUnitPath(rawUnitPath)) ||
    (rawConcept && CONCEPT_TO_UNIT_PATH[rawConcept]) ||
    (rawUnitId && CONCEPT_TO_UNIT_PATH[rawUnitId]) ||
    toUnitPath(rawUnitPath || rawConcept || rawUnitId) ||
    null;

  const unitId =
    (rawConcept && CONCEPT_TO_UNIT_ID[rawConcept]) ||
    (rawUnitId && CONCEPT_TO_UNIT_ID[rawUnitId]) ||
    (attempt.unitId && CONCEPT_TO_UNIT_ID[attempt.unitId]) ||
    (unitPath && unitPath.includes('/') ? unitPath.split('/')[1] : null) ||
    attempt.unitId ||
    rawUnitId ||
    null;

  const conceptId =
    rawConcept ||
    (rawUnitId && UNIT_ID_TO_CONCEPT[rawUnitId]) ||
    (unitId && UNIT_ID_TO_CONCEPT[unitId]) ||
    (unitPath && toConceptId(unitPath)) ||
    (rawUnitId && toConceptId(rawUnitId)) ||
    unitId ||
    null;

  const enrichedAttempt = {
    ...attempt,
    ...(unitPath && !attempt.unitPath ? { unitPath } : {}),
    ...(unitId && !attempt.unitId ? { unitId } : {}),
    ...(conceptId && !attempt.conceptId ? { conceptId } : {}),
  };

  setStore({
    ...store,
    learningAttempts: [...attempts, enrichedAttempt],
    ...(session ? { foundationSession: session } : {}),
    streak: activityStreak(store),
  });
  return true;
}

export function getFoundationSession() {
  const session = getStore().foundationSession;
  return session && Array.isArray(session.questions) && Array.isArray(session.answers) && Number.isInteger(session.index) ? session : null;
}
export function setFoundationSession(session) { setStore({ ...getStore(), foundationSession: session }); }
export function clearFoundationSession() { setStore({ ...getStore(), foundationSession: null }); }

export function getAllLearningAttempts() {
  const store = getStore();
  const foundationAttempts = (Array.isArray(store.learningAttempts) ? store.learningAttempts : [])
    .filter(Boolean);
  const practiceAttempts = (Array.isArray(store.practiceHistory) ? store.practiceHistory : [])
    .filter(Boolean)
    .flatMap((s) =>
      (Array.isArray(s?.answers) ? s.answers : [])
        .filter(Boolean)
        .map((a) => ({
          ...a,
          sessionId: s?.id,
          timestamp: a?.timestamp || s?.timestamp,
        }))
    );
  const reviewAttempts = (Array.isArray(store.reviewHistory) ? store.reviewHistory : [])
    .filter(Boolean)
    .flatMap((s) =>
      (Array.isArray(s?.answers) ? s.answers : [])
        .filter(Boolean)
        .map((a) => ({
          ...a,
          sessionId: s?.id,
          timestamp: a?.timestamp || s?.timestamp,
        }))
    );

  const seen = new Set();
  const unified = [];
  for (const a of [...foundationAttempts, ...practiceAttempts, ...reviewAttempts].filter(Boolean)) {
    const key = a?.id || `${a?.sessionId || ''}:${a?.question || ''}:${a?.timestamp || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      unified.push(a);
    }
  }

  return unified.sort((a, b) => String(a?.timestamp || '').localeCompare(String(b?.timestamp || '')));
}

export function updateAttemptReflectiveCause(attemptId, cause) {
  if (!attemptId || !cause) return;
  const store = getStore();
  let modified = false;

  if (Array.isArray(store.learningAttempts)) {
    store.learningAttempts = store.learningAttempts.map((a) => {
      if (a.id === attemptId || a.problemId === attemptId) {
        modified = true;
        return { ...a, reflectiveCause: cause };
      }
      return a;
    });
  }

  if (store.foundationSession && Array.isArray(store.foundationSession.answers)) {
    store.foundationSession.answers = store.foundationSession.answers.map((a) => {
      if (a.id === attemptId || a.problemId === attemptId) {
        modified = true;
        return { ...a, reflectiveCause: cause };
      }
      return a;
    });
  }

  if (Array.isArray(store.repairDrafts)) {
    store.repairDrafts = store.repairDrafts.map((d) => {
      if (d.attempt && (d.attempt.id === attemptId || d.id === attemptId)) {
        modified = true;
        return { ...d, attempt: { ...d.attempt, reflectiveCause: cause } };
      }
      return d;
    });
  }

  if (modified) {
    setStore(store);
  }
}

export function getReviewHistory() {
  const value = getStore().reviewHistory;
  return Array.isArray(value) ? value : [];
}

export function saveReviewSession(session) {
  const store = getStore();
  const history = getReviewHistory();
  if (history.some(item => item.id === session.id)) return;
  setStore({ ...store, reviewHistory: [...history, { ...session, timestamp: new Date().toISOString() }] });
}

export function getRulebook() {
  const store = getStore();
  const saved = Array.isArray(store.rulebook) ? store.rulebook : [];
  const deletedIds = Array.isArray(store.deletedRulebookIds) ? store.deletedRulebookIds : [];
  const merged = [...saved];
  for (const def of defaultRulebookEntries) {
    if (!deletedIds.includes(def.id) && !merged.some(e => e.id === def.id)) {
      merged.push(def);
    }
  }
  return merged;
}

export function saveRulebookEntry(entry) {
  if (!entry || typeof entry !== 'object' || !entry.id) return false;
  const store = getStore();
  const entries = Array.isArray(store.rulebook) ? store.rulebook : [];
  const existing = entries.find(item => item.id === entry.id);
  const updatedEntry = {
    ...entry,
    notes: entry.notes !== undefined ? entry.notes : (existing?.notes || ''),
    savedAt: existing?.savedAt || new Date().toISOString(),
  };
  setStore({
    ...store,
    rulebook: [
      ...entries.filter(item => item.id !== entry.id),
      updatedEntry,
    ],
  });
  return true;
}

export function removeRulebookEntry(id) {
  const store = getStore();
  const saved = Array.isArray(store.rulebook) ? store.rulebook : [];
  const deletedIds = Array.isArray(store.deletedRulebookIds) ? store.deletedRulebookIds : [];
  setStore({
    ...store,
    rulebook: saved.filter(item => item.id !== id),
    deletedRulebookIds: [...new Set([...deletedIds, id])],
  });
}

export function getRepairDrafts() {
  const store = getStore();
  if (Array.isArray(store.repairDrafts) && store.repairDrafts.length > 0) {
    return store.repairDrafts;
  }
  return store.repairDraft ? [store.repairDraft] : [];
}

export function getRepairDraft(id) {
  const drafts = getRepairDrafts();
  if (id) {
    return drafts.find((d) => d.id === id) || null;
  }
  const store = getStore();
  return store.repairDraft || drafts[0] || null;
}

export function setRepairDraft(draft) {
  if (!draft || !draft.id) return;
  const store = getStore();
  const drafts = getRepairDrafts();
  const updatedDrafts = [
    ...drafts.filter((d) => d.id !== draft.id),
    draft,
  ];
  setStore({
    ...store,
    repairDraft: draft,
    repairDrafts: updatedDrafts,
  });
}

export function removeRepairDraft(id) {
  const store = getStore();
  const drafts = getRepairDrafts();
  const remaining = drafts.filter((d) => d.id !== id);
  const nextActive = store.repairDraft?.id === id ? (remaining[remaining.length - 1] || null) : store.repairDraft;
  setStore({
    ...store,
    repairDraft: nextActive,
    repairDrafts: remaining,
  });
}

// ============================================================================
// Lesson Progress Storage API (Requirement R1, AC 107, 111)
// Guarantee zero writes to learningAttempts or mastery models
// ============================================================================

export function getLessonProgress(unitPath) {
  if (!unitPath || typeof unitPath !== 'string') return null;
  const canonicalPath = toUnitPath(unitPath) || unitPath;
  const store = getStore();
  const lessons = isRecord(store.lessonProgress) ? store.lessonProgress : {};
  const record = lessons[canonicalPath] || lessons[unitPath];
  if (record && isRecord(record)) {
    return {
      currentStepIndex: typeof record.currentStepIndex === 'number' ? record.currentStepIndex : 0,
      completed: Boolean(record.completed),
      completedAt: record.completedAt || null,
      microCheckAnswers: isRecord(record.microCheckAnswers) ? { ...record.microCheckAnswers } : {},
      lastUpdated: record.lastUpdated || null,
    };
  }
  return {
    currentStepIndex: 0,
    completed: false,
    completedAt: null,
    microCheckAnswers: {},
    lastUpdated: null,
  };
}

export function saveLessonProgress(unitPath, data = {}) {
  if (!unitPath || typeof unitPath !== 'string') return null;
  const canonicalPath = toUnitPath(unitPath) || unitPath;
  const store = getStore();
  if (!isRecord(store.lessonProgress)) {
    store.lessonProgress = {};
  }
  const current = isRecord(store.lessonProgress[canonicalPath])
    ? store.lessonProgress[canonicalPath]
    : isRecord(store.lessonProgress[unitPath])
      ? store.lessonProgress[unitPath]
      : {
          currentStepIndex: 0,
          completed: false,
          completedAt: null,
          microCheckAnswers: {},
        };

  const safeData = data && typeof data === 'object' ? data : {};

  const updatedMicroCheckAnswers = {
    ...(isRecord(current.microCheckAnswers) ? current.microCheckAnswers : {}),
    ...(isRecord(safeData.microCheckAnswers) ? safeData.microCheckAnswers : {}),
  };

  const updatedRecord = {
    ...current,
    ...safeData,
    unitPath: canonicalPath,
    microCheckAnswers: updatedMicroCheckAnswers,
    lastUpdated: new Date().toISOString(),
  };

  store.lessonProgress[canonicalPath] = updatedRecord;
  setStore(store);
  return updatedRecord;
}

export function completeLesson(unitPath) {
  return saveLessonProgress(unitPath, {
    completed: true,
    completedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Unit Quiz Storage API (Requirement R3)
// ============================================================================

export function getUnitQuizResult(unitPath) {
  if (!unitPath || typeof unitPath !== 'string') return null;
  const canonicalPath = toUnitPath(unitPath) || unitPath;
  const store = getStore();
  const quizzes = isRecord(store.unitQuizzes) ? store.unitQuizzes : {};
  const record = quizzes[canonicalPath] || quizzes[unitPath];
  return record && isRecord(record) ? { ...record } : null;
}

export function saveUnitQuizResult(unitPath, result = {}) {
  if (!unitPath || typeof unitPath !== 'string') return null;
  const canonicalPath = toUnitPath(unitPath) || unitPath;
  const store = getStore();
  if (!isRecord(store.unitQuizzes)) {
    store.unitQuizzes = {};
  }
  const quizRecord = {
    ...result,
    unitPath: canonicalPath,
    completedAt: result.completedAt || new Date().toISOString(),
  };
  store.unitQuizzes[canonicalPath] = quizRecord;
  setStore(store);
  return { ...quizRecord };
}

// ============================================================================
// Unit Composite Progress Helper (Requirement R3, PROJECT.md Line 76)
// ============================================================================

export function getUnitProgress(courseId, unitId) {
  const rawTarget = unitId ? `${courseId}/${unitId}` : courseId;
  const targetPath = toUnitPath(rawTarget) || (unitId ? `${courseId}/${unitId}` : courseId);
  const cleanCourseId = targetPath && targetPath.includes('/') ? targetPath.split('/')[0] : (courseId || 'math');
  const cleanUnitId = targetPath && targetPath.includes('/') ? targetPath.split('/')[1] : (unitId || courseId);

  const lesson = getLessonProgress(targetPath);
  const quiz = getUnitQuizResult(targetPath);
  const attempts = getAttemptsForUnit(cleanCourseId, cleanUnitId);

  const store = getStore();
  const unitMeta = typeof getMathUnit === 'function' ? getMathUnit(cleanUnitId) : null;
  const prerequisites = unitMeta?.prerequisites || [];

  // Evaluate unready prerequisites
  const unreadyPrereqs = prerequisites.filter((prereqId) => {
    const pMeta = typeof getMathUnit === 'function' ? getMathUnit(prereqId) : null;
    const pId = pMeta ? pMeta.id : prereqId;
    const pPath = pMeta ? pMeta.unitPath : `math/${pId}`;
    const pLegacy = pMeta?.legacyConceptId || UNIT_ID_TO_CONCEPT[pId];

    // 1. Check unit quiz passed
    const quizzes = isRecord(store.unitQuizzes) ? store.unitQuizzes : {};
    const pQuiz = quizzes[pPath] || quizzes[pId];
    if (pQuiz && (pQuiz.passed === true || (typeof pQuiz.score === 'number' && pQuiz.score >= 70))) {
      return false;
    }

    // 2. Check module progress
    const progress = isRecord(store.progress) ? store.progress : {};
    if (progress[pId]?.completed === true || (pLegacy && progress[pLegacy]?.completed === true)) {
      return false;
    }

    // 3. Check lesson completed (if lesson was complete and no quiz exists)
    const lessons = isRecord(store.lessonProgress) ? store.lessonProgress : {};
    const pLesson = lessons[pPath] || lessons[pId];
    if (pLesson?.completed === true && (!pMeta || !pMeta.hasQuiz)) {
      return false;
    }

    // 4. Check practice attempts
    const pAttempts = getAttemptsForUnit('math', pId);
    if (pAttempts.some((a) => a && a.isCorrect)) {
      return false;
    }

    return true; // Not satisfied yet
  });

  // Evaluate unit sections
  const hasLesson = Boolean(unitMeta ? unitMeta.hasLesson : (lesson?.completed || (lesson?.currentStepIndex || 0) > 0));
  const hasLab = Boolean(unitMeta?.hasLab);
  const hasPractice = Boolean(unitMeta ? unitMeta.hasPractice : attempts.length > 0);
  const hasQuiz = Boolean(unitMeta ? unitMeta.hasQuiz : Boolean(quiz));

  const sections = {
    lesson: {
      enabled: hasLesson,
      completed: Boolean(lesson?.completed),
      currentStepIndex: typeof lesson?.currentStepIndex === 'number' ? lesson.currentStepIndex : 0,
    },
    lab: {
      enabled: hasLab,
      labType: unitMeta?.labType || null,
      completed: Boolean(hasLab && (lesson?.completed || quiz?.passed)),
    },
    practice: {
      enabled: hasPractice,
      completed: attempts.some((a) => a && a.isCorrect),
      attemptCount: attempts.length,
    },
    quiz: {
      enabled: hasQuiz,
      completed: Boolean(quiz?.passed),
      score: typeof quiz?.score === 'number' ? quiz.score : null,
    },
  };

  // Evaluate completion status
  const isCompleted = Boolean(
    quiz?.passed === true ||
    (hasQuiz && typeof quiz?.score === 'number' && quiz.score >= 70) ||
    (!hasQuiz && lesson?.completed === true)
  );

  const isLocked = !isCompleted && unreadyPrereqs.length > 0;
  const finalUnreadyPrereqs = isCompleted ? [] : unreadyPrereqs;
  const status = isCompleted ? 'completed' : (isLocked ? 'locked' : 'in-progress');

  let percent = 0;
  if (status === 'completed') {
    percent = 100;
  } else if (status === 'locked') {
    percent = 0;
  } else {
    let applicableParts = 0;
    let earned = 0;

    if (hasLesson) {
      applicableParts += 1;
      if (lesson?.completed) earned += 1;
      else if ((lesson?.currentStepIndex || 0) > 0) earned += 0.5;
    }
    if (hasPractice) {
      applicableParts += 1;
      if (sections.practice.completed) earned += 1;
      else if (attempts.length > 0) earned += 0.5;
    }
    if (hasQuiz) {
      applicableParts += 1;
      if (quiz?.passed) earned += 1;
      else if (typeof quiz?.score === 'number') earned += Math.min(0.9, quiz.score / 100);
    }

    percent = applicableParts > 0 ? Math.min(99, Math.round((earned / applicableParts) * 100)) : 0;
  }

  return {
    status,
    isLocked,
    unreadyPrereqs: finalUnreadyPrereqs,
    percent,
    sections,
    unitPath: targetPath,
    lesson,
    quiz,
    attempts,
  };
}
