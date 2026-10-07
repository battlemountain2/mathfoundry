/**
 * src/components/Study/LessonPlayer.jsx
 *
 * Full-screen interactive guided lesson walkthrough player (Milestone 3).
 * Renders full-screen without sidebar or header chrome.
 * Supports all 6 step types:
 * - explain: Rich text with KaTeX formulas
 * - visual: Embedded FractionBarVisualizer or NumberLineLab
 * - interact: Hands-on partition manipulation
 * - micro-check: Inline formative questions with immediate feedback (isolated from learningAttempts)
 * - key-rule: Rule summary with idempotent "Save to Rulebook" button
 * - transition: Concluding takeaways linking directly to unit practice
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MathBlock from '../Lesson/MathBlock';
import FractionBarVisualizer from './FractionBarVisualizer';
import NumberLineLab from './NumberLineLab';
import AngleExplorer from './Geometry/AngleExplorer';
import PythagoreanVisualizer from './Geometry/PythagoreanVisualizer';
import { addSubtractFractionsLesson } from '../../data/lessons/addSubtractFractions';
import {
  getLessonProgress,
  saveLessonProgress,
  completeLesson,
  getRulebook,
  saveRulebookEntry,
} from '../../utils/storage';
import {
  createRulebookPayload,
  getLessonPracticeUrl,
} from '../../utils/lessonPlayer';
import { equivalentAnswer } from '../../utils/answerChecking';

/**
 * Step View: EXPLAIN
 */
function ExplainStepView({ step }) {
  return (
    <div className="space-y-6">
      {step.subtitle && (
        <p className="eyebrow text-xs uppercase tracking-wider text-[var(--ink-3)] font-semibold mb-1">
          {step.subtitle}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] mb-4">
        {step.title}
      </h2>

      <div className="prose-content text-[var(--ink)] leading-relaxed">
        <MathBlock content={step.content} />
      </div>

      {/* 3-Part Card (Visual Model, Mathematical Step, Engineering Rationale) */}
      {step.threePartCard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]">
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--accent)] block">
              1. Visual Model
            </span>
            <p className="text-xs text-[var(--ink)] leading-relaxed">
              {step.threePartCard.visual}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--good)] block">
              2. Mathematical Step
            </span>
            <div className="text-xs text-[var(--ink)] leading-relaxed">
              <MathBlock content={step.threePartCard.math} />
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--heat)] block">
              3. Engineering Rationale
            </span>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              {step.threePartCard.rationale}
            </p>
          </div>
        </div>
      )}

      {step.callout && (
        <div className="p-4 sm:p-5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]">
          {step.callout.title && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
              {step.callout.title}
            </h4>
          )}
          <p className="text-sm text-[var(--ink-2)] m-0 leading-relaxed">
            {step.callout.message || step.callout.text}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Step View: VISUAL
 */
function VisualStepView({ step }) {
  const isFractionBars =
    step.visualizer === 'fraction-bars' || step.component === 'FractionBarVisualizer';
  const isNumberLine =
    step.visualizer === 'number-line' || step.component === 'NumberLineLab';
  const isAngleExplorer =
    step.visualizer === 'angle-explorer' || step.component === 'AngleExplorer';
  const isPythagoras =
    step.visualizer === 'pythagoras' || step.component === 'PythagoreanVisualizer';

  return (
    <div className="space-y-6">
      {step.subtitle && (
        <p className="eyebrow text-xs uppercase tracking-wider text-[var(--ink-3)] font-semibold mb-1">
          {step.subtitle}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] mb-4">
        {step.title}
      </h2>

      {step.content && (
        <div className="text-[var(--ink)] leading-relaxed mb-4">
          <MathBlock content={step.content} />
        </div>
      )}

      {/* Embedded visual components */}
      <div className="my-6">
        {isFractionBars && (
          <FractionBarVisualizer
            {...step.props}
            // Follow-up solve inside visualizer does NOT advance parent lesson step (T3.02)
            onComplete={() => {}}
          />
        )}
        {isNumberLine && (
          <NumberLineLab
            embedded={true}
            {...step.props}
          />
        )}
        {isAngleExplorer && (
          <AngleExplorer
            embedded={true}
            {...step.props}
          />
        )}
        {isPythagoras && (
          <PythagoreanVisualizer
            embedded={true}
            {...step.props}
          />
        )}
      </div>

      {/* 3-Part Card on Visual Steps */}
      {step.threePartCard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]">
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--accent)] block">
              1. Visual Model
            </span>
            <p className="text-xs text-[var(--ink)] leading-relaxed">
              {step.threePartCard.visual}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--good)] block">
              2. Mathematical Step
            </span>
            <div className="text-xs text-[var(--ink)] leading-relaxed">
              <MathBlock content={step.threePartCard.math} />
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--heat)] block">
              3. Engineering Rationale
            </span>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              {step.threePartCard.rationale}
            </p>
          </div>
        </div>
      )}

      {step.callout && (
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]">
          {step.callout.title && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
              {step.callout.title}
            </h4>
          )}
          <p className="text-sm text-[var(--ink-2)] m-0">
            {step.callout.message || step.callout.text}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Step View: INTERACT
 */
