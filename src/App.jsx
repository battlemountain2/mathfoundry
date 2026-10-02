import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy loaded pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Diagnostic = lazy(() => import('./pages/Diagnostic'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const Progress = lazy(() => import('./pages/Progress'));
const Practice = lazy(() => import('./pages/Practice'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading fallback with engineering feel
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 font-mono text-xs text-zinc-500">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-600"></div>
    <span>INITIALIZING TELEMETRY...</span>
  </div>
);

function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/diagnostic" element={<Diagnostic />} />
            <Route path="/path/:pathId" element={<LearningPath />} />
            <Route path="/module/:moduleId" element={<ModulePage />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

export default App;
