# Foundry v3 — product direction and design brief

October 7, 2026. Codex plans with Bry; Antigravity implements. This is a proposed major release, not a claim of shipped functionality or an instruction to rewrite the application. Read AGENTS.md and COHESION-REVIEW-2026-10-07.md for binding preferences and verified integration gaps.

## Newly confirmed

- Final planning follow-up: Bry is ready for implementation handoff. Antigravity remains the builder. No pixel/bit lettering; retain JetBrains Mono for numerical UI/labels and readable lesson typography. Use the build sequence at the top of ANTIGRAVITY_HANDOFF.md as the implementation starting point, with paper-photo review deferred.

- Offer an optional “Let me try first” check before explanations. A successful sample may shorten instruction for that skill; it does not demonstrate mastery of an entire unit. An incorrect answer offers help, without forcing a full lesson restart.
- Give unit-quiz feedback after each question. Preserve the original first response and distinguish helped retries. Immediate feedback can teach material useful for later questions, so label the result as a formative check rather than an untouched measurement of prior knowledge. Incorrect answers retain hint → retry → learner-controlled solution reveal.
- Bry wants a cohesive v3-scale product redesign. Propose substantial UI, architecture, and learning improvements while retaining the personal math-first scope.

## Product promise

Open Foundry, understand where to begin, work in one calm space, and leave knowing what improved and what needs another look. The product should remember the learning thread across sessions without making the learner manage a collection of disconnected tools.

## Proposed experience

### 1. The study desk

Keep Today spacious. Center the current learning thread: concept, reason for recommendation, saved position, and one start/resume action. A compact path shows preparation, current focus, and the next connection. A small secondary area holds repairs and later recall. Session intent choices can be “Continue learning,” “Refresh what I forgot,” and “Practice for a while.” Avoid turning the home screen into an analytics grid or showing unavailable courses as active destinations.

### 2. One continuous learning workspace

A stable problem canvas carries the learner through a short starting check, optional explanation, relevant visual activity, independent practice, and review. Let the learner change activities without losing place. Keep a compact session outline available; do not force every session through every stage.

An optional resizable desktop side panel shows a hint, worked example, visualization, rulebook entry, or tutor discussion. Preserve the problem and submitted work while switching support. On mobile, the same content expands beneath the problem with a brief restrained animation, honoring reduced motion and preserving input/focus. Full-screen lab exploration can be an optional expansion rather than a navigation dead end.

Use consistent controls: Check answer, Try again, Show one hint, Walk me through it, Show visually, and Continue. Omit unavailable actions. Keep correctness status and the next action close to the answer. A learning workspace should not require scrolling back to find the problem after opening help.

### 3. Mistakes that lead somewhere

Open review with the original answer and the key mathematical issue. Expand for steps or a matching visual explanation. Group retries under the same problem and distinguish supported recovery from independent success. If only a final answer is known, explain the mismatch without pretending to know the learner's reasoning.

The same review record can start a targeted repair, save a useful rule, and schedule a fresh later check. These are connected views of one learning event. Preserve old errors after repair so progress can show what changed.

### 4. A useful personal memory system

Proposed recall coach: brief optional blocks for procedure recall, useful arithmetic relationships, estimation, and recently repaired skills. Offer one worked example when requested, then a fresh problem. Keep mental-only drills distinct from calculator-free paper work. No default timer or speed-based judgment.

Rulebook entries should answer: when would I use this, why does it work, what are the steps, and what helps me remember? Connect entries to concepts and checked examples. Personal notes remain editable and clearly distinct from authored explanations.

### 5. A visible path toward engineering

Keep progression compact by default, with an expanded prerequisite view on demand. Show a few concrete abilities rather than a vague mastery percentage. Small applications connect fractions, measurement, ratios, and eventually algebra. Larger engineering mini-projects remain an optional later direction, with prerequisites stated honestly. Chemistry expansion stays deferred.

## Visual system proposal

Preserve text-only navigation and Paper, Charcoal, and deep Pine/Cream themes. Unify surface levels, spacing, corner radii, border contrast, feedback colors, typography, and motion across the app. Use restrained animation to explain state changes or preserve orientation; support reduced motion.

Readable body type, mathematical typesetting, and JetBrains Mono numerical controls each have a distinct role. The sidebar and compact controls can feel precise while the main study surface stays spacious. Avoid giving every paragraph its own card or turning all content into monospace.

Specify and prototype complete screen states: empty, loading, ready, incorrect, hinted, revealed, correct-with-help, independent-correct, paused, resumed, and unavailable. Validate all three themes using actual fractions and long explanations. On phone, prioritize short recall and review with usable touch controls, not a compressed desktop panel arrangement.

## Technical foundation proposals

