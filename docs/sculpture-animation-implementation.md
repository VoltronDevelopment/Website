# Human sculpture hero choreography

The Culture composition places the intact source arm at the upper right, rotated 60 degrees within the scene plane and turned 45 degrees about its original vertical axis so the palm faces the viewer, with the head lower on the left. The arm mesh retains its original anatomy; its prepared geometry is not mirrored or deformed. The head base sits 0.30 units below the receiver base.

The individual cube appears on the palm at 7.70–8.25 seconds, follows a short supported palm route at 8.25–10.25, pauses in alignment above the receiver, and descends vertically at 11.35–13.20. During descent its world X/Z remain fixed and its rotation is identity. The hand withdraws before release. The descent uses the reversed homepage Philosophy easing and the same cube dimensions and rendering owner.

The head emits a glass-enclosed core through its open crown before transferring it into the receiver. Dosti uses the original 2,588 source triangles and authored normals. Both heroes reveal their finished material surfaces from particles.

Regenerate derived assets with `node scripts/build-human-sculptures.mjs`, then `node scripts/build-arm-cube-path.mjs`. The latter derives the palm path after applying the arm orientation and checks cube clearance against prepared vertices and surface samples. This is contact-guided authored motion, rather than a free-body dynamics simulation.

Run `node scripts/audit-sculpture-motion.mjs` for the 321-pose contact audit; this samples vertices and points, and does not certify continuous triangle collision. Focused regression coverage is in `tests/sculpture-assets.test.ts` and `tests/hand-scenes.test.ts`. `scripts/review-live-sculptures.cjs` renders the actual controller for visual inspection.
