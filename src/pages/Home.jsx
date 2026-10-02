import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getLearningAttempts,getFoundationSession,getDiagnosticResults } from '../utils/storage';
import { concepts } from '../data/foundations';
import { conceptProfile,foundationRecommendation } from '../utils/learningProfile';
import { useProgress } from '../hooks/useProgress';
export default function Home() {
  useProgress(); // Shared store subscription keeps this screen current after saves.
  const attempts=getLearningAttempts();
  const session=getFoundationSession();
  const resume=session?.questions?.[session.index];
  const recommendation=foundationRecommendation(attempts);
  const profiles=concepts.map(c=>({...c,...conceptProfile(c.id,attempts)}));
  const [minutes,setMinutes]=useState(30);
  const diagnostic=getDiagnosticResults();
  const due=profiles.filter(p=>p.due);
  return <div className="study-page today-page">
    <div className="today-heading"><div><p className="eyebrow">Your personal learning companion</p><h1>A little clearer,<br /><em>every day.</em></h1></div><div className="today-note">Paper beside you.<br />Room to think.<br />One thing at a time.</div></div>
    <div className="today-grid"><section className="study-card today-main"><p className="eyebrow">{resume?'Your saved study block':!attempts.length?'Begin with a starting point':'Today’s next step'}</p><h2>{resume?concepts.find(c=>c.id===resume.conceptId)?.title:!attempts.length?'Let’s find your footing.':recommendation.title}</h2><p>{resume?`Pick up at question ${session.index+1} of ${session.questions.length}. Your answers and worked-example use are saved.`:!attempts.length?'A short check of arithmetic and fractions will help us choose what to practice. “Not sure yet” is a useful answer, too.':recommendation.reason}</p>
      <div className="study-time"><span>Make room for</span><div role="group" aria-label="Study plan duration">{[30,45,60].map(n=><button key={n} aria-pressed={minutes===n} onClick={()=>setMinutes(n)} className={minutes===n?'active':''}>{n} min</button>)}</div></div>
      <Link className="study-button" to={`/foundations?minutes=${minutes}&concept=${recommendation.id}`}>{resume?'Resume my block →':!attempts.length?'Find my starting point →':'Start studying →'}</Link><p className="study-muted">Untimed problems · Paper welcome · Optional worked examples</p>
      <div className="today-motif" aria-hidden="true"><span>½</span><span>＝</span><span>²⁄₄</span><span className="motif-line" /></div>
    </section><aside className="study-card today-side"><p className="eyebrow">What’s sticking?</p><h2>Evidence, over guesses.</h2><p>{!attempts.length?'Your foundation skills are unassessed. We’ll learn where you are through your work.':`${attempts.filter(a=>!a.skipped&&!a.assisted).length} independent attempts and ${attempts.filter(a=>a.assisted).length} supported attempts recorded.`}</p><div className="recall-list">{due.length?due.map(p=><Link key={p.id} to={`/foundations?concept=${p.id}`}>{p.title}<span>Ready for recall →</span></Link>):<p className="study-muted">Later recall checks become available 48 hours after independent success. Same-day practice shows progress, not retention.</p>}</div><Link className="study-text-button" to="/foundations">Open my foundation map →</Link></aside></div>
    <section className="today-foundations"><div className="section-heading"><div><p className="eyebrow">A connected foundation</p><h2>Small skills. Bigger possibilities.</h2></div><Link to="/foundations">Explore the map →</Link></div><div className="concept-grid">{profiles.slice(0,3).map(p=><Link className="study-card concept-card" key={p.id} to={`/foundations?concept=${p.id}`}><span className="study-badge">{p.state}</span><h3>{p.title}</h3><p>{p.description}</p><span className="study-muted">{p.bridge}</span></Link>)}</div></section>
    <section className="study-card today-paths"><div><p className="eyebrow">Keep exploring</p><h2>Your larger math journey</h2><p>Geometry and algebra are available alongside foundations. Shared concepts will later connect to physics, chemistry and coding.</p>{diagnostic && <p className="study-muted">Your saved geometry diagnostic is still available. It does not assess arithmetic or fractions.</p>}</div><div className="study-actions"><Link className="study-button secondary" to="/path/algebra">Algebra</Link><Link className="study-button secondary" to="/path/geometry">Geometry</Link><Link className="study-text-button" to="/overview">Previous dashboard →</Link></div></section>
  </div>;
}
