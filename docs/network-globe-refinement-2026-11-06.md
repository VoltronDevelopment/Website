# Network globe refinement — November 6, 2026

## Artwork changes

The globe now uses continuous land shapes derived from the existing Natural Earth source. The former enlarged-dot painting and duplicate land-point layer are removed. Light mode uses navy land against pearl seas; dark mode uses pale blue land against deep navy seas. A shallow bump treatment and studio reflections add surface depth without another transmission/render pass.

The approved outer envelope retains its original radius, tilt and topology. Soft glow layers copy its exact wire positions. The hero's core edges are brighter, with restrained activity during the rotation; the completed pose holds still. No route arcs were reintroduced. Geographic nodes remain illustrative and the existing future-network caption is retained.

The mask is generated offline by `scripts/build-globe-land.mjs`, retaining source polygon holes and clipped dateline boundaries. Runtime requests the 98 KB mask and compact coastline segments rather than the old land-point JSON. Decoded bitmap resources are closed after copying the mask, before GPU initialization.

## Verification

- Eleven targeted geography, envelope, camera-containment and motion checks passed. They include known land/ocean samples, polar/dateline edges, sphere-UV longitude registration and projected bounds of the actual envelope vertices.
- The envelope's geometry hash still matches the approved static reference.
- Production build passed.
- Thirty-two rendered pose checks: 1440, 768, 390 and 360 pixels, both themes, during opening, completed envelope formation, mid-rotation and final hold. No page/shader errors or horizontal overflow. The one-turn endpoint remains exactly 2π within rendering precision.
- Visually inspected both theme treatments and the mid-rotation phone composition.
- Lifecycle checks verified offscreen pause/resume, a stopped final frame count, no public hero playback controls and fallback recovery when the atlas request fails.
- Reduced-motion checks at desktop and phone sizes in both themes used the current completed fallback without downloading globe geography. Motion restoration was exercised on phones in both themes.
- Baseline and HD completed/opening fallbacks were recaptured. Content-hashed filenames and all active Network opening/HD manifests were updated, respecting the immutable cache policy. Actual file dimensions match their manifests. Baseline artwork remains below 200 KB; HD captures remain below 1.2 MB. Existing route/asset budgets and the refined-artwork verifier passed.
- Local evidence: `.audit-logs/network-globe-20261106/` and `.audit-logs/network-globe-lifecycle-20261106/`.
- Local preview refreshed at `http://localhost:3410/network`.

## Remaining goal scope

This completes the targeted globe geography/envelope refinement. The final sitewide section, layout, lifecycle and storytelling consistency audit still needs completion, including Network's supporting stories. Physical-device performance remains unverified by software-browser captures. These scenes illustrate a future network, not operating-site geography or real terrain elevation.
