# Voltron hero art direction and implementation plan

Date: 25 October 2026
Status: implemented with procedural mechanical stand-ins; final model installation remains an asset task. See `hero-asset-contract.md` for current seams and limitations. Latest correction: the portrait web is removed. Dataset version 2 smoothly shortens the upper cranium above the brow while preserving facial landmarks and the approved cube angle. Original planning record follows. The four supplied images are visual references, not evidence of current deployed output. This plan covers ten primary content heroes. Entry/coming-soon remain separate experiences.

## Evidence and current gaps

Reviewed route components, scene timelines, renderer/presentation integration, supplied 3D assets, current Home/Technology completed posters, and rendered Culture/Partner solid and particle frames. The latest production build and eight focused hand/handoff tests pass. A browser run completed sequence, control, scrub, mobile and reduced-motion steps but reported an unresolved resource 404; a console-clean release check remains required.

- Home: a seven-cube live assembly exists, but its current pale flat faces lack the reference's glass depth, bevel highlights and deliberate negative space. The homepage markup has no direct hero action row. Its five-word principles row differs from the reference's three themes.
- Technology: its existing live scene is another seven-cube/core/mark composition. The reference is a new five-context scene around a physical component, not a material-only refinement of that composition.
- Manufacturing: the hero currently uses an Alpha plant poster. The reference foregrounds a metal part with a surface-treatment wave. Keep the treatment-line experience below the hero.
- Network: the route requests N01 artwork, but the asset folder contains a manifest and README without the corresponding artwork. BrandArt renders an empty reserved slot when files are absent. A dedicated factory-network hero is needed.
- About and Ontology: the A01/O01 artwork families likewise have manifests without fulfilled hero files. Verify and replace these visible gaps.
- Intelligence: a true sampled head, occlusion surface, finite wave sequence and web-free cube exist. Improve anatomical light hierarchy and preserve the user's latest gently downward camera direction. Do not reintroduce the removed web without a new request.
- Culture: the complete hand/cube sequence is implemented. The palm and small cube need stronger visual contact; the present relationship can read as a cube hovering above the thumb. The transfer should be more continuous at normal viewing size.
- Partner: the solid pair is recognisable as a grip; the particle version loses the separation between the hands. Its offline continuous curl and rigid approach are not a fully rigged finger-closing animation.
- Commons: its leaf/circuit artwork and low lattice sequence exist. Its billboard-like asset needs stronger material integration if the main heroes become more dimensional.
- Available authoring geometry: one face OBJ/FBX and one hand OBJ/ZBrush source. No prepared factory, CNC machine, treatment bracket or complete handshake rig was found. Existing component/factory imagery can inform modelling but cannot substitute for true rotating geometry.

## Shared hero system

### Composition

Use a common shell/header/content grid, a protected copy zone, a dominant artwork zone and a compact principles strip. Starting desktop proportions: copy 40-44%, artwork 56-60%. Keep the current brand type family and regular headline character; standardise heading measures, action spacing and vertical alignment before changing copy. Review approved line breaks at 1440x900 and 1600x1000.

Main scene height should usually fall around 600-680px at a 1440px desktop viewport, with an 88-104px principles strip where it adds meaning. Culture can use a taller artwork area to preserve hand-to-core continuity. Short screens scroll naturally. Artwork does not sit in another visible card.

Keep copy/actions/icons/controls outside WebGL. All controls have at least 44px targets. Use one bottom-right scene-control position: Pause/Resume during playback, Replay when settled. Controls must not overlap the principles divider.

### Camera and framing

Approve each camera with neutral solid geometry and projected reference overlays. Record the matrix, target, object transforms, projected bounds and responsive fit. Architectural cube scenes start from the latest accepted gentle downward view; human sculptures receive an optically compatible camera suited to anatomy. A single numerical angle is not an approval criterion. Match visible top/side proportions, silhouette and ground contact.

Keep cameras fixed during introductions. Give subject placement independent transforms so pose corrections cannot silently change the cube or floor. Compare the same viewport and animation time. Avoid camera changes during the material pass.

### Materials and illumination

Create one shared material family: almost-clear front glass, subtle blue side/rear glazing, restrained edge bevels/highlights, navy cores, brushed silver metal and blue-grey particles. Give objects shape through coherent reflection and shadow, not uniform outlines or global glow.

Use shared key/fill/environment presets, localized background light and a darker copy zone. Reserve near-white values for selected contours. Use a soft contact shadow/reflection appropriate to each object; align it to the actual projected base. Dark theme is separately tuned, retaining anatomy and glass clarity without turning the scene into neon line art.

### Motion and continuity

One narrative per hero, usually 6-8 seconds, ending in a deliberate still. Introduction order must communicate meaning. Maintain deterministic particle paths and fixed link topology. Stop frame requests after settling; repaint for resize, theme change and explicit interaction.

