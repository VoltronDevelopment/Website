# About and Partner artwork implementation — 27 October 2026

Implemented locally on `/about` and `/partner`. No push or deployment. KUKA/Ontology remains deferred. Page copy, navigation, forms, theme ownership, Montreal typography and the shared responsive hero frame are preserved.

## About: two original stair structures, three people

The final user direction superseded the first single-flight study. The active artwork preserves `StraightStair001` and `LTypeStair002` from the supplied model. The straight stair has one walker; the L stair has two independently phased walkers. The two original matching rigs/clips are retained, rather than moving an unrelated gait onto newly invented steps. No retargeting or tread resizing is needed.

The source structures have opaque pearl tread surfaces, clearer near faces and darker recessed glass faces. Their geometry and tread dimensions remain intact. A low glass foundation gives each structure a deliberate footprint. The three figures use pearl, graphite and slate finishes, with source-appropriate bodily proportions. The source stair material groups are derived from their transformed face normals, so faces receive distinct optical treatment instead of a uniform bright blue fill.

Formation progresses through directed fine-particle waves: the structures resolve first, followed by all three figures with a short stagger. Walking begins only after figure formation completes. Each actor uses its own mixer/skeleton and a bounded interval of its authored clip; no actor wraps to the start. The ascent eases into stillness and the timeline stops at twelve seconds.

## Partner: shared object development

The handshake hero has been replaced by the two user-approved Human After All figures behind a locally authored rounded worktable. Original figure poses and helmet geometry are preserved. Body surfaces are satin; helmet regions have separately polished metal/roughness treatment. Both figures appear from surface-sampled particle waves.

The table has a restrained transmission surface with thickness/IOR, a quieter translucent structural fascia, internal geometric bracing and cylindrical supports with contrasting finishes. It uses the established studio environment and softboxes. Only the tabletop receives transmission; independent transmission passes are not added to every surface.

One bevelled arched workpiece supplies all of its states: tabletop blueprint, dimensional wireframe, particle deposition and finished metal. Its physical material includes clearcoat and controlled roughness. A bounded virtual reflection sits beneath it on the tabletop, and a moving inspection softbox changes the highlight as the thin scan plane crosses the sample. Temporary construction graphics fade out, leaving the finished piece and figures. The sequence stops at twelve seconds.

## Assets and runtime

- `scripts/build-collaboration-assets.mjs` derives selected assets without overwriting downloaded sources. Six unused people/structures, unused tracks, textures and source material dependencies are removed. Matching binary accessor payloads share storage.
- About uses two source rigs, two clips and five meshes in a compact glTF/bin pair. Three runtime instances occupy the stairs 1 + 2.
- Partner uses two indexed position/normal/index binaries derived from the named OBJ figures. Their absent MTL is replaced with locally authored materials. No skeletal motion is claimed for the OBJ figures.
- `CollaborationHero` owns lazy mounting, completed fallbacks and shared artwork controls; `collaboration-renderer.ts` owns scene resources. `story-formation.ts` samples the actual initial skinned/static pose once and combines coherent point transport with a matching surface reveal. Walking starts after deposition, so the initial particle silhouette does not drift away from a moving body.
- Main materials, particles and late-appearing sample shaders are prewarmed before the live handoff. Resource cleanup includes mixers, skeleton textures, geometry, materials, studio environment, shadows and the WebGL context.
- Playback pauses offscreen/when hidden. Pause, resume, replay, inspector seeking, theme changes and context restoration preserve the authored clock. Seeking and keyboard resume use the same paused state.
- Desktop, short laptop, tablet and phone opening frames are direct native renderer captures. Their authored world bounds control display size; they are centred through layout, without a transform resampling layer. Completed fallbacks use the same scene and camera projection. Images remain below 200 KB each.

Stair source attribution and modifications are available in the existing footer Artwork credits disclosure and `public/stories/stairs-license.txt`. Human After All provenance is recorded as user supplied; its bundle does not include author/license metadata. The original ZIP remains intact. No third-party tutorial code or new runtime dependency was introduced.

## Verification

The isolated production build is `.next-collaboration-20261027`. All 238 tests in 46 files pass, including both compacted skeleton/animation bindings, model indices, route asset budget, separated gait intervals and finite formation timelines. Typecheck, existing performance budgets, secret scan and the strict premium UI audit pass.

Browser evidence is under `.audit-logs/collaboration-20261027/`:

- `strict-final/results.json`: final stage/particle poses, strict full-bounds checks at 320/390/820/1280 pixels plus the 1440-pixel pose study, both themes; pause/replay, finite end, offscreen suspension, theme stillness, context restoration and zero-GPU reduced-motion/Save Data/static fallbacks.
- `strict-final-parity/results.json`: native opening-image/live-canvas comparisons at 1440×900, 1280×720, 820×1180 and 390×844 in both themes. Original colour/alpha thresholds are retained.
- `final-access/results.json`: keyboard Enter resume and Space pause, plus zero serious/critical axe findings on the changed main content of both pages.
- `final-failure/results.json`: blocked model loads retain decoded completed images and release the WebGL context on both pages.
- `final-native-posters/results.json`: renderer-derived final opening and completed images, including native device-sized particle captures.

Final machine-readable counts, build identity and asset sizes are recorded in `summary.json` in that evidence directory. Historical single-flight and earlier camera studies are retained as audit evidence and are superseded by the final report paths above.

Final browser results: **38 scene/responsive cases, eight lifecycle checks, 16 native poster comparisons, two keyboard/accessibility checks and two model-failure checks pass**, with no page/shader errors. Essential geometry bounds stay within the canvas with a 1% margin at the checked device sizes. Both changed pages have zero serious/critical axe findings. The model-failure checks confirm the completed images decode and the attempted WebGL contexts are released.

Local preview evidence: `strict-final/about-light-12.png`, `strict-final/partner-light-12.png`, `strict-final/about-390-dark.png`, `strict-final/partner-820-light.png`, plus the 2.6-second particle formation frames for both scenes. Source model geometry totals approximately 2.48 MB across the two routes before transfer compression; each route loads only its own model assets. Captured artwork files remain below the existing 200 KB limit.
