import test from 'node:test';
import assert from 'node:assert/strict';
import { makeProblem,concepts } from '../src/data/foundations.js';
import { conceptProfile,foundationRecommendation } from '../src/utils/learningProfile.js';
import { equivalentAnswer,numericValue,checkPracticeAnswer } from '../src/utils/answerChecking.js';
import { generateAdaptiveSession } from '../src/utils/adaptiveEngine.js';
import { practiceBank } from '../src/data/practiceBank.js';
import { learningPaths,getNextModule } from '../src/data/learningPaths.js';
import { processContent } from '../src/utils/mathHelpers.js';
import * as storage from '../src/utils/storage.js';
import { buildTutorSystemPrompt } from '../src/utils/aiTutor.js';
const memory=new Map();
global.localStorage={getItem:key=>memory.get(key) ?? null,setItem:(key,value)=>memory.set(key,String(value)),removeItem:key=>memory.delete(key)};
function reset() {memory.clear();}
const record=(overrides={})=>({id:crypto.randomUUID(),sessionId:'a',conceptId:'arithmetic',isCorrect:true,assisted:false,timestamp:'2026-10-01T00:00:00Z',...overrides});
test('numeric checking accepts equivalence and rejects empty, nonnumeric and executable inputs',()=>{
 for(const [a,b] of [['55.00','55'],['2/4','0.5'],['-3 / 4','-.75']]) assert.ok(equivalentAnswer(a,b));
 for(const value of ['','1/0','Infinity','1+1','<script>','1;alert(1)']) assert.equal(numericValue(value),null);
 assert.equal(equivalentAnswer('','0'),false);assert.equal(equivalentAnswer('0.51','1/2'),false);
});
test('all starter numeric variants agree with independently calculated results',()=>{
 for(let seed=0;seed<120;seed++) {
  const v=seed%6;
  for(const concept of concepts) {
   const q=makeProblem(concept.id,seed);
   const actual=numericValue(q.answer);
   switch(concept.id) {
    case 'arithmetic': {const a=8+v,b=3+v,k=seed%4;assert.equal(actual,k===0?a*b:k===1?b:k===2?(20+a)+(10+b):(20+a)-(10+b));break;}
    case 'equivalence': assert.equal(actual/q.denominator,q.numerator/q.sourceDenominator);break;
    case 'comparison': {const [left,right]=q.options.map(numericValue);assert.equal(q.answer,left>right?0:1);break;}
    case 'addition': assert.ok(Math.abs(actual-(v%2 ? 1/(3+v)-1/(4+v) : 1/(3+v)+1/(4+v)))<1e-12);break;
    case 'multiplication': assert.ok(Math.abs(actual-(2/(4+v)*1/(3+v)))<1e-12);break;
    case 'division': assert.equal(actual,2+v%3);break;
   }
  }
 }
});
test('supported success and same-day drill completion cannot establish retention',()=>{
 assert.equal(conceptProfile('arithmetic',[]).state,'Unassessed');
 assert.equal(conceptProfile('arithmetic',[record({skipped:true})]).state,'Unassessed');
 assert.equal(conceptProfile('arithmetic',[record(),record(),record()]).state,'Learning');
 const independent=[record(),record({sessionId:'b'}),record({sessionId:'b'})];
 assert.equal(conceptProfile('arithmetic',independent).state,'Independent');
 assert.equal(conceptProfile('arithmetic',[...independent,record({assisted:true})]).state,'Learning');
 assert.equal(conceptProfile('arithmetic',[record(),record({sessionId:'b'}),record({sessionId:'c',timestamp:'2026-10-03T00:00:00Z'})]).state,'Retained');
 assert.equal(conceptProfile('arithmetic',[...independent,record({isCorrect:false})]).state,'Learning');
});
test('different histories produce explained recommendations and delayed reviews',()=>{
 assert.equal(foundationRecommendation([]).mode,'baseline');
 assert.equal(foundationRecommendation([record({conceptId:'addition',isCorrect:false})],Date.parse('2026-10-01')).id,'addition');
 assert.equal(foundationRecommendation([record()],Date.parse('2026-10-03')).mode,'review');
});
test('legacy data survives additive saves; session replay does not duplicate counts or errors',()=>{
 reset();memory.set('mathfoundry_data',JSON.stringify({diagnostic:{overallScore:75},progress:{angles:{completed:true}},settings:{theme:'dark',aiApiKey:'fixture-secret'}}));
 const session={id:'one',score:50,answers:[{moduleId:'angles',format:'fill',isCorrect:false,submittedAnswer:'7',question:'test'},{moduleId:'angles',format:'fill',isCorrect:true}]};
 assert.equal(storage.savePracticeSession(session),true);assert.equal(storage.savePracticeSession(session),false);
 assert.equal(storage.getPracticeHistory().length,1);assert.deepEqual(storage.getMastery().angles,{correct:1,total:2});
 assert.equal(storage.getRecentMistakes().length,1);assert.equal(storage.getDiagnosticResults().overallScore,75);
 assert.equal(storage.getProgress().angles.completed,true);assert.ok(memory.has('mathfoundry_data_before_v2'));
 assert.ok(!storage.exportLearningData().includes('fixture-secret'));assert.ok(storage.exportRawData().includes('fixture-secret'));
});
test('malformed storage cannot be overwritten and quota errors propagate',()=>{
 reset();memory.set('mathfoundry_data','{broken');assert.throws(()=>storage.setSettings({theme:'light'}));assert.equal(memory.get('mathfoundry_data'),'{broken');
 reset();const old=localStorage.setItem;localStorage.setItem=()=>{throw new Error('QuotaExceeded')};assert.throws(()=>storage.setFoundationSession({id:'a'}),/QuotaExceeded/);localStorage.setItem=old;
});
test('attempts are idempotent; tutor context reflects answers and actual accuracy',()=>{
 reset();const attempt=record({id:'attempt',submittedAnswer:'3/4'});storage.saveLearningAttempt(attempt,{id:'draft',questions:[],answers:[attempt],index:0});storage.saveLearningAttempt(attempt);assert.equal(storage.getFoundationSession().answers.length,1);assert.equal(storage.getLearningAttempts().length,1);
 storage.savePracticeSession({id:'first',score:0,answers:[{moduleId:'angles',format:'fill',isCorrect:false,submittedAnswer:'0',question:'Angle?',explanation:'Use 180'}]});
 storage.savePracticeSession({id:'last',score:100,answers:[{moduleId:'angles',format:'fill',isCorrect:true}]});
 const prompt=buildTutorSystemPrompt({question:'1/3 + 1/6',tutorMode:'One hint'});
 assert.ok(prompt.includes('angles: 50% (1/2)'));assert.ok(prompt.includes('"score":100'));assert.ok(prompt.includes('1/3 + 1/6'));assert.ok(prompt.includes('"submittedAnswer":"0"'));assert.ok(!prompt.includes('[object Object]'));assert.ok(!prompt.includes('undefined%'));
});
test('adaptive selection responds to saved counts and bank IDs are valid',()=>{
 const valid=new Set(learningPaths.flatMap(p=>p.modules.map(m=>m.id)));assert.ok(practiceBank.every(q=>valid.has(q.moduleId)));
 const random=Math.random;Math.random=()=>.5;
 try {
  const all=(correct)=>Object.fromEntries([...new Set(practiceBank.map(q=>q.moduleId))].map(id=>[id,{correct:id==='quadratic-equations'?correct:10,total:10}]));
  const weak=generateAdaptiveSession({mastery:all(0),questionCount:6});const strong=generateAdaptiveSession({mastery:all(10),questionCount:6});
  assert.ok(weak.filter(q=>q.moduleId==='quadratic-equations').length>strong.filter(q=>q.moduleId==='quadratic-equations').length);
 } finally {Math.random=random;}
 assert.equal(getNextModule('algebra','variables-expressions').id,'linear-equations');
 assert.ok(checkPracticeAnswer(practiceBank.find(q=>q.id==='sequence-4'),[0,2,1,3]));
});
test('untrusted tutor HTML is escaped and math trust is disabled',()=>{
 const html=processContent('<img src=x onerror="alert(1)"> $1+1$',true);
 assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));assert.ok(html.includes('katex'));
 assert.ok(!processContent('$\\htmlStyle{background:red}{x}$',true).includes('style="background:red"'));
});

