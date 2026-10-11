# Foundry v3 — first connected working milestone

October 9, 2026. Bry authorized Codex to implement the agreed v3 direction using GPT-6.1 Sol. This report describes the present working tree, not a complete v3 release. The original untracked README and prior planning documents were preserved. No commit or deployment was made.

## What is ready

- **Study space:** text-only sidebar, spacious Today with a compact foundations path, unfinished-block resume, recommendation, recent mistakes, recall, and a small engineering connection. Paper, Charcoal, and deeper Pine/Cream themes share the layout. JetBrains Mono remains for numbers and compact labels; the default heading face is readable sans, while explicit saved typography preferences remain respected.
- **Connected course practice and checks:** one shared workspace for available course practice, four-question checks, and two applied problems. Save question position, input, optional intermediate step, feedback, and assistance as the learner works. Skip/explore/resume and fresh blocks are available. Desktop help is optional and resizable; mobile help appears below the problem. Core study requires no runtime AI or network account.
- **Feedback and review:** feedback follows each question. First answers remain visible after retries; a first miss is not rewritten as an independent success. Hints and worked solutions are learner controlled. Review foregrounds submitted and expected answers plus the key issue, with expandable steps and relevant visuals. Exact error explanations use an observed intermediate step when available; final answers alone do not justify a precise diagnosis. Recent-mistake links highlight the selected attempt.
- **Targeted repair:** fresh follow-up, original-attempt preservation, completion snapshot across reloads, and return to the source block. A completed repair does not displace another pending repair. Unsupported concepts do not silently receive an unrelated foundations problem.
- **Fraction visuals and variety:** equivalent/comparison bars and manipulable partitions for the exact addition/subtraction problem. Partition changes preserve the quantities and explain whether both fraction boundaries align. Generated addition/subtraction families have varied fractions with validated authored steps. Existing number-line labs remain available; the comparison lab uses positive fractions and unavailable lab/practice routes show honest preparation states.
- **Rule Match:** six calm untimed puzzles on computer or phone; rules, next steps, and common misapplications across six foundation concepts. Pause/resume, hint/retry, explicit explanation, first-response recap, and saving a missed rule to the personal rulebook. Recognition is stored separately from problem application.
- **Engineering connection:** half-scale measurements and combining measured lengths use the shared practice/review flow. Evidence is attributed to the skill actually exercised. Preparation links point to relevant fraction topics.
- **Content honesty and navigation:** course/unit pages show available activities and prerequisites without inventing mastery or locking exploration. Unbuilt lessons do not fall back to an unrelated lesson. Legacy module links resolve to actual course topics, with preparation labels where practice is unavailable. Geometry multiple-choice answer values are normalized to the selected option index.

## Implementation map

| Area | Main files |
| --- | --- |
| Shared workspace and fraction figures | `src/components/Study/StudyWorkspace.jsx`, `ProblemFigure.jsx` |
| Session generation, evidence, and summaries | `src/utils/studySession.js`, `storage.js` |
| Review, repair, and history | `src/components/Study/SessionReview.jsx`, `src/pages/Review.jsx`, `Repair.jsx` |
| Recall and personal rules | `src/pages/Recall.jsx`, `Rulebook.jsx`, `src/utils/ruleMatch.js` |
| Desk, navigation, themes, course capabilities | `src/pages/Home.jsx`, `src/components/Layout/`, `src/index.css`, `src/pages/Courses/` |
| Legacy navigation compatibility | `src/utils/studyNavigation.js` |
| Regression checks | `tests/v3-study.test.js` |

Storage additions are additive: active study sessions, archived study sessions, recognition attempts, recall state, and completed repair snapshots. Stable submission IDs make repeated commits idempotent. Older records remain readable and are not retroactively reclassified. Local backups continue through existing settings. Gist snapshot export excludes the runtime AI API key; no real cloud request was performed during this work.

## Verification actually performed

October 9 final code checks:

