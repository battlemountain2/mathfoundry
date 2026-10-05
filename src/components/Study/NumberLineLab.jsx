/**
 * src/components/Study/NumberLineLab.jsx
 *
 * Interactive Number Line Lab visualizer for MathFoundry v2 Milestone 2.
 * Supports configurable range, subdivision zooming, pointer dragging with capture,
 * keyboard navigation with event isolation, predict-then-verify challenges,
 * signed numbers and fractions, and 3-theme token compliance.
 */

import React, { useState, useRef, useCallback, useId } from 'react';
import {
  calculateNumberLineTicks,
  clampValue,
  snapToTick,
  verifyNumberLinePlacement,
  calculateKeyboardStep,
  handleKeyboardNavigation,
  calculateZoom,
  calculateZoomSubdivisions,
  valueToPercent,
  percentToValue,
  gcd,
  formatValueAsFraction,
  formatFraction,
  getNumberLineAriaProps,
  resolveNumberLineConfig,
  getInitialNumberLineState,
} from '../../utils/numberLine.js';
import { sound } from '../../utils/audioEffects.js';

// Re-export pure helpers so consumers can access them from the component module
export {
  calculateNumberLineTicks,
  clampValue,
  snapToTick,
  verifyNumberLinePlacement,
  calculateKeyboardStep,
  handleKeyboardNavigation,
  calculateZoom,
  calculateZoomSubdivisions,
  valueToPercent,
  percentToValue,
  gcd,
  formatValueAsFraction,
  formatFraction,
  getNumberLineAriaProps,
  resolveNumberLineConfig,
  getInitialNumberLineState,
};

/**
 * NumberLineLab Component
 *
 * @param {Object} props
 * @param {[number, number]} [props.range=[-2, 2]] - Minimum and maximum bounds
 * @param {number} [props.subdivisions=4] - Subdivision parts per integer unit
 * @param {number|null} [props.targetValue=null] - Target value for predict-then-verify challenge
 * @param {string|null} [props.prompt=null] - Custom challenge prompt or instructional text
 * @param {boolean} [props.embedded=false] - Compact mode for embedding within lesson slides
 * @param {number|null} [props.initialValue=null] - Starting value for slider thumb
 * @param {boolean} [props.readOnly=false] - Disable user interaction
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {(result: { correct: boolean, placedValue: number, targetValue: number, diff: number }) => void} [props.onVerify=null]
 * @param {(value: number) => void} [props.onPositionChange=null]
 */
