import { concepts } from '../data/foundations.js';

const TWO_DAYS = 48 * 60 * 60 * 1000;

// Conservative launch policy; this describes evidence, not certification.
export function conceptProfile(conceptId, attempts, now = Date.now()) {
  const all = attempts.filter((a) => a.conceptId === conceptId);
  const assessed = all.filter((a) => !a.skipped);
  const independent = assessed.filter((a) => !a.assisted);
  const latest = assessed.at(-1);
  const recent = independent.slice(-3);
  const independentReady =
    recent.length === 3 &&
    recent.every((a) => a.isCorrect) &&
    new Set(recent.map((a) => a.sessionId)).size >= 2;
  const laterCheck = recent.some(
    (a, i) => i > 0 && Date.parse(a.timestamp) - Date.parse(recent[0].timestamp) >= TWO_DAYS
  );
  const state = !assessed.length
    ? 'Unassessed'
    : independentReady && latest?.isCorrect && !latest?.assisted
      ? laterCheck
        ? 'Retained'
        : 'Independent'
      : 'Learning';
  const lastIndependent = independent.at(-1);
  const dueAt = lastIndependent?.isCorrect ? Date.parse(lastIndependent.timestamp) + TWO_DAYS : null;
  return {
    conceptId,
    state,
    assessed: assessed.length,
    independent: independent.length,
    assisted: assessed.filter((a) => a.assisted).length,
    skipped: all.filter((a) => a.skipped).length,
    last: latest,
    dueAt,
    due: dueAt !== null && now >= dueAt,
  };
}

export function foundationRecommendation(attempts, now = Date.now()) {
  const profiles = concepts.map((concept) => ({
    ...concept,
    ...conceptProfile(concept.id, attempts, now),
  }));

  const due = profiles.find((p) => p.due);
  if (due) {
    return {
      ...due,
      reason: 'An independent answer is ready for a later recall check. Try it without the example first.',
      evidenceSummary: '48+ hours elapsed since last independent success',
      targetEndpoint: 'Complete a 2-question recall check',
      mode: 'review',
    };
  }

  const needs = profiles.find((p) => p.last && (!p.last.isCorrect || p.last.assisted));
  if (needs) {
    return {
      ...needs,
      reason: needs.last.assisted
        ? 'Your last answer used a worked example. Try a new problem independently.'
        : 'Your last attempt needs another look. Review one example, then try a different problem.',
      evidenceSummary: needs.last.assisted
        ? 'Last session used hints/worked example'
        : 'Last session had an incorrect response',
      targetEndpoint: needs.last.assisted
        ? 'Complete 1 independent problem without hints'
        : 'Complete 1 targeted repair and 1 fresh follow-up',
      mode: 'guided',
    };
  }

  const unknown = profiles.find((p) => p.state === 'Unassessed');
  if (unknown) {
    return {
      ...unknown,
      reason: unknown.skipped
        ? 'You skipped this check. We can introduce it gently before another attempt.'
        : 'We do not yet have evidence for this skill. A short check will help choose a starting point.',
      evidenceSummary: unknown.skipped ? 'Skipped in earlier diagnostic' : 'No evidence on record yet',
      targetEndpoint: attempts.length
        ? 'Complete a 6-question introductory block'
        : 'Complete a 6-question starter check',
      mode: attempts.length ? 'guided' : 'baseline',
    };
  }

  const next = profiles.find((p) => p.state === 'Learning') || profiles[0];
  return {
    ...next,
    reason: 'Build independent evidence with new problems in another study block. Immediate success is not yet delayed recall.',
    evidenceSummary: 'Building consistency across multiple study blocks',
    targetEndpoint: 'Complete 1 independent block (6 questions)',
    mode: 'guided',
  };
}

// Real prerequisite traversal for compact path
export function buildPrerequisitePath(targetConceptId, attempts = [], now = Date.now()) {
  const target = concepts.find((c) => c.id === targetConceptId) || concepts[0];
  const targetProfile = conceptProfile(target.id, attempts, now);

  const prereqDetails = (target.prerequisites || []).map((pId) => {
    const pConcept = concepts.find((c) => c.id === pId);
    const pProfile = conceptProfile(pId, attempts, now);
    const isReady = pProfile.state === 'Independent' || pProfile.state === 'Retained';
    return {
      id: pId,
      title: pConcept?.title || pId,
      state: pProfile.state,
      isReady,
      assessed: pProfile.assessed,
    };
  });

  const allPrereqsReady = prereqDetails.length === 0 || prereqDetails.every((p) => p.isReady);
  const downstream = concepts
    .filter((c) => c.prerequisites && c.prerequisites.includes(target.id))
    .map((c) => ({ id: c.id, title: c.title }));

  let statusNote;
  if (target.prerequisites.length === 0) {
    statusNote = 'Foundation entry point. No prior prerequisites required.';
  } else if (allPrereqsReady) {
    statusNote = `All prerequisites verified with independent evidence. Ready to study ${target.title}.`;
  } else {
    const unready = prereqDetails.filter((p) => !p.isReady).map((p) => p.title).join(', ');
    statusNote = `Prerequisite recommendation: strengthen ${unready} first to build confident mastery.`;
  }

  return {
    target: {
      id: target.id,
      title: target.title,
      description: target.description,
      bridge: target.bridge,
      state: targetProfile.state,
      assessed: targetProfile.assessed,
      independent: targetProfile.independent,
      due: targetProfile.due,
    },
    prerequisites: prereqDetails,
    allPrereqsReady,
    downstream,
    statusNote,
  };
}

