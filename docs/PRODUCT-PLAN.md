# MathFoundry product plan

Living plan, October 2, 2026. Owner of design/learning discussion: Codex with Bry. Implementation: Antigravity. This document supersedes conflicting earlier visual proposals. Existing working features are documented in IMPLEMENTATION-COHESION-2026-10-02.md; proposed work below is not yet shipped.

## North star

A personal study companion that helps Bry understand mathematics, retrieve it later, and use it in increasingly connected engineering problems. A successful session leaves Bry knowing what happened, why the method works, and what to do next.

A polished dashboard must make learning actions obvious, maintain consistent feedback across subjects, and preserve honest evidence. Appearance supports those goals.

## Decision register

Confirmed:
- Start with arithmetic and fractions; connect to algebra/geometry, then physics and later chemistry/coding. Chemistry remains deferred.
- Paper-first solving; one worked example generally helps recall a forgotten rule. Optional handwritten-work submission later.
- 30–60 minute sessions, optionally extended through resumable blocks; untimed by default. Calculator-free work permits paper; mental-only practice is separate.
- Text-only navigation. Spacious study desk with a compact learning path.
- Three themes: light paper, original charcoal/indigo dark, deep pine with warm cream. Colors should be consistent across all study screens.
- Repair sessions, a personal rulebook, and small engineering connections.
- Latest feedback: incorrect answers and explanations must stand out more; more visual learning interactions are wanted.
- Confirmed follow-up: after an incorrect answer, offer one hint and a retry before showing the solution. Solution reveal is always learner-controlled, including after repeated incorrect attempts. Keep a prominent “Walk me through it” action available; do not force a Socratic loop.
- Zen references specifically preferred: sidebar, typography, compact controls. JetBrains Mono is liked for numbers. Transparency is not a confirmed preference.
- First visual learning priority: manipulable fraction bars and number lines.
- Bry accepts occasional optional entry of one intermediate step to help pinpoint mistakes. Paper remains the primary workspace; do not require full transcription.

Proposed, awaiting discussion:
- Automatically open the first missed question, with a missed-first review view when misses exist.
- Sans-serif interface/body text, JetBrains Mono for numeric inputs, counts and aligned calculations; KaTeX retains mathematical typesetting.
- Rounded, inset study surface within a quiet tinted shell. Focus mode and a contextual split panel for example/tutor support.
- Implementation sequence for the confirmed visual priority: fraction bars/common denominators, then number lines, followed by proposed arithmetic decomposition.

Resolved first discussion round, October 2:
1. Hint, then retry, before the solution.
2. Zen sidebar, typography, and compact controls.
3. Manipulable fraction bars and number lines.

Confirmed follow-up: occasional optional intermediate-step entry is welcome. Confirmed second-error behavior: Bry chooses when to reveal the solution. The remaining assessment question is whether starting-point checks should defer feedback or switch into guided learning when help is used.

Ask subsequent questions in small rounds: how much scaffolding to offer, feedback color/intensity, preferred repair-session length, rulebook organization, and long-session behavior. Existing confirmed preferences should not be re-asked.

## Current gaps to address

Source review, October 2:
- `SessionReview` defaults to all questions, keeps details collapsed, and applies the same muted badge style to Correct, Revisit, and Skipped. The answer comparison is hidden until expanded. Review exists, but the important result lacks emphasis.
- Explanations generally state the right method. They do not establish which mental step caused a learner's error. No reliable reasoning diagnosis should be promised from a final answer alone.
- Foundation visuals are mainly fraction-equivalence strips. Broader explanations are predominantly text; engineering connections currently consist of two word problems.
- Repair selection matches concept/module and avoids source-block prompts, but may switch subskills. For example, module-level selection alone cannot ensure that an area question repairs a perimeter mistake. Define finer problem-family tags before expanding adaptive claims.
- The compact path is a slice of the concept list, rather than a traversal of prerequisites. Its layout should not imply that list adjacency proves readiness.
- Styling combines semantic tokens with legacy utility overrides. Consolidate shared components rather than accumulating page-specific color patches.
- The 48-hour recall and three-correct-across-two-blocks policy is a starter policy, not a validated mastery estimate.
- Rulebook consultation currently can mark parked foundation/repair drafts supported. Refine assistance to the activity actually being worked on; do not label unrelated parked work helped.

## Learning interaction contract

Every graded activity should answer: Was my answer correct? What can I try next? After an explicit solution request: what was expected, and why does the method work?

