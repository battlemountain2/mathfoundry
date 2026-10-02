import { Link } from 'react-router-dom';
import { concepts } from '../data/foundations';
import { conceptProfile } from '../utils/learningProfile';
import { getLearningAttempts } from '../utils/storage';
import React from 'react';
import { useProgress } from '../hooks/useProgress';
import { ProgressDashboard } from '../components/Progress/ProgressDashboard';

export default function Progress() {
  const { progress, streak, diagnosticResults } = useProgress();

  return (
    <div className="animate-fade-in py-4">
      <section className="study-page" style={{paddingBottom:0}}><p className="eyebrow">Foundation evidence</p><h1 style={{fontSize:'2.4rem'}}>What your work shows</h1><div className="concept-grid">{concepts.map(concept=>{const p=conceptProfile(concept.id,getLearningAttempts());return <Link to={`/foundations?concept=${concept.id}`} className="study-card concept-card" key={concept.id}><span className="study-badge">{p.state}</span><h2>{concept.title}</h2><p>{p.independent} independent attempts · {p.assisted} supported attempts</p>{p.due && <p>Ready for a later recall check</p>}</Link>;})}</div><p className="study-muted">Independent: three recent correct independent attempts across at least two blocks. Retained also requires a successful check at least 48 hours later. This is a starter evidence policy, not a certification.</p></section>
      <section className="study-card"><h2>Your recent work</h2><p className="study-muted">Keep the problem and feedback together. An incorrect final answer alone cannot tell us whether the cause was arithmetic or a forgotten rule.</p>{getLearningAttempts().slice(-5).reverse().map(attempt=><details key={attempt.id} className="work-record"><summary>{attempt.question} · {attempt.skipped?'Not sure yet':attempt.isCorrect?'Correct':'Revisit'}{attempt.assisted?' · Worked example used':''}</summary><p>Your answer: {attempt.submittedAnswer ?? 'Skipped'}</p><p>Expected: {attempt.expectedAnswer}</p><p>{attempt.explanation || 'Feedback was not recorded for this earlier attempt.'}</p><Link className="study-text-button" to={`/foundations?concept=${attempt.conceptId}`}>Practice this concept →</Link></details>)}{!getLearningAttempts().length && <p>Your foundation attempts will appear here after your first check.</p>}</section>
      <ProgressDashboard
        progress={progress}
        diagnosticResults={diagnosticResults}
        streak={streak}
      />
    </div>
  );
}
