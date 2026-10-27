# Rendering implementation — 27 October 2026

Implemented the approved reference pass locally. The existing layout, page background, typography, navigation, original logo image, anatomical assets and manufactured parts remain the design baseline. No dependency, deployment or push was added.

## Shared particle transport

`components/brand/particle-wave.ts` owns two analytic GPU fields: deposition along three narrow ribbons and directional release with a bounded lateral arc. Both use absolute scene time and seeded samples. At full deposition, displacement is exactly zero; release has a stable authored direction. There is no independent simulation clock or per-particle scene object.

- **Connected Lot:** layered Receive/Dispatch paths; 2,100 original surface samples plus 700 lower-alpha lag samples create short trails. The original part, one carrier, five evidence records, Human Review timing and mobile conveyor remain intact.
- **Home:** directional arrival and retreat in depth, with the existing seven-cell / four-base / 8+27 fragments / identity story and two complete turns preserved.
- **Philosophy:** a narrow incoming wave deposits the small contribution cube before descent. The existing merge response remains tied to contact.
- **Technology:** the same 2,592 formation samples follow a calmer layered front. All 54 nodes and 346 connections remain unchanged.
- **Intelligence / Culture / Partner:** the shared anatomical surface shader uses seeded currents during formation. Approved anatomy, particle density, hero contribution order and scans are preserved.
- **Manufacturing:** deposition bends onto the approved bracket before the existing bright scanning plane crosses it.
- **Network:** a quiet transient point field deposits onto polygon-shell edges. It disappears after envelope formation; no route arcs were reintroduced. Map contrast and one complete globe turn remain intact.
- **Commons:** bounded upward deposition follows the tree surface. Cube-to-root energy and independent canopy responses retain their corrected endpoints.
- **Roadmap:** particle movement is now computed in a GPU shader from phase/count/progress. It no longer rewrites and uploads 1,400 particle positions each frame. The original five phase structures and Year 5/7/10 narrative remain intact.

Alpha tank geometry, gantry, boards and guided cameras were not changed. Ontology already has selected-relationship responses; a separate atmospheric canvas would add visual noise and was not introduced.

## Home optical treatment

The identity cell retains the physical pearl/smoked faces and exact original Enter logo plane. A local edge-distance mask combined with a view-angle response replaces the uniform outer-shell pulse. Positive-Z front geometry is excluded from the shell emission, and the front physical material has zero emissive pulse. Sides and rounded silhouette carry the pulse while the image and backing remain steady.

One planar-reflection pilot uses the installed Three.js r186 Reflector, without the obsolete third-party reflector package. The pilot uses one 512px target on desktop / 256px on phone, no MSAA, five-tap softening and a radial contact fade. It excludes the old echo, floor, shadows and transport particles during capture. Capture updates are bounded to 20 time buckets per second while the pose changes, then cached after settlement. Resize and theme changes invalidate the cache; the existing scene lifecycle owns all work.

**Default decision:** retain the existing floor echo. The restrained planar result adds little visible benefit in the inspected composition and costs roughly 2–3 times as much in the software-WebGL CPU seek comparison. The pilot is available locally by adding `reflection=planar` to the Home URL. These timings are not hardware frame-rate claims; hardware profiling is needed before promoting the extra render pass.

## People & Culture supporting helix

Replaced only the static Individual / Whole supporting illustration. The prominent head-and-hand hero remains in place.

- 0–1.4s: distinct ribbons approach.
- 1.4–3.8s: they intertwine into a dimensional helix.
- 3.8–5.2s: five bridge groups illuminate for the growth conditions above.
- 5.2–7.5s: the particles gather into a contribution cube within a clear enclosure.
- After 7.5s: the nested structure is still.

One Points buffer uses 4,800 samples on desktop / 2,400 on phones. Five bridge groups are batched line segments. The final enclosure reuses the established Philosophy cube materials and geometry. HTML Individual craft / Shared purpose selectors update the explanation and replay with the corresponding strand emphasized. Pause/replay, offscreen and hidden-tab suspension, context restoration, reduced-motion and Save-Data fallbacks are implemented. The same deterministic timeline drives captures and live rendering.

## Sources and reuse

The technique review is in `docs/2026-10-27-rendering-reference-review.md`. Wave, helix and masked-glow code was authored locally from the reviewed principles. No legacy Codrops runtime or bundled model was copied. The installed MIT-licensed Three.js Reflector addon supplies the reflected-camera implementation. No new Motion, reflector or postprocessing dependency was needed.

## Verification

Evidence is stored under `.audit-logs/rendering-pass-20261027/` and `.audit-logs/scene-continuity/`. Final results are recorded after the production/poster verification pass below. The renderer captures include shader-console validation, and poster image/bundle thresholds are unchanged.

Final verification:

- Production build `.next-rendering-pass-20261027`, TypeScript and **231 tests across 45 files** pass.
- **126** responsive/accessibility/text-zoom cases and five supporting-page interaction flows pass, with no reported clipping, overflow, missing assets or accessibility violations.
- **40** opening poster/live comparisons pass the unchanged colour/alpha tolerances.
- **56** primary live artwork cases pass in a fresh complete repeat, plus **8** roadmap/plant and **24** intermediate particle-pose checks, at desktop DPR 2 / phone DPR 3 in both themes.
- Helix: 16 staged captures; selectors, pause/replay, finite endpoint, offscreen suspension, context restoration and motion-preference changes pass. Three static modes decode the completed poster with zero WebGL contexts.
- Eight echo/planar comparison cases verify bounded targets and settled caching. Software CPU seek medians were approximately 17–20ms for the echo and 35–59ms for the pilot; these are diagnostic timings, not hardware GPU frame rates.
- The first concurrent live run reported one React #418 hydration warning on Network. The original report is retained in `live-dpr/results.json`; the isolated Network recheck and the subsequent complete 56-case repeat have no browser/shader errors. No speculative framework change was made for the non-reproduced warning.
- Strict premium audit, secret scan, image/bundle budgets and whitespace checks pass. Home opening captures remain below 200 KB using quality 90 (light) / 88 (dark), with full alpha quality and successful parity comparisons.
- No push, deployment, commit or production inquiry submission was performed. Local fixture processes stop on completion.
