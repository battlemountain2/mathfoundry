import React from 'react';
import SessionReview from '../Study/SessionReview';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

const categoryLabels = {
  'basic-shapes': 'Basic Shapes',
  'angles': 'Angles',
  'triangles': 'Triangles',
  'pythagorean': 'Pythagorean Theorem',
  'polygons': 'Polygons',
  'circles': 'Circles',
  'area-perimeter': 'Area & Perimeter',
  'volume-surface': 'Volume & Surface Area',
  'coordinate-geometry': 'Coordinate Geometry',
  'transformations': 'Transformations',
};

const levelColors = {
  strong: { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Strong' },
  moderate: { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', label: 'Needs Review' },
  weak: { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', label: 'Focus Area' },
};

export const ResultsPanel = ({ results, isDiagnostic, onRetry, onContinue }) => {
  if (!results) return null;

  // For diagnostic results: { categories, overallScore, weakAreas, moderateAreas, strongAreas }
  // For quiz results: { correct, total, percentage, passed, details }
  const score = isDiagnostic ? results.overallScore : results.percentage;
  const passed = isDiagnostic ? score >= 60 : results.passed;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <Card className="text-center p-10 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {isDiagnostic ? '🎯 Diagnostic Complete' : (passed ? '🎉 Excellent Work!' : '💪 Keep Practicing!')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          {isDiagnostic 
            ? "We've analyzed your geometry knowledge. Here's your personalized breakdown." 
            : `You scored ${score}% on this quiz.${passed ? ' Well done!' : ' Try again to improve.'}`
          }
        </p>

        {/* Score Circle */}
        <div className="relative w-48 h-48 mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`${score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{score}%</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {isDiagnostic 
                ? `${results.totalCorrect}/${results.totalQuestions}` 
                : `${results.correct}/${results.total}`
              }
            </span>
          </div>
        </div>

        {/* Diagnostic Category Breakdown */}
        {isDiagnostic && results.categories && (
          <div className="w-full space-y-4 text-left mt-4 mb-8">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Category Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(results.categories).map(([cat, data]) => {
                const level = levelColors[data.level];
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {categoryLabels[cat] || cat}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          data.level === 'strong' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          data.level === 'moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {level.label}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                          {data.correct}/{data.total}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${level.bar} rounded-full transition-all duration-700 ease-out`} 
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendations */}
            {results.weakAreas.length > 0 && (
              <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl">
                <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-2">⚡ Focus Areas</h4>
                <p className="text-sm text-rose-700 dark:text-rose-400">
                  We recommend starting with: {results.weakAreas.map(a => categoryLabels[a] || a).join(', ')}
                </p>
              </div>
            )}
            {results.strongAreas.length > 0 && (
              <div className="mt-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">✓ Strong Areas</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  You're solid on: {results.strongAreas.map(a => categoryLabels[a] || a).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quiz result details */}
        {!isDiagnostic && (
          <div className="w-full text-left mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{results.correct}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Correct</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{results.total - results.correct}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Incorrect</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{results.total}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button variant="secondary" size="lg" onClick={onRetry}>
            {isDiagnostic ? 'Retake Diagnostic' : 'Retry Quiz'}
          </Button>
          {onContinue && (
            <Button variant="primary" size="lg" onClick={onContinue}>
              {isDiagnostic ? 'Start Your Path →' : 'Continue →'}
            </Button>
          )}
        </div>
      </Card>
      {results.reviewAnswers ? <SessionReview answers={results.reviewAnswers}/> : <p className="study-muted">This older result saved scores only. Individual answers cannot be reconstructed.</p>}
    </div>
  );
};
export default ResultsPanel;
