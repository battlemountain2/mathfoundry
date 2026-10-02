import React from 'react';
import { Button } from '../common/Button';

export const Header = ({ onMenuToggle, streak = 0, theme, onThemeToggle }) => {
  return (
    <header className="study-header sticky top-0 z-30 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 font-mono">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-lg !p-2"
            aria-label="Open navigation"
            onClick={onMenuToggle}
          >
            ☰
          </Button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Your study space
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 px-3 py-1 rounded-md text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            <span className="text-amber-500">⚡</span>
            <span>{streak} {streak === 1 ? 'DAY' : 'DAYS'} STREAK</span>
          </div>
          
          <button
            onClick={onThemeToggle}
            className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700/60 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs transition-colors flex items-center gap-1.5 px-2.5"
            title="Toggle color theme"
          >
            <span>{theme !== 'light' ? '☀ LIGHT' : '♧ FOREST'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
