import React, { useState } from 'react';
import { SpeedRunGame } from '../components/SpeedRun/SpeedRunGame';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function SpeedRun() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState('blitz-60'); // 'blitz-60' | 'survival' | 'sprint-15'
  const [selectedTopic, setSelectedTopic] = useState('mixed'); // 'mixed' | 'geometry' | 'algebra'

  const modes = [
    {
      id: 'blitz-60',
      name: '60s Blitz',
      description: 'Race against the clock! Score as many points and combo streaks as possible in 60 seconds.',
      icon: '⚡',
      badge: 'POPULAR',
    },
    {
      id: 'survival',
      name: '3-Strike Survival',
      description: 'Zero tolerance for error. Keep going until you lose 3 lives. Perfect for precision training.',
      icon: '🛡️',
      badge: 'CHALLENGE',
    },
    {
      id: 'sprint-15',
      name: '15-Question Sprint',
      description: 'A focused burst of 15 rapid-fire questions scored on speed latency and clean accuracy.',
      icon: '⏱️',
      badge: 'PRECISION',
    },
  ];

  const topics = [
    {
      id: 'mixed',
      name: 'Mixed Foundations',
      description: 'Randomized blend of Geometry and Algebra reflex problems.',
      icon: '🌀',
    },
    {
      id: 'geometry',
      name: 'Geometry Reflexes',
      description: 'Supplementary angles, Pythagorean triples, triangle sums & circle formulas.',
      icon: '📐',
    },
    {
      id: 'algebra',
      name: 'Algebra Reflexes',
      description: 'One-step equations, exponent rules, slope calculations & inequality rules.',
      icon: '∑',
    },
  ];

  if (isPlaying) {
    return (
      <SpeedRunGame
        mode={selectedMode}
        topic={selectedTopic}
        onExit={() => setIsPlaying(false)}
      />
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 py-6 font-mono space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 relative overflow-hidden tech-grid shadow-xs">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span>⚡ Kahoot-Style Speed Drills</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Engineering Reflex Drills
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Automaticity is the superpower of elite engineers. Train your mental reflexes on supplementary angles, Pythagorean triples, linear equations, and exponent laws until they require zero conscious effort.
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Step 1: Choose Drill Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map(mode => (
            <div
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedMode === mode.id
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60">
                    {mode.icon}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {mode.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {mode.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  {mode.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Selected</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  selectedMode === mode.id
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-zinc-300 dark:border-zinc-700'
                }`}>
                  {selectedMode === mode.id && '✓'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Selection */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Step 2: Choose Topic Focus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topics.map(topic => (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedTopic === topic.id
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{topic.icon}</span>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {topic.name}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {topic.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Selected</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  selectedTopic === topic.id
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-zinc-300 dark:border-zinc-700'
                }`}>
                  {selectedTopic === topic.id && '✓'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Control Panel */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold">
            Targeting: <span className="text-indigo-600 dark:text-indigo-400">{selectedMode.toUpperCase()}</span> • <span className="text-indigo-600 dark:text-indigo-400">{selectedTopic.toUpperCase()}</span>
          </div>
          <p className="text-xs text-zinc-500">
            Use keyboard hotkeys <code className="text-indigo-500 font-bold">1, 2, 3, 4</code> for ultra-fast reaction times.
          </p>
        </div>

        <Button size="lg" variant="primary" className="px-10 shrink-0 w-full sm:w-auto" onClick={() => setIsPlaying(true)}>
          Launch Speed Run [Space] ⚡
        </Button>
      </div>
    </div>
  );
}
