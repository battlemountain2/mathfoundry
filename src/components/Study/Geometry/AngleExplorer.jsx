import React, { useState } from 'react';

/**
 * AngleExplorer.jsx
 *
 * Interactive Transversal & Parallel Lines Visualizer for Unit 1: Angles & Lines.
 * Demonstrates how a transversal slicing two parallel lines generates 8 angles,
 * all governed by just two complementary/supplementary measures: θ and (180° - θ).
 */
export default function AngleExplorer({
  initialAngle = 65,
  embedded = false,
  onAngleChange = null,
}) {
  const [angle, setAngle] = useState(initialAngle);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'vertical', 'corresponding', 'alternate-interior', 'consecutive-interior'

  const acute = Math.min(angle, 180 - angle);
  const obtuse = 180 - acute;

  const handleAngleChange = (newVal) => {
    const clamped = Math.max(25, Math.min(155, newVal));
    setAngle(clamped);
    if (onAngleChange) onAngleChange(clamped);
  };

  // SVG Geometry constants
  const svgWidth = 500;
  const svgHeight = 260;
  const y1 = 80; // Line 1
  const y2 = 180; // Line 2
  const centerX = svgWidth / 2;

  // Transversal slope and endpoints based on angle
  // angle in degrees: 90 is vertical, <90 tilts right, >90 tilts left
  const rad = (angle * Math.PI) / 180;
  const dx = 100 / Math.tan(rad);
  const xTop = centerX + dx;
  const xBottom = centerX - dx;

  // Intersections
  const int1 = { x: centerX + (dx * (130 - y1)) / 100, y: y1 };
  const int2 = { x: centerX + (dx * (130 - y2)) / 100, y: y2 };

  // Angle definitions:
  // Around Intersection 1 (top):
  // 1: Top-Right (acute if angle < 90, obtuse if angle > 90) -> measure is 180-angle or angle
  // Let angle θ be the acute angle made with the horizontal positive x-axis.
  // Standard labeling:
  // Angle 1: top-left (180 - angle)
  // Angle 2: top-right (angle)
  // Angle 3: bottom-left (angle)
  // Angle 4: bottom-right (180 - angle)
  // Around Intersection 2 (bottom):
  // Angle 5: top-left (180 - angle)
  // Angle 6: top-right (angle)
  // Angle 7: bottom-left (angle)
  // Angle 8: bottom-right (180 - angle)

  const isHighlighted = (angleId) => {
    switch (activeFilter) {
      case 'vertical':
        return [1, 4, 5, 8].includes(angleId) || [2, 3, 6, 7].includes(angleId);
      case 'alternate-interior':
        return [3, 6].includes(angleId) || [4, 5].includes(angleId);
      case 'corresponding':
        return [1, 5, 2, 6, 3, 7, 4, 8].includes(angleId);
      case 'consecutive-interior':
        return [3, 5].includes(angleId) || [4, 6].includes(angleId);
      default:
        return true;
    }
  };

  const getAngleColor = (angleId) => {
    const isAcute = [2, 3, 6, 7].includes(angleId);
    if (activeFilter === 'consecutive-interior' && [3, 5, 4, 6].includes(angleId)) {
      return angleId === 3 || angleId === 5 ? 'var(--heat)' : 'var(--accent)';
    }
    if (activeFilter === 'alternate-interior' && [3, 6].includes(angleId)) {
      return 'var(--good)';
    }
    if (activeFilter === 'alternate-interior' && [4, 5].includes(angleId)) {
      return 'var(--accent)';
    }
    if (activeFilter === 'corresponding') {
      if ([1, 5].includes(angleId)) return 'var(--accent)';
      if ([2, 6].includes(angleId)) return 'var(--good)';
      if ([3, 7].includes(angleId)) return 'var(--good)';
      if ([4, 8].includes(angleId)) return 'var(--accent)';
    }
    if (activeFilter === 'vertical') {
      return isAcute ? 'var(--good)' : 'var(--accent)';
    }
    return isAcute ? 'var(--good)' : 'var(--accent)';
  };

  return (
    <div
      className={`angle-explorer rounded-2xl border border-[var(--line)] bg-[var(--surface)] ${
        embedded ? 'p-4' : 'p-6'
      } space-y-5`}
      data-testid="angle-explorer"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase text-[var(--accent)] font-semibold tracking-wider">
            Interactive Visual Model
          </span>
          <h3 className="text-lg font-bold text-[var(--ink)]">
            Transversal & Parallel Line Angle Explorer
          </h3>
        </div>

        {/* Live angle badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-[var(--good-soft)] border border-[var(--good)] text-xs font-mono font-bold text-[var(--good)]">
            Acute: {acute}°
          </div>
          <div className="px-3 py-1 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)] text-xs font-mono font-bold text-[var(--accent)]">
            Obtuse: {obtuse}°
          </div>
        </div>
      </div>

      {/* Relationship Mode Filter Buttons */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
        {[
          { id: 'all', label: 'All 8 Angles' },
          { id: 'vertical', label: 'Vertical (Opposite)' },
          { id: 'alternate-interior', label: 'Alternate Interior (Z-Pattern)' },
          { id: 'corresponding', label: 'Corresponding (F-Pattern)' },
          { id: 'consecutive-interior', label: 'Consecutive Interior (180° Sum)' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === f.id
                ? 'bg-[var(--accent)] text-[var(--surface)] shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Interactive SVG Diagram */}
      <div className="relative border border-[var(--line)] rounded-xl bg-[var(--ground)] p-2 overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-lg h-auto select-none"
          style={{ maxHeight: '280px' }}
        >
          {/* Parallel Line 1 */}
          <line
            x1="20"
            y1={y1}
            x2={svgWidth - 20}
            y2={y1}
            stroke="var(--ink-2)"
            strokeWidth="2.5"
            strokeDasharray="none"
          />
          <text
            x="30"
            y={y1 - 10}
            fill="var(--ink-3)"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Line L₁ (Parallel)
          </text>
          {/* Parallel arrows */}
          <polygon
            points={`${centerX - 80},${y1 - 4} ${centerX - 70},${y1} ${centerX - 80},${y1 + 4}`}
            fill="var(--ink-3)"
          />

          {/* Parallel Line 2 */}
          <line
            x1="20"
            y1={y2}
            x2={svgWidth - 20}
            y2={y2}
            stroke="var(--ink-2)"
            strokeWidth="2.5"
          />
          <text
            x="30"
            y={y2 - 10}
            fill="var(--ink-3)"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Line L₂ (Parallel)
          </text>
          {/* Parallel arrows */}
          <polygon
            points={`${centerX - 80},${y2 - 4} ${centerX - 70},${y2} ${centerX - 80},${y2 + 4}`}
            fill="var(--ink-3)"
          />

          {/* Transversal Line */}
          <line
            x1={xTop}
            y1="25"
            x2={xBottom}
            y2={svgHeight - 25}
            stroke="var(--accent)"
            strokeWidth="3"
          />
          <text
            x={xTop + 10}
            y="35"
            fill="var(--accent)"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Transversal T
          </text>

          {/* Angle Arcs & Labels for Intersection 1 */}
          {/* Angle 1 (Top-Left) */}
          <circle
            cx={int1.x}
            cy={int1.y}
            r="26"
            fill="none"
            stroke={getAngleColor(1)}
            strokeWidth={isHighlighted(1) ? '3.5' : '1'}
            opacity={isHighlighted(1) ? 1 : 0.25}
          />
          <text
            x={int1.x - 42}
            y={int1.y - 14}
            fill={getAngleColor(1)}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ∠1: {obtuse}°
          </text>

          {/* Angle 2 (Top-Right) */}
          <text
            x={int1.x + 22}
            y={int1.y - 14}
            fill={getAngleColor(2)}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ∠2: {acute}°
          </text>

          {/* Angle 3 (Bottom-Left) */}
          <text
            x={int1.x - 42}
            y={int1.y + 26}
            fill={getAngleColor(3)}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ∠3: {acute}°
          </text>

          {/* Angle 4 (Bottom-Right) */}
          <text
            x={int1.x + 22}
            y={int1.y + 26}
            fill={getAngleColor(4)}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ∠4: {obtuse}°
          </text>

          {/* Angle Arcs & Labels for Intersection 2 */}
          {/* Angle 5 (Top-Left) */}
          <circle
            cx={int2.x}
            cy={int2.y}
            r="26"
            fill="none"
            stroke={getAngleColor(5)}
            strokeWidth={isHighlighted(5) ? '3.5' : '1'}
            opacity={isHighlighted(5) ? 1 : 0.25}
          />
          <text
            x={int2.x - 42}
            y={int2.y - 14}
            fill={getAngleColor(5)}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ∠5: {obtuse}°
          </text>

          {/* Angle 6 (Top-Right) */}
          <text
            x={int2.x + 22}
            y={int2.y - 14}
            fill={getAngleColor(6)}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ∠6: {acute}°
          </text>

          {/* Angle 7 (Bottom-Left) */}
          <text
            x={int2.x - 42}
            y={int2.y + 26}
            fill={getAngleColor(7)}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ∠7: {acute}°
          </text>

          {/* Angle 8 (Bottom-Right) */}
          <text
            x={int2.x + 22}
            y={int2.y + 26}
            fill={getAngleColor(8)}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ∠8: {obtuse}°
          </text>
        </svg>
      </div>

      {/* Angle Slider Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--ink-2)]">
          <label htmlFor="angle-slider" className="font-semibold">
            Adjust Transversal Angle (θ): <span className="text-[var(--accent)] font-mono font-bold">{angle}°</span>
          </label>
          <span className="font-mono text-[var(--ink-3)]">Range: 25° – 155°</span>
        </div>
        <input
          id="angle-slider"
          type="range"
          min="25"
          max="155"
          value={angle}
          onChange={(e) => handleAngleChange(Number(e.target.value))}
          className="w-full accent-[var(--accent)] cursor-pointer"
          aria-label="Transversal angle slider"
        />

        {/* Quick Angle Presets */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[var(--ink-3)] font-mono mr-1">Presets:</span>
          {[30, 45, 60, 75, 90, 120].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleAngleChange(p)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border border-[var(--line)] transition-colors ${
                angle === p
                  ? 'bg-[var(--accent)] text-[var(--surface)]'
                  : 'bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--line)]'
              }`}
            >
              {p}°
            </button>
          ))}
        </div>
      </div>

      {/* Explanatory Context Note for the Active Relationship Mode */}
      <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] leading-relaxed">
        {activeFilter === 'all' && (
          <p>
            💡 <strong className="font-bold">The Big Secret of Transversals:</strong> No matter how you tilt the line, there are only <span className="font-bold text-[var(--good)]">two unique angle measures</span> across all eight corners: acute ({acute}°) and obtuse ({obtuse}°). Together, any acute plus any obtuse equals exactly <strong className="font-bold">180°</strong>.
          </p>
        )}
        {activeFilter === 'vertical' && (
          <p>
            📐 <strong className="font-bold">Vertical Angles:</strong> Formed directly opposite each other across the X-crossing (e.g. ∠1 = ∠4 = {obtuse}°, ∠2 = ∠3 = {acute}°). They are always <span className="font-bold text-[var(--good)]">strictly congruent (equal)</span>.
          </p>
        )}
        {activeFilter === 'alternate-interior' && (
          <p>
            ⚡ <strong className="font-bold">Alternate Interior (The "Z" Rule):</strong> Angles sitting inside the parallel tracks on opposite sides of the transversal (∠3 & ∠6 = {acute}°, ∠4 & ∠5 = {obtuse}°). They are <span className="font-bold text-[var(--good)]">strictly equal</span>. Essential for structural truss calculations!
          </p>
        )}
        {activeFilter === 'corresponding' && (
          <p>
            🎯 <strong className="font-bold">Corresponding Angles (The "F" Rule):</strong> Angles in the same relative position at both intersections (e.g. top-left ∠1 matches top-left ∠5 = {obtuse}°). They are <span className="font-bold text-[var(--good)]">strictly equal</span> because parallel lines preserve orientation.
          </p>
        )}
        {activeFilter === 'consecutive-interior' && (
          <p>
            ⚖️ <strong className="font-bold">Consecutive Interior Angles:</strong> Angles inside the parallel lines on the same side of the transversal (∠3 + ∠5 = {acute}° + {obtuse}° = <span className="font-bold text-[var(--heat)]">180°</span>). They are <span className="font-bold text-[var(--heat)]">supplementary</span>.
          </p>
        )}
      </div>
    </div>
  );
}
