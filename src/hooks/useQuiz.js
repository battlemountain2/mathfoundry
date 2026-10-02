import { useState, useCallback } from 'react';
import { scoreQuiz, scoreDiagnostic } from '../utils/scoring';

export function useQuiz(questions, isDiagnostic = false) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);

  const currentQuestion = questions[currentIndex] || null;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const selectAnswer = useCallback((answerIndex) => {
    setSelectedAnswer(answerIndex);
  }, []);

  const confirmAnswer = useCallback(() => {
    if (selectedAnswer === null) return;

    setAnswers(prev => ({ ...prev, [currentIndex]: selectedAnswer }));

    if (!isDiagnostic) {
      setShowExplanation(true);
    } else {
      // In diagnostic mode, move to next question immediately
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        // Score the diagnostic
        const allAnswers = { ...answers, [currentIndex]: selectedAnswer };
        const scored = scoreDiagnostic(questions, allAnswers);
        setResults(scored);
        setIsComplete(true);
      }
    }
  }, [selectedAnswer, currentIndex, totalQuestions, isDiagnostic, answers, questions]);

  const nextQuestion = useCallback(() => {
    setShowExplanation(false);
    setSelectedAnswer(null);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Score the quiz
      const scored = scoreQuiz(questions, answers);
      setResults(scored);
      setIsComplete(true);
    }
  }, [currentIndex, totalQuestions, answers, questions]);

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsComplete(false);
    setResults(null);
  }, []);

  return {
    currentQuestion,
    currentIndex,
    totalQuestions,
    answeredCount,
    selectedAnswer,
    showExplanation,
    isComplete,
    results,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    resetQuiz,
  };
}
