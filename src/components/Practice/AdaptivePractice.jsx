import React, { useState } from 'react';
import { useStudyActivity } from '../Study/ActivityContext';
import MultipleChoice from './QuestionTypes/MultipleChoice';
import SpotTheBlunder from './QuestionTypes/SpotTheBlunder';
import StepSequence from './QuestionTypes/StepSequence';
import FillBlank from './QuestionTypes/FillBlank';
import TrueFalseReason from './QuestionTypes/TrueFalseReason';
import SessionSummary from './SessionSummary';
import { displayAnswer,expectedAnswer } from '../../utils/review';
import { checkPracticeAnswer } from '../../utils/answerChecking';
import MathBlock from '../Lesson/MathBlock';

export const AdaptivePractice = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [sessionOver, setSessionOver] = useState(false);

  const currentQ = questions[currentIndex];
  useStudyActivity({moduleId:currentQ?.moduleId,moduleTitle:'Mixed math practice',question:currentQ?.question || currentQ?.statement,submittedAnswer:showResult?answers[currentIndex]?.submittedAnswer:null,feedback:showResult?currentQ?.explanation:null});

  const [sessionId] = useState(() => crypto.randomUUID());

  const handleAnswer = (ans) => {
    if (showResult) return;
    const isCorrect = checkPracticeAnswer(currentQ, ans);
    const timeTaken = (Date.now() - startTime) / 1000;
    
    setAnswers(prev => [...prev, {
      questionId: currentQ.id,
      format: currentQ.format,
      moduleId: currentQ.moduleId,
      isCorrect,
      submittedAnswer: displayAnswer(currentQ,ans),
      rawAnswer: ans,
      expectedAnswer: expectedAnswer(currentQ),
      problem: currentQ,
      question: currentQ.question || currentQ.statement,
      explanation: currentQ.explanation,
      timeTaken
    }]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowResult(false);
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
      showResult,
      isCorrect: showResult && answers[currentIndex]?.isCorrect
    };

    switch (currentQ.format) {
      case 'mcq': return <MultipleChoice key={currentQ.id} {...props} />;
      case 'blunder': return <SpotTheBlunder key={currentQ.id} {...props} />;
      case 'sequence': return <StepSequence key={currentQ.id} {...props} />;
      case 'fill': return <FillBlank key={currentQ.id} {...props} />;
      case 'tf-reason': return <TrueFalseReason key={currentQ.id} {...props} />;
      default: return <div>Unknown format</div>;
    }
  };

  const isCorrect = showResult && answers[currentIndex]?.isCorrect;

  const fmtLabels = { mcq: 'Multiple Choice', blunder: 'Spot the Blunder', sequence: 'Step Sequence', fill: 'Fill in the Blank', 'tf-reason': 'True/False' };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-6 font-mono">
      <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-bold">Question {currentIndex + 1} of {questions.length}</span>
        <span className="uppercase tracking-wider text-[10px]" style={{ color: 'var(--accent)' }}>
          {fmtLabels[currentQ.format] || currentQ.format}
        </span>
      </div>
      
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
        {renderQuestion()}
      </div>

      {showResult && (
        <div className="p-4 border" style={{
          background: isCorrect ? 'var(--good-soft)' : 'var(--heat-soft)',
          borderColor: isCorrect ? 'var(--good)' : 'var(--heat)',
          borderLeftWidth: '3px',
        }}>
          <h3 className="font-bold mb-2 text-sm" style={{ color: isCorrect ? 'var(--good)' : 'var(--heat)' }}>
            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </h3>
          <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <MathBlock content={currentQ.explanation} />
          </div>
          <button
            onClick={handleNext}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded text-sm w-full transition-colors"
          >
            {currentIndex < questions.length - 1 ? 'Next Question →' : 'View Results →'}
          </button>
        </div>
      )}
    </div>
  );
};
export default AdaptivePractice;
