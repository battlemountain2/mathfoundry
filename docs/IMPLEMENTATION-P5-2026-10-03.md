# Implementation Report — Ticket P5: Cohesive Session Planning & Progress

Date: October 3, 2026
Ticket: **P5 (Cohesive Session Planning and Progress)**
Author: Antigravity
Status: **Completed & Verified**

---

## 1. Executive Summary

Ticket P5 unites session planning, prerequisite sequencing, honest evidence aggregation, and review prioritization across the entire MathFoundry hub:
1. **Real Prerequisite Sequencing**: Replaced the naive list slicing on the Today dashboard with a true directed acyclic graph (DAG) traversal across prerequisites defined in curriculum definitions.
2. **Honest Evidence Model (Anti-Sparse Mastery Claims)**: Created unified attempt aggregation across foundation blocks, mixed practice, and session reviews. Strictly prevents false claims of mastery on 1–2 answers. Requires multi-session independent verification before marking a concept ready or retained.
3. **Explained Recommendations with Clear Endpoints**: Recommendations state explicit reasons, evidence triggers, and finite goals (e.g., "Complete 1 independent block (6 questions)" or "Answer 2 recall check questions") rather than open-ended time sinks.
4. **Prioritized Review Queue**: Ranked queue placing unrepaired mistakes first (High), 48h delayed recall second (Medium), and assisted/supported practice third (Low).
5. **Resumable Session Blocks**: Supports extended study spans (30m, 45m, 60m, 90m) with atomic state persistence, visual progress indicator, direct "Resume session" action, and "Shelve session" control.
6. **Optional Reflective Cause Tagging**: Non-intrusive diagnostic pills (`calc-slip`, `rule-confused`, `misread`, `unsure-start`, `other`) integrated across Foundations, Repair, and Session Review without modifying or discarding student responses.

---

## 2. Changes by Component and File

### `src/utils/storage.js`
- **`getAllLearningAttempts()`**: Reads and normalizes attempt records across `foundationHistory`, `foundationSession`, `practiceSessions`, and `reviewHistory`. Ensures uniform format `{ id, conceptId, questionId, timestamp, isCorrect, assisted, reflectiveCause, source }`.
- **`clearFoundationSession()`**: Safely shelves/clears an in-progress foundation session block from localStorage without wiping completed history.
- **`updateAttemptReflectiveCause(attemptId, cause)`**: Updates reflective cause attribution in both active foundation session and durable foundation history records.

### `src/utils/learningProfile.js`
- **`buildPrerequisitePath(targetConceptId, attempts, now)`**:
  - Recursively resolves prerequisites for any concept from `src/data/foundations.js`.
  - Determines node state: `ready` (all prerequisites verified), `in_progress` (prerequisites partially attempted or needs reinforcement), or `unassessed` (no attempts yet).
  - Identifies downstream concepts unlocked by current mastery.
- **`summarizeEvidence(conceptOrModuleId, attempts)`**:
  - Implements the honest evidence contract:
    - **No evidence (0 questions)**: "No attempts recorded yet" (`isSolid: false`, `isSparse: false`).
    - **Sparse evidence (1–2 questions)**: "Early exploration only; not proof of mastery" (`isSolid: false`, `isSparse: true`).
    - **Helped only**: "Assisted attempts only; independent recall needed" (`isSolid: false`).
    - **Solid multi-session independent proof (≥3 correct, ≥2 sessions, ≥75% rate)**: "Solid multi-session evidence" (`isSolid: true`).
- **`getPrioritizedReviewQueue(attempts, now)`**:
  - Collects review items and ranks them into High, Medium, and Low tiers.
  - High priority: Unrepaired mistakes from the last 7 days.
  - Medium priority: Delayed recall due (concepts solved independently >48h ago without subsequent practice).
  - Low priority: Assisted items needing independent verification.
- **`foundationRecommendation(attempts, now)`**:
  - Augmented to return structured `evidenceSummary` and `targetEndpoint` explaining the exact pedagogical justification and completion milestone.

### `src/pages/Home.jsx` (Today Study Desk)
- **Active Resumable Block**: If `getFoundationSession()` has an active session, renders an interactive block with progress bar (`Question X of Y`), duration badge, "Resume session" button, and "Shelve session" button.
- **Duration Selector**: Added 30m, 45m, 60m, and 90m block selectors that adjust the study recommendation.
- **Prerequisite Path Section**: Replaced previous slice with interactive step tree displaying prerequisite readiness tags (`✓ Ready`, `⏳ In progress`, `— Unassessed`), current focus, and unlocked downstream topics.
- **Prioritized Review Queue**: Renders queue cards with priority pills, evidence trigger explanations, concrete endpoints, and direct deep-links to `/repair` or `/review`.
- **Evidence Integrity Grid**: Shows real counts of Independent, Helped, and Unassessed questions, alongside sparse-evidence notices.

### Reflective Cause Tagging Integration
- **`src/pages/Repair.jsx`**: Integrated reflective cause selector when an answer is checked (both incorrect attempt and walk-through view) so learners can diagnose why a slip happened.
- **`src/pages/Foundations.jsx`**: Integrated reflective cause selector during practice feedback and hint/solution views; updates active session atomically.
- **`src/components/Study/SessionReview.jsx`**: Displays recorded cause badge or interactive selection pills during end-of-session review.
- **`src/index.css`**: Added styling for `.resumable-progress-bar`, `.recommendation-evidence-callout`, `.recommendation-endpoint-callout`, `.prerequisite-path-container`, `.review-queue-card`, `.evidence-metric-box`, and `.reflective-cause-container`.

---

## 3. Verification & Test Coverage

### Automated Test Suite (`tests/review-feedback.test.js` & `tests/learning.test.js`)
Added 5 comprehensive unit tests for P5:
1. `buildPrerequisitePath traverses real prerequisite chains and computes readiness`
2. `summarizeEvidence enforces honest evidence and rejects sparse mastery claims`
3. `getPrioritizedReviewQueue prioritizes unrepaired mistakes and delayed retention`
4. `foundationRecommendation provides evidence reasoning and finite target endpoints`
5. `getAllLearningAttempts and updateAttemptReflectiveCause aggregate and tag attempts`

**Results**:
- `npm test`: **27 passing tests (0 failures)**.
- `npm run build`: **Succeeded in 275ms with 0 errors**.
- `npm run lint`: **0 errors (40 warnings, all pre-existing or minor)**.

---

## 4. Preservation & Integrity Guarantees

- **No Data Reset**: Real user progress at `http://localhost:5173/` is preserved without migration loss.
- **Paper-First Solving**: Reflective cause tags are completely optional and non-blocking; students can ignore them and proceed immediately.
- **No Paid Runtime AI**: All prerequisite pathing, review queue prioritization, and recommendation generation run entirely client-side with deterministic algorithms.
