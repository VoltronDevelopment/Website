# Voltron rendering references — evaluation and proposed next pass

Reviewed 27 October 2026. **Recommendations for discussion; no production artwork, dependency, timeline or page layout changed in this pass.** The existing background, typography, approved head/arm/component geometry, Home identity story and navigation remain the baseline.

## Recommendation

Prioritise a shared particle-wave motion family, masked volumetric rim glow, and a new secondary People & Culture double-helix story. Pilot one real floor reflection in Home before considering broader use. Dynamic environment probes and a new animation library are optional experiments after those improvements prove their value.

These are different rendering problems: an environment map shapes reflections on glass/metal; a planar reflector produces a reflected scene on a flat floor; transmission shows light passing through glass; a rim shader adds a view-dependent highlight; bloom spreads selected brightness into neighbouring pixels. Each needs its own restrained treatment.

## What was reviewed

- [three_reflector](https://github.com/aalavandhaann/three_reflector), including README, package metadata, the module entry and GroundSceneReflector source.
- [Dynamic reflections in Three.js](https://pierfrancesco-soffritti.medium.com/dynamic-reflections-in-three-js-2d46f3378fc4), including its CubeCamera technique and old example API.
- [ShaderFrog Glow & Fresnel](https://shaderfrog.com/threejs-shaders/glow), viewed in the browser after the web reader could not retrieve it. The public [Glow Outline Rim](https://shaderfrog.com/editor/clu9lg0dr0002pa2mw2bo123g) editor was opened and its fragment calculation inspected. Other entries on the category include Pro examples; their source was not copied.
- [Codrops particle demos](https://tympanus.net/Development/3d-particle-explorations/), the [author's article](https://tympanus.net/codrops/2017/12/12/3d-particle-explorations/) and [repository](https://github.com/jackrugile/3d-particle-explorations). Source inspection covered common particle/system classes and the ring, noise-line, separation, helix, ripple, fan, lattice and point-cloud implementations.
- [Motion Three.js integration](https://motion.dev/docs/three), including transforms, uniforms, sequences, scroll and render-loop scheduling.
- Current local Three.js r186.1 sources, the installed Reflector/CubeCamera implementations, and Voltron's existing studio, floor echoes, Home/lot particles, culture choreography, tree and scene lifecycle.

## 1. Reflections: improve the optical family in stages

### Existing baseline

`components/brand/artwork-studio.ts` already creates shaped softbox lighting and a prefiltered studio environment. `createFloorEcho` mirrors geometry into a faded virtual image with no additional scene-render pass. This is economical, but its echo material does not reproduce all of the source glass, glow and shading. A better reflection needs more than higher echo opacity.

### three_reflector

The package demonstrates a reflected camera, an offscreen texture and floor/base-texture blending. Its package declares MIT and targets Three.js `^0.118.3`; source still references `renderer.vr`, the old multi-argument render call and the old Math export. It is a technique reference rather than a compatible dependency for our installed renderer. [Package](https://github.com/aalavandhaann/three_reflector/blob/master/package.json), [module source](https://github.com/aalavandhaann/three_reflector/blob/master/index.js).

Use the [Reflector already provided by Three.js](https://threejs.org/docs/pages/Reflector.html). The local r186 addon also handles orthographic reflection cameras, which matters for Voltron's fixed compositions. Stock Reflector is a mirror; roughness blur, floor-distance falloff and restrained compositing require additional work.

**Proposed Home pilot:**

- One floor reflector beneath the retained base cubes, using the existing ground level and camera.
- Capture only relevant artwork; exclude the reflective plane itself and avoid recursive reflections.
- Test a bounded 512px target on desktop first. Retain the current inexpensive echo on constrained devices; a 256px mobile tier is an experiment, not an automatic default.
- Apply modest intensity, a softened reflection and strong fade away from contact. Keep contact shadows and the original pearl/navy face contrast.
- Update while geometry changes, then cache the completed reflection. Refresh on resize, theme change, replay or relevant camera movement. Any lower reflection update rate must be checked for visible stepping.
- Remove the old echo for the same floor when the real reflector is enabled, preventing doubled reflections.
- Begin with Home. Consider the single manufactured part afterward. The neural graph and thirteen-tank plant do not need an independent reflection pass per object.

### Dynamic CubeCamera reflections

The Medium example captures the surrounding scene from six directions and feeds the result to reflective material. Its old constructor/update calls must be replaced with the current render-target constructor and `update` API. The [current CubeCamera documentation](https://threejs.org/docs/pages/CubeCamera.html) shows the supported pattern and hiding the reflective subject during capture.

This can help a metal part reflect nearby moving geometry. It is still a point-sampled environment approximation, with six views per update; it does not provide accurate glass thickness, transmission or every cube's mutual reflections. Our existing studio environment is already useful for these fixed cameras. A single small, infrequently updated probe is worth a later comparison; per-cube probes are a poor first investment.

## 2. Glow: a clear body, a controlled edge and a steady logo

The inspected ShaderFrog rim shader computes a view-angle response from the surface normal and eye direction, then uses a smooth threshold to shape it. This is useful for bevels, shells and curved surfaces without a full-screen bloom pass. [Public example](https://shaderfrog.com/editor/clu9lg0dr0002pa2mw2bo123g).

For Voltron, use three coordinated layers:

1. The existing pearl/smoked physical surface and softbox reflections establish volume.
2. A narrow edge/bevel mask carries the bright pulse, with Fresnel shaping where useful.
3. A softer, weaker outer shell gives limited spatial spill.

A critical detail: a flat cube face has an almost constant normal. Fresnel alone can brighten the entire face instead of its geometric edges. Combine it with bevel normals or a face-local edge-distance mask. Keep the Home logo/front backing excluded from the pulse. Its exact Enter image stays steady; the sides, rear and rounded silhouette carry the existing rhythm.

Use a visible darker blue core with a tight highlight in light mode; use an ice-blue highlight over preserved dark faces in dark mode. The whole material should not become uniformly white. Neural nodes need only brief selected-path responses. Scan planes keep their existing bright cores and layered rims. A selective bloom experiment is secondary and should target specific emitting geometry, with a distinct mobile budget.

## 3. What to borrow from the eight particle studies

| Study | Useful principle | Voltron application | Adaptation |
|---|---|---|---|
| 1 — rings | Staggered angular phases and depth offsets | A short scan-acquisition response | One bounded event; avoid permanent rotating rings |
| 2 — noise lines | Coherent displacement, tapered at the ends | Formation/dispatch ribbons and anatomical entry | Evaluate a restrained field on the GPU; keep endpoints stable |
| 3 — separation | Local spacing and progressive depth release | Home fragment retreat or outgoing dust | Precompute seeded spacing; avoid a large pairwise CPU simulation |
| 4 — double helix | Opposite-phase strands with connecting bridges | People & Culture's shared-growth story | Fine points and sparse bridges; preserve human hero |
| 5 — ripples | A local event influences nearby particles | Philosophy merge or Commons root response | One subtle impulse, tied to actual contact |
| 6 — fan trails | Short, curved paths behind moving points | Dispatch/retreat trails | Trail follows departure direction and expires |
| 7 — lattice blending | Position-dependent stagger and deformation | Roadmap transitions and capability formation | Keep geometric discipline and our restrained palette |
| 8 — noise point cloud | Batched points, per-point size/alpha and spatial flow | Shared particle transport between surface states | GPU field plus target positions; restrict free drift |

Source anchors: [noise lines](https://github.com/jackrugile/3d-particle-explorations/blob/master/js/demo-2/particle.js), [separation](https://github.com/jackrugile/3d-particle-explorations/blob/master/js/demo-3/system.js), [helix](https://github.com/jackrugile/3d-particle-explorations/blob/master/js/demo-4/system.js), [ripples](https://github.com/jackrugile/3d-particle-explorations/blob/master/js/demo-5/ripple.js), [trails](https://github.com/jackrugile/3d-particle-explorations/blob/master/js/demo-6/particle.js), [lattice](https://github.com/jackrugile/3d-particle-explorations/blob/master/js/demo-7/particle.js), [point cloud](https://github.com/jackrugile/3d-particle-explorations/blob/master/js/demo-8/system.js).

The helix source uses 48 bead meshes and separate rung lines. Several studies use `THREE.Geometry`, old geometry aliases or `addAttribute`. Demo 8 batches 8,000 points but still advances per-point CPU state and uploads attributes repeatedly. Reuse the motion ideas in our modern typed-buffer/shader system rather than importing the old loader/build stack. The repository README permits integration in personal/commercial projects with restrictions on redistribution; retain provenance and check included dependencies separately. [Terms in README](https://github.com/jackrugile/3d-particle-explorations/blob/master/README.md).

## 4. A shared particle-wave family

Our Home and Connected Lot already use seeded points, surface sampling and coherent reveal fields. The next improvement is richer trajectories and continuity, not a blanket particle-count increase. The Intelligence portrait already uses a dense 64k/48k field.

Proposed reusable owner: a shader/attribute helper with per-scene profiles, integrated into existing controllers. It should not create a new canvas or clock.

- **Transport:** two or three narrow, layered ribbons carry particles toward the object; low-frequency displacement supplies spatial flow.
- **Deposit:** an arrival band bends onto the sampled surface. The same phase/field controls both particle convergence and material reveal.
- **Process:** a localized band follows the scanner or operation, with restrained surface-relative motion.
- **Release:** particles leave along authored paths with depth, decreasing energy and a short lifetime.
- **Hold:** transport disappears and geometry settles. Only Home's approved identity pulse remains continuous.

Expose direction/path, band width, depth, turbulence, phase and brightness as meaningful scene controls. Use seeded, absolute-time evaluation so replay, seeking, captures and fallback poses agree. Small point cores, sparse brighter accents and a few short trails will improve apparent density without oversized balls. Keep depth testing or carefully masked occlusion so particles do not show through the logo or the finished face indiscriminately.

Start with analytic curves and a small noise field. GPU texture simulation is justified only if authored fields cannot express the desired motion. Avoid independent random displacement every frame, new material/geometry allocations during playback, and per-particle scene objects.

## 5. People & Culture: proposed double-helix story

**Recommended placement:** replace the static Individual / Whole supporting illustration with a finite interactive particle artwork. Keep the head-and-elbow/palm hero, its scale and its contribution order intact.

The two strands represent **individual craft** and **shared purpose**. This borrows the structure of DNA as a metaphor for growth and continuity; the page remains about people, learning and culture.

| Proposed time | Visual event | Meaning |
|---|---|---|
| 0–1.4s | Two fine ribbons arrive from separate directions | Distinct people and perspectives |
| 1.4–3.8s | Ribbons intertwine into a calm, dimensional helix | Individual growth within shared purpose |
| 3.8–5.2s | Five groups of short bridges illuminate in sequence | Depth, Craft, Courage, Imagination, Humanity |
| 5.2–7.5s | The helix gathers into a small contribution cube and resolves within a clear enclosure | Individual capability strengthens the whole |
| After 7.5s | A still, legible nested structure | The meaning remains visible |

These timings are proposed, not approved choreography. Keep labels in ordinary HTML. Selecting Individual or Whole can highlight the corresponding strand in a replay without adding tiny floating labels. On phones, use a shorter vertical envelope, fewer samples and the same meaningful endpoint. Preserve pause/replay, offscreen suspension and a completed static fallback.

An alternative would put the helix before the hero's head formation. I would reserve that for an explicit hero redesign: the existing head → first cube → hand → second cube story already needs time and visual attention.

## 6. Page-by-page application

| Page / artwork | Proposed refinement | Boundary to preserve |
|---|---|---|
| Home hero | Richer arrival wave, directional retreat trails, masked body glow; one floor-reflection pilot | Seven-cell source, four base cubes, 8+27 fragments, two turns and exact steady logo |
| Connected Lot | Layered Receive/Dispatch ribbons, surface-coherent deposition/release, short departure trails | One part/carrier; five evidence stages; stronger Human Review; mobile conveyor motion |
| Philosophy | Small cube deposits from a wave; one local response when it merges | Same medium-cube shade; enters the center; no early wire outline |
| Technology | A formation front crosses the layers; only selected paths carry strong travelling energy | All 54 nodes/346 links; deeper glass faces; fixed camera |
| Intelligence | Coherent fine-particle currents around the forming head; narrow scan-relative particles | One portrait; prominent horizontal/vertical scans; no backdrop mesh |
| Manufacturing hero | Particle deposition follows the component surface; stronger scan-local light response | Approved part and formation-before-scan sequence |
| Alpha / V-Twin | Better local scanner/beacon response where meaningful; no generic atmospheric dust | Approved tank geometry, boards, gantry and guided camera |
| Network | A quiet wave forms the polygon envelope; local marker responses | Readable land/ocean; one full turn; no restored route arcs |
| Ontology | A brief pulse travels only along selected record relationships | Readable HTML graph and clear responsibility; no new background particle canvas |
| People & Culture | The secondary helix described above | Prominent head/hand hero remains the primary story |
| Commons | Root-bound fine flow and delayed local canopy patches | One support cube; energy stops at roots |
| About / roadmap | Ordered lattice assembly and short phase-dependent particle exchanges | Evidence-led phases and readable text, including Year 5/7/10 direction |
| Partner | Better particle continuity at the existing hands' exchange | Existing artwork meaning and stable, functional inquiry forms |
| Enter / Coming Soon | Remain the identity reference | Exact logo, backing, readability and established entry behavior |

## 7. Motion: useful authoring, optional dependency

The current [Motion integration](https://motion.dev/docs/three) supports vanilla Three.js objects, material properties, shader uniforms and mixed HTML/SVG/3D sequences. Its render scheduling and cleanup matter; rotation shorthands use degrees even though Three.js stores radians.

Our renderers already have finite clocks, seek, replay, hidden/offscreen suspension and deterministic poster capture. Keep one owner for time. If Motion helps later authoring, drive one master progress value into existing scene-state functions and coordinate relevant DOM labels. Do not add a second perpetual render loop or one animation object per particle. Adding Motion does not make the particle simulation or reflections intrinsically cheaper. No R3F or WebGPU migration is needed for the proposed work.

## 8. Proposed implementation order and review gates

1. **Shared wave pilot in Connected Lot.** Compare Receive and Dispatch at equal size/time on phone and desktop. Preserve the part's silhouette, arrival/exit boundaries and Human Review timing.
2. **Home optical pass.** Compare edge/bevel glow first; then compare the existing echo with one planar reflection. Keep the background and logo face stable. Select the reflection tier using measured benefit/cost.
3. **People & Culture helix prototype.** Review this secondary story on a short phone and desktop before integrating it with surrounding copy/selectors.
4. **Adapt wave profiles to the other artworks.** Each receives its own path and amplitude; preserve its existing narrative and endpoint.
5. **Optional dynamic-probe/Motion experiments.** Adopt only where a controlled comparison shows a useful improvement.

For each pilot: same-frame light/dark screenshots; actual mobile/higher-DPR fit; stable text and controls; no particle balls, silhouette washout or logo occlusion; no shader errors; valid replay/seek/context restoration; no work offscreen/hidden; reduced-motion/Save-Data completed fallback; updated opening/completed captures and accessible descriptions; unchanged asset/route budgets. Measure cold shader preparation separately from steady playback on hardware before expanding costly reflection passes. Proposed resolutions/counts above are starting experiments, not measured performance promises.

Only this review document was added. No production implementation or publication is included in this evaluation.
