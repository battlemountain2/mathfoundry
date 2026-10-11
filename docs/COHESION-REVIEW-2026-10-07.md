# MathFoundry cohesion review and proposed build handoff

Reviewed October 7, 2026, against local commit `7a1b0f4` and Bry's attached architecture brief. Codex plans/reviews; Antigravity implements. This is a focused source review, not a complete browser or accessibility audit. Confirmed preferences in AGENTS.md remain binding. New recommendations below are proposals pending discussion.

## 1. Architectural, learning, and UX critique

The foundation is promising: authored mathematics, explicit assistance tracking, reusable visual labs, a shared review component, and local ownership of learning records. The main issue is uneven integration across newer course pages and older learning flows. A capability existing in one component does not mean every learner journey receives it.

### Verified findings

| Finding | Evidence | Consequence / priority |
|---|---|---|
| Unit practice ends in counts and navigation, without shared question review. Its repair link goes directly to `/repair` without creating or selecting a draft from this session. | `src/pages/Courses/UnitPractice.jsx`, completion branch; `src/pages/Repair.jsx`, draft selection | High: Bry can finish with mistakes and arrive at an empty or unrelated repair workspace. |
| Practice saves each submission as a separate attempt, but has no stable session/problem-instance linkage in the emitted record. Current questions and answers live in component state. | `UnitPractice.jsx`, submit handler and state declarations | High: grouping first tries and retries, reliable resumption, and explaining session results need a consistent contract. |
| Intermediate-step analysis is calculated but not attached to the practice attempt record. | `UnitPractice.jsx`, `stepAnalysis` and emitted attempt object | High: later review cannot reliably explain a mistake using that submitted step. |
| Twelve math units exist as a catalog, but ten have `hasLesson: false`; units 7–12 have `hasPractice: false` while advertising quiz capability. | `src/data/courses/mathFoundations.js` | Distinguish planned, exploratory, and fully learnable units. Verify question coverage before enabling quizzes. |
| Unsupported lesson routes fall back to the add/subtract fractions lesson. | `src/pages/Courses/LessonView.jsx`, registry lookup | Wrong material can appear under another unit's identity. Missing content needs an honest unavailable state, not unrelated fallback. |
| New unit quizzes reuse four fixed seeds and save attempts without the explanation retained in their in-memory results. | `src/pages/Courses/UnitQuiz.jsx` | Repeat quizzes may test familiarity; historical review needs the same problem/solution snapshot as immediate review. |
| Shared review already offers missed-first ordering, expanded first miss, answer comparison, and repair creation. Its all-correct copy claims a solid grasp even when answers used support. | `src/components/Study/SessionReview.jsx` | Reuse the useful implementation and correct overconfident language; guided accuracy is not independent retention. |
| The generator selects mostly numeric variants plus a rule check. Its recent-slip reinforcement selects a random problem in the same concept, not the actual missed subskill. | `src/utils/problemGenerator.js` | Random numbers and a “targeting recent slip” label do not establish targeted repair. |
| Gist pull replaces the entire local record after making one backup; it does not merge. Push sends the raw stored record. | `src/utils/githubSync.js` | Treat current sync as snapshot transfer. Before relying on multiple devices, add schema validation, redaction, revision/conflict handling, and recovery. |

