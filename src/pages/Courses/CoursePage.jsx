import { Link, useParams } from 'react-router-dom';
import { getCourse } from '../../data/courses/courseCatalog';
import { getAttemptsForUnit, getLessonProgress } from '../../utils/storage';

export default function CoursePage() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  if (!course || course.status !== 'active') return <div className="study-page"><p className="eyebrow">A future path</p><h1>{course?.title || 'Course not found'}</h1><p>This course is in preparation. Your math work will provide useful groundwork.</p><Link className="study-button secondary" to="/courses">Browse available courses</Link></div>;
  return <div className="v3-course">
    <Link className="study-text-button" to="/courses">All courses</Link>
    <header className="v3-unit-heading"><p className="eyebrow">A connected path · Explore freely</p><h1>{course.title}</h1><p className="study-intro">{course.subtitle}. Start with a useful topic; return to its preparation whenever you need it.</p><p className="study-muted">{course.units.filter(u => u.hasPractice).length} units with practice · {course.units.length} topics on the path</p></header>
    <div className="v3-course-path">{course.units.map(unit => {
      const attempts = getAttemptsForUnit(course.id, unit.id);
      const independent = attempts.filter(a => a.isCorrect && !a.assisted && !a.skipped).length;
      const lesson = getLessonProgress(unit.unitPath);
      const preparation = unit.prerequisites.map(id => course.units.find(u => u.id === id)?.title).filter(Boolean);
      return <Link className="v3-unit-row" key={unit.id} to={`/courses/${course.id}/${unit.id}`}>
        <span className="v3-unit-number">{String(unit.order).padStart(2, '0')}</span>
        <div><h2>{unit.title}</h2><p>{unit.description}</p>{preparation.length > 0 && <p className="study-muted">Preparation: {preparation.join(' · ')}</p>}</div>
        <span className="v3-unit-evidence">{unit.hasPractice ? attempts.length ? `${independent} independent correct` : 'Ready to explore' : unit.hasLab ? 'Visual lab available' : 'Content in preparation'}{lesson?.completed && <small>Explanation explored</small>}</span>
      </Link>;
    })}</div>
    <p className="study-muted">Exploring a lesson and solving independently are different kinds of progress. This path keeps both visible.</p>
  </div>;
}
