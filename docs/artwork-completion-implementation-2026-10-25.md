# Artwork implementation — 25 October 2026

**Connected-lot update — 26 October:** [One travelling carrier](connected-lot-motion-2026-10-26.md) now replaces the four stationary copies. The glass box/component forms from particles at Receive, travels through fixed stages, holds for human release, and dissolves at Dispatch. Mobile uses relative conveyor motion beneath the centred carrier. Scanner glow and stage-specific stills are updated; the linked record contains production verification.

**Latest Home direction — 26 October:** The subsequent [selective reveal implementation](home-selective-reveal-2026-10-26.md) supersedes the earlier static seven-cell ending. All three upper cubes subdivide into 24 children and withdraw; the final pose has four base cubes and the exact mark centred slightly above them. The camera remains fixed, the protected logo area remains clear, and the deterministic 6.8s sequence stops in stillness. Current production verification and poster evidence are recorded in that document.

**26 October update:** Following the user's reversal, Home now has three light glass cubes (the two upper cubes behind the logo and the lower cube directly below it) and four dark navy glass cubes, in both themes. This supersedes earlier theme-dependent backing colours. Cell tone is shared by entrance, completed geometry and emergency SVG. The reversed palette passes 11 material/motion tests and the desktop/mobile theme, playback and reduced-motion review (`.audit-logs/home-three-light/results.json`). All four production-rendered Home posters are regenerated; completed frames are approximately 91–92KB each.

The requested page-by-page artwork pass is implemented in the existing Next.js, React and vanilla Three.js architecture. This record supersedes the “not implemented” checkpoint in the original completion plan. Existing working content, shared navigation, theme system, Montserrat typography and supplied geometry are retained. Nothing has been deployed.

## Delivered changes

| Page / artwork | Result |
| --- | --- |
| Home | Seven approved cells and exact mark; actual backing panes provide contrast instead of a logo blur. Dark backing is deep navy with low reflection/emission; light backing is milky white with a gentle glass response. Crown, near, recess and base faces have separate treatments. Broader reflection gradients, geometric rims, a longer scan and local receiving/floor accents improve depth. The 6.5s sequence still ends in stillness. |
| Technology | Existing part, equipment, lot, evidence and telemetry arrangement preserved. Filled display glass, physical edge rails, bright connection cores, restrained halos and finite travelling signals share the Home material vocabulary with lighter faces around the content. |
| Network | Dedicated 3D globe with public-domain land samples, 34 hubs and 76 authored routes. Regional meshes and intercontinental links give the facing hemisphere many connections. Raised arcs remain attached to their geographic endpoints and are depth-tested against the globe. The 10s intro makes exactly one forward revolution, completes every route, returns to its presentation angle and stops. Caption identifies the illustrative future vision. |
| Manufacturing | Existing bracket geometry retained. The surface coating boundary, particle band and local emission share the component coordinate system. Polished exposed regions contrast with the rougher treated shell. Atmospheric particles no longer obscure this scene. Alpha/process lighting uses the shared studio environment. |
| Intelligence | Current supplied planes-of-the-head sculpture and its formation retained, with a quieter portrait enclosure, more readable side/top glass, physical rims and scene-specific controls. The previously removed web remains removed. |
| Culture / Partner | Current supplied head, arm and wrist-holding sculptures retained, including the authored delivery path and shared Philosophy receiver. Shared studio lighting, physical outer/core/individual cube materials and uniform playback controls integrate these with the other pages. Current finite durations are 14s and 9.5s. Their source assets were updated concurrently in this workspace and preserved. |
| Ontology / About | Existing connected-object compositions retained with the display-glass and connection treatment. |
| Commons | Studio environment and selective glass refinement preserve the approved emblem artwork. Compositing no longer softens its backdrop. |
| Secondary artwork | Factory component, lot snapshots, Philosophy cubes and Alpha scenes share compatible materials. Missing explanatory artwork families now render labelled semantic diagrams from existing content instead of empty placeholders. |

Shared controls use labelled, keyboard-focusable 44px Pause/Resume/Replay buttons. The existing reduced-motion, Save-Data, failure fallback and deferred scene preparation remain. Theme and size changes preserve scene time. A query-gated `?artwork-review` studio offers relevant optical/particle settings and timeline seeking. Reset is local; settings do not become public product UI.

## Technique and dependency decisions

- Kept direct Three.js at 0.186.1; aligned declarations with `@types/three` 0.186.0. Added no rendering runtime library.
- Studied [Globe.GL examples](https://globe.gl/) and [three-globe](https://github.com/vasturiano/three-globe) for arc layering. The globe implementation and fixed topology are authored locally; it does not copy random example networks or run an independent library animation loop.
- Natural Earth geography is public domain; preparation/provenance live in `public/globe/README.md` and `scripts/build-globe-land.mjs`.
- Reflection bands, physical glass materials, studio lighting and geometric rims establish surfaces. Floor echoes are faded geometric approximations, not ray-traced reflections. Built-in transmission is disabled by default and limited to a development experiment on selected sides. No global bloom or depth-of-field pass was added.
- No particle-skull code or bundled model was reused. No new anatomical or factory asset is represented as verified engineering CAD or an actual operating facility.

## Verification

- 201 regression tests pass across 36 files, including monotonic single-turn rotation, all route endpoints, no isolated hubs/duplicate routes, persistent completed connections, glass role/contrast and current sculpture/timeline checks.
- Production compilation and TypeScript checks pass. Configured poster and initial JavaScript budgets pass; initial route JavaScript remains below 180KB gzip.
- Initial visual review covered ten heroes at 1440px and 390px in both themes, with replay, pause/resume, stable resize time and reduced-motion image loading. A bounded correction added the denser globe and darker Home backing; its follow-up checks pass.
- Opening/completed hero images, shared scene images, component images and lot snapshots have been regenerated from the actual renderers. Network additionally has dedicated 318×380 mobile captures: its screen-sized land points lose detail when only a desktop raster is reduced. The final four globe comparisons pass the original colour/alpha thresholds after that correction.
- Production poster continuity passes across 56 scene/width/theme combinations: 52 unaffected comparisons in the full run, plus all four globe comparisons in the targeted confirmation. Delayed loading, both desktop/mobile handoffs and eight initial reduced-motion/Save-Data checks also pass. The first full report retains the two mobile globe failures as provenance; `targeted-results.json` records their resolution, with no relaxed threshold.
- Site-wide production audit passes 24 route/theme/viewport combinations with zero WCAG A/AA automated violations, missing resources or browser errors. Three navigation/motion runs have zero doubled-artwork frames. Fourteen interaction checks cover preference changes, preserved resize, menu dismissal, selection controls and static process artwork.
- The last production build and budget check pass. All 24 engineered/globe hero posters are below 200KB (largest: 150,766 bytes); mobile globe posters are approximately 23–28KB. The largest emitted JavaScript chunk is 101,100 bytes gzip, separately from initial route totals; no new rendering runtime package was introduced.

Browser evidence is under `.audit-logs/artwork-completion/`; shared poster evidence is under `.audit-logs/scene-continuity/`. Software WebGL verifies rendering/state behaviour, not real-device GPU frame rates. Representative hardware profiling is still required before enabling expensive transmission or postprocessing.

Key evidence files: `artwork-completion/final/results.json` (ten heroes, 40 state checks), `artwork-completion/network-confirmed/results.json` (final globe confirmation), `artwork-completion/site-quality/results.json` (production site audit), and `scene-continuity/verification/{results,targeted-results}.json` (initial full continuity run and the corrected globe confirmation).
