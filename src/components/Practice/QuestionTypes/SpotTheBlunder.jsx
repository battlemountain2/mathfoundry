import React from 'react';
import MathBlock from '../../Lesson/MathBlock';

export const SpotTheBlunder = ({ question, onAnswer, showResult, isCorrect }) => {
  return (
    <div className="flex flex-col gap-4 text-zinc-200 font-mono">
      <div className="text-lg">
        <MathBlock content={question.question} />
      </div>
      <div className="flex flex-col gap-2">
        {question.steps.map((step, i) => (
          <button
            key={i}
            onClick={() => !showResult && onAnswer(i)}
            disabled={showResult}
            className={`p-3 text-left border border-zinc-700 rounded-md hover:border-indigo-500 transition-colors ${
              showResult
                ? (i === question.correctStep ? 'bg-green-900/50 border-green-500' : 'bg-zinc-800')
                : 'bg-zinc-800'
            }`}
          >
            <MathBlock content={step} />
          </button>
        ))}
      </div>
    </div>
  );
};
export default SpotTheBlunder;
