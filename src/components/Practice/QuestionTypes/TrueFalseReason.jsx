import React, { useState } from 'react';
import MathBlock from '../../Lesson/MathBlock';

export const TrueFalseReason = ({ question, onAnswer, showResult, isCorrect }) => {
  const [isTrue, setIsTrue] = useState(null);

  return (
    <div className="flex flex-col gap-4 text-zinc-200 font-mono">
      <div className="text-lg">
        <MathBlock content={question.statement} />
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={() => !showResult && setIsTrue(true)}
          className={`p-3 w-1/2 border border-zinc-700 rounded-md transition-colors ${
            isTrue === true ? 'bg-indigo-900/50 border-indigo-500' : 'bg-zinc-800'
          }`}
        >True</button>
        <button
          onClick={() => !showResult && setIsTrue(false)}
          className={`p-3 w-1/2 border border-zinc-700 rounded-md transition-colors ${
            isTrue === false ? 'bg-indigo-900/50 border-indigo-500' : 'bg-zinc-800'
          }`}
        >False</button>
      </div>

      {isTrue !== null && (
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-zinc-400">Select your reasoning:</p>
          {question.reasonOptions.map((reason, i) => (
            <button
              key={i}
              onClick={() => !showResult && onAnswer({ isTrue, reasonIdx: i })}
              disabled={showResult}
              className={`p-3 text-left border border-zinc-700 rounded-md transition-colors ${
                showResult 
                  ? (i === question.correctReason ? 'bg-green-900/50 border-green-500' : 'bg-zinc-800')
                  : 'bg-zinc-800 hover:border-indigo-500'
              }`}
            >
              <MathBlock content={reason} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default TrueFalseReason;
