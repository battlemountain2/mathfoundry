# Athena debugging and cleanup — October 11, 2026

Started October 10 and completed October 11. This pass stabilizes the existing Athena app. Daymark integration, hosting, and the installable iPhone app remain on hold until Bry confirms the Git baselines and integration plan.

## Fixed behavior

| Issue | Result |
| --- | --- |
| Malformed saved Rule Match sessions could reach the renderer and crash it | Recall sessions are validated before display and before saving. Invalid raw data stays available in the original-data export. |
| An older tab could replace newer practice answers or recall progress | Both active workspaces compare their last saved session with the current stored session before writing. A conflict leaves the newer data untouched and explains how to reload. |
| Blank/coerced choice input and overflowing numbers could reach grading | Numeric entry rejects non-finite values and zero denominators; choice entry requires a real in-range index. Invalid submissions add no attempt. Explicit skips remain available. |
| A slow cloud restore could replace study work saved while its request was loading | Restore checks that local data is still the snapshot present when the request began. If it changed, restore stops before replacement. |
| Cloud save and restore requests could overlap in the same app instance | One operation runs at a time. Queued automatic saves wait for an active save; automatic saves are suppressed during restore. The guard releases after failures. |
| A damaged archive entry could prevent starting another block | Archiving tolerates null entries and retains their original records for recovery. |
| Closed navigation remained reachable off-screen | Hidden mobile navigation and the collapsed desktop sidebar now use visibility rules that remove them from keyboard/accessibility navigation. |
| The open mobile menu lacked focus handling and dismissal | Menu opens as a labelled dialog, contains keyboard focus, closes with Escape or Close, locks page scrolling, and returns focus to its trigger. The trigger exposes expanded state. |
| Recall review did not show the full question and correct choice | The first missed match expands with its question, original answer, correct match, explanation and supported-retry status. Actions have space and phone-sized targets. |

The wrong-answer sequence remains one hint → optional retry → learner-controlled explanation. Original answers are retained. Recognition is separate from applying a method, and supported retries do not become independent evidence.

## Code cleanup

- Added `useDialogFocus` and reused it for the navigation drawer, confirmation dialogs and Ada. Focus wrapping, Escape, scrolling cleanup, and focus return now share one implementation, including textarea support.
- Formatted the previously compressed Recall page, Rule Match helpers, answer checking and cloud backup code. No lint rules were disabled.
- Corrected the cloud helper's description: Gist provides snapshot backups, not concurrent history merging.
- Added seven regressions in `tests/debug-oct10.test.js` for corrupt recall records, stale study/recall writes, damaged archives, invalid grading input, pending restore conflicts, and overlapping cloud operations.
- Kept existing names such as `mathfoundry_data` and the Gist backup filename for compatibility. No dependencies, lockfiles, historical raw records, or Daymark files were changed by this pass.

## Verification

- `npm test`: **257 passing tests**.
- `node --test tests/e2e/*.test.js`: **67 passing workflow simulations**; these are not browser automation.
- `npm run lint`: no errors or warnings.
- `npm run build`: success, no chunk-size warning. Main JavaScript chunk approximately 260 kB / 82 kB compressed; this is not total lesson download size.
- `git diff --check`: clean.
- Browser verification used the isolated `127.0.0.1:5173` test origin. The real learner's `localhost:5173` history was not edited or reset.
- Actual responsive content width was **384 CSS pixels** with no horizontal overflow on the checked recall view. Paper, Charcoal and Deep Pine were checked at this size. This is a Chromium phone-layout check, not a physical iPhone/Safari test.
- Recall flow: incorrect first answer → hint with no solution reveal → supported correct retry → independent later matches → round review → reload. Original mistake and supported retry remained visible.
- Two recall tabs and two study tabs: a stale write produced a conflict notice while the newer saved answer stayed intact. Invalid `2/0` entry was rejected without grading; valid zero was accepted for a matching subtraction problem.
- Navigation focus wrapped in both directions, Escape closed the drawer, focus returned to Menu, and body scrolling was restored. Desktop compact mode hid the sidebar from the accessibility snapshot.
- Ada's Escape dismissal returned focus to its trigger. The reset confirmation wrapped focus and was cancelled; no data reset was performed.
- Final inspected test-tab console contained no warnings/errors. No live GitHub or tutor requests were made; cloud regressions use synthetic payloads and mocked requests.

Screenshots: `docs/screenshots/debug-2026-10-11/recall-phone.jpg`, `recall-paper-phone.jpg`, and `recall-charcoal-phone.jpg`.

## Recommended next updates

1. **Expand problem variety and recall coverage.** A focused Rule Match round currently repeats its small set of three authored prompts. Add distinct, checked prompts and contextual variations, avoid exact repeats within a round, and extend recall beyond the original six foundation concepts. Include visual prediction, completing a missing step, spotting an error and explaining a choice where appropriate.
2. **Make Today and review follow the whole curriculum.** The desk resumes broader topics, but its foundation recommendations still concentrate on six skills. Base recommendations on all supported units, clearly separating first attempts, supported recovery and later independent recall. Course completion should remain distinct from retained understanding.
3. **Preserve progress in the integration plan.** Bry excluded standalone backup-file import and accepted priorities 1–2. Plan existing-data preservation as part of the future Daymark integration; a new hosting origin cannot automatically read the existing localhost history.
4. **Plan phone installation and shared progress with Daymark.** Keep the accepted entry experience: Daymark daily overview first, with an easy switch to Athena's study desk. Plan persistent learning storage, an offline queue, conflict handling and safe app updates before implementing the integration. Keep coursework and independent engineering preparation visible as separate choices.
5. **Retire unused legacy views carefully.** Inventory unreachable old pages, identify helpers/data still used by repair and review, then remove obsolete views in small verified changes. Improve the error fallback so recovery via Settings remains available even after a page fails.

## Limits and saved state

The session checks protect against stale snapshots; they are not atomic transactions between devices or a history-merging system. The cloud operation guard is per running app instance, not a distributed lock across tabs/devices. Cancelling a queued save cannot undo a remote write already accepted by GitHub. Live cloud/provider behavior, physical iPhone installation, VoiceOver and complete accessibility certification remain unverified.

Source backup before this pass: `/home/bry/.codex/backups/mathfoundry/before-debug-20261010.tar.gz`. This is a code backup, not a backup of browser progress. At the end of the debugging pass, changes and prior milestones were local and uncommitted; no push, merge or deployment was performed. Bry subsequently authorized a local commit of the accumulated Athena work. GitHub publication and Daymark integration remain separate steps.
