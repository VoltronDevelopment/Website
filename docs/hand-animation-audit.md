# Hand and cube animation audit

25 October 2026. Current horizontal Culture hand and Rhino-based Partner references.

## Verdict

The interaction and playback infrastructure works, but the artwork is not yet at the intended anatomical and visual quality. The earlier 0.36-unit grip check measures one line through the cube, not clearance around its complete volume. It must not be treated as proof of a physically correct grip.

This audit examined the current desktop/mobile sequence captures, solid diagnostic views, particle shader, timeline and prepared geometry. `node scripts/audit-hand-motion.mjs` adds an offline sampled motion/contact audit using the actual timeline module. Results are in `.audit-logs/hand-authoring/motion-audit.json`. These are sampled surface checks, not continuous triangle collision certification.

## 1. Culture: grip and release — highest priority

- Horizontal wrist entering from the right is retained and reads correctly.
- The opposing-pad centreline distance is 0.36, equal to the small cube edge. However, 764 of 42,000 sampled hand surface points lie inside the cube during the hold. The maximum sampled penetration is about 0.102 world units.
- During early release, the lower finger remains in the descending cube's path. At 6.30 seconds the deepest sampled point is approximately 0.177 units inside a cube with a 0.18-unit half-width. This is substantial clipping, even if the particles disguise it.
- At the checked frames from 6.45 seconds onward, no sampled hand points remain inside the cube.
- Scaling the whole hand to fit a single ray exaggerates its size and still does not solve the corners and side faces.

Correction: establish contact patches on the thumb and index against the complete cube bounds, at a deliberately selected hand scale. Adjust the local pinch pose and cube placement together. Clear the supporting finger laterally before appreciable descent, while retaining the existing Philosophy travel curve. Inspect all six cube faces and intermediate release frames. Add a whole-volume regression check rather than relying on the centreline gap.

## 2. Partner: actual handshake anatomy — high priority

- Two right-hand reference surfaces use proper rotations; there is no negative-scale handedness shortcut. The source wrist stays fixed during the open/curled morph.
- Approach samples through 5.2 seconds show no detected penetrations. By 5.4 seconds there is shallow contact; the final pose has 6 of 1,334 sampled points per hand penetrating beyond 0.035 rig units. Worst depth is approximately 0.058 rig units (world scale is 1.25).
- The top solid view reveals excessive open space between the palms and a fingertip/loop-like relationship. A front silhouette can suggest a handshake while concealing that missing palm and thumb-web engagement.
- Fingers reach roughly 68% closure at 5.2 seconds, before the sampled surfaces show contact. This reads more like two poses closing independently than a pressure-driven grip.

Correction: author the two hands as a paired contact pose. Establish thumb-web and palm contact first, wrap fingers around the opposite palm, then settle the wrists. Retain visible separation of the two thumb silhouettes. Review top, side and hero camera views before adjusting particles. Fit approach and closure timing to the actual contact event, not just fixed overlapping easing intervals.

## 3. Particle artwork — high priority

- Both visible hands remain particles; the new meshes are reference/depth surfaces only.
- Surface and depth morphs share correspondence. Nail attachment has been corrected and the wrist fades rather than displaying the raw source cut.
- The Culture formation frame at 1.5 seconds shows a broad rectangular patch, clipped at the artwork bounds. The three-band local wave field becomes a visible sheet after the hand's scale/orientation transform.
- In the completed handshake, uniform fine grains flatten the overlapping fingers into one mass. Mobile subsampling makes that loss of anatomy more apparent.

Correction: keep the formation stream inside the camera framing, with tapered asymmetric arrival and a soft spatial falloff. Use directed flow into the wrist/palm/fingers rather than a rectangular distribution. Improve finger silhouette, knuckle highlights and crease contrast; make the two hands distinguishable through lighting and depth. Preserve visible individual particles instead of increasing opacity until they look solid.

## 4. Cube sequence — retain the working structure

- The shared Philosophy dimensions, materials, outer/core reveal and vertical travel are still used.
- The hand forms before the held cube and receiving cubes appear.
- The small cube moves from Y=1.5 to Y=-0.8, ending at the receiving inner cube's centre. X/Z remain aligned.
- The main failure is initial contact and early release clearance, not the final destination.
- The shared movement is deliberately eased; it should not be described as a gravity simulation.

## 5. Composition and mobile — medium priority

- The Partner handshake is too small relative to the available hero area and has little separation between the hands in its resting state.
- At 390px, the Partner artwork sits below a large empty gap and reads as a small grainy block. Technical overflow checks alone do not establish useful visual scale.
- Culture retains a clearer hierarchy because the receiving cubes provide an anchor; the hand-to-cube size still needs tuning after contact is corrected.

Correction: frame each scene around its visible bounds, reduce unused mobile stage space, and use a close enough handshake view to read thumb and finger contact. Keep text, controls and wrist fade inside safe bounds.

## Verified infrastructure

The previous final browser run passed themes, replay/pause/resume, seeking, mobile loading and reduced-motion stills. The production build, 18 focused tests and performance budgets passed. Those functional results remain valid; they do not resolve the visual/contact findings above. No runtime artwork was changed during this audit.

## Implementation order

1. Correct cube contact and release clearance.
2. Author a genuine paired handshake contact pose and match its closure timing.
3. Rework formation flow and particle shading around the corrected anatomy.
4. Adjust desktop/mobile framing.
5. Validate intermediate poses and regenerate all matching stills after geometry is stable.
