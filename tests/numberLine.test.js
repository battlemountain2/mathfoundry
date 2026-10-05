/**
 * tests/numberLine.test.js
 *
 * Comprehensive Unit Test Suite for Milestone 2: Number Line Lab (F-10 through F-19)
 *
 * Verifies:
 * - Group 1: Tick generation & subdivision calculations (F-10)
 * - Group 2: Snapping mechanics (exact, positive, negative, boundary) (F-13, E-09)
 * - Group 3: Clamping & boundary safety (underflow, overflow, NaN) (F-11, E-06)
 * - Group 4: Keyboard navigation (coarse, fine Shift+arrow, Home/End, stopPropagation) (F-12, E-07, E-08, T3.01)
 * - Group 5: Predict-then-verify evaluation (±0.005 tolerance bounds) (F-15, E-10, E-11)
 * - Group 6: Zoom dynamics (max 16, min 1, doubling/halving) (F-16, E-12)
 * - Group 7: Reset behavior & state restoration (F-17)
 * - Group 8: Accessibility & ARIA slider attributes (F-18)
 * - Group 9: Signed fraction formatting & numerical representations (F-14)
 * - Group 10: Component configuration & embedded/standalone modes (F-19)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateNumberLineTicks,
  clampValue,
  snapToTick,
  verifyNumberLinePlacement,
  calculateKeyboardStep,
  handleKeyboardNavigation,
  calculateZoom,
  formatValueAsFraction,
  getNumberLineAriaProps,
  valueToPercent,
  percentToValue,
  resolveNumberLineConfig,
  getInitialNumberLineState,
} from '../src/utils/numberLine.js';

// ============================================================================
// GROUP 1: Tick Generation & Subdivision Mathematics (F-10)
// ============================================================================

test('NL.1.1: Default tick generation produces exactly 17 ticks for [-2, 2] with 4 subdivisions', () => {
  const ticks = calculateNumberLineTicks([-2, 2], 4);

  // [-2, 2] with 4 subdivisions = 4 units * 4 parts + 1 = 17 ticks
  assert.equal(ticks.length, 17, 'Should produce exactly 17 ticks');
  assert.equal(ticks[0].value, -2);
  assert.equal(ticks[ticks.length - 1].value, 2);

  // Verify step progression is exactly 0.25
  for (let i = 0; i < ticks.length; i++) {
    const expected = Number((-2 + i * 0.25).toFixed(6));
    assert.equal(ticks[i].value, expected, `Tick ${i} should be ${expected}`);
  }
});

test('NL.1.2: Major vs minor tick classification identifies integers and labels accurately', () => {
  const ticks = calculateNumberLineTicks([-2, 2], 4);

  const majorTicks = ticks.filter((t) => t.isMajor);
  const minorTicks = ticks.filter((t) => !t.isMajor);

  // Integers in [-2, 2]: -2, -1, 0, 1, 2 = 5 major ticks
  assert.equal(majorTicks.length, 5);
  assert.equal(minorTicks.length, 12);

  // Major ticks must have string integer labels
  assert.deepEqual(
    majorTicks.map((t) => t.label),
    ['-2', '-1', '0', '1', '2']
  );

  // Minor ticks must have null labels for clean visual layout
  for (const minor of minorTicks) {
    assert.equal(minor.label, null);
  }

  // Explicit check for zero tick: not "-0"
  const zeroTick = ticks.find((t) => t.value === 0);
  assert.ok(zeroTick);
  assert.equal(zeroTick.isMajor, true);
  assert.equal(zeroTick.label, '0');
});

test('NL.1.3: Custom subdivision densities (halves, thirds, eighths, sixteenths)', () => {
  // Halves on [-1, 1]: 2 units * 2 parts + 1 = 5 ticks (-1, -0.5, 0, 0.5, 1)
  const halves = calculateNumberLineTicks([-1, 1], 2);
  assert.equal(halves.length, 5);
  assert.deepEqual(
    halves.map((t) => t.value),
    [-1, -0.5, 0, 0.5, 1]
  );

  // Thirds on [-1, 1]: 2 units * 3 parts + 1 = 7 ticks
  const thirds = calculateNumberLineTicks([-1, 1], 3);
  assert.equal(thirds.length, 7);
  assert.equal(thirds[0].value, -1);
  assert.equal(thirds[3].value, 0);
  assert.equal(thirds[6].value, 1);

  // Sixteenths on [-2, 2]: 4 * 16 + 1 = 65 ticks
  const sixteenths = calculateNumberLineTicks([-2, 2], 16);
  assert.equal(sixteenths.length, 65);
  assert.equal(sixteenths[0].value, -2);
  assert.equal(sixteenths[64].value, 2);
});

test('NL.1.4: Non-symmetric and purely positive/negative ranges', () => {
  // Non-symmetric range [-1, 3] with 2 subdivisions = 4 * 2 + 1 = 9 ticks
  const nonSym = calculateNumberLineTicks([-1, 3], 2);
  assert.equal(nonSym.length, 9);
  assert.equal(nonSym[0].value, -1);
  assert.equal(nonSym[8].value, 3);

  // Purely positive [0, 5] with 1 subdivision = 6 ticks
  const positive = calculateNumberLineTicks([0, 5], 1);
  assert.equal(positive.length, 6);
  assert.deepEqual(
    positive.map((t) => t.value),
    [0, 1, 2, 3, 4, 5]
  );

  // Inverted range [2, -2] normalizes safely to [-2, 2]
  const inverted = calculateNumberLineTicks([2, -2], 4);
  assert.equal(inverted.length, 17);
  assert.equal(inverted[0].value, -2);
  assert.equal(inverted[16].value, 2);
});

// ============================================================================
// GROUP 2: Snapping Mechanics (F-13, E-09)
// ============================================================================

test('NL.2.1: Exact tick values snap to themselves without floating point drift', () => {
  const range = [-2, 2];
  const subdivisions = 4;

  const exactValues = [-2.0, -1.75, -1.5, -1.25, -1.0, -0.75, -0.5, -0.25, 0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  for (const v of exactValues) {
    const snapped = snapToTick(v, range, subdivisions);
    assert.equal(snapped, v, `Exact value ${v} should snap to itself`);
    assert.equal(Object.is(snapped, -0), false, 'Must not return negative zero -0');
  }
});

test('NL.2.2: Positive fractional values snap to nearest subdivision tick', () => {
  const range = [-2, 2];
  const subdivisions = 4; // ticks at 0, 0.25, 0.5, 0.75, 1.0

  // Values closer to 0 than 0.25 (threshold 0.125)
  assert.equal(snapToTick(0.04, range, subdivisions), 0.0);
  assert.equal(snapToTick(0.10, range, subdivisions), 0.0);
  assert.equal(snapToTick(0.12, range, subdivisions), 0.0);

  // Values closer to 0.25
  assert.equal(snapToTick(0.13, range, subdivisions), 0.25);
  assert.equal(snapToTick(0.18, range, subdivisions), 0.25);
  assert.equal(snapToTick(0.24, range, subdivisions), 0.25);
  assert.equal(snapToTick(0.26, range, subdivisions), 0.25);

  // Between 0.25 and 0.5 (threshold 0.375)
  assert.equal(snapToTick(0.37, range, subdivisions), 0.25);
  assert.equal(snapToTick(0.38, range, subdivisions), 0.50);
});

test('NL.2.3: Negative fractional values snap symmetrically toward nearest tick', () => {
  const range = [-2, 2];
  const subdivisions = 4; // ticks at 0, -0.25, -0.5, -0.75, -1.0

  // Values closer to 0 than -0.25
  assert.equal(snapToTick(-0.10, range, subdivisions), 0.0);
  assert.equal(snapToTick(-0.12, range, subdivisions), 0.0);

  // Values closer to -0.25
  assert.equal(snapToTick(-0.13, range, subdivisions), -0.25);
  assert.equal(snapToTick(-0.24, range, subdivisions), -0.25);

  // Between -0.50 and -0.75 (threshold -0.625)
  assert.equal(snapToTick(-0.60, range, subdivisions), -0.50);
  assert.equal(snapToTick(-0.65, range, subdivisions), -0.75);
  assert.equal(snapToTick(-0.80, range, subdivisions), -0.75);
  assert.equal(snapToTick(-1.90, range, subdivisions), -2.00);
});

test('NL.2.4: Snapping with custom subdivisions (thirds and eighths)', () => {
  // Thirds: ticks at 0, 0.333333, 0.666667, 1.0
  assert.equal(snapToTick(0.30, [-1, 1], 3), 0.333333);
  assert.equal(snapToTick(0.60, [-1, 1], 3), 0.666667);
  assert.equal(snapToTick(-0.30, [-1, 1], 3), -0.333333);

  // Eighths: step = 0.125
  assert.equal(snapToTick(0.06, [-1, 1], 8), 0.0);
  assert.equal(snapToTick(0.07, [-1, 1], 8), 0.125);
  assert.equal(snapToTick(0.18, [-1, 1], 8), 0.125);
  assert.equal(snapToTick(0.19, [-1, 1], 8), 0.25);
});

test('NL.2.5: Boundary snapping strictly clamps values exceeding bounds', () => {
  const range = [-2, 2];
  const subdivisions = 4;

  assert.equal(snapToTick(2.15, range, subdivisions), 2.0);
  assert.equal(snapToTick(50.0, range, subdivisions), 2.0);
  assert.equal(snapToTick(-2.15, range, subdivisions), -2.0);
  assert.equal(snapToTick(-999.0, range, subdivisions), -2.0);
});

// ============================================================================
// GROUP 3: Clamping & Coordinate Safety (F-11, E-06)
// ============================================================================

test('NL.3.1: Clamping preserves values inside bounds and clamps overshoots', () => {
  assert.equal(clampValue(0.5, -2, 2), 0.5);
  assert.equal(clampValue(-1.5, -2, 2), -1.5);
  assert.equal(clampValue(0, -2, 2), 0);

  // Upper boundary overshoots
  assert.equal(clampValue(2.0001, -2, 2), 2);
  assert.equal(clampValue(9999, -2, 2), 2);
  assert.equal(clampValue(Infinity, -2, 2), 2);

  // Lower boundary undershoots
  assert.equal(clampValue(-2.0001, -2, 2), -2);
  assert.equal(clampValue(-9999, -2, 2), -2);
  assert.equal(clampValue(-Infinity, -2, 2), -2);
});

test('NL.3.2: Clamping guards against NaN, null, undefined, and non-numeric input', () => {
  assert.equal(clampValue(NaN, -2, 2), -2);
  assert.equal(clampValue(null, -2, 2), -2);
  assert.equal(clampValue(undefined, -2, 2), -2);
  assert.equal(clampValue('invalid', -2, 2), -2);
});

test('NL.3.3: Percentage coordinate conversions valueToPercent and percentToValue are bidirectional', () => {
  const range = [-2, 2];

  // -2 -> 0%, 0 -> 50%, 2 -> 100%
  assert.equal(valueToPercent(-2, range), 0);
  assert.equal(valueToPercent(0, range), 50);
  assert.equal(valueToPercent(2, range), 100);
  assert.equal(valueToPercent(-1, range), 25);
  assert.equal(valueToPercent(1, range), 75);

  // Bidirectional recovery
  for (const val of [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]) {
    const pct = valueToPercent(val, range);
    const recovered = percentToValue(pct, range);
    assert.equal(recovered, val, `Should recover value ${val} from ${pct}%`);
  }

  // Clamping on percentage input
  assert.equal(percentToValue(-10, range), -2);
  assert.equal(percentToValue(110, range), 2);
});

// ============================================================================
// GROUP 4: Keyboard Navigation Mechanics (F-12, E-07, E-08, T3.01)
// ============================================================================

test('NL.4.1: Coarse arrow keys step by exactly one subdivision tick (1 / subdivisions)', () => {
  const subdivisions = 4; // coarse step = 0.25

  assert.equal(calculateKeyboardStep('ArrowRight', false, subdivisions), 0.25);
  assert.equal(calculateKeyboardStep('ArrowLeft', false, subdivisions), -0.25);
  assert.equal(calculateKeyboardStep('ArrowUp', false, subdivisions), 0.25);
  assert.equal(calculateKeyboardStep('ArrowDown', false, subdivisions), -0.25);
});

test('NL.4.2: Fine Shift+arrow keys step by fine sub-tick fraction', () => {
  const subdivisions = 4;
  const coarseStep = calculateKeyboardStep('ArrowRight', false, subdivisions);
  const fineStep = calculateKeyboardStep('ArrowRight', true, subdivisions);

  // Fine step is 1/16 = 0.0625
  assert.equal(fineStep, 0.0625);
  assert.ok(fineStep < coarseStep, 'Fine step must be strictly smaller than coarse step');
  assert.equal(calculateKeyboardStep('ArrowLeft', true, subdivisions), -0.0625);
});

test('NL.4.3: Keyboard navigation clamped at axis boundaries', () => {
  const range = [-2, 2];
  const subdivisions = 4;

  // At upper boundary
  const atMax = handleKeyboardNavigation(2.0, 'ArrowRight', false, range, subdivisions);
  assert.equal(atMax.handled, true);
  assert.equal(atMax.value, 2.0, 'Should not exceed max 2.0');

  // At lower boundary
  const atMin = handleKeyboardNavigation(-2.0, 'ArrowLeft', false, range, subdivisions);
  assert.equal(atMin.handled, true);
  assert.equal(atMin.value, -2.0, 'Should not decrement below min -2.0');

  // Approaching boundary: from 1.875 + coarse 0.25 clamps cleanly to 2.0
  const nearMax = handleKeyboardNavigation(1.875, 'ArrowRight', false, range, subdivisions);
  assert.equal(nearMax.value, 2.0);
});

test('NL.4.4: Home and End keys jump immediately to min and max', () => {
  const range = [-2, 2];
  const subdivisions = 4;

  const home = handleKeyboardNavigation(0.5, 'Home', false, range, subdivisions);
  assert.equal(home.handled, true);
  assert.equal(home.value, -2.0);

  const end = handleKeyboardNavigation(-0.5, 'End', false, range, subdivisions);
  assert.equal(end.handled, true);
  assert.equal(end.value, 2.0);
});

test('NL.4.5: Event propagation contract stops bubbling to protect parent container (T3.01)', () => {
  let propagationStopped = false;
  let defaultPrevented = false;

  const mockEvent = {
    key: 'ArrowRight',
    shiftKey: false,
    stopPropagation() {
      propagationStopped = true;
    },
    preventDefault() {
      defaultPrevented = true;
    },
  };

  // Execute keyboard navigation with event
  const result = handleKeyboardNavigation(0, mockEvent.key, mockEvent.shiftKey, [-2, 2], 4);
  assert.equal(result.handled, true);
  assert.equal(result.value, 0.25);

  // In component event listener, handled arrow navigation must call stopPropagation
  mockEvent.stopPropagation();
  mockEvent.preventDefault();
  assert.ok(propagationStopped, 'stopPropagation must be invoked to isolate from LessonPlayer');
  assert.ok(defaultPrevented, 'preventDefault must be invoked');
});

// ============================================================================
// GROUP 5: Predict-then-Verify Evaluation (F-15, E-10, E-11)
// ============================================================================

test('NL.5.1: Exact target placement evaluates as correct with 0 diff', () => {
  const targets = [-1.5, -0.75, 0.0, 0.25, 1.25];

  for (const t of targets) {
    const res = verifyNumberLinePlacement(t, t);
    assert.equal(res.correct, true);
    assert.equal(res.placedValue, t);
    assert.equal(res.targetValue, t);
    assert.equal(res.diff, 0);
    assert.equal(res.canVerify, true);
  }
});

test('NL.5.2: Placements within ±0.005 tolerance evaluate as correct', () => {
  const target = 0.5;

  // Diff = 0.004 <= 0.005 -> correct
  const res1 = verifyNumberLinePlacement(0.504, target);
  assert.equal(res1.correct, true);
  assert.equal(res1.diff, 0.004);

  // Negative side: diff = 0.003 <= 0.005 -> correct
  const res2 = verifyNumberLinePlacement(0.497, target);
  assert.equal(res2.correct, true);
  assert.equal(res2.diff, 0.003);

  // Exact boundary: diff = 0.005 <= 0.005 -> correct
  const resBoundary = verifyNumberLinePlacement(0.505, target);
  assert.equal(resBoundary.correct, true);
  assert.equal(resBoundary.diff, 0.005);
});

test('NL.5.3: Placements outside ±0.005 tolerance evaluate as incorrect', () => {
  const target = -0.75; // -3/4

  // Diff = 0.006 > 0.005 -> incorrect
  const res1 = verifyNumberLinePlacement(-0.744, target);
  assert.equal(res1.correct, false);
  assert.equal(res1.diff, 0.006);

  // Unmoved origin default (0.0) against target -0.75 (E-11)
  const resDefault = verifyNumberLinePlacement(0.0, target);
  assert.equal(resDefault.correct, false);
  assert.equal(resDefault.diff, 0.75);

  // Opposite sign: placed +0.5 vs target -0.5
  const resSign = verifyNumberLinePlacement(0.5, -0.5);
  assert.equal(resSign.correct, false);
  assert.equal(resSign.diff, 1.0);
});

test('NL.5.4: Free exploration mode handles null targetValue gracefully', () => {
  const res = verifyNumberLinePlacement(0.5, null);
  assert.equal(res.correct, false);
  assert.equal(res.targetValue, null);
  assert.equal(res.canVerify, false);
});

// ============================================================================
// GROUP 6: Zoom Dynamics & Subdivision Density (F-16, E-12)
// ============================================================================

test('NL.6.1: Zoom in doubles subdivisions up to max ceiling 16', () => {
  // From 4 -> 8
  const z1 = calculateZoom(4, 'in', 1, 16);
  assert.equal(z1.subdivisions, 8);
  assert.equal(z1.canZoomIn, true);

  // From 8 -> 16
  const z2 = calculateZoom(8, 'in', 1, 16);
  assert.equal(z2.subdivisions, 16);
  assert.equal(z2.canZoomIn, false, 'canZoomIn must be false when at max 16');

  // At 16, further zoom in stays at 16 (E-12)
  const z3 = calculateZoom(16, 'in', 1, 16);
  assert.equal(z3.subdivisions, 16);
  assert.equal(z3.canZoomIn, false);
});

test('NL.6.2: Zoom out halves subdivisions down to min floor 1', () => {
  // From 16 -> 8 -> 4 -> 2 -> 1
  const z8 = calculateZoom(16, 'out', 1, 16);
  assert.equal(z8.subdivisions, 8);

  const z4 = calculateZoom(8, 'out', 1, 16);
  assert.equal(z4.subdivisions, 4);

  const z2 = calculateZoom(4, 'out', 1, 16);
  assert.equal(z2.subdivisions, 2);

  const z1 = calculateZoom(2, 'out', 1, 16);
  assert.equal(z1.subdivisions, 1);
  assert.equal(z1.canZoomOut, false, 'canZoomOut must be false when at min 1');

  // At 1, further zoom out stays at 1
  const zFloor = calculateZoom(1, 'out', 1, 16);
  assert.equal(zFloor.subdivisions, 1);
  assert.equal(zFloor.canZoomOut, false);
});

// ============================================================================
// GROUP 7: Reset Behavior & State Restoration (F-17)
// ============================================================================

test('NL.7.1: Reset restores point to default origin (0) and clears feedback', () => {
  const initial = getInitialNumberLineState({ range: [-2, 2], subdivisions: 4 });
  assert.equal(initial.placedValue, 0);
  assert.equal(initial.isVerified, false);
  assert.equal(initial.verificationResult, null);
  assert.equal(initial.subdivisions, 4);

  // Resetting restores initial baseline
  const resetState = getInitialNumberLineState({ range: [-2, 2], subdivisions: 4 });
  assert.equal(resetState.placedValue, 0);
  assert.equal(resetState.isVerified, false);
  assert.equal(resetState.verificationResult, null);
  assert.equal(resetState.subdivisions, 4);
});

test('NL.7.2: Reset defaults to min boundary if 0 is not within range', () => {
  // For positive range [1, 5], origin is 1
  const posRange = getInitialNumberLineState({ range: [1, 5], subdivisions: 2 });
  assert.equal(posRange.placedValue, 1);

  // For negative range [-5, -1], origin is -5
  const negRange = getInitialNumberLineState({ range: [-5, -1], subdivisions: 2 });
  assert.equal(negRange.placedValue, -5);
});

// ============================================================================
// GROUP 8: Accessibility & ARIA Slider Contract (F-18)
// ============================================================================

test('NL.8.1: ARIA slider attributes adhere to WAI-ARIA slider specifications', () => {
  const ariaProps = getNumberLineAriaProps(-0.75, [-2, 2], 'Number line position');

  assert.equal(ariaProps.role, 'slider');
  assert.equal(ariaProps['aria-valuemin'], -2);
  assert.equal(ariaProps['aria-valuemax'], 2);
  assert.equal(ariaProps['aria-valuenow'], -0.75);
  assert.equal(ariaProps['aria-valuetext'], '-3/4');
  assert.equal(ariaProps['aria-label'], 'Number line position');
  assert.equal(ariaProps.tabIndex, 0);
});

test('NL.8.2: Human-readable fraction formatting for aria-valuetext', () => {
  // Integers
  assert.equal(formatValueAsFraction(0), '0');
  assert.equal(formatValueAsFraction(1), '1');
  assert.equal(formatValueAsFraction(-2), '-2');

  // Simple proper fractions
  assert.equal(formatValueAsFraction(0.5), '1/2');
  assert.equal(formatValueAsFraction(-0.5), '-1/2');
  assert.equal(formatValueAsFraction(0.25), '1/4');
  assert.equal(formatValueAsFraction(-0.25), '-1/4');
  assert.equal(formatValueAsFraction(0.75), '3/4');
  assert.equal(formatValueAsFraction(-0.75), '-3/4');

  // Mixed numbers
  assert.equal(formatValueAsFraction(1.5), '1 1/2');
  assert.equal(formatValueAsFraction(-1.25), '-1 1/4');
  assert.equal(formatValueAsFraction(1.75), '1 3/4');

  // Thirds
  assert.equal(formatValueAsFraction(0.333333), '1/3');
  assert.equal(formatValueAsFraction(-0.666667), '-2/3');
});

// ============================================================================
// GROUP 9: Signed Number and Fraction Representation (F-14)
// ============================================================================

test('NL.9.1: Signed fractions and decimals maintain numeric consistency', () => {
  const fractions = [
    { text: '-3/4', num: -0.75 },
    { text: '-1/2', num: -0.5 },
    { text: '-1/4', num: -0.25 },
    { text: '0', num: 0 },
    { text: '1/4', num: 0.25 },
    { text: '1/2', num: 0.5 },
    { text: '3/4', num: 0.75 },
  ];

  for (const { text, num } of fractions) {
    assert.equal(formatValueAsFraction(num), text);
  }

  // Strictly increasing order check
  for (let i = 0; i < fractions.length - 1; i++) {
    assert.ok(fractions[i].num < fractions[i + 1].num, `${fractions[i].num} must be less than ${fractions[i + 1].num}`);
  }
});

// ============================================================================
// GROUP 10: Component Configuration & Embedded/Standalone Mode (F-19)
// ============================================================================

test('NL.10.1: Props resolution sets robust defaults when omitted', () => {
  const config = resolveNumberLineConfig({});

  assert.deepEqual(config.range, [-2, 2]);
  assert.equal(config.subdivisions, 4);
  assert.equal(config.targetValue, null);
  assert.equal(config.embedded, false);
  assert.equal(config.tolerance, 0.005);
  assert.ok(config.prompt);
});

test('NL.10.2: Embedded configuration preserves custom range and compact mode', () => {
  const embeddedProps = {
    range: [-1, 1],
    subdivisions: 6,
    targetValue: 0.5,
    embedded: true,
    prompt: 'Place the marker at 1/2',
  };

  const config = resolveNumberLineConfig(embeddedProps);
  assert.deepEqual(config.range, [-1, 1]);
  assert.equal(config.subdivisions, 6);
  assert.equal(config.targetValue, 0.5);
  assert.equal(config.embedded, true);
  assert.equal(config.prompt, 'Place the marker at 1/2');
});
