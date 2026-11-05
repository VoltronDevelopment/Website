# Local implementation verification — 4 November 2026

Historical site-wide verification below predates the later user-directed factory reconstruction. The full goal remains active: current factory fidelity/motion acceptance and review-clip validation are not yet closed. No push or deployment has occurred.

Production artifact: `.next-goal-complete-20261104-final`, build ID `hoNInIpOWVkcwOWVi5WXZ`. This artifact and its source manifest are a historical site-wide baseline. Later factory source changes use .next-factory-alpha-kit-20261104 and are documented in factory-three-stage-2026-11-04.md; do not treat the older manifest as proof of the current source. A hash manifest of the changed source lives at `.audit-logs/goal-coherence-20261104/verified-source-manifest.json`. Generated `next-env.d.ts` and `tsconfig.json` build-path edits were restored; no user implementation was reset.

## Verified outcomes

- `npm test -- --maxWorkers=2`: **75 files, 335 tests passed**. The earlier full-suite run exposed duplicate anchor clearance and one load-sensitive inquiry timeout. Duplicate per-section offsets were removed across page styles, its regression test expanded, the inquiry check passed independently, then the whole bounded-concurrency suite passed. No application integrity behavior was weakened.
- `npm run build`: final production build succeeded, including type checking. Initial page JavaScript remains within the existing <=180 KB compressed budget.
- `node scripts/check-performance-budgets.mjs .next-goal-complete-20261104-final`: passed configured manifest budgets.
- `npm run performance:refined-artwork`: passed the additional fallback-family gate, including native dimensions, 12px transparent agent capture margins, <=200 KB baseline delivery and <=1.2 MB higher-density copies. This supplements rather than overstates the legacy manifest gate.
- **96 responsive cases**: 8 main routes × 6 viewport sizes × both themes; no page errors/document overflow. Sizes: 360×640, 390×844, 768×1024, 1024×768, 1440×1000, 844×390.
- **20 accessibility/text-stress cases**: 8 main routes plus both entry routes at desktop/light and phone/dark; no automated WCAG A/AA violations, no document overflow after doubling visible text/line height. These are automated checks and a reflow stress method, not a screen-reader certification or every browser's native text-only zoom.
- **8 current-build internal-clipping checks**: all main routes at phone width; zero exposed text clipping after filtering intentionally hidden/screen-reader-only/collapsed content. Native record/product/module dialogs wrap keyboard focus and return it to their triggers; sheet padding stays open, while backdrop clicks can dismiss.
- **24 entry size/theme cases + a live preference change**: wordmark stays inside the frame and above countdown content; no horizontal overflow, no automated accessibility violations. Short landscape uses a lateral composition. Switching reduced motion during introduction resolves the wordmark and stops its clock. The ordinary direct-entry link is available without waiting for decorative completion.
- **32 normal-motion page journeys / 148 section samples**: all main routes at desktop/phone in both themes, no uncaught errors or shader-program failures. Three initially sampled character/culture hosts were still handing off; follow-up checks waited for their actual `live` states and confirmed visible handoff.
- **Four roadmap cases**: every milestone produces the required cumulative count; final five cubes remain on the same foundation. An actual intermediate 0→4 transition was reversed to stage 1 using one synchronous selection event: displayed sizes matched before/after retarget, then settled to two cubes and the correct card. Tests wait for both target index and progress, not stale settled flags or fixed delays.
- **Network**: all four scenes recovered after forced graphics loss at both widths. Construction's six selected stages were captured and visually reviewed: foundation, supported frame, enclosure, installed equipment, connected systems and roof/completion. The local point fronts disappear at completion. No floating finished roof/equipment choreography remains.
- **Complete physical journeys**: connected factory and 44.96-second Alpha guided tour ran to completion at desktop/light and phone/dark. Live states/frames cover receiving, hold, transfer, scan, dispatch and attachment/turn/dwell/unloading. `physical-cycles.json` records both completed journeys without page errors. Sampled source poses also cover eight Alpha physical events in both themes at both widths, plus Partner joints/contact and About stairs.
- **Recovery/interruption**: head/agent offscreen clocks pause/resume; gallery forced loss freezes/restores the clock. Technology, selected Commons study and fluid detail restore current state after forced loss. A simulated hidden-document event suspends/resumes the factory clock. This is runtime lifecycle evidence, not an OS/browser background-throttling benchmark. Motion-off disposes unnecessary gallery/task/detail rendering and displays matching posters; re-enabling resumes live artwork.

## Artwork acceptance

All six agent master families are now native **1024×1024**, fully contained, in both themes. The earlier 729×1024 captures were rejected and replaced. The 384-wide copies were regenerated from accepted masters. Both complete contact sheets were visually reviewed: distinct cloud/motion families remain contained by consistent glass shells.

Philosophy desktop stills are native **1040×740**; mobile composition is **640×680**. They show the solid contribution cube merged inside the enclosing volume. Network retains native mobile compositions plus 1280-wide baseline / 2240-wide higher-density desktop sources; baselines are approximately 46–92 KB. Partner's changed completed shadow/pose and Intelligence's enlarged portrait have matching final stills. Coming Soon and compact agents retain a matching still while loading, in static mode, and on graphics loss. **84 refreshed PNG/WebP masters/derivatives decode successfully.**

Capture-only drawing-buffer preservation and `poster-dpr=2` stay restricted to explicit capture URLs; ordinary rendering keeps its existing adaptive limits. No screenshot is enlarged and presented as a native HD render.

## Motion-recording limitation and replacement

The browser's automatic video recordings omitted Three.js canvases under the software graphics path even though live canvas screenshots and state checks were correct. Those blank recordings are **rejected evidence**. The original `physical-cycle-clips` files must not be presented as valid artwork recordings.

Live full-cycle screenshots/contact sheets remain valid. Replacement review clips use visible canvas screenshots taken while the real animation clock advances, preserving capture-time spacing; their frame log records the source pose/time. They are review artifacts rather than a physical-device frame-rate measurement. Final acceptance requires viewing the replacement frame contact sheets/clips; do not claim that the rejected automatic videos were inspected successfully.

## Material limits

No physical phone/tablet GPU, battery, thermal or memory testing was possible. Local software-rendered Edge results do not prove a 60-fps or 30-fps device tier. Pixel samples/contact sheets are not anatomical or industrial-process certification. The simulation remains illustrative and preserves human review/release language. Flute & Forge principles were derived from inspected local source, not a fresh successful live-site audit. These are reported limits of verification, not unfinished implementation or a deployment request.

## Superseding current acceptance — 5 November

See final-local-acceptance-2026-11-05.md for the current factory build, 339 passing assertions, refreshed 96 responsive/20 accessibility/14 interaction evidence rows and validated visible-frame clips. This report is historical where it names the old artifact or pending clip acceptance.
