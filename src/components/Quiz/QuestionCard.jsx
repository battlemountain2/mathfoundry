import React from 'react';
import { Card } from '../common/Card';
import { processContent } from '../../utils/mathHelpers';

export const QuestionCard = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  showExplanation,
  questionNumber,
  totalQuestions,
  hintActive = false
}) => {
  if (!question) return null;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 text-sm font-medium text-slate-500 dark:text-slate-400">
        <span>Question {questionNumber} of {totalQuestions}</span>
        {question.category && <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-xs">{question.category}</span>}
      </div>

      <div 
        className="text-lg sm:text-xl font-medium text-slate-900 dark:text-slate-100 mb-8"
        dangerouslySetInnerHTML={{ __html: processContent(question.question) }}
      />

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswer;
          
          let optionClasses = 'flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer w-full text-left ';
          
          if (showExplanation) {
            if (isCorrect) {
              optionClasses += 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-500 text-emerald-900 dark:text-emerald-100';
            } else if (isSelected && !isCorrect) {
              optionClasses += 'bg-rose-50 border-rose-500 dark:bg-rose-900/20 dark:border-rose-500 text-rose-900 dark:text-rose-100';
            } else {
              optionClasses += 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 opacity-50';
            }
          } else if (hintActive) {
            if (isSelected) {
              optionClasses += 'bg-rose-50 border-rose-500 dark:bg-rose-900/20 dark:border-rose-500 text-rose-900 dark:text-rose-100';
            } else {
              optionClasses += 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700';
            }
          } else {
            if (isSelected) {
              optionClasses += 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/30 dark:border-indigo-500';
            } else {
              optionClasses += 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700';
            }
          }

          return (
            <button
              key={index}
              onClick={() => !showExplanation && onSelectAnswer(index)}
              disabled={showExplanation}
              className={optionClasses}
            >
              <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold mr-4 ${
                showExplanation && isCorrect ? 'bg-emerald-500 text-white' :
                (showExplanation || hintActive) && isSelected && !isCorrect ? 'bg-rose-500 text-white' :
                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {letter}
              </div>
              <div 
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: processContent(option) }}
              />
            </button>
          );
        })}
      </div>

      {showExplanation && question.explanation && (
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Explanation</h4>
          <div 
            className="text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: processContent(question.explanation) }}
          />
        </div>
      )}
    </Card>
  );
};
export default QuestionCard;
