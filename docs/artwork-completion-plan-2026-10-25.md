# Voltron artwork completion plan — revised direction

25 October 2026. Original planning document following the user's globe and glass-face corrections. The subsequent implementation is recorded in [the completion record](artwork-completion-implementation-2026-10-25.md); the inventory and checkpoint below describe the pre-implementation state.

This supersedes the **Network factory hero** and **Home logo-backdrop blur** recommendations in the earlier artwork plans. Other approved geometry, content, page layout and finite sequences remain the starting point. The three mockups define the optical language; they do not require every page to contain the same cubes.

## 1. Decisions from the latest brief

1. **Network becomes a dimensional globe with glowing connections.** It rotates through exactly one full revolution while the connections build, returns to its chosen presentation angle, and settles with the connected lines visible. “Glove” is interpreted as “globe.”
2. **Home gets contrast through the glass itself.** Assign different optical roles to the faces behind, above and beside the mark. Remove the local blur around the logo after that material treatment is verified.
3. **Dark mode must contain visible volumes.** Filled faces, reflected light and darker recesses establish cubes; luminous outlines are secondary.
4. **Refine each artwork separately.** Shared material vocabulary and motion discipline unite the site, while content determines geometry and effect strength.
5. **Preserve the exact marks and approved motion.** Network is the explicit composition/timing exception. The Intelligence web remains removed; a new globe network does not authorize adding it back to the portrait.

The physical idea is still **organic growth through engineered structure**. On Home, structure is the lattice. On Network, structure is the deliberate geographic connection graph. Anatomy supplies the organic form on Intelligence, Culture and Partner.

## 2. What is already present and what still needs work

- The project uses Next.js/React with directly authored Three.js renderers. Installed runtime is `three@0.186.1`; installed declarations are `@types/three@0.183.1`. Reconcile declarations against the chosen runtime before adopting additional APIs.
- Home already has the exact mark, approved seven-cell layout, a 6.5s sequence, physical-material panes, geometric rims, a studio environment and a local scan. The latest local pass adds per-pane reflection bands, a longer scan and small floor accents. It is a useful intermediate result; the new face-role treatment supersedes the repeated-band/blur-based presentation as the completion target.
- Technology already has the central part plus machine, lot, evidence and telemetry cells. Manufacturing already has the bracket and a coating boundary. These require optical and narrative refinement, not replacement compositions.
- The portrait and hands already use sampled supplied geometry, normals, deterministic attributes and hidden depth surfaces. Replacing their preparation pipeline with a generic particle demo would discard useful work.
- Network currently mounts `EngineeredHero kind="network"`, displaying factories on glass plinths. Replace only its hero artwork with the globe. Preserve the lower owned-plants, partnership and governed-learning content.
- Existing frame capture, static posters, adaptive quality, preparation, visibility suspension and controls are reusable infrastructure.
- The project actually uses **Montserrat**, and no Montreal font files were found. Typography remains unchanged in this artwork pass. A Montreal switch requires the actual licensed font assets and a separate deliberate font integration.

Evidence includes current scene source, project design records, supplied references, saved hero captures, and the local Home review captures in `.audit-logs/home-polish/after`. The local example files were inspected as source studies; they were not all run as live demos during this planning pass. Browser/library documentation was researched separately.

## 3. References, skills and libraries: what fits

