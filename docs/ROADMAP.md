# MathFoundry: personal engineering learning companion

Planning baseline: October 1, 2026. This document records the user's direction and proposed implementation sequence; it is not a claim that these features are implemented.

## Purpose and learner

Help Bry independently build the mathematical and scientific understanding needed to learn engineering. This is currently a personal learning companion, not a coursework/deadline manager or a promise of professional qualification.

Start with foundational math, including arithmetic and fractions. Bry reports difficulty remembering concepts later and occasional difficulty with basic calculations. Treat these as areas to assess, not diagnoses or proof that all foundations are weak. Progress toward advanced mathematics, physics, chemistry, and potentially coding. Chemistry is a future expansion, not the current implementation focus.

A normal session should fit 30–60 minutes. Allow optional extended practice up to 3–4 hours in resumable blocks, including repetitive fluency work. Mix guidance with free exploration. Never equate longer time, speed, or a streak with understanding.

Astra refers to help with design and implementation, not the default paid runtime tutor model. Runtime AI should be configurable and cost-conscious; core study must work without an AI call.

## Accepted product direction

- Useful home screen with a clear next action and an explanation of why it is recommended.
- Honest learning profile that distinguishes unassessed knowledge, supported success, independent performance, and later retention.
- Prerequisite map connecting foundations to advanced concepts.
- Meaningful problem variety, beyond changing numbers in multiple-choice questions.
- One coherent tutor with teaching, hint, reasoning-check, and assessment modes.
- Calm, distinctive, interactive design; Bry enjoyed learning with Brilliant. Use that as experiential inspiration, not a copied interface.
- Light and forest themes. Exact forest palette remains to be chosen with Bry.
- Architecture and roadmaps for additional subjects, including explicit connections between them.

## Learning experience

Confirmed October 2 additions: repair sessions, a personal rulebook, and small engineering connections. Prioritize repair sessions built on complete session review, then a rulebook of saved checked explanations/examples with personal notes, then optional prerequisite-matched engineering applications. Integrate these with shared concept evidence and existing navigation. See [DESIGN-NEXT.md](DESIGN-NEXT.md) for scope and acceptance checks. These additions are accepted plans, not yet implemented features.

### Home: Today

Show a primary recommendation, its evidence, a session-length choice, and a direct start/resume action. Below it, show a small review queue, the current concept, one concrete sign of progress, and an optional application or exploration. Avoid filling the home screen with generic motivational text, percentage rings, or a large analytics grid.

Example: “Practice equivalent fractions — you solved these with a hint yesterday; let's try independently today.” This is illustrative copy, not a statement about Bry's actual results.

### Session design

Proposed 30-minute starting template: 5 minutes of retrieval, 10 minutes of a concept or worked example, 10 minutes of independent practice, and 5 minutes of reflection/application. These are adjustable product defaults, not a prescribed learning schedule. A 60-minute session can deepen the concept and application. An extended session should offer additional blocks, saves, and optional breaks without pressure to finish a quota.

Offer Guided Study, Review, Focused Drills, and Explore. Repetitive drills should target a chosen skill, allow untimed work, provide useful feedback, and have an understandable completion point. Exploration must remain accessible even when a prerequisite is not yet demonstrated; explain recommended preparation.

### Retention and evidence

Schedule later retrieval and reassess after delays. Separate immediate success from retained knowledge. Record assistance and attempts; a correct answer after a worked solution is different evidence from an independent first attempt. Optional confidence input can help identify uncertain correct responses without interrupting every problem.

Use concept-level states such as Unassessed, Learning, Independent, and Retained, with evidence counts and last-practiced dates. Do not claim precision from two diagnostic questions or label untested knowledge as zero mastery. Retention thresholds and review intervals need a documented, testable policy before implementation.

Maintain an error notebook with the problem, submitted answer or reasoning, feedback, assistance, implicated concepts, and a retry action. Allow corrections to inaccurate AI feedback.

October 2 priority clarification: Bry explicitly requires review of missed questions and examples to work through throughout the entire hub. Complete session review, saved mistake history, checked step-by-step solutions, optional guided examples, and fresh independent follow-ups are essential to the next cohesion pass. Cover foundations, mixed practice, lesson quizzes, and diagnostics; do not treat a score-only completion screen or the five-entry recent-work list as sufficient. See [DESIGN-NEXT.md](DESIGN-NEXT.md) for flow and acceptance criteria.

## Curriculum roadmap

### First release: foundations

Audit and supplement the existing geometry/algebra content with number sense, place value, arithmetic operations, negative numbers, order of operations, fractions, decimals, percentages, ratios/proportions, estimation, and units. Use a short branching assessment with a skip/unsure option, followed by targeted checks rather than a long examination.

Then bridge to expressions, equations, inequalities, graphs, geometry, and functions. Sequence through prerequisites, not solely module order. Keep previously learned concepts in review as new ones are introduced.

### Later mathematical progression

Develop trigonometry, vectors, more advanced functions, calculus, linear algebra, and differential equations as separately scoped additions. Define prerequisites and evidence of readiness for each; do not present empty courses as available learning experiences.

