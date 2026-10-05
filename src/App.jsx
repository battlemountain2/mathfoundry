import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ActivityProvider } from './components/Study/ActivityContext';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy loaded pages for optimal performance
const Home = lazy(() => import('./pages/Home'));
const CourseCatalog = lazy(() => import('./pages/Courses/CourseCatalog'));
const CoursePage = lazy(() => import('./pages/Courses/CoursePage'));
const UnitPage = lazy(() => import('./pages/Courses/UnitPage'));
const LessonView = lazy(() => import('./pages/Courses/LessonView'));
const UnitPractice = lazy(() => import('./pages/Courses/UnitPractice'));
const UnitLab = lazy(() => import('./pages/Courses/UnitLab'));
const UnitQuiz = lazy(() => import('./pages/Courses/UnitQuiz'));
const Review = lazy(() => import('./pages/Review'));
const Repair = lazy(() => import('./pages/Repair'));
const Rulebook = lazy(() => import('./pages/Rulebook'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading fallback with engineering feel
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 font-mono text-xs text-zinc-500">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-600"></div>
    <span>Loading your study space…</span>
  </div>
);

function App() {
  return (
    <ActivityProvider>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Home: Simplified Study Desk */}
              <Route path="/" element={<Home />} />

              {/* Courses & Hierarchy */}
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/courses/:courseId" element={<CoursePage />} />
              <Route path="/courses/:courseId/:unitId" element={<UnitPage />} />
              <Route path="/courses/:courseId/:unitId/lesson" element={<LessonView />} />
              <Route path="/courses/:courseId/:unitId/practice" element={<UnitPractice />} />
              <Route path="/courses/:courseId/:unitId/lab" element={<UnitLab />} />
              <Route path="/courses/:courseId/:unitId/quiz" element={<UnitQuiz />} />

              {/* Cross-Subject Study Tools */}
              <Route path="/rulebook" element={<Rulebook />} />
              <Route path="/repair" element={<Repair />} />
              <Route path="/review" element={<Review />} />
              <Route path="/settings" element={<Settings />} />

              {/* Deprecated Standalone Routes (Redirect to Course Hierarchy) */}
              <Route path="/learn" element={<Navigate to="/courses" replace />} />
              <Route path="/foundations" element={<Navigate to="/courses/math" replace />} />
              <Route path="/practice" element={<Navigate to="/courses/math" replace />} />
              <Route path="/diagnostic" element={<Navigate to="/courses/math" replace />} />
              <Route path="/progress" element={<Navigate to="/courses/math" replace />} />
              <Route path="/overview" element={<Navigate to="/courses" replace />} />
              <Route path="/speed-run" element={<Navigate to="/courses/math" replace />} />
              <Route path="/path/:pathId" element={<Navigate to="/courses/math" replace />} />
              <Route path="/module/:moduleId" element={<Navigate to="/courses/math" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </ActivityProvider>
  );
}

export default App;