- **Shared session engine:** explicit states and transitions for every activity. Keep UI display separate from learning records, grading, and recommendations. A quiz, lesson, and repair can share infrastructure without sharing identical evidence rules.
- **Stable records:** session, problem-instance, submission, assistance, and repair identifiers. Save exact problem snapshots and generation seeds. Reloads retain the same questions and state; repeated actions cannot double-count evidence.
- **Content registry:** each skill declares real lesson/lab/problem/quiz availability, prerequisite references, and supported answer formats. Validate references, graph cycles, and missing capabilities. No fallback to unrelated lessons.
- **Checked problem families:** parameters, constraints, deterministic checker, steps, hints, representations, and subskill tags. Vary reasoning tasks as well as operands. Do not depend on a live model for mathematical correctness.
- **Unified help context:** visuals, rulebook, and optional tutor receive the active problem and relevant consented work. Track assistance once. No isolated chat history silently changing mastery.
- **Durable storage boundary:** put data access behind a small shared interface, support additive migrations and recoverable exports, and make active sessions resumable. Choose a new persistence technology only when scope warrants it. Correct snapshot-sync conflicts and credential handling before promoting cross-device use.
- **Performance by purpose:** load expensive visual/tutor features when needed; keep input and checking responsive. Measure real learning screens before choosing performance work. Build/browser checks must exercise rendered components and transitions, not just helper functions.
- **Accessibility as part of the interaction design:** keyboard-operable labs, visible focus, understandable feedback announcements, accessible math, and touch alternatives to drag-only tasks.

These are architectural directions, not approved library or hosting changes. Antigravity should inspect the current implementation and reuse working components. A v3 release does not require a new framework, paid backend, or loss of existing progress.

## Delivery sequence

1. **Experience design:** settle visual character and help placement; make a connected prototype of Today → try-first → problem → hint → visual explanation → review → repair. Include all three themes and a phone review view. Ask Bry to judge a real task, not just a hero screen.
2. **Trustworthy foundation:** implement the immediate practice-to-repair ticket from the October 7 review, shared session persistence, capability checks, and evidence rules. Treat this as v3 infrastructure, not the full release.
3. **Complete fractions experience:** apply the agreed workspace design, meaningful question families, embedded visuals, recall, and rulebook connections. Demonstrate both short guided study and extended repeat practice.
4. **Rollout and depth:** migrate remaining math flows to shared contracts, preserve old progress, verify browser journeys, and then expand content. Offline/mobile and larger new features follow Bry's priorities.

## Confirmed visual and feature direction

Bry selected Modern Studio, with [Making Software](https://www.makingsoftware.com/) ([submitted Httpster reference](https://httpster.net/website/makingsoftware/)) as an illustration/editorial reference and Zen as the reference for calm navigation and controls. Inspected the public Making Software homepage on October 7: textbook-like prose columns, large annotated technical line drawings, figure labels, generous space, and restrained accent color. Borrow these principles, not the site's assets, branding, or exact layout. Keep Foundry's own three palettes. Use short readable lesson sections with purposeful interactive figures; the active problem workspace should retain clear, compact controls.

Confirmed: resizable optional side panel on desktop, animated inline expansion beneath the problem on mobile. Rule Match should feel like a calm puzzle game. Bry is interested in recall/Rule Match, engineering projects, and paper-work review; the proposed implementation order is recall first, small applications next, paper review later. This order is a recommendation, not a confirmed ranking of all three.

## Connected feature setup proposal

### Recall coach and Rule Match

Entry points: a small Today action, relevant unit pages, and a phone-friendly direct route. Start with short finite untimed rounds, for example six prompts; allow repeat, focused skill selection, and a mixed review of due or missed rules. No mandatory streaks, leaderboard, countdown, or punitive lives. Restrained placement animations and optional sound can provide feedback without game-show styling.

Round types: match a problem to a method; select the next valid step; spot a misapplied rule; match a formula to a diagram or meaning. Tap/select and keyboard controls must work without dragging. Ensure each prompt has a well-defined answer or accepts all valid methods; plausible alternative methods are not automatically mistakes. Vary answer positions and problem structure so repeated rounds do not depend on tile position or fixed wording.

Wrong answer follows the shared hint/retry/reveal policy. A round summary offers a checked explanation, matching visualization, rulebook save, and an optional fresh paper problem. Record recognition evidence separately from independent application and delayed recall. Route missed rules into shared review, with learner choice about starting repair. The core game uses vetted content and deterministic grading without paid AI.

### Engineering mini-projects

Make these optional applications within the same curriculum rather than a separate disconnected game. Each has a small brief, prerequisite list, diagram, several checkpoints, and a final artifact or explanation. Begin with fraction-friendly tasks such as assembling a measured strip to a target length; introduce scale drawings after ratios are taught. Later examples include gear ratios and measurement plans, constrained by actual lesson coverage.

At each checkpoint, reuse the workspace, hints, paper solving, and mistake review. Let the learner pause and return. Record skill-specific evidence, not blanket mastery from finishing a project. A project can supply problems for recall later without duplicating the original evidence.

### Paper-work review

Add an optional “Check my work” action on a problem or project checkpoint. First version can support typing one uncertain step; the later photo flow is choose/capture → crop/rotate → preview → confirm recognized mathematics → review a specific step. Keep original and interpreted work available for comparison and allow edits. Recognition uncertainty must not be graded as a math error; accept valid alternate methods.

Photo interpretation may need a cloud provider. Show the destination and data to be sent before upload, require explicit learner action, state retention behavior, and keep a no-AI route. Do not assume cloud sync or media storage is already safe or complete. A phone can initially review its own attached photo; a phone-to-PC handoff requires deliberate pairing or reliable sync and is separate scope.

### Shared implementation contract

All three features use the same skill IDs, authored problem-family metadata, assistance events, attempt history, and return-to-session links. The desktop/mobile layout shares learning state, though cross-device continuity requires sync work beyond responsive design. Browser acceptance checks must demonstrate each entry point returning to the original learning context without duplicate evidence or lost work.
