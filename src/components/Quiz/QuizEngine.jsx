import React, { useState } from 'react';
import { QuestionCard } from './QuestionCard';
import { Button } from '../common/Button';
import { ProgressBar } from '../Progress/ProgressBar';
import { saveReviewSession } from '../../utils/storage';
import { scoreDiagnostic, scoreQuiz } from '../../utils/scoring';

export const QuizEngine = ({ questions, title, onComplete, isDiagnostic }) => {
  const [sessionId]=useState(()=>crypto.randomUUID());
  const [saveError,setSaveError]=useState('');
  function complete(results){
    const completeResults={...results,reviewSessionId:sessionId};
    try {saveReviewSession({id:sessionId,title:title || 'Lesson quiz',answers:results.reviewAnswers.map(a=>({...a,moduleId:a.moduleId}))});setSaveError('');onComplete(completeResults);}
    catch(error){setSaveError(error.message);}
  }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState({});

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (showExplanation ? 1 : 0)) / questions.length) * 100;

  const handleConfirm = () => {
    if (selectedAnswer === null) return;
    
    // Record the answer
    const newAnswers = { ...answers, [currentIndex]: selectedAnswer };
    setAnswers(newAnswers);

    if (isDiagnostic) {
      // In diagnostic mode, go straight to next question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
      } else {
        // Complete - score and return
        const results = scoreDiagnostic(questions, newAnswers);
        complete(results);
      }
    } else {
      // In lesson quiz mode, show explanation first
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Complete - score and return
      const results = scoreQuiz(questions, answers);
      complete(results);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      {saveError && <p className="study-notice" role="alert">{saveError}<button className="study-text-button" onClick={()=>complete(isDiagnostic?scoreDiagnostic(questions,answers):scoreQuiz(questions,answers))}>Retry saving</button></p>}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{title || 'Quiz'}</h2>
        <ProgressBar percentage={progress} size="md" showLabel={false} />
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        onSelectAnswer={setSelectedAnswer}
        showExplanation={showExplanation}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />

      <div className="mt-8 flex justify-end">
        {!showExplanation ? (
          <Button
            onClick={handleConfirm}
            disabled={selectedAnswer === null}
            size="lg"
            variant="primary"
          >
            {isDiagnostic ? 'Next Question' : 'Check Answer'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            size="lg"
            variant="primary"
          >
            {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results'}
          </Button>
        )}
      </div>
    </div>
  );
};
export default QuizEngine;