GitHub calls `public: false` gists **secret**, not private: anyone discovering the URL can read them. Correct the product wording and exclude credentials from every upload. Source: [GitHub's gist documentation](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists). No real learner records or credentials were inspected or transferred during this review.

### Verification limits

Reran `npm test`: 226 passed. Separately ran `node --test tests/e2e/*.test.js`: 67 passed. These latter tests use Node and mocked localStorage; they are not browser-driven end-to-end verification. The default npm test script omits that subdirectory. Some passing stress tests explicitly characterize known defects, so the total is not a count of working user experiences. Production build, live API providers, touch behavior, formula layout, and theme contrast were not reverified in this review.

### Cohesive learning contract

Use one session identity and one problem-instance identity across lesson, lab, practice, feedback, repair, history, and tutor context. Preserve the problem snapshot, original answer, all retries, help events, optional intermediate step, and diagnosis provenance. Separate “I completed this lesson,” “I succeeded with help,” “I solved a fresh problem independently,” and “I remembered later.”

An incorrect active answer receives one hint and a retry opportunity. The learner explicitly chooses full explanation, even after repeated errors. Later review makes misses prominent, compares answers, and explains the relevant method. A guessed error pattern must say “possible”; an entered step or learner reflection must identify its source. Do not force learners to diagnose their own misunderstanding before receiving help.

Local storage remains reasonable for the present personal text-based tool. Whole-record writes, schema evolution, concurrent tabs, and growing attempt histories deserve focused checks. Use a storage interface before changing persistence technology; reconsider IndexedDB when image work or offline media becomes real scope. A backend rewrite is not necessary for this milestone.

The prerequisite graph needs capability checks as well as readiness checks: existing content, valid references, no cycles, consistent evidence policy, and honest unavailable states. Prerequisites should explain preparation and preserve Bry's ability to explore; hard gating is not assumed approved.

### Proposed visual direction

- Today: a spacious central study surface, one resume/start action, compact path, and a small repair/recall area. Avoid replacing a useful desk with a metrics grid.
- Learning workspace: stable header and action positions across activities. On wide screens, contextual explanation can sit beside the problem; on narrow screens, keep problem, feedback, and next action in a readable order.
- Mistakes: clear “Incorrect” text, restrained contrasting surface, visible submitted answer, and one obvious next action. Color supplements meaning. Correct answers with support remain visibly distinct.
- Typography: readable body text, restrained heading hierarchy, JetBrains Mono for numerical UI, KaTeX for typeset mathematics. Compact chrome must retain usable hit targets and keyboard focus.
- Themes: shared spacing, components, and semantic feedback states across Paper, Charcoal, and deep Pine/Cream. Judge all three on actual question/review screens, not just a palette sheet.
- Labs: begin with a prediction, allow manipulation, explain the observed relationship, then offer an independent paper problem. Every interaction needs a mathematical purpose and keyboard/touch alternatives.

## 2. High-priority enhancements

1. **Connected mistake review:** first tries grouped with retries; focused repair; saved explanation/rule; later fresh recall. This is the immediate priority.
2. **Meaningful problem families:** add comparison, estimation, missing quantities, explaining an invalid method, representation translation, and small applications—not merely new operands. Each family defines constraints, deterministic checking, hints, worked steps, subskill, difficulty dimensions, and a reproducible seed. Validate all supported formats and a broad sample of seeds; prevent invalid denominators and ambiguous answers.
3. **Embedded visual help:** reuse fraction bars and number lines at the exact point of confusion. Preserve the current problem while opening help. Add decomposition/place-value interactions next; an algebra balance follows when prerequisite arithmetic is ready. Trigonometry and function transformations remain later curriculum work.
4. **Transparent review scheduling:** distinguish immediate repair from later recall. Start with a documented, inspectable policy using independent outcomes, assistance, dates, and subskills. Treat FSRS-inspired scheduling as a later experiment, not an automatic proof of mathematical mastery. Do not infer useful calibration from sparse records.
5. **Practical study continuity:** a return card says what was underway and offers “Resume” or “Give me a quick example first.” A rulebook entry carries the rule, why it works, when to use it, a checked example, and Bry's own cue.
6. **Small engineering connections:** fractions through scale drawings, ratios through mixtures or gears, units through measurement. Keep contexts prerequisite-matched and optional; do not launch chemistry now.
7. **Optional tutor:** anchor requests to the current problem and consented work. Concise Explain / Hint / Check my step actions are more useful than a disconnected chat window. Cloud provider calls are not local inference. Core grading, visuals, and lessons must work without a key.

## 3. Proposed three-phase roadmap

| Phase | Deliverables and components | Pitfalls and quality gates |
|---|---|---|
| 1 — Cohesion and mathematical depth | Complete one fractions journey; unify `UnitPractice`, `UnitQuiz`, `SessionReview`, `Repair`, storage, and evidence selectors. Finish foundational content in teachable slices; add checked problem families. Introduce session/problem-instance records and a capability registry. | No unrelated fallback content, hidden mistakes, duplicate independent evidence, or lost drafts. Browser demonstration from initial error through repair and reload in all three themes. Preserve old records. Audit raw sync upload before encouraging its use. |
| 2 — Connected visual learning | Embed fraction bars/number lines in relevant lessons and help; add decomposition, then algebra balance when content is ready. Shared visual-state interface, prompt/prediction records, and accessible controls. | A visualization must teach a named concept and transfer to a fresh nonvisual problem. Check equal whole sizes, valid partitions, keyboard/touch use, reduced motion, and no solution leaks before requested reveal. |
| 3 — Reliable everyday use | Device strategy based on Bry's answer; offline core content, installability if useful, safe updates, validated backup/restore, conflict-aware sync, and a concise progress history. Exportable learning portfolio is optional later scope. | Never replace newer progress silently. Test offline/reconnect, two-device conflicts, failed imports, storage limits, and update during a session. GitHub Pages deployment needs tested base paths and deep-link handling. Video and provider AI need honest offline states. |

This ordering retains a personal companion as the target. “World-class” means trustworthy, clear, and satisfying to use; it does not require accounts, a social platform, or every subject at once.

## 4. Immediate Antigravity ticket — One trustworthy practice-to-repair journey

**Outcome:** after any six-question unit block, Bry can identify each original mistake, understand the relevant method, select a fresh repair, and resume it later. First implement and demonstrate with add/subtract fractions; reuse the same review contract in unit quizzes.

### Implementation sequence

1. Inspect current source and existing data contracts; preserve backups and legacy records. Use isolated fixtures. Record the baseline and failing browser path before changing code.
2. Add stable session and problem-instance IDs and durable active-session state. Store a complete authored problem snapshot, family/subskill, ordered submissions, assistance events, and optional step observations. Prefer additive adapters over rewriting historical records. Legacy records with missing details must say so.
3. Make first-attempt correctness, eventual correctness, and assistance separate summary fields. Group retries beneath their original problem. Save once per event; repeated clicks, remounts, and reloads must not duplicate evidence. Persist generated questions so resume does not reroll them.
4. Connect the unit completion screen to shared review. Show all six original problems; prioritize misses and skips. Preserve access even after a helped correct retry. Keep explanations and available worked examples accessible. Update mastery language to reflect only demonstrated evidence.
5. Have “Repair this skill” create/select a draft tied to the chosen original problem and route to its explicit draft ID. Choose a fresh problem matching the missed family/subskill. When none is available, explain that limitation and offer the relevant example; never silently substitute another skill.
6. Carry authored solution steps and submitted-step observations into stored review. Mark learner reflections as learner-reported. Do not present inferred causes as observed facts. Requested visual/example support records assistance appropriately.
7. On repair completion, return to the originating review with a clear repaired state and an optional rulebook save. Retain the original mistake and distinguish immediate recovery from future retention. A later recall task uses a fresh independent problem.
8. Apply the same question snapshot and review entry point to unit quizzes. Keep assessment feedback timing explicit; guided help must not silently remain classified as an independent quiz answer.

### Acceptance scenarios

- Miss two of six, correct one after a hint: review still exposes both initial misses and the helped retry; summary labels are unambiguous.
- Click repair on either miss: the selected mistake and a fresh matching problem appear, even when other drafts exist.
- Refresh during practice, feedback, repair, and completion: exact problem/order/work survives without duplicate attempts.
- Choose an example immediately, after several retries, or never: solution reveal respects the learner's choice.
- Skip, enter an equivalent fraction, enter an invalid format, or use a valid alternate intermediate method: each receives the appropriate outcome without inventing a misconception.
- Complete everything with help: no “mastered” or equivalent claim appears.
- Open old score-only history: explain missing detail rather than fabricating answers.
- Navigate back to Today: the same session evidence informs its recommendation. A completed repair does not erase history.
- Run existing suites plus targeted contract tests and an actual isolated-browser journey; verify desktop and a narrow viewport across all themes. No real learner storage is modified for testing.

### Confirmed preferences — October 7

- Continuous study session, with freedom to skip or explore. Preserve position when leaving and returning; do not force every activity type into every session.
- Mistake review opens with Bry's answer and the key issue. Offer expandable full steps and a relevant visual explanation. If the cause is uncertain, explain the mathematical mismatch or what to check rather than inventing a diagnosis. Visuals must match the problem; unavailable visual coverage needs an honest text alternative.
- Prioritize computer use with paper alongside. Phone supports quick reviews; do not simply shrink the desktop workspace.

The immediate ticket must honor these choices. Follow-up discussion should address quiz feedback timing, optional versus strict prerequisite gates, and how much freedom to mix familiar drills with new material.
