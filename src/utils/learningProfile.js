import { concepts } from '../data/foundations.js';
const TWO_DAYS=48*60*60*1000;
// Conservative launch policy; this describes evidence, not certification.
export function conceptProfile(conceptId, attempts, now=Date.now()) {
  const all=attempts.filter(a=>a.conceptId===conceptId);
  const assessed=all.filter(a=>!a.skipped);
  const independent=assessed.filter(a=>!a.assisted);
  const latest=assessed.at(-1);
  const recent=independent.slice(-3);
  const independentReady=recent.length===3 && recent.every(a=>a.isCorrect) && new Set(recent.map(a=>a.sessionId)).size>=2;
  const laterCheck=recent.some((a,i)=>i>0 && Date.parse(a.timestamp)-Date.parse(recent[0].timestamp)>=TWO_DAYS);
  const state=!assessed.length?'Unassessed':independentReady && latest?.isCorrect && !latest?.assisted ? laterCheck?'Retained':'Independent':'Learning';
  const lastIndependent=independent.at(-1);
  const dueAt=lastIndependent?.isCorrect ? Date.parse(lastIndependent.timestamp)+TWO_DAYS : null;
  return {conceptId,state,assessed:assessed.length,independent:independent.length,assisted:assessed.filter(a=>a.assisted).length,skipped:all.filter(a=>a.skipped).length,last:latest,dueAt,due:dueAt!==null && now>=dueAt};
}
export function foundationRecommendation(attempts, now=Date.now()) {
  const profiles=concepts.map(concept=>({...concept,...conceptProfile(concept.id,attempts,now)}));
  const due=profiles.find(p=>p.due);
  if(due) return {...due,reason:'An independent answer is ready for a later recall check. Try it without the example first.',mode:'review'};
  const needs=profiles.find(p=>p.last && (!p.last.isCorrect || p.last.assisted));
  if(needs) return {...needs,reason:needs.last.assisted?'Your last answer used a worked example. Try a new problem independently.':'Your last attempt needs another look. Review one example, then try a different problem.',mode:'guided'};
  const unknown=profiles.find(p=>p.state==='Unassessed');
  if(unknown) return {...unknown,reason:unknown.skipped?'You skipped this check. We can introduce it gently before another attempt.':'We do not yet have evidence for this skill. A short check will help choose a starting point.',mode:attempts.length?'guided':'baseline'};
  const next=profiles.find(p=>p.state==='Learning') || profiles[0];
  return {...next,reason:'Build independent evidence with new problems in another study block. Immediate success is not yet delayed recall.',mode:'guided'};
}
