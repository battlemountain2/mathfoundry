import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from './ProgressBar';
import { BadgeDisplay } from './BadgeDisplay';
import { learningPaths } from '../../data/learningPaths';

const categoryLabels = {
  'basic-shapes': 'Points, Lines & Planes',
  'angles': 'Angles & Relationships',
  'triangles': 'Triangles & Trigonometry Basics',
  'pythagorean': 'Pythagorean Theorem & Distance',
  'polygons': 'Polygons & Quadrilaterals',
  'circles': 'Circles & Circular Geometry',
  'area-perimeter': 'Area, Perimeter & Composite Figures',
  'volume-surface': '3D Solids & Spatial Geometry',
  'coordinate-geometry': 'Coordinate Geometry & Vectors',
  'transformations': 'Transformations & Symmetry',
  'algebra': 'Algebra Foundations & Functions',
};

const categoryToModuleMap = {
  'basic-shapes': 'points-lines',
  'angles': 'angles',
  'triangles': 'triangles',
  'pythagorean': 'pythagorean',
  'polygons': 'polygons',
  'circles': 'circles',
  'area-perimeter': 'area-perimeter',
  'volume-surface': 'volume-surface',
  'coordinate-geometry': 'coordinate',
  'transformations': 'transformations',
};

export const ProgressDashboard = ({ progress = {}, diagnosticResults = null, streak = 0 }) => {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'geometry' | 'algebra'

  const geometryTrack = learningPaths.find(p => p.id === 'geometry');
  const algebraTrack = learningPaths.find(p => p.id === 'algebra');

  const geometryModules = geometryTrack?.modules || [];
  const algebraModules = algebraTrack?.modules || [];
  const allModules = [...geometryModules, ...algebraModules];

  const displayedModules = activeFilter === 'geometry'
    ? geometryModules
    : activeFilter === 'algebra'
    ? algebraModules
    : allModules;

  // Streak normalization
  const currentStreak = typeof streak === 'object' ? (streak?.current || 0) : (Number(streak) || 0);
  const bestStreak = typeof streak === 'object' ? (streak?.best || currentStreak) : currentStreak;

  // Calculate stats across all active modules
  let totalLessonsCount = 0;
  let completedLessonsCount = 0;
  let completedModulesCount = 0;
  let totalPercentageSum = 0;

  allModules.forEach(mod => {
    const modProg = progress[mod.id] || {};
    const total = mod.totalLessons || 4;
    totalLessonsCount += total;
    const modCompletedLessons = modProg.lessonsCompleted || (modProg.completed ? total : 0);
    completedLessonsCount += modCompletedLessons;

    if (modProg.completed) {
      completedModulesCount += 1;
      totalPercentageSum += 100;
    } else {
      const pct = Math.round((modCompletedLessons / total) * 100);
      totalPercentageSum += pct;
    }
  });

  const overallPercentage = allModules.length > 0
    ? Math.round(totalPercentageSum / allModules.length)
    : 0;

  // Normalize diagnostic categories safely (handles object or array)
  const categoryList = React.useMemo(() => {
    if (!diagnosticResults?.categories) return [];
    if (Array.isArray(diagnosticResults.categories)) {
      return diagnosticResults.categories;
    }
    return Object.entries(diagnosticResults.categories).map(([key, data]) => ({
      id: key,
      name: categoryLabels[key] || key,
      moduleId: categoryToModuleMap[key] || 'points-lines',
      ...data,
    }));
  }, [diagnosticResults]);

  const stats = [
    {
      label: 'Lesson Completion',
      value: `${overallPercentage}%`,
      sub: `${completedModulesCount} of ${allModules.length} units completed`,
      icon: '📐'
    },
    {
      label: 'Engineering Streak',
      value: `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`,
      sub: `Best: ${bestStreak} days`,
      icon: '⚡'
    },
    {
      label: 'Lessons Cleared',
      value: `${completedLessonsCount}`,
      sub: `out of ${totalLessonsCount} foundational lessons`,
      icon: '✓'
    },
    {
      label: 'Diagnostic Status',
      value: diagnosticResults ? `${diagnosticResults.overallScore || 0}%` : 'Not Evaluated',
      sub: diagnosticResults ? `${diagnosticResults.weakAreas?.length || 0} gap areas identified` : 'Take quiz to map gaps',
      icon: '🎯'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Telemetry & Telemetrics
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Engineering Knowledge Matrix
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Quantified spatial and symbolic competency across Geometry & Algebra tracks.
          </p>
        </div>
        <div className="flex gap-2">
          {!diagnosticResults && (
            <Link to="/diagnostic">
              <Button size="sm" variant="primary">
                Run Diagnostic Assessment →
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} padding="p-5" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{stat.label}</div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{stat.sub}</div>
              </div>
              <span className="text-xl p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
                {stat.icon}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Diagnostic Gaps Breakdown Section */}
      {diagnosticResults ? (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>🎯 Foundational Gap Analysis</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Overall: {diagnosticResults.overallScore || 0}%
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Pinpointed from your diagnostic responses. Start with the prioritized focus areas below.
              </p>
            </div>
            <Link to="/diagnostic">
              <Button size="sm" variant="secondary">
                Retake Assessment ↺
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryList.map((cat) => {
              const isWeak = cat.level === 'weak' || cat.percentage < 50;
              const isMod = cat.level === 'moderate' || (cat.percentage >= 50 && cat.percentage < 80);
              const color = isWeak ? 'rose' : isMod ? 'amber' : 'emerald';
              const targetModId = cat.moduleId || categoryToModuleMap[cat.id] || 'points-lines';

              return (
                <div
                  key={cat.id || cat.name}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        Score: {cat.correct}/{cat.total} ({cat.percentage}%)
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      isWeak ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                      isMod ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isWeak ? 'Priority Gap' : isMod ? 'Review' : 'Mastered'}
                    </span>
                  </div>

                  <div className="space-y-2 mt-1">
                    <ProgressBar
                      percentage={cat.percentage}
                      color={color}
                      size="sm"
                    />
                    <div className="flex justify-end">
                      <Link
                        to={`/module/${targetModId}`}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Launch Module →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🎯 Step 1: Discover Your Foundational Gaps</span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
              You haven't run the diagnostic yet. It takes ~5 minutes and tests 10 core geometry competencies so you don't waste time on what you already know.
            </p>
          </div>
          <Link to="/diagnostic" className="shrink-0">
            <Button variant="primary">
              Run Free Diagnostic →
            </Button>
          </Link>
        </Card>
      )}

      {/* Curriculum Tracks and Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Module breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>📚 Curriculum Units</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {displayedModules.length} Modules
                </span>
              </h2>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                All (18)
              </button>
              <button
                onClick={() => setActiveFilter('geometry')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeFilter === 'geometry'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                📐 Geometry (10)
              </button>
              <button
                onClick={() => setActiveFilter('algebra')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeFilter === 'algebra'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                ∑ Algebra (8)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {displayedModules.map((mod, idx) => {
              const modProg = progress[mod.id] || {};
              const totalLessons = mod.totalLessons || 4;
              const lessonsDone = modProg.lessonsCompleted || (modProg.completed ? totalLessons : 0);
              const percentage = modProg.completed ? 100 : Math.round((lessonsDone / totalLessons) * 100);
              const isCompleted = Boolean(modProg.completed);
              const inProgress = lessonsDone > 0 && !isCompleted;
              const isAlgebra = mod.track === 'algebra' || mod.category === 'algebra';

              return (
                <div
                  key={mod.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 w-full sm:w-1/2">
                    <span className="text-xl p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shrink-0">
                      {mod.icon || (isAlgebra ? '∑' : '📐')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isAlgebra
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {isAlgebra ? 'ALGEBRA' : 'GEOMETRY'}
                        </span>
                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {mod.title}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {mod.description}
                      </p>
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                        {lessonsDone} / {totalLessons} lessons completed
                        {modProg.quizScore !== undefined && ` • Quiz: ${modProg.quizScore}%`}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 flex items-center gap-4">
                    <div className="flex-1">
                      <ProgressBar
                        percentage={percentage}
                        color={isCompleted ? 'emerald' : inProgress ? 'indigo' : 'indigo'}
                        showLabel={true}
                        size="sm"
                      />
                    </div>
                    <Link to={`/module/${mod.id}`} className="shrink-0">
                      <Button
                        size="sm"
                        variant={isCompleted ? 'ghost' : inProgress ? 'primary' : 'secondary'}
                      >
                        {isCompleted ? 'Review' : inProgress ? 'Resume' : 'Start'}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Badges */}
        <div className="lg:col-span-1">
          <BadgeDisplay
            progress={progress}
            diagnosticResults={diagnosticResults}
            streak={currentStreak}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
