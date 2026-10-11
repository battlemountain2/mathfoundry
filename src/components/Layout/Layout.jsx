import React, { useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useActivityContext } from "../../hooks/useStudyActivity";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useTheme } from "../../hooks/useTheme";
import { useProgress } from "../../hooks/useProgress";
import { resolveStudyUnit } from "../../utils/studyNavigation";

const TutorDrawer = lazy(() => import("../Tutor/TutorDrawer"));

export const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tutorState, setTutorState] = useState("unopened");
  const isTutorOpen = tutorState === "open";
  const {
    theme,
    setTheme,
    compactSidebar,
    toggleCompactSidebar,
    error: themeError,
  } = useTheme();
  const { streak } = useProgress();
  const { activity } = useActivityContext();
  const location = useLocation();

  const currentStreak =
    typeof streak === "object" ? streak?.current || 0 : Number(streak) || 0;

  const [, section, courseId, unitId] = location.pathname.split("/");
  const activeUnit =
    section === "courses"
      ? resolveStudyUnit({ unitPath: `${courseId}/${unitId}` })
      : null;
  const currentContext = { moduleTitle: activeUnit?.title || "Study desk" };

  // Full-screen chrome suppression for guided lesson player (Requirement R1, R3)
  const isLessonRoute = /\/courses\/[^/]+\/[^/]+\/lesson\/deep\/?$/.test(
    location.pathname,
  );

  if (isLessonRoute) {
    return (
      <div className="app-shell min-h-screen transition-colors duration-150">
        {themeError && (
          <p role="alert" className="study-notice">
            {themeError}
          </p>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen transition-colors duration-150">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        compactSidebar={compactSidebar}
      />

      <div
        className={`${compactSidebar ? "lg:pl-0" : "lg:pl-64"} flex flex-col min-h-screen transition-all duration-200`}
      >
        <Header
          isSidebarOpen={isSidebarOpen}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          streak={currentStreak}
          theme={theme}
          onThemeChange={setTheme}
          compactSidebar={compactSidebar}
          onToggleCompactSidebar={toggleCompactSidebar}
          onOpenTutor={() => setTutorState("open")}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {themeError && (
            <p role="alert" className="study-notice">
              {themeError}
            </p>
          )}
          {children}
        </main>

        {/* Global Engineering Math Copilot */}
        {tutorState !== "unopened" && (
          <Suspense
            fallback={
              isTutorOpen ? <p role="status">Opening study tutor…</p> : null
            }
          >
            <TutorDrawer
              isOpen={isTutorOpen}
              onClose={() => setTutorState("closed")}
              currentContext={{ ...currentContext, ...activity }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Layout;
