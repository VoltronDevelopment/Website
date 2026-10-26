# New hero asset direction

25 October 2026. Discussion and asset feasibility; supersedes the earlier single pinch-hand and independently posed handshake direction. Current corrective runtime work remains in progress and is not a release candidate.

## Inspected local assets

| Asset | Finding | Recommended use |
| --- | --- | --- |
| `rrrs-dosti-symbol/source/#DostiSymbol.fbx` | Four meshes named hand, arm, arm2, hand1; 2,588 triangles; no supplied animation clips. Authored reciprocal wrist grip; visibly angular surfaces. | Partner primary gesture, with cleaned/smoothed geometry and Voltron materials. Preserve the authored pair's relative placement. |
| `arm__hand_sculpting/scene.gltf` | Full sculpted arm and open hand, 327,184 triangles across three meshes; no skin or clips. | Culture upper-right forearm/hand reference and cube travel surface. Offline simplification and rigid/art-directed motion; do not claim it is already rigged. |
| `brain-in-head/source/Brain In Head.glb` | 8,828 triangles, one mesh/material. Position-welded topology separates into head, two brain hemispheres and two eyes. | Culture lower-left source of the inner cube. Brain removal verified in an audit-only GLB, retaining 7,916 head/eye triangles. |
| `planes-of-the-head/source/planes of the head_DECIM.zip` | Closed faceted head, neck and circular pedestal; 958,902 triangles despite the planar appearance. | Better sculptural reference for Intelligence and its base. Reduce offline. It has no open crown, so the brain/head asset is the more direct Culture source. |
| `cube/source/cube.zip` | Nested twisting square-frame sculpture, about 9,992 triangles and 153 parsed mesh pieces. | Optional restrained Partner foundation/assembly motif. Batch or rebuild a small subset of its frames. |
| `impossible_cube/scene.gltf` | Eight separated corner forms, 7,328 triangles, no authored clips. | Possible secondary cooperation motif; do not assume it includes an animation or replace the main Philosophy cube with it. |
| Plasmatic/quantum/handshake Blender files | Present, but no Blender executable was available for an evaluated scene preview. | Keep as candidates until exported and inspected. No claim about their visible animation or rigging yet. |

The arm and impossible-cube folders include CC BY 4.0 attribution text. Carry those supplied credits into the site asset credits if used. Preserve source/provenance records for the other imported assets.

## Culture composition

The central large glass cube is the focal anchor. The open-crown head sits smaller and slightly lower on the left. A cropped forearm/hand enters horizontally from the upper right; keep the shoulder outside the artwork composition. Use one camera, floor and lighting environment for all three elements.

The interpretation of the cube hierarchy is: a central outer glass receiver, a dark inner core carried out of the head inside a thin glass envelope, and the small individual cube delivered by the hand. On arrival, the carrier's glass envelope settles/fades into the main receiver treatment, leaving the familiar Philosophy outer/core/individual hierarchy. This avoids an accumulation of competing transparent boxes.

### Proposed sequence, approximately 12–13 seconds

1. **0–2.5s:** A tapered particle stream builds the head and pedestal. A second restrained stream builds the arm. The central glass edges begin assembling. Surface rendering develops behind the arriving particles.
2. **2.5–4.5s:** The brain-free crown reveals a small dark core inside a glazed carrier. It rises vertically through the actual opening with clearance, then follows a restrained arc toward the central receiver.
3. **4.5–6s:** The core settles at the receiver's centre. The carrier envelope resolves into the shared glass treatment. The sculpture and core pause long enough for the relationship to read.
4. **6–9s:** A small cube tumbles from the visible forearm along the hand toward its delivery position above the receiver. The route is sampled from the actual arm surface; the cube rotates around its supporting edges and changes speed at each transfer of support. It settles into the same axis orientation as the Philosophy cube.
5. **9–11s:** The hand clears the descent corridor. The small cube follows the shared straight vertical Philosophy return into the core. The cube's path remains separate from the hand's withdrawal path.
6. **11–13s:** Hold a resolved material-rendered composition. No indefinite orbit, ongoing glitter or replay loop. Replay remains available.

A cube tumbles rather than rolling continuously like a sphere. Establish its support height from the oriented cube vertices and the mesh, its angular velocity from its supporting edge, and its final orientation explicitly. Keep the path on the arm/hand; avoid visible skating or a turn through the skin. The static arm requires authored transforms or a small offline rig for wrist movement; it does not come with motion clips.

For small screens, compress the spatial relationship into a triangle: central cube prominent, smaller head lower-left, forearm entering upper-right. Crop the arm intentionally and shorten the scene to a readable formation/core-transfer/drop sequence when appropriate. Preserve a single coherent composition rather than shrinking the entire desktop arrangement.

## Partner composition

Use the Dosti wrist grip as the primary silhouette. Its pre-authored pair is stronger for this gesture than creating a new finger-wrapped handshake from unrelated single-hand poses. Clean the surface without closing the gaps that distinguish fingers from wrist. Keep the relative contact pose throughout the reveal; there are no supplied approach/release clips.

Reveal one forearm stream followed by the opposing stream and resolve their common contact region. Allow a small paired settling motion once the material surface is established. Avoid moving the two finished arms independently through each other.

An optional cube motif can come from the nested-frame cube asset: two or three square frames assemble below the grip into a restrained glass foundation, with a small shared core settling at its centre. Keep it subordinate to the wrists. Do not combine the twisting tunnel, impossible cube and energy cubes in the same hero.

## Particle-to-material rendering

Use particles as the mechanism that constructs a durable surface. All assets start as directed, sparse particles; the advancing field reveals matching local patches of the actual 3D surface. The completed figures are material-rendered sculptures, with only a small residual particle trace at the construction boundary.

- Sample the prepared target geometry by surface area, keeping position, normal, part identity and reveal time.
- Drive particle arrival, visible surface clipping/dithering, depth and shadow reveal from the same asset-local field. A whole-mesh alpha crossfade creates ghosted overlap and should not own the transition.
- Use stable noise and a narrow construction boundary. No rectangular particle sheets, arbitrary world-space bands or broad bloom.
- Head and arms: satin silver/blue ceramic-metal appearance, controlled roughness, readable knuckle/face planes and soft contact shadows.
- Cubes: the established blue glass rails, lightly glazed faces and dark inner core. Retain the canonical Philosophy sizes/relationships at the final transfer.
- Base: low glass or satin pedestal, with a quiet reflection consistent with the shared studio lighting.
- Finish with a finite hold and use the same completed composition for reduced motion and load failure.

## Engineering preparation

Keep original FBX/OBJ/Blender files as source assets. Ship cleaned, compact derivatives, not the raw 39 MB head OBJ or 327k-triangle arm. Preserve the Dosti pair's contact during smoothing and simplify the arm while retaining the palm and fingertips. Prepare all shared coordinate systems and contact paths offline.

Use the open-crown head directly for Culture. Use the planes head as a separate Intelligence candidate; do not combine two overlapping full heads. If its pedestal is reused with the open-crown head, extract it and match its neck/base interface deliberately.

Validate complete cube volumes and swept movement at intermediate frames, not just a centreline gap. Check head aperture clearance, arm support, final cube orientation, wrist contact, particle/surface correspondence, mobile framing, theme contrast and static/live continuity before replacing posters.

## Evidence

Local asset renders and the brain-free head proof are in `.audit-logs/new-asset-review`. `review-new-hero-assets.cjs` is a read-only local viewer. Source files were not modified for this discussion. The audit GLB is a feasibility proof, not a shipping derivative.
