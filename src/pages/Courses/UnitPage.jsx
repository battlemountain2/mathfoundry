import { Link, useParams } from 'react-router-dom';
import { getCourse } from '../../data/courses/courseCatalog';
import { getMathUnit } from '../../data/courses/mathFoundations';
import { getGeometryUnit } from '../../data/courses/geometryFoundations';
import { getAttemptsForUnit, getLessonProgress, getStudySession } from '../../utils/storage';
import VideoDrawer from '../../components/Study/VideoDrawer';

export default function UnitPage() {
  const { courseId, unitId } = useParams();
  const course = getCourse(courseId);
  const lookup = courseId === 'geometry' ? getGeometryUnit : getMathUnit;
  const unit = course?.status === 'active' ? lookup(unitId) : null;
  if (!unit) return <div className="study-page"><h1>Unit not found</h1><Link to="/courses">Browse courses</Link></div>;

  const base = `/courses/${course.id}/${unit.id}`;
  const attempts = getAttemptsForUnit(course.id, unit.id);
  const independent = attempts.filter(a => a.isCorrect && !a.assisted && !a.skipped).length;
  const supported = attempts.filter(a => a.assisted && !a.skipped).length;
  const misses = attempts.filter(a => !a.isCorrect && !a.skipped).length;
  const lesson = getLessonProgress(unit.unitPath);
  const session = getStudySession(`${courseId}/${unitId}:practice`);
  const resumable = session && !session.completed;
  const preparations = unit.prerequisites.map(id => lookup(id)).filter(Boolean);
  const labTitle = {'number-line':'Number line', 'angle-explorer':'Angles & transversals', 'pythagoras':'Pythagorean proof'}[unit.labType] || 'Fraction bars';

  return <div className="v3-unit">
    <nav className="v3-breadcrumb" aria-label="Breadcrumb"><Link to="/courses">Courses</Link><span>/</span><Link to={`/courses/${course.id}`}>{course.title}</Link></nav>
    <header className="v3-unit-heading"><p className="eyebrow">Unit {String(unit.order).padStart(2, '0')} · Your pace</p><h1>{unit.title}</h1><p className="study-intro">{unit.description}</p>
      {unit.hasPractice ? <div className="study-actions"><Link className="study-button" to={`${base}/practice`}>{resumable ? `Resume question ${session.index + 1}` : 'Start a study session'}</Link>{unit.hasPractice && <Link className="study-button secondary" to={`${base}/lesson`}>{lesson?.completed ? 'Revisit the explanation' : 'Start with an explanation'}</Link>}</div> : <p className="study-notice">Practice and unit checks are still being authored for this topic.</p>}
      <p className="study-muted">Paper welcome. Open support when you need it, or try a problem first.</p>
    </header>
    {preparations.length > 0 && <section className="v3-preparation"><span className="eyebrow">Useful preparation</span><div>{preparations.map(p => <Link key={p.id} to={`/courses/${course.id}/${p.id}`}>{p.title}</Link>)}</div><p className="study-muted">These topics connect to this unit. You’re free to explore in any order.</p></section>}
    <section className="v3-unit-activities" aria-label="Ways to study">
      {unit.hasPractice && <article><p className="eyebrow">Understand</p><h2>See how the idea works</h2><p>A brief introduction, a matching visual, and one worked example before a different problem.</p><Link className="study-text-button" to={`${base}/lesson`}>Open the guided introduction</Link></article>}
      {unit.hasLesson && <article><p className="eyebrow">Go deeper</p><h2>Explore the full lesson</h2><p>Additional authored explanations and guided activities.</p><Link className="study-text-button" to={`${base}/lesson/deep`}>Open the full lesson</Link></article>}
      {unit.hasLab && <article><p className="eyebrow">Explore</p><h2>{labTitle}</h2><p>Change the model and notice what stays the same.</p><Link className="study-text-button" to={`${base}/lab`}>Open the visual lab</Link></article>}
      {unit.legacyConceptId && <article><p className="eyebrow">Remember</p><h2>Refresh the rules</h2><p>Six untimed puzzles. Recognition is recorded separately from solving.</p><Link className="study-text-button" to={`/recall?focus=${unit.legacyConceptId}`}>Open Rule Match</Link></article>}
      {unit.hasPractice && unit.hasQuiz && <article><p className="eyebrow">Check</p><h2>Try a unit check</h2><p>Four questions with feedback after each. First answers and helped retries stay separate.</p><Link className="study-text-button" to={`${base}/quiz`}>Start a unit check</Link></article>}
      <article><p className="eyebrow">Reflect</p><h2>Look back at your work</h2><p>{attempts.length ? `${independent} independent correct submissions · ${supported} supported submissions · ${misses} incorrect submissions.` : 'No recorded attempts in this unit yet.'}</p><p className="study-muted">These are practice observations. Later independent recall still matters.</p><Link className="study-text-button" to={`/review?unit=${encodeURIComponent(unit.unitPath)}`}>Review answers & repair mistakes</Link></article>
      {unit.legacyConceptId === 'addition' && <article><p className="eyebrow">Connect</p><h2>Measured pieces</h2><p>Add material lengths and reason about what remains. A small step toward engineering.</p><Link className="study-text-button" to={`${base}/application`}>Try an engineering connection</Link></article>}
    </section>
    <VideoDrawer unitId={unit.id}/>
  </div>;
}
