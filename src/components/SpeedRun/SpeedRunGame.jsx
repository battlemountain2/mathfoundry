import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSpeedRunQuestion } from '../../data/speedRunQuestions';
import { sound } from '../../utils/audioEffects';
import { MathBlock } from '../Lesson/MathBlock';
import { Button } from '../common/Button';

const HIGH_SCORE_KEY = 'mathfoundry_speedrun_highscores';

function getHighScores() {
  try {
    const data = localStorage.getItem(HIGH_SCORE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveHighScore(mode, topic, score) {
  try {
    const scores = getHighScores();
    const key = `${mode}_${topic}`;
    if (!scores[key] || score > scores[key]) {
      scores[key] = score;
      localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
      return { isNewHigh: true, best: score };
    }
    return { isNewHigh: false, best: scores[key] };
  } catch {
    return { isNewHigh: false, best: score };
  }
}

// Kahoot-style color themes for the 4 option cards
const TILE_COLORS = [
  {
    bg: 'bg-rose-500/10 dark:bg-rose-950/40 hover:bg-rose-500/20 dark:hover:bg-rose-900/50',
    border: 'border-rose-400 dark:border-rose-700/80',
    badge: 'bg-rose-500 text-white',
    symbol: '▲',
    key: '1',
    altKey: 'Q',
  },
  {
    bg: 'bg-sky-500/10 dark:bg-sky-950/40 hover:bg-sky-500/20 dark:hover:bg-sky-900/50',
    border: 'border-sky-400 dark:border-sky-700/80',
    badge: 'bg-sky-500 text-white',
    symbol: '◆',
    key: '2',
    altKey: 'W',
  },
  {
    bg: 'bg-amber-500/10 dark:bg-amber-950/40 hover:bg-amber-500/20 dark:hover:bg-amber-900/50',
    border: 'border-amber-400 dark:border-amber-700/80',
    badge: 'bg-amber-500 text-white',
    symbol: '●',
    key: '3',
    altKey: 'E',
  },
  {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/40 hover:bg-emerald-500/20 dark:hover:bg-emerald-900/50',
    border: 'border-emerald-400 dark:border-emerald-700/80',
    badge: 'bg-emerald-500 text-white',
    symbol: '■',
    key: '4',
    altKey: 'R',
  },
];

export const SpeedRunGame = ({ mode = 'blitz-60', topic = 'mixed', onExit }) => {
  // Game states: 'ready' | 'playing' | 'round-over'
  const [gameState, setGameState] = useState('ready');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(mode === 'blitz-60' ? 60 : 0);
  const [lives, setLives] = useState(3);
  
  // Scoring & Metrics
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [answerLatencies, setAnswerLatencies] = useState([]);
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [highScoreInfo, setHighScoreInfo] = useState({ isNewHigh: false, best: 0 });

  // Current problem
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [flashFeedback, setFlashFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const timerRef = useRef(null);

  // Mute sync
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  // Start initial 3-2-1 countdown
  const startCountdown = useCallback(() => {
    setGameState('ready');
    setCountdown(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setTotalAttempted(0);
    setAnswerLatencies([]);
    setMissedQuestions([]);
    setLives(3);
    setTimeLeft(mode === 'blitz-60' ? 60 : 0);

    let count = 3;
    const cdInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        sound.playTick();
      } else {
        clearInterval(cdInterval);
        setGameState('playing');
        setCurrentQuestion(getSpeedRunQuestion(topic));
        setQuestionStartTime(Date.now());
        sound.playCorrect(1);
      }
    }, 800);
  }, [mode, topic]);

  // Main game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (mode === 'blitz-60') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishGame();
            return 0;
          }
          if (prev <= 6) {
            sound.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Stopwatch for sprint
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState, mode]);

  const finishGame = useCallback(() => {
    setGameState('round-over');
    sound.playGameOver();
    const hs = saveHighScore(mode, topic, score);
    setHighScoreInfo(hs);
  }, [mode, topic, score]);

  // Answer handler
  const handleAnswer = useCallback((index) => {
    if (gameState !== 'playing' || flashFeedback !== null) return;

    const latency = (Date.now() - questionStartTime) / 1000;
    setAnswerLatencies(prev => [...prev, latency]);
    setTotalAttempted(prev => prev + 1);
    setSelectedIdx(index);

    const isCorrect = index === currentQuestion.correctAnswer;

    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      setCorrectCount(prev => prev + 1);

      // Points: 100 base + speed bonus (up to 50) * combo multiplier
      const speedBonus = Math.max(0, Math.round(50 * (1 - Math.min(1, latency / 4))));
      const multiplier = nextCombo >= 5 ? 5 : nextCombo >= 3 ? 3 : nextCombo >= 2 ? 2 : 1;
      const pts = (100 + speedBonus) * multiplier;
      setScore(prev => prev + pts);

      setFlashFeedback('correct');
      if (nextCombo === 3 || nextCombo === 5) {
        sound.playComboFanfare();
      } else {
        sound.playCorrect(nextCombo);
      }
    } else {
      setCombo(0);
      setFlashFeedback('wrong');
      sound.playWrong();
      setMissedQuestions(prev => [
        ...prev,
        {
          question: currentQuestion,
          userAnswer: currentQuestion.options[index],
          latency,
        },
      ]);

      if (mode === 'survival') {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          setTimeout(() => finishGame(), 600);
          return;
        }
      }
    }

    // Delay before next problem to show flash
    setTimeout(() => {
      setSelectedIdx(null);
      setFlashFeedback(null);

      // Check sprint-15 completion
      if (mode === 'sprint-15' && totalAttempted + 1 >= 15) {
        finishGame();
        return;
      }

      setCurrentQuestion(getSpeedRunQuestion(topic));
      setQuestionStartTime(Date.now());
    }, isCorrect ? 250 : 600);
  }, [gameState, flashFeedback, currentQuestion, combo, maxCombo, lives, mode, topic, totalAttempted, questionStartTime, finishGame]);

  // Keyboard navigation hotkeys (1-4 and Q-W-E-R)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'ready' && (e.code === 'Space' || e.code === 'Enter')) {
        startCountdown();
        return;
      }

      if (gameState === 'playing') {
        if (e.key === '1' || e.key === 'q' || e.key === 'Q') handleAnswer(0);
        else if (e.key === '2' || e.key === 'w' || e.key === 'W') handleAnswer(1);
        else if (e.key === '3' || e.key === 'e' || e.key === 'E') handleAnswer(2);
        else if (e.key === '4' || e.key === 'r' || e.key === 'R') handleAnswer(3);
      }

      if (gameState === 'round-over' && (e.code === 'Space' || e.code === 'Enter')) {
        startCountdown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleAnswer, startCountdown]);

  // Calculate metrics
  const avgLatency = answerLatencies.length > 0
    ? (answerLatencies.reduce((a, b) => a + b, 0) / answerLatencies.length).toFixed(1)
    : '0.0';

  const accuracy = totalAttempted > 0
    ? Math.round((correctCount / totalAttempted) * 100)
    : 0;

  // ---------------- RENDER: READY / COUNTDOWN ---------------- //
  if (gameState === 'ready') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center font-mono space-y-8 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white text-4xl flex items-center justify-center font-bold mx-auto shadow-lg animate-pulse">
          {countdown}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Get Ready for Rapid Reflexes!
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Use keys <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">1</span> <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">2</span> <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">3</span> <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">4</span> or tap screen tiles.
          </p>
        </div>
      </div>
    );
  }

  // ---------------- RENDER: ROUND OVER / RESULTS ---------------- //
  if (gameState === 'round-over') {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4 font-mono space-y-6 animate-fade-in">
        {/* Results Header Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-md space-y-4">
          <div className="text-4xl">
            {accuracy >= 80 ? '🏆' : accuracy >= 50 ? '⚡' : '💪'}
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold mb-1">
              Reflex Speed Run Completed
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {score.toLocaleString()} <span className="text-sm font-semibold text-zinc-500">PTS</span>
            </h1>
            {highScoreInfo.isNewHigh && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                ★ NEW PERSONAL BEST!
              </span>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500">Accuracy</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{accuracy}%</div>
              <div className="text-[10px] text-zinc-400">{correctCount}/{totalAttempted}</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500">Avg Reflex</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{avgLatency}s</div>
              <div className="text-[10px] text-zinc-400">per problem</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500">Max Combo</div>
              <div className="text-xl font-bold text-amber-500 mt-0.5">{maxCombo}x</div>
              <div className="text-[10px] text-zinc-400">streak multiplier</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500">Best Score</div>
              <div className="text-xl font-bold text-indigo-500 mt-0.5">
                {Math.max(score, highScoreInfo.best).toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-400">all-time record</div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-3 justify-center">
            <Button size="lg" variant="primary" onClick={startCountdown}>
              Play Again [Space] ↺
            </Button>
            <Button size="lg" variant="secondary" onClick={onExit}>
              Exit to Lobby
            </Button>
          </div>
        </div>

        {/* Forensic Review of Missed Problems */}
        {missedQuestions.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>🔍 Rapid Error Autopsy</span>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {missedQuestions.length} Missed
                </span>
              </h3>
              <span className="text-xs text-zinc-400">Study these to eliminate repeat mistakes</span>
            </div>

            <div className="space-y-3">
              {missedQuestions.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      <MathBlock content={item.question.prompt} />
                    </div>
                    <span className="text-[10px] text-zinc-400">{item.latency.toFixed(1)}s</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                      <span className="font-bold block text-[10px] uppercase">Your Pick:</span>
                      <MathBlock content={item.userAnswer} />
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      <span className="font-bold block text-[10px] uppercase">Correct Answer:</span>
                      <MathBlock content={item.question.options[item.question.correctAnswer]} />
                    </div>
                  </div>

                  {item.question.explanation && (
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <strong className="text-indigo-600 dark:text-indigo-400">Concept: </strong>
                      <MathBlock content={item.question.explanation} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------- RENDER: ACTIVE GAMEPLAY ---------------- //
  const timerPercentage = mode === 'blitz-60' ? (timeLeft / 60) * 100 : 100;
  const isTimeUrgent = mode === 'blitz-60' && timeLeft <= 10;

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 font-mono space-y-5 select-none animate-fade-in">
      {/* Top HUD: Score, Timer / Lives, Combo */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        {/* Score & Combo */}
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">SCORE</div>
            <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>

          {combo >= 2 && (
            <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-xs shadow-xs animate-bounce flex items-center gap-1">
              <span>🔥</span>
              <span>{combo}x COMBO</span>
            </div>
          )}
        </div>

        {/* Center: Timer or Lives */}
        <div className="text-center">
          {mode === 'blitz-60' ? (
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">TIME</div>
              <div className={`text-2xl font-extrabold tabular-nums ${
                isTimeUrgent ? 'text-rose-500 animate-pulse' : 'text-zinc-900 dark:text-zinc-100'
              }`}>
                {timeLeft}s
              </div>
            </div>
          ) : mode === 'survival' ? (
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">LIVES</div>
              <div className="text-lg">
                {'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">PROGRESS</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {totalAttempted + 1} / 15
              </div>
            </div>
          )}
        </div>

        {/* Controls: Audio mute, Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs hover:bg-zinc-100"
            title="Toggle SFX"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={onExit}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            End
          </button>
        </div>
      </div>

      {/* Timer Bar */}
      {mode === 'blitz-60' && (
        <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isTimeUrgent ? 'bg-rose-500' : timeLeft <= 25 ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      )}

      {/* Main Question Display Box */}
      {currentQuestion && (
        <div className={`p-8 sm:p-12 rounded-2xl border transition-all text-center flex flex-col items-center justify-center min-h-[200px] shadow-sm relative overflow-hidden ${
          flashFeedback === 'correct' 
            ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500' 
            : flashFeedback === 'wrong' 
            ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500 animate-shake' 
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
        }`}>
          <div className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-2 tracking-wider">
            {currentQuestion.category} Reflex Drill
          </div>

          <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 max-w-xl">
            <MathBlock content={currentQuestion.prompt} />
          </div>

          {currentQuestion.subtext && (
            <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              💡 {currentQuestion.subtext}
            </div>
          )}
        </div>
      )}

      {/* Kahoot-Style 4-Tile Answer Grid */}
      {currentQuestion && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {currentQuestion.options.map((opt, idx) => {
            const tileTheme = TILE_COLORS[idx] || TILE_COLORS[0];
            const isSelected = selectedIdx === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;

            let cardStateClasses = `${tileTheme.bg} ${tileTheme.border}`;
            if (flashFeedback) {
              if (isCorrect) {
                cardStateClasses = 'bg-emerald-500 text-white border-emerald-600 scale-[1.02] shadow-md';
              } else if (isSelected && !isCorrect) {
                cardStateClasses = 'bg-rose-500 text-white border-rose-600 opacity-80';
              } else {
                cardStateClasses = 'opacity-30 border-zinc-300 dark:border-zinc-800';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={flashFeedback !== null}
                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-left cursor-pointer group active:scale-98 ${cardStateClasses}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${tileTheme.badge}`}>
                    {tileTheme.symbol}
                  </div>
                  <div className="text-base sm:text-lg font-bold truncate">
                    <MathBlock content={opt} />
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-60 text-xs font-semibold shrink-0">
                  <span className="hidden sm:inline">[{tileTheme.key}]</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Keyboard Helper Hint */}
      <div className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Hotkeys: <span className="font-semibold text-zinc-600 dark:text-zinc-300">1, 2, 3, 4</span> or <span className="font-semibold text-zinc-600 dark:text-zinc-300">Q, W, E, R</span> to strike answers immediately.
      </div>
    </div>
  );
};

export default SpeedRunGame;