Reuse ScenePoster and createSceneHandoff. Capture opening and completed poses from the production renderer with the same camera, materials and transforms. Keep the animation clock held until the handoff completes. Use content-hashed assets and camera-fit metadata for responsive poster/live parity. Reduced motion, Save-Data and no-JavaScript use completed compositions.

## Per-page direction

### 1. Home — the brand structure

Preserve the modular cube assembly and exact brand mark. Rework proportions so the seven modules read as individual glass volumes with intentional negative space rather than a nearly opaque block. Give front, rear and shared edges a clear hierarchy. Integrate the mark at a deliberate focal plane, with floor contact and restrained reflection.

Sequence: faint foundation, grouped cube arrivals, completion of the central opening, mark reveal, one structural light response, still. Compress idle portions of the current 11-second sequence toward 7-8 seconds after preserving its meaning.

Add a functional hero action row using confirmed destinations. The reference's proposed three principles are Human ingenuity / Connected intelligence / Shared progress; final wording belongs in the editorial pass.

Acceptance: silhouette works without animation; individual modules remain legible; exact logo proportions are protected; actions appear in the initial viewport; no perpetual floor pulse.

### 2. Technology — manufacturing connected by context

Replace the duplicate brand cube cluster with a physical part in a central glass enclosure and four supporting contexts: machine/execution, inspection evidence, batch/product identity and signals. Prepare actual renderable assets, with simplified geometry for peripheral subjects. Keep the component as the largest and clearest object.

Use stable port anchors and short orthogonal blue connections. A few small packets can approach from the rear-left during introduction. Connections represent context/identity; content remains bounded within its own enclosure.

Sequence: central part establishes, context enclosures appear in two groups, their content resolves, links trace once, one central acknowledgement, still. Target 7-8 seconds.

Home/Technology currently share a persistent seven-cube renderer and morph. The new scene needs a transition contract: retain the shared renderer/resources where useful, freeze outgoing composition, transition scene roots with one bounded handoff and begin the incoming opening pose. Do not reuse hardcoded seven-to-seven transforms for a five-context scene.

Acceptance: recognisably different from Home; physical part remains focal; all four contexts are identifiable; port connections remain attached at every size; text is readable without needing to inspect tiny canvas labels.

### 3. Manufacturing — the surface and the part

Replace the plant hero poster with a representative metal component, while retaining the detailed Alpha line below. Prepare a suitable CAD/modelled bracket with believable bores, thickness, edge radii and machined features. No matching 3D part is currently available in public assets.

Establish a finished metal still first: silhouette, brushed highlights, dark bore interiors and contact shadow. Animate a broad diagonal particle/treatment current across a consistently visible part. Let local material response shift selectively; preserve the underlying geometry throughout.

Sequence: metal part present, current builds, surface response traverses, residual particles dissipate, part settles. Target 6-7 seconds. Visual treatment is illustrative, not a claim of an exact process simulation or product already manufactured.

Acceptance: bores retain depth; metal stays recognisable throughout; particles protect the copy zone; final frame works without an effect. Principles can follow Surface integrity / Process discipline / Connected evidence, subject to content approval.

### 4. Network — one architecture, bounded plant contexts

Build a reusable factory module with a convincing shell, roof, glazing and selected interior silhouettes. Instance and vary it into one foreground facility and several smaller contexts on consistent glass plinths. The composition is illustrative of owned operations and future partnership paths; it must not imply an inventory of existing facilities.

Use sparse shared-foundation routes and junction cubes. Each facility remains visually bounded. Keep the foreground facility dominant and reserve formation particles for one future/developing context.

Sequence: foundation/plinth, foreground facility, smaller contexts, shared routes, one future assembly, final still. Target 7-8 seconds. Governance and operating status remain consistent with page copy.

Acceptance: the composition reads as a spatial network rather than scattered factory pictures; buildings do not obscure the copy; connections have intended meaning; the scene avoids suggesting unrestricted exchange between plants.

### 5. Intelligence — readable human judgment

Keep the true sampled head, web-free enclosure and accepted gentle downward framing. Fix anatomical contrast before increasing density: dark sockets, readable nose bridge, lip separation, cheekbone and jaw underside. Give rear dispersion more volume while keeping the facial region sharp. Verify depth occlusion during assembly and final state.

Retain open waves into the head, a brief enclosure response and a still ending at 7.5 seconds. Add no network geometry to this hero under the current direction.

Acceptance: recognisable three-quarter face at normal size, calm eyes, no pale uniform shell, no hidden particles filling sockets, all points visibly contained or deliberately dispersed.

### 6. People Culture — a contribution enters the whole

Preserve the implemented order: hand fully forms, individual cube appears, lower enclosure/core assemble, hand releases, same cube descends, core receives it and the scene settles.

