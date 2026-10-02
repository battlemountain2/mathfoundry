import React, { useState } from 'react';
import MathBlock from '../../Lesson/MathBlock';

export const StepSequence = ({ question, onAnswer, showResult, isCorrect }) => {
  const [selectedOrder, setSelectedOrder] = useState([]);

  const toggleStep = (idx) => {
    if (showResult) return;
    if (selectedOrder.includes(idx)) {
      setSelectedOrder(selectedOrder.filter(i => i !== idx));
    } else {
      setSelectedOrder([...selectedOrder, idx]);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-zinc-200 font-mono">
      <div className="text-lg">
        <MathBlock content={question.question} />
      </div>
      <div className="flex flex-col gap-2">
        {question.steps.map((step, i) => (
          <button
            key={i}
            onClick={() => toggleStep(i)}
            disabled={showResult}
            className={`p-3 text-left border border-zinc-700 rounded-md transition-colors ${
              selectedOrder.includes(i) ? 'bg-indigo-900/50 border-indigo-500' : 'bg-zinc-800'
            }`}
          >
            <span className="mr-2 font-bold text-indigo-400">
              {selectedOrder.includes(i) ? selectedOrder.indexOf(i) + 1 : '-'}
            </span>
            <MathBlock content={step} />
          </button>
        ))}
      </div>
      {!showResult && (
        <button
          onClick={() => onAnswer(selectedOrder)}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit Order
        </button>
      )}
    </div>
  );
};
export default StepSequence;
