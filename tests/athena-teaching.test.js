import test from 'node:test';
import assert from 'node:assert/strict';
import { mathFoundationsUnits } from '../src/data/courses/mathFoundations.js';
import { geometryFoundationsUnits } from '../src/data/courses/geometryFoundations.js';
import { createStudySession, submitStudyAnswer } from '../src/utils/studySession.js';
import { makeTeachingExample } from '../src/utils/studyTeaching.js';
import { numericValue } from '../src/utils/answerChecking.js';
import { makeRepairDraft } from '../src/utils/repair.js';
import { commitStudySession, getStudySession, getLearningAttempts } from '../src/utils/storage.js';

const units=[...mathFoundationsUnits,...geometryFoundationsUnits];
function modelAnswer(v) {
  switch(v.kind) {
    case 'arithmetic': return v.op==='×'?v.a*v.b:v.op==='÷'?v.a/v.b:v.op==='+'?v.a+v.b:v.a-v.b;
    case 'number-line': return v.start+v.change;
    case 'hundred-grid': return v.count/100;
    case 'ratio': return v.percent*v.total/100;
    case 'factors': {let d=Math.min(v.a,v.b);while(v.a%d||v.b%d)d--;return d;}
    case 'expression': return v.a+v.b*v.c;
    case 'balance': return (v.total-v.b)/v.a;
    case 'fraction-product': return v.a*v.b/(v.d*v.e);
    case 'fraction-groups': return v.a/v.d/(v.b/v.e);
    case 'angle': return v.relationship==='right'?90-v.known:['straight','consecutive'].includes(v.relationship)?180-v.known:v.known;
    case 'triangle-angles': return 180-v.a-v.b;
    case 'triangle': return v.unknown==='a'?v.a:v.unknown==='c'?v.c:v.a*v.b/2;
    case 'rectangle': return v.measure==='area'?v.w*v.h:2*(v.w+v.h);
    case 'circle': return 2*v.r;
    case 'box': return v.l*v.w*v.h;
    case 'coordinates': return v.dy/v.dx;
    case 'equivalence': return v.b;
    case 'comparison': return v.a/v.d>v.b/v.e?0:1;
    default: return v.subtract?v.a/v.d-v.b/v.e:v.a/v.d+v.b/v.e;
  }
}

test('all 18 foundation units offer checked introductory practice and matching visual quantities',()=>{
  for(const unit of units) {
    assert(unit.hasPractice&&unit.hasQuiz);
    for(let seed=0;seed<64;seed++) {
      const s=createStudySession(unit,'practice',seed);
      assert.equal(s.questions.length,6);
      for(const q of s.questions) {
        assert(q.steps?.length&&q.example?.steps?.length&&q.keyIssue);
        if(q.evidenceType==='recognition') {assert(q.options[q.answer]!==undefined);continue;}
        assert(q.visual,`${unit.id}: ${q.question}`);
        assert(Math.abs(modelAnswer(q.visual)-numericValue(q.answer))<1e-8,`${unit.id}: ${q.question}`);
      }
    }
  }
});

test('worked introductions use a different problem and valid parameter-matched examples',()=>{
  for(const unit of units) {
    const active=createStudySession(unit,'practice',5).questions[2];
    const example=makeTeachingExample(unit,active);
    assert.notEqual(example.question,active.question);
    assert(example.visual&&example.steps.length);
    assert(Math.abs(modelAnswer(example.visual)-numericValue(example.answer))<1e-8,unit.id);
  }
});

test('all course topics can create a novel visual repair without changing the original response',()=>{
  for(const unit of units) {
    const s=createStudySession(unit,'practice',0);
    const q=s.questions[1];
    const record={id:'original',unitId:unit.id,unitPath:unit.unitPath,conceptId:q.conceptId,moduleId:q.moduleId,question:q.question,problem:q,submittedAnswer:'wrong',subskill:q.subskill};
    const draft=makeRepairDraft(record,[]);
    assert(draft,unit.id);
    assert(draft.problem.visual,unit.id);
    assert.notEqual(draft.problem.question,record.question);
    assert.equal(draft.source.submittedAnswer,'wrong');
    assert.equal(draft.problem.unitPath,unit.unitPath);
    assert(Math.abs(modelAnswer(draft.problem.visual)-numericValue(draft.problem.answer))<1e-8,unit.id);
  }
});

test('viewing and resuming a guide saves position without fabricating attempt evidence',()=>{
  const data=new Map();global.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v))};
  const s={...createStudySession(mathFoundationsUnits[11],'practice',9),help:'learn',guideStep:1,assisted:true};
  commitStudySession('math/intro-algebra:practice',s);
  assert.equal(getStudySession('math/intro-algebra:practice').guideStep,1);
  assert.equal(getLearningAttempts().length,0);
  const answered=submitStudyAnswer({...s,help:null},s.questions[0].answer);
  assert(answered.answers[0].isCorrect&&answered.answers[0].assisted);
});
