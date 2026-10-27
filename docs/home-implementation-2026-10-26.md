# Home implementation — 26 October 2026

This is the current Home-page implementation record. Earlier Home notes describing FactorySystems, a half-cut chamber, 16 fragments or a top-resting Philosophy cube are superseded here. Other pages retain their separate work in progress.

- Home retains its seven-cell source lattice and four base cells. Two upper cells tile into 8 and 27 fragments. The fragments move backwards with distance-based scale and fade; the third upper cell remains a full identity cube.
- The complete identity cell makes two accumulated rotations. Prepared sharp/rounded vertex buffers morph on the GPU while seeded edge particles shed in waves. The final original image is an independent plane, matching the Enter Lattice source rather than a raster-traced contour. The final face is camera-aligned. The volumetric shell uses the entry pulse's 2.5-second period and 6% expansion. Its front face stays steady.
- V-MES/SCADA, V-Twin, V-AI and V-MO replace Execution/Context/Intelligence on Home. These are labelled concept views with semantic SVG diagrams and actual navigation links. One bounded 2D particle layer reveals the group; diagram motion is finite and pauses offscreen. Reduced-motion/Save-Data modes retain usable content.
- Connected Lot remains the five-step manufacturing/evidence story, with Human Review fourth. Its caption contrast is strengthened.
- Alpha and Philosophy artwork no longer sit inside frosted full-section cards. The Home shell has softer shadows and less frost; stronger glass belongs to app previews and selected evidence blocks. Alpha has more usable width/height and supports a 2x pixel-ratio ceiling before adaptive quality reduction.
- Philosophy's individual cube forms from a wave, holds, descends into the medium cube's center, and merges. Its shade follows the medium cube. It starts only with meaningful visibility.
- The compact interactive roadmap uses shared data for five phases: Years 1–2 process proof, Years 3–4 connected capability, Year 5 OEM phase, Years 6–7 global competition, Years 8–10 global-brand ambition. It states readiness and evidence conditions. One lazy scene animates selected states; semantic text and a diagram remain without WebGL.
- Home's mobile header compacts on downward scrolling and restores for upward movement or open navigation. Existing focus/Escape/menu behavior is retained.

Verification ownership: scripts/verify-home-page.cjs covers desktop, regular/short phones, both themes, 35 fragments, two turns, four app previews, roadmap selection, Philosophy center merge, overflow and scoped WCAG A/AA checks. Unit tests cover the exact fragment tilings, full-turn timeline, matching rounding topology and identity plane. Renderer-captured opening/completed posters cover Home, Philosophy and Alpha; native display-size Alpha openings cover desktop and phone.

Publication is separate from local verification. Do not describe this page as deployed until its actual release and live checks succeed.

Final local validation: production build succeeded; 221 tests in 43 files passed; asset and route bundle budgets and secret scan passed. Six desktop/phone/theme cases (1440×900, 390×844, 360×640) had no scoped WCAG A/AA violations or horizontal overflow. Reduced-motion and Save-Data checks started zero WebGL contexts. Twelve opening/live comparisons for Home, Philosophy and Alpha passed the existing continuity tolerances. Evidence: .audit-logs/home-page-20261026/.
