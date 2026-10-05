# MathFoundry Test Infrastructure (`TEST_INFRA.md`)

## 1. Overview & Testing Philosophy

MathFoundry uses a requirement-driven, opaque-box testing framework built strictly on Node.js's native test runner (`node:test`) and strict assertion library (`node:assert/strict`).

### Key Invariants
1. **Zero External Test Dependencies**: No Jest, Vitest, Mocha, or heavy browser automation frameworks. Native ES module resolution and sub-100ms execution times.
2. **Localhost Origin Safety**: Real learner data resides in `localStorage` at the localhost origin. The test harness isolates state with an in-memory `Map`-backed mock `localStorage` (`tests/e2e/setup.js`), guaranteeing zero data leakage, overwriting, or destruction.
3. **Mastery Evidence Isolation**: Verified formative lesson micro-checks (`micro-check`) are strictly prevented from writing to graded mastery records (`store.learningAttempts`).
4. **Progressive Testability**: Decoupled domain models and resilient module loaders ensure test suites validate specification contracts during milestone implementation and transition smoothly to live module testing upon completion.

---

## 2. Directory Layout & Test Suite Hierarchy

```
tests/
├── learning.test.js                  # Preserved baseline suite (13 unit/regression tests)
├── review-feedback.test.js           # Preserved review/repair suite (14 unit/regression tests)
└── e2e/                              # MathFoundry Phases 1–3 E2E Test Suite
    ├── setup.js                      # In-memory mock storage harness, contracts, DAG validator
    ├── tier1-features.test.js        # Tier 1: Feature coverage across F-01 to F-34
    ├── tier2-boundaries.test.js      # Tier 2: Boundary & corner cases across E-01 to E-20
    ├── tier3-interactions.test.js    # Tier 3: Pairwise & cross-feature interactions (T3.01–T3.08)
    └── tier4-workflows.test.js       # Tier 4: Real-world user workflows (T4.01–T4.05)
```

---

## 3. Test Execution Commands

| Target | Command | Description |
|---|---|---|
| **All E2E Tiers (1–4)** | `node --test tests/e2e/*.test.js` | Runs all 4 E2E tiers natively |
| **Tier 1 (Features)** | `node --test tests/e2e/tier1-features.test.js` | All 34 features (F-01 to F-34) |
| **Tier 2 (Boundaries)** | `node --test tests/e2e/tier2-boundaries.test.js` | All 20 edge cases (E-01 to E-20) |
| **Tier 3 (Interactions)** | `node --test tests/e2e/tier3-interactions.test.js` | Cross-feature interactions |
| **Tier 4 (Workflows)** | `node --test tests/e2e/tier4-workflows.test.js` | End-to-end user workflows |
| **Baseline Regression** | `npm test` (`node --test tests/*.test.js`) | Existing 27 regression tests |
| **Type & Lint Check** | `npm run lint` | Oxlint zero-error verification |
| **Production Bundle** | `npm run build` | Vite build bundle verification |

---

## 4. Traceability & Requirement Mapping

