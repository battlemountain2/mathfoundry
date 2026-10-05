/**
 * src/utils/numberLine.js
 *
 * Core mathematical engine, coordinate transformations, snapping,
 * keyboard navigation, and accessibility helpers for NumberLineLab.
 * MathFoundry v2 Milestone 2.
 */

/**
 * Greatest common divisor using Euclidean algorithm.
 *
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/**
 * Normalizes -0 to +0.
 *
 * @param {number} val
 * @returns {number}
 */
function normalizeZero(val) {
  return Object.is(val, -0) ? 0 : val;
}

/**
 * Clamps a number within [min, max].
 * Handles NaN, null, undefined, non-numeric inputs safely.
 * Handles inverted bounds [max, min] gracefully.
 *
 * @param {number} val - Value to clamp
 * @param {number} [min=-2] - Lower boundary
 * @param {number} [max=2] - Upper boundary
 * @returns {number} Clamped value
 */
export function clampValue(val, min = -2, max = 2) {
  const actualMin = Math.min(min, max);
  const actualMax = Math.max(min, max);

  if (typeof val !== 'number' || Number.isNaN(val)) {
    return actualMin;
  }
  if (val < actualMin) return actualMin;
  if (val > actualMax) return actualMax;
  return normalizeZero(val);
}

/**
 * Generates ticks across [min, max] with specified subdivisions.
 * Each tick contains:
 * - value: clean floating point number normalized against IEEE 754 drift
 * - isMajor: boolean (integer/whole number)
 * - label: string for major ticks, null for minor
 * - fractionLabel: readable fraction string
 * - positionPct: percentage position along axis [0, 100]
 *
 * @param {[number, number]} [range=[-2, 2]] - Minimum and maximum bounds
 * @param {number} [subdivisions=4] - Subdivision parts per integer unit
 * @returns {Array<{ value: number, isMajor: boolean, label: string | null, fractionLabel: string, positionPct: number }>}
 */
export function calculateNumberLineTicks(range = [-2, 2], subdivisions = 4) {
  let [min, max] = range;
  if (min > max) {
    [min, max] = [max, min];
  }
  if (min === max) {
    min -= 1;
    max += 1;
  }

  const safeSubdivisions = Math.max(1, Math.round(subdivisions) || 1);
  const step = 1 / safeSubdivisions;
  const totalSteps = Math.round((max - min) * safeSubdivisions);
  const count = totalSteps + 1;

  const ticks = [];
  for (let i = 0; i < count; i++) {
    const rawVal = min + i * step;
    const val = normalizeZero(Number(rawVal.toFixed(6)));
    const isMajor = Math.abs(val - Math.round(val)) < 1e-6;
    const label = isMajor ? String(Math.round(val)) : null;
    const fractionLabel = formatValueAsFraction(val, safeSubdivisions);
    const positionPct = totalSteps === 0 ? 0 : Number(((i / totalSteps) * 100).toFixed(4));

    ticks.push({
      value: val,
      isMajor,
      label,
      fractionLabel,
      positionPct,
    });
  }

  // Defect 4 Fix: Filter ticks to ensure none exceed max boundary on unaligned bounds
  return ticks.filter((t) => t.value <= max + 1e-6);
}

/**
 * Snaps a mathematical value to the nearest subdivision tick within range.
 *
 * @param {number} val - Input value
 * @param {[number, number]} [range=[-2, 2]] - Minimum and maximum bounds
 * @param {number} [subdivisions=4] - Subdivision count per integer unit
 * @returns {number} Snapped value
 */
export function snapToTick(val, range = [-2, 2], subdivisions = 4) {
  let [min, max] = range;
  if (min > max) [min, max] = [max, min];

  const clamped = clampValue(val, min, max);
  const safeSubdivisions = Math.max(1, Math.round(subdivisions) || 1);
  const step = 1 / safeSubdivisions;

  const tickIndex = Math.round((clamped - min) / step);
  const snapped = min + tickIndex * step;
  const clampedSnapped = clampValue(snapped, min, max);

  return normalizeZero(Number(clampedSnapped.toFixed(6)));
}

/**
 * Compares placed value against target value with tolerance (default ±0.005).
 *
 * @param {number} placedVal - Learner's placed point
 * @param {number|null} targetVal - Target goal value
 * @param {number} [tolerance=0.005] - Acceptance threshold
 * @returns {{ correct: boolean, placedValue: number, targetValue: number | null, diff: number | null, canVerify: boolean }}
 */
export function verifyNumberLinePlacement(placedVal, targetVal, tolerance = 0.005) {
  if (targetVal === null || targetVal === undefined) {
    return {
      correct: false,
      placedValue: placedVal,
      targetValue: null,
      diff: null,
      canVerify: false,
    };
  }

  const diff = Number(Math.abs(placedVal - targetVal).toFixed(6));
  const correct = diff <= tolerance;

  return {
    correct,
    placedValue: placedVal,
    targetValue: targetVal,
    diff,
    canVerify: true,
  };
}

