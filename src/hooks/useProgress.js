import { useState, useEffect, useCallback } from 'react';
import { getProgress, setModuleProgress, getDiagnosticResults, getStreak, updateStreak } from '../utils/storage';
import { learningPaths } from '../data/learningPaths';

export function useProgress() {
  const [progress, setProgress] = useState(() => getProgress());
  const [streak, setStreak] = useState(() => getStreak());
  const [diagnosticResults, setDiagResults] = useState(() => getDiagnosticResults());

  const updateModuleProgress = useCallback((moduleId, data) => {
    const updated = setModuleProgress(moduleId, data);
    setProgress(updated);
    const newStreak = updateStreak();
    setStreak(newStreak);
  }, []);

  const refreshDiagnostic = useCallback(() => {
    setDiagResults(getDiagnosticResults());
  }, []);

  const getModuleStatus = useCallback((moduleId) => {
    const mod = progress[moduleId];
    if (!mod) return 'not-started';
    if (mod.completed) return 'completed';
    if (mod.lessonsCompleted > 0 || mod.quizScore !== undefined) return 'in-progress';
    return 'not-started';
  }, [progress]);

  const getModulePercentage = useCallback((moduleId) => {
    const mod = progress[moduleId];
    if (!mod) return 0;
    if (mod.completed) return 100;
    const totalSteps = mod.totalLessons || 1;
    const completed = mod.lessonsCompleted || 0;
    return Math.round((completed / totalSteps) * 100);
  }, [progress]);

  const getOverallPercentage = useCallback(() => {
    // Count all active modules across all learning paths
    const allModules = learningPaths
      .filter(p => p.status === 'active')
      .flatMap(p => p.modules);
    if (allModules.length === 0) return 0;
    const total = allModules.reduce((sum, mod) => sum + getModulePercentage(mod.id), 0);
    return Math.round(total / allModules.length);
  }, [progress, getModulePercentage]);

  return {
    progress,
    streak,
    diagnosticResults,
    updateModuleProgress,
    refreshDiagnostic,
    getModuleStatus,
    getModulePercentage,
    getOverallPercentage,
  };
}
