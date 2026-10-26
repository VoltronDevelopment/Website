# Culture and Partner hand artwork corrections

25 October 2026. Corrective specification and implementation record.

## Implemented

The latest clarification is applied as a palm-down flip of the Culture hand. The hand pinches a solid cube below its fingers. Culture and the homepage Philosophy scene now use `philosophy-cubes.ts` for the same geometry/materials/lighting and `philosophy-cube-timeline.ts` for the same dimensions, cubic easing and reveal. Culture offsets the receiver reveal by three seconds, starts the downward return at six seconds, travels for the original 1.85 seconds, and withdraws the wrist after descent starts. The top pane remains present; the solid core occludes the entering cube.

The supplied hand mesh is prepared offline using five source-space finger chains, length-constrained endpoint posing, blended finger-web influences and quaternion transport of radial skin offsets. Pinch contact is calibrated against both fingertip surfaces along the cube axis, measuring a .3600-unit gap for the .36-unit cube. Thumb/index release moves sideways out of the transfer path. Particle positions and normals have corresponding release targets, and the depth/solid geometry follows the same target poses.

Partner uses separate contact-ready and closed finger poses, slimmer palm-depth preparation, paired placement, bounded skin-contact correction and a separate corrected target for each hand. Formation precedes approach; finger closure and approach finish together, followed by one small settle. No contact glow hides the geometry. Main, side and overhead solid review views are available with `hand-view=solid` and `hand-angle=side|top|front`.

These are authored deformations of the supplied source mesh, not a newly sculpted anatomical asset or a full rigid/soft-body solver. The column-based contact analysis is an approximation and can report residual source-mesh intersections; it does not certify collision-free anatomy. Close-up source mesh folds remain a sculptural quality limit. Solid authoring captures are in `.audit-logs/hand-authoring`.

This direction supersedes the previous palm-up Culture proposal. The user requires the earlier downward pinching-hand composition and exact correspondence to the homepage Philosophy cube artwork.

## Verified differences

The earlier reference is `public/Brand Assets/voltron people culture/Frosted hand corrected grip v2.png`, with a related `Frosted hand pinching empty space.png`. The wrist enters from the right, the index finger curves downward, and the thumb opposes it across the space intended for the cube. The current sampled hand is presented palm-up with a cube supported from above, which changes the intended gesture.

The actual homepage Philosophy implementation is in `components/home/cube-renderer.ts`, not the Home hero lattice renderer. It uses an outer cube of 2.1 units, an inner solid core of .7 and a small solid cube of .36. The outer cube reveals first over 1.05 seconds; the core starts at 1.2 seconds and resolves over 1.6 seconds. The small cube reveals at 2.9 seconds and travels from the core centre to Y=2.3 between 3.15 and 5 seconds. It uses cubic smoothstep. Its camera is at (6,4.8,7), looking at (0,.65,0).

Culture currently duplicates these sizes but uses different materials, an opposite-side camera, quintic easing and a curved path with a .5-unit sinusoidal depth offset. The hand withdraws before the cube begins descending, producing an unsupported pause. These are substantive differences, not minor polishing issues.

Partner currently uses two copies of one sampled hand. Offline preparation bends the upper hand broadly according to Y, without separate finger joints, thumb opposition or a paired contact pose. Final contact is set by fixed group offsets. The saved final capture does not have a clear handshake silhouette.

## One shared Philosophy cube implementation

Extract one reusable rig and timeline from the existing Philosophy renderer. Both locations must use the same cube sizes, solid/glass roles, face colours, edge treatment, orientation and reveal curves. Preserve the homepage's existing outward movement. Culture uses the corresponding downward return phase, after its hand formation and lower-cube reveal.

Use the same viewing azimuth/elevation for the cubes. Culture may change the framing and scene translation to accommodate the hand, but should not show the opposite cube faces. Do not independently retune the small cube into a wireframe or create another core material.

