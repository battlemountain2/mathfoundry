import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticQuestions } from '../data/diagnosticQuestions';
import QuizEngine from '../components/Quiz/QuizEngine';
import ResultsPanel from '../components/Quiz/ResultsPanel';
import { setDiagnosticResults, getDiagnosticResults } from '../utils/storage';
import { useProgress } from '../hooks/useProgress';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function Diagnostic() {
  const navigate = useNavigate();
  const { refreshDiagnostic } = useProgress();
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState(getDiagnosticResults());

  const handleComplete = (quizResults) => {
    setDiagnosticResults(quizResults);
    setResults(quizResults);
    setCompleted(true);
    if (refreshDiagnostic) refreshDiagnostic();
  };

  const handleRetake = () => {
    setStarted(true);
    setCompleted(false);
    setResults(null);
  };

  if (completed || (results && !started)) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto px-4 py-6 font-mono">
        <ResultsPanel 
          results={results} 
          isDiagnostic={true} 
          onRetry={handleRetake}
          onContinue={() => navigate('/path/geometry')}
        />
      </div>
    );
  }

  if (started) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto px-4 py-6 font-mono">
        <QuizEngine 
          questions={diagnosticQuestions} 
          title="Geometry Diagnostic Assessment"
          isDiagnostic={true} 
          onComplete={handleComplete} 
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 py-8 font-mono">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-8 sm:p-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
            Diagnostic Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Geometry Gap Diagnostic
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
            Locate where your mathematical foundations lapsed. This evaluation assesses 10 core geometry competencies to construct your custom engineering study pathway.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-center">
              <div className="text-xs uppercase text-zinc-400 font-bold mb-1">Duration</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">~5-8 Min</div>
              <div className="text-[11px] text-zinc-500">Un-timed & relaxed</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-center">
              <div className="text-xs uppercase text-zinc-400 font-bold mb-1">Scope</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{diagnosticQuestions?.length || 20} Questions</div>
              <div className="text-[11px] text-zinc-500">2 per competency</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-center">
              <div className="text-xs uppercase text-zinc-400 font-bold mb-1">Target</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Precision Plan</div>
              <div className="text-[11px] text-zinc-500">Skip what you know</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
            <div className="font-bold uppercase tracking-wider text-[11px]">Notice: Zero Pressure</div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This isn't an exam with a failing grade. Getting questions wrong is the goal—it shows us exactly which foundational concept to teach you first.
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            <Button size="lg" variant="primary" className="w-full sm:w-auto px-12" onClick={() => setStarted(true)}>
              Begin Diagnostic Assessment →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
