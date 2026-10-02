const STORAGE_KEY = 'mathfoundry_data';

function getStore() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function getProgress() {
  const store = getStore();
  return store.progress || {};
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
  return store.diagnostic || null;
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
  return store.streak || { current: 0, best: 0, lastDate: null };
}

export function updateStreak() {
  const store = getStore();
  const streak = store.streak || { current: 0, best: 0, lastDate: null };
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (streak.lastDate === today) {
    return streak;
  } else if (streak.lastDate === yesterday) {
    streak.current += 1;
  } else {
    streak.current = 1;
  }

  streak.lastDate = today;
  if (streak.current > streak.best) {
    streak.best = streak.current;
  }

  store.streak = streak;
  setStore(store);
  return streak;
}

export function getSettings() {
  const store = getStore();
  return store.settings || { theme: 'light', fontSize: 'medium' };
}

export function setSettings(settings) {
  const store = getStore();
  store.settings = { ...store.settings, ...settings };
  setStore(store);
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getPracticeHistory() {
  const store = getStore();
  return store.practiceHistory || [];
}

export function addPracticeSession(session) {
  const store = getStore();
  if (!store.practiceHistory) store.practiceHistory = [];
  store.practiceHistory.push({ ...session, timestamp: new Date().toISOString() });
  setStore(store);
}

export function getMastery() {
  const store = getStore();
  return store.mastery || {};
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
  return store.formatPerformance || {};
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
  return store.recentMistakes || [];
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
