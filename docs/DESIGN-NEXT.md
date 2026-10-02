# Next design pass — proposal, October 2, 2026

The initial cohesion implementation is now recorded in [IMPLEMENTATION-COHESION-2026-10-02.md](IMPLEMENTATION-COHESION-2026-10-02.md), including remaining limitations. The design decisions below guided that build. Bry requested a cleaner sidebar, multiple themes, a darker forest palette, restoration of the original dark theme, and further overall polish. Bry has confirmed text-only navigation and a spacious study-desk Today screen with a compact learning path. Exact destination labels and visual details below remain proposals.

## Fix the theme foundation first

The original dark option still exists in Settings, but the later `:root` palette in `src/index.css` overwrites dark tokens of equal specificity. The header toggle cycles only between light and forest. Resolve both defects before judging the visual designs.

Provide three explicit, complete palettes: Light paper (warm neutral), Original dark (neutral charcoal with restrained indigo), and Deep forest (near-black pine with warm cream text and subdued moss accents). Forest should feel dark through its backgrounds, not through dimmed text. Initial forest candidates: background #091B15, surface #10271E, raised surface #193529, text #F1EAD8. These are prototype values pending contrast checks and visual review.

Use a named theme picker with swatches in the header and Settings, persist the choice, and apply semantic tokens across navigation, lessons, quizzes, dialogs, tutor, charts, feedback, and math rendering. Remove conflicting legacy color overrides. Preserve progress and existing theme preferences.

## Simplify navigation

Propose four primary destinations: Today, Learn, Practice, and Progress. Put foundations, geometry, algebra, and the prerequisite map inside Learn; place assessments within the relevant learning/profile flow. Keep Settings at the bottom. Preserve direct routes and access to existing activities.

Use text-only navigation, as confirmed by Bry: remove the assorted Unicode indicators and do not replace them with icons. Prefer readable sans-serif labels, a restrained active background and stronger label weight, and no thin active-edge stripe. Use visible keyboard focus independently of the active state. Remove repetitive status/future-course filler and reconcile the purple logo with each palette.

## Make Today feel personal

Build the page around one clear start/resume action and the evidence supporting it. Beneath it: a compact review queue, current learning path, and one concrete recent achievement. Keep subject browsing available without letting it compete with the next study action. Use strong typography, intentional spacing, and a useful concept illustration where appropriate, rather than adding decorative metrics.

Confirmed layout direction: a spacious study desk. Give the main study/resume area most of the width, with a compact learning path beside it on wide screens. Show the current concept and nearby steps, with access to the full map. On narrow screens, place the path below the primary study action. Keep session review and worked-example access easy to find within this calm layout.

Show what a session actually contains. Duration choices must not imply a timed or fully orchestrated study program until that behavior exists. Avoid unsupported claims about Bry's diagnostic results or mastery.

## Give studying a consistent workspace

Use a spacious central problem area, readable math, quiet block progress, and stable answer/feedback placement. Keep paper-first solving comfortable. Provide one worked example on request, then a distinct independent follow-up; reveal deeper explanation and tutor help progressively. Use visual manipulation only where it teaches the concept.

Unify the visual treatment of the new foundations flow and existing algebra/geometry screens. Broader curriculum and handwritten-work submission remain separately scoped. Review and worked-example support are core requirements of this pass, not deferred polish.

## Complete the learning loop throughout the hub

Bry reported a completed foundations block showing four independent correct responses with no way to review missed problems from the summary. Source inspection confirms the summary only displays counts. Progress exposes only the five most recent foundation attempts with recorded answers and explanations; this is not a complete session review.

Prioritize this functional gap alongside theme repair, before cosmetic expansion:

- Every completed practice block, lesson quiz, and diagnostic offers Review this session, with all questions and filters for incorrect, skipped, and supported responses. Correct responses remain reviewable too. Show correct/incorrect/skipped totals separately from assistance, which is an overlapping dimension.
- Each review item retains the original prompt, relevant choices/diagram, submitted answer, expected answer, and checked step-by-step solution. Where older records lack details, explain that limitation without inventing history.
- Offer a distinct worked example of the same concept, an optional guided problem with intermediate steps, and a fresh independent follow-up. Keep these actions accessible during study as well as after it. Core solutions and grading must work without paid AI.
- Persist session history and a mistake/review collection accessible from Progress, Today, and the relevant concept. Starting a new block or reloading must not erase access to prior work. A later successful retry adds evidence without rewriting the original attempt.
- Give the tutor the selected problem and actual submitted answer so help refers to the work being reviewed. Do not infer a specific misconception solely from a wrong final answer.
- Revisit the concept later without visible scaffolding; distinguish supported learning, immediate independent success, and delayed recall.

Acceptance: finish a six-question block containing correct, incorrect, skipped, and supported attempts; inspect every original response and solution; work through an example and a different follow-up; start another block and reload; return to the original review with records intact. Apply equivalent checks to mixed practice, lesson quizzes, and diagnostics. The next prototype must include the completion → review → worked example → fresh attempt flow.

## Prototype and acceptance

### Confirmed additions: repair, rulebook, and engineering connections

Bry accepted all three additions on October 2. These are planned features, not claims of implemented behavior. Deliver them in this order:

1. **Repair sessions:** launch from a completed session, a saved mistake, or Today's review queue. Review the original response and checked solution, offer one worked example and optional guided steps, then give a different independent problem. Save progress through the repair block and schedule later recall. Preserve the original attempt; neither viewing a solution nor repeating its answer demonstrates independent mastery. Keep the session short, optional, and resumable, with no punitive wording.
2. **Personal rulebook:** let Bry save a checked explanation and worked example from a lesson or review, organized by concept. Include when the rule applies, meaningful intermediate steps, and links to practice and relevant saved attempts. Support optional personal notes, clearly separate from vetted explanations. Keep the rulebook available from Learn and contextual study help without adding another primary navigation item. Record rulebook use during an attempt as assistance. Include saved entries and notes in local backups.
3. **Small engineering connections:** author occasional short applications matched to current prerequisites, beginning with fractions in scale drawings and arithmetic in measurements. Introduce ratios/gears only when that mathematics is available. State any needed assumptions and units, validate answers and explanations, and link back to the shared concept. Keep these optional and scoped to learning; chemistry remains future work. Do not double-count an application as multiple independent attempts.

Extend acceptance checks to cover a repair session resumed after reload, a saved rulebook entry reopened from its concept and included in backup, and a checked engineering application whose prerequisites and learning evidence are accurate.

1. Prototype the sidebar, Today, and one complete fraction interaction in all three themes before extending the treatment across the app.
2. Use the confirmed text-only navigation and spacious study-desk layout with a compact path; review the prototype's hierarchy, readability, and learning flow.
3. Implement shared theme/navigation primitives and extend them to existing screens.
4. Verify all themes through selection, reload, and navigation; check narrow screens, keyboard focus, text contrast, feedback states, math readability, and tutor/dialog surfaces. Recheck saved study continuity without modifying real progress.

Success: every theme is visibly distinct and complete; the original dark palette works; navigation feels clean; the next study action and its reason are obvious; learning screens feel like one product.
