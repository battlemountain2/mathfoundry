# Antigravity handoff — MathFoundry

**Latest stabilization — October 11:** [Debugging and cleanup report](docs/DEBUG-CLEANUP-2026-10-11.md). Validated saved recall sessions, protected study/recall from stale tab writes, stopped conflicting cloud restores, hardened grading input, shared dialog focus handling, fixed hidden phone navigation and clarified recall review. 257 tests + 67 workflow simulations pass; lint/build clean. Bry authorized a local commit of the accumulated Athena milestones; GitHub publication is separate. Daymark integration remains on hold pending both Git baselines and the integration plan.

**Next accepted priorities:** more problem variety and personalization/review across every supported topic. Standalone backup-file import is excluded. Preserve existing progress in the future Daymark integration plan, with Daymark's daily overview first and an easy switch to Athena's study desk.

October 9 cohesion/debug milestone: `docs/COHESION-CLEANUP-2026-10-09.md` records the latest implementation, verification and limits. Settings/Ada share Athena themes, the desk model follows the resumed topic, guides preserve the current activity, and shared store subscriptions keep appearance/progress/rulebook consistent. Saved-data normalization and cloud snapshot restoration were hardened. Current checks: 250 tests + 67 workflow simulations pass, lint has zero warnings/errors, and build succeeds without a chunk-size warning. The main JS chunk is about 258 kB; this is not total lesson transfer size. A fresh phone-layout check and live cloud/AI checks remain outstanding. Preserve the older data keys and raw records; do not treat snapshot backup as history merging.


**Latest update — Athena, October 9:** Bry renamed the study studio Athena and requested consistent visual teaching across every supported topic. [The Athena report](docs/IMPLEMENTATION-ATHENA-2026-10-09.md) supersedes the limitations below where addressed: all 18 current foundation units now have a guided introduction, topic-specific models, introductory practice/checks, and visual repair. Existing full authored lessons remain accessible separately. Current checks are 241 top-level tests plus 67 simulated-flow tests passing. Preserve storage keys and existing records through the rename. Broad advanced algebra/science content and extensive problem-family coverage are still future work.

**Latest working milestone — October 9:** Bry subsequently authorized Codex to build v3 directly with GPT-6.1 Sol. The first connected milestone is implemented in the working tree. Start with [the implementation report](docs/IMPLEMENTATION-V3-2026-10-09.md), then the vision and review below. The earlier role split and test counts are historical. Inspect current changes before editing; preserve the original untracked README and real learner data.

Ready to try: text-only navigation, three themes, spacious Today, resumable course practice/checks, original-answer review, targeted repair, personal rulebook, calm Rule Match, and two small engineering applications. Current verification: **237 top-level tests and 67 simulated-flow tests pass**, production build passes, lint has 99 warnings and zero errors. Actual browser checks cover saved sessions, hint/retry/reveal, exact-problem fraction bars, review, repair, recall, quiz, applications, themes, and mobile layout. See the report for boundaries and screenshot proof.

Next build priority: deepen the complete fractions teaching journey with explanations inside the workspace, more worked-example and visual families, and matching visuals during repair. Then refine evidence presentation and delayed retention. Photo-work review, other subjects, and reliable cross-device synchronization remain later. Do not equate this milestone with complete curriculum or a fully continuous lesson engine.

## Historical planning handoff (superseded where noted above)

**V3 ready for implementation handoff — October 7:** Bry is ready to proceed with the agreed direction. Read `AGENTS.md`, [Foundry v3 vision](docs/FOUNDRY-V3-VISION.md), and [October 7 cohesion review](docs/COHESION-REVIEW-2026-10-07.md) first. These supersede conflicting historical priorities below. Antigravity builds; Codex plans and reviews. No application implementation was performed as part of this planning handoff.

Build order: (1) connected workspace prototype in all three themes, (2) persistent practice → feedback → review → targeted repair journey, (3) complete fractions experience and calm Rule Match/recall, (4) prerequisite-matched engineering applications. Photo-work review is later scope. The review document contains the immediate implementation ticket and browser acceptance scenarios. Prototype the agreed direction without reopening settled preferences; bring genuinely new consequential choices back to Bry.

Design: Modern Studio with illustrated-textbook diagrams and Zen-like calm controls; **no pixel/bit font**. Keep JetBrains Mono for numerical UI and compact labels, readable body text, and proper math typesetting. Text-only navigation; Paper, Charcoal, and deep Pine/Cream themes. Optional desktop side panel becomes inline expanding help below the problem on mobile. Continuous sessions allow skipping/exploring and resuming.

First demonstration: start a fraction session → try first → answer incorrectly → receive one hint → retry or explicitly reveal → open matching visual explanation → review original mistake → start a fresh targeted repair → reload/resume → return to Today with consistent evidence. Demonstrate Rule Match separately and distinguish recognition from independent application. Use isolated fixtures; preserve real learner progress. Deliver changed-file summary, actual verification results, remaining limitations, and desktop/mobile screenshots. Do not call the entire v3 complete when only the shell is redesigned.