- `npm test`: **237/237 pass**.
- `node --test tests/e2e/*.test.js`: **67/67 pass**. These are simulated logic flows, not automated browser tests.
- `npm run build`: passes; main bundle approximately 584 KB still produces the existing >500 KB warning.
- `npm run lint`: **zero errors, 99 warnings**. The repository is not warning-free.
- New regression coverage includes 2,000 generated fraction seeds, original miss/helped retry distinctions, repeated-save deduplication and archival, quiz feedback, recognition/application separation, repair reload snapshots, invalid stored data, actual applied-skill attribution, recall variety, geometry answer normalization, and legacy navigation resolution.

Actual UI checks used **127.0.0.1:5173**, separate from the learner's **localhost:5173** storage origin. No real learner progress was reset or replaced. These checks were performed during October 7–9:

1. All three themes render Today and the text-only navigation correctly.
2. Fraction practice: incorrect response, hint, helped retry, optional intermediate step, explicit explanation, exact-problem visual, skip, and six-question review. Inputs, assistance, and position survive reload. A new block archives the previous block.
3. Mistake review: original `2/9` answer and entered denominator `9` remain visible for `1/2 + 6/7`; explanation identifies denominator addition from that entered step. Partitioning into 14 pieces shows 7 plus 12 pieces. Original mistake remains after repair completion.
4. Repair: fresh problem solved, other pending work retained, completed snapshot survives reload, correct return to the source block.
5. Rule Match: incorrect first response, hint/reload/retry, six-puzzle summary, independent recognition distinction, personal-rule save, and later saved-round resume. A new round presents different prompt families.
6. Unit check: feedback after every question, supported first answer versus recovered retry versus independent first answer, complete review on phone.
7. Two engineering problems use shared checking/review. The subsequent variable-problem factory was additionally checked with logic tests; every new generated application variant was not separately exercised in the browser.
8. Geometry angle answer, saved session, and Today resume point to the correct course unit.
9. Phone viewport 390×844: recall fits without horizontal overflow; help expands below practice. Temporary viewport overrides were reset. Browser console error capture was empty during the final preview check.

Screenshot proof (real UI, isolated test progress):

- [Forest desk](screenshots/v3/today-forest.png)
- [Paper desk](screenshots/v3/today-paper.png)
- [Charcoal desk](screenshots/v3/today-charcoal.png)
- [Practice workspace](screenshots/v3/practice-workspace.png)
- [Original mistake and matching visual](screenshots/v3/mistake-review.png)
- [Phone Rule Match](screenshots/v3/recall-phone.png)

The development server uses port 5173 and is left running for review. A code backup from before this milestone is at `/home/bry/.codex/backups/mathfoundry/before-v3-20261007.tar.gz`; it is not a backup of browser progress.

## Remaining scope and next build order

1. **Complete the fractions teaching journey.** Existing lesson/lab pages still open as separate routes; saved workspace position survives the trip, but there is not yet a unified inline lesson renderer. Bring gradual explanations and guided examples into the same workspace. Broaden visual families and add exact matching visuals to repair itself. Existing authored foundations generators still have uneven variety outside addition/subtraction.
2. **Refine the learning profile.** Method-recognition records are separate in storage, but block summaries still use first-answer language; make the displayed recognition/application distinction clearer. Do not claim a four-question check establishes mastery or that completed repair proves delayed retention. Continue the existing recommendation model toward consistent delayed independent checks.
3. **Expand recall purposefully.** Current puzzles cover text rules, next steps, and misapplications. Formula-to-step/diagram matching, richer phone gestures, and complete archived recall-round review remain unbuilt. Individual recognition evidence is retained.
4. **Finish visual and accessibility polish.** Audit keyboard/focus flows and contrast across every legacy activity. The shared workspace and review are verified, but not every historic diagnostic/practice/lab/tutor page has the complete v3 layout or visual affordances. Address the repository lint warnings and bundle size in focused passes.
5. **Later capabilities:** paper/photo submission and review, broader engineering projects, connected physics/chemistry/coding paths, and reliable cross-device progress. Current data is local per browser origin; existing Gist sync uses whole snapshots and has no conflict-aware merge. This milestone does not provide seamless phone/desktop synchronization.

Continue from the accepted preferences in `AGENTS.md`, `FOUNDRY-V3-VISION.md`, and `ROADMAP.md`. Preserve real data and first attempts; verify each further change using isolated fixtures and report exactly what is implemented.
