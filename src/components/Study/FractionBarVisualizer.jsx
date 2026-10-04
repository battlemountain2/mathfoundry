import React, { useState, useEffect } from 'react';
import { equivalentAnswer } from '../../utils/answerChecking';
import { saveLearningAttempt } from '../../utils/storage';

const authoredVariants = [
  {
    id: 'half-third',
    title: '1/2 + 1/3',
    f1: { n: 1, d: 2 },
    f2: { n: 1, d: 3 },
    targetD: 6,
    sumAnswer: '5/6',
    availablePartitions: [2, 3, 4, 5, 6, 12],
    followUp: {
      question: 'Now solve on paper: What is 1/4 + 1/6? Enter as a simplified fraction.',
      answer: '5/12',
      explanation: 'Use common denominator 12: 1/4 = 3/12 and 1/6 = 2/12. 3/12 + 2/12 = 5/12.',
    },
  },
  {
    id: 'fourth-sixth',
    title: '1/4 + 1/6',
    f1: { n: 1, d: 4 },
    f2: { n: 1, d: 6 },
    targetD: 12,
    sumAnswer: '5/12',
    availablePartitions: [2, 4, 6, 8, 12, 24],
    followUp: {
      question: 'Now solve on paper: What is 1/3 + 1/6? Enter as a simplified fraction.',
      answer: '1/2',
      explanation: 'Use common denominator 6: 1/3 = 2/6. 2/6 + 1/6 = 3/6 = 1/2.',
    },
  },
  {
    id: 'third-sixth',
    title: '1/3 + 1/6',
    f1: { n: 1, d: 3 },
    f2: { n: 1, d: 6 },
    targetD: 6,
    sumAnswer: '1/2',
    availablePartitions: [2, 3, 6, 9, 12],
    followUp: {
      question: 'Now solve on paper: What is 1/2 + 1/4? Enter as a fraction.',
      answer: '3/4',
      explanation: 'Use common denominator 4: 1/2 = 2/4. 2/4 + 1/4 = 3/4.',
    },
  },
];

