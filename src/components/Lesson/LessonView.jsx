import React, { useState } from 'react';
import { MathBlock } from './MathBlock';
import { InteractiveCanvas } from './InteractiveCanvas';
import { PracticeProblems } from './PracticeProblems';
import { QuizEngine } from '../Quiz/QuizEngine';
import { Button } from '../common/Button';

export const LessonView = ({ moduleData, onComplete, progress }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const lessons = moduleData?.lessons || [];
  
  if (!moduleData) return null;

  const totalTabs = lessons.length; // 0..n-1 = lessons, 'practice' = practice, 'quiz' = quiz

  const currentLesson = typeof activeTab === 'number' ? lessons[activeTab] : null;
  
  const handleMarkComplete = () => {
    setCompletedLessons(prev => new Set([...prev, activeTab]));
    
    if (activeTab < lessons.length - 1) {
      setActiveTab(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('practice');
    }
  };

  const handlePracticeComplete = () => {
    setActiveTab('quiz');
  };

  const handleQuizComplete = (results) => {
    if (onComplete) onComplete(results);
  };

  // Map module category to interactive canvas type
  const getCanvasType = (moduleId) => {
    const map = {
      'points-lines': null,
      'angles': 'angle',
      'triangles': 'triangle',
      'pythagorean': 'pythagorean',
      'circles': 'circle',
      'coordinate': 'coordinate',
    };
    return map[moduleId] || null;
  };

  const canvasType = getCanvasType(moduleData.id);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full">
      {/* Sidebar */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 px-2">{moduleData.title}</h3>
          <ul className="space-y-1">
            {lessons.map((lesson, idx) => (
              <li key={idx}>
                <button
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                    activeTab === idx 
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs flex-shrink-0 ${
                    completedLessons.has(idx) ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {completedLessons.has(idx) ? '✓' : idx + 1}
                  </span>
                  <span className="truncate">{lesson.title}</span>
                </button>
              </li>
            ))}
            <li className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-3">
              <button
                onClick={() => setActiveTab('practice')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                  activeTab === 'practice' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-2">📝</span> Practice Problems
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                  activeTab === 'quiz' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-2">🎯</span> Module Quiz
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {typeof activeTab === 'number' && currentLesson ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-100 dark:border-slate-700 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{currentLesson.title}</h1>
            
            {/* Lesson content - rendered as HTML with math */}
            <div className="prose-content">
              <MathBlock content={currentLesson.content} />
            </div>

            {/* Interactive Canvas (if applicable for this module) */}
            {canvasType && activeTab === 0 && (
              <div className="mt-8">
                <InteractiveCanvas type={canvasType} config={{}} />
              </div>
            )}

            {/* Key Takeaways */}
            {currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
              <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center">
                  <span className="mr-2">💡</span> Key Takeaways
                </h3>
                <ul className="space-y-2">
                  {currentLesson.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-indigo-500 mr-2 mt-0.5">•</span>
                      <MathBlock content={point} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-12 flex justify-between items-center">
              {activeTab > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={() => { setActiveTab(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  ← Previous Lesson
                </Button>
              )}
              <div className="ml-auto">
                <Button size="lg" onClick={handleMarkComplete}>
                  {activeTab < lessons.length - 1 ? 'Complete & Continue →' : 'Complete & Practice →'}
                </Button>
              </div>
            </div>
          </div>
        ) : activeTab === 'practice' ? (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Practice: {moduleData.title}</h2>
            {moduleData.practiceProblems && moduleData.practiceProblems.length > 0 ? (
              <PracticeProblems 
                problems={moduleData.practiceProblems} 
                onComplete={handlePracticeComplete} 
              />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-lg border border-slate-100 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400">No practice problems available yet.</p>
                <Button className="mt-4" onClick={() => setActiveTab('quiz')}>Skip to Quiz →</Button>
              </div>
            )}
          </div>
        ) : activeTab === 'quiz' ? (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Quiz: {moduleData.title}</h2>
            {moduleData.quiz && moduleData.quiz.length > 0 ? (
              <QuizEngine 
                questions={moduleData.quiz} 
                title={`${moduleData.title} Quiz`}
                onComplete={handleQuizComplete}
              />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-lg border border-slate-100 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400">Quiz coming soon!</p>
                {onComplete && (
                  <Button className="mt-4" onClick={() => onComplete({ percentage: 100, passed: true })}>
                    Complete Module ✓
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default LessonView;
