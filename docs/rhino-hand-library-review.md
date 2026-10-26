# New Rhino hand pose library review

25 October 2026.

Source: `public/3D hand/15种手姿势.3dm` (approximately 8.4 MB). Read with a local audit-only rhino3dm reader; the source file is preserved.

## Findings

The file exposes fifteen distinct posed hands. It contains 55 geometry objects, ten groups, polygon meshes, one hand represented by cached Brep render meshes, and a large ground plane excluded from the review. Several hands include separate fingernail geometry. The accessible content is posed geometry, not a ready-to-play Three.js skeletal rig or clip set. Rhino plug-in data is present, but no usable skeletal animation/timeline is exposed through this inspection.

The new meshes have much cleaner pre-authored finger shapes and substantially lower density than the original approximately 597,000-vertex hand. Representative main meshes contain 2,991–19,393 vertices. Full-pose triangle counts range from roughly 5,500 to 40,000, depending on the pose and separate parts. This is a better basis for the particle artwork and its depth surfaces.

## Candidate selection

The pose IDs below are assigned by the audit exporter, not native object names. They are stable in `rhino-summary.json` and the rendered contact sheets.

| Use | Candidate | Assessment |
| --- | --- | --- |
| Culture cube pinch | P08 / group-01 | Clear thumb/index pinch, coherent anatomy and separate nails. Preferred starting shape; rotate into the approved downward composition and open the pad gap to the cube width. |
| Culture alternative | P02 / group-04 | Another clean pinch with a different wrist bend. Compare its silhouette against P08 in the actual hero camera. |
| Partner approach | P03 / object-02 or P10 / object-36 | Useful relaxed, partly curved fingers; cleaner starting anatomy than the old globally bent hand. These are individual hands, not a complete contact pair. |
| Pose-driven movement | P15 / group-07 to P11 / object-41 | Matching indexed topology: 2,991 vertices and 5,507 triangles. A wrist-aligned open-to-cupped morph proof renders successfully. |
| Other gestures | Remaining poses | Useful as a reference library, but pointing and unrelated gestures should not replace the requested pinch/handshake narrative. |

Only P11 and P15 were confirmed to share the same indexed topology among the tested families. Matching vertex counts in P06/P08 or P07/P12 do not imply matching vertex layouts. Do not directly blend those mismatched meshes without establishing correspondence.

## Movement proof

P15 and P11 were aligned using a wrist-ring subset. The fit uses a positive-determinant rotation and uniform scale, with approximately 3.06 mm RMS wrist difference (about 0.51% of the model's full length). Five rendered frames demonstrate a coherent open-to-cupped transition. This is a generated morph test, not an animation clip supplied by the file. Final joint timing, volume preservation and paired contact still need review in the actual scene.

## Recommended next implementation

Use the new library as the source for replacement hand geometry. Start with P08 for Culture, preserving the exact Philosophy cube rig and the downward-facing composition. The pinch gap, fingertip clearance and release remain explicit constraints.

For Partner, compose and validate a pair from the cleaner hands. Use the matching P15/P11 family where appropriate for approach/closure, but do not assume a cupped single hand automatically produces a correct handshake. Wrist alignment, thumb placement, finger wrapping and skin contact still require paired authoring.

Prepare selected poses offline as compact runtime geometry and corresponding particle/depth data. Keep the Rhino reader and fifteen-pose catalog in authoring tools; do not load the whole 3DM/decoder into the marketing hero. Keep unrelated poses out of the shipped asset set.

## Evidence and tools

- `.audit-logs/hand-authoring/rhino-iso.png`, `rhino-front.png`, `rhino-side.png`, `rhino-back.png`: fifteen-pose contact sheets.
- `.audit-logs/hand-authoring/rhino-morph.png`: five-frame P15-to-P11 proof.
- `scripts/inspect-rhino-hands.py`: geometry inventory and catalog export.
- `scripts/align-rhino-hand-poses.py`: topology-pair alignment and morph export.
- `scripts/review-rhino-hands.cjs`: isolated local Three.js preview; no application credentials or public deployment.

## Implemented particle reference pipeline

Selected poses now drive both live particle heroes. P08 opens its thumb/index pinch using smooth surface-distance weights; disconnected nails inherit the underlying skin weights. The wrist extends horizontally from the right, per the latest direction. P15/P11 retain exact vertex correspondence, with the wrist fixed during finger closure. Paired contact uses two proper rotations, fitted placement and a bounded 0.035-unit skin correction. Visible rendering remains particle-only.

`node scripts/build-hand-particles.mjs` rebuilds from the checked-in selected reference JSON. To re-extract a changed source, run `python scripts/export-rhino-hand-references.py`, then review the IDs and contact sheets before rebuilding. Never infer correspondence from vertex counts alone.

Depth geometry now uses 5,467 vertices for Culture and 2,770 for Partner, previously 53,679 and 41,308. Desktop particles remain 42,000 and 32,000 per hand. Mobile subsampling and reduced-motion stills remain supported.

The sampled closed-pose contact check found 6 of 1,334 points per hand deeper than 0.035 units, worst about 0.058. This is not proof of zero penetration. Close-up anatomy remains an authored approximation rather than a jointly rigged capture of a real handshake.