export default function NumberLineLab({
  range = [-2, 2],
  subdivisions = 4,
  targetValue = null,
  prompt = null,
  embedded = false,
  initialValue = null,
  readOnly = false,
  className = '',
  onVerify = null,
  onPositionChange = null,
}) {
  const [min, max] = range[0] <= range[1] ? range : [range[1], range[0]];
  const [currentZoom, setCurrentZoom] = useState(subdivisions);
  const [placedValue, setPlacedValue] = useState(() => {
    if (initialValue !== null && initialValue !== undefined) {
      return clampValue(initialValue, min, max);
    }
    return min <= 0 && max >= 0 ? 0 : min;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [snapFeedback, setSnapFeedback] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const svgRef = useRef(null);
  const sliderId = useId();

  // Sync zoom level if prop changes
  const [prevSubdivisions, setPrevSubdivisions] = useState(subdivisions);
  if (prevSubdivisions !== subdivisions) {
    setPrevSubdivisions(subdivisions);
    setCurrentZoom(subdivisions);
  }

  // Derived ticks
  const ticks = calculateNumberLineTicks([min, max], currentZoom);

  // Geometry dimensions inside SVG viewBox 800x160
  const paddingX = 50;
  const trackWidth = 700;
  const axisY = 85;

  const valueToX = useCallback(
    (val) => {
      if (max === min) return paddingX + trackWidth / 2;
      const clamped = clampValue(val, min, max);
      return paddingX + ((clamped - min) / (max - min)) * trackWidth;
    },
    [min, max]
  );

  const xToValue = useCallback(
    (x) => {
      if (trackWidth <= 0 || max === min) return min;
      const clampedX = Math.max(paddingX, Math.min(paddingX + trackWidth, x));
      const ratio = (clampedX - paddingX) / trackWidth;
      return clampValue(min + ratio * (max - min), min, max);
    },
    [min, max]
  );

  const triggerSnapPulse = useCallback(() => {
    setSnapFeedback(true);
    const timer = setTimeout(() => setSnapFeedback(false), 180);
    return () => clearTimeout(timer);
  }, []);

  const updatePosition = useCallback(
    (newVal, snapped = false) => {
      const cleanVal = newVal === 0 ? 0 : newVal;
      setPlacedValue(cleanVal);
      setVerifyResult(null); // Clear previous verification when position changes
      onPositionChange?.(cleanVal);
      if (snapped) {
        triggerSnapPulse();
        try {
          sound.playTick();
        } catch {
          // Safe fallback if audio context unavailable
        }
      }
    },
    [onPositionChange, triggerSnapPulse]
  );

  // Pointer position to coordinate
  const clientXToValue = useCallback(
    (clientX) => {
      if (!svgRef.current) return min;
      const rect = svgRef.current.getBoundingClientRect();
      if (rect.width <= 0) return min;
      const svgX = ((clientX - rect.left) / rect.width) * 800;
      return xToValue(svgX);
    },
    [min, xToValue]
  );

  // Pointer Handlers
  const handlePointerDown = (e) => {
    if (readOnly) return;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // Safe fallback
    }
    setIsDragging(true);
    const rawVal = clientXToValue(e.clientX);
    const snapped = snapToTick(rawVal, [min, max], currentZoom);
    updatePosition(snapped, true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || readOnly) return;
    const rawVal = clientXToValue(e.clientX);
    const snapped = snapToTick(rawVal, [min, max], currentZoom);
    if (snapped !== placedValue) {
      updatePosition(snapped, true);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging || readOnly) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // Safe fallback
    }
    const rawVal = clientXToValue(e.clientX);
    const snapped = snapToTick(rawVal, [min, max], currentZoom);
    updatePosition(snapped, true);
  };

  // Keyboard Navigation Handler (F-12, E-07, E-08, T3.01)
  const handleKeyDown = (e) => {
    if (readOnly) return;

    const result = handleKeyboardNavigation(
      placedValue,
      e.key,
      e.shiftKey,
      [min, max],
      currentZoom
    );

    if (result.handled) {
      // CRITICAL: Stop propagation so embedded slider does not advance parent lesson steps (T3.01)
      e.stopPropagation();
      e.preventDefault();
      updatePosition(result.value, true);
    }
  };

  // Predict-then-Verify Action (F-15, E-10, E-11)
  const handleCheck = () => {
    if (targetValue === null || targetValue === undefined) return;
    const res = verifyNumberLinePlacement(placedValue, targetValue, 0.005);
    setVerifyResult(res);
    if (res.correct) {
      try {
        sound.playCorrect();
      } catch {}
    } else {
      try {
        sound.playWrong();
      } catch {}
    }
    onVerify?.(res);
  };

  // Reset Control (F-17)
  const handleReset = () => {
    const defaultVal = min <= 0 && max >= 0 ? 0 : min;
    updatePosition(defaultVal, true);
  };

  // Zoom Controls (F-16, E-12)
  const handleZoomIn = () => {
    setCurrentZoom((prev) => calculateZoomSubdivisions(prev, 'in', 1, 16));
  };

  const handleZoomOut = () => {
    setCurrentZoom((prev) => calculateZoomSubdivisions(prev, 'out', 1, 16));
  };

  const thumbX = valueToX(placedValue);
  const formattedVal = formatValueAsFraction(placedValue, currentZoom);
  const hasTarget = targetValue !== null && targetValue !== undefined;
  const targetFormatted = hasTarget ? formatValueAsFraction(targetValue, currentZoom) : null;
  const canZoomIn = currentZoom < 16;
  const canZoomOut = currentZoom > 1;

  // Determine thumb fill color based on verification state
  const thumbColor = verifyResult
    ? verifyResult.correct
      ? 'var(--good)'
      : 'var(--heat)'
    : 'var(--accent)';

  return (
    <div
      className={`number-line-lab select-none rounded-2xl border transition-colors ${
        embedded
          ? 'p-3.5 bg-[var(--surface)] border-[var(--line)]'
          : 'study-card p-6 bg-[var(--surface)] border-[var(--line)] shadow-sm'
      } ${className}`}
      style={{ color: 'var(--ink)' }}
      data-testid="number-line-lab"
    >
      {/* Header & Prompt Section */}
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="eyebrow text-xs uppercase tracking-wider text-[var(--ink-3)] font-semibold">
              Interactive Concept Lab
            </p>
            <h3 className="text-xl font-bold tracking-tight text-[var(--ink)]" style={{ margin: '2px 0 0' }}>
              Number Line Laboratory
            </h3>
            <p className="text-xs text-[var(--ink-2)] mt-0.5">
              Drag or use Arrow keys to position point (Shift + Arrow for fine adjustments)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] font-medium">
              Step: 1/{currentZoom}
            </span>
          </div>
        </div>
      )}

      {/* Target Goal Prompt Banner (Predict-then-Verify Mode) */}
      {hasTarget && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-medium">
            <span className="text-[var(--ink-2)]">Target: </span>
            <span className="text-[var(--ink)] font-bold font-mono">
              {prompt || `Place marker at ${targetFormatted} (${targetValue})`}
            </span>
          </div>
          {verifyResult && (
            <div
              className={`text-xs px-3 py-1 rounded-md font-semibold ${
                verifyResult.correct
                  ? 'bg-[var(--accent-soft)] text-[var(--good)] border border-[var(--good)]'
                  : 'bg-[var(--surface-2)] text-[var(--heat)] border border-[var(--heat)]'
              }`}
            >
              {verifyResult.correct
                ? '✓ Correct placement!'
                : `Off by ${verifyResult.diff.toFixed(3)} — Try again`}
            </div>
          )}
        </div>
      )}

      {/* SVG Number Line Canvas (aria-hidden removed so screen readers can reach child slider) */}
      <div className="relative py-2 px-1">
        <svg
          ref={svgRef}
          viewBox="0 0 800 160"
          className="w-full h-auto overflow-visible select-none touch-none cursor-pointer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Transparent hit area covering entire axis region */}
          <rect x="0" y="20" width="800" height="120" fill="transparent" aria-hidden="true" />

          {/* Left Arrowhead */}
          <polygon
            points="38,80 26,85 38,90"
            fill="var(--line-strong)"
            aria-hidden="true"
          />

          {/* Right Arrowhead */}
          <polygon
            points="762,80 774,85 762,90"
            fill="var(--line-strong)"
            aria-hidden="true"
          />

          {/* Horizontal Axis Line */}
          <line
            x1="34"
            y1={axisY}
            x2="766"
            y2={axisY}
            stroke="var(--line-strong)"
            strokeWidth="3.5"
            strokeLinecap="round"
            aria-hidden="true"
          />

          {/* Magnitude line from 0 to placedValue */}
          {min <= 0 && max >= 0 && (
            <line
              x1={valueToX(0)}
              y1={axisY}
              x2={thumbX}
              y2={axisY}
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.35"
              aria-hidden="true"
            />
          )}

          {/* Zero origin anchor marker */}
          {min <= 0 && max >= 0 && (
            <circle
              cx={valueToX(0)}
              cy={axisY}
              r="4.5"
              fill="var(--accent)"
              opacity="0.9"
              aria-hidden="true"
            />
          )}

          {/* Target marker (shown after verification) */}
          {hasTarget && verifyResult && (
            <g aria-hidden="true">
              <line
                x1={valueToX(targetValue)}
                y1={axisY - 26}
                x2={valueToX(targetValue)}
                y2={axisY + 26}
                stroke={verifyResult.correct ? 'var(--good)' : 'var(--heat)'}
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />
              <polygon
                points="-5,-4 5,-4 0,4"
                transform={`translate(${valueToX(targetValue)}, ${axisY - 28})`}
                fill={verifyResult.correct ? 'var(--good)' : 'var(--heat)'}
              />
              <text
                x={valueToX(targetValue)}
                y={axisY - 34}
                fill={verifyResult.correct ? 'var(--good)' : 'var(--heat)'}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                Target: {targetFormatted}
              </text>
            </g>
          )}

          {/* Ticks and numeric text labels (marked aria-hidden to prevent assistive tech noise) */}
          {ticks.map((tick) => {
            const tx = valueToX(tick.value);
            return (
              <g key={`tick-${tick.value}`} aria-hidden="true">
                {/* Tick Mark */}
                <line
                  x1={tx}
                  y1={tick.isMajor ? axisY - 18 : axisY - 9}
                  x2={tx}
                  y2={tick.isMajor ? axisY + 18 : axisY + 9}
                  stroke={tick.isMajor ? 'var(--ink)' : 'var(--line-strong)'}
                  strokeWidth={tick.isMajor ? '2.5' : '1.5'}
                  strokeLinecap="round"
                />

                {/* Major Integer Label */}
                {tick.isMajor && tick.label !== null && (
                  <text
                    x={tx}
                    y={axisY + 38}
                    fill="var(--ink)"
                    fontSize="14"
                    fontWeight="600"
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                  >
                    {tick.label}
                  </text>
                )}

                {/* Minor Tick Fraction Sub-labels (shown when density permits) */}
                {!tick.isMajor && currentZoom <= 4 && (
                  <text
                    x={tx}
                    y={axisY + 26}
                    fill="var(--ink-3)"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                  >
                    {tick.fractionLabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* Interactive Draggable Thumb Group (role="slider") */}
          <g
            id={sliderId}
            role="slider"
            tabIndex={readOnly ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={placedValue}
            aria-valuetext={formattedVal}
            aria-label={prompt || `Number line slider from ${min} to ${max}`}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            transform={`translate(${thumbX}, ${axisY})`}
            className="focus:outline-none"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              outline: 'none',
            }}
          >
            {/* Extended invisible pointer target */}
            <circle r="32" fill="transparent" aria-hidden="true" />

            {/* Focus / Active Halo Ring */}
            <circle
              r="22"
              fill="var(--accent-soft)"
              stroke="var(--accent)"
              strokeWidth="1.5"
              opacity={isFocused || isDragging || snapFeedback ? 0.9 : 0}
              className="motion-reduce:transition-none transition-opacity duration-150"
              aria-hidden="true"
            />

            {/* Slider Thumb Outer Circle */}
            <circle
              r="10"
              fill={thumbColor}
              stroke="var(--surface)"
              strokeWidth="2.5"
              className={`motion-reduce:transition-none transition-transform duration-100 ${
                isDragging ? 'scale-125' : snapFeedback ? 'scale-115' : 'scale-100'
              }`}
              aria-hidden="true"
            />

            {/* Center Pin Indicator */}
            <circle r="3" fill="var(--surface)" aria-hidden="true" />

            {/* Floating Value Tooltip Bubble */}
            <g transform="translate(0, -32)" className="pointer-events-none" aria-hidden="true">
              <rect
                x="-28"
                y="-13"
                width="56"
                height="22"
                rx="6"
                ry="6"
                fill="var(--surface)"
                stroke={thumbColor}
                strokeWidth="1.5"
                filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))"
              />
              <text
                y="3"
                fill="var(--ink)"
                fontSize="12"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {formattedVal}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Footer Controls & Information */}
      <div className="mt-4 pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Numerical Readout */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[var(--ink-2)]">
            Position:{' '}
            <strong className="text-[var(--ink)] text-sm">{formattedVal}</strong>{' '}
            <span className="text-[var(--ink-3)]">({placedValue.toFixed(3)})</span>
          </span>
        </div>

        {/* Right: Zoom, Reset, and Verify Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Subdivisions Control */}
          <div
            className="flex items-center rounded-lg border border-[var(--line)] overflow-hidden bg-[var(--surface-2)]"
            title="Adjust tick subdivision density"
          >
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={!canZoomOut || readOnly}
              className="px-2.5 py-1 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)] disabled:opacity-35 transition-colors"
              aria-label="Zoom out subdivisions"
            >
              −
            </button>
            <span className="px-2 text-[11px] font-mono text-[var(--ink-2)] border-x border-[var(--line)]">
              1/{currentZoom}
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={!canZoomIn || readOnly}
              className="px-2.5 py-1 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)] disabled:opacity-35 transition-colors"
              aria-label="Zoom in subdivisions"
            >
              +
            </button>
          </div>

          {/* Reset Button (F-17) */}
          <button
            type="button"
            onClick={handleReset}
            disabled={readOnly}
            className="study-button secondary px-3 py-1 rounded-lg text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] border border-[var(--line)] transition-colors disabled:opacity-40"
          >
            Reset
          </button>

          {/* Check Verification Button (F-15) */}
          {hasTarget && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={readOnly}
              className="study-button px-4 py-1 rounded-lg text-xs font-semibold transition-transform active:scale-95 disabled:opacity-40"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--surface)',
              }}
            >
              Check
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
