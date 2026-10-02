import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SessionReview from '../components/Study/SessionReview';
import LessonView from '../components/Lesson/LessonView';
import { useProgress } from '../hooks/useProgress';
import { learningPaths, getNextModule } from '../data/learningPaths';

const moduleMap = {
  // Geometry track
  'points-lines': () => import('../data/geometry/module1-points-lines.js'),
  'angles': () => import('../data/geometry/module2-angles.js'),
  'triangles': () => import('../data/geometry/module3-triangles.js'),
  'pythagorean': () => import('../data/geometry/module4-pythagorean.js'),
  'polygons': () => import('../data/geometry/module5-polygons.js'),
  'circles': () => import('../data/geometry/module6-circles.js'),
  'area-perimeter': () => import('../data/geometry/module7-area-perimeter.js'),
  'volume-surface': () => import('../data/geometry/module8-volume-surface.js'),
  'coordinate': () => import('../data/geometry/module9-coordinate.js'),
  'transformations': () => import('../data/geometry/module10-transformations.js'),

  // Algebra track
  'variables-expressions': () => import('../data/algebra/module1-variables-expressions.js'),
  'linear-equations': () => import('../data/algebra/module2-linear-equations.js'),
  'linear-inequalities': () => import('../data/algebra/module3-linear-inequalities.js'),
  'linear-functions': () => import('../data/algebra/module4-linear-functions.js'),
  'systems-equations': () => import('../data/algebra/module5-systems-equations.js'),
  'exponents-radicals': () => import('../data/algebra/module6-exponents-radicals.js'),
  'polynomials-factoring': () => import('../data/algebra/module7-polynomials-factoring.js'),
  'quadratic-equations': () => import('../data/algebra/module8-quadratic-equations.js'),
};

export default function ModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { updateModuleProgress, progress } = useProgress();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const track = learningPaths.find(path => path.modules.some(module => module.id === moduleId));
  const [saveError,setSaveError] = useState('');
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setQuizResults(null);
    setLoading(true);
    setError(null);

    const loadModule = async () => {
      try {
        if (moduleMap[moduleId]) {
          const mod = await moduleMap[moduleId]();
          if (!cancelled) setModuleData(mod.default || mod.moduleData);
        } else {
          setError(`Module "${moduleId}" content file not found.`);
        }
      } catch (err) {
        console.error("Error loading module:", err);
        setError("Failed to load module content. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadModule();
    return () => { cancelled = true; };
  }, [moduleId]);

  const handleLessonComplete = (lessonIndex) => {
    const previous = progress[moduleId] || {};
    const lessonIds = [...new Set([...(previous.lessonIds || []), lessonIndex])];
    try { updateModuleProgress(moduleId, { lessonIds, lessonsCompleted: lessonIds.length, totalLessons: moduleData.lessons.length });setSaveError('');return true; }
    catch(error) {setSaveError(error.message);return false;}
  };
  const handleComplete = (results) => {
    const lessonsCompleted = progress[moduleId]?.lessonsCompleted || 0;
    try { updateModuleProgress(moduleId, {
      completed: Boolean(results.passed && lessonsCompleted === moduleData.lessons.length),
      quizScore: results.percentage, quizPassed: results.passed,
      totalLessons: moduleData.lessons.length,
    });
    setQuizResults(results);setSaveError(''); } catch(error) {setSaveError(error.message);}
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 font-mono text-xs text-zinc-500">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-600"></div>
        <span>Loading lesson…</span>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center font-mono">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center text-xl font-bold mx-auto mb-4">
          !
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Module Load Error</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">{error || 'Unknown error'}</p>
        <Link to="/path/geometry" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
          ← Return to Geometry Curriculum
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto px-4 py-4 font-mono">
      {saveError && <p className="study-notice" role="alert">Progress was not saved: {saveError}</p>}
      {/* Breadcrumbs */}
      <nav className="flex text-xs text-zinc-400 dark:text-zinc-500 mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1.5">
          <li>
            <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link to={`/path/${track?.id || 'geometry'}`} className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              {learningPaths.find(t => t.modules.some(m => m.id === moduleId))?.title?.split(' ')[0] || 'Curriculum'}
            </Link>
          </li>
          <li>/</li>
          <li className="text-zinc-800 dark:text-zinc-200 font-semibold truncate">
            {moduleData.title}
          </li>
        </ol>
      </nav>

      {quizResults ? <section className="study-card">
        <p className="eyebrow">Quiz review</p>
        <h1>{quizResults.percentage}% · {quizResults.passed ? 'Quiz passed' : 'Keep practicing'}</h1>
        <p>{progress[moduleId]?.lessonsCompleted || 0} of {moduleData.lessons.length} lessons read. Quiz performance and lesson completion are recorded separately.</p>
        <button className="study-button" onClick={() => setQuizResults(null)}>Review this module</button>
        {quizResults.passed && getNextModule(track?.id, moduleId) && <button className="study-button secondary" onClick={() => navigate(`/module/${getNextModule(track?.id, moduleId).id}`)}>Explore the next module</button>}
        <SessionReview answers={quizResults.reviewAnswers || []}/>
      </section> : <LessonView key={moduleId}
        moduleData={{...moduleData,quiz:moduleData.quiz?.map(q=>({...q,moduleId}))}}
        onComplete={handleComplete}
        progress={progress[moduleId]}
        onLessonComplete={handleLessonComplete}
      />}
    </div>
  );
}