**October 7 review update:** Read [the current cohesion review and proposed immediate ticket](docs/COHESION-REVIEW-2026-10-07.md) before using the historical completion claims below. A focused source review found newer course flows bypassing shared review, incomplete curriculum capabilities, and sync limitations. Current checks: 226 top-level Node tests plus 67 nested simulated-flow tests pass; live browser verification remains required. Bry is discussing preferences with Codex; Antigravity remains the implementation owner. Do not prioritize physics/chemistry expansion ahead of the foundational cohesion milestone.

Updated October 2, 2026. Start here.

## Roles and current task

Bry wants Codex to handle product planning, design discussion, and review; Antigravity handles implementation. The latest direction is clearer mistake feedback, more purposeful interactive math visualizations, and a polished study environment inspired by Zen Browser. JetBrains Mono is preferred for numbers. Confirmed follow-up: incorrect answer → one hint → retry before solution; Zen sidebar, typography and compact controls are the preferred design cues; fraction bars and number lines are the first visual priority. Bry also accepts occasional optional entry of one intermediate step to clarify a mistake; preserve paper-first solving and accept valid alternate methods. Further questions remain; do not treat proposed details as approved choices.

Read in this order:
1. `AGENTS.md` — learner preferences, evidence integrity, preservation constraints.
2. `docs/PRODUCT-PLAN.md` — current decisions, proposed designs, ordered build tickets, open questions.
3. `docs/IMPLEMENTATION-COHESION-2026-10-02.md` — what already exists and verification limits.
4. `docs/ROADMAP.md` — longer-term curriculum and subject connections.

`docs/DESIGN-NEXT.md` and `docs/AUDIT.md` are historical context. Their defect descriptions refer to earlier versions unless the current product plan explicitly carries them forward.

## Working baseline

Repository: `/home/bry/.gemini/antigravity/scratch/mathfoundry`.
Baseline implementation commit: `2bf23d0`. Inspect current Git status/history before work; newer planning changes may exist. Preserve other edits and the original untracked README.md.
Stack: React 19, Vite 8, JavaScript JSX, Tailwind 4, KaTeX, local browser storage. No runtime AI is required for core study. Do not introduce a backend, paid model dependency, or framework rewrite as a routine design change.

Commands:
- `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` (check for an existing server first)
- `npm test`
- `npm run build`
- `npm run lint`

Last recorded baseline: 13 tests pass, production build passes, lint has 37 warnings and no errors. Main bundle has a >500 kB warning. Re-run and report current results rather than repeating these as new verification.

Real learner data lives at the localhost origin. Use an isolated origin/browser profile for test fixtures. Never clear actual progress, fabricate historical answers, or silently migrate away saved data. Preserve existing backups and additive migration behavior.

## Current implementation map

| Area | Files |
|---|---|
| Application routes and shell | `src/App.jsx`, `src/components/Layout/`, `src/index.css`, `src/hooks/useTheme.js` |
| Today and learning paths | `src/pages/Home.jsx`, `src/pages/Learn.jsx`, `src/pages/Foundations.jsx` |
| Session review | `src/components/Study/SessionReview.jsx`, `src/pages/Review.jsx`, `src/utils/review.js` |
| Repair and rulebook | `src/pages/Repair.jsx`, `src/pages/Rulebook.jsx`, `src/utils/repair.js`, `src/data/repairProblems.js` |
| Questions and evidence | `src/data/foundations.js`, `src/data/practiceBank.js`, `src/utils/learningProfile.js`, `src/utils/answerChecking.js` |
| Storage and backup | `src/utils/storage.js` |
| Quiz/diagnostic review | `src/components/Quiz/QuizEngine.jsx`, `src/components/Quiz/ResultsPanel.jsx`, `src/utils/scoring.js`, `src/pages/ModulePage.jsx` |
| Mixed practice | `src/components/Practice/AdaptivePractice.jsx`, `src/components/Practice/SessionSummary.jsx` |
| Tutor context | `src/components/Study/ActivityContext.jsx`, `src/components/Tutor/TutorDrawer.jsx`, `src/utils/aiTutor.js` |
| Regression checks | `tests/learning.test.js` |

## Current status (October 2, 2026)

- **Ticket P1 (Unmistakable Mistake Review)**: **COMPLETED**.
  - One hint → retry policy without revealing the answer.
  - Learner-controlled solution reveal via "Walk me through it" button.
  - Initial answer preserved on retry; assisted retries flagged `assisted: true`.
  - Optional intermediate step capture with valid alternate common denominator support.
  - Session review has missed-first default sorting, auto-expanded first missed question, JetBrains Mono answer comparison grids, and one-step repair with return links.
- **Ticket P2 (Fraction Addition Visualizer)**: **PROTOTYPED & INTEGRATED**.
  - Interactive repartitioning lab ($1/2 + 1/3 = 5/6$, $1/4 + 1/6 = 5/12$, $1/3 + 1/6 = 1/2$).
  - Equal-length wholes, unit subdivisions, arithmetic combination, step explanation.
  - Independent paper follow-up with deterministic checking and separate evidence logging.
