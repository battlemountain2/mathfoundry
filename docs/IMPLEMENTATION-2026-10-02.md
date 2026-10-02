# First cohesion milestone — October 2, 2026

## Ready to try

Open `http://localhost:5173/` for Today, or `/foundations` for the new study flow. The previous dashboard remains at `/overview`; the old `/speed-run` address redirects to mixed practice. Use the same browser and localhost address as before to retain access to your original data. `127.0.0.1` was used only for isolated synthetic tests.

- Today offers an explained next step, 30/45/60-minute planning choices, saved-block resume, a recall queue, and an honest foundation profile.
- Foundations offers a six-area starting check, procedure questions, numerical calculation, fraction comparison, and a keyboard-controlled equivalent-fraction bar. Starter arithmetic covers the four operations; fraction practice covers equivalence, comparison, addition/subtraction, multiplication, and introductory division.
- Optional worked examples use a different problem. Example use, independent answers, skips, submitted answers, feedback, and dates are recorded. Invalid numeric input is a format issue rather than a failed math attempt.
- Six-question focused or mixed blocks save draft input and results. You can pause, resume, or explicitly choose a new focus. Completed attempts remain recorded when replacing a paused block.
- Progress shows concept evidence and recent work. Light paper and deep pine/warm cream themes are available in Settings and via the header toggle. The original dark theme remains selectable.
- Settings downloads a learning backup without the API key and a clearly labeled raw recovery file. The app keeps a local pre-update data copy before its first additive write. Corrupt JSON blocks writes instead of being silently overwritten; save failures are visible in the new flow.

## Repairs included

Lesson routes load geometry and algebra. Actual lesson IDs/counts persist, and reload starts at the first unread lesson. Quizzes now show a result review; low scores and skipped lessons do not automatically mark a module complete. Algebra continuation uses the correct track. Existing completion flags are retained until the learner takes a new activity; old records are not retrospectively treated as verified mastery.

Mixed practice uses count-derived accuracy, reduces recent question repetition, saves a completed session once through a stable ID, and records actual answers with errors. Consecutive question components reset. Sequence options begin shuffled and two authored alternative orders are accepted. Empty fill submissions are blocked and equivalent numeric answers work. Quadratic bank IDs, the negative-root blunder key, an ambiguous inverse-operation quiz choice, and three lesson metadata counts were corrected. Practice previews advertise only supported diagnostic targets.

Tutor context now uses saved counts, recent errors, the latest session, foundation attempts, and the active question/lesson. The drawer offers Explain, One Hint, Check My Reasoning, and Quiz Me. It allows a requested worked example, uses bounded history, and has request timeouts. AI reply HTML is escaped before math rendering; KaTeX trust features are disabled. Closed drawer content is unmounted, with Escape and keyboard focus handling. Provider/model defaults were retained; no live provider calls or charges were made.

Removed several inaccurate curriculum statements about safety guarantees, resistor changes, polygon triangulation, and an unsupported engineering percentage. Remaining content corrections are still tracked in the audit.

## Evidence policy

Unassessed means no non-skipped attempt. Learning means evidence exists but the independent gate is not met. Independent requires the most recent three unassisted attempts to be correct across at least two blocks, with a correct unassisted latest assessed attempt. Retained additionally requires a successful independent check at least 48 hours after the first of those three attempts. A later error or supported latest attempt returns the state to Learning. This is an intentionally conservative starter policy, not proof of general mastery or a learning-science validated threshold.

Later recall becomes due 48 hours after the latest correct independent attempt. No timer advances artificially. Same-day successes cannot establish Retained. A study-time choice is a planning budget, not a guarantee that six questions occupy that many minutes.

## Verification

- Production build passes. Existing main-bundle size warning remains above 500 kB.
- Nine automated tests pass: numeric equivalence/input rejection, independently calculated starter answers, assistance/retention rules, contrasting recommendations, additive legacy compatibility, duplicate saves, corrupt/quota handling, atomic answer/draft saving, accurate tutor context, adaptive selection, normalized IDs, and safe tutor rendering.
- Lint passes with 36 remaining warnings, including legacy code and hook/compiler recommendations. Undefined-variable checking is now enforced with browser/node globals configured. These warnings are not being presented as a clean lint result.
- Browser: completed a synthetic six-question baseline; example use was marked supported, a skipped skill stayed unassessed, and the result produced an explained recommendation. A fresh browser load restored the checked answer. A subsequent guided block used a rule prompt, a different independent problem, and fraction bars controlled with arrow keys.
- Browser: geometry/algebra lessons render; partial lesson completion survives reload; a 20% quiz showed review and retained 1/4 actual lessons read.
- Browser: completed a 12-question mixed session across five formats. History rose from 2 to 3 under StrictMode and remained 3 after reload. The legacy URL redirects to practice. A React key-spread warning found during verification was fixed; a fresh practice tab showed no console errors.
- Visually checked light and forest layouts at the browser's narrow and desktop surfaces. Saved screenshots use an isolated synthetic profile, not Bry's actual learning record.

## Recovery baseline

Git baseline: `00c9c92` (source before this implementation). Full pre-change archive: `/home/bry/.codex/backups/mathfoundry/before-cohesion-20261002.tar.gz`. No real browser data was reset or edited for testing. The original localhost diagnostic has not been personally validated; compatibility was verified with fixtures and isolated browser data.

## Remaining work

This is the first usable slice, not the entire planned cohesion update.

- Broaden number sense, negative numbers, decimals, percentages, estimation, units, and varied fraction division/application families. Add richer branching assessment and distinguish calculation versus rule errors from submitted reasoning, not just final answers.
- Strengthen prerequisites and spaced review using concept evidence; the legacy mixed bank still has narrow coverage and is not a prerequisite-aware curriculum scheduler.
- Add validated novel problem structures; current foundations use a deliberately small, controlled starter set. Independent/Retained labels apply to this evidence rather than guaranteeing transfer to unfamiliar problems.
- Complete the remaining content/math-rendering editorial audit and legacy mobile navigation/modal accessibility work. Larger course UI still contains earlier styling.
- Add a reviewed import/restore flow and optional sync. Current downloads preserve recoverable data, but there is no automatic cross-browser restoration yet.
- Validate live AI providers/models, implement cost controls and cancellation, and test streamed/failed responses before choosing a default runtime tutor. Tutor mode changes have been checked locally; model adherence has not been tested.
- Scope paper-work image submission, richer applications, then a connected physics slice. Chemistry/coding remain future work.