test('review preserves meaningful answers for every practice format and quiz category',async()=>{
 const {expectedAnswer,displayAnswer,quizReview,foundationHistory}=await import('../src/utils/review.js');
 for(const q of practiceBank){assert.ok(expectedAnswer(q));assert.ok(!expectedAnswer(q).includes('[object Object]'));}
 const sequence=practiceBank.find(q=>q.format==='sequence');assert.ok(displayAnswer(sequence,sequence.correctOrder).includes(sequence.steps[0]));
 const records=quizReview([{question:'Point?',options:['Line','Point'],correctAnswer:1,category:'basic-shapes',explanation:'A location.'}],{0:0});
 assert.equal(records[0].submittedAnswer,'Line');assert.equal(records[0].expectedAnswer,'Point');assert.equal(records[0].moduleId,'points-lines');
 assert.equal(foundationHistory([record({sessionId:'first'}),record({sessionId:'second'}),record({sessionId:'first'})])[0].answers.length,2);
});
test('repair tasks differ from the original block and retain correct mathematics',async()=>{
 const {makeRepairDraft}=await import('../src/utils/repair.js');
 for(const c of concepts){
  const previous=Array.from({length:24},(_,i)=>({question:makeProblem(c.id,i).question}));
  const draft=makeRepairDraft({conceptId:c.id,question:previous[0].question},previous);
  assert.ok(!previous.some(a=>a.question===draft.problem.question));
  if(c.id==='comparison')assert.equal(draft.problem.answer,1);
  else assert.notEqual(numericValue(draft.problem.answer),null);
 }
});
test('saved reviews and rulebook survive other writes, preserve notes, and export without credentials',()=>{
 reset();storage.setSettings({aiApiKey:'private-fixture'});
 storage.saveReviewSession({id:'quiz',answers:[{question:'Original',submittedAnswer:'2',isCorrect:false}]});
 storage.saveReviewSession({id:'quiz',answers:[]});assert.equal(storage.getReviewHistory()[0].answers.length,1);
 storage.saveRulebookEntry({id:'rule',title:'Fractions',explanation:'Equal-sized parts.',notes:'My note'});
 storage.saveRulebookEntry({id:'rule',title:'Fractions',explanation:'Equal-sized parts.'});assert.equal(storage.getRulebook()[0].notes,'My note');
 storage.setRepairDraft({id:'repair',stage:'practice',input:'1/3'});storage.setSettings({theme:'forest'});
 const backup=JSON.parse(storage.exportLearningData());assert.equal(backup.repairDraft.input,'1/3');assert.equal(backup.rulebook[0].notes,'My note');assert.equal(backup.reviewHistory.length,1);assert.ok(!storage.exportLearningData().includes('private-fixture'));
});

test('all existing topics have repair support and authored numeric tasks agree with independent calculations',async()=>{
 const {topicRepair}=await import('../src/data/repairProblems.js');const {makeRepairDraft}=await import('../src/utils/repair.js');
 for(const path of learningPaths)for(const module of path.modules)assert.ok(makeRepairDraft({moduleId:module.id,question:'Original question'}));
 for(let seed=0;seed<33;seed++){
  const n=4+seed%11;const expected={circles:2*3.14*n,polygons:(n+3)*n/2,'volume-surface':n*6,coordinate:n+1,transformations:n+2,'variables-expressions':3*n+4,'linear-inequalities':n-1,'linear-functions':2*n+1,'systems-equations':n,'exponents-radicals':2**n,'polynomials-factoring':n};
  for(const [module,value]of Object.entries(expected))assert.equal(numericValue(topicRepair(module,seed).correctAnswer),value);
 }
});
