# Athena cohesion and debugging pass — October 9, 2026

This is the latest stabilization milestone after the Athena teaching update. It does not replace the curriculum roadmap or imply that all v3 content is complete.

## Shipped behavior

- Settings now shares the studio typography, compact controls and surfaces used by the study desk. Paper, original Charcoal/indigo and deep Pine/warm cream are presented together. Heading preferences apply to the desk, practice and recall as well as older learning pages.
- Ada uses those same theme tokens. Its connection settings live in Settings instead of a second independent configuration form. The welcome message directs learners to available study tools, rather than a removed diagnostic route. Keyboard dismissal restores focus; dialogs trap focus and restore page scrolling.
- Today shows a distinct, topic-matched example for the resumed activity instead of an unrelated fixed fraction illustration. Rule Match copy acknowledges topic choice. Mathematical notation is rendered consistently in recent work, review examples, repair examples and rulebook examples.
- A guided explanation returns to the original unit check or engineering application. Application questions use the actual skill’s introduction, example and model. The scale application now has a checked fraction-product model.
- Review keeps original answers, retries and support separate. A geometry error was taken through supported recovery, visual review, a fresh repair and reload without losing its initial response.
- Settings/progress/rulebook consumers subscribe to one external-store revision mechanism. Course paths take precedence over overlapping unit IDs, and historical geometry IDs resolve to their supported geometry course units. Normalizing new attempts uses the same helper as reading old records.
- Malformed study-session collections are excluded from rendered views without deleting their raw records. Invalid new sessions fail before writing. Actual answered work updates the streak; opening a guide or saving an unchanged answer does not add days.
- Cloud restore is accurately described as snapshot replacement. It has a reviewable confirmation, preserves a recovery copy, rejects invalid collection shapes, retains the device’s tutor key/provider pair and notifies the UI after restore. Clearing a backup ID creates a new snapshot. Resetting local study data stops queued automatic saves and disables auto-save so an empty reset cannot overwrite a cloud backup.

## Code cleanup

The shared workspace, storage, teaching helpers and main views have been formatted for readability. Removed unused imports/variables, production-only sample history, obsolete shell context handling and helper reexports from component files. State reset effects were replaced with keyed lesson/module views or the learner action that causes the change. Micro-check state is keyed to its actual step. Legacy timed-game callbacks read current score rather than an old timer closure. Rulebook consultation assistance is recorded at the originating study action; browsing unrelated notes does not change attempt evidence.

The tutor loads on first use, retains its draft while closed, and no longer forces the mathematics renderer into the initial shell. The main production JavaScript chunk is approximately 258 kB (81 kB compressed), compared with approximately 584 kB at the preceding milestone. This describes the main chunk, not total bytes for a complete lesson. The separate mathematics-rendering chunk is approximately 260 kB. Build has no chunk-size warning.

Existing `mathfoundry_data`, snapshot filenames used by cloud compatibility, history, settings and other unrelated changes were retained. No package dependencies or lockfiles were changed. Source backup before this pass: `/home/bry/.codex/backups/mathfoundry/before-cohesion-20261009.tar.gz`; this is a code backup, not a backup of browser learning data. Work is saved locally and remains uncommitted.

## Verification

- `npm test`: 250 passing tests, including nine new meaningful regressions for course attribution, malformed data, streak updates, shared notifications, appearance preferences, application models, cloud restore, new backup creation and reset behavior.
- `node --test tests/e2e/*.test.js`: 67 passing workflow simulations. These are logic simulations, not browser automation.
- `npm run lint`: zero errors and zero warnings; no lint rules disabled.
- `npm run build`: success, no oversized-chunk warning.
- `git diff --check`: success.
- Browser at isolated `127.0.0.1:5173`: all three themes, typography, URL preview controls, appearance changes across two tabs, reset-dialog cancellation/Escape/focus return, themed tutor and keyboard dismissal, geometry unit check → wrong answer → guide → same checked question → helped recovery → Today’s matching model → original-error review → fresh visual repair → reload. Browser console inspection returned no warnings/errors at the final check.
- No destructive reset was performed. The real `localhost:5173` learner origin was not modified during testing. No real cloud or AI requests were made; external-service tests use synthetic data and mocked requests.

Screenshots are in `docs/screenshots/cohesion/`: `settings-pine.png`, `settings-paper.png`, and `geometry-review.png`.

## Limits and next work

The browser’s viewport override did not apply to these hidden test tabs, which stayed at 1274px wide. Responsive styles were updated, but this pass does not claim a fresh phone-layout verification. The screenshot named settings-paper is a desktop view. Overrides were reset and temporary tabs closed.

Live provider/GitHub compatibility and background sync races involving an already in-flight network request remain unverified. Gist is still a snapshot backup, not a concurrent multi-device history merger. Local JSON file import remains in preparation. Malformed records remain recoverable via original-data export rather than being silently rewritten.

The next product milestone should expand checked problem families, varied representations and delayed recall across all supported units, then broaden the honest learning profile and Today recommendations beyond the original six foundation skills. Advanced engineering subjects and handwritten-work submission remain roadmap work.
