import React from 'react';
import { useProgress } from '../hooks/useProgress';
import { ProgressDashboard } from '../components/Progress/ProgressDashboard';

export default function Progress() {
  const { progress, streak, diagnosticResults } = useProgress();

  return (
    <div className="animate-fade-in py-4">
      <ProgressDashboard
        progress={progress}
        diagnosticResults={diagnosticResults}
        streak={streak}
      />
    </div>
  );
}
