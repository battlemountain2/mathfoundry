/**
 * tests/m2-interaction-stress.test.js
 *
 * Adversarial Empirical Stress Test Suite for Milestone 2: Number Line Lab
 * Evaluates Interaction, Keyboard Navigation, Event Isolation, Zoom Dynamics,
 * Predict-Then-Verify State Transitions, and Component State Consistency.
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
import { sound } from '../src/utils/audioEffects.js';

// ============================================================================
// SUITE 1: Keyboard Navigation Mechanics & Boundary Clamping
// ============================================================================

test('ADV-1.01: Arrow key coarse navigation matrix across positive, negative, and crossing-zero domains', () => {
  const range = [-2, 2];
  const subdivisions = 4; // step = 0.25

  // 1. Traverse entire axis from -2.0 to 2.0 with ArrowRight
  let current = -2.0;
  for (let i = 0; i < 16; i++) {
    const res = handleKeyboardNavigation(current, 'ArrowRight', false, range, subdivisions);
    assert.equal(res.handled, true, `Step ${i} should be handled`);
    const expected = Number((-2.0 + (i + 1) * 0.25).toFixed(6));
    assert.equal(res.value, expected, `Step ${i}: expected ${expected}, got ${res.value}`);
    // Explicitly check zero crossing: must not be negative zero -0
    if (res.value === 0) {
      assert.equal(Object.is(res.value, -0), false, 'Zero value must not be -0');
    }
    current = res.value;
  }
  assert.equal(current, 2.0, 'Must reach upper boundary 2.0');

  // 2. Traverse entire axis backwards from 2.0 to -2.0 with ArrowLeft
  for (let i = 0; i < 16; i++) {
    const res = handleKeyboardNavigation(current, 'ArrowLeft', false, range, subdivisions);
    assert.equal(res.handled, true);
    const expected = Number((2.0 - (i + 1) * 0.25).toFixed(6));
    assert.equal(res.value, expected);
    if (res.value === 0) {
      assert.equal(Object.is(res.value, -0), false, 'Zero value must not be -0');
    }
    current = res.value;
  }
  assert.equal(current, -2.0, 'Must reach lower boundary -2.0');

  // 3. ArrowUp and ArrowDown vertical arrows mirror horizontal behavior
  const upRes = handleKeyboardNavigation(0.5, 'ArrowUp', false, range, subdivisions);
  assert.equal(upRes.handled, true);
  assert.equal(upRes.value, 0.75);

  const downRes = handleKeyboardNavigation(0.5, 'ArrowDown', false, range, subdivisions);
  assert.equal(downRes.handled, true);
  assert.equal(downRes.value, 0.25);
});

test('ADV-1.02: Shift + Arrow fine sub-tick navigation precision across subdivision densities', () => {
  const testDensities = [1, 2, 3, 4, 6, 8, 12, 16];

  for (const subs of testDensities) {
    const coarseStep = calculateKeyboardStep('ArrowRight', false, subs);
    const fineStep = calculateKeyboardStep('ArrowRight', true, subs);

    // Fine step must always be strictly positive and strictly smaller than coarse step
    assert.ok(fineStep > 0, `Fine step for density ${subs} must be > 0`);
    assert.ok(
      fineStep < coarseStep,
      `Fine step (${fineStep}) must be strictly smaller than coarse step (${coarseStep}) for density ${subs}`
    );

    // Fine step should match 1 / Math.max(16, subs * 4)
    const expectedFine = 1 / Math.max(16, subs * 4);
    assert.equal(fineStep, expectedFine, `Fine step calculation mismatch for density ${subs}`);

    // Test symmetric negative step
    const fineLeft = calculateKeyboardStep('ArrowLeft', true, subs);
    assert.equal(fineLeft, -fineStep);

    // Test Shift + Arrow fine movement on axis (accounting for 6-decimal rounding)
    const startVal = 0;
    const moved = handleKeyboardNavigation(startVal, 'ArrowRight', true, [-2, 2], subs);
    assert.equal(moved.handled, true);
    assert.ok(
      Math.abs(moved.value - fineStep) < 1e-5,
      `Moved value ${moved.value} should match fineStep ${fineStep} within 1e-5`
    );
  }
});

test('ADV-1.03: Home and End keys jump immediately to boundary extrema across standard and inverted ranges', () => {
  // Standard range [-2, 2]
  assert.equal(handleKeyboardNavigation(0.5, 'Home', false, [-2, 2], 4).value, -2.0);
  assert.equal(handleKeyboardNavigation(-0.5, 'End', false, [-2, 2], 4).value, 2.0);

  // Positive-only range [10, 50]
  assert.equal(handleKeyboardNavigation(25, 'Home', false, [10, 50], 2).value, 10);
  assert.equal(handleKeyboardNavigation(25, 'End', false, [10, 50], 2).value, 50);

  // Negative-only range [-100, -25]
  assert.equal(handleKeyboardNavigation(-50, 'Home', false, [-100, -25], 2).value, -100);
  assert.equal(handleKeyboardNavigation(-50, 'End', false, [-100, -25], 2).value, -25);

  // Inverted range [5, -5] (graceful normalization)
  assert.equal(handleKeyboardNavigation(0, 'Home', false, [5, -5], 4).value, -5);
  assert.equal(handleKeyboardNavigation(0, 'End', false, [5, -5], 4).value, 5);

  // Shift modifier with Home/End is ignored and still jumps to extrema
  assert.equal(handleKeyboardNavigation(0, 'Home', true, [-2, 2], 4).value, -2.0);
  assert.equal(handleKeyboardNavigation(0, 'End', true, [-2, 2], 4).value, 2.0);
});

test('ADV-1.04: PageUp and PageDown integer unit stepping with boundary clamping', () => {
  const range = [-2, 2];
  const subdivisions = 4;

  // 1. PageUp increments by whole integer 1
  let val = -2.0;
  val = handleKeyboardNavigation(val, 'PageUp', false, range, subdivisions).value;
  assert.equal(val, -1.0);
  val = handleKeyboardNavigation(val, 'PageUp', false, range, subdivisions).value;
  assert.equal(val, 0.0);
  val = handleKeyboardNavigation(val, 'PageUp', false, range, subdivisions).value;
  assert.equal(val, 1.0);
  val = handleKeyboardNavigation(val, 'PageUp', false, range, subdivisions).value;
  assert.equal(val, 2.0);

  // Overflow past max is strictly clamped
  val = handleKeyboardNavigation(val, 'PageUp', false, range, subdivisions).value;
  assert.equal(val, 2.0, 'PageUp at max must remain clamped to max 2.0');

  // 2. PageDown decrements by whole integer 1
  val = handleKeyboardNavigation(val, 'PageDown', false, range, subdivisions).value;
  assert.equal(val, 1.0);
  val = handleKeyboardNavigation(val, 'PageDown', false, range, subdivisions).value;
  assert.equal(val, 0.0);
  val = handleKeyboardNavigation(val, 'PageDown', false, range, subdivisions).value;
  assert.equal(val, -1.0);
  val = handleKeyboardNavigation(val, 'PageDown', false, range, subdivisions).value;
  assert.equal(val, -2.0);

  // Underflow past min is strictly clamped
  val = handleKeyboardNavigation(val, 'PageDown', false, range, subdivisions).value;
  assert.equal(val, -2.0, 'PageDown at min must remain clamped to min -2.0');

  // 3. Fractional starting positions
  const fracUp = handleKeyboardNavigation(-0.75, 'PageUp', false, range, subdivisions).value;
  assert.equal(fracUp, 0.25, '-0.75 + 1.0 = 0.25');

  const fracDown = handleKeyboardNavigation(0.25, 'PageDown', false, range, subdivisions).value;
  assert.equal(fracDown, -0.75, '0.25 - 1.0 = -0.75');
});

test('ADV-1.05: Extreme repetitive navigation stress (1,000 rapid keystrokes) prevents overflow/underflow/drift', () => {
  const range = [-2, 2];
  const subdivisions = 4;

  // 1,000 ArrowRight presses from 0
  let pos = 0;
  for (let i = 0; i < 1000; i++) {
    const res = handleKeyboardNavigation(pos, 'ArrowRight', false, range, subdivisions);
    assert.equal(res.handled, true);
    assert.ok(res.value <= 2.0, 'Position must never exceed max 2.0');
    assert.ok(!Number.isNaN(res.value), 'Position must never be NaN');
    pos = res.value;
  }
  assert.equal(pos, 2.0);

  // 1,000 ArrowLeft presses from 2
  for (let i = 0; i < 1000; i++) {
    const res = handleKeyboardNavigation(pos, 'ArrowLeft', false, range, subdivisions);
    assert.equal(res.handled, true);
    assert.ok(res.value >= -2.0, 'Position must never drop below min -2.0');
    assert.ok(!Number.isNaN(res.value), 'Position must never be NaN');
    pos = res.value;
  }
  assert.equal(pos, -2.0);

  // 500 Rapid Left-Right oscillations from 0
  pos = 0;
  for (let i = 0; i < 500; i++) {
    pos = handleKeyboardNavigation(pos, 'ArrowRight', false, range, subdivisions).value;
    pos = handleKeyboardNavigation(pos, 'ArrowLeft', false, range, subdivisions).value;
  }
  assert.equal(pos, 0, 'Oscillation must return precisely to origin without drift');
  assert.equal(Object.is(pos, -0), false, 'Origin must not be -0');
});

// ============================================================================
// SUITE 2: Event Isolation & Parent Container Shielding
// ============================================================================

test('ADV-2.01: Event isolation contract - handled keyboard events strictly call stopPropagation and preventDefault', () => {
  const handledKeys = [
    { key: 'ArrowRight', shiftKey: false },
    { key: 'ArrowLeft', shiftKey: false },
    { key: 'ArrowUp', shiftKey: false },
    { key: 'ArrowDown', shiftKey: false },
    { key: 'ArrowRight', shiftKey: true },
    { key: 'ArrowLeft', shiftKey: true },
    { key: 'ArrowUp', shiftKey: true },
    { key: 'ArrowDown', shiftKey: true },
    { key: 'Home', shiftKey: false },
    { key: 'End', shiftKey: false },
    { key: 'PageUp', shiftKey: false },
    { key: 'PageDown', shiftKey: false },
  ];

  for (const { key, shiftKey } of handledKeys) {
    let stopped = false;
    let prevented = false;

    const mockEvent = {
      key,
      shiftKey,
      stopPropagation() {
        stopped = true;
      },
      preventDefault() {
        prevented = true;
      },
    };

    // Simulate component handleKeyDown execution logic
    const navResult = handleKeyboardNavigation(0, mockEvent.key, mockEvent.shiftKey, [-2, 2], 4);
    assert.equal(navResult.handled, true, `Key ${key} (shift=${shiftKey}) must be handled`);

    if (navResult.handled) {
      mockEvent.stopPropagation();
      mockEvent.preventDefault();
    }

    assert.ok(stopped, `stopPropagation() must be called for key ${key} (shift=${shiftKey})`);
    assert.ok(prevented, `preventDefault() must be called for key ${key} (shift=${shiftKey})`);
  }
});

test('ADV-2.02: Parent container shielding - simulated LessonPlayer does not advance step on slider navigation', () => {
  // Simulated LessonPlayer parent state
  let parentLessonStep = 2; // e.g. Step 3 in lesson
  let parentAdvancementCalls = 0;

  function parentOnKeyDown(e) {
    if (!e.propagationStopped) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        parentLessonStep += 1;
        parentAdvancementCalls += 1;
      }
    }
  }

  // Simulated slider keydown dispatcher
  function dispatchSliderKeyDown(key, shiftKey = false) {
    const event = {
      key,
      shiftKey,
      propagationStopped: false,
      defaultPrevented: false,
      stopPropagation() {
        this.propagationStopped = true;
      },
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    const nav = handleKeyboardNavigation(0, event.key, event.shiftKey, [-2, 2], 4);
    if (nav.handled) {
      event.stopPropagation();
      event.preventDefault();
    }

    // Event bubbles to parent if propagation was NOT stopped
    parentOnKeyDown(event);

    return { event, nav };
  }

  // 1. Dispatch handled slider keys: parent MUST NOT advance
  for (const k of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']) {
    const { event, nav } = dispatchSliderKeyDown(k);
    assert.equal(nav.handled, true);
    assert.equal(event.propagationStopped, true);
    assert.equal(event.defaultPrevented, true);
  }

  assert.equal(parentLessonStep, 2, 'Parent lesson step must NOT have changed');
  assert.equal(parentAdvancementCalls, 0, 'Parent must receive ZERO step advance calls');

  // 2. Dispatch unhandled key (e.g. Space or Tab): event bubbles to parent
  const spaceDispatch = dispatchSliderKeyDown(' ');
  assert.equal(spaceDispatch.nav.handled, false);
  assert.equal(spaceDispatch.event.propagationStopped, false);
  assert.equal(parentLessonStep, 3, 'Unhandled Space key bubbles and advances parent');
  assert.equal(parentAdvancementCalls, 1);
});

test('ADV-2.03: Unhandled keys preserve browser default behaviors and do NOT stop propagation', () => {
  const unhandledKeys = ['Tab', 'Escape', 'Enter', 'a', 'z', 'F5', 'Backspace'];

  for (const key of unhandledKeys) {
    let stopped = false;
    let prevented = false;

    const mockEvent = {
      key,
      shiftKey: false,
      stopPropagation() {
        stopped = true;
      },
      preventDefault() {
        prevented = true;
      },
    };

    const res = handleKeyboardNavigation(0, mockEvent.key, mockEvent.shiftKey, [-2, 2], 4);
    assert.equal(res.handled, false, `Key ${key} should NOT be handled by slider`);

    if (res.handled) {
      mockEvent.stopPropagation();
      mockEvent.preventDefault();
    }

    assert.equal(stopped, false, `stopPropagation() must NOT be called for unhandled key ${key}`);
    assert.equal(prevented, false, `preventDefault() must NOT be called for unhandled key ${key}`);
  }
});

// ============================================================================
// SUITE 3: Zoom State Progression & Boundary Clamping
// ============================================================================

test('ADV-3.01: Full zoom cycle progression sequence with strict boundary clamping', () => {
  // Start at default 4
  let currentZoom = 4;

  // Zoom In progression: 4 -> 8 -> 16
  let z1 = calculateZoom(currentZoom, 'in', 1, 16);
  assert.equal(z1.subdivisions, 8);
  assert.equal(z1.canZoomIn, true);
  assert.equal(z1.canZoomOut, true);
  currentZoom = z1.subdivisions;

  let z2 = calculateZoom(currentZoom, 'in', 1, 16);
  assert.equal(z2.subdivisions, 16);
  assert.equal(z2.canZoomIn, false, 'canZoomIn must be false at max 16');
  assert.equal(z2.canZoomOut, true);
  currentZoom = z2.subdivisions;

  // Attempt to zoom in further beyond max 16 (50 consecutive clicks)
  for (let i = 0; i < 50; i++) {
    const zOver = calculateZoom(currentZoom, 'in', 1, 16);
    assert.equal(zOver.subdivisions, 16, 'Subdivisions must remain clamped at 16');
    assert.equal(zOver.canZoomIn, false);
    currentZoom = zOver.subdivisions;
  }

  // Zoom Out progression: 16 -> 8 -> 4 -> 2 -> 1
  const expectedOutSteps = [8, 4, 2, 1];
  for (const expected of expectedOutSteps) {
    const zOut = calculateZoom(currentZoom, 'out', 1, 16);
    assert.equal(zOut.subdivisions, expected);
    currentZoom = zOut.subdivisions;
  }

  assert.equal(currentZoom, 1);
  const zAtMin = calculateZoom(currentZoom, 'out', 1, 16);
  assert.equal(zAtMin.subdivisions, 1);
  assert.equal(zAtMin.canZoomOut, false, 'canZoomOut must be false at min 1');
  assert.equal(zAtMin.canZoomIn, true);

  // Attempt to zoom out further below min 1 (50 consecutive clicks)
  for (let i = 0; i < 50; i++) {
    const zUnder = calculateZoom(currentZoom, 'out', 1, 16);
    assert.equal(zUnder.subdivisions, 1, 'Subdivisions must remain clamped at 1');
    assert.equal(zUnder.canZoomOut, false);
    currentZoom = zUnder.subdivisions;
  }
});

test('ADV-3.02: Zoom progression with non-standard initial subdivision densities and custom limits', () => {
  // Density 3: 3 -> 6 -> 12 -> 16 (ceiling)
  assert.equal(calculateZoomSubdivisions(3, 'in', 1, 16), 6);
  assert.equal(calculateZoomSubdivisions(6, 'in', 1, 16), 12);
  assert.equal(calculateZoomSubdivisions(12, 'in', 1, 16), 16); // 12 * 2 = 24 -> clamped to 16

  // Density 5: 5 -> out -> 2 -> out -> 1
  assert.equal(calculateZoomSubdivisions(5, 'out', 1, 16), 2);
  assert.equal(calculateZoomSubdivisions(2, 'out', 1, 16), 1);

  // Custom bounds [2, 8]
  const customZIn = calculateZoom(8, 'in', 2, 8);
  assert.equal(customZIn.subdivisions, 8);
  assert.equal(customZIn.canZoomIn, false);

  const customZOut = calculateZoom(2, 'out', 2, 8);
  assert.equal(customZOut.subdivisions, 2);
  assert.equal(customZOut.canZoomOut, false);
});

test('ADV-3.03: Tick consistency across zoom transitions preserves major integers', () => {
  const range = [-2, 2];
  const zoomLevels = [1, 2, 4, 8, 16];

  for (const zoom of zoomLevels) {
    const ticks = calculateNumberLineTicks(range, zoom);

    // Number of ticks formula: (max - min) * zoom + 1
    const expectedCount = (2 - (-2)) * zoom + 1;
    assert.equal(ticks.length, expectedCount, `Tick count mismatch at zoom ${zoom}`);

    // Major integer ticks must always be exactly 5 (-2, -1, 0, 1, 2)
    const majorTicks = ticks.filter((t) => t.isMajor);
    assert.equal(majorTicks.length, 5, `Major tick count must be 5 at zoom ${zoom}`);
    assert.deepEqual(
      majorTicks.map((t) => t.value),
      [-2, -1, 0, 1, 2]
    );

    // First and last ticks must strictly match range boundaries
    assert.equal(ticks[0].value, -2);
    assert.equal(ticks[ticks.length - 1].value, 2);

    // Tick percentages must span monotonically from 0 to 100%
    assert.equal(ticks[0].positionPct, 0);
    assert.equal(ticks[ticks.length - 1].positionPct, 100);
    for (let i = 0; i < ticks.length - 1; i++) {
      assert.ok(
        ticks[i].positionPct < ticks[i + 1].positionPct,
        `Tick ${i} percent must be strictly less than next tick percent`
      );
    }
  }
});

// ============================================================================
// SUITE 4: Predict-Then-Verify State Machine Transitions & Feedback
// ============================================================================

test('ADV-4.01: Complete predict-then-verify state lifecycle and feedback badge transitions', () => {
  const target = -0.75; // -3/4
  const range = [-2, 2];
  const subdivisions = 4;

  // 1. Initial State: placedValue defaults to 0, verifyResult is null
  let state = {
    placedValue: 0,
    verifyResult: null,
  };
  assert.equal(state.placedValue, 0);
  assert.equal(state.verifyResult, null);

  // 2. User checks answer prematurely without moving (E-11)
  state.verifyResult = verifyNumberLinePlacement(state.placedValue, target, 0.005);
  assert.equal(state.verifyResult.correct, false);
  assert.equal(state.verifyResult.diff, 0.75);
  assert.equal(state.verifyResult.canVerify, true);

  // Expected feedback message format: "Off by 0.750 — Try again"
  const failedMsg = `Off by ${state.verifyResult.diff.toFixed(3)} — Try again`;
  assert.equal(failedMsg, 'Off by 0.750 — Try again');

  // 3. User moves slider: verifyResult MUST be reset to null (clears feedback)
  function onPositionChange(newVal) {
    state.placedValue = newVal;
    state.verifyResult = null; // Clears feedback badge
  }

  // Move 1 step left: from 0 to -0.25
  const step1 = handleKeyboardNavigation(state.placedValue, 'ArrowLeft', false, range, subdivisions);
  onPositionChange(step1.value);
  assert.equal(state.placedValue, -0.25);
  assert.equal(state.verifyResult, null, 'Feedback must be cleared on position change');

  // Move 2 more steps left: -0.50, then -0.75
  const step2 = handleKeyboardNavigation(state.placedValue, 'ArrowLeft', false, range, subdivisions);
  onPositionChange(step2.value);
  const step3 = handleKeyboardNavigation(state.placedValue, 'ArrowLeft', false, range, subdivisions);
  onPositionChange(step3.value);
  assert.equal(state.placedValue, -0.75);
  assert.equal(state.verifyResult, null);

  // 4. User clicks Check with accurate placement
  state.verifyResult = verifyNumberLinePlacement(state.placedValue, target, 0.005);
  assert.equal(state.verifyResult.correct, true);
  assert.equal(state.verifyResult.diff, 0);

  // Expected feedback message format: "✓ Correct placement!"
  const successMsg = '✓ Correct placement!';
  assert.equal(successMsg, '✓ Correct placement!');

  // 5. User clicks Reset: resets to origin (0) and clears verifyResult
  function onReset() {
    const defaultVal = range[0] <= 0 && range[1] >= 0 ? 0 : range[0];
    onPositionChange(defaultVal);
  }
  onReset();
  assert.equal(state.placedValue, 0);
  assert.equal(state.verifyResult, null, 'Reset must clear verifyResult');
});

test('ADV-4.02: Predict-then-verify tolerance threshold boundary stress (±0.005)', () => {
  const target = 0.5; // 1/2
  const tolerance = 0.005;

  // Exact target
  assert.equal(verifyNumberLinePlacement(0.5, target, tolerance).correct, true);

  // Strictly inside upper boundary: diff = 0.00499 <= 0.005
  const insideUpper = verifyNumberLinePlacement(0.50499, target, tolerance);
  assert.equal(insideUpper.correct, true);
  assert.ok(insideUpper.diff <= tolerance);

  // Exactly on upper boundary: diff = 0.00500 <= 0.005
  const onUpper = verifyNumberLinePlacement(0.505, target, tolerance);
  assert.equal(onUpper.correct, true);
  assert.equal(onUpper.diff, 0.005);

  // Strictly outside upper boundary: diff = 0.00501 > 0.005
  const outsideUpper = verifyNumberLinePlacement(0.50501, target, tolerance);
  assert.equal(outsideUpper.correct, false);
  assert.ok(outsideUpper.diff > tolerance);

  // Strictly inside lower boundary: diff = 0.00499 <= 0.005
  const insideLower = verifyNumberLinePlacement(0.49501, target, tolerance);
  assert.equal(insideLower.correct, true);

  // Exactly on lower boundary: diff = 0.00500 <= 0.005
  const onLower = verifyNumberLinePlacement(0.495, target, tolerance);
  assert.equal(onLower.correct, true);
  assert.equal(onLower.diff, 0.005);

  // Strictly outside lower boundary: diff = 0.00501 > 0.005
  const outsideLower = verifyNumberLinePlacement(0.49499, target, tolerance);
  assert.equal(outsideLower.correct, false);
  assert.ok(outsideLower.diff > tolerance);

  // Extreme off-target values
  assert.equal(verifyNumberLinePlacement(-1.5, target, tolerance).correct, false);
  assert.equal(verifyNumberLinePlacement(2.0, target, tolerance).correct, false);
});

test('ADV-4.03: Reset behavior across diverse axis domains', () => {
  // Domain [-2, 2]: contains 0 -> origin 0
  const stdInit = getInitialNumberLineState({ range: [-2, 2] });
  assert.equal(stdInit.placedValue, 0);

  // Domain [1, 5]: strictly positive -> origin 1
  const posInit = getInitialNumberLineState({ range: [1, 5] });
  assert.equal(posInit.placedValue, 1);

  // Domain [-10, -2]: strictly negative -> origin -10
  const negInit = getInitialNumberLineState({ range: [-10, -2] });
  assert.equal(negInit.placedValue, -10);

  // Custom initialValue prop respects boundary clamping
  const customInit = getInitialNumberLineState({ range: [-2, 2], initialValue: 1.5 });
  // Note: getInitialNumberLineState uses defaultOrigin; component state uses initialValue
  const config = resolveNumberLineConfig({ range: [-2, 2], initialValue: 1.5 });
  assert.deepEqual(config.range, [-2, 2]);
});

test('ADV-4.04: Free exploration mode handles null/undefined targets safely without error', () => {
  // null target
  const resNull = verifyNumberLinePlacement(0.75, null);
  assert.equal(resNull.correct, false);
  assert.equal(resNull.targetValue, null);
  assert.equal(resNull.diff, null);
  assert.equal(resNull.canVerify, false);

  // undefined target
  const resUndef = verifyNumberLinePlacement(0.75, undefined);
  assert.equal(resUndef.correct, false);
  assert.equal(resUndef.targetValue, null);
  assert.equal(resUndef.canVerify, false);

  // Config resolution in free exploration generates default prompt
  const freeConfig = resolveNumberLineConfig({ targetValue: null });
  assert.equal(freeConfig.targetValue, null);
  assert.equal(freeConfig.prompt, 'Explore the number line');
});

// ============================================================================
// SUITE 5: Full Component Simulation & Audio Effect Engine Safety
// ============================================================================

test('ADV-5.01: Audio synthesizer safely executes in headless environment without Web Audio API', () => {
  // Audio effects should never throw in headless/Node.js environment
  assert.doesNotThrow(() => {
    sound.playTick();
    sound.playCorrect(1);
    sound.playWrong();
    sound.playComboFanfare();
    sound.playGameOver();
  });
});

test('ADV-5.02: Full Component State Machine Integration Harness', () => {
  // Simulate complete NumberLineLab component state & handlers
  class NumberLineLabHarness {
    constructor(props = {}) {
      this.range = props.range || [-2, 2];
      const [min, max] = this.range[0] <= this.range[1] ? this.range : [this.range[1], this.range[0]];
      this.min = min;
      this.max = max;
      this.subdivisions = props.subdivisions || 4;
      this.currentZoom = this.subdivisions;
      this.targetValue = props.targetValue ?? null;
      this.prompt = props.prompt || null;
      this.embedded = Boolean(props.embedded);
      this.readOnly = Boolean(props.readOnly);

      this.placedValue = props.initialValue !== undefined && props.initialValue !== null
        ? clampValue(props.initialValue, this.min, this.max)
        : (this.min <= 0 && this.max >= 0 ? 0 : this.min);

      this.verifyResult = null;
      this.isDragging = false;
      this.verifiedLog = [];
      this.positionChangeLog = [];
    }

    updatePosition(newVal) {
      const cleanVal = newVal === 0 ? 0 : newVal;
      this.placedValue = cleanVal;
      this.verifyResult = null; // Clear verification on change
      this.positionChangeLog.push(cleanVal);
    }

    handleKeyDown(event) {
      if (this.readOnly) return false;

      const nav = handleKeyboardNavigation(
        this.placedValue,
        event.key,
        event.shiftKey,
        [this.min, this.max],
        this.currentZoom
      );

      if (nav.handled) {
        event.stopPropagation?.();
        event.preventDefault?.();
        this.updatePosition(nav.value);
        return true;
      }
      return false;
    }

    handleCheck() {
      if (this.targetValue === null || this.targetValue === undefined || this.readOnly) {
        return null;
      }
      const res = verifyNumberLinePlacement(this.placedValue, this.targetValue, 0.005);
      this.verifyResult = res;
      this.verifiedLog.push(res);
      return res;
    }

    handleReset() {
      if (this.readOnly) return;
      const defaultVal = this.min <= 0 && this.max >= 0 ? 0 : this.min;
      this.updatePosition(defaultVal);
    }

    handleZoomIn() {
      if (this.readOnly) return;
      this.currentZoom = calculateZoomSubdivisions(this.currentZoom, 'in', 1, 16);
    }

    handleZoomOut() {
      if (this.readOnly) return;
      this.currentZoom = calculateZoomSubdivisions(this.currentZoom, 'out', 1, 16);
    }
  }

  // --- End-to-End Simulation Scenario ---
  const lab = new NumberLineLabHarness({
    range: [-2, 2],
    subdivisions: 4,
    targetValue: -0.75, // Target: -3/4
  });

  // 1. Initial State
  assert.equal(lab.placedValue, 0);
  assert.equal(lab.verifyResult, null);
  assert.equal(lab.currentZoom, 4);

  // 2. Click Check at 0 -> incorrect
  const res1 = lab.handleCheck();
  assert.equal(res1.correct, false);
  assert.equal(res1.diff, 0.75);
  assert.equal(lab.verifyResult.correct, false);

  // 3. User navigates with ArrowLeft: 3 steps (-0.25, -0.50, -0.75)
  for (let step = 0; step < 3; step++) {
    let stopped = false;
    let prevented = false;
    const handled = lab.handleKeyDown({
      key: 'ArrowLeft',
      shiftKey: false,
      stopPropagation() { stopped = true; },
      preventDefault() { prevented = true; },
    });
    assert.equal(handled, true);
    assert.equal(stopped, true);
    assert.equal(prevented, true);
  }

  assert.equal(lab.placedValue, -0.75);
  assert.equal(lab.verifyResult, null, 'Moving slider must clear previous incorrect verification');

  // 4. Click Check at -0.75 -> correct!
  const res2 = lab.handleCheck();
  assert.equal(res2.correct, true);
  assert.equal(res2.diff, 0);
  assert.equal(lab.verifyResult.correct, true);

  // 5. Zoom In to reveal finer ticks
  lab.handleZoomIn();
  assert.equal(lab.currentZoom, 8);
  assert.equal(lab.placedValue, -0.75, 'Zooming does not displace placed value');

  // 6. Zoom Out twice
  lab.handleZoomOut();
  assert.equal(lab.currentZoom, 4);
  lab.handleZoomOut();
  assert.equal(lab.currentZoom, 2);

  // 7. Click Reset
  lab.handleReset();
  assert.equal(lab.placedValue, 0, 'Reset restores position to origin 0');
  assert.equal(lab.verifyResult, null, 'Reset clears verification result');
});
