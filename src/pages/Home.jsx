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

  // Compute current active unit, milestones, and dynamic lede (Daymark pattern)
  const dashboardState = useMemo(() => {
    const rawProgress = getProgress();
    const satisfiedSet = new Set();

    // 1. Check for in-progress lesson first
    for (const unit of mathFoundationsUnits) {
      if (unit.hasLesson) {
        const lesson = getLessonProgress(unit.unitPath);
        if (lesson && !lesson.completed && (lesson.currentStepIndex > 0 || Object.keys(lesson.microCheckAnswers || {}).length > 0)) {
          const stepNum = (lesson.currentStepIndex || 0) + 1;
          return {
            unit,
            kicker: `Math Foundations · Unit ${unit.order}`,
            lede: `CONTINUE ${unit.title.toUpperCase()}`,
            subline: `You are on Step ${stepNum} of 8. Interactive walkthrough in progress.`,
            actionUrl: `/courses/math/${unit.id}/lesson`,
            buttonText: 'Resume Lesson →',
            milestones: {
              lesson: { status: 'in_progress', label: `Step ${stepNum}/8` },
              practice: { status: 'pending', label: 'Up Next' },
              quiz: { status: 'locked', label: 'Locked' },
            },
            progressPercent: Math.round((stepNum / 8) * 100),
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

    // 2. Identify the active unit and its 3-stage milestone
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
          const lessonDone = Boolean(lesson?.completed);
          const practiceDone = independentCorrect >= 5;

          // Milestone 1: Lesson
          if (unit.hasLesson && !lessonDone) {
            return {
              unit,
              kicker: `Math Foundations · Unit ${unit.order}`,
              lede: `START ${unit.title.toUpperCase()}`,
              subline: `Step 1 of 3: Begin with the interactive walkthrough before jumping into practice.`,
              actionUrl: `/courses/math/${unit.id}/lesson`,
              buttonText: 'Start Lesson →',
              milestones: {
                lesson: { status: 'current', label: 'Start Now' },
                practice: { status: 'pending', label: '6 Problems' },
                quiz: { status: 'locked', label: 'Unit Quiz' },
              },
            };
          }

          // Milestone 2: Practice
          if (!practiceDone) {
            return {
              unit,
              kicker: `Math Foundations · Unit ${unit.order}`,
              lede: attempts.length > 0 ? `PRACTICE ${unit.title.toUpperCase()}` : `START ${unit.title.toUpperCase()}`,
              subline: attempts.length > 0
                ? `Step 2 of 3: ${independentCorrect} of 5 independent solves recorded. Build fluency.`
                : `Step 2 of 3: Begin paper-first independent practice.`,
              actionUrl: `/courses/math/${unit.id}/practice`,
              buttonText: attempts.length > 0 ? 'Continue Practice →' : 'Start Practice →',
              milestones: {
                lesson: { status: 'completed', label: 'Done ✓' },
                practice: { status: 'current', label: `${independentCorrect}/5 Solved` },
                quiz: { status: 'pending', label: 'Unit Quiz' },
              },
            };
          }

          // Milestone 3: Quiz
          return {
            unit,
            kicker: `Math Foundations · Unit ${unit.order}`,
            lede: `TAKE ${unit.title.toUpperCase()} QUIZ`,
            subline: `Step 3 of 3: Confirm mastery to unlock downstream curriculum topics.`,
            actionUrl: `/courses/math/${unit.id}/quiz`,
            buttonText: 'Take Unit Quiz →',
            milestones: {
              lesson: { status: 'completed', label: 'Done ✓' },
              practice: { status: 'completed', label: 'Solid ✓' },
              quiz: { status: 'current', label: 'Take Quiz' },
            },
          };
        }
      }
    }

    // Default cold start
    const unit1 = mathFoundationsUnits[0];
    return {
      unit: unit1,
      kicker: 'Math Foundations · Welcome',
      lede: 'START ARITHMETIC',
      subline: 'Step 1 of 3: Build your numerical intuition with arithmetic operations.',
      actionUrl: `/courses/math/${unit1.id}/practice`,
      buttonText: 'Start Practice →',
      milestones: {
        lesson: { status: 'completed', label: 'Overview' },
        practice: { status: 'current', label: '0/5 Solved' },
        quiz: { status: 'pending', label: 'Unit Quiz' },
      },
    };
  }, [allWork]);

  return (
    <div className="study-page animate-fade-in max-w-3xl mx-auto py-8">
      {/* Daymark Dynamic Lede Section */}
      <section className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-3)] font-bold mb-2">
          {dashboardState.kicker}
        </p>

        <h1 className="font-mono text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[var(--ink)] leading-none my-3">
          {dashboardState.lede}
        </h1>

        <p className="text-base sm:text-lg text-[var(--ink-2)] leading-relaxed max-w-xl mb-6">
          {dashboardState.subline}
        </p>

        {/* 3-Stage Milestone Progress Bar */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)] mb-3 uppercase tracking-wider font-semibold">
            <span>Unit Progression</span>
            <span>{dashboardState.unit.title}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Stage 1: Lesson */}
            <div
              className={`p-2.5 rounded-xl border text-xs font-semibold ${
                dashboardState.milestones.lesson.status === 'completed'
                  ? 'border-[var(--good)] bg-[var(--good-soft)] text-[var(--good)]'
                  : dashboardState.milestones.lesson.status === 'in_progress' || dashboardState.milestones.lesson.status === 'current'
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]'
              }`}
            >
              <span className="block text-[10px] font-mono uppercase text-[var(--ink-3)]">1. Lesson</span>
              <span>{dashboardState.milestones.lesson.label}</span>
            </div>

            {/* Stage 2: Practice */}
            <div
              className={`p-2.5 rounded-xl border text-xs font-semibold ${
                dashboardState.milestones.practice.status === 'completed'
                  ? 'border-[var(--good)] bg-[var(--good-soft)] text-[var(--good)]'
                  : dashboardState.milestones.practice.status === 'current'
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]'
              }`}
            >
              <span className="block text-[10px] font-mono uppercase text-[var(--ink-3)]">2. Practice</span>
              <span>{dashboardState.milestones.practice.label}</span>
            </div>

            {/* Stage 3: Quiz */}
            <div
              className={`p-2.5 rounded-xl border text-xs font-semibold ${
                dashboardState.milestones.quiz.status === 'completed'
                  ? 'border-[var(--good)] bg-[var(--good-soft)] text-[var(--good)]'
                  : dashboardState.milestones.quiz.status === 'current'
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]'
              }`}
            >
              <span className="block text-[10px] font-mono uppercase text-[var(--ink-3)]">3. Quiz</span>
              <span>{dashboardState.milestones.quiz.label}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <Link
            to={dashboardState.actionUrl}
            className="study-button inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-xs"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
          >
            <span>{dashboardState.buttonText}</span>
          </Link>
          <Link
            to="/courses/math"
            className="study-button secondary px-5 py-3.5 rounded-xl font-semibold text-sm border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
          >
            Course Map
          </Link>
        </div>
      </section>

      {/* Chrome-Free Section 1: Review Queue (Daymark Heading + Rule Pattern) */}
      <section className="mb-10">
        <div className="mb-4 pb-2 border-b-2 border-[var(--ink)] flex items-center justify-between">
          <h2 className="font-mono text-sm sm:text-base uppercase tracking-wider font-bold text-[var(--ink)]">
            Review Priorities
          </h2>
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
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-center text-xs text-[var(--ink-3)] font-mono">
            <span>✓ No pending mistakes or delayed reviews. Foundations clean.</span>
          </div>
        )}
      </section>

      {/* Chrome-Free Section 2: Active Courses */}
      <section>
        <div className="mb-4 pb-2 border-b-2 border-[var(--ink)] flex items-center justify-between">
          <h2 className="font-mono text-sm sm:text-base uppercase tracking-wider font-bold text-[var(--ink)]">
            Curriculum Paths
          </h2>
          <Link
            to="/courses"
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            All Courses →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <Link
            to="/courses/math"
            className="p-4 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all flex items-center justify-between"
          >
            <div>
              <span className="font-bold text-sm text-[var(--ink)] block">🧮 Math Foundations</span>
              <span className="text-[var(--ink-3)]">12 Units · Active</span>
            </div>
            <span className="text-[var(--accent)] font-bold">Open →</span>
          </Link>

          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] opacity-75 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-[var(--ink-2)] block">⚡ Physics</span>
              <span className="text-[var(--ink-3)]">Unlocks with Math</span>
            </div>
            <span className="text-[var(--ink-3)]">Upcoming</span>
          </div>
        </div>
      </section>
    </div>
  );
}