// Review prioritization queue with clear reasons and endpoints
export function getPrioritizedReviewQueue(attempts = [], now = Date.now()) {
  const queue = [];

  // 1. High Priority: Missed items without a later independent repair
  const missedAttempts = attempts.filter((a) => !a.isCorrect && !a.skipped);
  const seenMistakes = new Set();
  for (let i = missedAttempts.length - 1; i >= 0; i--) {
    const m = missedAttempts[i];
    const key = m.conceptId || m.moduleId || m.question;
    if (!seenMistakes.has(key)) {
      seenMistakes.add(key);
      const laterAttempts = attempts.filter(
        (a) =>
          (a.conceptId === m.conceptId || a.moduleId === m.moduleId) &&
          Date.parse(a.timestamp || 0) > Date.parse(m.timestamp || 0)
      );
      const repaired = laterAttempts.some((a) => a.isCorrect && !a.assisted);
      if (!repaired) {
        queue.push({
          id: `queue:missed:${m.id || key}`,
          priority: 'high',
          type: 'repair',
          title: m.question || 'Missed problem',
          conceptId: m.conceptId,
          moduleId: m.moduleId,
          sessionId: m.sessionId,
          reason: 'Missed in session without follow-up repair',
          evidence: `Original answer: "${m.submittedAnswer ?? 'none'}"`,
          targetEndpoint: 'Complete 1 targeted repair follow-up',
          actionUrl: m.sessionId ? `/review?session=${encodeURIComponent(m.sessionId)}` : '/review',
        });
      }
    }
  }

  // 2. Medium Priority: Concepts with 48h delayed recall check due
  for (const c of concepts) {
    const profile = conceptProfile(c.id, attempts, now);
    if (profile.due) {
      queue.push({
        id: `queue:due:${c.id}`,
        priority: 'medium',
        type: 'recall',
        title: c.title,
        conceptId: c.id,
        reason: '48 hours elapsed since last independent success',
        evidence: `${profile.independent} independent answer${profile.independent === 1 ? '' : 's'} on record`,
        targetEndpoint: 'Answer 2 questions without hints to verify retention',
        actionUrl: `/foundations?concept=${c.id}&mode=review`,
      });
    }
  }

  // 3. Low Priority: Concepts where last answer was assisted (hints used)
  for (const c of concepts) {
    const profile = conceptProfile(c.id, attempts, now);
    if (profile.last && profile.last.assisted && profile.last.isCorrect && !profile.due) {
      queue.push({
        id: `queue:assisted:${c.id}`,
        priority: 'low',
        type: 'practice',
        title: c.title,
        conceptId: c.id,
        reason: 'Last problem was solved with hints/support',
        evidence: 'Supported practice on record',
        targetEndpoint: 'Solve 1 fresh problem independently',
        actionUrl: `/foundations?concept=${c.id}`,
      });
    }
  }

  return queue;
}

// Honest evidence summary preventing premature mastery claims
export function summarizeEvidence(id, attempts = []) {
  const matching = attempts.filter((a) => a.conceptId === id || a.moduleId === id);
  const assessed = matching.filter((a) => !a.skipped);
  const correct = assessed.filter((a) => a.isCorrect);
  const independent = correct.filter((a) => !a.assisted);
  const supported = correct.filter((a) => a.assisted);
  const missed = assessed.filter((a) => !a.isCorrect);

  let reliability;
  let claim;
  if (assessed.length === 0) {
    reliability = 'unassessed';
    claim = 'No evidence recorded yet';
  } else if (assessed.length < 3) {
    reliability = 'sparse';
    claim = `Sparse evidence (${assessed.length} question${assessed.length === 1 ? '' : 's'}). Early exploration only; not proof of mastery.`;
  } else if (independent.length >= 3 && new Set(independent.map((a) => a.sessionId)).size >= 2) {
    reliability = 'independent';
    claim = `Demonstrated across multiple sessions (${independent.length} independent answers).`;
  } else {
    reliability = 'developing';
    claim = `Active practice (${correct.length}/${assessed.length} correct, ${supported.length} helped).`;
  }

  return {
    total: matching.length,
    assessed: assessed.length,
    correct: correct.length,
    independent: independent.length,
    supported: supported.length,
    missed: missed.length,
    reliability,
    claim,
  };
}
