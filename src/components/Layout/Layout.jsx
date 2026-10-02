import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityContext } from '../Study/ActivityContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TutorDrawer } from '../Tutor/TutorDrawer';
import { useTheme } from '../../hooks/useTheme';
import { useProgress } from '../../hooks/useProgress';
import { learningPaths } from '../../data/learningPaths';

export const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme, error: themeError } = useTheme();
  const { streak } = useProgress();
  const { activity } = useActivityContext();
  const location = useLocation();

  const currentStreak = typeof streak === 'object' ? (streak?.current || 0) : (Number(streak) || 0);

  // Derive active context from URL
  const pathParts = location.pathname.split('/').filter(Boolean);
  let currentContext = { trackId: 'geometry', moduleTitle: 'Overview' };

  if (pathParts[0] === 'module' && pathParts[1]) {
    const moduleId = pathParts[1];
    // Find in geometry or algebra
    let foundModule = null;
    learningPaths.forEach(track => {
      const m = track.modules?.find(item => item.id === moduleId);
      if (m) foundModule = { ...m, trackId: track.id };
    });

    if (foundModule) {
      currentContext = {
        moduleId: foundModule.id,
        moduleTitle: foundModule.title,
        trackId: foundModule.trackId,
      };
    }
  } else if (pathParts[0] === 'path' && pathParts[1]) {
    const track = learningPaths.find(t => t.id === pathParts[1]);
    currentContext = {
      trackId: pathParts[1],
      moduleTitle: `${track?.title || pathParts[1]} Track`,
    };
  } else if (pathParts[0] === 'diagnostic') {
    currentContext = {
      moduleTitle: 'Diagnostic Evaluation',
    };
  }

  return (
    <div className="app-shell min-h-screen transition-colors duration-150">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          streak={currentStreak} 
          theme={theme} 
          onThemeToggle={toggleTheme} 
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {themeError && <p role="alert" className="study-notice">{themeError}</p>}
          {children}
        </main>

        {/* Global Engineering Math Copilot */}
        <TutorDrawer currentContext={{...currentContext,...activity}} />
      </div>
    </div>
  );
};

export default Layout;
