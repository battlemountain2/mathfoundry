# Antigravity handoff — MathFoundry

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
- **Verification Evidence**:
  - 27 passing tests in `npm test` (0 failures).
  - Production build passing in ~270ms with 0 errors.
  - Lint passing with 0 errors (40 warnings, all pre-existing).
  - Full implementation details documented in `docs/IMPLEMENTATION-P5-2026-10-03.md`.
- **Next Up**: Ticket P6 (Controlled content expansion: number lines, algebraic balance scale, or extended problem variations as prioritized by Codex and Bry).
