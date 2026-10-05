/**
 * tests/m2-challenger-math.test.js
 *
 * EMPIRICAL ADVERSARIAL STRESS TEST SUITE for Milestone 2 Number Line Lab.
 * Challenger: m2_challenger_1 (Updated with resolved assertions by m2_explorer_3_iter2)
 *
 * Coverage:
 * 1. Extreme ranges: [-100, 100], [-0.01, 0.01], [5, 10], [10, -5], [0, 0]
 * 2. Extreme subdivisions: 1, 2, 3, 5, 7, 16, 32, 0, -1, NaN
 * 3. Snapping precision on 10,000 random floating point numbers
 * 4. Tolerance boundaries (±0.005 acceptance vs 0.005001+ rejection)
 * 5. Adversarial defect resolution (formatting -0, zoom in on 0/negatives, out-of-range ticks)
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
  calculateZoomSubdivisions,
  valueToPercent,
  percentToValue,
  gcd,
  formatValueAsFraction,
  getNumberLineAriaProps,
  resolveNumberLineConfig,
  getInitialNumberLineState,
} from '../src/utils/numberLine.js';

// Seeded deterministic pseudo-random number generator (Mulberry32)
function createPrng(seed = 133742) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// 1. EXTREME RANGES
// ============================================================================

test('CHALLENGE 1.1: Extreme Large Range [-100, 100] with 4 subdivisions', () => {
  const range = [-100, 100];
  const subdivisions = 4;
  const ticks = calculateNumberLineTicks(range, subdivisions);

  // 200 units * 4 parts + 1 = 801 ticks
  assert.equal(ticks.length, 801, 'Should generate exactly 801 ticks');
  assert.equal(ticks[0].value, -100);
  assert.equal(ticks[800].value, 100);

  // Center tick must be exactly 0
  assert.equal(ticks[400].value, 0);
  assert.equal(ticks[400].positionPct, 50);

  // Verify exactly 201 major ticks (integers -100 to 100 inclusive)
  const majorTicks = ticks.filter((t) => t.isMajor);
  assert.equal(majorTicks.length, 201);
  assert.equal(majorTicks[0].label, '-100');
  assert.equal(majorTicks[200].label, '100');

  // Snapping across large range
  assert.equal(snapToTick(-105, range, subdivisions), -100);
  assert.equal(snapToTick(105, range, subdivisions), 100);
  assert.equal(snapToTick(-50.12, range, subdivisions), -50.0);
  assert.equal(snapToTick(-50.13, range, subdivisions), -50.25);
  assert.equal(snapToTick(75.38, range, subdivisions), 75.5);

  // Percentage conversion
  assert.equal(valueToPercent(-100, range), 0);
  assert.equal(valueToPercent(0, range), 50);
  assert.equal(valueToPercent(100, range), 100);
});

test('CHALLENGE 1.2: Micro Range [-0.01, 0.01] handles small domain safely', () => {
  const range = [-0.01, 0.01];

  // With standard 4 subdivisions per integer, totalSteps = round(0.02 * 4) = 0
  const ticks4 = calculateNumberLineTicks(range, 4);
  assert.ok(ticks4.length >= 1, 'Should generate at least 1 tick');
  assert.equal(ticks4[0].value, -0.01);
  assert.equal(ticks4[0].positionPct, 0);

  // Snapping with 4 subdivisions safely clamps within [-0.01, 0.01]
  const snapped = snapToTick(0.005, range, 4);
  assert.ok(snapped >= -0.01 && snapped <= 0.01);

  // With high subdivision density (subdivisions = 100, step = 0.01)
  const ticks100 = calculateNumberLineTicks(range, 100);
  // totalSteps = round(0.02 * 100) = 2 -> 3 ticks: -0.01, 0, 0.01
  assert.equal(ticks100.length, 3);
  assert.equal(ticks100[0].value, -0.01);
  assert.equal(ticks100[1].value, 0);
  assert.equal(ticks100[2].value, 0.01);

  // Verify coordinates
  assert.equal(valueToPercent(-0.01, range), 0);
  assert.equal(valueToPercent(0, range), 50);
  assert.equal(valueToPercent(0.01, range), 100);
});

test('CHALLENGE 1.3: Purely Positive Range [5, 10] without zero origin', () => {
  const range = [5, 10];
  const subdivisions = 2; // halves
  const ticks = calculateNumberLineTicks(range, subdivisions);

  // 5 units * 2 = 10 steps -> 11 ticks
  assert.equal(ticks.length, 11);
  assert.equal(ticks[0].value, 5.0);
  assert.equal(ticks[10].value, 10.0);

  // Zero is NOT in range; origin defaults to min (5)
  const initState = getInitialNumberLineState({ range, subdivisions });
  assert.equal(initState.placedValue, 5, 'Initial value must default to min boundary when 0 is out of range');

  // Snapping clamps outside values
  assert.equal(snapToTick(0, range, subdivisions), 5.0);
  assert.equal(snapToTick(4.9, range, subdivisions), 5.0);
  assert.equal(snapToTick(7.24, range, subdivisions), 7.0);
  assert.equal(snapToTick(7.26, range, subdivisions), 7.5);
  assert.equal(snapToTick(15, range, subdivisions), 10.0);

  // Coordinate recovery
  for (let v = 5; v <= 10; v += 0.5) {
    const pct = valueToPercent(v, range);
    const recovered = percentToValue(pct, range);
    assert.equal(recovered, v);
  }
});

test('CHALLENGE 1.4: Inverted Range [10, -5] normalizes gracefully to [-5, 10]', () => {
  const range = [10, -5];
  const subdivisions = 2;
  const ticks = calculateNumberLineTicks(range, subdivisions);

  // Range width = 15 units * 2 = 30 steps -> 31 ticks
  assert.equal(ticks.length, 31);
  assert.equal(ticks[0].value, -5);
  assert.equal(ticks[30].value, 10);

  // Snapping respects normalized bounds
  assert.equal(snapToTick(-10, range, subdivisions), -5);
  assert.equal(snapToTick(20, range, subdivisions), 10);
  assert.equal(snapToTick(0, range, subdivisions), 0);
  assert.equal(snapToTick(2.4, range, subdivisions), 2.5);

  // Keyboard navigation on inverted range
  const nav = handleKeyboardNavigation(0, 'ArrowRight', false, range, subdivisions);
  assert.equal(nav.handled, true);
  assert.equal(nav.value, 0.5);
});

test('CHALLENGE 1.5: Single Point Range [0, 0] expands safely without divide-by-zero', () => {
  const range = [0, 0];
  const subdivisions = 4;

  // calculateNumberLineTicks expands [0, 0] to [-1, 1] to prevent zero division
  const ticks = calculateNumberLineTicks(range, subdivisions);
  assert.equal(ticks.length, 9);
  assert.equal(ticks[0].value, -1);
  assert.equal(ticks[8].value, 1);

  // snapToTick on [0, 0] clamps safely to 0
  assert.equal(snapToTick(0.5, [0, 0], subdivisions), 0);
  assert.equal(snapToTick(-0.5, [0, 0], subdivisions), 0);

  // valueToPercent on [0, 0] returns 50% without NaN
  assert.equal(valueToPercent(0, [0, 0]), 50);

  // percentToValue on [0, 0] returns 0
  assert.equal(percentToValue(50, [0, 0]), 0);
  assert.equal(percentToValue(100, [0, 0]), 0);
});

// ============================================================================
// 2. EXTREME SUBDIVISIONS
// ============================================================================

test('CHALLENGE 2.1: Subdivision Progression 1, 2, 3, 5, 7, 16, 32', () => {
  const range = [-1, 1]; // 2 units

  // 1: 2*1 + 1 = 3 ticks [-1, 0, 1]
  const t1 = calculateNumberLineTicks(range, 1);
  assert.equal(t1.length, 3);
  assert.deepEqual(t1.map((t) => t.value), [-1, 0, 1]);

  // 2: 2*2 + 1 = 5 ticks
  const t2 = calculateNumberLineTicks(range, 2);
  assert.equal(t2.length, 5);

  // 3: 2*3 + 1 = 7 ticks
  const t3 = calculateNumberLineTicks(range, 3);
  assert.equal(t3.length, 7);
  assert.equal(t3[1].value, -0.666667);
  assert.equal(t3[2].value, -0.333333);
  assert.equal(t3[3].value, 0);

  // 5: 2*5 + 1 = 11 ticks (step 0.2)
  const t5 = calculateNumberLineTicks(range, 5);
  assert.equal(t5.length, 11);
  assert.equal(t5[1].value, -0.8);
  assert.equal(t5[5].value, 0);

  // 7: 2*7 + 1 = 15 ticks
  const t7 = calculateNumberLineTicks(range, 7);
  assert.equal(t7.length, 15);
  assert.equal(t7[7].value, 0);

  // 16: 2*16 + 1 = 33 ticks (step 0.0625)
  const t16 = calculateNumberLineTicks(range, 16);
  assert.equal(t16.length, 33);
  assert.equal(t16[1].value, -0.9375);

  // 32: 2*32 + 1 = 65 ticks (step 0.03125)
  const t32 = calculateNumberLineTicks(range, 32);
  assert.equal(t32.length, 65);
  assert.equal(t32[1].value, -0.96875);
});

test('CHALLENGE 2.2: Hostile Subdivisions 0, -1, NaN fallback safely to 1', () => {
  const range = [-1, 1];

  // 0 -> safe fallback to 1 (step = 1.0)
  const t0 = calculateNumberLineTicks(range, 0);
  assert.equal(t0.length, 3);
  assert.deepEqual(t0.map((t) => t.value), [-1, 0, 1]);
  assert.equal(snapToTick(0.4, range, 0), 0);
  assert.equal(snapToTick(0.6, range, 1), 1);

  // -1 -> safe fallback to 1
  const tNeg = calculateNumberLineTicks(range, -1);
  assert.equal(tNeg.length, 3);
  assert.deepEqual(tNeg.map((t) => t.value), [-1, 0, 1]);
  assert.equal(snapToTick(-0.4, range, -1), 0);
  assert.equal(snapToTick(-0.6, range, -1), -1);

  // NaN -> safe fallback to 1
  const tNaN = calculateNumberLineTicks(range, NaN);
  assert.equal(tNaN.length, 3);
  assert.deepEqual(tNaN.map((t) => t.value), [-1, 0, 1]);
  assert.equal(snapToTick(0.2, range, NaN), 0);

  // Keyboard step with hostile subdivisions
  assert.equal(calculateKeyboardStep('ArrowRight', false, 0), 1);
  assert.equal(calculateKeyboardStep('ArrowRight', false, -1), 1);
  assert.equal(calculateKeyboardStep('ArrowRight', false, NaN), 1);
});

// ============================================================================
// 3. SNAPPING PRECISION ON 10,000 RANDOM FLOATING POINT NUMBERS
// ============================================================================

test('CHALLENGE 3.1: 10,000 Random Float Snapping Stress Test across diverse domains', () => {
  const prng = createPrng(987654321);

  const testConfigs = [
    { range: [-2, 2], subdivisions: 4, domain: [-5, 5], count: 2500 },
    { range: [-5, 5], subdivisions: 3, domain: [-10, 10], count: 2500 },
    { range: [-10, 10], subdivisions: 8, domain: [-20, 20], count: 2500 },
    { range: [5, 10], subdivisions: 16, domain: [0, 15], count: 2500 },
  ];

  let totalTested = 0;

  for (const cfg of testConfigs) {
    const { range, subdivisions, domain, count } = cfg;
    const ticks = calculateNumberLineTicks(range, subdivisions);
    const tickValues = new Set(ticks.map((t) => t.value));

    for (let i = 0; i < count; i++) {
      const rand = domain[0] + prng() * (domain[1] - domain[0]);
      const snapped = snapToTick(rand, range, subdivisions);

      // Invariant 1: Snapped point must be within [min, max]
      assert.ok(
        snapped >= range[0] && snapped <= range[1],
        `Snapped ${snapped} must be within [${range[0]}, ${range[1]}] for input ${rand}`
      );

      // Invariant 2: Snapped point must NEVER be -0
      assert.equal(
        Object.is(snapped, -0),
        false,
        `Snapped point ${snapped} must not be negative zero -0 for input ${rand}`
      );

      // Invariant 3: Snapped point must match a valid calculated tick value (within 1e-5)
      const foundMatch = tickValues.has(snapped) || ticks.some((t) => Math.abs(t.value - snapped) < 1e-5);
      assert.ok(
        foundMatch,
        `Snapped value ${snapped} from input ${rand} must be an exact tick on range [${range[0]}, ${range[1]}] with subdivisions ${subdivisions}`
      );

      totalTested++;
    }
  }

  assert.equal(totalTested, 10000, 'Must complete exactly 10,000 random floating point snaps');
});

test('CHALLENGE 3.2: Snapping Monotonicity: for any x1 <= x2, snapToTick(x1) <= snapToTick(x2)', () => {
  const prng = createPrng(11223344);
  const range = [-3, 3];
  const subdivisions = 4;

  let prevX = -10;
  let prevSnapped = snapToTick(prevX, range, subdivisions);

  // Generate 1,000 sorted random points
  const points = [];
  for (let i = 0; i < 1000; i++) {
    points.push(-5 + prng() * 10);
  }
  points.sort((a, b) => a - b);

  for (const x of points) {
    const snapped = snapToTick(x, range, subdivisions);
    assert.ok(
      snapped >= prevSnapped,
      `Monotonicity violation: for ${prevX} <= ${x}, snapped ${prevSnapped} > ${snapped}`
    );
    prevX = x;
    prevSnapped = snapped;
  }
});

// ============================================================================
// 4. TOLERANCE BOUNDARIES (±0.005)
// ============================================================================

test('CHALLENGE 4.1: Tolerance Acceptance at and inside boundary (diff <= 0.005)', () => {
  const targets = [-2.0, -0.75, 0.0, 0.333333, 1.5, 99.0];

  for (const target of targets) {
    // Exact match
    const exact = verifyNumberLinePlacement(target, target, 0.005);
    assert.equal(exact.correct, true);
    assert.equal(exact.diff, 0);

    // Exact +0.005 upper tolerance boundary
    const upperBoundary = verifyNumberLinePlacement(Number((target + 0.005).toFixed(6)), target, 0.005);
    assert.equal(upperBoundary.correct, true, `Target ${target} at +0.005 boundary must be accepted`);
    assert.equal(upperBoundary.diff, 0.005);

    // Exact -0.005 lower tolerance boundary
    const lowerBoundary = verifyNumberLinePlacement(Number((target - 0.005).toFixed(6)), target, 0.005);
    assert.equal(lowerBoundary.correct, true, `Target ${target} at -0.005 boundary must be accepted`);
    assert.equal(lowerBoundary.diff, 0.005);

    // Inside tolerance: diff = 0.004999
    const inside = verifyNumberLinePlacement(Number((target + 0.004999).toFixed(6)), target, 0.005);
    assert.equal(inside.correct, true, `Target ${target} with diff 0.004999 must be accepted`);
  }
});

test('CHALLENGE 4.2: Tolerance Rejection at and beyond 0.005001+ (diff > 0.005)', () => {
  const targets = [-2.0, -0.75, 0.0, 0.333333, 1.5, 99.0];

  for (const target of targets) {
    // Exact +0.005001 upper rejection boundary
    const upperReject = verifyNumberLinePlacement(Number((target + 0.005001).toFixed(6)), target, 0.005);
    assert.equal(upperReject.correct, false, `Target ${target} at +0.005001 must be rejected`);
    assert.equal(upperReject.diff, 0.005001);

    // Exact -0.005001 lower rejection boundary
    const lowerReject = verifyNumberLinePlacement(Number((target - 0.005001).toFixed(6)), target, 0.005);
    assert.equal(lowerReject.correct, false, `Target ${target} at -0.005001 must be rejected`);
    assert.equal(lowerReject.diff, 0.005001);

    // Obvious out-of-tolerance values
    const farUpper = verifyNumberLinePlacement(target + 0.01, target, 0.005);
    assert.equal(farUpper.correct, false);
    const farLower = verifyNumberLinePlacement(target - 0.01, target, 0.005);
    assert.equal(farLower.correct, false);
  }
});

test('CHALLENGE 4.3: Fine Micro-Sweep across tolerance boundary [0.004990 to 0.005010]', () => {
  const target = 0.0;

  // Step by 0.000001 (1e-6) from 0.004990 to 0.005010
  for (let micro = 4990; micro <= 5010; micro++) {
    const diff = Number((micro / 1000000).toFixed(6));
    const placed = diff; // target is 0.0
    const res = verifyNumberLinePlacement(placed, target, 0.005);

    if (diff <= 0.005000) {
      assert.equal(
        res.correct,
        true,
        `Diff ${diff} <= 0.005000 must be ACCEPTED, got diff=${res.diff}, correct=${res.correct}`
      );
    } else {
      assert.equal(
        res.correct,
        false,
        `Diff ${diff} > 0.005000 must be REJECTED, got diff=${res.diff}, correct=${res.correct}`
      );
    }
  }
});

// ============================================================================
// 5. ADVERSARIAL DEFECT DETECTION & FAILURE MODES (RESOLVED ASSERTONS)
// ============================================================================

test('CHALLENGE 5.1 [RESOLVED]: formatValueAsFraction normalizes small negative numbers to "0"', () => {
  const formatted = formatValueAsFraction(-0.01, 4);
  assert.equal(formatted, '0', 'Small negative fraction rounding to 0 must return "0", never "-0"');
  assert.notEqual(formatted, '-0', 'Must not return negative zero string');
  assert.equal(formatValueAsFraction(-0.0001, 16), '0');
  assert.equal(formatValueAsFraction(-0.1, 2), '0');
});

test('CHALLENGE 5.2 [RESOLVED]: formatValueAsFraction carries over improper fraction to next integer', () => {
  const formatted = formatValueAsFraction(1.999, 4);
  assert.equal(formatted, '2', 'Fraction rounding to whole unit must carry over to 2 instead of "1 1/1"');
  assert.notEqual(formatted, '1 1/1', 'Must never return unreduced improper mixed number "1 1/1"');
  assert.equal(formatValueAsFraction(0.999, 4), '1');
  assert.equal(formatValueAsFraction(-1.999, 4), '-2');
  assert.equal(formatValueAsFraction(-0.999, 4), '-1');
});

test('CHALLENGE 5.3 [RESOLVED]: calculateZoom safely escapes zoom 0 on zoom in', () => {
  const zoomInFromZero = calculateZoom(0, 'in', 1, 16);
  assert.ok(
    zoomInFromZero.subdivisions >= 1,
    `calculateZoom(0, "in") must escape 0 and clamp to at least minSubdivisions 1, got ${zoomInFromZero.subdivisions}`
  );
  assert.equal(zoomInFromZero.subdivisions, 2);
  assert.equal(zoomInFromZero.canZoomOut, true);
});

test('CHALLENGE 5.4 [RESOLVED]: calculateNumberLineTicks filters ticks exceeding max for unaligned boundaries', () => {
  // If range boundaries are not multiples of step (e.g. [0, 1.2] with subdivisions = 4, step = 0.25)
  const ticks = calculateNumberLineTicks([0, 1.2], 4);
  const lastTick = ticks[ticks.length - 1];

  assert.ok(
    lastTick.value <= 1.2,
    `Last tick value ${lastTick.value} must not exceed axis max 1.2`
  );
  assert.equal(lastTick.value, 1.0);
  assert.ok(ticks.every((t) => t.value <= 1.2 + 1e-6));
});

test('CHALLENGE 5.5: Keyboard navigation Shift+Arrow fine steps survive 100 consecutive strokes', () => {
  const range = [-2, 2];
  const subdivisions = 4;
  let val = 0.0;

  // Move right 100 times with Shift
  for (let i = 0; i < 100; i++) {
    const res = handleKeyboardNavigation(val, 'ArrowRight', true, range, subdivisions);
    assert.equal(res.handled, true);
    assert.ok(res.value >= val, 'Must be monotonically increasing');
    val = res.value;
  }
  assert.equal(val, 2.0, 'Must clamp cleanly at max bound 2.0');

  // Move left 100 times with Shift
  for (let i = 0; i < 100; i++) {
    const res = handleKeyboardNavigation(val, 'ArrowLeft', true, range, subdivisions);
    assert.equal(res.handled, true);
    assert.ok(res.value <= val, 'Must be monotonically decreasing');
    val = res.value;
  }
  assert.equal(val, -2.0, 'Must clamp cleanly at min bound -2.0');
});

test('CHALLENGE 5.6 [ADVERSARIAL STRESS]: Defect 1 exhaustive negative zero sweep across denominators', () => {
  // Test 1,000 small negative numbers across various maxDenominator settings
  const prng = createPrng(54321);
  const denominators = [1, 2, 3, 4, 5, 6, 8, 12, 16];

  for (const den of denominators) {
    // Exact zero representations
    assert.equal(formatValueAsFraction(0, den), '0');
    assert.equal(formatValueAsFraction(-0, den), '0');

    // Values in [-0.1, -1e-12]
    for (let i = 0; i < 100; i++) {
      const exponent = 1 + prng() * 11; // 10^-1 to 10^-12
      const val = -Math.pow(10, -exponent);
      const formatted = formatValueAsFraction(val, den);

      // Must NEVER contain "-0"
      assert.notEqual(formatted, '-0', `Input ${val} with den ${den} produced "-0"`);
      assert.ok(!formatted.startsWith('-0/'), `Input ${val} with den ${den} produced negative zero fraction: ${formatted}`);
      if (formatted.startsWith('-0 ')) {
        assert.fail(`Input ${val} with den ${den} produced mixed number starting with -0: ${formatted}`);
      }
    }
  }
});

test('CHALLENGE 5.7 [ADVERSARIAL STRESS]: Defect 2 exhaustive improper fraction carryover sweep', () => {
  // Test numbers extremely close to integer boundaries across positive and negative domains
  const integers = [-10, -5, -2, -1, 0, 1, 2, 5, 10];
  const denominators = [1, 2, 3, 4, 8, 16];

  for (const int of integers) {
    for (const den of denominators) {
      // Just below integer: int - 1e-4, int - 1e-6
      for (const delta of [0.001, 0.0001, 0.00001, 0.000001]) {
        const val = int - delta;
        const formatted = formatValueAsFraction(val, den);

        // Must never have same numerator and denominator, e.g. "1/1", "2/2", "3/3", "4/4"
        for (let d = 1; d <= 16; d++) {
          assert.ok(!formatted.includes(`${d}/${d}`), `Value ${val} (near ${int}) with den ${den} produced unreduced fraction: ${formatted}`);
        }
      }
    }
  }

  // Specifically verify carryover outputs for 1.999, 0.999, -1.999, -0.999
  assert.equal(formatValueAsFraction(1.999, 4), '2');
  assert.equal(formatValueAsFraction(0.999, 4), '1');
  assert.equal(formatValueAsFraction(-1.999, 4), '-2');
  assert.equal(formatValueAsFraction(-0.999, 4), '-1');
  assert.equal(formatValueAsFraction(2.9999, 8), '3');
  assert.equal(formatValueAsFraction(-2.9999, 8), '-3');
});

test('CHALLENGE 5.8 [ADVERSARIAL STRESS]: Defect 3 exhaustive zoom from zero, negatives, and invalid states', () => {
  // Zoom in from 0 with diverse min/max settings
  for (let min = 1; min <= 4; min++) {
    for (let max = 8; max <= 32; max *= 2) {
      const zIn = calculateZoom(0, 'in', min, max);
      assert.ok(zIn.subdivisions >= min, `Zoom in from 0 with min=${min} must be >= min, got ${zIn.subdivisions}`);
      assert.ok(zIn.subdivisions <= max, `Zoom in from 0 with max=${max} must be <= max, got ${zIn.subdivisions}`);
      assert.equal(zIn.subdivisions, Math.min(max, min * 2));

      const zOut = calculateZoom(0, 'out', min, max);
      assert.equal(zOut.subdivisions, min, `Zoom out from 0 with min=${min} must be clamped to min`);
    }
  }

  // Zoom in from negative inputs
  const zNeg = calculateZoom(-4, 'in', 1, 16);
  assert.ok(zNeg.subdivisions >= 1, 'Zoom in from negative must not result in sub-min subdivisions');

  // Zoom in from NaN
  const zNaN = calculateZoom(NaN, 'in', 2, 16);
  assert.ok(zNaN.subdivisions >= 2, 'Zoom in from NaN must not crash and be >= min');
});

test('CHALLENGE 5.9 [ADVERSARIAL STRESS]: Defect 4 exhaustive unaligned range tick boundary clamp', () => {
  const prng = createPrng(887766);

  // 500 random unaligned ranges
  for (let iter = 0; iter < 500; iter++) {
    const rawMin = -20 + prng() * 40;
    const span = 0.5 + prng() * 15;
    const rawMax = rawMin + span;
    const subs = 1 + Math.floor(prng() * 16);

    const ticks = calculateNumberLineTicks([rawMin, rawMax], subs);

    // Every tick must be >= min - 1e-6 and <= max + 1e-6
    for (const t of ticks) {
      assert.ok(
        t.value >= Math.min(rawMin, rawMax) - 1e-6,
        `Tick ${t.value} below min bound ${rawMin}`
      );
      assert.ok(
        t.value <= Math.max(rawMin, rawMax) + 1e-6,
        `Tick ${t.value} strictly exceeds max bound ${rawMax}`
      );
    }

    // Ticks must be strictly monotonically increasing
    for (let i = 1; i < ticks.length; i++) {
      assert.ok(
        ticks[i].value > ticks[i - 1].value,
        `Ticks must be strictly increasing: tick[${i}]=${ticks[i].value} <= tick[${i-1}]=${ticks[i-1].value}`
      );
    }
  }
});