Keep the outer-first/core-second reveal and its original relative timing. Offset that sequence after the pinch becomes readable. Once the lower structure is ready, run the small cube from the held anchor to the core along one vertical axis, using the original 1.85-second travel curve in reverse. Remove lateral drift, the curved depth detour and whole-rig rotation. A different duration is a deliberate future decision, not an accidental consequence of duplicating code.

The receiver is the same conceptual translucent framework as Philosophy. Do not introduce an animated lid or abruptly hide/show its top face to fake entry. Use depth occlusion and a restrained response at core entry. The small cube remains visible until it physically reaches the core region; no fading away in open space.

## Culture pose and release

1. Match the earlier reference silhouette in a solid neutral material: wrist from the right/upper-right, hand inclined downward toward the receiver, index and thumb holding the small cube, remaining fingers naturally curled behind.
2. Author thumb-pad and index-pad anchors on opposite cube surfaces. Solve hand pose, cube placement and camera together. A downward palm raycast cannot establish a two-finger pinch.
3. Centre the pinch directly above the core on the vertical transfer axis. Keep a visible gap between the small cube and receiver so the transfer reads clearly.
4. Let the particle hand resolve before the held cube becomes fully readable. Keep fingertip and thumb silhouettes dense enough to show contact.
5. Assemble the lower cubes with the shared Philosophy reveal. Hold the pinch steadily during this phase.
6. At release, open the fingertips slightly as the cube starts moving. Preserve the cube's world transform when detaching from its anchor. Withdraw the wrist after release begins, eliminating the current levitating pause.
7. Descend, enter the core and settle. Reuse the same path on replay and hold the composed final structure for reduced motion.

First approve the solid pinch and shared cube framing; then the timed transfer; then particle formation. More particles must not hide an inaccurate pinch.

## Partner geometry and contact

Author two right hands as a paired handshake, with forearms approaching from opposite sides. The two thumb/index webs meet; thumbs rest naturally against the other hand; fingers curl around the opposing palm rather than interlacing into a knot. Preserve the volume of both palms, a readable thumb contour and plausible wrist/forearm alignment. Do not use negative scaling to substitute for posing.

Use the existing mesh as a starting surface only if it can support appropriate rigging and sculpted corrections. Final requirements are separate finger articulation, thumb opposition and a jointly authored contact pose. If the source cannot support those requirements, a properly posed replacement mesh is necessary. A global bend or another pair of group offsets is insufficient.

Review contact in an untextured clay render from the final camera, plus side and overhead diagnostic views. Remove visible hovering gaps, palm penetration, merged knuckles, broken wrist angles and fingers passing through the other hand. Small intentional skin compression is acceptable; gross mesh overlap is not. Maintain stable contact during the final settle.

Suggested sequence: recognizable hands form; contact-ready poses approach; thumb/index webs meet; fingers close around the opposing palms; both wrists settle once; the handshake holds. Avoid repeated pumping or indefinite float. Geometry drives the contact event, not a time-triggered glow hiding an unresolved intersection.

Particle positions, normals and the occluding depth surface must follow the same rigged deformation. Preserve each sampled point's triangle/barycentric identity and skin weights, or bake corresponding particle poses with consistent sample identity. Evaluate all deformation from one master timeline. Use subtle lighting separation and actual occlusion to distinguish the hands; do not add a bright blob at contact.

## Acceptance

- Culture cubes match Philosophy in geometry, projected orientation, material roles, reveal and transfer easing; only the narrative direction and hand prefix differ.
- The cube is visibly between thumb and index before release and never floats unsupported while the hand withdraws.
- Transfer is vertical, continuous and reaches the same core centre.
- Partner reads as a handshake in a solid silhouette before particles are enabled.
- Joint contact remains plausible through approach, finger closure and settle, including diagnostic side views.
- Both scenes remain readable in light/dark themes and narrow framing; particle density does not erase anatomy.
- Pausing/seeking every contact and release phase produces a coherent frame. Replay, reduced motion and posters use the same final pose.