### Cross-subject expansion

- Physics: units, graphs, vectors, motion, forces, energy, then deeper mechanics.
- Chemistry: future scope; connect ratios, unit conversion, scientific notation, and algebra to measurement and quantitative chemistry before specialist content.
- Coding: optional later path; connect variables/functions, logic, numerical calculation, data visualization, and simulation.
- Engineering applications: progressively combine math, physical interpretation, computation, assumptions, and checking whether an answer is reasonable.

Example bridges: fractions → ratios → scale drawings; units and proportions → quantitative science; graphs → motion; vectors/trigonometry → forces; algebra/functions → simple computational models. Mark examples as future activities until authored and checked.

Model a shared concept once and link it to subject-specific uses. Each application should identify required concepts and feed relevant evidence back to those concepts. Avoid counting the same response multiple times as independent proof of mastery.

## Problem and tutor design

Build vetted problem families with controlled parameters, answer validation, explanations, concept tags, prerequisites, difficulty, and misconception tags. Add numerical entry, estimation, visual manipulation, number lines, diagrams, worked-example completion, error diagnosis, ordering steps, explanation, word-to-equation translation, and unfamiliar applications. Do not force every format into every concept.

Provide mathematical-equivalence and unit-aware checking where needed, with tolerances stated. Distinguish conceptual errors from arithmetic slips and input-format mistakes. Prefer deterministic grading where possible. AI-generated content must be checked before it affects the learning record; uncertain grading should be visible and correctable.

Tutor modes: Explain/Teach, One Hint, Check My Reasoning, and Quiz Me. Adapt explanation to the concept and learner evidence rather than assigning a fixed learning-style label. Preserve productive independent attempts, but allow an explicitly requested worked example. Follow help with an independent problem when appropriate.

Give the tutor actual recent errors, assistance history, review needs, and current activity through a single consistent data model. Do not let a tutor conversation silently mark a concept mastered. Use concise optional session debriefs and configurable, bounded AI context. Track runtime usage/cost if supported; select provider/model/budget later with Bry.

## UI and design direction

Confirmed follow-up: Bry prefers proper text-only navigation and a spacious study-desk Today screen with a compact learning path. Use these choices in the next prototype; they are no longer open preference questions.

October 2 design follow-up: Bry requests cleaner navigation indicators, a darker deep-pine forest, multiple discoverable themes, and restoration of the original dark palette. See [DESIGN-NEXT.md](DESIGN-NEXT.md) for the proposed next pass and confirmed theme defects. The three-theme requirement supersedes the earlier two-theme scope; navigation/layout details remain proposals.

Use a small navigation set: Today, Learn/Map, Practice/Review, and Progress; tutor access stays contextual. Final labels should be tested in prototypes.

Make the learning workspace the main visual focus: readable math, clear instructions, spacious problem area, optional scratch/work area, and a contextual tutor panel. Use progressive disclosure for hints and supporting details. Give interaction and diagrams a purpose; avoid decorative dashboard widgets and excessive engineering jargon.

Use readable body typography, a distinctive but restrained heading style, and monospace only where useful. Semantic color tokens should support both light and forest themes. Convey correctness and priority with text/icons as well as color. Support keyboard interaction, visible focus, reduced motion, responsive layouts, and accessible math rendering. Prototype Today and one full problem interaction before reskinning every page.

## Implementation sequence and acceptance gates

1. Restore and audit the current app: verify the running source/version, preserve/export existing learning data, inspect stored diagnostic structure in the user's actual browser, review content coverage, and establish version control if appropriate. Acceptance: app loads and existing results remain available.
2. Repair the shared learning data: fix mastery/schema mismatches, accurate tutor context, idempotent session saving, same-session state refresh, lesson completion versus learning evidence, and legacy route behavior. Acceptance: a diagnostic, practice attempt, summary, dashboard, and tutor all agree on the same evidence; retaking or revisiting does not duplicate records.
3. Add foundational assessment and retention: concept map, foundational problem families, targeted assessment, assistance-aware records, and review scheduling. Acceptance: distinct learner histories produce explainable different recommendations; delayed checks can change retention status; unassessed skills remain explicit.
4. Prototype the new experience: Today and the learning workspace in light and forest, with a complete guided session and optional drill continuation. Acceptance: Bry can understand the next step, its reason, and how to get help or explore independently.
5. Expand variety and tutor modes: validated question families, error notebook, explanation and application tasks, coherent tutoring. Acceptance: sampled generated variants have valid answers and explanations; hint use and retries are represented accurately.
6. Expand subjects incrementally: strengthen math first, then define a physics vertical slice; scope chemistry and coding later. Acceptance: each new subject reuses shared concepts and evidence while supporting its own representations and grading.

## Open decisions for the next discussion

