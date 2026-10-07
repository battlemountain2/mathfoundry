import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse } from '../../data/courses/courseCatalog';
import { getMathUnit } from '../../data/courses/mathFoundations';
import { getGeometryUnit } from '../../data/courses/geometryFoundations';
import { makeProblem } from '../../data/foundations';
import { generateUnitPracticeSet } from '../../utils/problemGenerator';
import { saveLearningAttempt, updateAttemptReflectiveCause, getLearningAttempts } from '../../utils/storage';
import { equivalentAnswer, numericValue, analyzeIntermediateStep } from '../../utils/answerChecking';
import { getProblemHint } from '../../utils/hints';
import MathBlock from '../../components/Lesson/MathBlock';
import VideoDrawer from '../../components/Study/VideoDrawer';

const REFLECTIVE_OPTIONS = [
  { id: 'calc-slip', label: 'Calculation slip', icon: '🧮' },
  { id: 'rule-confused', label: 'Confused the rule', icon: '📖' },
  { id: 'misread', label: 'Misread numbers', icon: '👁️' },
  { id: 'unsure-start', label: 'Unsure where to start', icon: '❓' },
  { id: 'other', label: 'Other reason', icon: '💡' },
];

export default function UnitPractice() {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();
  const course = getCourse(courseId) || getCourse('math');
  const isGeometry = courseId === 'geometry';
  const unit = isGeometry ? getGeometryUnit(unitId) : getMathUnit(unitId);

  // Generate randomized 6 problems with spaced repetition reinforcement
  const targetConcept = unit?.legacyConceptId || unit?.id || (isGeometry ? 'angles-lines' : 'arithmetic');
  const questions = useMemo(() => {
    return generateUnitPracticeSet(targetConcept, unit?.id, courseId || (isGeometry ? 'geometry' : 'math'));
  }, [targetConcept, unit?.id, courseId, isGeometry]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [intermediateStep, setIntermediateStep] = useState('');
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [assisted, setAssisted] = useState(false);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [initialAnswer, setInitialAnswer] = useState(null);
  const [lastAttemptId, setLastAttemptId] = useState(null);
  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const [error, setError] = useState('');

  const currentQ = questions[currentIndex];
  const isFinished = currentIndex >= questions.length;

  function handleSubmitAnswer(skipped = false) {
    if (!currentQ) return;
    const finalAnswer = skipped ? 'skipped' : input.trim();
    if (!skipped && !finalAnswer) return;

    const attemptsCount = attemptsOnCurrent + 1;
    const savedInitial = initialAnswer === null ? finalAnswer : initialAnswer;
    setInitialAnswer(savedInitial);
    setAttemptsOnCurrent(attemptsCount);

    let isCorrect = false;
    if (!skipped) {
      if (currentQ.format === 'rule') {
        isCorrect = Number(finalAnswer) === currentQ.answer;
      } else {
        isCorrect = equivalentAnswer(finalAnswer, currentQ.answer);
      }
    }

    const stepAnalysis =
      intermediateStep.trim() && !skipped && currentQ.conceptId === 'addition'
        ? analyzeIntermediateStep(currentQ, intermediateStep)
        : null;

    const attemptId = `practice-${unit?.id || 'unit'}-${Date.now()}-${currentIndex}`;
    setLastAttemptId(attemptId);

    const attempt = {
      id: attemptId,
      conceptId: currentQ.conceptId,
      unitId: unit?.id,
      unitPath: unit?.unitPath || (isGeometry ? `geometry/${unit?.id}` : `math/${unit?.id}`),
      problemId: currentQ.id,
      question: currentQ.question,
      submittedAnswer: finalAnswer,
      initialAnswer: savedInitial,
      expectedAnswer: currentQ.answer,
      explanation: currentQ.explanation,
      isCorrect,
      skipped,
      assisted: assisted || attemptsCount > 1,
      mode: 'unit-practice',
      timestamp: new Date().toISOString(),
    };

    try {
      saveLearningAttempt(attempt);
      setChecked(true);
      if (skipped || isCorrect) {
        setShowSolution(true);
        setShowHint(false);
      } else {
        setShowHint(true);
        setShowSolution(false);
      }
      setRecordedAnswers((prev) => [...prev, attempt]);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleRetry() {
    setChecked(false);
    setShowHint(true);
    setAssisted(true);
  }

  function handleWalkThrough() {
    setShowSolution(true);
    setAssisted(true);
  }

  function handleSelectReflectiveCause(causeId) {
    if (!lastAttemptId) return;
    updateAttemptReflectiveCause(lastAttemptId, causeId);
    setRecordedAnswers((prev) =>
      prev.map((a) => (a.id === lastAttemptId ? { ...a, reflectiveCause: causeId } : a))
    );
  }

  function handleNext() {
    setChecked(false);
    setShowHint(false);
    setShowSolution(false);
    setAssisted(false);
    setInput('');
    setIntermediateStep('');
    setAttemptsOnCurrent(0);
    setInitialAnswer(null);
    setLastAttemptId(null);
    setCurrentIndex((prev) => prev + 1);
  }

  if (!unit) {
    return (
      <div className="study-page py-12 text-center">
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-4">Unit not found</h1>
        <Link to="/courses" className="study-button">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  if (isFinished) {
    const totalCorrect = recordedAnswers.filter((a) => a.isCorrect).length;
    const totalIndependent = recordedAnswers.filter((a) => a.isCorrect && !a.assisted).length;

    return (
      <div className="study-page animate-fade-in max-w-2xl mx-auto py-10 text-center">
        <div className="study-card p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <span className="text-4xl mb-3 inline-block">🎉</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] mb-2">
            Practice Complete!
          </h1>
          <p className="text-sm text-[var(--ink-2)] mb-6">
            You finished the practice block for <strong>{unit.title}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8 font-mono">
            <div className="p-3 rounded-xl bg-[var(--surface-2)]">
              <span className="text-xs text-[var(--ink-3)] block uppercase">Correct</span>
              <span className="text-xl font-bold text-[var(--good)]">
                {totalCorrect} / {questions.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-2)]">
              <span className="text-xs text-[var(--ink-3)] block uppercase">Independent</span>
              <span className="text-xl font-bold text-[var(--accent)]">
                {totalIndependent} / {questions.length}
              </span>
            </div>
          </div>

          {/* Explicit Up Next Guidance */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] mb-8 text-left max-w-md mx-auto">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-bold block mb-1">
              {totalCorrect >= 5 ? '🎯 Next Milestone Recommended' : '💡 Recommended Next Step'}
            </span>
            <p className="text-sm font-semibold text-[var(--ink)] m-0">
              {totalCorrect >= 5
                ? `Take the Unit Quiz for ${unit.title} to lock in unit mastery.`
                : `Review and repair the ${questions.length - totalCorrect} slip(s) before taking the quiz.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {totalCorrect >= 5 ? (
              <Link
                to={`/courses/${course.id}/${unit.id}/quiz`}
                className="study-button px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
              >
                Take Unit Quiz →
              </Link>
            ) : (
              <Link
                to="/repair"
                className="study-button px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
              >
                Repair Mistakes →
              </Link>
            )}
            <Link
              to={`/courses/${course.id}/${unit.id}`}
              className="study-button secondary px-5 py-2.5 rounded-xl font-semibold text-sm border border-[var(--line)] text-[var(--ink)]"
            >
              Back to Unit Page
            </Link>
            <Link
              to={`/courses/${course.id}`}
              className="study-button secondary px-5 py-2.5 rounded-xl font-semibold text-sm border border-[var(--line)] text-[var(--ink)]"
            >
              Course Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentAttempt = recordedAnswers[recordedAnswers.length - 1];
  const isIncorrectPending = checked && currentAttempt && !currentAttempt.isCorrect && !showSolution;

  return (
    <div className="study-page animate-fade-in max-w-2xl mx-auto py-6">
      {/* Top Breadcrumb */}
      <nav className="mb-4 flex items-center justify-between text-xs font-semibold text-[var(--ink-3)]">
        <Link
          to={`/courses/${course.id}/${unit.id}`}
          className="hover:text-[var(--ink)] transition-colors flex items-center gap-1"
        >
          <span>←</span>
          <span>Exit to {unit.title}</span>
        </Link>
        <span className="font-mono">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </nav>

      {/* Progress Line */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface-2)] mb-6 border border-[var(--line)]"
        role="progressbar"
        aria-valuenow={((currentIndex + 1) / questions.length) * 100}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
            backgroundColor: 'var(--accent)',
          }}
        />
      </div>

      {error && <p role="alert" className="study-notice mb-4">{error}</p>}

      {/* Question Card */}
      <div className="study-card p-6 sm:p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--ink-3)]">
              {unit.title} · Paper-First
            </span>
            {currentQ?.isReinforcement && (
              <span className="study-badge text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--heat-soft)] text-[var(--heat)]">
                🎯 Slip Reinforcement
              </span>
            )}
          </div>
          {assisted && (
            <span className="study-badge text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink-3)]">
              Supported Attempt
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-6 leading-snug">
          {currentQ.question}
        </h2>

        {/* Input Interface */}
        {!checked ? (
          <div>
            {currentQ.format === 'rule' && currentQ.options ? (
              <div className="space-y-2 mb-6">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInput(String(i))}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${
                      input === String(i)
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                        : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:border-[var(--line-strong)]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-6">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim()) handleSubmitAnswer(false);
                  }}
                  placeholder="Enter answer (e.g. 5/12 or 42)"
                  className="study-answer w-full p-3.5 rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--ink)] font-mono text-lg"
                  autoFocus
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleSubmitAnswer(true)}
                className="text-xs font-semibold text-[var(--ink-3)] hover:text-[var(--ink)]"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={() => handleSubmitAnswer(false)}
                disabled={!input.trim()}
                className="study-button px-6 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
              >
                Check Answer →
              </button>
            </div>
          </div>
        ) : (
          /* Checked State Feedback */
          <div className="space-y-6">
            {currentAttempt?.isCorrect ? (
              <div className="p-4 rounded-xl border border-[var(--good)] bg-[var(--good-soft)] text-[var(--ink)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[var(--good)]">✓ Correct!</span>
                  {currentAttempt.assisted && (
                    <span className="text-xs text-[var(--ink-3)] font-mono">(with help)</span>
                  )}
                </div>
                <p className="text-sm mt-2">{currentQ.explanation}</p>
              </div>
            ) : isIncorrectPending ? (
              /* Incorrect pending solution: show hint and offer retry */
              <div className="p-4 rounded-xl border border-[var(--heat)] bg-[var(--heat-soft)] text-[var(--ink)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[var(--heat)]">Not quite yet</span>
                  <span className="font-mono text-xs text-[var(--ink-3)]">
                    Submitted: {currentAttempt?.submittedAnswer}
                  </span>
                </div>
                <p className="text-sm text-[var(--ink-2)] mb-4">
                  {getProblemHint(currentQ) || 'Check your decomposition or common denominator.'}
                </p>

                {/* Reflective Cause Pills */}
                <div className="pt-3 border-t border-[var(--line)]">
                  <span className="text-xs font-semibold text-[var(--ink-3)] block mb-2">
                    What caused this slip? (optional)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {REFLECTIVE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectReflectiveCause(opt.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          currentAttempt?.reflectiveCause === opt.id
                            ? 'bg-[var(--accent)] text-[var(--surface)] border-[var(--accent)] font-semibold'
                            : 'bg-[var(--surface)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--line-strong)]'
                        }`}
                      >
                        <span className="mr-1">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-[var(--line)]">
                  <button
                    type="button"
                    onClick={handleWalkThrough}
                    className="text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] underline"
                  >
                    Walk me through it
                  </button>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="study-button px-5 py-2 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
                  >
                    Retry Problem
                  </button>
                </div>
              </div>
            ) : (
              /* Solution Walkthrough */
              <div className="p-4 rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--ink)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-3)] block mb-2">
                  Solution Walkthrough
                </span>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[var(--surface)] border border-[var(--line)] font-mono text-xs mb-3">
                  <div>
                    <span className="text-[var(--ink-3)] block">Your answer:</span>
                    <span className="font-bold text-[var(--heat)]">
                      {currentAttempt?.initialAnswer || 'Skipped'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--ink-3)] block">Expected answer:</span>
                    <span className="font-bold text-[var(--good)]">{currentQ.answer}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {(currentAttempt?.isCorrect || showSolution) && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="study-button px-6 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
                >
                  {currentIndex + 1 >= questions.length ? 'Finish Practice →' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side-by-side Video Lecture Drawer */}
      <VideoDrawer unitId={unit?.id} />
    </div>
  );
}
