import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse } from '../../data/courses/courseCatalog';
import { getMathUnit, checkUnitPrerequisites } from '../../data/courses/mathFoundations';
import { getAttemptsForUnit, getLessonProgress, getProgress } from '../../utils/storage';
import VideoDrawer from '../../components/Study/VideoDrawer';

export default function UnitPage() {
  const { courseId, unitId } = useParams();
  const course = getCourse(courseId) || getCourse('math');
  const unit = getMathUnit(unitId);

  const { lessonProgress, attempts, missedAttempts, independentCount, isQuizPassed, prereqCheck } = useMemo(() => {
    if (!unit) {
      return {
        lessonProgress: null,
        attempts: [],
        missedAttempts: [],
        independentCount: 0,
        isQuizPassed: false,
        prereqCheck: { isLocked: false, missingPrerequisites: [] },
      };
    }

    const lesson = getLessonProgress(unit.unitPath);
    const unitAttempts = getAttemptsForUnit(courseId || 'math', unit.id);
    const missed = unitAttempts.filter((a) => !a.isCorrect);
    const independent = unitAttempts.filter((a) => a.isCorrect && !a.assisted).length;
    const progress = getProgress();
    const quizPassed = Boolean(progress?.[unit.id]?.quizPassed || progress?.[unit.unitPath]?.quizPassed);

    // Prereq check
    const check = checkUnitPrerequisites(unit.id);

    return {
      lessonProgress: lesson,
      attempts: unitAttempts,
      missedAttempts: missed,
      independentCount: independent,
      isQuizPassed: quizPassed,
      prereqCheck: check,
    };
  }, [courseId, unitId, unit]);

  if (!unit) {
    return (
      <div className="study-page py-12 text-center">
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-4">Unit not found</h1>
        <Link to={`/courses/${courseId || 'math'}`} className="study-button">
          ← Back to Course
        </Link>
      </div>
    );
  }

  return (
    <div className="study-page animate-fade-in max-w-3xl mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-[var(--ink-3)]">
        <Link to="/courses" className="hover:text-[var(--ink)] transition-colors">
          Courses
        </Link>
        <span>/</span>
        <Link to={`/courses/${course.id}`} className="hover:text-[var(--ink)] transition-colors">
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-[var(--ink)]">{unit.title}</span>
      </nav>

      {/* Unit Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl p-2 rounded-xl bg-[var(--surface-2)] inline-block">
            {unit.icon}
          </span>
          <div>
            <span className="font-mono text-xs uppercase text-[var(--ink-3)] font-semibold">
              Unit {unit.order}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
              {unit.title}
            </h1>
          </div>
        </div>
        <p className="text-base text-[var(--ink-2)] mt-2 leading-relaxed">
          {unit.description}
        </p>

        {prereqCheck.isLocked && prereqCheck.missingPrerequisites.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl border border-[var(--heat)] bg-[var(--heat-soft)] text-xs text-[var(--ink)]">
            <span className="font-bold">Prerequisite Notice:</span> We recommend completing{' '}
            {prereqCheck.missingPrerequisites.map((p) => getMathUnit(p)?.title || p).join(', ')}{' '}
            before attempting this unit independently.
          </div>
        )}
      </header>

      {/* Stacked Unit Sections (Khan Academy Style) */}
      <div className="space-y-4">
        {/* Section 1: Guided Lesson */}
        <div className="study-card p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📖</span>
                <h2 className="text-lg font-bold text-[var(--ink)]">Interactive Lesson</h2>
                {lessonProgress?.completed ? (
                  <span className="study-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--good-soft)] text-[var(--good)]">
                    ✓ Completed
                  </span>
                ) : lessonProgress?.currentStepIndex > 0 ? (
                  <span className="study-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)]">
                    ⏳ In Progress
                  </span>
                ) : (
                  <span className="study-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink-3)]">
                    Not Started
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--ink-2)]">
                {unit.hasLesson
                  ? 'Step-by-step interactive walkthrough with visual models and micro-checks.'
                  : 'Conceptual introduction and core procedure rules.'}
              </p>
            </div>

            <div className="shrink-0">
              {unit.hasLesson ? (
                <Link
                  to={`/courses/${course.id}/${unit.id}/lesson`}
                  className="study-button inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-transform active:scale-95"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
                >
                  {lessonProgress?.completed
                    ? 'Review Lesson'
                    : lessonProgress?.currentStepIndex > 0
                      ? 'Resume Lesson →'
                      : 'Start Lesson →'}
                </Link>
              ) : (
                <span className="text-xs font-mono text-[var(--ink-3)] px-3 py-1.5 rounded-lg bg-[var(--surface-2)]">
                  Practice Ready
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Lab (if unit has lab) */}
        {unit.hasLab && (
          <div className="study-card p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🔬</span>
                  <h2 className="text-lg font-bold text-[var(--ink)]">
                    {unit.labType === 'number-line' ? 'Number Line Lab' : 'Fraction Bar Lab'}
                  </h2>
                  <span className="study-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)]">
                    Interactive Lab
                  </span>
                </div>
                <p className="text-sm text-[var(--ink-2)]">
                  {unit.labType === 'number-line'
                    ? 'Explore magnitude, signed numbers, and fractional tick snapping on an interactive axis.'
                    : 'Repartition wholes and combine fractional pieces visually.'}
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  to={`/courses/${course.id}/${unit.id}/lab`}
                  className="study-button secondary px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors inline-block"
                >
                  Open Lab →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Practice */}
        <div className="study-card p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">✏️</span>
                <h2 className="text-lg font-bold text-[var(--ink)]">Independent Practice</h2>
                {independentCount >= 6 ? (
                  <span className="study-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--good-soft)] text-[var(--good)]">
                    Solid ({independentCount} solved)
                  </span>
                ) : (
                  <span className="study-badge text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink-3)]">
                    {attempts.length} attempts · {independentCount} independent
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--ink-2)]">
                Paper-first problem solving with targeted hints and solution walkthroughs.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to={`/courses/${course.id}/${unit.id}/practice`}
                className="study-button inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-transform active:scale-95"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
              >
                {attempts.length > 0 ? 'Continue Practice →' : 'Start Practice →'}
              </Link>
            </div>
          </div>
        </div>

        {/* Section 4: Unit Review & Mistakes */}
        <div className="study-card p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📋</span>
                <h2 className="text-lg font-bold text-[var(--ink)]">Unit Review</h2>
                {missedAttempts.length > 0 ? (
                  <span className="study-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--heat-soft)] text-[var(--heat)]">
                    {missedAttempts.length} Missed
                  </span>
                ) : (
                  <span className="study-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--good-soft)] text-[var(--good)]">
                    No Misses
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--ink-2)]">
                {missedAttempts.length > 0
                  ? `You have ${missedAttempts.length} questions recorded with mistakes in this unit.`
                  : 'All recorded practice in this unit has been verified or repaired.'}
              </p>
            </div>

            <div className="shrink-0">
              {missedAttempts.length > 0 ? (
                <Link
                  to={`/repair`}
                  className="study-button secondary px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--heat)] text-[var(--heat)] hover:bg-[var(--heat-soft)] transition-colors inline-block"
                >
                  Repair Mistakes →
                </Link>
              ) : (
                <Link
                  to={`/review`}
                  className="study-button secondary px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--surface-2)] transition-colors inline-block"
                >
                  View History
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Unit Quiz */}
        <div className="study-card p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📝</span>
                <h2 className="text-lg font-bold text-[var(--ink)]">Unit Quiz</h2>
                {isQuizPassed ? (
                  <span className="study-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--good-soft)] text-[var(--good)]">
                    ✓ Passed
                  </span>
                ) : (
                  <span className="study-badge text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink-3)]">
                    3–5 questions
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--ink-2)]">
                Low-pressure checkpoint confirming comprehension before unlocking subsequent topics.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to={`/courses/${course.id}/${unit.id}/quiz`}
                className="study-button inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-transform active:scale-95"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
              >
                {isQuizPassed ? 'Retake Quiz' : 'Take Quiz →'}
              </Link>
            </div>
          </div>
        </div>

        {/* Section 6: See It in Action (Engineering & Real-World Connections) */}
        <div className="study-card p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔧</span>
            <h2 className="text-base font-bold text-[var(--ink)]">See It in Action</h2>
          </div>
          <p className="text-xs text-[var(--ink-2)] leading-relaxed mb-3">
            Real engineering and applied problems that rely directly on this unit:
          </p>
          <ul className="space-y-2 text-xs text-[var(--ink-2)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] font-bold">•</span>
              <span>
                <strong>Scale Drawings & Blueprints:</strong> Converting fractional meter dimensions on architectural schematics into physical measurements.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] font-bold">•</span>
              <span>
                <strong>Material Stock Cutting:</strong> Calculating leftover kerf and stock lengths when subdividing materials into unequal portions.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Floating Video Reference Drawer */}
      <VideoDrawer unitId={unit?.id} />
    </div>
  );
}
