import React from 'react';
import MathBlock from '../../Lesson/MathBlock';

export const MultipleChoice = ({ question, onAnswer, showResult, isCorrect }) => {
  return (
    <div className="flex flex-col gap-4 text-zinc-200 font-mono">
      <div className="text-lg">
        <MathBlock content={question.question} />
      </div>
      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !showResult && onAnswer(i)}
            disabled={showResult}
            className={`p-3 text-left border border-zinc-700 rounded-md hover:border-indigo-500 transition-colors ${
              showResult 
                ? (i === question.correctAnswer ? 'bg-green-900/50 border-green-500' : 'bg-zinc-800')
                : 'bg-zinc-800'
            }`}
          >
            <MathBlock content={opt} />
          </button>
        ))}
      </div>
    </div>
  );
};
export default MultipleChoice;
