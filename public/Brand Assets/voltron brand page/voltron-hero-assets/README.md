# Voltron Home hero assets — v1

Exact brand mark plus editable, transparent vector lattice. This is a code-authored interpretation of the approved visual DNA, not a pixel-identical extraction from the raster mockup.

## Files
- voltron-mark-original.png: byte-for-byte original 500 × 500 transparent logo. No redraw or upscaling.
- hero-static.svg: finished transparent composition, with original PNG embedded.
- hero-animated.svg: self-contained 1.8-second assembly; CSS animation and reduced-motion support. Embedded PNG preserves logo identity.
- lattice-only.svg: transparent finished lattice without logo; use when compositing the supplied logo separately.
- lattice-geometry.json: editable cube cells, projected vertices and edge references.
- material-tokens.css: proposed palette from the UI specification.
- preview.html: self-contained responsive hero preview, with replay. Open locally in a browser.
- hero-static-preview.png: rendered static preview on off-white.

## Integration
Prefer inline hero-animated.svg for DOM access and coordinated page timing. For image embedding, use an img with width/height reserved and an empty alt when decorative. Inline SVG currently includes a title/description: remove those and use aria-hidden=true when decorative beside the headline. Preserve the 640 × 520 viewBox. Do not squash the scene. The logo image occupies a 200 × 200 region including its original transparent padding.

Animations play once per insertion. Nodes and edges are deduplicated. Faces are exterior-only. Camera and vertex positions remain fixed; no physical simulation. Reduced motion shows the final state. Replay in the local preview recreates the SVG node.

## Fidelity and remaining inputs
The original logo bytes are preserved; the logo remains raster inside the SVG, not a vector trace. Keep the header mark at modest display size. Request the source vector for true large-format vector fidelity or stroke-by-stroke logo animation. Montreal font files were not supplied and are not included; preview uses the local PP Neue Montreal if present, otherwise Arial. Use properly licensed WOFF2 files for production.

Palette, geometry, gradients and timing are editable. Static SVG render verified; live browser animation timing has not been tested in this environment. This pack does not modify or publish the website.