- **Ticket P3 (Shell & Typography Polish)**: **COMPLETED**.
  - Zen Browser-inspired collapsible compact focus mode on desktop (`[ ◫ Focus ]` / `[ ◨ Expand ]`) with smooth canvas transitions.
  - Translucent frosted glass chrome (`backdrop-filter: blur(12px)`) for sidebar and header; opaque, high-contrast study surfaces.
  - Typography options in Settings: Editorial Serif (Georgia) vs. Modern Sans (Inter), with JetBrains Mono numbers throughout.
  - Interactive Theme Component Sheet built and integrated in Settings showing all tokens, interaction states, and contrast across all three themes.
  - Hardcoded card and container colors removed to ensure 100% theme harmony across Light Paper, Deep Pine Forest, and Original Dark.
- **Ticket P4 (More Precise Repair and Rulebook)**: **COMPLETED**.
  - Subskill & problem-family matching: subtraction strictly repairs subtraction, perimeter strictly repairs perimeter, area strictly repairs area. Bounded novelty policy implemented.
  - Multi-repair draft preservation: `repairDrafts` array in storage preserves multiple unfinished repairs; interactive pill switcher in `/repair` allows switching between active tasks without data loss.
  - Scoped rulebook assistance: assistance attaches only when explicitly navigated via `?from=...&activeId=...`; opening rulebook directly leaves parked sessions/drafts unassisted.
  - Concept-organized rulebook: categories (Fractions, Arithmetic, Geometry, Algebra, My Notes), real-time search, "When to use" triggers, common pitfall warnings, checked worked examples, and durable user notes that survive backups.
- **Ticket P5 (Cohesive Session Planning and Progress)**: **COMPLETED**.
  - Real prerequisite-based compact path traversal following concept DAGs (`buildPrerequisitePath`), showing prerequisite readiness (`✓ Ready`, `⏳ In progress`, `— Unassessed`), current focus, and unlocked downstream topics.
  - Honest shared attempt evidence model (`summarizeEvidence`, `getAllLearningAttempts`): strict anti-sparse mastery enforcement requiring multi-session independent recall (≥3 independent correct answers across ≥2 distinct sessions).
  - Explained recommendations with concrete endpoints: explicit evidence triggers and finite session goals (e.g., "Complete 1 independent block (6 questions)" or "Answer 2 recall check questions").
  - Review prioritization queue (`getPrioritizedReviewQueue`): ranked High (unrepaired mistakes), Medium (48h delayed retention due), and Low (supported practice) with direct deep-links to repair/review.
  - Resumable long-session blocks: 30m, 45m, 60m, and 90m block support with atomic persistence, progress indicators, and "Shelve session" options.
  - Optional reflective cause input: non-intrusive diagnosis pills (`calc-slip`, `rule-confused`, `misread`, `unsure-start`, `other`) across Foundations, Repair, and Session Review.
- **MathFoundry v2 (Phases 1–3: Guided Lessons, Number Line Lab, and Course-Based Architecture)**: **COMPLETED**.
  - **Guided Lesson System (`LessonPlayer`)**: Full-screen focused walkthrough with 6 step types (`explain`, `visual`, `interact`, `micro-check`, `key-rule`, `transition`), progress resumption, formative micro-check isolation, and complete 8-step "Add & Subtract Fractions" curriculum.
  - **Interactive Number Line Lab (`NumberLineLab`)**: Continuous axis with configurable range, subdivisions, keyboard (coarse/fine) & touch/drag navigation, snap-to-tick, signed rational values, and predict-verify evaluation.
  - **Course-Based Hierarchy**: `/courses` catalog (Math, Geometry, Physics, Chemistry), `/courses/:courseId` vertical unit list with prerequisite locking and progress bars, `/courses/:courseId/:unitId` unit pages with stacked sections (Lesson → Lab → Practice → Review → Quiz).
  - **4-Item Top Navigation**: Cleaned sidebar to exactly 4 items (Today, Courses, Rulebook, Settings) with full-screen chrome suppression on lesson routes.
  - **Simplified Today Desk (`/`)**: Single primary action card (resume lesson / start practice / take quiz) + short prioritized review queue.
  - **Non-Destructive Storage Migration**: Virtualized bidirectional mapping (`toUnitPath`, `toConceptId`, `normalizeAttempt`, `getAttemptsForUnit`) ensuring all past learner history remains 100% intact.
- **Verification Evidence**:
  - 275 passing automated tests (208 unit/stress tests + 67 E2E tests across Tiers 1–4, 0 failures).
  - Production build succeeds in ~290ms with 0 errors.
  - Lint clean with 0 errors.
  - Dev server running on `http://127.0.0.1:5173/` (`http://localhost:5173/`).
- **Next Up**: Content expansion for remaining units (Units 7–12 lessons/practice), physics & chemistry course units.
