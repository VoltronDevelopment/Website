# Voltron hero artwork quality upgrade

25 October 2026. Original audit and improvement plan, followed by implementation progress.

## First implementation pass

Implemented the studio environment, finite rectangular softboxes, opt-in glass material preset, batched geometric edge rails, faded geometric floor reflections and soft object shadows. Home establishes the first shared material pass. The preset is explicit so lower-page scenes and hand/Commons artwork do not inherit unreviewed opacity changes.

Technology has a larger central part and a more detailed machine with bed, enclosure, spindle and controls. Network now uses low glass plinths, stronger foreground scale, pitched roof bays, facade frames and a coherent ground plane. Manufacturing has a shaped mounting base and polished bore/top regions, with coating colour and roughness sharing the same boundary. Intelligence has increased scale, independent head rotation, stronger point coverage and revised directional shading; crown correction and web removal are preserved.

Two focused tests cover reflected transforms, moving/hidden ancestors, theme colour continuity and source resource ownership. Browser verification and matching poster captures accompany the delivery. These changes are an initial material/composition pass; final photorealistic glass, architectural assets, anatomical hand poses, richer particle feature masks and the later choreography batches remain open. Do not mark all six batches complete.

## Evidence and diagnosis

Compared the supplied Home, Technology, Network, Manufacturing and Intelligence mockups with the latest saved production captures in `.audit-logs/hero-family`, including Home, Technology in both themes, Manufacturing, Network, Intelligence, Culture, Partner and Commons. Inspected scene/material source, public asset inventory and local example code. These are saved captures from the preceding verification run, not a fresh live-browser audit. Review sliders visible in some captures are development controls, not intended production UI.

The functioning animation framework is useful, but visual completion was overstated. The scenes are currently concept models. The mockups depend on photographic lighting, substantial objects, carefully staged depth and grounded surfaces. Adding more moving dots will not close that gap.

| Area | Current evidence | Required change |
| --- | --- | --- |
| Composition | Art is contained and often small; factories and hands have weak silhouette hierarchy | Enlarge primary subjects, author foreground/midground/background, frame by projected bounds |
| Glass | Thin blue lines and nearly uniform transparent planes | Beveled edges, visible thickness, shaped reflections, clear fronts and darker lateral surfaces |
| Lighting | Generic room environment and strong fill flatten objects | Designed studio environment with broad key, dark reflection cards and controlled rim |
| Ground | Broad radial shadow blob; objects appear suspended | Object-specific contact, soft reflection and consistent floor height |
| Geometry | Simple extrusions, block factories, deformed duplicate grips | Better silhouettes, transitions, real industrial detail and anatomically authored hand contact |
| Particles | Similar fine dots across surfaces; light-theme subjects look faint | Feature-weighted sampling, surface occlusion, directional shading and restrained highlight hierarchy |
| Motion | Functional reveals, but limited cause and effect | Connected formation, contact, release, transfer and response phases |

Keep existing copy/layout direction, exact brand mark, modest typography, finite playback, accessibility and lifecycle protections. Keep the Intelligence web removed. Retain the accepted gentle downward cube view; adjust head pose separately from camera.

## What the examples actually contribute

The examples are in root `examples/`, not a `public/examples` directory. `public/3D face` and `public/3D hand` contain the relevant source assets.

| Local reference | Useful technique | Application and limits |
| --- | --- | --- |
| pixels-as-frequencies-threejs | Video luminance drives stepped/smooth normal displacement on a 400-by-400 plane | Borrow layered wave rhythm and controlled displacement for face/hand formation. It is a textured relief, not a volumetric face particle system; retain sampled 3D geometry |
| hologram-effect-threejs | View-dependent Fresnel contribution and surface density | Subtle silhouette separation on head and hands. Omit glitch distortion and continuous hologram stripes |
| vector-plankton-three-js | Parameterized waves and directional motion | Structured incoming particle streams. Replace per-frame random jitter with seeded, time-based motion for reproducible replay |
| trails-in-spiral-threejs | Shader-driven trail length, taper and intensity | Short travel pulses on Technology/Network connections. Reauthor paths; omit spirals and broad bloom |
| interactive-liquid-gradient-threejs | Smooth spatial color-field variation | Very low-contrast background atmosphere only; settle after entrance and keep text area quiet |
| magic-plasma-sphere-three-js | Multi-frequency shader noise and layered surfaces | A small bounded modulation of formation flow; do not import the plasma sphere visual |
| webgl-particle-sphere-and-orbits | Point sprites and depth-dependent intensity | Particle depth separation; omit orbit rings |
| chroma-glass-orbiter-multi-themes | CSS color and backdrop treatment | Palette reference only; it contains a CSS prism/card, not a reusable Three.js glass renderer |
| glowing-background / deep-sea | CSS-oriented treatments; deep-sea script references css-doodle | No core 3D implementation reuse |
| fireworks / neural-net | Secondary effects and network concepts | Not part of this refinement direction; no face web or celebratory particle bursts |

