# Antigravity handoff — MathFoundry

Updated October 2, 2026. Start here.

## Roles and current task

Bry wants Codex to handle product planning, design discussion, and review; Antigravity handles implementation. The latest direction is clearer mistake feedback, more purposeful interactive math visualizations, and a polished study environment inspired by Zen Browser. JetBrains Mono is preferred for numbers. Confirmed follow-up: incorrect answer → one hint → retry before solution; Zen sidebar, typography and compact controls are the preferred design cues; fraction bars and number lines are the first visual priority. Further questions remain; do not treat proposed details as approved choices.

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

## First build brief

Implement ticket P1 in the product plan: unmistakable mistake review across existing flows. Preserve existing history, filters, rulebook, repair, themes, and routes. Apply new feedback treatment both immediately after an answer and in later session review. During an active problem, give one hint and allow retry without revealing the answer; after solution reveal or in later review, make the answer comparison and explanation prominent. Preserve the initial response and label helped retries correctly. Demonstrate incorrect, skipped, correct-with-help, independent-correct, and missing-legacy-data cases. Show desktop/mobile screenshots in all three themes and a complete answer → review → repair → saved history flow.

Next prototype P2: one fraction addition visualization, linked to the same feedback and evidence model. Ship one mathematically checked interaction before expanding to more visual formats. P3 defines the shell/typography polish; avoid redesigning every page independently.

If Bry has answered an open preference question, update the product plan's decision register before implementing the affected default. Use existing confirmed preferences for routine choices. Surface decisions that materially alter teaching behavior, data storage, scope, or cost.

## Definition of ready for review

- State what changed and which ticket it completes; list any remaining part explicitly.
- Report tests/build/lint with actual outcomes; distinguish existing warnings from new ones.
- Verify reload, back/forward navigation, saved answers, duplicate-save resistance, and old-data compatibility.
- Verify keyboard-only use, narrow screens, reduced motion, readable math, and all themes.
- Show visual evidence using test data, labeled as such. Summarize the completed learner flow.
- Update the implementation log and tests when behavior changes. Keep planning decisions and shipped behavior distinct.
- Do not call an entire milestone complete because routes render or a component exists; demonstrate its learning purpose.

## Suggested message to paste into Antigravity

> Continue MathFoundry in this repository. Read ANTIGRAVITY_HANDOFF.md and the linked docs first. Codex is handling planning with me; you are handling implementation. Start with P1: make incorrect answers and their explanations clearly visible throughout the hub, while preserving saved progress. Then prototype P2's interactive fraction addition experience. Follow confirmed preferences, identify unresolved choices, and verify the full learning flow with isolated test data. Report the completed scope, screenshots, checks, and any gaps for Codex to review. Do not treat historical planning text as the current implementation status.
