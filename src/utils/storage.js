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
}
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
  const yesterdayDate=new Date();yesterdayDate.setDate(yesterdayDate.getDate()-1);
  const yesterday = localDay(yesterdayDate);
  return { ...streak, current: [localDay(), yesterday].includes(streak.lastDate) ? streak.current : 0 };
}

function localDay(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }

function activityStreak(store) {
  const old = isRecord(store.streak) ? store.streak : {current:0,best:0,lastDate:null};
  const today=localDay();
  const yesterdayDate=new Date();yesterdayDate.setDate(yesterdayDate.getDate()-1);
  if(old.lastDate===today) return old;
  const current=old.lastDate===localDay(yesterdayDate)?old.current+1:1;
  return {current,best:Math.max(old.best||0,current),lastDate:today};
}
export function updateStreak() {
  const store=getStore();const streak=activityStreak(store);setStore({...store,streak});return streak;
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
  setStore({ ...store, practiceHistory: [...history, { ...session, timestamp: new Date().toISOString() }], mastery, formatPerformance: formats, recentMistakes: mistakes.slice(0,20), streak: activityStreak(store) });
  return true;
}

export function getLearningAttempts() { const data = getStore().learningAttempts; return Array.isArray(data) ? data : []; }
export function saveLearningAttempt(attempt, session = null) {
  const store = getStore();
  const attempts = getLearningAttempts();
  if (attempts.some(item => item.id === attempt.id)) return false;
  setStore({ ...store, learningAttempts: [...attempts, attempt], ...(session ? {foundationSession:session} : {}), streak: activityStreak(store) });
  return true;
}
export function getFoundationSession() {
  const session=getStore().foundationSession;
  return session && Array.isArray(session.questions) && Array.isArray(session.answers) && Number.isInteger(session.index) ? session : null;
}
export function setFoundationSession(session) { setStore({ ...getStore(), foundationSession: session }); }

export function getReviewHistory() { const value=getStore().reviewHistory;return Array.isArray(value)?value:[]; }
export function saveReviewSession(session) {
  const store=getStore();const history=getReviewHistory();
  if(history.some(item=>item.id===session.id)) return;
  setStore({...store,reviewHistory:[...history,{...session,timestamp:new Date().toISOString()}]});
}
export function getRulebook() { const value=getStore().rulebook;return Array.isArray(value)?value:[]; }
export function saveRulebookEntry(entry) {
  const store=getStore();const entries=getRulebook();
  const existing=entries.find(item=>item.id===entry.id);
  setStore({...store,rulebook:[...entries.filter(item=>item.id!==entry.id),{...existing,...entry,savedAt:existing?.savedAt || new Date().toISOString()}]});
}
export function removeRulebookEntry(id) { setStore({...getStore(),rulebook:getRulebook().filter(item=>item.id!==id)}); }
export function getRepairDraft() { return getStore().repairDraft || null; }
export function setRepairDraft(draft) { setStore({...getStore(),repairDraft:draft}); }