### Tier 1: Feature Coverage (F-01 to F-34)
| Feature ID | Feature Name | Test Identifier | Contract / Specification |
|---|---|---|---|
| **F-01** | `LessonPlayer` Shell | `F-01: LessonPlayer Shell renders full-screen focused layout...` | Full-screen chrome bypass, top progress bar, Back/Continue |
| **F-02** | Step Type: `explain` | `F-02: Step Type explain formats rich text and KaTeX...` | Markdown & KaTeX rendering without syntax crashes |
| **F-03** | Step Type: `visual` | `F-03: Step Type visual embeds mathematical visualizers...` | FractionBarVisualizer & NumberLineLab configuration |
| **F-04** | Step Type: `interact` | `F-04: Step Type interact supports hands-on manipulation...` | Repartitioning bars, dragging ticks, goal validation |
| **F-05** | Step Type: `micro-check` | `F-05: Step Type micro-check provides immediate inline feedback...` | Immediate check; ZERO writes to `learningAttempts` |
| **F-06** | Step Type: `key-rule` | `F-06: Step Type key-rule displays rule summary with working Save...` | "Save to Rulebook" button persists to `store.rulebook` |
| **F-07** | Step Type: `transition` | `F-07: Step Type transition summarizes takeaways...` | Concluding step linking to unit practice route |
| **F-08** | Lesson Progress Persistence | `F-08: Lesson Progress Persistence stores and recovers step...` | Current step index & answers persist across reloads |
| **F-09** | Authored Lesson: Fractions | `F-09: Authored Lesson Add and Subtract Fractions meets 6-10 step...` | 6–10 steps, visualizer, ≥2 micro-checks, ≥1 key-rule |
| **F-10** | Horizontal Number Line Rendering | `F-10: Horizontal Number Line Rendering calculates major and minor...` | Major/minor ticks, range limits, numeric labels |
| **F-11** | Draggable Point | `F-11: Draggable Point updates position along number line...` | Mouse/touch drag coordinate mapping & clamping |
| **F-12** | Keyboard Navigation | `F-12: Keyboard Navigation handles coarse arrow steps and fine...` | Arrow coarse tick vs. Shift+Arrow fine sub-tick |
| **F-13** | Snap-to-Tick Mechanism | `F-13: Snap-to-Tick Mechanism snaps points to nearest subdivision...` | Snapping coordinate calculation with feedback |
| **F-14** | Signed & Fraction Support | `F-14: Signed & Fraction Support formats negative values...` | Negative range below 0, formatted fractions (-3/4, -1/2) |
| **F-15** | Predict-then-Verify Interaction | `F-15: Predict-then-Verify Interaction checks placed position...` | Prompted target placement, "Check" verification within tolerance |
| **F-16** | Zoom Controls | `F-16: Zoom Controls adjust tick subdivisions within bounds` | Clamped zoom scaling revealing finer subdivisions |
| **F-17** | Reset Control | `F-17: Reset Control restores point to default origin (0)` | Point restored to origin (0), feedback cleared |
| **F-18** | Accessibility & Reduced Motion | `F-18: Accessibility and Reduced Motion provide ARIA slider...` | `role="slider"`, ARIA attributes, labeled ticks |
| **F-19** | Embeddability & Standalone Lab | `F-19: Embeddability & Standalone Lab supports both lesson...` | Compact embedded mode vs. standalone unit lab |
| **F-20** | Top-Level Navigation | `F-20: Top-Level Navigation contains exactly 4 items...` | Sidebar: Today, Courses, Rulebook, Settings |
| **F-21** | Course Catalog (`/courses`) | `F-21: Course Catalog renders available courses with Math...` | Math Foundations active; Geometry, Physics, Chem placeholders |
| **F-22** | Course Page (`/courses/math`) | `F-22: Course Page lists 12 Math Foundations units with lock...` | 12 units, progress badges (✓, ⏳, 🔒), progress bar |
| **F-23** | Unit Page (`/courses/math/:unitId`) | `F-23: Unit Page structure defines stacked sections...` | Lesson → Lab → Practice → Review → Quiz |
| **F-24** | Unit Practice (`/courses/math/:unitId/practice`) | `F-24: Unit Practice provides dedicated practice session...` | 6 questions, hints, retries, reflective causes |
| **F-25** | Unit Quiz (`/courses/math/:unitId/quiz`) | `F-25: Unit Quiz provides 3-5 question evaluation with score...` | 3–5 question check via QuizEngine |
| **F-26** | Simplified Today Page (`/`) | `F-26: Simplified Today Page features single primary action...` | Next-action card + short review queue; legacy widgets removed |
| **F-27** | Route Deprecation & Redirects | `F-27: Route Deprecation & Redirects properly map legacy URLs...` | Old routes (`/foundations`, `/practice`, etc.) redirect |
| **F-28** | Storage Concept-to-Unit Mapping | `F-28: Storage Concept-to-Unit Mapping resolves bidirectional...` | Non-destructive mapping layer in `storage.js` |
| **F-29** | Attempt History Preservation | `F-29: Attempt History Preservation retains past attempts...` | Past attempts count toward new unit completion |
| **F-30** | Reflective Cause & Notes Preservation | `F-30: Reflective Cause & Notes Preservation survives storage...` | Reflective causes & rulebook notes preserved |
| **F-31** | 12 Units Definition & DAG | `F-31: 12 Units Definition & DAG validates topological ordering...` | Prerequisite DAG verification; Unit 1 root; 0 cycles |
| **F-32** | Units 1–6 Functional Content | `F-32: Units 1-6 Functional Content provides working problem...` | Problem generators migrated from `foundations.js` |
| **F-33** | Units 7–12 Scaffold Stubs | `F-33: Units 7-12 Scaffold Stubs provide complete metadata...` | Complete unit definitions with preview/practice stubs |
| **F-34** | 3-Theme Token Consistency | `F-34: 3-Theme Token Consistency validates Light Paper...` | Semantic CSS tokens across light, forest, and dark |

