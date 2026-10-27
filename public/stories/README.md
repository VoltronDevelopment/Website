# About / Partner scene derivatives

Prepared by `scripts/build-collaboration-assets.mjs`; downloaded sources remain unchanged.

- `progression.gltf` / `.bin`: selected StraightStair001 + LTypeStair002, matching Bip001/Bip006 rigs, two independent clips. Three runtime instances occupy the structures 1 + 2. Original geometry, tread dimensions and skinned walking paths are retained. Unused six people/structures, textures, material dependencies and animation bindings are excluded. Duplicate binary accessor data is shared. See `stairs-license.txt` and the site footer for source attribution and modifications.
- `figure-0.bin`, `figure-1.bin`: indexed normalized derivatives of the two named objects in the user-supplied `public/human-after-all/source/all.zip`. New smooth normals/materials; no skeletal motion is asserted. That bundle contains neither its referenced MTL nor author/license metadata; source provenance is recorded as user supplied.
- Binary figures have two uint32 header values (vertex count, index count), interleaved float32 position + normal vertices, then uint32 triangle indices.
- Opening/completed WebP images are direct captures of the active Three.js scenes in light/dark themes, generated with `STORY_CAPTURE=1 node scripts/verify-collaboration.cjs` after building `.next-collaboration-20261027`.
- Cameras use fixed authored minimum bounds and responsive orthographic fit. Captured square images use the same world projection rather than stretching to the stage.

The table, supports, diagrams, inspection light and arched sample are locally authored geometry. All figures form from coherent fine-particle waves before walking/object-development begins. Introductory timelines stop at twelve seconds and suspend offscreen or when hidden.
