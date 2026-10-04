# Implementation Summary: Ticket P4 — More Precise Repair and Rulebook

**Date:** October 3, 2026  
**Status:** Shipped and Verified  
**Baseline Test Outcome:** 22/22 passing tests (0 failures), 0 build errors, 0 lint errors.

---

## 1. Scope and Goals (Ticket P4)

Ticket P4 from `docs/PRODUCT-PLAN.md` targets the diagnostic precision and learning recovery tools:
1. **Subskill & Problem-Family Matching**: Subtraction errors MUST generate subtraction repairs; perimeter errors MUST generate perimeter repairs; area errors MUST generate area repairs.
2. **Preserved Multiple Repair Records**: Starting a new repair task must NOT overwrite or destroy an existing unfinished repair draft in storage.
3. **Scoping Assistance to Active Task**: Opening `/rulebook` directly must NOT falsely mark unrelated parked foundation blocks or background repair drafts as `assisted: true`.
4. **Concept-Organized Rulebook**: Each entry has a "When to use" diagnostic trigger, checked worked example, common pitfall warning, user notes (which survive re-saves & backup exports), and a return-to-study link.
5. **Evidence Integrity**: Historical responses, diagnostic results, and saved progress are strictly preserved.

---

## 2. Changes Made

### A. Subskill Detection & Bounded Novelty Matching (`src/utils/repair.js`)
- **`detectSubskill(item)`**:
  - Detects arithmetic subskills: `arithmetic-subtraction`, `arithmetic-addition`, `arithmetic-multiplication`, `arithmetic-division`.
  - Detects fraction subskills: `fraction-subtraction`, `fraction-addition`.
  - Detects geometry subskills: `perimeter` vs `area`, `complementary-angles` vs `supplementary-angles`, `pythagorean-hypotenuse` vs `pythagorean-leg`, `triangle-inequality` vs `triangle-angles`.
  - Detects algebra subskills: `linear-equations-fraction` vs `linear-equations-twostep`, `quadratic-roots` vs `quadratic-properties`.
- **`makeRepairDraft(attempt, previous)`**:
  - Automatically identifies `targetSubskill = detectSubskill(attempt)`.
  - Filters candidates in `makeProblem()` or `practiceBank` to strictly match `targetSubskill`.
  - Generates targeted novelty if bank is exhausted (e.g. novel perimeter rectangle calculation or novel multi-digit subtraction).
  - Pairs the repair draft with the matching curated rulebook ID (`findRulebookEntryId()`).
- **`novelFoundationProblem(conceptId, seed, subskill)`**:
  - Supports generating novel subtraction, addition, and division tasks tailored to the failed subskill.

### B. Multi-Repair Draft Storage & Switcher (`src/utils/storage.js` & `src/pages/Repair.jsx`)
- **Storage**:
  - `getRepairDrafts()` returns all active drafts.
  - `getRepairDraft(id)` retrieves a specific draft or the latest draft.
  - `setRepairDraft(draft)` appends/updates the draft in `repairDrafts` array without deleting other drafts.
  - `removeRepairDraft(id)` removes only the specified draft.
  - `exportLearningData()` exports `repairDrafts` and preserves `repairDraft` for backward compatibility.
- **Repair UI (`src/pages/Repair.jsx`)**:
  - Renders a top draft selector (`.repair-draft-selector`) when multiple drafts exist (`drafts.length > 1`), allowing seamless switching between pending repairs.
  - Allows dismissing individual drafts with "Dismiss task".
  - On correct completion, removes only that draft from pending drafts and offers "Continue to next repair (N remaining) →" if other drafts exist.
  - Scoped rulebook link: passes `?from=repair&activeId=${draft.id}&ruleId=${draft.rulebookId}`.

### C. Concept-Organized Rulebook with Scoped Assistance (`src/pages/Rulebook.jsx` & `src/data/rulebookData.js`)
- **Scoped Assistance**:
  - Removed the blanket unconditional `useEffect` that previously marked whatever was in storage as `assisted: true`.
  - Assistance now attaches ONLY when navigated with explicit query params (`?from=repair&activeId=...` or `?from=foundations&activeId=...`).
- **Navigation Banners**:
  - Shows a top `.return-study-banner` with direct return link to active repair/foundations.
- **Curated Reference Database (`src/data/rulebookData.js`)**:
  - Curated reference entries across Fractions, Arithmetic, Geometry, and Algebra.
  - Each entry provides: `category`, `whenToUse`, `explanation`, `pitfall`, `example`, and `suggestedNotes`.
- **Category Filter & Search**:
  - Category tabs: "All Rules", "Fractions & Ratios", "Arithmetic & Operations", "Geometry & Measurement", "Algebra & Equations", "My Notes".
  - Real-time search filter across titles, triggers, pitfalls, and personal notes.
  - Automatic scrolling and highlighting when accessed with `?ruleId=...`.
- **User Notes**:
  - Editable textarea with "Save notes" button.
  - Notes survive re-saves, edits to titles, and backup exports.

### D. CSS Polish (`src/index.css`)
- Styled `.return-study-banner` with frosted/accented styling.
- Styled `.rulebook-category-nav` and `.rulebook-nav-pill`.
- Styled `.rulebook-when-box` (left accent border) and `.rulebook-pitfall-box` (soft red alert border).
- Styled `.repair-draft-selector` and interactive pill buttons.

---

## 3. Verification & Test Outcomes

### Unit & Integration Tests
Run via `npm test` (`node --test tests/*.test.js`):
- **22/22 tests passing** (0 failures, duration ~60ms).
- Verified P4 specific test suites:
  1. `P4: subskill matching ensures subtraction repairs subtraction and perimeter repairs perimeter` (passes).
  2. `P4: multiple repair drafts are preserved and individual drafts can be completed without destroying others` (passes).
  3. `P4: rulebook entries are categorized, contain when-to-use and pitfalls, and user notes survive updates` (passes).
  4. All 19 pre-existing tests continue passing without regression.

### Build & Lint
- `npm run build`: Vite 8 production build succeeds in ~240ms with 0 errors.
- `npm run lint`: ESLint / Oxlint succeeds with 0 errors (38 pre-existing warnings).

---

## 4. Summary Table

| Requirement | Implementation | Status |
|---|---|---|
| Subtraction repairs subtraction | `detectSubskill` + subskill candidate filter in `repair.js` | Verified |
| Perimeter repairs perimeter | Explicit `perimeter` subskill routing in `repair.js` | Verified |
| Preserve multiple repairs | `repairDrafts` array in storage + pill switcher in `Repair.jsx` | Verified |
| Scoped rulebook assistance | Removed blanket effect; requires `from` + `activeId` params | Verified |
| "When to use" & pitfalls | Structured in `rulebookData.js` and rendered in `Rulebook.jsx` | Verified |
| User notes persistence | Preserved in storage, re-saves, and export backup | Verified |
