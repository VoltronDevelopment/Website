# About and Partner artwork direction

Status: implemented locally. The proposal below is retained for context; the implementation record at the end specifies the final user-directed two-stair arrangement. This direction follows the user's choice to retain the two Human After All figures and build the table/object. KUKA/Ontology is deferred until the user supplies the model. Existing page copy, routing, navigation, typography and page backgrounds remain the starting point.

## Inspected assets

### Stairs

`public/populate_models_stairs/scene.gltf` contains 20 meshes, eight skinned people, several straight/U/L/spiral stair structures, and one combined animation named `Take 001` lasting approximately 8.333 seconds. Its animation has 1,608 channels. The glTF JSON is approximately 1.60 MB and the binary buffer 7.69 MB before textures. This is a collection of examples, not one compact finished composition.

The accompanying license identifies vicente betoret ferrero and CC BY 4.0. Preserve attribution in the asset record and published credits when the derivative is used. Do not ship all eight people and their unused animation tracks merely hidden.

### Human After All

`public/human-after-all/source/all.zip` contains `all.obj`, approximately 1.77 MB. The parsed objects are `_guy2` and `_thomas2`, totaling approximately 39,109 triangles. The preview confirms two standing helmeted figures. There is no table, workpiece, skeleton or animation clip in this bundle; it references an MTL file that is not included in the ZIP.

User decision: retain both figures and their recognizable geometry. Create materials, table and workpiece separately. This does not authorize reshaping the figures into the anonymous people in the reference. Record missing provenance/material metadata during asset preparation.

Local inspection evidence: `.audit-logs/asset-direction-20261027/inventory.json`, `human.png`, and `stairs.png`. Preview shading is diagnostic, not the final material treatment.

## Shared visual contract

- Use the existing hero stage and responsive layout, keeping the scenes within their artwork area. No new text cards around hero copy.
- Reuse the hero's optical language: pearl crown surfaces, graphite recesses, restrained cyan seams, reflective metal and a clear readable foreground.
- Separate glass from people and metal through roughness and lighting, rather than coloring every surface bright cyan.
- Use directed fine-particle waves for formation. Avoid drawing a complete wireframe first and filling it afterward.
- Use one authored timeline per scene, with pause/replay, reduced-motion/failure posters, hidden/offscreen suspension and context restoration.
- Complete the introductory action and hold a composed final frame. No compulsory endless walking or object spinning.
- Render capture-derived opening/completed images in both themes. Keep these geometrically consistent with the live camera.

## About Voltron: three people progressing together

### Composition

Replace the current About hero's three structures with a compact connected staircase and three figures. The concept is collective capability building, not a crowd on unrelated stairs. Keep the People & Culture head/overhead-cube scene separate.

Use two short flights and a clear landing, viewed from a restrained three-quarter camera so both the steps and ascending motion read. Place one person lower, another midway and the third near the upper landing. Maintain plausible human scale, headroom and foot contact. Their silhouettes must remain individually readable at the phone size.

Give the staircase pearl/graphite structural surfaces and selectively translucent side supports. Keep walkable treads sufficiently opaque to show contact and depth. Cyan energy can travel underneath the steps in the same direction as progress, remaining subordinate to the people. Figures receive neutral pearl, slate and graphite finishes rather than the original varied clothing textures.

### Asset preparation

1. Inspect each person's original route over the full source clip; choose three suitable ascending performances.
2. Extract each selected skinned hierarchy together with its bones and only its required tracks. Preserve animation binding names.
3. Design the reduced stair arrangement around compatible gait and step dimensions. If a path needs to change, retarget/rebase it offline and verify the feet on the new steps; do not move a figure root independently of its authored path and assume the gait will fit.
4. Retain three different people where their clips fit. If one gait must be reused, clone skeletons safely and vary timing; shared skeleton state must not move all figures together.
5. Export a reduced optimized GLB containing the selected structure, people, materials and trimmed clips. Remove unused meshes, skins, images and animation channels.

Three.js provides skeleton-safe cloning and clip retargeting through SkeletonUtils, and AnimationMixer can play or seek each figure independently. Existing deterministic scene timing should drive the mixers, enabling replay and exact capture poses.

### Proposed sequence: approximately 12 seconds

| Time | Action |
| --- | --- |
| 0–1.8 s | A low particle wave establishes the landing and stair structure, resolving from volume into surfaces. |
| 1.4–3 s | Three figures form at staggered positions, with local particle density defining their silhouettes. |
| 3–10.5 s | They progress upward with staggered gait phases. A restrained light pulse passes beneath the steps. Final timing follows usable source foot-contact points. |
| 10.5–12 s | Each reaches a stable authored pose. Residual particles settle; the camera and figures hold. |

Mobile keeps all three people and the full essential path, with reduced lateral spread and simplified secondary stair supports. It does not solve fit by making the people illegibly small or clipping the upper figure.

## Partner: two figures developing one shared object

### Composition