- Preferred answer/work input: keyboard, paper plus optional photo, drawing tablet, or a mix.
- Which Brilliant interactions Bry liked most: visual experiments, short guided questions, immediate feedback, or progression.
- Forest palette/reference and preferred default theme.
- Initial milestone: everyday numerical confidence, algebra readiness, or another concrete target.
- Local-only versus backup/sync; tutor provider and spending limit.

## Audit status and implementation gate

The October 2 audit is recorded in [AUDIT.md](AUDIT.md). Source review covers the active learning flows, all 18 module files, diagnostic and adaptive banks, with isolated browser diagnostic/practice sessions. Build passes, but lessons crash and evidence/grade/rendering defects remain. Bry's original localhost diagnostic and external AI providers were not tested. Nothing assumes that diagnostic was lost.

Before the visual prototype, repair lesson routing, untrusted tutor rendering, duplicate session saves, grading defects, and shared evidence selectors. Preserve/export original data and establish a recoverable source baseline before migrations. The first new curriculum deliverable should be one complete arithmetic/fractions learning loop, including an optional worked example, independent follow-up, and later retrieval. Keep broader redesign and future subjects behind that acceptance gate.

## Confirmed learner preferences: follow-up

- Paper beside the computer is the preferred working method. Do not require typing every intermediate step or using an on-screen scratchpad. Provide enough space and time to work offline, then enter an answer and optionally report confidence or request help.
- Optional submission of handwritten work would be useful for complex problems. Scope this after the core foundations loop. Show the interpreted mathematics for confirmation before evaluating it; distinguish unreadable work from a mathematical error. Explain storage/transmission before uploading to a tutor provider, and avoid retaining images unnecessarily.
- Bry enjoyed Brilliant's clear progression, gradual introductions, repetition, visual manipulation, and immediate explanations. Preserve those qualities while checking independent understanding: fade scaffolding, offer an attempt before revealing explanations, vary problem structure, and revisit concepts later without cues. Avoid treating completion of heavily guided steps as independent mastery.
- The first learning milestone is confidence with arithmetic and fractions. Establish a baseline before setting numerical targets or promising a one-month outcome. Assess number sense, operations, estimation, fraction meaning/equivalence, comparison, and fraction operations, then prioritize demonstrated needs.
- A successful foundations milestone should include solving representative problems independently, explaining or visually demonstrating why an answer makes sense, and succeeding again after a delay. Speed is optional and separate from understanding.

These confirmations resolve the work-input, Brilliant-preference, and initial-milestone questions above. Exact theme palette, backup/sync, and runtime AI budget remain open.

## Fractions and calculator-free practice clarification

Bry identifies remembering fraction rules and doing mental arithmetic as the main difficulties. Bry reports that some UNM teachers discourage calculators; do not generalize this to an institution-wide rule. Conceptual understanding still needs assessment rather than being presumed strong or weak.

- Separately assess choosing the procedure, carrying out arithmetic, and checking the result. Record an arithmetic slip separately from a fraction-procedure error when the submitted work supports that distinction; do not infer the cause from the final answer alone.
- Include short recall prompts for fraction procedures, a brief visual/meaning-based explanation when a rule is forgotten, supported practice, and later independent retrieval.
- Include untimed mental-number practice: number decomposition, multiplication/division relationships, useful multiples, factors, and estimation. Select targets from observed performance.
- Provide calculator-free practice with paper explicitly allowed. No calculator does not imply doing every step mentally. Encourage written intermediate steps and scratch calculations; assess mental fluency separately when that is the selected activity.
- Keep optional calculator/checking support distinguishable from independent calculator-free evidence. Do not introduce speed pressure or treat calculator use as failure.

## Preferred support when a procedure is forgotten

Bry reports that seeing one worked example typically brings the procedure back. Default the help flow to an optional concise worked example with visible intermediate calculations, followed by a similar but different problem to solve independently on paper. Offer a deeper explanation if requested or if difficulty persists. Do not force a full lesson restart or repeated Socratic questioning when Bry requests an example. Record the supported attempt separately from the independent follow-up, and schedule a later check without the example visible. This preference is a starting point, not proof that the concept is retained.


## Implementation milestone — October 2, 2026

Bry authorized implementation and selected deep pine with warm cream for the forest theme. The first working slice and verification are recorded in [IMPLEMENTATION-2026-10-02.md](IMPLEMENTATION-2026-10-02.md). Today, a foundations starting check, supported/independent evidence, introductory recall policy, saved study blocks, recent-work review, backup downloads, and theme prototypes are implemented. Core lesson/practice/tutor repairs are included. Broader curriculum, branching assessment, restore/sync, live AI cost controls, and future subjects remain scoped work; this does not mark every phase above complete.

## Cohesion follow-up implemented — October 2, 2026

The accepted text-only navigation, study-desk Today, three-theme repair, shared session review, saved history, repair follow-ups, personal rulebook, and two small engineering applications now have a working implementation. See [IMPLEMENTATION-COHESION-2026-10-02.md](IMPLEMENTATION-COHESION-2026-10-02.md) for verification and limits. Broader question families, deeper guided interactions, curriculum expansion, photo-work submission, and restore/sync remain future scope.