/**
 * Calculates step delta for keyboard arrow navigation.
 * Coarse step: 1 tick = 1 / subdivisions.
 * Fine step (Shift): 1 / Math.max(16, subdivisions * 4).
 *
 * @param {string} key - Pressed key
 * @param {boolean} [shiftKey=false] - Whether Shift modifier is active
 * @param {number} [subdivisions=4] - Subdivision density
 * @returns {number} Signed step delta
 */
export function calculateKeyboardStep(key, shiftKey = false, subdivisions = 4) {
  const safeSubdivisions = Math.max(1, Math.round(subdivisions) || 1);
  const coarseStep = 1 / safeSubdivisions;
  const fineStep = 1 / Math.max(16, safeSubdivisions * 4);

  const stepSize = shiftKey ? fineStep : coarseStep;

  if (key === 'ArrowRight' || key === 'ArrowUp') {
    return stepSize;
  }
  if (key === 'ArrowLeft' || key === 'ArrowDown') {
    return -stepSize;
  }
  return 0;
}

/**
 * Handles keyboard interaction on the slider point.
 * Supports Arrow keys, Shift+Arrow keys, Home, End, PageUp, PageDown.
 *
 * @param {number} currentVal - Current slider value
 * @param {string} key - KeyboardEvent.key
 * @param {boolean} [shiftKey=false] - KeyboardEvent.shiftKey
 * @param {[number, number]} [range=[-2, 2]] - Axis bounds
 * @param {number} [subdivisions=4] - Subdivision count
 * @returns {{ handled: boolean, value: number }}
 */
export function handleKeyboardNavigation(currentVal, key, shiftKey = false, range = [-2, 2], subdivisions = 4) {
  let [min, max] = range;
  if (min > max) [min, max] = [max, min];

  let nextVal = currentVal;
  let handled = false;

  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'ArrowDown': {
      const step = calculateKeyboardStep(key, shiftKey, subdivisions);
      nextVal = normalizeZero(Number((currentVal + step).toFixed(6)));
      handled = true;
      break;
    }
    case 'Home':
      nextVal = min;
      handled = true;
      break;
    case 'End':
      nextVal = max;
      handled = true;
      break;
    case 'PageUp':
      nextVal = currentVal + 1;
      handled = true;
      break;
    case 'PageDown':
      nextVal = currentVal - 1;
      handled = true;
      break;
    default:
      handled = false;
  }

  return {
    handled,
    value: clampValue(nextVal, min, max),
  };
}

/**
 * Calculates zoom level (subdivisions) bounded by [minSubdivisions, maxSubdivisions].
 *
 * @param {number} currentSubdivisions
 * @param {'in'|'out'} direction
 * @param {number} [minSubdivisions=1]
 * @param {number} [maxSubdivisions=16]
 * @returns {{ subdivisions: number, canZoomIn: boolean, canZoomOut: boolean }}
 */
export function calculateZoom(currentSubdivisions, direction, minSubdivisions = 1, maxSubdivisions = 16) {
  let next = currentSubdivisions;
  if (direction === 'in') {
    // Defect 3 Fix: Apply lower-bound clamp and fallback for 0 or sub-min subdivisions
    next = Math.max(minSubdivisions, Math.min(maxSubdivisions, (currentSubdivisions || minSubdivisions) * 2));
  } else if (direction === 'out') {
    next = Math.max(minSubdivisions, Math.floor(currentSubdivisions / 2));
  }

  return {
    subdivisions: next,
    canZoomIn: next < maxSubdivisions,
    canZoomOut: next > minSubdivisions,
  };
}

/**
 * Convenience helper returning just the new subdivision count.
 *
 * @param {number} current
 * @param {'in'|'out'} direction
 * @param {number} [minZoom=1]
 * @param {number} [maxZoom=16]
 * @returns {number}
 */
export function calculateZoomSubdivisions(current, direction, minZoom = 1, maxZoom = 16) {
  return calculateZoom(current, direction, minZoom, maxZoom).subdivisions;
}

/**
 * Converts value along axis to percentage [0, 100].
 *
 * @param {number} value
 * @param {[number, number]} [range=[-2, 2]]
 * @returns {number}
 */
export function valueToPercent(value, range = [-2, 2]) {
  let [min, max] = range;
  if (min > max) [min, max] = [max, min];
  if (max === min) return 50;

  const clamped = clampValue(value, min, max);
  const pct = ((clamped - min) / (max - min)) * 100;
  return Number(pct.toFixed(4));
}

