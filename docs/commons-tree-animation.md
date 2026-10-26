# Commons tree hero

The Commons hero uses the supplied Old Tree by gelmi.com.br, credited in the site footer. Original assets remain in public/old_tree. Run `node scripts/build-commons-tree.mjs` to regenerate compact indexed meshes, monochrome cutout textures and 24,000 opaque-surface particle targets. Source topology and UVs are preserved, including foliage alpha cutoffs; no live source-model download is needed.

Four .72-unit glass cubes form a square around the roots. Their inner cores energize at 1.1 seconds. Streams converge at the roots and rise through a bottom-up particle construction front; the full tree surface resolves by 8.05 seconds and the energy fades by 10.5 seconds. The tree grows by revealing its original geometry rather than stretching the trunk or leaves. A shallow circular base grounds the clipped roots.

The renderer stops when settled, pauses outside the viewport or when the document is hidden, and retains replay, pause, seek, studio settings and context-loss fallback. Reduced-motion and unavailable-WebGL users receive the completed scene poster. Mobile halves construction and travelling particle counts while preserving source geometry.

Focused verification: tests/commons-tree.test.ts and tests/human-hero-motion.test.ts. The actual controller can also be inspected with scripts/review-live-sculptures.cjs, using SCULPTURE_CASES to select Commons times. The local production fixture scripts/verify-commons-tree.cjs checks the full page and controls.

Leaf shading refinement: source tangent-space normal maps use NoColorSpace and retain source UV orientation. The key light casts a bounded 1024px PCF shadow; alpha-tested custom depth materials share the growth field so hidden foliage does not cast premature shadows. Softer leaf reflections, a restrained teal tint and an inner-to-outer canopy colour falloff add depth. Sources reviewed: https://www.ui-skills.com/skills/threejs and https://www.skillsdirectory.com/skills/datit309-threejs-animation, checked against official Three.js material documentation.
