# MathFoundry audit — October 2, 2026

## Conclusion

The app contains both a Daymark-inspired visual refresh and partially implemented cohesion features. Diagnostic recommendations, adaptive practice, shared storage, and a global tutor exist, but they do not form a reliable end-to-end learning experience yet. A redesign alone would conceal rather than solve these problems. Repair the learning record and grading first, then build the arithmetic/fractions experience around Bry's preferences.

This was a review, not an implementation pass. No application source was changed. The roadmap and project instructions record the agreed direction.

## Scope and verification

Reviewed routing, active pages/components, storage, diagnostic scoring, adaptive selection, tutor integration, themes, lesson/practice/quiz flows, all 18 module content files (10 geometry, 8 algebra), the 20-question diagnostic, and the 60-item adaptive bank. Inspected legacy speed-run code as inactive source. Content review identifies concrete defects; it is not a mathematical certification of every question or every generated variant.

- Production build passed; main bundle emitted a warning above 500 kB.
- Lint exited successfully with 45 warnings. Passing these checks did not catch the lesson route failure.
- Browser tests used an isolated `127.0.0.1:5173` origin to avoid overwriting Bry's `localhost:5173` progress.
- Home loaded. Opening Points & Lines reproduced `learningPaths is not defined`.
- Completed a synthetic 20-question diagnostic (10%, 2/20). Home displayed the resulting gaps and recommended Points & Lines. This demonstrates fresh diagnostic personalization, not recovery or verification of Bry's actual diagnostic.
- Completed a synthetic 12-question practice session (17%, 2/12), exercising the five formats. Confirmed retained input between consecutive fill questions, already-ordered sequence questions, and poor question contrast in light mode.
- The browser session became unavailable before a final dashboard/reload persistence check. Duplicate-save risk below is source-confirmed, not a claimed observed history count.
- No external AI requests, paid calls, credential tests, or inspection of Bry's original browser data. No Git repository was present, so changes could not be attributed commit-by-commit to Antigravity.

## Priority findings

### P1 — Lessons fail at the route boundary

`src/pages/ModulePage.jsx:116–117` references `learningPaths` without importing it. The module screen crashes before study can begin. Reproduced in the browser. Import/resolve the curriculum consistently and exercise geometry and algebra routes.

### P1 — Practice results do not drive adaptation correctly

`src/utils/storage.js` stores mastery as `{correct, total}`; `src/utils/adaptiveEngine.js:50` reads `.score`, falling back to 50. Strong and weak saved records therefore receive the same mastery boost. An isolated deterministic selection check confirmed this. The engine also accepts progress and practice history without using them: no prerequisite selection or cross-session repeat avoidance. Home/progress completion percentages are labeled as mastery despite measuring completion.

Use one explicit evidence schema, with tested derived measures. Keep completion, independent accuracy, assisted success, and delayed retention separate.

### P1 — Completing a quiz is treated as completing the module

`src/pages/ModulePage.jsx:67` writes `completed: true` regardless of score and marks every lesson completed even if the learner jumps directly to the quiz. Partial lesson completion lives in component state and is not restored as a durable learning record. The pass threshold from quiz scoring does not control this write. Preserve actual lesson activity and quiz attempts separately, and show meaningful review before continuing.

### P1 — Session persistence is not idempotent

`src/components/Practice/SessionSummary.jsx:17` appends a session and increments every statistic in a mount effect. `src/main.jsx` enables StrictMode, whose development effect replay can perform these writes twice; any actual remount also repeats them. Give each session/attempt a stable identity and save once through an idempotent operation. Verify under StrictMode, revisit, and reload rather than removing StrictMode to hide the issue.

### P1 — Tutor HTML is rendered without sanitization

`src/utils/mathHelpers.js` preserves input HTML and enables KaTeX `trust: true`; `MathBlock` inserts the result using `dangerouslySetInnerHTML`. Tutor responses use this rendering path. Untrusted model output can therefore inject active HTML into the app's origin, which also holds locally stored settings/credentials. No exploit was executed. Separate trusted authored content from untrusted tutor text, disable unnecessary trusted math features, and sanitize through an explicit allowlist or a safe structured renderer.

### P1/P2 — Tutor context does not match saved data

`src/utils/aiTutor.js` expects percentage values, format `.pct`, and mistake fields that storage does not provide. It can send `[object Object]`, undefined percentages, and incomplete errors to the model. It reads the oldest appended session as the latest. `TutorDrawer` also calculates summaries from incompatible shapes. Layout supplies module context but not the current practice question or actual lesson details. Repair context from the same validated selectors used by the dashboard; retain submitted answers and assistance so errors can be explained accurately. Add bounded context and request cancellation/timeouts before expanding tutor modes.