Replace the handshake artwork with the two inspected Human After All figures behind a new table. Place them left and right, turned gently inward through whole-object rotation. The object sits between them in the foreground, forming a triangle of attention. Preserve their existing pose and helmets. Camera framing may crop below the waist, letting the table conceal lower-body space naturally.

Build the reference's substantial rounded rectangular table as real geometry: a thin pearl glass top, thicker translucent structural fascia, quiet geometric reinforcement within that fascia, and two or three restrained cylindrical supports. The near rim receives a controlled reflection, while the centre remains clear enough for the sample to read. Avoid a uniformly glowing aquarium-like slab.

Use a single arched/ribbon-like workpiece inspired by the attached reference: one smooth parameterized surface, with derived blueprint, wireframe and solid representations. These representations must share exactly the same shape. Place the diagram to one side and the finished piece near the centre, within the table footprint. If the three states become cramped on phone, show them sequentially at the same position instead of shrinking three objects side by side.

### Figures and materials

Use contrasting but related satin finishes for the figures: pearl alloy and graphite alloy, with selective helmet highlights. This keeps the two figures distinct from the transparent table. Add fine particle formation and a small amount of whole-figure settling; do not claim the OBJ contains hand gestures or fabricate arm articulation through independent mesh rotations. Natural new hand/arm actions would require deliberate rigging and pose preparation as a separate production step.

### Proposed sequence: approximately 11–12 seconds

| Time | Action |
| --- | --- |
| 0–2 s | A horizontal wave resolves the table and its structural depth. |
| 1.2–3.5 s | Both figures form behind it, using slightly staggered particle entry. |
| 3–5 s | The object's blueprint traces over the tabletop, followed by a clean dimensional wireframe of that same object. |
| 5–8 s | A coherent ribbon of particles transfers from the diagram to the central sample, depositing the solid metal surface. |
| 8–10 s | A soft inspection light moves across the finished shape; its reflection follows on the tabletop. |
| 10–12 s | Temporary construction guides and stray particles fade. Figures, table and finished workpiece settle into a readable final composition. |

The collaboration is expressed through a shared evolving artifact, not a handshake. The figures can remain in their supplied poses while the object carries the action.

### Geometry and rendering preparation

1. Preserve the original OBJ and derive an indexed, normal-checked GLB for the two figures. Assign new materials because the referenced MTL is missing.
2. Build table top, fascia, support and workpiece as independently addressable meshes; reuse workpiece geometry for all visual states.
3. Keep local glow in edge and particle shaders. Use the established environment/reflection system; avoid a separate expensive transmission render for each glass piece.
4. Author particle fields around the actual object surface and table bounds, using entry/exit ribbons rather than uniform random noise.
5. Fit mobile and desktop cameras to the full animation bounds, including formation particles and final figure positions, before generating posters.

## Implementation order and acceptance

1. **About proof:** reduced three-person animated asset, neutral material study, full-cycle foot-contact check and phone composition. Then apply final glass and particle treatment.
2. **Partner proof:** both original figures, procedural table and shared workpiece, desktop/phone framing. Then implement the blueprint-to-solid story and final reflections.
3. **Verification:** both themes, narrow phone/tablet/desktop and short landscape; no document/control overflow; readable silhouettes; correct shadows/reflections; no particle cutoff at critical actions; no skeletal binding errors; finite playback; pause/replay; navigation suspension; reduced-motion/fallback images; production build and route budgets.

KUKA/Ontology remains outside this implementation until the model is supplied. Once available, inspect its joint hierarchy and clips before deciding whether its movement can drive the proposed stacking ontology panels.

Technical references: https://threejs.org/docs/pages/AnimationMixer.html and https://threejs.org/docs/pages/module-SkeletonUtils.html. These inform clip control and skeleton handling; the choreography and visual design above are project-specific proposals.

## Final implementation record

The user revised About to two original source structures, with one person on one and two on the other. The active scene now retains StraightStair001 with its Bip001 ascent and LTypeStair002 with the matching Bip006 ascent. The latter has two independently phased skeleton instances. Stair geometry, tread dimensions and matching foot paths remain in place; glass side faces, opaque pearl treads and darker recesses provide optical depth. The earlier thin single-flight experiment was superseded.

Partner retains both source figures and their poses, with satin body materials and selectively polished helmets. A locally authored glass table has one restrained transmission surface, a quieter structural fascia, cylindrical supports and inset bracing. One bevelled metal arch provides the blueprint/wireframe/solid states. Its physical material, tabletop reflection and moving inspection softbox carry the action. All five figures across these two pages form from directed surface-sampled particle waves before walking or object development. Both timelines stop at twelve seconds.

The renderer is lazy and shared through CollaborationHero, without adding dependencies or replacing the page framework/navigation/content. Device-sized opening captures retain live particle density at laptop, tablet and phone sizes. The same authored projection controls the captures and canvas. Reduced motion, Save Data, unavailable assets and WebGL failure retain a completed captured illustration. KUKA/Ontology remains deferred.

Verification evidence is recorded in `.audit-logs/collaboration-20261027/`; final counts and implementation details are in `docs/collaboration-implementation-2026-10-27.md`.
