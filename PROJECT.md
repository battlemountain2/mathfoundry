# Project: MathFoundry Restructure (Phases 1-3)

## Architecture
MathFoundry is a zero-backend, client-side math and science learning companion built with React 19, Vite 8, JavaScript JSX, Tailwind 4, and KaTeX.
The application evolves from a flat utility layout into a structured Khan Academy-style hierarchical curriculum:
`Course Catalog (/courses) → Course Overview (/courses/:courseId) → Unit Page (/courses/:courseId/:unitId) → Walkthrough Lesson (/lesson) | Practice (/practice) | Unit Quiz (/quiz)`.

### Core Architectural Decisions
1. **Shell Isolation & Full-Screen Mode**: `src/components/Layout/Layout.jsx` detects lesson routes (`/courses/:courseId/:unitId/lesson`) and completely bypasses `<Sidebar>`, `<Header>`, `<TutorDrawer>`, and padding margins (`lg:pl-64`), providing an immersive Brilliant-style focused walkthrough while inheriting active CSS theme variables (`--ground`, `--surface`, `--ink`, `--accent`).
2. **Non-Destructive Storage Migration**: `src/utils/storage.js` implements a virtualized bidirectional mapping layer (`CONCEPT_TO_UNIT_PATH`, `UNIT_ID_TO_CONCEPT`, `normalizeAttempt`). Historical attempt records under legacy keys (`arithmetic`, `equivalence`, `comparison`, `addition`, `multiplication`, `division`) are never overwritten, cleared, or deleted. All legacy tests remain 100% green without modification.
3. **Mastery Evidence Isolation**: Formative lesson micro-checks are recorded exclusively in `mathfoundry_data.lessonProgress[unitPath]`. They are strictly isolated from `store.learningAttempts` and mastery calculations to preserve evidence integrity.
4. **Standalone & Embedded Number Line Lab**: `NumberLineLab.jsx` supports both full-width standalone laboratory exploration and compact embedded operation inside `LessonPlayer` visual/interact steps.
5. **Theme Token Compliance**: All new components use semantic CSS tokens (`var(--surface)`, `var(--ink)`, `var(--line)`, `var(--accent)`, `var(--heat)`, `var(--good)`, `var(--font-mono)`), rendering flawlessly in Light Paper, Deep Pine Forest, and Original Dark themes.

---

