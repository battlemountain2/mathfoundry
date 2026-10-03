import React, { useState } from 'react';
import { useStudyActivity } from '../Study/ActivityContext';
import MultipleChoice from './QuestionTypes/MultipleChoice';
import SpotTheBlunder from './QuestionTypes/SpotTheBlunder';
import StepSequence from './QuestionTypes/StepSequence';
import FillBlank from './QuestionTypes/FillBlank';
import TrueFalseReason from './QuestionTypes/TrueFalseReason';
import SessionSummary from './SessionSummary';
import { displayAnswer, expectedAnswer } from '../../utils/review';
import { checkPracticeAnswer } from '../../utils/answerChecking';
import { getProblemHint } from '../../utils/hints';
import MathBlock from '../Lesson/MathBlock';

export const AdaptivePractice = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [sessionOver, setSessionOver] = useState(false);

  const currentQ = questions[currentIndex];
  useStudyActivity({
    moduleId: currentQ?.moduleId,
    moduleTitle: 'Mixed math practice',
    question: currentQ?.question || currentQ?.statement,
    submittedAnswer: showResult ? answers[currentIndex]?.submittedAnswer : null,
    feedback: showResult && showSolution ? currentQ?.explanation : null,
  });

  const [sessionId] = useState(() => crypto.randomUUID());

  const handleAnswer = (ans) => {
    if (showResult && showSolution) return;
    const isCorrect = checkPracticeAnswer(currentQ, ans);
    const timeTaken = (Date.now() - startTime) / 1000;
    const newAttempts = attemptsOnCurrent + 1;
    setAttemptsOnCurrent(newAttempts);

    const existingAttempt = answers[currentIndex];
    const initialAnswer = existingAttempt?.initialAnswer ?? displayAnswer(currentQ, ans);
    const isHelped = Boolean(existingAttempt?.assisted || newAttempts > 1 || showHint);

    const answerRecord = {
      questionId: currentQ.id,
      format: currentQ.format,
      moduleId: currentQ.moduleId,
      isCorrect,
      submittedAnswer: displayAnswer(currentQ, ans),
      initialAnswer,
      rawAnswer: ans,
      expectedAnswer: expectedAnswer(currentQ),
      problem: currentQ,
      question: currentQ.question || currentQ.statement,
      explanation: currentQ.explanation,
      assisted: isHelped,
      timeTaken,
    };

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = answerRecord;
      return next;
    });

    if (isCorrect) {
      setShowResult(true);
      setShowSolution(true);
      setShowHint(false);
    } else {
      // Incorrect: record initial attempt, show hint, allow retry, NEVER auto-reveal solution
      setShowResult(true);
      setShowHint(true);
      setShowSolution(false);
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setShowHint(true); // Keep hint visible or in mind while retrying
  };

  const handleWalkThrough = () => {
    setShowSolution(true);
    setAnswers((prev) => {
      const next = [...prev];
      if (next[currentIndex]) {
        next[currentIndex] = { ...next[currentIndex], assisted: true };
      }
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowResult(false);
      setShowHint(false);
      setShowSolution(false);
      setAttemptsOnCurrent(0);
      setStartTime(Date.now());
    } else {
      setSessionOver(true);
    }
  };

  if (sessionOver) {
    return <SessionSummary sessionId={sessionId} answers={answers} onComplete={onComplete} />;
  }

  const renderQuestion = () => {
    const props = {
      question: currentQ,
      onAnswer: handleAnswer,
      showResult: showResult && showSolution,
      isCorrect: showResult && answers[currentIndex]?.isCorrect,
    };

    switch (currentQ.format) {
      case 'mcq':
        return <MultipleChoice key={`${currentQ.id}-${attemptsOnCurrent}`} {...props} />;
      case 'blunder':
        return <SpotTheBlunder key={`${currentQ.id}-${attemptsOnCurrent}`} {...props} />;
      case 'sequence':
        return <StepSequence key={`${currentQ.id}-${attemptsOnCurrent}`} {...props} />;
      case 'fill':
        return <FillBlank key={`${currentQ.id}-${attemptsOnCurrent}`} {...props} />;
      case 'tf-reason':
        return <TrueFalseReason key={`${currentQ.id}-${attemptsOnCurrent}`} {...props} />;
      default:
        return <div>Unknown format</div>;
    }
  };

  const currentAttempt = answers[currentIndex];
  const isCorrect = currentAttempt?.isCorrect;
  const fmtLabels = {
    mcq: 'Multiple Choice',
    blunder: 'Spot the Blunder',
    sequence: 'Step Sequence',
    fill: 'Fill in the Blank',
    'tf-reason': 'True/False',
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-6 font-mono">
      <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-bold">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="uppercase tracking-wider text-[10px]" style={{ color: 'var(--accent)' }}>
          {fmtLabels[currentQ.format] || currentQ.format}
        </span>
      </div>

      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      {showHint && !showResult && (
        <div className="hint-callout animate-fade-in">
          <p className="hint-title">Targeted Hint</p>
          <p>{getProblemHint(currentQ)}</p>
        </div>
      )}

      <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
        {renderQuestion()}
      </div>

      {showResult && (
        <div
          className={`study-feedback ${
            isCorrect ? 'feedback-correct' : 'feedback-incorrect'
          }`}
          role="status"
        >
          {isCorrect ? (
            <>
              <div className="study-badge correct" style={{ marginBottom: 8 }}>
                {currentAttempt?.assisted ? '✓ Correct after hint' : '✓ Correct'}
              </div>
              <h3 className="font-bold mb-2 text-sm" style={{ color: 'var(--good)' }}>
                {currentAttempt?.assisted ? 'Well done working through it' : '✓ Correct'}
              </h3>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--ink)' }}>
                <MathBlock content={currentQ.explanation} />
              </div>
              <button
                onClick={handleNext}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded text-sm w-full transition-colors"
              >
                {currentIndex < questions.length - 1 ? 'Next Question →' : 'View Results →'}
              </button>
            </>
          ) : !showSolution ? (
            // Incorrect, solution hidden, hint shown
            <>
              <div className="study-badge incorrect" style={{ marginBottom: 8 }}>
                ✗ Incorrect
              </div>
              <h3 className="font-bold mb-1 text-sm" style={{ color: 'var(--heat)' }}>
                Not quite
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-3">
                Your answer: <strong>{currentAttempt?.submittedAnswer}</strong>
              </p>

              <div className="hint-callout">
                <p className="hint-title">Hint</p>
                <p>{getProblemHint(currentQ)}</p>
              </div>

              <div className="study-actions" style={{ marginTop: 14 }}>
                <button
                  onClick={handleRetry}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={handleWalkThrough}
                  className="bg-transparent border border-zinc-400 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 font-bold py-2 px-4 rounded text-xs transition-colors"
                >
                  Walk me through it
                </button>
                {attemptsOnCurrent >= 2 && (
                  <button
                    onClick={handleNext}
                    className="text-xs underline text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    style={{ marginLeft: 8 }}
                  >
                    Move to next problem
                  </button>
                )}
              </div>
            </>
          ) : (
            // Solution revealed on learner request
            <>
              <div className="study-badge incorrect" style={{ marginBottom: 8 }}>
                ✗ Solution Revealed
              </div>
              <h3 className="font-bold mb-2 text-sm" style={{ color: 'var(--heat)' }}>
                Walk me through it
              </h3>
              <div className="answer-comparison-box">
                <div className="comparison-col your-answer is-wrong">
                  <span className="comparison-label">Your answer</span>
                  <span className="comparison-value">{currentAttempt?.submittedAnswer || 'Not answered'}</span>
                  {currentAttempt?.initialAnswer &&
                    currentAttempt?.initialAnswer !== currentAttempt?.submittedAnswer && (
                      <span className="comparison-subtext">First attempt: {currentAttempt?.initialAnswer}</span>
                    )}
                </div>
                <div className="comparison-col expected-answer">
                  <span className="comparison-label">Expected answer</span>
                  <span className="comparison-value">{currentAttempt?.expectedAnswer}</span>
                </div>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Explanation</h4>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--ink)' }}>
                <MathBlock content={currentQ.explanation} />
              </div>
              <button
                onClick={handleNext}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded text-sm w-full transition-colors"
              >
                {currentIndex < questions.length - 1 ? 'Next Question →' : 'View Results →'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default AdaptivePractice;
