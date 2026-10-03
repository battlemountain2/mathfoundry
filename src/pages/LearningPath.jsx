import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { learningPaths, getPath } from '../data/learningPaths';
import { useProgress } from '../hooks/useProgress';
import ProgressBar from '../components/Progress/ProgressBar';
import { getDiagnosticResults } from '../utils/storage';

export default function LearningPath() {
  const { pathId = 'geometry' } = useParams();
  const { progress } = useProgress();
  const path = getPath(pathId) || learningPaths[0];
  const diagnosticResults = getDiagnosticResults();
  
  const pathModules = path.modules || [];
  let pathCompletedLessons = 0;
  let pathTotalLessons = 0;
  pathModules.forEach(mod => {
    const modProg = progress[mod.id] || {};
    const total = mod.totalLessons || 4;
    pathTotalLessons += total;
    pathCompletedLessons += modProg.lessonsCompleted || (modProg.completed ? total : 0);
  });
  const pathProgress = pathTotalLessons > 0 ? Math.round((pathCompletedLessons / pathTotalLessons) * 100) : 0;
  
  // Helper to figure out if a module addresses identified gaps
  const isRecommended = (module) => {
    if (!diagnosticResults?.weakAreas) return false;
    return diagnosticResults.weakAreas.includes(module.category) || diagnosticResults.weakAreas.includes(module.id);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 py-6 space-y-8 font-mono">
      {/* Track Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="text-4xl p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shrink-0">
              {path.icon || '📐'}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                {path.id === 'algebra' ? 'Curriculum Track 02 // Symbolic & Functions' : 'Curriculum Track 01 // Spatial & Geometric'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {path.title}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1 leading-relaxed">
                {path.description || 'Master the building blocks of spatial reasoning, planar geometry, and vector measurement.'}
              </p>
            </div>
          </div>

          <div className="w-full md:w-60 shrink-0 bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 flex justify-between">
              <span>Lesson Completion</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{pathProgress}%</span>
            </div>
            <ProgressBar percentage={pathProgress} size="sm" color="indigo" />
          </div>
        </div>
      </div>

      {/* Modules Roadmap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">
            Curriculum Sequence [{path.modules.length} Units]
          </h2>
          {diagnosticResults && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>⚡</span> Personalized to your diagnostic gaps
            </span>
          )}
        </div>

        <div className="space-y-3">
          {path.modules?.map((module, index) => {
            const modProg = progress[module.id] || {};
            const totalLessons = module.totalLessons || 4;
            const lessonsCompleted = modProg.lessonsCompleted || (modProg.completed ? totalLessons : 0);
            const isCompleted = Boolean(modProg.completed);
            const inProgress = lessonsCompleted > 0 && !isCompleted;
            const recommended = isRecommended(module);
            const percentage = isCompleted ? 100 : Math.round((lessonsCompleted / totalLessons) * 100);

            return (
              <Link 
                key={module.id} 
                to={`/module/${module.id}`}
                className="block group"
              >
                <div className={`p-5 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'bg-white dark:bg-zinc-900/70 border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500/50' 
                    : inProgress 
                    ? 'bg-white dark:bg-zinc-900/90 border-indigo-400 dark:border-indigo-600 hover:border-indigo-500 shadow-xs' 
                    : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isCompleted 
                          ? 'bg-emerald-500 text-white border-emerald-600' 
                          : inProgress 
                          ? 'bg-indigo-600 text-white border-indigo-700' 
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {module.title}
                          </h3>
                          {recommended && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              ⚡ Gap Focus
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Mastered
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
                          {module.description}
                        </p>

                        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5 flex items-center gap-3">
                          <span>⏱ ~{module.estimatedMinutes || 25} min</span>
                          <span>•</span>
                          <span>{lessonsCompleted}/{totalLessons} lessons</span>
                          {modProg.quizScore !== undefined && (
                            <>
                              <span>•</span>
                              <span>Quiz: {modProg.quizScore}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:shrink-0 sm:w-48">
                      <div className="flex-1">
                        <ProgressBar percentage={percentage} size="sm" color={isCompleted ? 'emerald' : 'indigo'} />
                      </div>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