## Feature Inventory
Every feature from the Survey phase is mapped to its assigned milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F-01 | `LessonPlayer` Shell | Full-screen interactive lesson container without sidebar/chrome, top progress bar, Back/Continue | M3 | ORIGINAL_REQUEST.md:23-35 |
| F-02 | Step Type: `explain` | Markdown and KaTeX math formula rendering | M3 | ORIGINAL_REQUEST.md:27 |
| F-03 | Step Type: `visual` | Embedded visual demonstration displaying math models (fraction bars, number line) | M3 | ORIGINAL_REQUEST.md:28 |
| F-04 | Step Type: `interact` | Hands-on manipulation task (repartitioning bars, dragging ticks) | M3 | ORIGINAL_REQUEST.md:29 |
| F-05 | Step Type: `micro-check` | Inline formative question with immediate feedback; zero writes to mastery evidence | M3 | ORIGINAL_REQUEST.md:30,111 |
| F-06 | Step Type: `key-rule` | Rule summary card with "Save to Rulebook" button persisting to storage | M3 | ORIGINAL_REQUEST.md:31 |
| F-07 | Step Type: `transition` | Concluding step summarizing takeaways and linking to unit practice | M3 | ORIGINAL_REQUEST.md:32-35 |
| F-08 | Lesson Progress Persistence | Current step index and micro-check answers persist in localStorage across refresh | M3 | ORIGINAL_REQUEST.md:34-35,107 |
| F-09 | Authored Lesson: "Add & Subtract Fractions" | 6–10 step mathematically sound lesson with FractionBarVisualizer, ≥2 micro-checks, ≥1 key-rule | M3 | ORIGINAL_REQUEST.md:36,110 |
| F-10 | Horizontal Number Line Rendering | Scalable horizontal axis with major/minor ticks, range limits, numeric labels | M2 | ORIGINAL_REQUEST.md:41-45,114 |
| F-11 | Draggable Point (Mouse & Touch) | Interactive point positioned along axis via pointer drag without jitter | M2 | ORIGINAL_REQUEST.md:43,115 |
| F-12 | Keyboard Navigation (Coarse & Fine) | Arrow keys move by tick; Shift+Arrow moves by fine sub-tick increment | M2 | ORIGINAL_REQUEST.md:43,116 |
| F-13 | Snap-to-Tick Mechanism | Point automatically snaps to nearest subdivision tick with visual feedback | M2 | ORIGINAL_REQUEST.md:44 |
| F-14 | Signed & Fraction Support | Range below zero and signed fraction formatting (e.g. -3/4, -1/2) | M2 | ORIGINAL_REQUEST.md:45,117 |
| F-15 | Predict-then-Verify Interaction | Prompted to place target value, "Check" button compares placement to target | M2 | ORIGINAL_REQUEST.md:46,118 |
| F-16 | Zoom Controls | Zoom In/Out controls revealing finer subdivisions or broader range | M2 | ORIGINAL_REQUEST.md:47 |
| F-17 | Reset Control | Reset button restores point to default origin (0) | M2 | ORIGINAL_REQUEST.md:48 |
| F-18 | Accessibility & Reduced Motion | `role="slider"`, ARIA attributes, tick text labels, respects prefers-reduced-motion | M2 | ORIGINAL_REQUEST.md:49 |
| F-19 | Embeddability & Standalone Lab | Operates both inside lesson steps and as standalone lab on unit pages | M2 | ORIGINAL_REQUEST.md:51,119 |
| F-20 | Top-Level Navigation | Restructures sidebar navigation to exactly 4 items: Today, Courses, Rulebook, Settings | M4 | ORIGINAL_REQUEST.md:57,122 |
| F-21 | Course Catalog (`/courses`) | Catalog listing Math Foundations (active), Geometry, Physics, Chemistry (placeholders) | M4 | ORIGINAL_REQUEST.md:58,123 |
| F-22 | Course Page (`/courses/math`) | Vertical list of 12 units with progress indicators (✓, ⏳, 🔒), lock evaluation, progress bar | M4 | ORIGINAL_REQUEST.md:58,60,124 |
| F-23 | Unit Page (`/courses/math/:unitId`) | Stacked sections: Lesson status → Lab → Practice status → Unit Review → Unit Quiz | M4 | ORIGINAL_REQUEST.md:61,125 |
| F-24 | Unit Practice (`/courses/math/:unitId/practice`) | Dedicated unit practice session with 6 problems, hints, retries, reflective causes | M4 | ORIGINAL_REQUEST.md:58 |
| F-25 | Unit Quiz (`/courses/math/:unitId/quiz`) | 3–5 question summative unit quiz evaluating unit retention via QuizEngine | M4 | ORIGINAL_REQUEST.md:58 |
| F-26 | Simplified Today Page (`/`) | Single primary action card (Start/Resume) + short prioritized review queue; legacy widgets removed | M4 | ORIGINAL_REQUEST.md:62-63,126 |
| F-27 | Route Deprecation & Redirects | Old standalone routes (`/foundations`, `/practice`, `/diagnostic`, etc.) redirect to courses | M4 | ORIGINAL_REQUEST.md:64,127 |
| F-28 | Storage Concept-to-Unit Mapping | Bidirectional non-destructive mapping between legacy concept IDs and new unit paths | M1 | ORIGINAL_REQUEST.md:68-80,131-133 |
| F-29 | Attempt History Preservation | Existing learningAttempts, practiceHistory, reviewHistory remain intact and map to units | M1 | ORIGINAL_REQUEST.md:79,132 |
| F-30 | Reflective Cause & Notes Preservation | User notes in rulebook and reflective causes survive all schema transformations | M1 | ORIGINAL_REQUEST.md:79 |
| F-31 | 12 Units Definition & DAG | Formal definitions of 12 Math Foundations units with strictly specified prerequisite dependencies | M1 | ORIGINAL_REQUEST.md:83-98 |
| F-32 | Units 1–6 Functional Content | Working practice problems migrated from foundations.js for units 1 through 6 | M1 | ORIGINAL_REQUEST.md:98 |
| F-33 | Units 7–12 Scaffold Stubs | Complete unit definitions, prerequisites, and placeholder lesson/practice stubs for units 7-12 | M1 | ORIGINAL_REQUEST.md:98 |
| F-34 | 3-Theme Token Consistency | All new pages and components render cleanly in Light Paper, Deep Pine, and Original Dark | M2, M3, M4 | ORIGINAL_REQUEST.md:137-140 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Test harness, Tier 1-4 test suites derived from requirements, TEST_READY.md signal | none | IN_PROGRESS |
| M1 | Data Migration & Curriculum Definitions | Non-destructive mapping layer in `storage.js`, 12-unit Math Foundations course definitions in `src/data/courses/`, unit attempts accessor, lesson progress storage | none | IN_PROGRESS |
| M2 | Interactive Number Line Lab | `NumberLineLab.jsx` component with dragging, keyboard navigation, snapping, signed fractions, predict/verify, zoom/reset, ARIA slider | none | IN_PROGRESS |
| M3 | Guided Lesson System | Full-screen `LessonPlayer.jsx`, 6 step types, progress persistence, complete 8-step "Add & Subtract Fractions" lesson with FractionBarVisualizer | M1 | PLANNED |
| M4 | Site Architecture & Navigation | Layout full-screen chrome suppression, 4-item Sidebar, App routes & legacy redirects, CourseCatalog, CoursePage, UnitPage, UnitPractice, UnitQuiz, simplified Today page | M1, M2, M3 | PLANNED |
| M5 | E2E Verification & Adversarial Hardening | Phase 1: 100% pass on Tiers 1-4 E2E tests. Phase 2: Tier 5 adversarial coverage hardening | M4, E2E | PLANNED |

