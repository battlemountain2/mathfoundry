import React from 'react';
import { Card } from '../common/Card';
import { learningPaths } from '../../data/learningPaths';

export const BadgeDisplay = ({ progress = {}, diagnosticResults = null, streak = 0 }) => {
  const geometryModules = learningPaths[0]?.modules || [];

  // Calculate actual milestones
  let completedModulesCount = 0;
  let hasAnyCompletedLesson = false;
  let hasPerfectQuiz = false;

  geometryModules.forEach(mod => {
    const modProg = progress[mod.id] || {};
    if (modProg.completed) completedModulesCount += 1;
    if ((modProg.lessonsCompleted || 0) > 0 || modProg.completed) hasAnyCompletedLesson = true;
    if (modProg.quizScore === 100) hasPerfectQuiz = true;
  });

  const currentStreak = typeof streak === 'object' ? (streak?.current || 0) : (Number(streak) || 0);

  const badges = [
    {
      id: 'diagnostic',
      name: 'Telemetry Online',
      description: 'Completed the diagnostic assessment',
      icon: '🎯',
      earned: !!diagnosticResults,
      meta: diagnosticResults ? `${diagnosticResults.overallScore}% score` : 'Locked',
    },
    {
      id: 'first-steps',
      name: 'First Vector',
      description: 'Completed your first geometry lesson',
      icon: '📐',
      earned: hasAnyCompletedLesson,
      meta: hasAnyCompletedLesson ? 'Achieved' : 'Locked',
    },
    {
      id: 'streak-3',
      name: 'Momentum',
      description: 'Maintained a 3-day engineering streak',
      icon: '⚡',
      earned: currentStreak >= 3,
      meta: `${currentStreak}/3 days`,
    },
    {
      id: 'quiz-master',
      name: 'Zero Tolerance',
      description: 'Achieved 100% on any module quiz',
      icon: '🔬',
      earned: hasPerfectQuiz,
      meta: hasPerfectQuiz ? 'Perfect Score' : 'Locked',
    },
    {
      id: 'halfway',
      name: 'Structural Integrity',
      description: 'Mastered 5 full geometry modules',
      icon: '🏛️',
      earned: completedModulesCount >= 5,
      meta: `${completedModulesCount}/5 modules`,
    },
    {
      id: 'master',
      name: 'Foundations Master',
      description: 'Mastered all 10 geometry modules',
      icon: '🏆',
      earned: completedModulesCount >= 10,
      meta: `${completedModulesCount}/10 modules`,
    },
  ];

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>🏅 Engineering Badges</span>
        </h2>
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          {earnedCount}/{badges.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {badges.map(badge => (
          <div 
            key={badge.id} 
            className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
              badge.earned 
                ? 'bg-white dark:bg-zinc-900/80 border-indigo-200 dark:border-indigo-900/50 shadow-xs' 
                : 'bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800/60 opacity-60'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border ${
              badge.earned 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 grayscale'
            }`}>
              {badge.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {badge.name}
                </h4>
                <span className={`text-[10px] ${
                  badge.earned 
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold' 
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}>
                  {badge.meta}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeDisplay;
