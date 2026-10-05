import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllLearningAttempts,
  getLessonProgress,
  getProgress,
} from '../utils/storage';
import { mathFoundationsUnits, checkUnitPrerequisites, getMathUnit } from '../data/courses/mathFoundations';
import { getPrioritizedReviewQueue } from '../utils/learningProfile';
import { useProgress } from '../hooks/useProgress';

export default function Home() {
  useProgress();
  const allWork = getAllLearningAttempts();
  const reviewQueue = getPrioritizedReviewQueue(allWork).slice(0, 3);

  // Compute the single primary next action across courses and units
  const primaryAction = useMemo(() => {
    const rawProgress = getProgress();
    const satisfiedSet = new Set();

    // Check for in-progress lesson first
    for (const unit of mathFoundationsUnits) {
      if (unit.hasLesson) {
        const lesson = getLessonProgress(unit.unitPath);
        if (lesson && !lesson.completed && (lesson.currentStepIndex > 0 || Object.keys(lesson.microCheckAnswers || {}).length > 0)) {
          return {
            badge: 'In Progress · Lesson',
            title: `Continue: ${unit.title}`,
            description: `You're currently on Step ${(lesson.currentStepIndex || 0) + 1} of the interactive walkthrough.`,
            actionUrl: `/courses/math/${unit.id}/lesson`,
            buttonText: 'Resume Lesson →',
            icon: '📖',
            progressPercent: Math.round((((lesson.currentStepIndex || 0) + 1) / 8) * 100),
          };
        }
      }
    }

    // Determine satisfied units
    mathFoundationsUnits.forEach((unit) => {
      const attempts = allWork.filter(
        (a) => a.unitId === unit.id || a.conceptId === unit.legacyConceptId || a.moduleId === unit.id
      );
      const independentCorrect = attempts.filter((a) => a.isCorrect && !a.assisted).length;
      const lesson = getLessonProgress(unit.unitPath);
      const isQuizPassed = rawProgress?.[unit.id]?.quizPassed || rawProgress?.[unit.unitPath]?.quizPassed;

      if (independentCorrect >= 3 || isQuizPassed || (unit.id === 'arithmetic' && attempts.length > 0)) {
        satisfiedSet.add(unit.id);
        if (unit.legacyConceptId) satisfiedSet.add(unit.legacyConceptId);
      }
    });

    // Find the current active/eligible unit
    for (const unit of mathFoundationsUnits) {
      const attempts = allWork.filter(
        (a) => a.unitId === unit.id || a.conceptId === unit.legacyConceptId || a.moduleId === unit.id
      );
      const independentCorrect = attempts.filter((a) => a.isCorrect && !a.assisted).length;
      const lesson = getLessonProgress(unit.unitPath);
      const isQuizPassed = rawProgress?.[unit.id]?.quizPassed || rawProgress?.[unit.unitPath]?.quizPassed;

      if (!isQuizPassed && !(lesson?.completed && independentCorrect >= 6)) {
        const prereqCheck = checkUnitPrerequisites(unit.id, satisfiedSet);
        if (prereqCheck.eligible) {
          // If unit has an uncompleted lesson, recommend starting the lesson
          if (unit.hasLesson && !lesson?.completed) {
            return {
              badge: 'Recommended Next Step',
              title: `Start Lesson: ${unit.title}`,
              description: unit.description,
              actionUrl: `/courses/math/${unit.id}/lesson`,
              buttonText: 'Start Lesson →',
              icon: '📖',
            };
          }

          // Otherwise recommend unit practice
          return {
            badge: attempts.length > 0 ? 'Continue Unit' : 'Up Next',
            title: `${attempts.length > 0 ? 'Practice' : 'Start'}: ${unit.title}`,
            description: attempts.length > 0
              ? `${independentCorrect} of 6 questions solved independently. Keep building fluency.`
              : unit.description,
            actionUrl: `/courses/math/${unit.id}/practice`,
            buttonText: attempts.length > 0 ? 'Continue Practice →' : 'Start Practice →',
            icon: '✏️',
          };
        }
      }
    }

    // Default cold start
    const unit1 = mathFoundationsUnits[0];
    return {
      badge: 'Welcome to MathFoundry',
      title: `Start Unit 1: ${unit1.title}`,
      description: unit1.description,
      actionUrl: `/courses/math/${unit1.id}`,
      buttonText: 'Start Unit 1 →',
      icon: '🧮',
    };
  }, [allWork]);

  return (
    <div className="study-page animate-fade-in max-w-3xl mx-auto py-8">
      {/* Header */}
      <header className="mb-8">
        <p className="eyebrow">Study Desk</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink)] mb-2">
          Ready to learn.
        </h1>
        <p className="study-intro text-base text-[var(--ink-2)]">
          Follow your focused step-by-step path toward engineering mathematics.
        </p>
      </header>

      {/* Primary Action Card (Brilliant / Minimalist Focus) */}
      <section className="study-card p-6 sm:p-8 rounded-2xl border border-[var(--line-strong)] bg-[var(--surface)] shadow-sm mb-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{primaryAction.icon}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-bold">
              {primaryAction.badge}
            </span>
          </div>
          {primaryAction.progressPercent !== undefined && (
            <span className="font-mono text-xs text-[var(--ink-3)] font-semibold">
              {primaryAction.progressPercent}% complete
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] mb-2 leading-snug">
          {primaryAction.title}
        </h2>
        <p className="text-sm sm:text-base text-[var(--ink-2)] leading-relaxed mb-6 max-w-xl">
          {primaryAction.description}
        </p>

        {primaryAction.progressPercent !== undefined && (
          <div
            className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface-2)] mb-6 border border-[var(--line)]"
            role="progressbar"
            aria-valuenow={primaryAction.progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${primaryAction.progressPercent}%`,
                backgroundColor: 'var(--accent)',
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            to={primaryAction.actionUrl}
            className="study-button inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
          >
            <span>{primaryAction.buttonText}</span>
          </Link>
          <Link
            to="/courses/math"
            className="study-button secondary px-4 py-3 rounded-xl font-semibold text-sm border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
          >
            Course Map
          </Link>
        </div>
      </section>

      {/* Short Review Queue (Max 3 Items) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <span>📋</span>
            <span>Review Priorities</span>
          </h3>
          {reviewQueue.length > 0 && (
            <Link
              to="/repair"
              className="text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Open Repair Desk →
            </Link>
          )}
        </div>

        {reviewQueue.length > 0 ? (
          <div className="space-y-2.5">
            {reviewQueue.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.priority === 'high'
                          ? 'bg-[var(--heat-soft)] text-[var(--heat)]'
                          : 'bg-[var(--surface-2)] text-[var(--ink-2)]'
                      }`}
                    >
                      {item.priority === 'high' ? 'Mistake to Repair' : 'Retention Check'}
                    </span>
                    <span className="text-xs font-bold text-[var(--ink)]">{item.title}</span>
                  </div>
                  <p className="text-xs text-[var(--ink-2)] m-0">{item.reason}</p>
                </div>

                <Link
                  to={item.actionUrl || '/repair'}
                  className="study-button secondary px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-2)]"
                >
                  {item.actionLabel || 'Repair →'}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-center text-xs text-[var(--ink-3)]">
            <span>✓ No urgent mistakes or delayed reviews due. Your foundation is clean.</span>
          </div>
        )}
      </section>
    </div>
  );
}
