import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { learningPaths } from '../data/learningPaths';
import Button from '../components/common/Button';
import ProgressBar from '../components/Progress/ProgressBar';
import { getDiagnosticResults, getMastery, getFormatPerformance, getPracticeHistory } from '../utils/storage';

// Map category keys to human-readable names
const categoryNames = {
  'basic-shapes': 'Points & Lines',
  'angles': 'Angles',
  'triangles': 'Triangles',
  'pythagorean': 'Pythagorean Theorem',
  'polygons': 'Polygons',
  'circles': 'Circles',
  'area-perimeter': 'Area & Perimeter',
  'volume-surface': 'Volume & Surface Area',
  'coordinate-geometry': 'Coordinate Geometry',
  'transformations': 'Transformations',
  'algebra': 'Algebra',
};

export default function Home() {
  const { progress, streak, getOverallPercentage, getModulePercentage } = useProgress();
  const navigate = useNavigate();
  const diagnosticResults = getDiagnosticResults();
  const mastery = getMastery() || {};
  const formatPerformance = getFormatPerformance() || {};
  const practiceHistory = getPracticeHistory() || [];

  const currentStreak = typeof streak === 'object' ? (streak?.current || 0) : (Number(streak) || 0);
  
  const allActiveModules = learningPaths
    .filter(p => p.status === 'active')
    .flatMap(p => p.modules);
    
  const completedModulesCount = allActiveModules.filter(m => progress[m.id]?.completed).length;
  const totalModulesCount = allActiveModules.length;
  const overallProgress = getOverallPercentage();

  // Find next recommended module — prioritize weak areas
  const getNextModule = () => {
    if (diagnosticResults?.weakAreas?.length) {
      // Find a module matching a weak area that isn't completed
      for (const weakCat of diagnosticResults.weakAreas) {
        const mod = allActiveModules.find(m => 
          (m.category === weakCat || m.id === weakCat) && !progress[m.id]?.completed
        );
        if (mod) return { module: mod, reason: 'weak area' };
      }
    }
    // Fall back to first incomplete module
    const next = allActiveModules.find(m => !progress[m.id]?.completed);
    return next ? { module: next, reason: 'next in sequence' } : { module: allActiveModules[0], reason: 'review' };
  };

  const nextRec = getNextModule();
  const nextModule = nextRec.module;
  
  // Detect which track a module belongs to
  const getTrackForModule = (moduleId) => {
    for (const track of learningPaths) {
      if (track.modules.some(m => m.id === moduleId)) return track;
    }
    return null;
  };

  // Per-track progress
  const getTrackProgress = (trackId) => {
    const track = learningPaths.find(p => p.id === trackId);
    if (!track || !track.modules.length) return 0;
    const total = track.modules.reduce((sum, m) => sum + getModulePercentage(m.id), 0);
    return Math.round(total / track.modules.length);
  };

  // Find weakest format
  const getWeakestFormat = () => {
    let weakest = null;
    let lowestAccuracy = 1;
    for (const [fmt, data] of Object.entries(formatPerformance)) {
      if (data.total >= 2) {
        const acc = data.correct / data.total;
        if (acc < lowestAccuracy) {
          lowestAccuracy = acc;
          weakest = fmt;
        }
      }
    }
    return weakest;
  };

  // Dynamic Lede — the most important thing on the page
  const getLede = () => {
    // State 1: No diagnostic taken yet
    if (!diagnosticResults) {
      return {
        kicker: 'FIRST STEP',
        headline: 'RUN THE DIAGNOSTIC',
        subline: 'A 5-minute assessment maps your foundational gaps so every minute of practice counts.',
        tone: 'heat',
      };
    }

    // State 2: Has weak areas from diagnostic
    const weakAreas = diagnosticResults.weakAreas || [];
    const diagScore = diagnosticResults.overallScore || 0;
    
    if (weakAreas.length > 0 && completedModulesCount < 3) {
      const weakestName = categoryNames[weakAreas[0]] || weakAreas[0];
      return {
        kicker: `DIAGNOSTIC: ${diagScore}% · ${weakAreas.length} GAPS FOUND`,
        headline: `${weakestName.toUpperCase()} NEEDS WORK`,
        subline: `Your diagnostic flagged ${weakAreas.map(w => categoryNames[w] || w).join(', ')} as priority gaps. Start with the weakest to unblock everything downstream.`,
        tone: 'heat',
      };
    }

    // State 3: Good streak going
    if (currentStreak >= 3) {
      return {
        kicker: `${completedModulesCount}/${totalModulesCount} MODULES · ${diagScore}% DIAGNOSTIC`,
        headline: `${currentStreak} DAYS UNBROKEN`,
        subline: `Consistency compounds. You've completed ${completedModulesCount} modules at ${overallProgress}% overall lesson completion.`,
        tone: 'accent',
      };
    }

    // State 4: Making progress, some modules done
    if (completedModulesCount > 0) {
      const remaining = totalModulesCount - completedModulesCount;
      return {
        kicker: `${completedModulesCount} COMPLETE · ${remaining} REMAINING`,
        headline: 'FOUNDATIONS GROWING',
        subline: `${overallProgress}% overall lesson completion across ${totalModulesCount} modules. ${weakAreas.length > 0 ? `Still ${weakAreas.length} gap${weakAreas.length > 1 ? 's' : ''} to close.` : 'All diagnostic areas addressed.'}`,
        tone: 'good',
      };
    }

    // State 5: Diagnostic done but haven't started modules
    return {
      kicker: `DIAGNOSTIC: ${diagScore}% · READY TO BEGIN`,
      headline: 'START YOUR TRACK',
      subline: `Your gaps are mapped. ${weakAreas.length > 0 ? `Focus on ${categoryNames[weakAreas[0]] || weakAreas[0]} first.` : 'Begin with the geometry foundations.'}`,
      tone: 'accent',
    };
  };

  const lede = getLede();
  const toneColors = {
    heat: 'var(--heat)',
    accent: 'var(--accent)',
    good: 'var(--good)',
  };
  const ledeColor = toneColors[lede.tone] || 'var(--accent)';
  const weakestFormat = getWeakestFormat();
  const lastSession = practiceHistory[practiceHistory.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-mono animate-fade-in">
      
      {/* === LEDE === */}
      <section className="pt-2">
        <div 
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] mb-3"
          style={{ color: ledeColor }}
        >
          <span 
            className={`w-[7px] h-[7px] rounded-full shrink-0 ${lede.tone === 'heat' ? 'animate-pulse' : ''}`}
            style={{ background: ledeColor }} 
          />
          {lede.kicker}
        </div>
        <h1 
          className="text-[clamp(30px,6.4vw,62px)] font-extrabold leading-[0.93] tracking-tight mb-4"
          style={{ color: ledeColor, maxWidth: '15ch', textWrap: 'balance' }}
        >
          {lede.headline}
        </h1>
        <p className="text-[clamp(15px,1.75vw,19px)] text-zinc-600 dark:text-zinc-400 max-w-[58ch] leading-snug">
          {lede.subline}
        </p>
        
        {!diagnosticResults && (
          <div className="mt-8">
            <Button size="lg" variant="primary" onClick={() => navigate('/diagnostic')}>
              Start Diagnostic Assessment →
            </Button>
          </div>
        )}
      </section>

      {/* === METRICS (chrome-free — just numbers over a rule) === */}
      <section 
        className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-5"
        style={{ borderTop: '3px solid var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: '12px', marginBottom: '4px' }}
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">Streak</div>
          <div className="text-2xl font-bold mt-1 tabular-nums">{currentStreak} <span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal">days</span></div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">Modules</div>
          <div className="text-2xl font-bold mt-1 tabular-nums">{completedModulesCount}<span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal">/{totalModulesCount}</span></div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">Lesson completion</div>
          <div className="text-2xl font-bold mt-1 tabular-nums">{overallProgress}<span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal">%</span></div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">Diagnostic</div>
          <div className="text-2xl font-bold mt-1 tabular-nums">
            {diagnosticResults ? <>{diagnosticResults.overallScore}<span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal">%</span></> : <span className="text-sm text-zinc-400 font-normal">—</span>}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">

          {/* === DIAGNOSTIC GAP MAP (only if diagnostic taken) === */}
          {diagnosticResults && diagnosticResults.categories && (
            <section>
              <div className="flex items-baseline justify-between pb-2 mb-4" style={{ borderBottom: '2px solid var(--ink, #18181b)' }}>
                <h2 className="text-[19px] font-extrabold uppercase tracking-tight">Your Gap Map</h2>
                <Link to="/diagnostic" className="text-[11px] text-zinc-500 hover:text-zinc-300 uppercase tracking-wider">Retake ↺</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(diagnosticResults.categories).map(([cat, data]) => {
                  const isWeak = data.level === 'weak';
                  const isMod = data.level === 'moderate';
                  const label = categoryNames[cat] || cat;
                  
                  return (
                    <div key={cat} className="flex items-center justify-between gap-3 py-2 px-3 rounded" style={{ 
                      background: isWeak ? 'var(--heat-soft)' : isMod ? 'var(--accent-soft)' : 'var(--good-soft)',
                      border: `1px solid ${isWeak ? 'var(--heat)' : isMod ? 'var(--accent)' : 'var(--good)'}`,
                      borderLeftWidth: '3px',
                    }}>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{label}</div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{data.correct}/{data.total} · {data.percentage}%</div>
                      </div>
                      <span className="text-[10px] uppercase font-bold shrink-0" style={{
                        color: isWeak ? 'var(--heat)' : isMod ? 'var(--accent)' : 'var(--good)',
                      }}>
                        {isWeak ? 'GAP' : isMod ? 'REVIEW' : 'SOLID'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* === LEARNING TRACKS === */}
          <section>
            <div className="pb-2 mb-4" style={{ borderBottom: '2px solid var(--ink, #18181b)' }}>
              <h2 className="text-[19px] font-extrabold uppercase tracking-tight">Learning Tracks</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {learningPaths.map((path) => {
                const isActive = path.status === 'active';
                const trackProgress = isActive ? getTrackProgress(path.id) : 0;
                const trackCompleted = isActive ? path.modules.filter(m => progress[m.id]?.completed).length : 0;
                const isAlgebra = path.id === 'algebra';

                return (
                  <div
                    key={path.id}
                    onClick={() => isActive && navigate(`/path/${path.id}`)}
                    className={`p-5 border transition-all ${
                      isActive
                        ? 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer'
                        : 'bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-2xl">{path.icon}</span>
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5" style={{ 
                          color: isAlgebra ? 'var(--alg-color)' : 'var(--geo-color)',
                          background: isAlgebra ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        }}>
                          {trackCompleted}/{path.modules.length} complete
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-sm mb-1">{path.title}</h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">{path.description}</p>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                      {isActive ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-zinc-500">
                            <span>Track Progress</span>
                            <span>{trackProgress}%</span>
                          </div>
                          <ProgressBar percentage={trackProgress} size="sm" color={isAlgebra ? 'emerald' : 'indigo'} />
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-600">Coming soon</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* === ADAPTIVE PRACTICE CTA === */}
          <section>
            <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80" style={{ borderLeft: '3px solid var(--storm)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--storm)' }}>
                    Mixed-Format Practice
                  </div>
                  <h3 className="text-base font-bold mb-1">Adaptive Practice Engine</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-md">
                    {diagnosticResults?.weakAreas?.length 
                      ? `12 questions weighted toward your ${diagnosticResults.weakAreas.length} gap area${diagnosticResults.weakAreas.length > 1 ? 's' : ''} — MCQ, Spot the Blunder, Step Sequence, Fill Blank, and True/False.`
                      : '12 mixed-format questions across all modules. Take the diagnostic first for targeted practice.'
                    }
                    {weakestFormat && ` Your weakest format: ${weakestFormat.replace('-', ' ')}.`}
                    {lastSession && ` Last session: ${lastSession.score}%.`}
                  </p>
                </div>
                <Button size="md" variant="primary" className="shrink-0" onClick={() => navigate('/practice')}>
                  Start Practice →
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* === SIDEBAR === */}
        <div className="space-y-8">
          
          {/* Up Next — personalized */}
          {nextModule && (
            <section>
              <div className="pb-2 mb-4" style={{ borderBottom: '2px solid var(--ink, #18181b)' }}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {nextRec.reason === 'weak area' ? '⚠ Priority — Weak Area' : '▶ Up Next'}
                </h2>
              </div>
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80" style={nextRec.reason === 'weak area' ? { borderLeft: '3px solid var(--heat)' } : {}}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ 
                  color: nextRec.reason === 'weak area' ? 'var(--heat)' : 'var(--accent)' 
                }}>
                  {getTrackForModule(nextModule.id)?.title || 'Track'} · {nextModule.estimatedMinutes || 25} min
                </div>
                <h3 className="text-base font-bold mb-1">{nextModule.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{nextModule.description}</p>
                <Button size="sm" variant={nextRec.reason === 'weak area' ? 'primary' : 'secondary'} className="w-full" onClick={() => navigate(`/module/${nextModule.id}`)}>
                  {nextRec.reason === 'weak area' ? 'Address Gap →' : 'Launch Unit →'}
                </Button>
              </div>
            </section>
          )}

          {/* Practice History Summary */}
          {practiceHistory.length > 0 && (
            <section>
              <div className="pb-2 mb-4" style={{ borderBottom: '2px solid var(--ink, #18181b)' }}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Practice History</h2>
              </div>
              <div className="space-y-2">
                {practiceHistory.slice(-5).reverse().map((session, i) => (
                  <div key={i} className="flex justify-between items-center py-2 text-xs border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {new Date(session.timestamp || session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`font-bold tabular-nums ${(session.score || 0) >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {session.score || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Format Performance (if they've practiced) */}
          {Object.keys(formatPerformance).length > 0 && (
            <section>
              <div className="pb-2 mb-4" style={{ borderBottom: '2px solid var(--ink, #18181b)' }}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Format Performance</h2>
              </div>
              <div className="space-y-2">
                {Object.entries(formatPerformance).map(([fmt, data]) => {
                  const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                  const fmtLabels = { mcq: 'Multiple Choice', blunder: 'Spot the Blunder', sequence: 'Step Sequence', fill: 'Fill Blank', 'tf-reason': 'True/False' };
                  return (
                    <div key={fmt} className="flex justify-between items-center py-1.5 text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">{fmtLabels[fmt] || fmt}</span>
                      <span className={`font-bold tabular-nums ${acc >= 70 ? '' : 'text-amber-600 dark:text-amber-400'}`}>{acc}%</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Engineering Insight — contextual */}
          <section>
            <div className="pb-2 mb-3" style={{ borderBottom: '2px solid var(--ink, #18181b)' }}>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Engineering Context</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {diagnosticResults?.weakAreas?.includes('angles') || diagnosticResults?.weakAreas?.includes('triangles')
                ? 'Angles and triangles are the foundation of truss analysis in civil engineering. Every bridge joint is a triangle problem. Master these and statics becomes straightforward.'
                : diagnosticResults?.weakAreas?.includes('pythagorean') || diagnosticResults?.weakAreas?.includes('coordinate-geometry')
                ? 'Distance and coordinate geometry power CNC machining, GPS triangulation, and every CAD drawing. These are the math of building real things.'
                : 'Geometry and vector algebra support many CAD and engineering models. Later applications will connect these ideas to physical assumptions and computation.'
              }
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
