import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { processContent } from '../../utils/mathHelpers';

export const PracticeProblems = ({ problems, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  
  if (!problems || problems.length === 0) return null;
  
  const currentProblem = problems[currentIndex];
  const isFinished = currentIndex >= problems.length;

  const handleSelect = (index) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === currentProblem.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
    setCurrentIndex(prev => prev + 1);
  };

  if (isFinished) {
    const percentage = Math.round((correctCount / problems.length) * 100);
    return (
      <Card className="text-center p-8">
        <div className="text-5xl mb-4">{percentage >= 70 ? '🎉' : '💪'}</div>
        <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Practice Complete!</h3>
        <p className="mb-2 text-lg text-slate-700 dark:text-slate-300">
          You got <span className="font-bold text-indigo-600 dark:text-indigo-400">{correctCount}</span> out of <span className="font-bold">{problems.length}</span> correct.
        </p>
        <p className="mb-6 text-slate-500 dark:text-slate-400">
          {percentage >= 70 ? "Great job! You're ready for the quiz." : "Keep practicing to build your confidence!"}
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => {
            setCurrentIndex(0);
            setCorrectCount(0);
            setSelectedAnswer(null);
            setIsAnswered(false);
          }}>
            Try Again
          </Button>
          <Button onClick={() => onComplete && onComplete(correctCount)}>
            Continue to Quiz →
          </Button>
        </div>
      </Card>
    );
  }

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'hard': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const isCorrectAnswer = selectedAnswer === currentProblem.correctAnswer;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Problem {currentIndex + 1} of {problems.length}</span>
        {currentProblem.difficulty && (
          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getDifficultyColor(currentProblem.difficulty)}`}>
            {currentProblem.difficulty}
          </span>
        )}
      </div>

      <Card>
        <div 
          className="text-lg mb-6 text-slate-900 dark:text-slate-100"
          dangerouslySetInnerHTML={{ __html: processContent(currentProblem.question) }}
        />

        <div className="space-y-3 mb-6">
          {currentProblem.options.map((option, idx) => {
            const isCorrect = idx === currentProblem.correctAnswer;
            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center ";
            
            if (isAnswered) {
              if (isCorrect) {
                btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-100";
              } else if (selectedAnswer === idx) {
                btnClass += "bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-900/20 dark:border-rose-500 dark:text-rose-100";
              } else {
                btnClass += "bg-white border-slate-200 opacity-50 dark:bg-slate-800 dark:border-slate-700";
              }
            } else {
              btnClass += "bg-white border-slate-200 hover:border-indigo-400 cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-600";
            }

            return (
              <button 
                key={idx}
                className={btnClass}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
              >
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold mr-3 text-sm ${
                  isAnswered && isCorrect ? 'bg-emerald-500 text-white' :
                  isAnswered && selectedAnswer === idx ? 'bg-rose-500 text-white' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <div dangerouslySetInnerHTML={{ __html: processContent(option) }} />
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`p-4 rounded-xl mb-6 animate-fade-in ${isCorrectAnswer ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'}`}>
            <p className={`font-bold mb-1 ${isCorrectAnswer ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
              {isCorrectAnswer ? '✓ Correct!' : '✗ Not quite.'}
            </p>
            {currentProblem.explanation && (
              <div className="text-sm text-slate-700 dark:text-slate-300 mt-2" dangerouslySetInnerHTML={{ __html: processContent(currentProblem.explanation) }} />
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          {!isAnswered && currentProblem.hint ? (
            <Button variant="ghost" onClick={() => setShowHint(!showHint)}>
              {showHint ? 'Hide Hint' : '💡 Show Hint'}
            </Button>
          ) : <div></div>}
          
          {isAnswered && (
            <Button onClick={handleNext} className="ml-auto">
              {currentIndex < problems.length - 1 ? 'Next Problem →' : 'Finish Practice'}
            </Button>
          )}
        </div>

        {showHint && !isAnswered && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 rounded-xl text-sm border border-amber-200 dark:border-amber-800 animate-fade-in">
            <strong>💡 Hint:</strong> <span dangerouslySetInnerHTML={{ __html: processContent(currentProblem.hint) }} />
          </div>
        )}
      </Card>
    </div>
  );
};
export default PracticeProblems;