Refine the contact pose before effects. Define an authored palm anchor with meaningful support, then use geometry tests to check clearance. Nine raycasts alone prevent intersection but do not guarantee that the cube looks held. Add a restrained contact cue and reduce excessive separation between the presented cube and receiving assembly.

Keep .36 individual / .7 core / 2.1 enclosure as coherent starting proportions. Refine small-cube face contrast, descent corridor, hand withdrawal and merge visibility. The upper pane completes after entry. The same object remains visible until it is inside the core.

Timing guide: hand .4-2.8s; held cube 3-3.7s; enclosure/core 3.4-4.9s; release 4.8-5.5s; descent 5.5-6.8s; merge 6.8-7.5s; still by 8.5s.

Acceptance: palm support reads clearly; thumb does not hide the cube; fingers and wrist remain natural; lower cubes visibly build; no duplicate traveller, collision, bounce or disappearing handoff. Review the entire motion, not only the completed frame.

### 7. Partner — a legible handshake

Approve the paired grip as solid geometry from three nearby viewing angles. Correct finger/knuckle/thumbnail intersections, contact spacing and wrist alignment. Use a prepared pose pair or rig if actual finger closure is added; the current procedural curl is an initial authored grip, not a substitute for validated contact anatomy.

Use per-hand light hierarchy: nearer hand slightly brighter, rear hand quieter, dark contact recesses and selective knuckle highlights. Blend wrist ends softly. Preserve two distinct hand silhouettes through assembly and approach.

Sequence: opposed open currents, recognisable hands, short final approach, held grip, one contact response, still by 7.5s. Avoid repeated pumping. The form actions stay available throughout.

Acceptance: viewers recognise two hands and a handshake without needing the solid diagnostic; fingers do not merge into a bright knot; wrists are not opaque cut cylinders; approach and contact feel intentional.

### 8. Ontology — a manufacturing situation made coherent

Replace the unfulfilled hero slot with a physical part/lot anchor and three readable record contexts: measurement, inspection and requirement. Reveal those contexts around one stable identity; highlight their relationships once and settle. Use the same glass/metal library as Technology at a quieter density.

Acceptance: the scene explains contextual relationships, rather than repeating a generic cube diagram. Any necessary record names are HTML labels. Target 5-6 seconds.

### 9. About — the company premise

Replace the unfulfilled A01 slot with a restrained group expressing physical production, manufacturing knowledge and human capability around the exact brand mark. Use a simpler composition than Home, with minimal travel and one completed structure.

Acceptance: coherent with the brand, distinct from the homepage, no newly invented business claims. Target 5-6 seconds.

### 10. Commons — access and possibility

Preserve the leaf/circuit motif and low lattice foundation. Improve the artwork's depth/material integration so the emblem does not look pasted onto a separate cube scene. Use a shallow extrusion or carefully lit relief derived from the actual vector artwork, preserving the mark's shape. Two modest satellite contexts can resolve around the foundation.

Acceptance: humane, quiet and clear; no duplication of Culture's hand transfer or Partner's handshake. Target 5-6 seconds.

## Implementation order and dependencies

1. Record current desktop/mobile light/dark final frames and identify missing assets, broken routes, blank hero slots and loading mismatches. Resolve the unidentified browser resource 404.
2. Lock the common shell/grid, principles strip and scene controls. Document optical camera presets using reference overlays and solid models.
3. Refine Home's glass and lighting as the baseline material library.
4. Refine Culture and Partner contact/readability using their existing prepared geometry. Keep their verified timing and controls while changing anatomy/lighting.
5. Build Network's reusable factory module and volumetric layout. It currently has the largest missing-content gap.
6. Build Technology's central part and context modules; revise the persistent renderer transition contract.
7. Prepare the Manufacturing component and treatment effect; preserve the plant experience below.
8. Bring Intelligence, Ontology, About and Commons into the same material/composition family.
9. Capture production opening/completed posters after camera and material approval. Verify parity and paused clocks.
10. Perform one batched desktop/mobile/theme review, fix concrete defects together, then one confirmation pass. Do not reopen composition during shader polishing.

## Acceptance matrix

For every hero: 1440x900 desktop, larger desktop, 390px mobile, both themes, opening/middle/final frames, direct navigation, internal navigation, Pause/Resume/Replay, resize without restart, hidden/offscreen suspension, reduced motion, Save-Data/static fallback and context failure. Check overlapping copy, clipped art, missing images, readable final silhouettes and control targets. Record actual frame time and initial scene bytes on representative hardware before increasing quality budgets. Keep no more than one expensive hero scene active at a time.

Business/copy changes proposed by reference artwork remain an editorial decision. Buildings, equipment and treatment effects need technically plausible geometry and truthful context. Visual completion requires a good final still, a meaningful sequence and a matching fallback; code compiling alone does not establish a finished hero.