---

### Tier 2: Boundary & Corner Cases (E-01 to E-20)
| Case ID | Boundary / Corner Condition | Test Identifier |
|---|---|---|
| **E-01** | `LessonPlayer` Navigation: Back at Step 0 | `E-01: LessonPlayer Navigation - Back button at step 0 is disabled...` |
| **E-02** | `LessonPlayer` Navigation: Continue at Transition | `E-02: LessonPlayer Navigation - Continue on final transition step...` |
| **E-03** | `LessonPlayer` Persistence: Step 4 Refresh | `E-03: LessonPlayer Persistence - Mid-lesson refresh at Step 4...` |
| **E-04** | `LessonPlayer` Micro-Check: Incorrect Answer | `E-04: LessonPlayer Micro-Check - Incorrect answer displays feedback...` |
| **E-05** | `LessonPlayer` Key-Rule: Multiple Clicks | `E-05: LessonPlayer Key-Rule - Multiple clicks on Save to Rulebook...` |
| **E-06** | `NumberLineLab` Point Drag: Boundary Overshoot | `E-06: NumberLineLab Point Drag - Out-of-bounds drag coordinates...` |
| **E-07** | `NumberLineLab` Keyboard: Arrow at Min/Max | `E-07: NumberLineLab Keyboard - Arrow navigation at boundaries...` |
| **E-08** | `NumberLineLab` Keyboard: Shift + Arrow Fine Step | `E-08: NumberLineLab Keyboard - Shift + Arrow navigation advances...` |
| **E-09** | `NumberLineLab` Snapping: Release Between Ticks | `E-09: NumberLineLab Snapping - Releasing point between ticks snaps...` |
| **E-10** | `NumberLineLab` Predict-Check: Within Tolerance | `E-10: NumberLineLab Predict-Check - Within tolerance (±0.005)...` |
| **E-11** | `NumberLineLab` Predict-Check: Default 0 vs -3/4 | `E-11: NumberLineLab Predict-Check - Default point at 0 evaluated...` |
| **E-12** | `NumberLineLab` Zoom: Maximum Zoom Clamping | `E-12: NumberLineLab Zoom - Zoom In is capped at maximum subdivision...` |
| **E-13** | `Course Page` Locking: Click Locked Unit 12 | `E-13: Course Page Locking - Clicking locked Unit 12 allows preview...` |
| **E-14** | `Course Page` Multi-Prereq: Unit 5 Partial | `E-14: Course Page Multi-Prereq - Unit 5 remains locked if only one...` |
| **E-15** | `Storage Migration` Legacy Read: Addition Alias | `E-15: Storage Migration Legacy Read - Legacy attempt with conceptId...` |
| **E-16** | `Storage Migration` Quota Exceeded Catch | `E-16: Storage Migration Quota Exceeded - QuotaExceededError is caught...` |
| **E-17** | `Storage Migration` Corrupted Store Recovery | `E-17: Storage Migration Corrupted Store - Invalid JSON returns safe...` |
| **E-18** | `Today Page` Cold Start: Empty Storage | `E-18: Today Page Cold Start - Empty storage recommends Unit 1...` |
| **E-19** | `Navigation` Legacy Route: Query Param Redirect | `E-19: Navigation Legacy Route - Query params in legacy URL redirect...` |
| **E-20** | `Themes` Full-Screen Player: Forest Theme | `E-20: Themes Full-Screen Player - Theme token inheritance persists...` |

