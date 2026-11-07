# Factory clearance refinement — November 6, 2026

## Changes and findings

The shortened oven retains its grounded camelback profile, separate opening doors, shared Alpha equipment and adjacent inspection booth. Rendered review confirms a clear aisle between the oven and inspection, with the existing clean flanged columns.

Two contact issues were corrected:

- The full-width oven door guide previously crossed the vertical suspension path. Separate leaf guides now leave a continuous central slot matching the roof's suspension passage.
- Inspection jaws previously stopped with a visible loose gap. Their closed position now follows the part's scaled, bevelled outer width and preserves a small contact tolerance without intersecting the part.

Part dimensions and critical oven/inspection dimensions are recorded in the shared operating model. Rendering uses the shared part dimensions, floor/roof dimensions and calculated jaw closure. No operating chronology or detailed thirteen-tank route was replaced.

## Verification

- 29 targeted checks passed across factory clearance, mechanical route, camera, bath response and operating-platform tests.
- New sampled checks cover bevelled part clearance through the chamber, door opening before part/door-plane overlap, clear suspension passage and inspection jaw contact throughout clamping.
- Production build passed.
- 42 browser frames: widths 1440, 768 and 390, light/dark themes, at tank immersion, return bend, oven entry, cure, exit, inspection and dispatch. No page/shader errors or horizontal overflow; the tracked part stayed within the camera frame.
- Visually inspected oven and inspection close-ups, including phone inspection and tablet oven entry. Intentional close-ups crop peripheral equipment while retaining the current operation.
- Four high-resolution factory overview fallbacks were refreshed from the current renderer. The refined-artwork delivery/dimension verifier passed.
- Evidence: `.audit-logs/factory-clearance-20261106/`. Local preview refreshed at `http://localhost:3410/technology#operating-platform`.

## Scope limits and remaining work

These are illustrative geometry and choreography checks, not an engineering installation clearance certification. Software rendering does not establish physical-device performance. The broader goal remains active: About machining/measurement/evidence, Partner acting/brief, Network land/envelope and remaining cross-page/lifecycle review still require work. This pass does not prove every transport contact across the entire website.
