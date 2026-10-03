import React, { useEffect } from 'react';
import SessionReview from '../Study/SessionReview';
import { savePracticeSession } from '../../utils/storage';

const fmtLabels = {
  mcq: 'Multiple Choice',
  blunder: 'Spot the Blunder',
  sequence: 'Step Sequence',
  fill: 'Fill in the Blank',
  'tf-reason': 'True/False',
};

export const SessionSummary = ({ sessionId, answers, onComplete }) => {
  const correctCount = answers.filter(a => a.isCorrect).length;
  const total = answers.length;
  const percentage = Math.round((correctCount / total) * 100);

  const [saveError, setSaveError] = React.useState('');
  useEffect(() => {
    try { savePracticeSession({ id: sessionId, answers, score: percentage, total, correct: correctCount }); }
    catch (error) { setSaveError(error.message); }
  }, [sessionId, answers, percentage, total, correctCount]);

  const formats = [...new Set(answers.map(a => a.format))];
  const modules = [...new Set(answers.map(a => a.moduleId))];

  // Find areas that need review
  const weakModules = modules.filter(mod => {
    const modAnswers = answers.filter(a => a.moduleId === mod);
    return modAnswers.filter(a => a.isCorrect).length / modAnswers.length < 0.6;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-mono animate-fade-in">
      {saveError && <p role="alert">Progress was not saved: {saveError}</p>}
      {/* Score header */}
      <div className="text-center mb-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--accent)' }}>
          Session Complete
        </div>
        <div className="text-[62px] font-extrabold leading-none" style={{
          color: percentage >= 80 ? 'var(--good)' : percentage >= 60 ? 'var(--accent)' : 'var(--heat)',
        }}>
          {percentage}%
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          {correctCount} of {total} correct
        </div>
      </div>

      {/* Verdict */}
      <div className="p-4 mb-8 border" style={{
        borderColor: percentage >= 70 ? 'var(--good)' : 'var(--heat)',
        borderLeftWidth: '3px',
        background: percentage >= 70 ? 'var(--good-soft)' : 'var(--heat-soft)',
      }}>
        <p className="text-sm font-semibold" style={{ color: percentage >= 70 ? 'var(--good)' : 'var(--heat)' }}>
          {percentage >= 80 ? 'Strong session. Keep pushing.'
            : percentage >= 70 ? 'Solid work. A few gaps to revisit.'
            : percentage >= 50 ? 'Making progress. Focus practice on your weak spots below.'
            : 'These areas need attention. Practice again with focus on the flagged modules.'}
        </p>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* By Format */}
        <div>
          <div className="pb-2 mb-3" style={{ borderBottom: '2px solid var(--ink, #18181b)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider">By Format</h3>
          </div>
          {formats.map(fmt => {
            const fmtAnswers = answers.filter(a => a.format === fmt);
            const corr = fmtAnswers.filter(a => a.isCorrect).length;
            const acc = Math.round((corr / fmtAnswers.length) * 100);
            return (
              <div key={fmt} className="flex justify-between text-xs py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-400">{fmtLabels[fmt] || fmt}</span>
                <span className={`font-bold tabular-nums ${acc >= 70 ? '' : 'text-amber-600 dark:text-amber-400'}`}>
                  {corr}/{fmtAnswers.length} ({acc}%)
                </span>
              </div>
            );
          })}
        </div>

        {/* By Module */}
        <div>
          <div className="pb-2 mb-3" style={{ borderBottom: '2px solid var(--ink, #18181b)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider">By Module</h3>
          </div>
          {modules.map(mod => {
            const modAnswers = answers.filter(a => a.moduleId === mod);
            const corr = modAnswers.filter(a => a.isCorrect).length;
            const needsReview = corr / modAnswers.length < 0.6;
            return (
              <div key={mod} className="flex justify-between items-center text-xs py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="capitalize text-zinc-600 dark:text-zinc-400">
                  {mod.replace(/-/g, ' ')}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`font-bold tabular-nums ${needsReview ? '' : ''}`} style={{ color: needsReview ? 'var(--heat)' : undefined }}>
                    {corr}/{modAnswers.length}
                  </span>
                  {needsReview && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5" style={{ 
                      background: 'var(--heat-soft)', color: 'var(--heat)', 
                    }}>GAP</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <SessionReview sessionId={sessionId} answers={answers} />
      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded text-sm transition-colors"
        >
          Practice Again
        </button>
        <button
          onClick={onComplete}
          className="flex-1 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold py-3 px-4 rounded text-sm transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
export default SessionSummary;
