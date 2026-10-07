import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse } from '../../data/courses/courseCatalog';
import { getMathUnit } from '../../data/courses/mathFoundations';
import { getGeometryUnit } from '../../data/courses/geometryFoundations';
import NumberLineLab from '../../components/Study/NumberLineLab';
import FractionBarVisualizer from '../../components/Study/FractionBarVisualizer';
import AngleExplorer from '../../components/Study/Geometry/AngleExplorer';
import PythagoreanVisualizer from '../../components/Study/Geometry/PythagoreanVisualizer';

export default function UnitLab() {
  const { courseId, unitId } = useParams();
  const course = getCourse(courseId) || getCourse('math');
  const unit = courseId === 'geometry' ? getGeometryUnit(unitId) : getMathUnit(unitId);

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

  const labTitle =
    unit.labType === 'number-line'
      ? 'Number Line Lab'
      : unit.labType === 'angle-explorer'
        ? 'Angle & Transversal Lab'
        : unit.labType === 'pythagoras'
          ? 'Pythagorean Proof Lab'
          : 'Fraction Bar Lab';

  const labDescription =
    unit.labType === 'number-line'
      ? 'Experiment with positioning signed values, zooming subdivisions, and snapping across the continuous number line.'
      : unit.labType === 'angle-explorer'
        ? 'Experiment with tilting transversals across parallel lines and observe how angle pairs conserve equality.'
        : unit.labType === 'pythagoras'
          ? 'Adjust right triangle legs, inspect square tile grids, and verify spatial area conservation (a² + b² = c²).'
          : 'Manipulate fractional partitions to build equal-sized pieces before combining wholes.';

  return (
    <div className="study-page animate-fade-in max-w-4xl mx-auto py-6">
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
        <Link to={`/courses/${course.id}/${unit.id}`} className="hover:text-[var(--ink)] transition-colors">
          {unit.title}
        </Link>
        <span>/</span>
        <span className="text-[var(--ink)]">Interactive Lab</span>
      </nav>

      <header className="mb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🔬</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
            {labTitle}
          </h1>
        </div>
        <p className="text-sm text-[var(--ink-2)] mt-1">
          {labDescription}
        </p>
      </header>

      {/* Lab Renderer */}
      <div className="mt-6">
        {unit.labType === 'number-line' ? (
          <NumberLineLab
            range={[-2, 2]}
            subdivisions={4}
            targetValue={-0.75}
            prompt="Place -3/4 on the number line. Use the arrow keys or drag the point."
            embedded={false}
          />
        ) : unit.labType === 'angle-explorer' ? (
          <AngleExplorer embedded={false} />
        ) : unit.labType === 'pythagoras' ? (
          <PythagoreanVisualizer embedded={false} />
        ) : (
          <FractionBarVisualizer />
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--line)] flex justify-between items-center">
        <Link
          to={`/courses/${course.id}/${unit.id}`}
          className="study-button secondary px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--line)] text-[var(--ink)]"
        >
          ← Return to {unit.title}
        </Link>
        <Link
          to={`/courses/${course.id}/${unit.id}/practice`}
          className="study-button px-5 py-2 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
        >
          Start Practice →
        </Link>
      </div>
    </div>
  );
}
