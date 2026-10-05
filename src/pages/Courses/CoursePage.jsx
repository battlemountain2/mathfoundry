import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse } from '../../data/courses/courseCatalog';
import { mathFoundationsUnits, checkUnitPrerequisites, getMathUnit } from '../../data/courses/mathFoundations';
import { getAttemptsForUnit, getLessonProgress, getProgress } from '../../utils/storage';

export default function CoursePage() {
  const { courseId } = useParams();
  const course = getCourse(courseId) || getCourse('math');

  // Evaluate progress and satisfied prerequisites across all units
  const unitsStatus = useMemo(() => {
    const rawProgress = getProgress();
    const satisfiedSet = new Set();

    // First pass: identify satisfied units
    mathFoundationsUnits.forEach((unit) => {
      const attempts = getAttemptsForUnit('math', unit.id);
      const independentCorrect = attempts.filter((a) => a.isCorrect && !a.assisted).length;
      const lesson = getLessonProgress(unit.unitPath);
      const isQuizPassed = rawProgress?.[unit.id]?.quizPassed || rawProgress?.[unit.unitPath]?.quizPassed;

      // Unit is considered satisfied/ready if independently practiced (3+ correct) or quiz passed
      if (independentCorrect >= 3 || isQuizPassed || (unit.id === 'arithmetic' && attempts.length > 0)) {
        satisfiedSet.add(unit.id);
        if (unit.legacyConceptId) satisfiedSet.add(unit.legacyConceptId);
      }
    });

    // Second pass: evaluate each unit's lock state and current status
    return mathFoundationsUnits.map((unit) => {
      const prereqCheck = checkUnitPrerequisites(unit.id, satisfiedSet);
      const attempts = getAttemptsForUnit('math', unit.id);
      const independentCorrect = attempts.filter((a) => a.isCorrect && !a.assisted).length;
      const lesson = getLessonProgress(unit.unitPath);
      const isQuizPassed = rawProgress?.[unit.id]?.quizPassed || rawProgress?.[unit.unitPath]?.quizPassed;

      let status = 'not_started';
      if (isQuizPassed || (lesson?.completed && independentCorrect >= 6)) {
        status = 'completed';
      } else if (lesson?.completed || attempts.length > 0 || (lesson?.currentStepIndex > 0)) {
        status = 'in_progress';
      } else if (prereqCheck.eligible) {
        status = 'ready';
      } else {
        status = 'locked';
      }

      return {
        unit,
        prereqCheck,
        status,
        attemptsCount: attempts.length,
        independentCorrect,
        lesson,
        isQuizPassed,
      };
    });
  }, []);

  const completedCount = unitsStatus.filter((u) => u.status === 'completed').length;
  const inProgressCount = unitsStatus.filter((u) => u.status === 'in_progress').length;
  const totalUnits = unitsStatus.length;
  const progressPercent = Math.round(((completedCount + inProgressCount * 0.5) / totalUnits) * 100);

  return (
    <div className="study-page animate-fade-in max-w-4xl mx-auto py-6">
      {/* Course Header */}
      <div className="mb-6">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-3)] hover:text-[var(--accent)] mb-3 transition-colors"
        >
          <span>←</span>
          <span>All Courses</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{course.icon}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
                {course.title}
              </h1>
            </div>
            <p className="text-sm text-[var(--ink-2)] mt-1 max-w-2xl">
              {course.description}
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-[var(--ink-3)] uppercase tracking-wider block">
              Curriculum Progress
            </span>
            <span className="font-mono text-xl font-bold text-[var(--ink)]">
              {completedCount} <span className="text-sm text-[var(--ink-3)] font-normal">of {totalUnits} completed</span>
            </span>
          </div>
        </div>

        {/* Thin Progress Bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface-2)] mt-5 border border-[var(--line)]"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progressPercent}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Units List (Khan Academy Vertical Scroll) */}
      <div className="space-y-3 mt-6">
        {unitsStatus.map(({ unit, prereqCheck, status, attemptsCount, lesson }) => {
          const isLocked = prereqCheck.isLocked;
          const isCompleted = status === 'completed';
          const isInProgress = status === 'in_progress';

          return (
            <Link
              key={unit.id}
              to={`/courses/${courseId}/${unit.id}`}
              className={`study-card block p-5 sm:p-6 rounded-2xl border transition-all ${
                isLocked
                  ? 'border-[var(--line)] bg-[var(--ground)] opacity-75 hover:opacity-100 hover:border-[var(--line-strong)]'
                  : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Status Indicator Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-sm shrink-0 border ${
                      isCompleted
                        ? 'bg-[var(--good-soft)] border-[var(--good)] text-[var(--good)]'
                        : isInProgress
                          ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]'
                          : isLocked
                            ? 'bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-3)]'
                            : 'bg-[var(--surface)] border-[var(--line-strong)] text-[var(--ink)]'
                    }`}
                  >
                    {isCompleted ? '✓' : isInProgress ? '⏳' : isLocked ? '🔒' : unit.order}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs uppercase text-[var(--ink-3)]">
                        Unit {unit.order}
                      </span>
                      {isCompleted && (
                        <span className="study-badge text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--good-soft)] text-[var(--good)]">
                          Completed
                        </span>
                      )}
                      {isInProgress && (
                        <span className="study-badge text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)]">
                          In Progress
                        </span>
                      )}
                      {isLocked && (
                        <span className="study-badge text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink-3)]">
                          Locked · Preview Available
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-[var(--ink)] leading-snug">
                      {unit.title}
                    </h2>
                    <p className="text-sm text-[var(--ink-2)] mt-1 leading-relaxed">
                      {unit.description}
                    </p>

                    {/* Prerequisite Note for Locked Units */}
                    {isLocked && prereqCheck.missingPrerequisites.length > 0 && (
                      <p className="text-xs text-[var(--ink-3)] mt-2 font-mono">
                        Requires:{' '}
                        {prereqCheck.missingPrerequisites
                          .map((pId) => getMathUnit(pId)?.title || pId)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right badges & action */}
                <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--ink-3)] font-mono">
                    {unit.hasLesson && (
                      <span className={`px-2 py-0.5 rounded ${lesson?.completed ? 'bg-[var(--good-soft)] text-[var(--good)]' : 'bg-[var(--surface-2)]'}`}>
                        Lesson {lesson?.completed ? '✓' : ''}
                      </span>
                    )}
                    {unit.hasLab && (
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-2)]">
                        Lab
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-[var(--surface-2)]">
                      {attemptsCount > 0 ? `${attemptsCount} solved` : 'Practice'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--accent)] mt-1">
                    {isInProgress ? 'Continue →' : isLocked ? 'Preview →' : 'Start →'}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