---

### Tier 3: Pairwise & Cross-Feature Interactions
| Test ID | Cross-Feature Interaction | Test Identifier |
|---|---|---|
| **T3.01** | NumberLineLab embedded in LessonPlayer | `T3.01: NumberLineLab inside LessonPlayer - slider keyboard navigation...` |
| **T3.02** | FractionBarVisualizer embedded in LessonPlayer | `T3.02: FractionBarVisualizer inside LessonPlayer - visual model follow-up...` |
| **T3.03** | Key-Rule Save & Rulebook Inspection | `T3.03: Key-Rule Save & Rulebook Inspection - Rule saved in lesson is viewable...` |
| **T3.04** | Unit Practice & Course Progress Unlock | `T3.04: Unit Practice Completion & Course Progress Update - Completing Unit 1...` |
| **T3.05** | Theme Switching in LessonPlayer | `T3.05: Theme Switching in LessonPlayer - Changing theme reflects in player...` |
| **T3.06** | Legacy Attempt Mapping in Unit Review | `T3.06: Legacy Attempt Mapping to Unit Review - Historical missed attempt...` |
| **T3.07** | Unit Quiz Evaluation & Progress | `T3.07: Unit Quiz Evaluation - Quiz scores record and contribute to unit...` |
| **T3.08** | Today Desk Priority State Machine | `T3.08: Today Recommendation Priority Dynamics - Priority transitions...` |

---

### Tier 4: Real-World End-to-End User Workflows
| Workflow ID | Workflow Journey | Test Identifier |
|---|---|---|
| **T4.01** | Fresh Learner Onboarding Flow | `T4.01: Fresh Learner Onboarding Flow - Today desk to Unit 1 practice to Unit 2 unlock` |
| **T4.02** | Complete 8-Step Guided Lesson Flow | `T4.02: Complete Guided Lesson Flow - All 8 steps completed, rulebook saved...` |
| **T4.03** | Interrupted Session & Resume Flow | `T4.03: Interrupted Session & Resume Flow - Browser refresh at Step 4 restores...` |
| **T4.04** | Mistake Review & Repair Loop | `T4.04: Mistake Review & Repair Loop - Practice mistake is reflected, queued...` |
| **T4.05** | Multi-Unit Curriculum Progression DAG | `T4.05: Multi-Unit Curriculum Progression & Prerequisite Gating Flow across units 1 to 12` |

---

## 5. Storage Mock Implementation Details

The storage harness in `tests/e2e/setup.js` mimics the standard `WindowLocalStorage` API:
```javascript
export function setupMockLocalStorage(initialEntries = {}) {
  memoryStore.clear();
  for (const [key, value] of Object.entries(initialEntries)) {
    memoryStore.set(String(key), typeof value === 'string' ? value : JSON.stringify(value));
  }
  global.localStorage = {
    getItem: (key) => memoryStore.get(String(key)) ?? null,
    setItem: (key, value) => memoryStore.set(String(key), String(value)),
    removeItem: (key) => memoryStore.delete(String(key)),
    clear: () => memoryStore.clear(),
    key: (index) => Array.from(memoryStore.keys())[index] ?? null,
    get length() { return memoryStore.size; },
  };
}
```
Before each test, `test.beforeEach(() => { setupMockLocalStorage(); })` executes automatically to prevent state contamination between test cases.
