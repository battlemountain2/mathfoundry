import React from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../../data/courses/courseCatalog';

export default function CourseCatalog() {
  const courses = getCourses();

  return (
    <div className="study-page animate-fade-in max-w-5xl mx-auto py-6">
      <header className="mb-8">
        <p className="eyebrow">Structured Curriculum</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink)] mb-3">
          Courses
        </h1>
        <p className="study-intro text-lg text-[var(--ink-2)] max-w-2xl">
          Build deep intuition through interactive lessons, visual labs, and independent paper-first practice.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const isActive = course.status === 'active';

          return (
            <div
              key={course.id}
              className={`study-card flex flex-col justify-between p-6 sm:p-8 rounded-2xl border transition-all ${
                isActive
                  ? 'border-[var(--line-strong)] hover:border-[var(--accent)] shadow-sm'
                  : 'border-[var(--line)] opacity-85'
              } bg-[var(--surface)]`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2.5 rounded-xl bg-[var(--surface-2)] inline-block">
                    {course.icon}
                  </span>
                  <span
                    className={`study-badge px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-[var(--surface-2)] text-[var(--ink-3)]'
                    }`}
                  >
                    {course.badge}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-[var(--ink)] mb-2">
                  {course.title}
                </h2>
                <p className="text-sm font-medium text-[var(--ink-3)] mb-3">
                  {course.subtitle}
                </p>
                <p className="text-sm text-[var(--ink-2)] leading-relaxed mb-6">
                  {course.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--ink-3)]">
                  ~{course.estimatedHours} hrs study
                </span>

                {isActive ? (
                  <Link
                    to={course.path}
                    className="study-button inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
                  >
                    <span>Open Course</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-[var(--ink-3)] px-3 py-1.5 rounded-lg bg-[var(--surface-2)]">
                    Unlocks with Math
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
