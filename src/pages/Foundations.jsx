import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { concepts, makeFoundationSession, makeEngineeringSession } from '../data/foundations';
import { getFoundationSession,setFoundationSession,getLearningAttempts,saveLearningAttempt } from '../utils/storage';
import { foundationRecommendation,conceptProfile } from '../utils/learningProfile';
import { equivalentAnswer, numericValue, analyzeIntermediateStep } from '../utils/answerChecking';
import { getProblemHint } from '../utils/hints';
import SessionReview from '../components/Study/SessionReview';
import FractionBarVisualizer from '../components/Study/FractionBarVisualizer';
import { useStudyActivity } from '../components/Study/ActivityContext';

const HINT_FIXTURE_SESSION = {
  id: 'fixture-active-foundations',
  mode: 'guided',
  minutes: 30,
  index: 0,
  questions: [
    {
      id: 'addition-active',
      conceptId: 'addition',
      question: 'Add 1/4 + 1/6. Enter a fraction.',
      answer: '5/12',
      explanation: 'Use common denominator 12: 3/12 + 2/12 = 5/12.',
      example: {
        question: 'Add 1/3 + 1/4.',
        steps: ['Common denominator is 12.', '4/12 + 3/12 = 7/12.'],
      },
    },
  ],
  answers: [
    {
      id: 'fixture-active-foundations:0',
      sessionId: 'fixture-active-foundations',
      conceptId: 'addition',
      problemId: 'addition-active',
      question: 'Add 1/4 + 1/6. Enter a fraction.',
      submittedAnswer: '2/10',
      initialAnswer: '2/10',
      expectedAnswer: '5/12',
      explanation: 'Use common denominator 12: 3/12 + 2/12 = 5/12.',
      isCorrect: false,
      skipped: false,
      assisted: false,
    },
  ],
  input: '2/10',
  attemptsOnCurrent: 1,
  initialAnswer: '2/10',
  showHint: true,
  showSolution: false,
  assisted: true,
  checked: true,
  exampleOpen: false,
};

