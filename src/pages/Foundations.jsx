import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { concepts, makeFoundationSession, makeEngineeringSession } from '../data/foundations';
import { getFoundationSession,setFoundationSession,getLearningAttempts,saveLearningAttempt } from '../utils/storage';
import { foundationRecommendation,conceptProfile } from '../utils/learningProfile';
import { equivalentAnswer, numericValue } from '../utils/answerChecking';
import SessionReview from '../components/Study/SessionReview';
import { useStudyActivity } from '../components/Study/ActivityContext';

export default function Foundations() {
  const [params]=useSearchParams();
  const [session,setSession]=useState(()=>getFoundationSession());
  const [chooseFocus,setChooseFocus]=useState(params.get('application')==='scale');
  const [error,setError]=useState('');
  const [attempts,setAttempts]=useState(()=>getLearningAttempts());
  const recommendation=foundationRecommendation(attempts);
  const requestedConcept=params.get('concept');
  const [selectedConcept,setSelectedConcept]=useState(concepts.some(c=>c.id===requestedConcept)?requestedConcept:recommendation.id);
  const [minutes,setMinutes]=useState(Number(params.get('minutes')) || 30);
  const q=session?.questions?.[session.index];
  const active=Boolean(q) && !chooseFocus;
  useStudyActivity(active ? {moduleTitle:'Arithmetic & fractions',conceptId:q.conceptId,question:q.question,submittedAnswer:session.checked?session.input:null,workedExampleUsed:session.assisted,feedback:session.checked?q.explanation:null} : {moduleTitle:'Foundations study plan'});
  function persist(next) {
    try { setFoundationSession(next);setSession(next);setError('');return true; }
    catch(e) {setError(e.message);return false;}
  }
  function begin(mode) {if(persist(makeFoundationSession(mode,selectedConcept,attempts,minutes))) setChooseFocus(false);}
  function submit(skipped=false) {
    if(session.checked || (!skipped && session.input==='')) return;
    if (!skipped && q.format!=='rule' && numericValue(session.input)===null) {setError('Enter a number or a fraction such as 3/4. An input-format issue will not be counted as a wrong math answer.');return;}
    const isCorrect=!skipped && (q.format==='rule' ? Number(session.input)===q.answer : equivalentAnswer(session.input,q.answer));
    const attempt={id:`${session.id}:${session.index}`,sessionId:session.id,conceptId:q.conceptId,problemId:q.id,problem:q,question:q.question,submittedAnswer:skipped?null:q.format==='rule'?q.options[Number(session.input)]:session.input,expectedAnswer:q.format==='rule'?q.options[q.answer]:q.answer,explanation:q.explanation,format:q.format,isCorrect,skipped,assisted:session.assisted,mode:session.mode,timestamp:new Date().toISOString()};
    try {
      const nextSession={...session,checked:true,answers:[...session.answers,attempt]};
      saveLearningAttempt(attempt,nextSession);
      setAttempts(getLearningAttempts());setSession(getFoundationSession());setError('');
    } catch(e) {setError(e.message);}
  }
  function next() {persist({...session,index:session.index+1,input:'',assisted:false,checked:false,exampleOpen:false});}
  const concept=concepts.find(c=>c.id===q?.conceptId);
  return <div className="study-page">
    <nav className="study-breadcrumb"><Link to="/">Today</Link><span>/</span><span>Foundations</span></nav>
    {error && <p className="study-notice" role="alert">{error}</p>}
    {active ? <>
      <div className="study-session-header"><div><p className="eyebrow">{session.mode==='baseline'?'Starting-point check':session.mode==='review'?'Recall check':'Practice block'} · {session.minutes}-minute study plan</p><h1>{concept.title}</h1></div><span>{session.index+1} / {session.questions.length}</span></div>
      <progress aria-label="Block progress" value={session.index} max={session.questions.length} />
      <div className="study-workspace"><section className="study-card problem-card">
        <p className="study-muted">Paper welcome · Untimed · {q.format==='rule'?'Reason about the rule':'Work it out at your own pace'}</p>
        <h2>{q.question}</h2>
        {q.format==='visual' && <div className="fraction-lab">
          <p>Original amount: {q.numerator}/{q.sourceDenominator}</p>
          <div className="fraction-strip" style={{gridTemplateColumns:`repeat(${q.sourceDenominator},1fr)`}}>{Array.from({length:q.sourceDenominator},(_,i)=><span key={i} className={i<q.numerator?'filled':''} />)}</div>
          <label htmlFor="parts">Smaller parts selected: {Number(session.input)||0} / {q.denominator}</label>
          <input id="parts" type="range" min="0" max={q.denominator} value={session.input || 0} disabled={session.checked} onChange={e=>persist({...session,input:e.target.value})} />
          <div className="fraction-strip" style={{gridTemplateColumns:`repeat(${q.denominator},1fr)`}}>{Array.from({length:q.denominator},(_,i)=><span key={i} className={i<Number(session.input)?'filled':''} />)}</div>
        </div>}
        <form onSubmit={e=>{e.preventDefault();submit();}}>
          {q.format==='rule' ? <fieldset disabled={session.checked} className="study-options"><legend className="sr-only">Choose your answer</legend>{q.options.map((option,i)=><label key={option} className={Number(session.input)===i && session.input!==''?'selected':''}><input type="radio" name="answer" value={i} checked={session.input===String(i)} onChange={e=>persist({...session,input:e.target.value})} />{option}</label>)}</fieldset> : q.format!=='visual' && <><label htmlFor="answer">Your answer</label><input id="answer" className="study-answer" autoComplete="off" value={session.input} disabled={session.checked} onChange={e=>persist({...session,input:e.target.value})} placeholder="For example: 3/4 or 0.75" /><p className="study-muted">Equivalent fractions and exact decimals are accepted. You can keep intermediate work on paper.</p></>}
          {!session.checked && <div className="study-actions"><button className="study-button" disabled={session.input===''}>Check answer</button><button className="study-button secondary" type="button" onClick={()=>submit(true)}>Not sure yet</button></div>}
        </form>
        {session.checked && <div className="study-feedback" role="status"><h3>{session.answers.at(-1)?.skipped?'A starting point for learning':session.answers.at(-1)?.isCorrect?'✓ Correct':'Let’s look at it together'}</h3><p>{q.explanation}</p><p className="study-muted">{session.assisted?'Recorded as supported practice. A new problem will check independence.':'Recorded as one attempt. We will revisit later to check recall.'}</p><button className="study-button" onClick={next}>{session.index===session.questions.length-1?'Finish this block':'Next problem →'}</button></div>}
      </section><aside className="study-card support-card"><p className="eyebrow">A little support</p><h2>Remember the method</h2><p>One worked example, then a different problem for you. Use this whenever you need it.</p>
        <button className="study-button secondary" onClick={()=>persist({...session,exampleOpen:!session.exampleOpen,assisted:session.assisted || !session.checked})}>{session.exampleOpen?'Hide worked example':'Show one worked example'}</button>
        {session.exampleOpen && <div className="worked-example"><h3>{q.example.question}</h3><ol>{q.example.steps.map(step=><li key={step}>{step}</li>)}</ol></div>}
        <Link className="study-text-button" to="/rulebook" onClick={()=>{if(!session.checked)persist({...session,assisted:true});}}>Consult my rulebook</Link><p className="study-muted">{concept.bridge}</p><Link to="/">Pause & return to Today</Link><button className="study-text-button" style={{display:'block',marginTop:16}} onClick={()=>setChooseFocus(true)}>Choose a different focus</button>
      </aside></div>
    </> : <>
      <p className="eyebrow">Start small. Build something lasting.</p><h1>Arithmetic & fractions</h1><p className="study-intro">Rebuild the rules, practice the calculations, and come back later to see what sticks. Bring your paper.</p>
      {params.get('application')==='scale' && <section className="study-card"><h2>Fractions in scale drawings & measurements</h2><p>Two optional applications using fraction multiplication and addition. These are learning exercises with explicit assumptions, and paper is welcome.</p><button className="study-button" onClick={()=>{if(persist(makeEngineeringSession(attempts)))setChooseFocus(false);}}>Start the application block</button></section>}
      {q && <section className="study-card"><h2>Your paused block is saved</h2><p>Resume it, or start a new block below. Starting a new block replaces the paused block; completed answers stay in your learning record.</p><button className="study-button secondary" onClick={()=>setChooseFocus(false)}>Resume paused block</button></section>}
      {session && !q && <section className="study-card"><p className="eyebrow">Block complete</p><h2>{session.answers.filter(a=>a.isCorrect&&!a.assisted).length} independent correct · {session.answers.filter(a=>a.assisted).length} supported attempts</h2><p>Your answers are saved. Review the questions below, work through an example, or prepare a repair session.</p><Link className="study-text-button" to={`/review?session=${session.id}`}>Open saved session history</Link></section>}
      {session && !q && <SessionReview answers={session.answers.map((a,i)=>({...a,problem:a.problem || session.questions[i]}))} />}
      <section className="study-card recommendation-card"><p className="eyebrow">Suggested next step</p><h2>{recommendation.title}</h2><p>{recommendation.reason}</p><div className="study-controls"><label>Study time<select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>{[30,45,60].map(n=><option value={n} key={n}>{n} minutes</option>)}</select></label><label>Focus<select value={selectedConcept} onChange={e=>setSelectedConcept(e.target.value)}>{concepts.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div><div className="study-actions"><button className="study-button" onClick={()=>begin(!attempts.length?'baseline':recommendation.mode==='review' && selectedConcept===recommendation.id?'review':'guided')}>{!attempts.length?'Find my starting point':'Start a practice block'}</button><button className="study-button secondary" onClick={()=>begin('baseline')}>Check all six areas</button>{attempts.length>0 && <button className="study-button secondary" onClick={()=>begin('mixed')}>Mix arithmetic & fractions</button>}</div></section>
      <section><p className="eyebrow">Your foundation map</p><div className="concept-grid">{concepts.map(c=>{const profile=conceptProfile(c.id,attempts);return <article className="study-card concept-card" key={c.id}><span className="study-badge">{profile.state}</span><h2>{c.title}</h2><p>{c.description}</p><p className="study-muted">{profile.independent} independent attempts · {profile.assisted} supported</p><p className="study-muted">Preparation: {c.prerequisites.length?c.prerequisites.map(id=>concepts.find(item=>item.id===id).title).join(', '):'Start here'}</p><button className="study-text-button" onClick={()=>{setSelectedConcept(c.id);if(persist(makeFoundationSession('guided',c.id,attempts,minutes))) setChooseFocus(false);}}>Explore this skill →</button></article>;})}</div></section>
    </>}
  </div>;
}
