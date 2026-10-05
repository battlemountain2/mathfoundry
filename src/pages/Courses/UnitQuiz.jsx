import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse } from '../../data/courses/courseCatalog';
import { getMathUnit, getNextMathUnit } from '../../data/courses/mathFoundations';
import { makeProblem } from '../../data/foundations';
import { setModuleProgress, saveLearningAttempt } from '../../utils/storage';
import { equivalentAnswer } from '../../utils/answerChecking';

export default function UnitQuiz() {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();
  const course = getCourse(courseId) || getCourse('math');
  const unit = getMathUnit(unitId);
  const nextUnit = unit ? getNextMathUnit(unit.id) : null;

  // 4 quiz questions
  const targetConcept = unit?.legacyConceptId || 'arithmetic';
  const questions = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) =>
      makeProblem(targetConcept, 20 + i, i === 0 ? 'rule' : 'numeric')
    );
  }, [targetConcept]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  function handleSubmitAnswer() {
    if (!currentQ || !input.trim()) return;

    let isCorrect = false;
    if (currentQ.format === 'rule') {
      isCorrect = Number(input.trim()) === currentQ.answer;
    } else {
      isCorrect = equivalentAnswer(input.trim(), currentQ.answer);
    }

    const recorded = {
      questionId: currentQ.id,
      question: currentQ.question,
      submittedAnswer: input.trim(),
      expectedAnswer: currentQ.answer,
      explanation: currentQ.explanation,
      isCorrect,
    };

    // Save attempt for evidence
    saveLearningAttempt({
      id: `quiz-${unit?.id}-${Date.now()}-${currentIndex}`,
      conceptId: currentQ.conceptId,
      unitId: unit?.id,
      unitPath: unit?.unitPath,
      problemId: currentQ.id,
      question: currentQ.question,
      submittedAnswer: input.trim(),
      expectedAnswer: currentQ.answer,
      isCorrect,
      assisted: false,
      mode: 'unit-quiz',
      timestamp: new Date().toISOString(),
    });

    const nextAnswers = [...answers, recorded];
    setAnswers(nextAnswers);
    setInput('');

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Evaluate quiz result
      const correctCount = nextAnswers.filter((a) => a.isCorrect).length;
      const score = correctCount / questions.length;
      const quizPassed = score >= 0.75;

      setModuleProgress(unit.id, {
        completed: quizPassed,
        quizScore: score,
        quizPassed,
        lastUpdated: new Date().toISOString(),
      });
      if (unit.unitPath) {
        setModuleProgress(unit.unitPath, {
          completed: quizPassed,
          quizScore: score,
          quizPassed,
          lastUpdated: new Date().toISOString(),
        });
      }

      setIsFinished(true);
    }
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
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = correctCount >= 3;

    return (
      <div className="study-page animate-fade-in max-w-xl mx-auto py-10 text-center">
        <div className="study-card p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <span className="text-4xl mb-3 inline-block">{passed ? '🏆' : '📚'}</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] mb-2">
            {passed ? 'Unit Quiz Passed!' : 'Quiz Needs Review'}
          </h1>
          <p className="text-sm text-[var(--ink-2)] mb-6">
            {passed
              ? `Great job! You demonstrated mastery in ${unit.title}. Downstream units are now unlocked.`
              : `You scored ${score}%. Take a few minutes to review the lesson or practice more before retrying.`}
          </p>

          <div className="p-4 rounded-xl bg-[var(--surface-2)] max-w-xs mx-auto mb-8 font-mono">
            <span className="text-xs text-[var(--ink-3)] block uppercase">Score</span>
            <span
              className={`text-2xl font-bold ${
                passed ? 'text-[var(--good)]' : 'text-[var(--heat)]'
              }`}
            >
              {correctCount} / {questions.length} ({score}%)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/courses/${course.id}/${unit.id}`}
              className="study-button secondary px-5 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line)] text-[var(--ink)]"
            >
              Return to Unit
            </Link>
            {passed && nextUnit ? (
              <Link
                to={`/courses/${course.id}/${nextUnit.id}`}
                className="study-button px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
              >
                Next Unit: {nextUnit.title} →
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAnswers([]);
                  setCurrentIndex(0);
                  setIsFinished(false);
                }}
                className="study-button px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
              >
                Retry Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-page animate-fade-in max-w-2xl mx-auto py-6">
      {/* Top Breadcrumb */}
      <nav className="mb-4 flex items-center justify-between text-xs font-semibold text-[var(--ink-3)]">
        <Link
          to={`/courses/${course.id}/${unit.id}`}
          className="hover:text-[var(--ink)] transition-colors flex items-center gap-1"
        >
          <span>←</span>
          <span>Exit Quiz</span>
        </Link>
        <span className="font-mono">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </nav>

      {/* Progress Bar */}
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

      {/* Quiz Card */}
      <div className="study-card p-6 sm:p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="mb-3">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--ink-3)]">
            {unit.title} · Summative Check
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-6 leading-snug">
          {currentQ.question}
        </h2>

        {/* Input Interface */}
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
                if (e.key === 'Enter' && input.trim()) handleSubmitAnswer();
              }}
              placeholder="Enter numerical answer"
              className="study-answer w-full p-3.5 rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--ink)] font-mono text-lg"
              autoFocus
            />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={!input.trim()}
            className="study-button px-6 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
          >
            {currentIndex + 1 >= questions.length ? 'Submit Quiz →' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  );
}