/**
 * Converts percentage [0, 100] to value along axis.
 *
 * @param {number} percent
 * @param {[number, number]} [range=[-2, 2]]
 * @returns {number}
 */
export function percentToValue(percent, range = [-2, 2]) {
  let [min, max] = range;
  if (min > max) [min, max] = [max, min];

  const clampedPct = Math.max(0, Math.min(100, percent));
  const rawVal = min + (clampedPct / 100) * (max - min);
  return normalizeZero(Number(clampValue(rawVal, min, max).toFixed(6)));
}

/**
 * Formats a decimal number into a clean signed fraction or mixed number string.
 * Examples: -0.75 -> "-3/4", 0.5 -> "1/2", 1.5 -> "1 1/2", -2 -> "-2", 0 -> "0".
 *
 * @param {number} val - Number to format
 * @param {number} [maxDenominator=16] - Highest denominator to check
 * @returns {string} Formatted fraction string
 */
export function formatValueAsFraction(val, maxDenominator = 16) {
  if (val === null || val === undefined || Number.isNaN(val)) return '0';
  val = normalizeZero(val);

  // Exact integer check
  if (Math.abs(val - Math.round(val)) < 1e-6) {
    return String(Math.round(val));
  }

  const sign = val < 0 ? '-' : '';
  const absVal = Math.abs(val);
  const whole = Math.floor(absVal);
  const frac = absVal - whole;

  // Search for closest rational representation with denominator <= maxDenominator
  let bestNum = 1;
  let bestDen = 1;
  let minError = Infinity;

  for (let den = 1; den <= maxDenominator; den++) {
    const num = Math.round(frac * den);
    const error = Math.abs(frac - num / den);
    if (error < minError) {
      minError = error;
      bestNum = num;
      bestDen = den;
      if (error < 1e-6) break;
    }
  }

  // Simplify fraction
  const divisor = gcd(bestNum, bestDen);
  bestNum /= divisor;
  bestDen /= divisor;

  // Defect 1 & Defect 2 Fix:
  // If bestNum === 0 (zero fractional part) or bestNum === bestDen (fraction equals 1 whole unit)
  if (bestNum === 0 || bestNum === bestDen) {
    const finalWhole = bestNum === bestDen ? whole + 1 : whole;
    return finalWhole === 0 ? '0' : `${sign}${finalWhole}`;
  }

  if (whole === 0) {
    return `${sign}${bestNum}/${bestDen}`;
  }

  return `${sign}${whole} ${bestNum}/${bestDen}`;
}

/**
 * Alias for formatValueAsFraction for consumer convenience.
 */
export const formatFraction = formatValueAsFraction;

/**
 * Generates ARIA slider attributes dictionary.
 *
 * @param {number} value - Current position
 * @param {[number, number]} [range=[-2, 2]] - Axis bounds
 * @param {string} [label='Number line position'] - ARIA label
 * @returns {Object} ARIA slider attributes
 */
export function getNumberLineAriaProps(value, range = [-2, 2], label = 'Number line position') {
  let [min, max] = range;
  if (min > max) [min, max] = [max, min];

  const clamped = clampValue(value, min, max);

  return {
    role: 'slider',
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': clamped,
    'aria-valuetext': formatValueAsFraction(clamped),
    'aria-label': label,
    tabIndex: 0,
  };
}

/**
 * Resolves default props and validates NumberLineLab options.
 *
 * @param {Object} [props={}]
 * @returns {Object}
 */
export function resolveNumberLineConfig(props = {}) {
  const range = Array.isArray(props.range) && props.range.length === 2 ? props.range : [-2, 2];
  const subdivisions = typeof props.subdivisions === 'number' && props.subdivisions > 0 ? props.subdivisions : 4;
  const targetValue = typeof props.targetValue === 'number' ? props.targetValue : null;
  const embedded = Boolean(props.embedded);
  const prompt = props.prompt || (targetValue !== null ? `Place point at ${formatValueAsFraction(targetValue)}` : 'Explore the number line');

  return {
    range,
    subdivisions,
    targetValue,
    embedded,
    prompt,
    tolerance: props.tolerance || 0.005,
    minSubdivisions: props.minSubdivisions || 1,
    maxSubdivisions: props.maxSubdivisions || 16,
  };
}

/**
 * Generates initial state for NumberLineLab component.
 *
 * @param {Object} [props={}]
 * @returns {Object}
 */
export function getInitialNumberLineState(props = {}) {
  const config = resolveNumberLineConfig(props);
  // Default origin at 0 if in range, otherwise min
  const defaultOrigin = config.range[0] <= 0 && config.range[1] >= 0 ? 0 : config.range[0];

  return {
    placedValue: defaultOrigin,
    subdivisions: config.subdivisions,
    isVerified: false,
    verificationResult: null,
    isDragging: false,
    zoomLevel: config.subdivisions,
  };
}
