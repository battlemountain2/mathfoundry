import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar = ({ isOpen, onToggle }) => {
  const links = [
    { to: '/', icon: '⌘', label: 'Terminal / Home' },
    { to: '/diagnostic', icon: '🎯', label: 'Diagnostic Assessment' },
    { to: '/path/geometry', icon: '📐', label: 'Geometry Curriculum' },
    { to: '/path/algebra', icon: '∑', label: 'Algebra Curriculum' },
    { to: '/practice', icon: '🧠', label: 'Adaptive Practice' },
    { to: '/progress', icon: '📊', label: 'Mastery Matrix' },
    { to: '/settings', icon: '⚙', label: 'Configuration' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full font-mono">
          {/* Logo / Brand */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ∑
              </span>
              <div>
                <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 block">
                  MathFoundry
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block -mt-0.5">
                  Engineering Math
                </span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
              Curriculum Core
            </div>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-xs transition-colors duration-150 relative ${
                    isActive 
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400 pl-2.5' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`
                }
              >
                <span className="w-5 text-center text-sm mr-2.5 opacity-80">{link.icon}</span>
                <span className="truncate">{link.label}</span>
              </NavLink>
            ))}

            <div className="pt-6 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
              Planned Expansion
            </div>
            <div className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-600 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span>∫ Calculus</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Q2</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>⚛ Physics (Statics)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Q3</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>⚗ Chemistry (Thermo)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Q4</span>
              </div>
            </div>
          </nav>

          {/* Footer badge */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500">
            <div className="flex items-center justify-between">
              <span>FOUNDRY v1.1</span>
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                FREE TIER
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