| Resource | Fit for Voltron | Decision |
|---|---|---|
| [CloudAI-X Three.js skills](https://github.com/cloudai-x/threejs-skills) | Lighting, PBR, shader lifecycle, animation, performance and asset preparation. Its maintained README targets r186, matching the installed runtime. | Use the specific technical guidance applicable to a task. Keep the existing WebGL architecture. |
| [UI Skills Three.js collection](https://www.ui-skills.com/skills/threejs) | An index of guidance, including CloudAI-X modules and landing-page direction. | Useful discovery source; it is not a rendering library or an additional runtime dependency. |
| [Skills Directory animation listing](https://www.skillsdirectory.com/skills/datit309-threejs-animation) | General clips, mixers, skeletal and morph animation concepts. | Prefer maintained upstream/r186 documentation over copying directory snippets. A directory grade does not establish compatibility or artwork quality. |
| [Scroll Craft](https://github.com/nateherkai/scroll-craft) and its [hero-depth guide](https://github.com/nateherkai/scroll-craft/blob/main/plugins/nateherk-design/skills/scroll-craft/references/hero-depth.md) | Background/focal/foreground planning, anchored contact, restrained choreography, separate mobile composition. | Borrow those design principles. The automatic intros retain their own clocks; page scrolling does not become a mandatory playback controller. |
| Existing frontend-design + frontend-design-premium | Brand specificity, existing design context, readable HTML, theme consistency, motion preferences, layout stability. | Continue using them as the project workflow. |
| Installed Impeccable | A bounded finishing review for hierarchy, spacing, controls, responsive composition and consistency. | Apply relevant planning/polish guidance. Its context launcher could not load because its engine/cache was unavailable; project context was read directly. No engine or plugin was installed. |
| [three-globe](https://github.com/vasturiano/three-globe) | A globe object that can be added to an existing Three.js scene. Provides geographical layers and arcs. | Preferred library candidate if a library is needed. Compare against a small direct Three.js sphere/arc implementation for this finite hero. |
| [Globe.GL](https://globe.gl/) | A convenient application-level wrapper around three-globe. | Use its examples as visual studies. A new wrapper renderer/control system is unnecessary for the existing hero lifecycle. |
| [Drei Vanilla transmission](https://github.com/pmndrs/drei-vanilla/blob/main/src/materials/MeshTransmissionMaterial.ts) | Potentially richer rough transmission without adopting React Three Fiber. | Prototype selectively on visible side/rear glass after face contrast is correct. Compatibility of its shader hooks must be tested with installed r186. |
| [Postprocessing](https://github.com/pmndrs/postprocessing) | Selective bloom and effect composition. The inspected main-branch package declares a Three.js peer range that includes r186.1. | Add only if local glow cannot meet the visual target. Preserve existing output conversion and avoid duplicate composers. |
| [Particle Skull](https://github.com/ektogamat/threejs-particle-skull) | Study of reading a loaded model as particles. | Reference only: its repository [licence](https://github.com/ektogamat/threejs-particle-skull/blob/main/LICENSE.md) is CC BY-NC-ND 4.0. Exclude direct code/model reuse for this commercial site without suitable permission. Keep our existing sampling pipeline. |
| [Codrops GPGPU tutorial](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/) | Position/velocity textures for stateful particle currents. | A later option if analytic waves are insufficient. A GPU simulation is not a prerequisite for broad, coherent formation. |

The inspected three-globe package declares MIT and a `three >=0.154` peer requirement; this makes it a candidate, not proof of complete compatibility. It also carries several dependencies. Measure the actual route chunk before choosing it over direct geometry. [Package manifest](https://github.com/vasturiano/three-globe/blob/master/package.json), [licence](https://github.com/vasturiano/three-globe/blob/master/LICENSE).

Drei Vanilla is MIT; postprocessing declares Zlib; Three.js examples are under the Three.js MIT licence. Preserve notices for any reused source and track separate rights for textures/models. No dependencies were added during this research. Choose a concrete version or commit before implementation rather than shipping an unpinned demo CDN URL.

## 4. Local examples: specific techniques to retain

| Local folder under `examples/` | What the source actually offers | Application / exclusions |
|---|---|---|
| `webgl-particle-sphere-and-orbits` | Distributed sphere points, per-point size/colour and glow falloff; imports Three.js r162. | Useful distribution study for globe surface dots. Reauthor against r186; remove orbit rings, perpetual breathing and ambient rotation. |
| `trails-in-spiral-threejs` | Shader-driven travel, wave modulation, particles along curves, bloom controls. | Borrow tapered signal timing for globe/Technology arcs. Replace spiral paths with designed routes. Its zero bloom threshold is unsuitable for the whole Voltron scene. |
| `vector-plankton-three-js` | Shape-to-shape flow and configurable wave strength/frequency. | Broad ribbon organization for portrait/hand formation; deterministic sampling and a finite envelope replace open-ended motion. |
| `hologram-effect-threejs` | Fresnel/silhouette contribution, density and a progress-driven reveal with glitch effects. | Small edge separation for particle anatomy or globe rim. Exclude glitches, horizontal scanner stripes and hologram branding. |
| `magic-plasma-sphere-three-js` | Layered noise and a Fresnel shell. | Very restrained globe limb or background shaping. Exclude the plasma-ball surface and noisy perpetual distortion. |
| `pixels-as-frequencies-threejs` | Video-luminance displacement on a plane. | Rhythm/height-field study only. It does not replace volumetric head/hand geometry. Exclude remote video, recording UI and media workflow. |
| `interactive-liquid-gradient-threejs` | A touch-history texture and flowing colour field. | Possible low-contrast atmospheric light during an intro; fixed quiet final frame. Exclude cursor-driven liquid treatment over the hero copy. |
| `chroma-glass-orbiter-multi-themes` | CSS frosted-card/prism styling and colour themes. | Palette/contrast study only; it is not optical 3D glass. |
| `neural-net-three-js-interactive-javascript-guide` | Network imagery/connection vocabulary. | Selected technical study only. Do not restore the removed face web or add arbitrary all-to-all connections. |
| `glowing-background-threejs`, `deep-sea-threejs-animation` | CSS-oriented atmosphere; the latter references css-doodle. | No core renderer adoption. |
| `animated-firework-diwali` | Celebration timing and particle bursts. | Relevant only to the established entry/holding experience. |

No licence/README files were found by the local examples licence-file search. Study and independently implement techniques; do not treat local presence as permission to copy bundled source or media.

## 5. Shared optical rules

Use the existing blue/cyan, ink and ice palette. Reserve near-white for selected reflections and active cores. An object's shape should remain readable when glow is disabled.

Separate four controls in the implementation:

- **Surface body:** face colour, opacity/transmission, thickness and attenuation.
- **Reflection:** environment orientation/intensity, roughness and light-card placement.
- **Structure:** bevels, rim width, junction geometry, near/far edge hierarchy.
- **Signal:** travelling core, local halo and nearby surface/ground response.

Do not use opacity as a substitute for transmission or increase every face together. Thin glass enclosures and low plinths need different optical presets. Sampled anatomy needs its own depth and shading rules.

Dark mode gets visible reflected areas across faces, a readable top plane and a darker side/recess. Reduce the relative dominance of white rails. Keep a range of blue surface values between the page ground and highlights. The final test is whether the cube still reads as a volume when its graphic outlines are hidden.

### Home face roles

The existing `top/side/front/rear/internal` labels are geometric categories. Introduce authored **visual roles** as an additional layer; the pane immediately behind the logo is identified by actual scene placement and projection, not merely by its name being `rear`.

| Role | Light theme | Dark theme | Purpose |
|---|---|---|---|
| Logo backing panes | Quiet pale ice, low spatial variation, modest reflection | Selectively lit ice-blue region, bounded by darker sides | Separate the exact blue/cyan logo strokes from busy geometry |
| Top/crown | Broad soft white reflection and clearer front edge | Cool illuminated reflection with visible surface body | Explain thickness and the downward camera |
| Near lateral faces | Medium blue absorption with one controlled reflection band | Rich slate/cobalt surface with a pale rim | Make the lattice dimensional |
| Rear lateral faces | Lower contrast, darker reflection card | Deeper blue recess, still distinguishable from background | Establish depth without foreground competition |
| Shared/internal faces | Minimal contribution | Minimal contribution | Prevent milky stacked rectangles |
| Floor-facing/base | Subtle absorption and contact reflection | Restrained blue spill and attached reflection | Explain where the structure rests |

Keep the exact logo colours and geometry. “Brightening” the mark means improving perceived separation, not bleaching the artwork or adding a heavy bloom. Calibrate against both dark blue and cyan portions of the actual mark. A flat pale rectangle or invisible screen-facing fog patch is not the goal: these remain the real cube faces.

Remove the logo mask's Gaussian passes and compositing dependency after checking the face-based replacement. Keep any unrelated required compositing/layer ordering intact. A static authored per-pane reflection accent may remain where useful, but avoid the same diagonal white stripe repeated identically on every face.

### Selective transmission experiment

First compare one cube/mark/metal calibration scene with the existing physical material and a selected vanilla transmission treatment. Start on a visible side or rear shell; keep the logo and interior subject undistorted. Test shared capture buffers where layer ordering permits, rather than adding an independent capture to every pane. Nested transparent/transmissive objects require explicit visibility/order checks; a shared buffer is not an automatic solution.

The [Drei documentation](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material) describes the additional render pass and controls for sample count/resolution. Profile this alternative and retain the simpler reflected-glass preset on lower tiers. Set chromatic and temporal distortion to zero unless a restrained static contribution demonstrably improves the reference match.

## 6. Network globe: completed scene specification

### Composition and material

The globe occupies the existing hero artwork column, with a quiet gap beside the heading. Use a fixed camera with a mild elevated view and a slightly tilted axis. Start and finish with India facing the viewer; this is a proposed focal choice consistent with the site's India-led premise.

Use a pearlescent ice/slate sphere, readable continents or continent-weighted points, a thin atmospheric limb, and a small set of raised cobalt/cyan arcs. Give the surface a broad reflection and shaded far hemisphere. Avoid a black space scene, a dense wire cage, photorealistic satellite-cloud imagery or latitude/longitude lines competing with the arcs.

The globe can express the lattice concept through its ordered nodes and repeated junction language. It does not need an enclosing cube or a ring of factories. Existing factory modules can remain available for lower-page plant illustrations.

Use an authored conceptual graph as the starting dataset: approximately 8–12 nodes and 10–16 arcs on desktop, with fewer minor arcs on mobile. These are tuning ranges, not claims about operating sites. Keep the existing **Future network vision** caption. Geographic locations remain illustrative until actual locations/relationships are supplied; no invented plant names, live traffic metrics or operational coverage claims.

### Proposed 10-second sequence

| Time | Globe | Connections | Visual result |
|---|---|---|---|
| 0–0.7s | Globe body/continents reveal at the chosen orientation | Main anchor appears | A real volume is legible immediately |
| 0.7–8.7s | One forward 360° rotation, with eased acceleration/deceleration | Routes build in a deliberate geographic order | The network expands as different regions become visible |
| 1.2–8.4s | Continues the same turn | Each arc has one travelling tip, a brief receiving-node response, then a persistent dim line | Connection formation has readable cause and effect |
| 8.7–9.6s | Holds exactly at its final orientation | Final highlighted routes complete; dynamic halos fade | The finished network becomes the focal still |
| 9.6–10s | Stationary | All completed lines remain; no travelling dashes or expanding rings | Stable completed artwork; frame requests cease |

A full turn ends at the same orientation at which it started. The visual change is the completed network. Do not add an unnoticed extra camera orbit to reach another final view.

Drive globe angle as an **unwrapped scalar** from `theta0` to `theta0 + 2π`. Interpolating only two equivalent endpoint quaternions can select no rotation. Use a time-derived function such as `theta = theta0 + 2π * smootherstep(clamp((t - .7) / 8))`; do not accumulate `rotation += speed` frame by frame. Parent continent geometry, nodes and arcs to the same rotating geography root so endpoints cannot slide across the sphere.

### Arc construction, depth and light

- Position endpoints from latitude/longitude. Use spherical interpolation for the surface route and a bounded raised altitude profile; an ordinary straight chord can pass through the globe.
- Keep endpoint radius and seam behavior consistent. Handle nearly coincident/antipodal endpoint cases or exclude them from the authored graph.
- Give each arc one crisp core and a wider low-opacity halo. Reveal by normalized path distance, with a tapered travelling tip. Completion leaves a full continuous line rather than a frozen fragment of marching dashes.
- Occlude rear nodes and arcs with the globe body. Visible above-limb portions can remain; fully hidden routes should not draw through the sphere. Do not globally disable depth testing to make every connection visible.
- The node core, halo, small globe-surface light response and optional nearby rim response share the same local event envelope. Bloom alone does not illuminate the surface.
- Keep the final node glow static and modest. Remove atmospheric time noise and pulse timers at completion as well as stopping globe rotation.

### Implementation choice

First prototype the composed globe with **direct Three.js geometry**: one sphere, local continent data/mask, batched points and a few designed arc geometries. This is well suited to the small finite graph and existing timeline.

Use **three-globe** if its geographic layers save enough complexity or future content needs justify it. It can be added to an existing scene; Globe.GL wraps it with a broader visualization component. The [official arc example](https://github.com/vasturiano/three-globe/blob/master/example/links/index.html) uses random routes and ongoing animated dashes, which should be replaced with Voltron's authored graph and finite sequence.

If adopting three-globe: disable its built-in entrance; avoid independent layer transitions/dash clocks; set transitions explicitly; use the existing master timeline and call `pauseAnimation()` after settlement or while hidden. Verify that background tickers actually stop. Its [render options](https://github.com/vasturiano/three-globe#render-options) expose pause/resume, but seek/replay determinism must still be established in our integration.

### Files and integration

Plan a dedicated `NetworkGlobeHero.tsx`, `network-globe-renderer.ts` and `network-globe-timeline.ts`, with locally owned geographic data and a small graph module. Reuse scene handoff, quality policy, controls, theme observer and poster generation. Switch `app/network/page.tsx` to the dedicated artwork and update its accessible description. Remove Network-specific logic from the engineered family only after the new route passes verification; preserve shared code used by other pages.

Mobile retains the full sphere and its axis, with fewer minor routes, smaller halos and reduced sphere/arc detail. The final frame stays the same story. Reduced motion/Save-Data/WebGL failure use a completed static globe with all meaningful connections; they do not rotate it.

## 7. Page-by-page completion plan

| Page | Completed artwork and precise change | Sequence to retain/complete | Done when |
|---|---|---|---|
| **Home** | Exact seven-cell lattice and mark. Introduce face roles, richer dark-mode surfaces, clear logo backing, bounded reflective rims and base contact. Remove logo-backdrop blur. | Keep 6.5s assembly/reveal; retain the strengthened post-assembly scan and coordinate local face/node/ground response. | All seven cells read as volumes; logo stays clear in both themes at desktop/mobile size; no busy stripe crosses its focal region; final scan strength is zero. |
| **Technology** | Keep central part, machine, lot, evidence and telemetry. Apply clearer front glazing, substantial side/top reflections, richer machined metal, and coherent luminous routes. | Keep 7.5s. Physical contexts reveal, routes complete, one final response, still. | Main component remains dominant; no route clips through an opaque object; records and bores stay legible; glass reads without outlines. |
| **Intelligence** | Preserve approved head, corrected anatomy, camera and absent web. Refine normal lighting, feature-weighted density, rear attenuation and selective cube face reflection. | Keep 7.5s formation. Two/three broad spatial ribbons converge; reduce displacement and velocity before final anatomy settles. | Brow/nose/mouth/jaw read at actual size; rear points do not fill sockets; no large bright grains erase landmarks; enclosure remains secondary. |
| **Manufacturing** | Keep the bracket and genuine bores/bevels. Make treated/exposed metal distinct; concentrate fine particles and highlight at the surface boundary; improve grounded or intentionally floating shadow logic. | Keep 6.2s treatment. Surface colour, roughness and particles share the same local boundary. | The viewer reads a changing surface, not dust passing near a part; polished bore and top regions remain readable. |
| **Network** | Replace factory-plinth hero with the custom-styled dimensional globe and geographic connection graph. Keep plant/partnership sections below. | New proposed 10s: one complete turn plus finished persistent connections, then complete stillness. | Rotation is exactly 2π, all authored arcs complete, endpoints stay attached, rear routes occlude, final frame is attractive in both themes. |
| **Ontology** | Keep the existing part/lot/record composition. Use quieter Technology-family glass, fewer competing highlights and clear relationship hierarchy. | Keep 6s: stable identity, record contexts, one relationship trace, still. | It explains shared context rather than repeating Technology's full equipment composition; records remain distinct. |
| **About** | Retain production, knowledge and intelligence structures around a common foundation. Refine filled volumes, depth separation and shared light direction. | Keep 6s: alignment and a restrained common-foundation response. | Recognizable as the same brand, simpler than Home, with no unsupported physical/business claims. |
| **People & Culture** | Preserve palm-down pinch, approved hand geometry and .36 individual/.7 core/2.1 enclosure proportions shared with Philosophy. Improve finger separation, contact shadows and cube face contrast. | Keep 8.5s and vertical transfer. Coordinate release, movement and withdrawal; repair the existing release-timing/test disagreement during this artwork's pass. | Cube visibly stays between thumb/index until release; the same cube travels into the core; no anatomical bright knot, curved shortcut or hidden handoff. |
| **Partner** | Preserve the two prepared particle hands. Refine per-hand lighting, contact recesses, wrist fade and near/far separation; validate the solid contact pose first. | Keep 7.5s: formation, approach, closure, one contact response, still. | It reads immediately as two hands in a handshake; fingers are neither intersecting visibly nor merged by glow. |
| **Voltron Commons** | Preserve exact leaf/circuit artwork and low lattice. Improve relief/reflection integration, surrounding volume and quiet ground contact. | Preserve the existing finite 4.2s sequence unless an actual defect requires retiming. | Emblem and foundation belong to the same lighting world, with no pasted-card appearance or repeated idle pulse. |

### Home lower-page scenes and other artwork

- **Component → three capabilities:** preserve approved part/assets and six-second narrative. Carry the updated optical family into the smaller enclosures with the existing rear-glow/front-normal rule. Keep particle identity through separation and let interiors remain readable.
- **Lot journey:** retain chronology, evidence/human-release semantics and current timing. Apply glass roles through its shared capability style; keep the conveyor axes and selected-state readability. Do not introduce global bloom or change the release story for aesthetics.
- **Home Alpha overview and Manufacturing guided Alpha:** retain approved geometry, supported pickup/unloading, route and durations. Refine metal/glass/liquid highlights, annotations and camera transitions. Borrow Scroll Craft's contact/foreground/subject separation; do not make scrolling issue machine actions or replace the guided timeline.
- **Philosophy:** retain shared proportions and vertical curve used by Culture. Make outer enclosure, solid core and individual cube materially distinct; let one light response establish successful alignment.
- **Unfulfilled secondary BrandArt slots:** inventory each route before calling it complete. Preserve factual content. Replace a missing illustration with a useful authored conceptual drawing using approved objects, or retain a clearly documented pending slot outside the completed scope. Do not label a blank reserved artwork as visually complete.
- **Entry/Coming soon:** retain its separately approved branding, flip sequence and finite celebration. No globe, industrial network or anatomy styling is propagated there.

## 8. UI polish that belongs in this design

Use understated controls around substantial art: the existing modest headings, airy copy column, fine separators and compact three-principle strip. Keep the header, theme control and calls to action in their present hierarchy.

Relevant finishing tasks:

1. Standardize artwork control placement, button shape, icon size, focus style, accessible names and Pause/Resume/Replay states. Retain at least 44px targets. A hidden development slider must not alter production hero framing.
2. Keep a text/art safety gutter. The globe limb and elevated arcs need their own bounds; fitting only the sphere can clip connections.
3. Give desktop and mobile explicit projected framing rather than shrinking everything uniformly. Mobile should preserve the subject's silhouette and exact logo readability.
4. Keep atmospheric gradients behind the artwork and away from copy. Dark theme gets readable filled volumes without washing out the page.
5. Apply short arrow/underline/focus feedback consistently to existing actions. Avoid introducing glow-filled UI buttons or animated borders because the artwork uses light.
6. Preserve stable hero height during loading. Show matched renderer-derived posters, switch only after shaders/assets/first frame are ready, and keep controls from jumping.
7. Keep explanatory labels as HTML. Do not attach city labels, counters or rotating typography to the globe unless they communicate verified content.

## 9. Development controls and quality tiers

Expose a **development-only** artwork inspector through the existing review-query pattern, with current scene time as its sole playback clock. Use named profiles, reset-to-authored defaults, and explicit light/dark settings. Do not ship a debug GUI over the public artwork.

| Inspector group | Parameters |
|---|---|
| Glass | Face role, opacity/transmission, roughness, thickness/attenuation, reflection intensity, outline visibility |
| Lighting | Key direction/intensity, fill, environment orientation, dark-card contribution |
| Signals | Core width, halo radius/strength, local face/ground response, event timing |
| Particles | Fine/medium/accent distribution, rear visibility, feature contrast, displacement envelope |
| Waves | Broad amplitude/wavelength/speed, ribbon depth/phase, convergence and settling |
| Globe | Orientation, fixed tilt, full-turn progress, arc reveal/tip phase, graph visibility and rear-occlusion diagnostic |
| Lifecycle | Pause/seek/replay, settled flag, frame count, active quality tier |

Full quality can test a selected transmission surface and local bloom. Balanced uses reflection-driven glazing and geometric/shader halos. Lightweight reduces point/arc detail and expensive optical effects, retaining visible surfaces and the same final story. Static uses the completed render. Do not let a lower tier silently remove the globe's connections or the logo's contrast backing.

## 10. One-artwork-at-a-time implementation order

1. **Finish Home's corrected face treatment.** Compare light/dark, remove blur, verify the same mark and geometry, then capture matched posters. The first local Home optical pass is provisional against this newer direction.
2. **Implement Network globe.** Establish an attractive final still first, then the single-turn/arc sequence; choose direct Three.js versus three-globe after inspecting the actual integration cost.
3. **Refine Technology.** Reuse the accepted optical vocabulary and connection treatment at its own scale.
4. **Refine Intelligence.** Improve anatomy lighting, depth and broad formation waves using the current sample assets.
5. **Refine Manufacturing and Alpha.** Complete treatment-boundary lighting and the plant material/camera polish.
6. **Refine Culture and Partner individually.** Resolve physical contact/occlusion before particle glow.
7. **Finish Ontology, About, Commons and Home secondary cubes.** Reuse reviewed presets with scene-specific strength; resolve missing secondary art explicitly.
8. **One shared consistency check** for controls, artwork framing, static states and page/scene loading after individual artwork passes.

For each artwork, use one batched desktop/mobile/theme visual review, one correction batch and one confirmation review. Change the next artwork after the current one has a reviewable completed frame, meaningful finite sequence and matching fallback. Do not repeatedly rebuild unrelated scenes while adjusting a local shader.

## 11. Acceptance and evidence

For each changed artwork capture opening, a meaningful intermediate frame, peak signal and completion at 1440px desktop and 390px mobile in both themes; add tablet/360px checks for clipping and layout. Review normal-speed playback as well as frozen frames.

**Home-specific gates:** exact seven-cell coordinates and original mark; no local logo Gaussian blur; contrast comes from the real panes; cubes remain readable with edge lines disabled; identical interpretation in light/dark; scan and local spill end by 6.5s.

**Globe-specific gates:** monotonic rotation reaches exactly one revolution; no shortest-path/no-turn quaternion mistake; all arc reveals reach 1; complete lines persist; endpoints rotate with geography; back hemisphere remains occluded; all time-varying uniforms and independent library tickers stop. Replay and seeking reproduce the same result at the same time.

**Every scene:** Pause/Resume, replay, hidden/offscreen pause, resize/theme without restart, route interruption/history, loading delay, asset failure, WebGL failure, reduced motion and Save-Data. Retain visible focus, readable copy and stable geometry.

Run focused timeline/material/lifecycle tests, TypeScript and an isolated production build, then the relevant browser and poster-continuity checks. Preserve existing limits of 200KB per configured poster and 180KB gzip initial route JS; report lazy scene chunk size separately. Measure frame time/draw calls on representative hardware before enabling extra transmission/reflection/bloom passes by default. Software-WebGL tests do not establish real-device frame rates.

### Current implementation checkpoint

Before this revised planning request, the local Home optical pass had passed 15 focused tests, production compilation and light/dark desktop/mobile browser checks. All four updated opening/completed Home posters were captured successfully (approximately 14–137KB each). The subsequent rebuild consuming those new manifests and final production poster-parity verification have **not** been completed in this planning pass. Existing workspace hand-timeline tests also expose an unrelated Culture release expectation mismatch; that belongs in Culture's pass. No deployment occurred.

This document records the revised target. It does not claim that the globe, blur removal, dark-mode face-role revision or full page-by-page completion has already been implemented.
