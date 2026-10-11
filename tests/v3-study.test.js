import test from 'node:test';
import assert from 'node:assert/strict';
import { createStudySession, makeStudyProblem, submitStudyAnswer, advanceStudySession, studyReviewAnswers, studySummary } from '../src/utils/studySession.js';
import { numericValue } from '../src/utils/answerChecking.js';
import { getMathUnit } from '../src/data/courses/mathFoundations.js';
import { getGeometryUnit } from '../src/data/courses/geometryFoundations.js';
import { createRecallSession, submitRecall } from '../src/utils/ruleMatch.js';
import { studyTopicLink } from '../src/utils/studyNavigation.js';
import { commitStudySession, getStudySession, getStudyHistory, getLearningAttempts, saveRecallSession, getCompletedRepairs, setRepairDraft, completeRepairDraft, getRepairDrafts } from '../src/utils/storage.js';
function fixture() {const m=new Map(); global.localStorage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};return m;}

test('generated fraction values, steps and visual quantities agree across 2000 seeds',()=>{
  const distinct=new Set();
  for(let seed=0;seed<2000;seed++) {
    const q=makeStudyProblem('addition',seed),v=q.visual;
    assert(v.a>0&&v.a<v.d&&v.b>0&&v.b<v.e);
    const expected=v.subtract?v.a/v.d-v.b/v.e:v.a/v.d+v.b/v.e;
    assert(Math.abs(numericValue(q.answer)-expected)<1e-9);
    assert(expected>=0); distinct.add(q.question);
    assert(q.steps.length===3);
  }
  assert(distinct.size>100);
});
test('one mistaken first answer survives helped recovery without doubling independent evidence',()=>{
  let s=createStudySession(getMathUnit('addition'),'practice',5);
  s=submitStudyAnswer(s,'0');
  assert.equal(s.help,'hint'); assert(!s.answers[0].isCorrect); assert(!s.answers[0].assisted);
  assert.equal(submitStudyAnswer(s,'2'),s);
  s={...s,checked:false};s=submitStudyAnswer(s,String(s.questions[0].answer));
  assert(s.answers[1].isCorrect&&s.answers[1].assisted);
  const review=studyReviewAnswers(s); assert.equal(review.length,1);assert.equal(review[0].retries.length,1);assert(!review[0].isCorrect&&review[0].eventualCorrect);
  assert.equal(studySummary(s).independent,0);assert.equal(studySummary(s).recovered,1);
  s=advanceStudySession(s);assert.equal(s.index,1);assert.equal(s.assisted,false);
});
test('atomic session commits are idempotent, survive reload and preserve archived blocks and legacy data',()=>{
  const m=fixture();m.set('mathfoundry_data',JSON.stringify({settings:{theme:'forest'},learningAttempts:[{id:'legacy',isCorrect:true}]}));
  let s=createStudySession(getMathUnit('addition'),'practice',4);
  s=advanceStudySession(submitStudyAnswer(s,String(s.questions[0].answer)));
  s=submitStudyAnswer(s,String(s.questions[1].answer));
  commitStudySession('math/addition',s);commitStudySession('math/addition',s);
  assert.equal(getLearningAttempts().length,2);assert.deepEqual(getStudySession('math/addition'),JSON.parse(JSON.stringify(s)));
  assert.equal(JSON.parse(m.get('mathfoundry_data')).recognitionAttempts.length,1);
  const next=createStudySession(getMathUnit('addition'),'practice',9);commitStudySession('math/addition',next);
  assert.deepEqual(getStudyHistory()[0],JSON.parse(JSON.stringify(s)));assert.equal(JSON.parse(m.get('mathfoundry_data')).settings.theme,'forest');
});
test('quiz feedback is immediate and full solution remains learner controlled',()=>{
  const s=createStudySession(getMathUnit('addition'),'quiz',2);assert.equal(s.questions.length,4);
  const wrong=submitStudyAnswer(s,'0');assert(wrong.checked);assert.equal(wrong.help,'hint');
});
test('recall saves recognition outside independent learning evidence and respects assistance',()=>{
  fixture();const original=createRecallSession('addition',4);const wrong=submitRecall({...original,input:String((original.questions[0].answer+1)%3)});
  assert(wrong.hint&&!wrong.reveal);saveRecallSession(wrong);saveRecallSession(wrong);assert.equal(getLearningAttempts().length,0);
  const recovery=submitRecall({...wrong,checked:false,input:String(wrong.questions[0].answer)});assert(recovery.answers[1].assisted&&recovery.answers[1].isCorrect);
  saveRecallSession(recovery);assert.equal(JSON.parse(localStorage.getItem('mathfoundry_data')).recognitionAttempts.length,2);
});
test('completed repair is attached to its source and removed from pending drafts',()=>{
  fixture();const draft={id:'draft',source:{id:'source'},problem:{}};setRepairDraft(draft);
  completeRepairDraft(draft,{id:'followup',timestamp:'2026-10-07T00:00:00Z'});
  assert.equal(getRepairDrafts().length,0);assert.equal(getCompletedRepairs().source.attemptId,'followup');
  const saved=getCompletedRepairs().source.draft;
  assert.equal(saved.id,'draft');assert(saved.completed&&saved.checked);assert.equal(saved.attempt.id,'followup');
});
test('failed corrupt-store writes preserve raw learner data',()=>{
  const m=fixture();m.set('mathfoundry_data','broken-json');
  assert.throws(()=>commitStudySession('math/arithmetic',createStudySession(getMathUnit('arithmetic'))));
  assert.equal(m.get('mathfoundry_data'),'broken-json');
});
test('engineering applications attribute evidence to the skill used by each question',()=>{
  let s=createStudySession(getMathUnit('addition'),'application',4);
  s=submitStudyAnswer(s,s.questions[0].answer);
  assert.equal(s.answers[0].unitPath,'math/multiply-fractions');
  s=advanceStudySession(s);s=submitStudyAnswer(s,s.questions[1].answer);
  assert.equal(s.answers[1].unitPath,'math/add-subtract-fractions');
  assert.equal(studySummary(s).independent,2);
});
test('focused recall mixes rule recall, next steps and rule repairs for every foundation skill',()=>{
  for(const id of ['arithmetic','equivalence','comparison','addition','multiplication','division']) {
    const s=createRecallSession(id,7);
    assert.equal(new Set(s.questions.map(q=>q.family)).size,3);
    assert.equal(new Set(s.questions.map(q=>q.question)).size,3);
    for(const q of s.questions) assert(q.options[q.answer] && q.explanation && q.hint);
  }
});
test('geometry choice values are normalized before grading angles and radians',()=>{
  for(const [id,seed,expected] of [['angles-lines',0,180],['angles-lines',1,44],['triangles-pythagoras',1,25],['circles-radians',0,'2π']]) {
    const s=createStudySession(getGeometryUnit(id),'practice',seed);
    const q=s.questions[0];
    assert.equal(q.options[q.answer],expected);
    const submitted=submitStudyAnswer(s,String(q.answer));
    assert(submitted.answers[0].isCorrect);
    assert.equal(String(submitted.answers[0].expectedAnswer),String(expected));
  }
});
test('rulebook and review links resolve old module IDs without promising unavailable practice',()=>{
  assert.equal(studyTopicLink({moduleId:'pythagorean'}).path,'/courses/geometry/triangles-pythagoras/practice');
  assert.equal(studyTopicLink({conceptId:'angles-lines'}).path,'/courses/geometry/angles-lines/practice');
  assert.equal(studyTopicLink({conceptId:'addition'},'lesson').path,'/courses/math/add-subtract-fractions/lesson');
  assert.deepEqual(studyTopicLink({moduleId:'linear-equations'}),{path:'/courses/math/intro-algebra/practice',label:'Practice this topic'});
});
