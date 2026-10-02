import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdaptivePractice from '../components/Practice/AdaptivePractice';
import { generateAdaptiveSession } from '../utils/adaptiveEngine';
import { useProgress } from '../hooks/useProgress';
import { getDiagnosticResults, getPracticeHistory, getFormatPerformance, getMastery } from '../utils/storage';
import Button from '../components/common/Button';

const categoryNames = {
  'basic-shapes': 'Points & Lines', 'angles': 'Angles', 'triangles': 'Triangles',
  'pythagorean': 'Pythagorean', 'polygons': 'Polygons', 'circles': 'Circles',
  'area-perimeter': 'Area & Perimeter', 'volume-surface': 'Volume', 
  'coordinate-geometry': 'Coordinates', 'transformations': 'Transforms', 'algebra': 'Algebra',
};

export const Practice = () => {
  const navigate = useNavigate();
  const { progress } = useProgress();
  const [sessionQuestions, setSessionQuestions] = useState(null);

  const diagnosticResults = getDiagnosticResults();
  const practiceHistory = getPracticeHistory() || [];
  const formatPerformance = getFormatPerformance() || {};
  const masteryData = getMastery() || {};

  // Pre-compute what will be targeted
  const sessionPreview = useMemo(() => {
    const weakAreas = diagnosticResults?.weakAreas || [];
    const weakFormats = Object.entries(formatPerformance)
      .filter(([, d]) => d.total >= 2 && (d.correct / d.total) < 0.6)
      .map(([fmt]) => fmt);
    const lastScore = practiceHistory.length > 0 ? practiceHistory[practiceHistory.length - 1]?.score : null;
    const totalSessions = practiceHistory.length;
    
    return { weakAreas, weakFormats, lastScore, totalSessions };
  }, [diagnosticResults, formatPerformance, practiceHistory]);

  const startPractice = () => {
    const questions = generateAdaptiveSession({
      progress,
      diagnosticResults,
      practiceHistory,
      formatPerformance,
      mastery: masteryData,
      questionCount: 12,
    });
    setSessionQuestions(questions);
  };

  if (sessionQuestions) {
    return (
      <div className="animate-fade-in">
        <AdaptivePractice 
          questions={sessionQuestions} 
          onComplete={() => navigate('/')} 
        />
      </div>
    );
  }

  const fmtLabels = { mcq: 'Multiple Choice', blunder: 'Spot the Blunder', sequence: 'Step Sequence', fill: 'Fill Blank', 'tf-reason': 'True/False' };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-mono animate-fade-in">
      {/* Header */}
      <nav className="flex text-xs text-zinc-400 dark:text-zinc-500 mb-6">
        <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-200">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Adaptive Practice</span>
      </nav>

      <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--accent)' }}>
        Personalized Session
      </div>
      <h1 className="text-2xl font-extrabold mb-2">Adaptive Practice</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        {diagnosticResults 
          ? `12 questions weighted toward your ${sessionPreview.weakAreas.length > 0 ? sessionPreview.weakAreas.length + ' gap area' + (sessionPreview.weakAreas.length > 1 ? 's' : '') : 'overall progress'}, mixing 5 question formats.`
          : 'Take the diagnostic first for truly targeted practice. Starting with a general mix.'
        }
      </p>

      {/* What will be tested */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-5 mb-6">
        <div className="pb-2 mb-3" style={{ borderBottom: '2px solid var(--ink, #18181b)' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider">Session Targeting</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Questions</div>
            <div className="text-xl font-bold">12</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-0.5">~10-15 minutes</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Your Sessions</div>
            <div className="text-xl font-bold">{sessionPreview.totalSessions}</div>
            {sessionPreview.lastScore !== null && (
              <div className="text-zinc-500 dark:text-zinc-400 mt-0.5">Last: {sessionPreview.lastScore}%</div>
            )}
          </div>
        </div>

        {/* Weak areas being targeted */}
        {sessionPreview.weakAreas.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--heat)' }}>
              Priority Targets
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sessionPreview.weakAreas.map(area => (
                <span key={area} className="text-[11px] px-2 py-0.5 rounded" style={{ 
                  background: 'var(--heat-soft)', color: 'var(--heat)', border: '1px solid var(--heat)' 
                }}>
                  {categoryNames[area] || area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weak formats */}
        {sessionPreview.weakFormats.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Weak Formats (extra weight)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sessionPreview.weakFormats.map(fmt => (
                <span key={fmt} className="text-[11px] px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                  {fmtLabels[fmt] || fmt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Format mix */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Format Mix
          </div>
          <div className="grid grid-cols-5 gap-1 text-center">
            {['mcq', 'blunder', 'sequence', 'fill', 'tf-reason'].map(fmt => {
              const perf = formatPerformance[fmt];
              const acc = perf && perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : null;
              return (
                <div key={fmt} className="text-[10px] py-1.5 px-1 bg-zinc-50 dark:bg-zinc-800/60 rounded">
                  <div className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">{fmtLabels[fmt]?.split(' ')[0]}</div>
                  {acc !== null && <div className="text-zinc-400 mt-0.5">{acc}%</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start button */}
      <Button size="lg" variant="primary" className="w-full text-base" onClick={startPractice}>
        Start Practice Session →
      </Button>
      
      <button
        onClick={() => navigate('/')}
        className="w-full mt-3 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 py-2"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};
export default Practice;
