# Hero artwork assets and replacement contract

25 October 2026

## Available assets

- Home: exact supplied `voltron-mark-original.png`, resolved through the existing optimized asset manifest. Its texture and seven cell coordinates remain intact.
- Intelligence: supplied `public/3D face/female_head.obj`; existing offline `head-points.bin` and welded `head-depth.bin` drive real volumetric particles and occlusion. Dataset version 2 shortens the upper cranium smoothly above the brow; its normals and depth surface share the same deformation. The portrait web was removed at the user's latest request.
- Culture / Partner: supplied Rhino hand-pose library in `public/3D hand`. Selected reference surfaces in `scripts/assets/rhino-hand-poses.json` drive reproducible offline preparation. P08 guides pinch/release; wrist-aligned P15/P11 guide handshake closure. Visible artwork remains particles; meshes provide hidden depth occlusion and diagnostic solid views only. Baseline stride eight, morph stride six; separate per-hand contact targets. Run `node scripts/build-hand-particles.mjs`. No Rhino decoder is fetched at runtime. Contact checks are approximate, not a certified collision simulation.
- Commons: existing approved leaf/circuit emblem with its existing Three.js glass foundation.
- Typography: existing Montserrat. No Montreal font asset was found; no replacement font was downloaded.

## Awaiting final assets

The bracket, machine and plant modules are locally authored procedural geometry, not externally sourced licensed models or representations of an actual plant. Their implementation is in `components/brand/engineered-hero-renderer.ts`. No external model or mockup screenshot is shipped as production artwork.

Replace these authoring functions when approved assets arrive:

| Subject | Current seam | Preparation |
| --- | --- | --- |
| Bracket | Manufacturing `component` group | Y up; base at Y=0; width about 4 units; bore facing +Z; center X=0. Apply transforms before export. Preserve real mounting bores and bevels. |
| Equipment | `equipment(parent)` | Normalize within a 1.1 × 1.0 × 0.9 cell interior. No labels or baked UI. |
| Factory | `factory(parent, scale)` | Approximate footprint 1.35 × 0.9; roof below Y=.4; fit existing foundation. An illustrative module, not a named site. |
| Handshake | Articulated grip datasets and per-hand contact morph targets | Prefer a jointly posed pair of right hands, with natural wrist taper, separate thumbs, clean knuckles and verified contact. Preserve sample identity between contact-ready and closed poses, and regenerate corresponding depth targets offline. |

Use GLB for final mechanical assets; retain documented provenance and license beside each source. Keep each scene's asset loading local to that scene. Do not add model downloads to the root layout. Final anatomical models should be sampled by the existing preparation scripts rather than downloaded as raw OBJ at runtime.

The bracket finish shader and surface samples must share **component-local X**. After loading a GLB, bake mesh transforms into geometry in this common coordinate system before assigning the finish material and sampling the surface. Its travelling boundary is `x + .09*sin(y*4) + .045*sin(z*7)`. Do not animate separate opaque/transparent duplicate components. This remains an illustrative surface transformation, not a literal treatment-process simulation.

## Scene and poster contract

New heroes use `hero-scene-timeline.ts`, `EngineeredHero.tsx` and the existing handoff and quality policy. Timeline queries: `?hero-review=1&hero-time=3`; completed durations: Technology/Network 7.5s, Manufacturing 6.2s, Ontology/About 6s. Debug times are deterministic. Controls never block content or navigation.

The Home renderer stays owned by `LatticeExperience`. Technology no longer registers as a compatible seven-cell morph destination; its topology differs. Normal navigation releases the outgoing scene and mounts the destination. A shared resource set is retained for the existing Home renderer only.

`scripts/verify-hero-family.cjs` with `HERO_CAPTURE=1` exports both themes and opening/completed poses of the new scenes into `public/heroes`. These posters are actual renderer captures at 960×760, not reference images. The orthographic framing and CSS contain behavior share this aspect contract. Recapture them whenever geometry, camera, material, or opening time changes.

For existing Home, portrait and hands, use `scripts/capture-scene-continuity.cjs` with `SCENE_DIST=.next` and selected `SCENE_KINDS=home,intelligence,handCulture,handPartner,commons`. This updates hashed poster manifests; rebuild after capture. Do not update the unused legacy `public/hands/*-light.webp` files and assume that the active shared poster changed.

## Performance boundaries

Intros stop at completion; viewport and document visibility suspend animation. Theme changes and resize render the current time without replaying. Particle counts and DPR are reduced on mobile; slow sustained frame sampling reduces DPR further. Paths and cube outlines are batched where possible. Geometry/materials/environment targets are disposed on scene eviction, and navigation cancels pending new-scene setup via AbortSignal. No continuous physics simulation or bloom pass is used.

Software-rendered browser verification checks behavior, not a mobile GPU performance target. Final asset installation still needs device profiling and visual approval, especially for anatomical contact and glass reflections.