Proposed feedback hierarchy:
1. Clear status text near the answer: Incorrect, Correct, Skipped, or Input needs clarification. Show support use separately from correctness.
2. During active practice, keep the submitted answer visible and give one targeted hint. Offer Retry and Show the method; do not reveal the correct answer through text, an answer-colored diagram, or a prefilled control before the learner requests it.
3. On solution reveal or later session review, show Your answer and Correct answer in an easy-to-compare layout, followed by the explanation and useful visual representation. Highlight a mismatched step only when actually observed.
4. Offer a distinct worked example, a fresh follow-up, save-rule action, and deeper tutor help. After a second or subsequent error, retain Retry and a prominent “Walk me through it” action. Never reveal the answer automatically based on attempt count or elapsed time. Let Bry pause or move on without forcing a solution reveal.

Save the first response before the hint. Link same-problem retries to that response; do not replace it or count each retry as new independent mastery evidence. Help accessed on the problem makes the retry supported. A later fresh problem with the hint hidden provides separate evidence. Diagnostic/check flows must explicitly label whether they are assessing independent work or switching to guided learning; do not silently mix the two.

Use stronger warm error emphasis for incorrect responses, distinct neutral/amber treatment for skipped work, and a separate support label. Provide text and structure in addition to color; quiet chrome must not make feedback faint. Avoid celebratory effects that interrupt study.

### Explaining why honestly

Offer a small “Show one step” input when it materially helps: chosen common denominator, rewritten equivalent fraction, intermediate arithmetic result, or equation after an operation. Explain the purpose, allow skipping, and accept mathematically valid alternate methods (including nonleast common denominators). Do not ask on every problem. Preserve exactly what was entered and when; distinguish steps recalled after feedback from work supplied before help. A volunteered step is not automatically assistance, while a scaffold that supplies part of the method is. Check deterministic step relationships where supported; otherwise ask for clarification rather than assert a cause.

Store the basis of a diagnosis: directly checked step, learner report, or possible pattern. If only a final answer is available, explain the correct method and offer a short clarification such as “Did you add the denominators, or did you take another route?” Allow “something else” and “not sure.” A learner-reported cause is useful evidence, not an objective certainty.

Example for an authored demo: 1/2 + 1/3, submitted 2/5. First hint: “Are both fractions using the same-sized pieces?” Allow a retry with optional manipulable bars. On solution reveal, show the correct sum 5/6 and equal-length bars partitioned into sixths. Explain that adding requires equal-sized pieces. Say “2/5 can result from adding both numerators and denominators” until that step is confirmed; do not claim the app observed unwritten work.

Record method choice, calculation, interpretation, and input-format issues separately when evidence supports that distinction. Invalid notation should prompt clarification before recording a mathematical failure. A correct answer after help stays distinct from independent recall.

### Complete session rhythm

Opening: current focus and why it was chosen, plus resume.
Study: retrieval → concise example if needed → guided manipulation/steps → independent problem → optional application.
Closing: what was answered correctly, missed, skipped, or supported; a direct repair path; a useful next stopping point.
Later: revisit the same skill in a different form without visible scaffolding. Preserve the original response and record new attempts separately.

The rhythm is a proposal for session orchestration. Current minute selections are planning choices, not an implemented timed curriculum. Do not suggest otherwise.

## Visualization roadmap

| Priority | Interaction | What it teaches | Evidence and verification |
|---|---|---|---|
| First | Fraction bars with common-denominator repartitioning | Equal-sized pieces; changing partitions preserves quantity | Prediction before manipulation; exact rational model; equal whole lengths; later independent numerical problem |
| Next | Number line with draggable point and keyboard controls | Magnitude, equivalence, negative numbers | Explicit units/range; snap behavior described; signed rational checking; no coordinate tolerance hidden from the learner |
| Next | Decomposition tiles/arrays | Mental arithmetic strategies and inverse checks | Show 7 × 6 as 5 × 6 + 2 × 6; invite an alternate decomposition; optional paper answer |
| Later | Area grid for multiplying fractions | A fraction of a fraction | Equal whole; labeled dimensions; compare result to the inputs; distinguish area from length |
| Later | Balance/equation manipulation | Applying equal operations to both sides | Every manipulation corresponds to a valid algebraic transformation; optional symbolic entry |
| Later | Scale drawing and measurement laboratory | Transfer fractions/ratios into physical interpretation | State scale and units; update drawing and calculation together; avoid unsupported real-world guarantees |

Each visualization needs an explicit learning objective, predict/manipulate/explain/independent stages, reset/undo, keyboard/touch alternatives, static text fallback, reduced motion, and saved meaningful state. Merely dragging the correct object into a highlighted slot is supported interaction, not proof of independent mastery. Do not gate understanding on fine motor accuracy.

## Design system direction

Translate Zen's focused workspace idea into a persistent text sidebar and an inset study canvas. Explore a collapsible focus view and optional split support panel. Use translucent effects only on chrome where contrast remains predictable; keep mathematical work on stable opaque surfaces. Do not copy browser tabs as the learning navigation.