Review provenance and licenses before copying external demo source. Prefer small independently implemented techniques over importing demo GUIs, recording tools, remote videos or extra render loops.

External reference: [CloudAI-X Three.js animation guidance](https://github.com/CloudAI-X/threejs-skills/blob/main/skills/threejs-animation/SKILL.md). Its clip/mixer/action structure, quaternion tracks, skeletal posing and morph targets can support authored hand motion. Use a single master timeline to coordinate clips with particle uniforms and transfer events. Do not introduce a second independently advancing clock. The guide targets r186; package.json declares Three.js ^0.186.1, while @types/three is ^0.183.1, so reconcile declarations when implementing newer APIs. A WebGPU migration is not required for this artwork upgrade.

## Shared rendering foundation

### Composition and camera

Create explicit camera presets per scene rather than one universal isometric angle. Start with the current copy/art split and increase the occupied artwork bounds approximately 15–25% where space permits; judge actual projected bounds rather than applying one global scale. Preserve a quiet gutter beside text. Technology needs a dominant central cell, Network a near factory much larger than rear sites, and Intelligence a head occupying roughly 70–80% of the cube's projected interior height as an initial tuning target.

Home and Technology can retain near-orthographic product framing. Network should test a long-lens perspective camera to establish distance. Manufacturing needs a three-quarter product view exposing the bore, mounting holes and thickness. Intelligence retains its gentle downward camera; its face turns independently into a clear three-quarter silhouette. Lock cameras after comparison captures. Mobile gets its own framing and reduced secondary detail, not a cropped desktop camera.

### Glass and edges

Build a calibration scene with one cube, the exact logo, a metal part and a floor. Compare current transparent-pane construction against a thin, beveled, physically shaded shell. Use transmission selectively on a small number of visible shells; multiple nested transparent/transmissive surfaces need explicit ordering and artifact checks. A reflection-driven lightweight material remains the lower-quality tier.

Model edge bevels and modest glass thickness so highlights have a surface to occupy. Use a clear front, restrained blue absorption on side/rear faces, a broad white top reflection and navy reflection bands. Remove uniform glowing outlines as the main source of shape. Keep selected blue edges and small junction highlights. Internal faces must not stack into milky rectangles. Never increase all opacity values together to simulate richer glass.

### Light and ground

Replace the generic environment with an art-directed studio environment: broad overhead/side softbox, narrow rim, dark opposing card, and low fill. Build reflection structure into the environment; direct lights alone do not produce the mockups' rich metal and glass reflections. Tune separate light/dark presets with consistent material identity.

Add a real ground receiver and object-specific contact shadow. Use a low-resolution reflected scene or authored reflection approximation, selected after profiling; fade reflection with distance and roughness. Cache settled shadow/reflection passes. A restrained caustic-like floor accent can be authored, but should not be represented as a physical simulation. Keep bloom local and optional; the scene must work with bloom disabled.

### Particle sculpture

Keep one deterministic particle identity from initial field to final sampled surface. Use surface targets, normals, region masks and seeded variation. Blend a coherent traveling field into target positions with per-particle arrival offsets; reduce displacement amplitude before final settlement. Avoid independent random flickering or new random positions on replay.

Separate dense small surface particles, a much smaller highlight population, and sparse formation particles. Preserve nose, lips, eyelids, fingers and knuckles through feature-aware sampling and lighting. Use the same transformed geometry for depth occlusion and particle targets. Light theme uses navy body shading with selected blue highlights; dark theme uses cool silver body shading with sparse bright peaks. Increasing particle count is considered only after density distribution and point coverage are corrected.

## Per-hero implementation specifications

### Home: establish the material benchmark

Keep seven-cell topology and exact logo. Give foreground cells stronger edge/reflection definition and rear cells lower contrast. Make the open upper cell unmistakable and keep the logo inside that space. Ground the lower cubes with distinct contact and soft reflected shapes. Finish all of this at the final frame before touching choreography.

Suggested 6.5-second sequence: restrained field arrival; lower support cells resolve; upper cells align; individual cube settles; logo resolves; highlights settle. Motion should decelerate cleanly, without continuous floating or a rubbery bounce.

### Intelligence: substantial, readable human sculpture

Increase head occupancy and make its three-quarter profile readable. Validate crown, brow, eye, nose, mouth and chin proportions together; do not continue compressing the forehead blindly. Preserve recent upper-cranium correction unless comparison reveals a specific anatomical issue. Restore a deliberate lower-neck transition instead of a floating face mask. Rebalance particle density at facial landmarks and strengthen lit cheek/nose planes without filling eye sockets with glow.

Suggested 7–8-second sequence: broad coherent frequency field; recognizable silhouette; features settle; final facial shading resolves; restrained cube light response. No surrounding mesh/web. Do not revive a visible scan effect without a new design reason; prior user direction and current face-first hierarchy take precedence.

### Technology: connected product scene

Enlarge the central component and its cell; subordinate the four supporting cells. Replace equipment blockwork with a recognizable enclosure, spindle/work area, control panel and base. Give the production lot real bores/bevels and varied specular response. Improve evidence and telemetry panels with crisp vector details appropriate to their small display size.

Use visible, physically routed connection segments with elbows and real attachment endpoints. Reveal each completed route before its short pulse reaches the destination. Formation flow should feed the system from rear-left, avoiding text. Add local ground reflections below the low cells. The final frame must communicate hierarchy without needing motion.

### Manufacturing: premium engineered object

Rework the bracket into a broad sculpted base with blended load-bearing transitions and correct bores, rather than a flat upright extruded onto a slab. Add edge bevels, subtle machining direction and different roughness for bore, outer surface and coated region. Avoid uniform navy paint obscuring the metal structure.

Drive coating boundary, surface particles and trailing response from the same component-local field. Particles travel close to the surface, gather at the treatment front, then dissipate. The finished area changes roughness/specular response as well as color. Keep the full part grounded; preserve the separate 13-tank process experience below the hero.

### Network: architectural scene with real depth

Replace full cages around every factory with low glass plinths as shown in the reference. Create one substantially larger foreground factory and smaller rear sites on a coherent ground plane. Add believable roof structure, facade depth, framed glazing, restrained interior lighting, doors and minimal landscape detail. These are illustrative future facilities, not depictions of verified operating sites.

Ground-plane routes connect plinth ports. A pulse reaches a future site before it forms; one site can remain partially unresolved. Keep the future-network caption. Sparse empty cages should not dominate the completed composition.

### People Culture: support, release, integration

Latest user correction: use the earlier downward pinching-hand reference, with the small cube between thumb and index. Match the actual homepage Philosophy cube rig, materials, viewing orientation and timing; use its corresponding return movement into the core. The exact corrective specification is in `hand-artwork-correction-plan.md` and supersedes the former palm-up support direction and independently authored transfer curve. During hold, constrain the cube to finger contact anchors; at release, preserve its world transform so there is no jump.

Sequence: the downward hand forms; the held cube becomes legible between fingertips; the outer cube and inner core reveal with Philosophy's original relative timing; fingertips release as the cube starts descending; the wrist withdraws; the cube enters the core and settles. Use the original vertical transfer curve in reverse. Preserve the existing translucent outer framework without introducing a moving lid or an abrupt top-face visibility change.

### Partner: fix anatomy before particles

The current duplicated/deformed grasp asset is not a convincing handshake. Create or obtain a paired contact pose with compatible wrists, interlocked fingers, thumb placement and no major penetrations. Validate a solid clay render from the final camera first. Existing source geometry can be a sculpting starting point, but shader changes cannot supply missing anatomy.

If articulated motion is required, use an authored rig/clip. Particle targets must follow that deformation: either skin sampled points using stored weights or bake corresponding particle poses from fixed triangle/barycentric samples. Do not leave particles on a static surface while only moving an invisible rig.

Suggested 7–8-second sequence: separate forearms form; hands approach; contact settles; a small local shared response occurs; the handshake holds. Different key/rim responses distinguish the two hands. No repetitive pumping or bright contact blob hiding the fingers. Final paired geometry is a genuine dependency for visual sign-off.

### Ontology, About and Commons

Ontology: a compact, legible relation scene using the improved part, lot and evidence assets; fewer competing connectors and stronger central-object hierarchy.

About: three purposeful modules on one grounded foundation; clear identity per module and restrained sequential alignment. Apply the established glass/metal library rather than inventing another effect family.

Commons: the current leaf/circuit subject is an image plane. Either retain it honestly as a clean emblem on a dimensional glass foundation, or build actual leaf thickness, veins and circuit branches for a true sculpture. Keep exact brand geometry when using the logo; separate any interpretive organic artwork from the official mark. Give growth/reveal a finite direction from root to branches.

## Engineering work packages

1. Separate scene construction, asset loading, material presets and playback from the large engineered renderer. Keep current scene lifecycle API intact.
2. Add reusable studio lighting, glass, metal, ground-contact and bounded reflection helpers. Store camera/theme presets explicitly. Validate one scene before applying shared material changes to every route.
3. Add an asset adapter with named anchors, canonical scale/orientation, bounds, material slots and optional clips. Build reproducible offline preparation for source meshes; runtime must not parse the full source OBJs.
4. Consolidate particle feature masks, depth handling and quality tiers across face/hand surfaces. Keep geometry preparation versioned so binary assets and posters cannot silently disagree.
5. Preserve deterministic seek, replay, reduced-motion final state, cancellation, disposal and offscreen suspension. Adopt AnimationMixer only where authored clips justify it, evaluated from the master scene time.
6. Regenerate posters only after artwork revisions settle, using exactly the production camera, light, theme and final pose.

## Delivery order and acceptance gates

| Batch | Deliverable | Pass condition |
| --- | --- | --- |
| 1 | Home material/lighting/ground benchmark, paired-hand clay-pose investigation | Glass reads as volume with bloom off; hand anatomy feasibility established early |
| 2 | Intelligence composition and particle benchmark | Face reads at hero size in both themes; natural proportions, strong profile, no web |
| 3 | Technology and Manufacturing | Clear hierarchy, detailed component silhouettes, coherent material/ground response |
| 4 | Network, Ontology and About | Architectural depth and consistent visual family; routes connect real endpoints |
| 5 | Culture, Partner and Commons | Palm support, continuous transfer and believable handshake; deliberate final stills |
| 6 | Motion polish and production verification across all scenes | Cause/effect sequence, stable replay, responsive framing and matching fallbacks |

Capture final stills and formation/contact/transfer keyframes side by side with references. Review at 1440 and 1920 desktop widths, tablet and 390px mobile, in both themes. Assess silhouette in grayscale; inspect transparent overlap, facial landmarks, hand contact, floor contact and crop at normal viewing size. Score composition, geometry, material, lighting, motion and coherence independently; a technical pass is not an aesthetic pass.

Target 60fps on a representative desktop and at least 30fps during formation on a representative midrange phone; these are targets pending device measurements. Start with existing particle counts and DPR cap. Reduce reflection resolution, secondary particles and transmission complexity before sacrificing hero silhouette. Stop continuous rendering on settlement. Preserve current initial-JS and poster budgets, and introduce a measured per-scene lazy asset budget before accepting final GLBs. Test context loss, asset failure, reduced motion, keyboard controls, theme switching, route interruption and replay after final changes.

This plan deliberately separates improvements achievable with current geometry (framing, light, glass, depth, particle shading and choreography) from final asset dependencies (paired handshake, detailed equipment/factory geometry and refined bracket transitions). The next implementation should deliver visibly better benchmark frames before spreading changes across every hero.
