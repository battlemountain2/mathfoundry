import React, { useState } from 'react';
import MathBlock from '../../Lesson/MathBlock';

export const FillBlank = ({ question, onAnswer, showResult, isCorrect }) => {
  const [val, setVal] = useState('');

  return (
    <div className="flex flex-col gap-4 text-zinc-900 dark:text-zinc-100 font-mono">
      <div className="text-lg">
        <MathBlock content={question.question} />
      </div>
      <div className="flex flex-col gap-2">
        <input
          aria-label="Your answer"
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={showResult}
          className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-2 rounded text-zinc-900 dark:text-zinc-100"
        />
      </div>
      {!showResult && (
        <button
          disabled={!val.trim()}
          onClick={() => onAnswer(val)}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit Answer
        </button>
      )}
    </div>
  );
};
export default FillBlank;
