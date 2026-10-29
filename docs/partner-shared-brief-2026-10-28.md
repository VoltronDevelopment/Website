# Partner: people presenting a shared manufacturing brief

The current scene replaces the handshake and briefcase. Eric and Carla keep their prepared 89-joint Renderpeople rigs, satin navy/pearl finishes and texture-free geometry (about 1.6 MB combined). Source attribution remains in the site footer and per-asset licences.

## Fixed composition

A single frosted-glass panel sits between the figures. Carla presents the lower-left area with an open palm; Eric gestures toward the upper-right. Targets remain in front of the panel and within comfortable arm reach. Their idle hands stay outside the jacket/trouser silhouettes. Feet retain their planted world positions as the bodies turn toward the document. Camera direction is fixed; responsive orthographic fit reframes the same anchors.

`partner-stage.ts` contains only small UI-safe constants; `partner-stage-space.ts` owns Three.js matrices and hand anchors. The page component does not eagerly import the renderer. `partner-rig-motion.ts` resets bind transforms before every evaluation, solves the limbs without stretching, distributes presentation roll and keeps idle wrists in their authored orientation. Carla's idle left arm preserves its natural bend orientation. There are no live Blender constraints, physics simulation or supplied animation clips; this is deterministic authored Three.js movement.

## Twelve-second sequence

- 0.15–2.75: figures resolve from fine local surface particles.
- 2.8–5.8: staggered arrivals, three alternating footfalls and a shorter final braking step.
- 5.8–6.1: feet plant before either presentation gesture starts.
- 6.1–7.5: shoulders, elbows, wrists and heads move toward their complementary targets.
- 7.0–8.4: particles deposit into one rounded frosted-glass brief.
- 8.05–10.05: heading, original-component outline/context diagram, three information groups and two acknowledgement nodes appear progressively.
- 10.0–11.25: the exact approved Voltron emblem approaches its reserved area, a localized blue response appears and the impression resolves. No certification or signature claims are added.
- 11.25–12.0: particles and transient light disappear; arms relax slightly and the composition holds.

The first loading/live frame uses 1.6 seconds for a stable handoff. Replay starts at zero. Rendering stops at completion and suspends offscreen or on hidden tabs. Reduced-motion, Save-Data and failed WebGL/assets show the completed renderer capture.

## Panel optics and contents

The body uses the shared pearl/smoked glass materials, directional reflections and rounded physical thickness. Reading graphics render on the front surface so glass does not wash out the lower rows. The component/context diagram is one prepared crisp graphic; information bars and acknowledgement nodes are separate timed geometry. The logo uses the unchanged full-resolution approved alpha asset, not a particle approximation. Panel formation is direct surface deposition rather than an incoming wave or a wireframe filled later.

## Verification

Rig tests exercise the actual imported meshes, reversible poses, world-fixed stance, hinge behavior, target reach, finger-to-panel clearance, unchanged idle-wrist orientation and deformed fingertip clearance against the trouser silhouette. `scripts/verify-partner-rig.cjs` captures eleven timeline states on desktop, additional mobile states, both themes and four viewport sizes, then checks pause/resume, offscreen suspension, replay, finite completion and static/data-saving/asset-failure fallbacks. Capture with `PARTNER_CAPTURE=1` against the selected build or development runtime.

## Movement refinement — 29 October 2026

Attention turns toward the shared brief before the hands arrive. Eric initiates the gesture and Carla follows slightly later; each wrist follows a smooth raised arc with depth clearance rather than a straight-line reach. Wrist orientation and finger articulation follow the same eased reach, while idle wrists retain the authored orientation. Small staggered acknowledgement nods accompany the identity reveal. Feet remain world-fixed during presentation. The component diagram resolves from left to right into its context branches, followed by the information rows with a small settling motion. Opening and completed framing remain unchanged. The rig test now samples the entire reach for target accuracy and panel clearance, in addition to the existing end-pose and clothing checks.
