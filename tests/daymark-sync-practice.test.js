import test from 'node:test';
import assert from 'node:assert/strict';

import { generateUnitPracticeSet } from '../src/utils/problemGenerator.js';
import { getCuratedVideo, curatedUnitVideos } from '../src/data/courses/curatedVideos.js';
import { getSyncConfig, saveSyncConfig } from '../src/utils/githubSync.js';
import * as storage from '../src/utils/storage.js';

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

test('generateUnitPracticeSet: produces 6 distinct questions without hardcoded repetition', () => {
  const set1 = generateUnitPracticeSet('arithmetic', 'arithmetic');
  const set2 = generateUnitPracticeSet('arithmetic', 'arithmetic');

  assert.equal(set1.length, 6);
  assert.equal(set2.length, 6);

  // Check all questions within set1 are unique
  const uniqueQuestions = new Set(set1.map((q) => q.question));
  assert.equal(uniqueQuestions.size, 6, 'All 6 questions in the session are distinct');
});

test('generateUnitPracticeSet: re-injects a recent missed question as reinforcement', () => {
  // Seed a simulated recent miss
  storage.saveLearningAttempt({
    id: 'test-miss-attempt-1',
    conceptId: 'addition',
    unitId: 'add-subtract-fractions',
    unitPath: 'math/add-subtract-fractions',
    isCorrect: false,
    skipped: false,
    submittedAnswer: '2/10',
    expectedAnswer: '5/12',
    timestamp: new Date().toISOString(),
  });

  const practiceSet = generateUnitPracticeSet('addition', 'add-subtract-fractions');
  assert.equal(practiceSet.length, 6);
  const reinforcement = practiceSet.find((q) => q.isReinforcement);
  assert.ok(reinforcement, 'Reinforcement problem is injected into practice set');
  assert.equal(reinforcement.reinforcementNote, 'Targeting recent slip');
});

test('curatedUnitVideos: provides structured videos for core units', () => {
  const addVideo = getCuratedVideo('add-subtract-fractions');
  assert.ok(addVideo);
  assert.equal(addVideo.creator, 'The Organic Chemistry Tutor');
  assert.ok(addVideo.embedId);
  assert.ok(addVideo.takeaways.length >= 3);

  const arithVideo = getCuratedVideo('arithmetic');
  assert.ok(arithVideo);
  assert.equal(arithVideo.creator, 'The Organic Chemistry Tutor');
});

test('githubSync: persists and retrieves cross-device sync configuration safely', () => {
  saveSyncConfig({
    token: 'ghp_test_secret_token_123',
    gistId: 'gist_abc_456',
    autoSync: true,
  });

  const config = getSyncConfig();
  assert.equal(config.token, 'ghp_test_secret_token_123');
  assert.equal(config.gistId, 'gist_abc_456');
  assert.equal(config.autoSync, true);
});