Type roles: readable sans for prose/navigation; JetBrains Mono for numeric fields, counters, aligned calculations and future code; KaTeX for fractions, radicals, exponents and equations. Large serif display headings are an existing choice, not a confirmed preference; prototype a smaller sans heading alternative for Bry.

Define tokens for background, surface, raised surface, border, text, muted text, accent, focus, incorrect, correct, skipped, and assistance in all three themes. Include hover, selected, disabled, loading, empty, save-failure, and restored-session states. Use one consistent scale of spacing, corner radii, controls and panel widths. Keep the compact path secondary to the current task.

Design references (official): [Zen compact mode](https://docs.zen-browser.app/user-manual/compact-mode), [Zen split view](https://docs.zen-browser.app/user-manual/split-view). These support focus/split-layout inspiration; the proposed palette, typography roles and teaching interactions are MathFoundry design decisions.

## Ordered implementation tickets

### P1 — Feedback and review clarity

Touch: SessionReview, Foundations feedback, Repair feedback, mixed-practice summary, quiz/diagnostic result surfaces, shared style tokens.
Deliver: immediately identifiable wrong answers; hint → retry → solution-on-request during active practice; missed-first review proposal; first missed item expanded; answer comparison; concise explanation; one-step entry to repair (replace Prepare then Start where safe); correct/skipped/supported/legacy states; exact return link to the source session.
Acceptance: a six-question fixture with all statuses can be understood without opening multiple rows; every original response remains accessible; assistance is not counted as a second mutually exclusive correctness category; all-correct session has an appropriate success state; keyboard and three-theme checks pass. Error explanations do not invent a cause. Optional step capture supports skip, alternate valid methods, and an honest explanation grounded in the entered step. The hint state does not leak the answer; same-question retries preserve the initial response and are not counted as independent evidence. Explicitly requested solutions remain accessible. Verify that second and subsequent incorrect submissions never auto-reveal a solution.

### P2 — One complete fraction visualization

Touch: reusable Study visualization component, foundational problem metadata, grading tests, evidence storage as needed.
Deliver: the 1/2 + 1/3 interaction above with authored variants, step explanation, optional worked example, fresh independent follow-up, and saved progress. Do not add several disconnected visual demos.
Acceptance: whole lengths remain equal, rational quantities stay exact through partition changes, each model agrees with numerical grading, keyboard/touch work, diagram assistance is recorded appropriately, reload restores state, and the independent follow-up remains solvable on paper.

### P3 — Shell and typography polish

Deliver: three-theme component sheet plus Today, active problem, incorrect feedback, session review, and repair screens at desktop/mobile widths. Use confirmed text-only navigation and compact path. Show two focused heading/surface alternatives if Zen preferences remain unresolved.
Acceptance: no page-specific hardcoded colors undermine themes; strong feedback contrast; mathematical typesetting preserved; essential controls remain visible in focus mode and on small screens; no floating controls cover answers.

### P4 — More precise repair and rulebook

Deliver: subskill/problem-family tags, matching repair examples and follow-ups, bounded novelty policy, preserved multiple repair records, concept-organized rulebook entries with “when to use,” checked example, common pitfall, own notes, and return-to-study.
Acceptance: subtraction repairs subtraction and perimeter repairs perimeter unless a prerequisite step is explicitly explained; no repair silently destroys another unfinished repair; user notes survive resaves/backups; assistance attaches only to the active task; later recall does not erase original mistakes.

### P5 — Cohesive session planning and progress

Deliver: real prerequisite-based compact path, consistent shared attempt evidence across subjects, explained recommendations, review prioritization, resumable long-session blocks, optional reflective cause input.
Acceptance: distinct histories produce different explainable recommendations; helped performance and delayed independent recall remain distinguishable; recommended review has a clear reason and endpoint; no precise mastery claims from sparse evidence.

### P6 — Controlled content expansion

Arithmetic/fractions first: place value, factors/multiples, negatives, decimals, percentages, ratios, estimation and units. For each skill author meaning, procedure, calculation, error-detection and application variants where appropriate. Then strengthen algebra/geometry bridges and define a small physics slice. Keep chemistry/coding on the roadmap until separately scoped.

Photo-work review, cloud sync/backup restore, tutor budget controls and broader engineering simulations need separate briefs. Expand only after the common learning flow is reliable.

## Handoff and review cadence

Build one coherent ticket at a time. Return an implementation summary, screenshots, exact test outcomes, known limits, and a reproducible learner journey. Codex reviews against this plan and discusses the next consequential choices with Bry. No feature is complete merely because a button exists; its feedback, learning record, reload behavior and recovery states must work.
