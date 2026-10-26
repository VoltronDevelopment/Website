# Scene continuity verification — 25 October 2026

Implemented locally; not committed or deployed by this task.

## Behaviour

- Loading artwork is captured from the actual renderer, at its configured opening checkpoint, with matching theme, materials and responsive camera framing.
- One shared 240 ms transition holds the animation clock, blends matching frames with premultiplied alpha, then resumes motion. Transparent glass does not dim halfway through.
- Removed slow-load shortcuts that skipped the Home intro. Loading duration does not select a different animation pose.
- Explicit theme selectors prevent the manufacturing dark poster from covering the light poster.
- Corrected mobile component centering and manufacturing content-box framing.
- Reduced-motion and Save-Data visitors use completed static artwork. No-JS fallback remains available; theme stays manually selected.
- Updated Home opening/completed images for the newer timeline and particles. The checker reads opening checkpoints from the selected source instead of hardcoding a stale value.
- Added continuity checks to CI and excluded the bounded blending overlay from duplicate-hero detection.

## Validation

- Latest isolated production source build: passed.
- Unit suite: 182 tests across 31 files passed.
- Artwork parity: 56 desktop/mobile and light/dark cases passed (52 comparisons plus four regenerated Home comparisons).
- Desktop and mobile Home: five scene handoffs each; clocks held during blending.
- Delayed bundle load: correct configured Home opening checkpoint retained.
- Eight reduced-motion/Save-Data route cases: zero WebGL contexts.
- Latest site-wide browser audit: 24 route/viewport combinations and 14 interaction checks passed; no missing assets, overflow or unintended hero overlap. Automated accessibility assertions passed; some contrast checks require manual judgement.
- Performance budgets and secret scan: passed. Artwork <=200 KB and initial route JS <=180 KB.

Evidence: `.audit-logs/scene-continuity/verification/final-results.json` and `.audit-logs/scene-continuity/latest-site-quality/results.json`.

The tests use local production builds and temporary fixture accounts. They do not establish production network performance or a field Core Web Vitals score. The shared workspace contains separate ongoing hero work; the validation snapshots preserve that work without publishing it.