export default function FractionBarVisualizer({ onComplete }) {
  const [variantIndex, setVariantIndex] = useState(0);
  const variant = authoredVariants[variantIndex];

  // Partition chosen by learner
  const [partition, setPartition] = useState(() => {
    const p = typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('partition')) : null;
    return p && authoredVariants[0].availablePartitions.includes(p) ? p : authoredVariants[0].f1.d;
  });
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpChecked, setFollowUpChecked] = useState(false);
  const [followUpCorrect, setFollowUpCorrect] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  // Reset partition when variant changes
  useEffect(() => {
    const p = typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('partition')) : null;
    if (p && authoredVariants[variantIndex].availablePartitions.includes(p)) {
      setPartition(p);
    } else {
      setPartition(authoredVariants[variantIndex].f1.d);
    }
    setFollowUpInput('');
    setFollowUpChecked(false);
    setFollowUpCorrect(false);
    setSavedNotice('');
  }, [variantIndex]);

  const f1 = variant.f1;
  const f2 = variant.f2;

  // Check if current partition evenly subdivides both fractions
  const dividesF1 = (partition * f1.n) % f1.d === 0;
  const dividesF2 = (partition * f2.n) % f2.d === 0;
  const isCommonDenominator = dividesF1 && dividesF2;

  const f1Units = dividesF1 ? (partition * f1.n) / f1.d : null;
  const f2Units = dividesF2 ? (partition * f2.n) / f2.d : null;
  const combinedUnits = isCommonDenominator ? f1Units + f2Units : null;

  function handlePartitionChange(p) {
    setPartition(p);
  }

  function handleCheckFollowUp(e) {
    e.preventDefault();
    if (!followUpInput.trim()) return;
    const correct = equivalentAnswer(followUpInput, variant.followUp.answer);
    setFollowUpCorrect(correct);
    setFollowUpChecked(true);

    // Record separate independent evidence for the follow-up
    try {
      const attempt = {
        id: `visual-followup-${variant.id}-${Date.now()}`,
        sessionId: `visual-session-${variant.id}`,
        conceptId: 'addition',
        problemId: `followup-${variant.id}`,
        question: variant.followUp.question,
        submittedAnswer: followUpInput.trim(),
        expectedAnswer: variant.followUp.answer,
        explanation: variant.followUp.explanation,
        isCorrect: correct,
        skipped: false,
        assisted: false, // Solved independently on paper!
        mode: 'visual-lab-independent',
        timestamp: new Date().toISOString(),
      };
      saveLearningAttempt(attempt);
      setSavedNotice('Independent follow-up result saved to your learning record.');
      if (onComplete) onComplete(correct);
    } catch (err) {
      setSavedNotice(err.message);
    }
  }

  return (
    <div className="study-card fraction-visualizer animate-fade-in" style={{ padding: 28 }}>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div>
          <p className="eyebrow">Interactive Concept Lab</p>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.6rem' }}>
            Equal-Sized Parts: Adding {f1.n}/{f1.d} + {f2.n}/{f2.d}
          </h2>
        </div>

        {/* Variant selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="variant-select" className="text-xs text-zinc-500 dark:text-zinc-400">
            Problem:
          </label>
          <select
            id="variant-select"
            value={variantIndex}
            onChange={(e) => setVariantIndex(Number(e.target.value))}
            className="study-answer"
            style={{ padding: '6px 10px', fontSize: 13, width: 'auto' }}
          >
            {authoredVariants.map((v, i) => (
              <option key={v.id} value={i}>
                {v.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="study-intro" style={{ fontSize: '1rem', maxWidth: 'none', marginBottom: 20 }}>
        Notice that both whole bars below have the exact same total length. But the pieces are
        different sizes! To combine them, we must repartition both wholes into equal-sized units.
      </p>

      {/* Visual Bars Container */}
      <div className="space-y-6 my-6 p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40">
        {/* Bar 1 */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>
              First quantity: {f1.n}/{f1.d}
            </span>
            <span style={{ color: dividesF1 ? 'var(--good)' : 'var(--heat)' }}>
              {dividesF1
                ? `${f1Units}/${partition} (${f1.n}/${f1.d})`
                : `Cannot divide ${f1.n}/${f1.d} evenly into ${partition}ths`}
            </span>
          </div>
          <div
            className="fraction-bar-whole"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${partition}, 1fr)`,
              height: 42,
              border: '2px solid var(--line-strong, #ccc)',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--surface)',
            }}
          >
            {Array.from({ length: partition }, (_, i) => {
              const isFilled = dividesF1 && i < f1Units;
              return (
                <div
                  key={i}
                  style={{
                    borderRight: i < partition - 1 ? '1px dashed var(--line)' : 'none',
                    background: isFilled ? 'var(--accent)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: isFilled ? '#fff' : 'var(--ink-3)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  1/{partition}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar 2 */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>
              Second quantity: {f2.n}/{f2.d}
            </span>
            <span style={{ color: dividesF2 ? 'var(--good)' : 'var(--heat)' }}>
              {dividesF2
                ? `${f2Units}/${partition} (${f2.n}/${f2.d})`
                : `Cannot divide ${f2.n}/${f2.d} evenly into ${partition}ths`}
            </span>
          </div>
          <div
            className="fraction-bar-whole"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${partition}, 1fr)`,
              height: 42,
              border: '2px solid var(--line-strong, #ccc)',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--surface)',
            }}
          >
            {Array.from({ length: partition }, (_, i) => {
              const isFilled = dividesF2 && i < f2Units;
              return (
                <div
                  key={i}
                  style={{
                    borderRight: i < partition - 1 ? '1px dashed var(--line)' : 'none',
                    background: isFilled ? 'var(--accent)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: isFilled ? '#fff' : 'var(--ink-3)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  1/{partition}
                </div>
              );
            })}
          </div>
        </div>

        {/* Combined Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Combined Total ({f1.n}/{f1.d} + {f2.n}/{f2.d})</span>
            <span
              style={{
                color: isCommonDenominator ? 'var(--good)' : 'var(--ink-3)',
                fontWeight: isCommonDenominator ? 700 : 400,
              }}
            >
              {isCommonDenominator
                ? `${f1Units}/${partition} + ${f2Units}/${partition} = ${combinedUnits}/${partition}`
                : 'Awaiting equal-sized partitions…'}
            </span>
          </div>
          <div
            className="fraction-bar-whole"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${partition}, 1fr)`,
              height: 42,
              border: `2px solid ${isCommonDenominator ? 'var(--good)' : 'var(--line-strong, #ccc)'}`,
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--surface)',
            }}
          >
            {Array.from({ length: partition }, (_, i) => {
              const isFilledFromF1 = isCommonDenominator && i < f1Units;
              const isFilledFromF2 = isCommonDenominator && i >= f1Units && i < combinedUnits;
              return (
                <div
                  key={i}
                  style={{
                    borderRight: i < partition - 1 ? '1px dashed var(--line)' : 'none',
                    background: isFilledFromF1
                      ? 'var(--accent)'
                      : isFilledFromF2
                      ? 'color-mix(in srgb, var(--accent) 70%, var(--good))'
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: isFilledFromF1 || isFilledFromF2 ? '#fff' : 'var(--ink-3)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  1/{partition}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Repartition Controls */}
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 my-4">
        <label className="text-xs font-bold uppercase tracking-wider block mb-2">
          Choose Whole Subdivisions (Partition size)
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {variant.availablePartitions.map((p) => (
            <button
              key={p}
              onClick={() => handlePartitionChange(p)}
              className={`study-button ${partition === p ? '' : 'secondary'}`}
              style={{ padding: '6px 14px', fontSize: 13 }}
            >
              {p} parts
            </button>
          ))}
        </div>
        <p className="study-muted" style={{ fontSize: 12, marginTop: 8 }}>
          {isCommonDenominator ? (
            <span style={{ color: 'var(--good)', fontWeight: 600 }}>
              ✓ Both wholes are split into equal {partition}ths. We can now combine the {combinedUnits} parts!
            </span>
          ) : (
            <span>
              {partition} parts do not split both fractions evenly. Try another subdivision.
            </span>
          )}
        </p>
      </div>

      {/* Step Explanation */}
      {isCommonDenominator && (
        <div className="study-feedback feedback-correct animate-fade-in" style={{ marginTop: 20 }}>
          <h3 style={{ color: 'var(--good)', margin: '0 0 6px', fontSize: '1.1rem' }}>
            Why common denominators work
          </h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            To add fractions, we cannot add across denominators (which would give an incorrect amount).
            Instead, we find equal-sized pieces: ${f1.n}/{f1.d} = {f1Units}/{partition}$ and ${f2.n}/{f2.d} = {f2Units}/{partition}$.
            Now that every slice is the same size ($1/{partition}$), we combine the numerators: ${f1Units} + {f2Units} = {combinedUnits}/{partition}$.
          </p>
        </div>
      )}

      {/* Independent Follow-up Problem */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <p className="eyebrow">Independent Check</p>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{variant.followUp.question}</h3>
        <p className="study-muted" style={{ marginBottom: 16 }}>
          Paper welcome. Solve independently to record evidence of understanding without the visualizer active.
        </p>

        <form onSubmit={handleCheckFollowUp} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            className="study-answer"
            style={{ margin: 0 }}
            value={followUpInput}
            onChange={(e) => setFollowUpInput(e.target.value)}
            disabled={followUpChecked && followUpCorrect}
            placeholder="e.g. 5/12"
          />
          <button
            type="submit"
            className="study-button"
            disabled={!followUpInput.trim() || (followUpChecked && followUpCorrect)}
          >
            Check on paper
          </button>
        </form>

        {followUpChecked && (
          <div
            className={`study-feedback ${
              followUpCorrect ? 'feedback-correct' : 'feedback-incorrect'
            } animate-fade-in`}
            style={{ marginTop: 14 }}
          >
            <h4 style={{ margin: '0 0 6px', fontWeight: 700 }}>
              {followUpCorrect ? '✓ Correct independent solve' : '✗ Let’s check the method'}
            </h4>
            <p style={{ margin: '0 0 6px' }}>{variant.followUp.explanation}</p>
            {savedNotice && <p className="study-muted" style={{ margin: 0 }}>{savedNotice}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