### P2 — Adaptive coverage is much narrower than the interface suggests

The 60 questions have six module IDs, one of which is invalid (`quadratics` versus `quadratic-equations`), leaving only five recognized curriculum modules. Only four diagnostic categories directly have corresponding bank coverage. Circle items filed under area/perimeter do not target a circles diagnostic gap. The preview can advertise gaps the bank cannot actually address. There is no dedicated foundational arithmetic/fractions course or assessment, and the diagnostic covers geometry rather than algebra or foundations.

Show supported coverage honestly, normalize identifiers, then author a foundations slice. Increasing raw question count alone will not solve this.

### P2 — Grading and content include concrete errors

- `src/data/practiceBank.js:65`: in `blunder-11`, the first step `x = sqrt(25)` already discards the negative solution; the answer key instead blames the next simplification to 5.
- `src/data/algebra/module2-linear-equations.js:183`: multiplying by 5 and dividing by 1/5 both reverse division by 5, but only one option is accepted.
- All 12 sequence items use the original `[0,1,2,3]` order, displayed without meaningful initial shuffling. Some tasks also permit alternative valid step orders that strict array equality rejects.
- Numerical fill grading uses a short exact-string answer list rather than mathematical equivalence, rejecting legitimate formatting variants. Empty responses can be submitted.
- Same-format components retain answer state across questions. Consecutive fill input reuse was reproduced.

Further editorial corrections: qualify polygon triangulation claims for concave shapes; cover horizontal/vertical exceptions to slope rules; state fixed-current assumptions in Ohm's-law examples; distinguish an equation's roots from the graph of its associated function; remove claims that allowable-stress exceedance guarantees immediate collapse or that a fixed safety factor guarantees safety under unspecified extremes. Review escaped math/currency rendering and whether quiz methods were actually introduced. Validate archived generated distractors before reusing them: exponent templates can generate duplicate correct choices.

### P2 — Theme and interaction quality are inconsistent

Practice headings use pale hardcoded text on light cards (observed). Theme tokens and Tailwind dark utilities follow different mechanisms: the hook toggles a class while dark variants use the media preference. A shared semantic token system should govern light and forest consistently.

The canvas offers a small number of static drawings/placeholders, not the manipulatives envisioned for the learning experience. Closed tutor content remains exposed to accessibility navigation; drawer/modal focus, labels, keyboard interactions, and motion handling need a deliberate pass. Use meaningful visual interaction in the foundations prototype, with equivalent keyboard controls.

### P2 — Navigation, progress, and durability need repair

- The old `/speed-run` URL falls through to Home rather than explaining or redirecting to its replacement.
- Module continuation uses a geometry path even for algebra; the helper's fallback does not correct a valid-but-wrong path.
- Some metadata lesson totals disagree with content; the track UI hardcodes 10 units even for eight-unit algebra.
- Practice does not update the streak; separate hook instances can show stale progress. UTC day boundaries differ from Bry's local calendar, and streak reads do not expire an old streak.
- Local storage has no versioned migration, export/recovery flow, or robust shape validation. A parse failure returns an empty store that a subsequent settings write can overwrite. Storage failures only log warnings.

Preserve/export original browser data before changing schemas. A new origin is a separate store, not proof of missing data. Establish version control and a reproducible smoke suite before feature expansion.

## What to keep

The existing lesson organization, diagnostic-to-home recommendation, five practice formats, explanation content, and contextual tutor shell offer reusable structure. The current visual language can inform typography and restrained color, but the home screen should emphasize a useful next study action rather than generic metrics. Existing algebra/geometry can remain later material after content and route repairs.

## Recommended next implementation slice

1. Preserve data and establish a recoverable source baseline. Repair routes, unsafe rendering, grading defects, duplicate saves, and shared evidence selectors.
2. Build one complete arithmetic/fractions flow: a short baseline check, an explained recommendation, one optional worked example, a new independent problem, reliable feedback, and a later recall check.
3. Prototype Today and the problem workspace together in light/forest. Paper is explicitly welcome; mental-only work is optional and untimed. Default session choices are 30/45/60 minutes with resumable drill blocks.
4. Add prerequisite navigation, an error notebook, and meaningful visual problem families. Expand tutor modes only after the tutor receives accurate activity and learning context.
5. Extend shared concepts into physics and later chemistry/coding; defer chemistry implementation now.

Acceptance is a trustworthy learning loop, not a prettier dashboard: two different learner histories must yield explainably different activities, a helped answer must not count as independent retention, and reloading must preserve progress without duplication.
