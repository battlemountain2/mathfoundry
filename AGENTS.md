# MathFoundry project guidance

Current collaboration direction (October 2): Codex handles planning/design discussion and review; Antigravity handles implementation. Codex should update planning/handoff documents rather than app code unless Bry explicitly changes this assignment. Start new build work from `ANTIGRAVITY_HANDOFF.md` and `docs/PRODUCT-PLAN.md`; they identify current priorities and distinguish confirmed choices from proposals.

Read `docs/ROADMAP.md` before planning or changing learning behavior or UI. It records Bry's accepted product direction, proposed phases, and unresolved decisions. Bry authorized implementation on October 2, 2026. Read `docs/IMPLEMENTATION-2026-10-02.md` for the first working milestone and docs/IMPLEMENTATION-COHESION-2026-10-02.md for the subsequent cohesion build and remaining scope.

- Build a personal engineering learning companion, beginning with foundational arithmetic and fractions and progressing into higher math. Physics, chemistry, and possibly coding are future connected subjects; do not prioritize chemistry implementation yet.
- Support guided and self-directed learning, 30–60 minute default sessions, and optional long practice in resumable blocks.
- Treat reported difficulties as assessment targets, not diagnoses. Never infer precise mastery or missing knowledge without evidence.
- Keep completion, assisted performance, independent performance, and delayed retention distinct. Use one consistent learning-evidence model across assessment, practice, recommendations, dashboard, and tutor.
- Preserve existing user data. Plan migrations and recovery/export before schema changes. Never reset real progress to make tests pass. Use isolated fixtures for tests.
- Prefer vetted, parameterized problem families and deterministic answer checking. Validate generated mathematics and make uncertain AI grading reviewable.
- Astra is intended for design/build collaboration, not an assumed runtime tutor. Keep runtime tutoring configurable and cost-conscious; core learning must work without AI.
- Design for meaningful interaction, clear next actions, readable math, and light/forest themes. Use Brilliant as experiential inspiration, not a copied design. Avoid generic metric-heavy dashboards.
- Confirmed next-pass design: text-only navigation; Today feels like a spacious study desk with a compact learning path. Provide light paper, original charcoal dark, and deeper pine/cream forest themes. Follow docs/DESIGN-NEXT.md, including session review, worked solutions/examples, and fresh follow-up problems throughout the hub.
- Connect subject-specific activities through shared concepts and prerequisites; do not falsely advertise unbuilt courses or count one response as multiple independent pieces of evidence.
- Verify changes through the full flow: diagnostic → recommendation → practice → saved evidence → dashboard/tutor. Include reloads, repeated saves, and existing-data compatibility where relevant.
- Respect the user's current scope. Keep uncertain decisions explicit and ask focused questions as the plan evolves.
- Bry accepted repair sessions, a personal rulebook, and small engineering connections. Prioritize repair/review, preserve original attempts, record assistance, and keep applications matched to available prerequisites. See docs/DESIGN-NEXT.md for the accepted scope.
- Confirmed preferences: paper-first problem solving; optional handwritten-work submission later for complex problems; gradual introductions, clear progression, repetition, purposeful visual manipulation, and immediate feedback. First milestone: arithmetic and fractions. Fade assistance and check delayed independent recall rather than equating guided completion with mastery.
- Bry's reported fraction difficulties are recalling rules and mental arithmetic. Distinguish procedure recall, calculation accuracy, and conceptual understanding in assessment. Calculator-free practice must allow paper and written intermediate steps; mental-only work is a separate optional activity, untimed by default.
- When Bry forgets a procedure, one worked example usually helps. Offer a concise example, then a similar independent problem; deeper explanation stays available. Do not force full lesson restarts or withhold requested worked examples. Distinguish assisted success from later independent recall.

- Latest confirmed feedback flow: show one hint and allow retry before revealing the solution; explicitly requested worked examples/solutions remain accessible. Preserve initial responses and distinguish helped same-problem retries from new independent evidence. Design inspiration is specifically Zen Browser’s sidebar, typography, and compact controls; use JetBrains Mono for numbers and prioritize manipulable fraction bars and number lines.
