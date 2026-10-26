# Technology neural-network hero

Technology now reconstructs the supplied Artificial Neural Network (ANN) asset by M.E. All 54 cube centres and dimensions are extracted in world space. The four source layers contain 25, 9, 16 and 4 nodes, with all 433 adjacent-layer connections retained. The source sweep contains 866 separately indexed end caps, matching the two ends of each connection. Original source models remain untouched; source attribution is included in the footer.

Run `node scripts/build-neural-network.mjs` to regenerate `public/sculptures/neural-network.json`. The runtime constructs softly bevelled solid blue nodes, complete screen-space connection ribbons, narrow travelling signal highlights, restrained crown glow and fading floor echoes. It does not load the original 2.8MB tube mesh. Each connection attaches to the corresponding cube face. No graph density is removed for mobile.

The fixed oblique perspective follows the mockup: the foreground layer descends at the left and the remaining layers recede to the upper right. Responsive framing changes projection scale and centre while preserving the viewpoint and perspective. Tests check every cube corner remains inside portrait and landscape frames.

The 9.5-second sequence establishes the node layers, reveals all strands, propagates signals and settles with the complete graph visible. Rendering pauses when hidden or offscreen, and stops at completion. Replay, pause, seek, theme changes and WebGL context fallback remain supported. Matching renderer-captured opening and completed posters provide the reduced-motion and unavailable-WebGL states.

Ownership: `neural-network-renderer.ts`, `neural-network-framing.ts` and `neural-network-timeline.ts`. The Technology branch delegates from the existing engineered hero controller; other page renderers retain their owners. Page copy follows the supplied mockup. Focused checks: `tests/neural-network.test.ts` and the production browser fixture `scripts/verify-technology-neural.cjs`.