function InteractStepView({ step }) {
  const availablePartitions = step.availablePartitions || [2, 3, 4, 5, 6, 12];
  const targetPartition = step.targetPartition || 6;
  const [selectedPartition, setSelectedPartition] = useState(
    step.userPartition || step.initialPartition || 2
  );

  const f1 = step.fractions?.[0] || { n: 1, d: 2 };
  const f2 = step.fractions?.[1] || { n: 1, d: 3 };

  const dividesF1 = (selectedPartition * f1.n) % f1.d === 0;
  const dividesF2 = (selectedPartition * f2.n) % f2.d === 0;
  const f1Units = dividesF1 ? (selectedPartition * f1.n) / f1.d : null;
  const f2Units = dividesF2 ? (selectedPartition * f2.n) / f2.d : null;
  const isMatch = selectedPartition === targetPartition || (dividesF1 && dividesF2);

  return (
    <div className="space-y-6">
      {step.subtitle && (
        <p className="eyebrow text-xs uppercase tracking-wider text-[var(--ink-3)] font-semibold mb-1">
          {step.subtitle}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] mb-4">
        {step.title}
      </h2>

      {step.instruction && (
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-sm font-medium text-[var(--ink)]">
          <MathBlock content={step.instruction} />
        </div>
      )}

      {/* Interactive Partition Controls */}
      <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider block text-[var(--ink-2)]">
          Choose Whole Subdivisions (Partition Count):
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {availablePartitions.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPartition(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedPartition === p
                  ? 'bg-[var(--accent)] text-[var(--surface)] shadow-sm scale-105'
                  : 'bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--line)]'
              }`}
            >
              {p} parts
            </button>
          ))}
        </div>

        {/* Dynamic visual preview grid */}
        <div className="space-y-4 pt-2">
          {/* Fraction 1 */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[var(--ink)]">
                First fraction: {f1.n}/{f1.d}
              </span>
              <span
                style={{
                  color: dividesF1 ? 'var(--good)' : 'var(--heat)',
                }}
              >
                {dividesF1
                  ? `${f1Units}/${selectedPartition} (${f1.n}/${f1.d})`
                  : `Cannot divide ${f1.n}/${f1.d} evenly into ${selectedPartition}ths`}
              </span>
            </div>
            <div
              className="h-10 rounded-lg border border-[var(--line)] overflow-hidden bg-[var(--surface-2)] grid"
              style={{ gridTemplateColumns: `repeat(${selectedPartition}, 1fr)` }}
            >
              {Array.from({ length: selectedPartition }, (_, i) => {
                const isFilled = dividesF1 && i < f1Units;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-center text-[10px] font-mono border-r border-dashed border-[var(--line)] last:border-r-0"
                    style={{
                      backgroundColor: isFilled ? 'var(--accent)' : 'transparent',
                      color: isFilled ? 'var(--surface)' : 'var(--ink-3)',
                    }}
                  >
                    1/{selectedPartition}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fraction 2 */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[var(--ink)]">
                Second fraction: {f2.n}/{f2.d}
              </span>
              <span
                style={{
                  color: dividesF2 ? 'var(--good)' : 'var(--heat)',
                }}
              >
                {dividesF2
                  ? `${f2Units}/${selectedPartition} (${f2.n}/${f2.d})`
                  : `Cannot divide ${f2.n}/${f2.d} evenly into ${selectedPartition}ths`}
              </span>
            </div>
            <div
              className="h-10 rounded-lg border border-[var(--line)] overflow-hidden bg-[var(--surface-2)] grid"
              style={{ gridTemplateColumns: `repeat(${selectedPartition}, 1fr)` }}
            >
              {Array.from({ length: selectedPartition }, (_, i) => {
                const isFilled = dividesF2 && i < f2Units;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-center text-[10px] font-mono border-r border-dashed border-[var(--line)] last:border-r-0"
                    style={{
                      backgroundColor: isFilled ? 'var(--accent)' : 'transparent',
                      color: isFilled ? 'var(--surface)' : 'var(--ink-3)',
                    }}
                  >
                    1/{selectedPartition}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Immediate validation message */}
        <div className="pt-2">
          {isMatch ? (
            <div className="p-3.5 rounded-xl border border-[var(--good)] bg-[var(--surface-2)] text-[var(--good)] text-sm font-semibold flex items-center gap-2">
              <span>✓</span>
              <span>
                {step.validation?.successMessage ||
                  `Perfect! Both wholes are split into equal ${selectedPartition}ths.`}
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] text-xs">
              {step.validation?.hintMessage ||
                `${selectedPartition} parts do not split both fractions evenly. Try another partition.`}
            </div>
          )}
        </div>
      </div>

      {step.content && (
        <div className="text-[var(--ink)] leading-relaxed">
          <MathBlock content={step.content} />
        </div>
      )}
    </div>
  );
}

/**
 * Step View: MICRO-CHECK (Formative Engagement - ZERO learningAttempts writes)
 */
function MicroCheckStepView({ step, stepKey, savedAnswer, onSubmitAnswer }) {
  const [inputVal, setInputVal] = useState(savedAnswer || '');
  const [feedback, setFeedback] = useState(() => {
    if (savedAnswer) {
      const isCorrect = equivalentAnswer(savedAnswer, step.expectedAnswer);
      return {
        checked: true,
        isCorrect,
        message: isCorrect
          ? 'Correct! Well done.'
          : (step.pitfallWarning || 'Not quite. Check your calculation and try again.'),
      };
    }
    return { checked: false, isCorrect: false, message: '' };
  });

  useEffect(() => {
    if (savedAnswer && savedAnswer !== inputVal) {
      setInputVal(savedAnswer);
      const isCorrect = equivalentAnswer(savedAnswer, step.expectedAnswer);
      setFeedback({
        checked: true,
        isCorrect,
        message: isCorrect
          ? 'Correct! Well done.'
          : (step.pitfallWarning || 'Not quite. Check your calculation and try again.'),
      });
    }
  }, [savedAnswer]);

  function handleCheck(e) {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    const isCorrect = equivalentAnswer(trimmed, step.expectedAnswer);
    setFeedback({
      checked: true,
      isCorrect,
      message: isCorrect
        ? 'Correct! Well done.'
        : (step.pitfallWarning || 'Not quite. Check your calculation and try again.'),
    });
    onSubmitAnswer(stepKey, trimmed);
  }

  return (
    <div className="study-card p-6 sm:p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm space-y-6">
      <div>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)] mb-2">
          Check Your Understanding
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)]">
          {step.title}
        </h2>
      </div>

      {/* Question rendering */}
      <div className="text-lg font-medium text-[var(--ink)]">
        <MathBlock content={step.question} />
      </div>

      {/* Input & Form */}
      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3 max-w-md">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={step.placeholder || 'Enter your answer'}
          className="study-answer flex-1 px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] font-mono text-base focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="study-button px-5 py-2.5 rounded-xl text-sm font-semibold transition-transform active:scale-95 disabled:opacity-40"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--surface)',
          }}
        >
          Check Answer
        </button>
      </form>

      {/* Inline Feedback */}
      {feedback.checked && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            feedback.isCorrect
              ? 'border-[var(--good)] bg-[var(--surface-2)] text-[var(--good)]'
              : 'border-[var(--heat)] bg-[var(--surface-2)] text-[var(--heat)]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm mb-1">
            <span>{feedback.isCorrect ? '✓' : '✗'}</span>
            <span>{feedback.isCorrect ? 'Correct!' : 'Try Again'}</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--ink-2)] m-0 leading-relaxed">
            {feedback.isCorrect
              ? step.explanation || feedback.message
              : feedback.message}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Step View: KEY-RULE (Rulebook Entry Codification)
 */
function KeyRuleStepView({ step, isSaved, onSaveRule }) {
  const rulePayload = createRulebookPayload(step);

  return (
    <div className="study-card p-6 sm:p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)] mb-2">
            Rulebook Entry
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            {step.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onSaveRule(rulePayload)}
          disabled={isSaved}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            isSaved
              ? 'bg-[var(--surface-2)] text-[var(--good)] border border-[var(--good)] cursor-default'
              : 'bg-[var(--accent)] text-[var(--surface)] hover:opacity-90 shadow-sm active:scale-95'
          }`}
        >
          {isSaved ? '✓ Saved to Rulebook' : 'Save to Rulebook'}
        </button>
      </div>

      {step.formula && (
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-center">
          <MathBlock content={step.formula} />
        </div>
      )}

      {step.explanation && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-3)] mb-1">
            Core Explanation
          </h4>
          <p className="text-sm leading-relaxed text-[var(--ink)]">
            {step.explanation}
          </p>
        </div>
      )}

      {step.coreSteps && Array.isArray(step.coreSteps) && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-3)] mb-2">
            Method Steps
          </h4>
          <ul className="space-y-1.5 text-sm text-[var(--ink-2)]">
            {step.coreSteps.map((st, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-semibold text-[var(--accent)]">{i + 1}.</span>
                <span>{st.replace(/^\d+\.\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.whenToUse && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-3)] mb-1">
            When to Use
          </h4>
          <p className="text-sm text-[var(--ink-2)]">
            {step.whenToUse}
          </p>
        </div>
      )}

      {step.pitfall && (
        <div className="p-4 rounded-xl border-l-4 border-[var(--heat)] bg-[var(--surface-2)]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--heat)] mb-1">
            Common Pitfall
          </h4>
          <p className="text-sm text-[var(--ink-2)] m-0">
            {step.pitfall}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Step View: TRANSITION
 */
function TransitionStepView({ step, onStartPractice }) {
  return (
    <div className="study-card p-6 sm:p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] text-3xl mb-2">
        🎉
      </div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
          {step.title}
        </h2>
        {step.subtitle && (
          <p className="text-sm text-[var(--ink-2)] mt-1 max-w-lg mx-auto">
            {step.subtitle}
          </p>
        )}
      </div>

      {(step.detailedSummary || step.summary) && (
        <div className="text-left p-5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] max-w-xl mx-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-3)] mb-3">
            Key Takeaways
          </h4>
          <ul className="space-y-2.5">
            {(step.detailedSummary || step.summary).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--ink)]">
                <span className="text-[var(--good)] font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={onStartPractice}
          className="study-button px-6 py-3 rounded-xl text-base font-semibold transition-transform active:scale-95 shadow-md"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--surface)',
          }}
        >
          {step.callToAction || 'Start Unit Practice →'}
        </button>
      </div>
    </div>
  );
}

/**
 * Main LessonPlayer Component
 */
export default function LessonPlayer({
  lesson = addSubtractFractionsLesson,
  unitPath = 'math/add-subtract-fractions',
  courseId = 'math',
  unitId = 'add-subtract-fractions',
  onExit = null,
  onComplete = null,
}) {
  const navigate = useNavigate();

  const activeLesson = lesson || addSubtractFractionsLesson;
  const activeUnitPath = unitPath || activeLesson.unitPath || `${courseId}/${unitId}`;
  const steps = activeLesson.steps || [];
  const totalSteps = Math.max(1, steps.length);

  // Initialize step index from stored progress
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    const saved = getLessonProgress(activeUnitPath);
    if (saved && typeof saved.currentStepIndex === 'number') {
      return Math.max(0, Math.min(totalSteps - 1, saved.currentStepIndex));
    }
    return 0;
  });

  // Initialize micro-check answers from storage
  const [microCheckAnswers, setMicroCheckAnswers] = useState(() => {
    const saved = getLessonProgress(activeUnitPath);
    return saved?.microCheckAnswers && typeof saved.microCheckAnswers === 'object'
      ? { ...saved.microCheckAnswers }
      : {};
  });

  // Track rulebook saved entries
  const [ruleSavedMap, setRuleSavedMap] = useState(() => {
    const rules = getRulebook();
    const map = {};
    if (Array.isArray(rules)) {
      rules.forEach((r) => {
        if (r?.id) map[r.id] = true;
      });
    }
    return map;
  });

  // Re-sync on unitPath change
  useEffect(() => {
    const saved = getLessonProgress(activeUnitPath);
    if (saved && typeof saved.currentStepIndex === 'number') {
      setCurrentStepIndex(Math.max(0, Math.min(totalSteps - 1, saved.currentStepIndex)));
    }
    if (saved?.microCheckAnswers) {
      setMicroCheckAnswers(saved.microCheckAnswers);
    }
  }, [activeUnitPath, totalSteps]);

  const currentStep = steps[currentStepIndex] || steps[0] || {};
  const isFirstStep = currentStepIndex === 0;
  const isFinalStep = currentStepIndex === totalSteps - 1;
  const progressRatio = (currentStepIndex + 1) / totalSteps;
  const progressPercent = Math.round(progressRatio * 100);

  // Navigation handlers
  function handleExit() {
    if (onExit) {
      onExit();
    } else {
      navigate(`/courses/${courseId}/${unitId}`);
    }
  }

  function handleBack() {
    if (currentStepIndex > 0) {
      const nextIdx = currentStepIndex - 1;
      setCurrentStepIndex(nextIdx);
      saveLessonProgress(activeUnitPath, { currentStepIndex: nextIdx });
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  function handleContinue() {
    if (currentStepIndex < totalSteps - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      saveLessonProgress(activeUnitPath, { currentStepIndex: nextIdx });
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Final transition step: Mark completed and navigate to practice
      const completedAt = new Date().toISOString();
      saveLessonProgress(activeUnitPath, {
        currentStepIndex,
        completed: true,
        completedAt,
      });
      completeLesson(activeUnitPath);
      if (onComplete) onComplete();
      const targetUrl =
        currentStep.targetUrl || getLessonPracticeUrl(courseId, unitId);
      navigate(targetUrl);
    }
  }

  // Micro-check answer submission: saves ONLY to lessonProgress (zero writes to learningAttempts)
  function handleMicroCheckSubmit(stepKey, answer) {
    const updated = { ...microCheckAnswers, [stepKey]: answer };
    setMicroCheckAnswers(updated);
    saveLessonProgress(activeUnitPath, {
      currentStepIndex,
      microCheckAnswers: updated,
    });
  }

  // Key-rule persistence
  function handleSaveRule(payload) {
    if (!payload || !payload.id) return;
    saveRulebookEntry(payload);
    setRuleSavedMap((prev) => ({ ...prev, [payload.id]: true }));
  }

  const currentRuleId = currentStep.ruleId || currentStep.id;
  const isCurrentRuleSaved = Boolean(currentRuleId && ruleSavedMap[currentRuleId]);
  const currentStepKey = currentStep.checkKey || currentStep.id || `step${currentStepIndex}`;

  return (
    <div
      className="lesson-player fixed inset-0 z-50 overflow-y-auto flex flex-col bg-[var(--ground)] text-[var(--ink)] select-text"
      data-testid="lesson-player"
    >
      {/* Top Header / Progress Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 sm:px-6 border-b border-[var(--line)] bg-[var(--surface)] backdrop-blur-md">
        {/* Left: Exit Action */}
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors border border-[var(--line)]"
          aria-label="Exit lesson"
        >
          <span>✕</span>
          <span>Exit</span>
        </button>

        {/* Center: Top Progress Bar & Step Label */}
        <div className="flex-1 max-w-md mx-auto flex items-center gap-3">
          <div
            className="flex-1 h-2 rounded-full overflow-hidden border border-[var(--line)] bg-[var(--surface-2)]"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'var(--accent)',
              }}
            />
          </div>
          <span className="text-xs font-mono font-medium text-[var(--ink-2)] whitespace-nowrap">
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Right: Lesson Unit Title */}
        <div className="hidden sm:block text-xs font-medium text-[var(--ink-3)] truncate max-w-[200px]">
          {activeLesson.title}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-12 flex flex-col justify-start">
        {currentStep.type === 'explain' && <ExplainStepView step={currentStep} />}
        {currentStep.type === 'visual' && <VisualStepView step={currentStep} />}
        {currentStep.type === 'interact' && <InteractStepView step={currentStep} />}
        {currentStep.type === 'micro-check' && (
          <MicroCheckStepView
            step={currentStep}
            stepKey={currentStepKey}
            savedAnswer={microCheckAnswers[currentStepKey]}
            onSubmitAnswer={handleMicroCheckSubmit}
          />
        )}
        {currentStep.type === 'key-rule' && (
          <KeyRuleStepView
            step={currentStep}
            isSaved={isCurrentRuleSaved}
            onSaveRule={handleSaveRule}
          />
        )}
        {currentStep.type === 'transition' && (
          <TransitionStepView
            step={currentStep}
            onStartPractice={handleContinue}
          />
        )}
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="sticky bottom-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6 border-t border-[var(--line)] bg-[var(--surface)] backdrop-blur-md">
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirstStep}
          className="study-button secondary px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--line)] text-[var(--ink)]"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="study-button px-6 py-2 rounded-xl text-sm font-semibold transition-transform active:scale-95 shadow-sm"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--surface)',
          }}
        >
          {isFinalStep
            ? currentStep.callToAction || 'Start Practice →'
            : 'Continue →'}
        </button>
      </footer>
    </div>
  );
}
