import React, { useState } from 'react';
import MathBlock from '../../Lesson/MathBlock';

export const StepSequence = ({ question, onAnswer, showResult, isCorrect }) => {
  const [displayOrder] = useState(() => {
    const ids = question.steps.map((_, i) => i);
    for(let i=ids.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; }
    if(ids.every((id,i)=>id===i)) ids.push(ids.shift());
    return ids;
  });
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
    <div className="flex flex-col gap-4 text-zinc-900 dark:text-zinc-100 font-mono">
      <div className="text-lg">
        <MathBlock content={question.question} />
      </div>
      <div className="flex flex-col gap-2">
        {displayOrder.map(i => (
          <button
            key={i}
            onClick={() => toggleStep(i)}
            disabled={showResult}
            className={`p-3 text-left border border-zinc-700 rounded-md transition-colors ${
              selectedOrder.includes(i) ? 'bg-indigo-900/50 border-indigo-500' : 'bg-zinc-50 dark:bg-zinc-800'
            }`}
          >
            <span className="mr-2 font-bold text-indigo-400">
              {selectedOrder.includes(i) ? selectedOrder.indexOf(i) + 1 : '-'}
            </span>
            <MathBlock content={question.steps[i]} />
          </button>
        ))}
      </div>
      {!showResult && (
        <button
          disabled={selectedOrder.length !== question.steps.length}
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