---

## Interface Contracts

### 1. Storage Layer ↔ Course Pages (`storage.js` ↔ `CoursePage.jsx`, `UnitPage.jsx`)
- `getAttemptsForUnit(courseId, unitId)`: Returns normalized attempts matching either `unitPath === '${courseId}/${unitId}'` or legacy concept mapping.
- `getUnitProgress(courseId, unitId)`: Evaluates `{ status, isLocked, unreadyPrereqs, percent, sections }`.
- `CONCEPT_TO_UNIT_PATH`: Dictionary mapping `'arithmetic'` → `'math/arithmetic'`, `'addition'` → `'math/add-subtract-fractions'`, etc.
- `UNIT_ID_TO_CONCEPT`: Reverse lookup dictionary.

### 2. Storage Layer ↔ Lesson Player (`storage.js` ↔ `LessonPlayer.jsx`)
- `getLessonProgress(unitPath)`: Returns `{ currentStepIndex, completed, microCheckAnswers, completedAt }`.
- `saveLessonProgress(unitPath, { currentStepIndex, microCheckAnswers, completed })`: Atomically persists lesson state under `store.lessonProgress[unitPath]`. NEVER writes to `learningAttempts`.
- `saveRulebookEntry(entry)`: Standard rulebook persistence returning boolean success.

### 3. Number Line Lab Props (`NumberLineLab.jsx`)
```typescript
interface NumberLineLabProps {
  range?: [number, number]; // default: [-2, 2]
  subdivisions?: number; // default: 4 (fourths)
  targetValue?: number | null; // for predict-then-verify mode
  prompt?: string;
  embedded?: boolean; // compact mode for lesson steps
  onVerify?: (result: { correct: boolean; placedValue: number; targetValue: number }) => void;
  onPositionChange?: (value: number) => void;
}
```

### 4. Lesson Definition Schema (`addSubtractFractions.js`)
```typescript
interface LessonDefinition {
  id: string;
  unitId: string;
  courseId: string;
  title: string;
  steps: Array<ExplainStep | VisualStep | InteractStep | MicroCheckStep | KeyRuleStep | TransitionStep>;
}
```

---

## Code Layout

```
src/
├── App.jsx                                  # Routes and legacy redirects [M4]
├── components/
│   ├── Layout/
│   │   ├── Layout.jsx                       # Full-screen chrome bypass [M4]
│   │   └── Sidebar.jsx                      # Exactly 4 nav items [M4]
│   ├── Lesson/
│   │   ├── LessonPlayer.jsx                 # Full-screen lesson walkthrough [M3]
│   │   └── MathBlock.jsx                    # KaTeX math formula block (existing)
│   ├── Study/
│   │   ├── FractionBarVisualizer.jsx        # Existing fraction visualizer (P2)
│   │   └── NumberLineLab.jsx                # Interactive Number Line Lab [M2]
├── data/
│   ├── courses/
│   │   ├── courseCatalog.js                 # Catalog definitions (Math, Geometry, Physics, Chem) [M1]
│   │   └── mathFoundations.js               # 12 units with prerequisites & stubs [M1]
│   ├── lessons/
│   │   └── addSubtractFractions.js          # Complete authored 8-step lesson [M3]
│   └── foundations.js                       # Existing 6 concepts & problem generators (preserved)
├── pages/
│   ├── Home.jsx                             # Simplified Today desk [M4]
│   ├── CourseCatalog.jsx                    # /courses [M4]
│   ├── CoursePage.jsx                       # /courses/:courseId [M4]
│   ├── UnitPage.jsx                         # /courses/:courseId/:unitId [M4]
│   ├── UnitPractice.jsx                     # /courses/:courseId/:unitId/practice [M4]
│   ├── UnitQuiz.jsx                         # /courses/:courseId/:unitId/quiz [M4]
│   ├── Rulebook.jsx                         # /rulebook (preserved)
│   └── Settings.jsx                         # /settings (preserved)
├── utils/
│   ├── storage.js                           # Non-destructive mapping & lesson progress [M1]
│   └── learningProfile.js                   # Evidence & prerequisite calculations (preserved)
tests/
├── learning.test.js                         # Existing regression test (preserved, 100% pass)
├── review-feedback.test.js                  # Existing regression test (preserved, 100% pass)
├── courses-storage.test.js                  # Unit tests for M1 data mapping [M1]
├── numberLine.test.js                       # Unit tests for M2 number line [M2]
├── lessonPlayer.test.js                     # Unit tests for M3 lesson player [M3]
├── e2e/                                     # E2E test suite (Tiers 1-4) [E2E Track]
```