export default function Foundations() {
  const [params]=useSearchParams();
  const [session,setSession]=useState(()=> {
    if (params.get('fixture') === 'hint') return HINT_FIXTURE_SESSION;
    return getFoundationSession();
  });
  const [chooseFocus,setChooseFocus]=useState(params.get('application')==='scale');
  const [showFractionLab,setShowFractionLab]=useState(params.get('lab')==='fraction-bars');
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
    if (!skipped && q.format!=='rule' && numericValue(session.input)===null) {
      setError('Enter a number or a fraction such as 3/4. An input-format issue will not be counted as a wrong math answer.');
      return;
    }
    const isCorrect=!skipped && (q.format==='rule' ? Number(session.input)===q.answer : equivalentAnswer(session.input,q.answer));
    const submittedDisplay = skipped ? null : q.format==='rule' ? q.options[Number(session.input)] : session.input;
    const expectedDisplay = q.format==='rule' ? q.options[q.answer] : q.answer;
    const stepAnalysis = session.intermediateStep ? analyzeIntermediateStep(q, session.intermediateStep) : null;
    
    // First attempt on this question?
    const attemptsCount = (session.attemptsOnCurrent || 0) + 1;
    const initialAnswer = session.initialAnswer ?? submittedDisplay;
    const isHelped = Boolean(session.assisted || session.attemptsOnCurrent > 0);

    const attempt={
      id: `${session.id}:${session.index}`,
      sessionId: session.id,
      conceptId: q.conceptId,
      problemId: q.id,
      problem: q,
      question: q.question,
      submittedAnswer: submittedDisplay,
      initialAnswer: initialAnswer,
      expectedAnswer: expectedDisplay,
      intermediateStep: session.intermediateStep || null,
      explanation: q.explanation,
      format: q.format,
      isCorrect,
      skipped,
      assisted: isHelped,
      mode: session.mode,
      timestamp: new Date().toISOString()
    };

    try {
      if (skipped || isCorrect) {
        // Correct or skipped: completed, show solution/explanation
        const nextSession = {
          ...session,
          checked: true,
          showSolution: true,
          showHint: false,
          attemptsOnCurrent: attemptsCount,
          initialAnswer,
          stepAnalysis,
          answers: [...session.answers.filter(a => a.id !== attempt.id), attempt]
        };
        saveLearningAttempt(attempt, nextSession);
        setAttempts(getLearningAttempts());
        setSession(getFoundationSession());
        setError('');
      } else {
        // Incorrect: record the attempt, show hint, allow retry without auto-revealing solution
        const nextSession = {
          ...session,
          checked: true,
          showSolution: false,
          showHint: true,
          attemptsOnCurrent: attemptsCount,
          initialAnswer,
          stepAnalysis,
          answers: [...session.answers.filter(a => a.id !== attempt.id), attempt]
        };
        saveLearningAttempt(attempt, nextSession);
        setAttempts(getLearningAttempts());
        setSession(getFoundationSession());
        setError('');
      }
    } catch(e) {setError(e.message);}
  }

  function handleRetry() {
    persist({
      ...session,
      checked: false,
      showHint: true,
      assisted: true, // viewed hint or retry makes it assisted
    });
  }

  function handleWalkThrough() {
    persist({
      ...session,
      showSolution: true,
      assisted: true,
    });
  }

  function next() {
    persist({
      ...session,
      index: session.index + 1,
      input: '',
      intermediateStep: '',
      attemptsOnCurrent: 0,
      initialAnswer: null,
      showHint: false,
      showSolution: false,
      stepAnalysis: null,
      assisted: false,
      checked: false,
      exampleOpen: false
    });
  }

  const concept=concepts.find(c=>c.id===q?.conceptId);
  const lastAnswer = session?.answers?.find(a => a.id === `${session?.id}:${session?.index}`);
  const isIncorrectPendingSolution = session?.checked && !lastAnswer?.isCorrect && !lastAnswer?.skipped && !session?.showSolution;

  return <div className="study-page">
    <nav className="study-breadcrumb"><Link to="/">Today</Link><span>/</span><span>Foundations</span></nav>
    {error && <p className="study-notice" role="alert">{error}</p>}
    {active ? <>
      <div className="study-session-header"><div><p className="eyebrow">{session.mode==='baseline'?'Starting-point check':session.mode==='review'?'Recall check':'Practice block'} · {session.minutes}-minute study plan</p><h1>{concept.title}</h1></div><span>{session.index+1} / {session.questions.length}</span></div>
      <progress aria-label="Block progress" value={session.index} max={session.questions.length} />
      <div className="study-workspace"><section className="study-card problem-card">
        <p className="study-muted">Paper welcome · Untimed · {q.format==='rule'?'Reason about the rule':'Work it out at your own pace'}</p>
        <h2>{q.question}</h2>

        {session.showHint && !session.checked && (
          <div className="hint-callout animate-fade-in">
            <p className="hint-title">Targeted Hint</p>
            <p>{getProblemHint(q)}</p>
          </div>
        )}

        {q.format==='visual' && <div className="fraction-lab">
          <p>Original amount: {q.numerator}/{q.sourceDenominator}</p>
          <div className="fraction-strip" style={{gridTemplateColumns:`repeat(${q.sourceDenominator},1fr)`}}>{Array.from({length:q.sourceDenominator},(_,i)=><span key={i} className={i<q.numerator?'filled':''} />)}</div>
          <label htmlFor="parts">Smaller parts selected: {Number(session.input)||0} / {q.denominator}</label>
          <input id="parts" type="range" min="0" max={q.denominator} value={session.input || 0} disabled={session.checked} onChange={e=>persist({...session,input:e.target.value})} />
          <div className="fraction-strip" style={{gridTemplateColumns:`repeat(${q.denominator},1fr)`}}>{Array.from({length:q.denominator},(_,i)=><span key={i} className={i<Number(session.input)?'filled':''} />)}</div>
        </div>}

        <form onSubmit={e=>{e.preventDefault();submit();}}>
          {q.format==='rule' ? (
            <fieldset disabled={session.checked} className="study-options">
              <legend className="sr-only">Choose your answer</legend>
              {q.options.map((option,i)=>(
                <label key={option} className={Number(session.input)===i && session.input!==''?'selected':''}>
                  <input type="radio" name="answer" value={i} checked={session.input===String(i)} onChange={e=>persist({...session,input:e.target.value})} />
                  {option}
                </label>
              ))}
            </fieldset>
          ) : q.format!=='visual' && (
            <>
              <label htmlFor="answer">Your answer</label>
              <input id="answer" className="study-answer" autoComplete="off" value={session.input} disabled={session.checked} onChange={e=>persist({...session,input:e.target.value})} placeholder="For example: 3/4 or 0.75" />
              <p className="study-muted">Equivalent fractions and exact decimals are accepted. You can keep intermediate work on paper.</p>
              
              {['addition', 'arithmetic'].includes(q.conceptId) && !session.checked && (
                <div className="optional-step-container">
                  <label htmlFor="intermediate-step">
                    Optional: show one intermediate step (e.g. chosen common denominator or decomposed parts)
                    <span className="study-muted" style={{display:'block',fontWeight:400}}>
                      Skip if solved directly on paper. Valid alternative common denominators accepted.
                    </span>
                  </label>
                  <input
                    id="intermediate-step"
                    className="study-answer"
                    value={session.intermediateStep || ''}
                    onChange={e=>persist({...session,intermediateStep:e.target.value})}
                    placeholder={q.conceptId==='addition'?'e.g. common denominator 12':'e.g. 30 + 12'}
                  />
                </div>
              )}
            </>
          )}

          {!session.checked && (
            <div className="study-actions">
              <button className="study-button" disabled={session.input===''}>Check answer</button>
              <button className="study-button secondary" type="button" onClick={()=>submit(true)}>Not sure yet</button>
            </div>
          )}
        </form>

        {session.checked && (
          <div
            className={`study-feedback ${
              lastAnswer?.skipped
                ? 'feedback-skipped'
                : lastAnswer?.isCorrect
                ? 'feedback-correct'
                : 'feedback-incorrect'
            }`}
            role="status"
          >
            {lastAnswer?.skipped ? (
              <>
                <div className="study-badge skipped" style={{marginBottom: 8}}>— Skipped</div>
                <h3>A starting point for learning</h3>
                <div className="answer-comparison-box">
                  <div className="comparison-col expected-answer">
                    <span className="comparison-label">Expected answer</span>
                    <span className="comparison-value">{lastAnswer.expectedAnswer}</span>
                  </div>
                </div>
                <p>{q.explanation}</p>
                <button className="study-button" onClick={next}>
                  {session.index===session.questions.length-1?'Finish this block':'Next problem →'}
                </button>
              </>
            ) : lastAnswer?.isCorrect ? (
              <>
                <div className="study-badge correct" style={{marginBottom: 8}}>
                  {session.assisted || session.attemptsOnCurrent > 1 ? '✓ Correct after hint' : '✓ Correct'}
                </div>
                <h3>{session.assisted || session.attemptsOnCurrent > 1 ? 'Solid work sticking with it' : '✓ Correct'}</h3>
                <div className="answer-comparison-box">
                  <div className="comparison-col your-answer is-correct">
                    <span className="comparison-label">Your answer</span>
                    <span className="comparison-value">{lastAnswer.submittedAnswer}</span>
                    {lastAnswer.initialAnswer && lastAnswer.initialAnswer !== lastAnswer.submittedAnswer && (
                      <span className="comparison-subtext">First attempt: {lastAnswer.initialAnswer}</span>
                    )}
                  </div>
                </div>
                <p>{q.explanation}</p>
                <p className="study-muted">
                  {session.assisted
                    ? 'Recorded as supported practice. A new problem will check independence later.'
                    : 'Recorded as an independent attempt. We will revisit later to check recall.'}
                </p>
                <button className="study-button" onClick={next}>
                  {session.index===session.questions.length-1?'Finish this block':'Next problem →'}
                </button>
              </>
            ) : isIncorrectPendingSolution ? (
              <>
                <div className="study-badge incorrect" style={{marginBottom: 8}}>✗ Incorrect</div>
                <h3>Not quite yet</h3>
                <p>Your answer: <strong>{lastAnswer?.submittedAnswer || session.input}</strong></p>

                {session.stepAnalysis && (
                  <p className="study-notice" style={{margin: '10px 0'}}>
                    {session.stepAnalysis.message}
                  </p>
                )}

                <div className="hint-callout">
                  <p className="hint-title">Hint</p>
                  <p>{getProblemHint(q)}</p>
                </div>

                <div className="study-actions" style={{marginTop: 18}}>
                  <button className="study-button" onClick={handleRetry}>
                    Try again
                  </button>
                  <button className="study-button secondary" onClick={handleWalkThrough}>
                    Walk me through it
                  </button>
                  {session.attemptsOnCurrent >= 2 && (
                    <button className="study-text-button" onClick={next} style={{display:'block',marginTop:8}}>
                      Move to next problem without solution
                    </button>
                  )}
                </div>
              </>
            ) : (
              // Solution revealed on explicit request
              <>
                <div className="study-badge incorrect" style={{marginBottom: 8}}>✗ Solution Revealed</div>
                <h3>Walk me through it</h3>
                <div className="answer-comparison-box">
                  <div className="comparison-col your-answer is-wrong">
                    <span className="comparison-label">Your answer</span>
                    <span className="comparison-value">{lastAnswer?.submittedAnswer || 'Not answered'}</span>
                    {lastAnswer?.initialAnswer && lastAnswer?.initialAnswer !== lastAnswer?.submittedAnswer && (
                      <span className="comparison-subtext">First attempt: {lastAnswer.initialAnswer}</span>
                    )}
                  </div>
                  <div className="comparison-col expected-answer">
                    <span className="comparison-label">Expected answer</span>
                    <span className="comparison-value">{lastAnswer?.expectedAnswer}</span>
                  </div>
                </div>
                <h3>Why this method works</h3>
                <p>{q.explanation}</p>
                <p className="study-muted">
                  Recorded as supported practice. Return later to test independent recall.
                </p>
                <button className="study-button" onClick={next}>
                  {session.index===session.questions.length-1?'Finish this block':'Next problem →'}
                </button>
              </>
            )}
          </div>
        )}
      </section><aside className="study-card support-card"><p className="eyebrow">A little support</p><h2>Remember the method</h2><p>One worked example, then a different problem for you. Use this whenever you need it.</p>
        <button className="study-button secondary" onClick={()=>persist({...session,exampleOpen:!session.exampleOpen,assisted:session.assisted || !session.checked})}>{session.exampleOpen?'Hide worked example':'Show one worked example'}</button>
        {session.exampleOpen && <div className="worked-example"><h3>{q.example.question}</h3><ol>{q.example.steps.map(step=><li key={step}>{step}</li>)}</ol></div>}
        {q?.conceptId === 'addition' && (
          <button
            className="study-button secondary"
            style={{ display: 'block', marginTop: 10, width: '100%', fontSize: 13 }}
            onClick={() => setShowFractionLab(!showFractionLab)}
          >
            {showFractionLab ? 'Hide fraction bar visualizer' : 'Open fraction bar visualizer'}
          </button>
        )}
        {showFractionLab && q && <div style={{ marginTop: 16 }}><FractionBarVisualizer /></div>}
        <Link className="study-text-button" to="/rulebook" onClick={()=>{if(!session.checked)persist({...session,assisted:true});}}>Consult my rulebook</Link><p className="study-muted">{concept.bridge}</p><Link to="/">Pause & return to Today</Link><button className="study-text-button" style={{display:'block',marginTop:16}} onClick={()=>setChooseFocus(true)}>Choose a different focus</button>
      </aside></div>
    </> : <>
      <p className="eyebrow">Start small. Build something lasting.</p><h1>Arithmetic & fractions</h1><p className="study-intro">Rebuild the rules, practice the calculations, and come back later to see what sticks. Bring your paper.</p>
      <section className="study-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p className="eyebrow">Interactive Concept Lab</p>
            <h2 style={{ margin: '4px 0 0' }}>Fraction Bars & Common Denominators</h2>
            <p className="study-muted" style={{ margin: '6px 0 0' }}>
              Interactive repartitioning showing why fractions need equal-sized parts before adding (1/2 + 1/3, 1/4 + 1/6).
            </p>
          </div>
          <button className="study-button secondary" onClick={() => setShowFractionLab(!showFractionLab)}>
            {showFractionLab ? 'Close interactive lab' : 'Open interactive lab →'}
          </button>
        </div>
        {showFractionLab && <div style={{ marginTop: 24 }}><FractionBarVisualizer /></div>}
      </section>
      {params.get('application')==='scale' && <section className="study-card"><h2>Fractions in scale drawings & measurements</h2><p>Two optional applications using fraction multiplication and addition. These are learning exercises with explicit assumptions, and paper is welcome.</p><button className="study-button" onClick={()=>{if(persist(makeEngineeringSession(attempts)))setChooseFocus(false);}}>Start the application block</button></section>}
      {q && <section className="study-card"><h2>Your paused block is saved</h2><p>Resume it, or start a new block below. Starting a new block replaces the paused block; completed answers stay in your learning record.</p><button className="study-button secondary" onClick={()=>setChooseFocus(false)}>Resume paused block</button></section>}
      {session && !q && <section className="study-card"><p className="eyebrow">Block complete</p><h2>{session.answers.filter(a=>a.isCorrect&&!a.assisted).length} independent correct · {session.answers.filter(a=>a.assisted).length} supported attempts</h2><p>Your answers are saved. Review the questions below, work through an example, or prepare a repair session.</p><Link className="study-text-button" to={`/review?session=${session.id}`}>Open saved session history</Link></section>}
      {session && !q && <SessionReview sessionId={session.id} answers={session.answers.map((a,i)=>({...a,problem:a.problem || session.questions[i]}))} />}
      <section className="study-card recommendation-card"><p className="eyebrow">Suggested next step</p><h2>{recommendation.title}</h2><p>{recommendation.reason}</p><div className="study-controls"><label>Study time<select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>{[30,45,60].map(n=><option value={n} key={n}>{n} minutes</option>)}</select></label><label>Focus<select value={selectedConcept} onChange={e=>setSelectedConcept(e.target.value)}>{concepts.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div><div className="study-actions"><button className="study-button" onClick={()=>begin(!attempts.length?'baseline':recommendation.mode==='review' && selectedConcept===recommendation.id?'review':'guided')}>{!attempts.length?'Find my starting point':'Start a practice block'}</button><button className="study-button secondary" onClick={()=>begin('baseline')}>Check all six areas</button>{attempts.length>0 && <button className="study-button secondary" onClick={()=>begin('mixed')}>Mix arithmetic & fractions</button>}</div></section>
      <section><p className="eyebrow">Your foundation map</p><div className="concept-grid">{concepts.map(c=>{const profile=conceptProfile(c.id,attempts);return <article className="study-card concept-card" key={c.id}><span className="study-badge">{profile.state}</span><h2>{c.title}</h2><p>{c.description}</p><p className="study-muted">{profile.independent} independent attempts · {profile.assisted} supported</p><p className="study-muted">Preparation: {c.prerequisites.length?c.prerequisites.map(id=>concepts.find(item=>item.id===id).title).join(', '):'Start here'}</p><button className="study-text-button" onClick={()=>{setSelectedConcept(c.id);if(persist(makeFoundationSession('guided',c.id,attempts,minutes))) setChooseFocus(false);}}>Explore this skill →</button></article>;})}</div></section>
    </>}
  </div>;
}
