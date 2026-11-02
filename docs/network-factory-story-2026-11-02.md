# Network factory story — 2 November 2026

Local implementation. Nothing pushed or published.

## Visual story

The approved globe remains the hero. Four factory chapters replace the icon-only owned cycle, partnership lists, flat network diagram and unrelated industrial-products image. A closing partnership invitation completes the page.

`factory-kit.ts` builds a reusable cutaway factory using Technology's Three.js primitive construction, studio environment and pearl/navy/steel/glass material vocabulary. It includes the structural frame, rear enclosure, roof ribs, glazed operations area, receiving and finished-goods platforms, open treatment baths, overhead carrier, inspection booth, transfer rollers, cargo staging and control displays. A reversing delivery truck and a small fork handler accompany the owned-plant story. The five-bath representation is illustrative, not a second depiction of Alpha's exact thirteen-station route.

- **Owned:** formation, receiving, operation, inspection, evidence and reviewed capability.
- **Partnership:** site/structure, equipment integration, digital systems and operating capability; contributions remain explicitly described below the scene.
- **Learning:** three plant sites, local evidence, a moving capability panel and orthogonal shared-architecture connections. Phone framing focuses on the relevant plant or shared layer; desktop retains the three-site overview.
- **Products:** an engineering bench and component assembly study illustrate a future development direction. It is not an advertised available product.

All stage selection uses absolute time. Truck reverse/stop/unload/depart phases are separate; inspection begins after the sample's transfer interval. Selected poses pause and replay restarts the finite story. Capability movement and visible records correspond to their chapter, rather than independent decorative loops.

## Layout and performance

Network joins the first four pages' shared layout polish: consistent heading measures, compact responsive hero, open artwork and selective foreground glass. Both themes use the existing shared tokens. No dependency or third-party model was added.

Factory geometry and materials are reused within each scene. Geometry-sampled particles form the structure locally without an incoming wave. Rendering is capped near 30 fps, DPR is bounded/adaptive, hidden/offscreen scenes stop drawing, and completed/selected poses stop drawing until resized, replayed or recoloured. Renderer resources and observers are disposed on unmount.

Reduced motion, data saving and the site motion preference retain working stage explanations without importing the optional factory renderer. Sixteen native renderer captures cover four scenes, desktop/mobile and light/dark, at 2x desktop and 3x phone density. Context failure restores these fallbacks. Captures are in `public/network-scenes`; total image size is about 5.6 MB across all variants, with responsive sources and lazy loading.

## Verification

- Three timing tests verify receiving support/vehicle timing, inspection ordering and deterministic chapter seeks.
- Ten responsive/theme browser cases at widths 360, 390, 768, 1024 and 1440 verify all chapter controls, image availability, static mode and horizontal containment.
- Eight live scene cases across phone and desktop verify every selection and paused seek, without page errors or overflow.
- Production build `.next-network-story-20261102` succeeds; Network initial route JavaScript is about 125 KB.
- Review evidence and scripts: `.audit-logs/network-story`, `.audit-logs/check-network-story.cjs`, `.audit-logs/check-network-live.cjs`.

No partnership inquiry or external action was submitted.

## Physical continuity and connector refinement

The follow-up replaces separate incoming/carrier/inspection component copies with one continuously positioned component. `network-simulation.ts` owns supported truck, forks, fixture, roller and finished-support positions. Travel, lower, dwell, raise and drain have separate intervals. The receiving vehicle opens rear doors after stopping; the handler has wheels and a separate lifting fork carriage. Inspection begins after transfer and the finished component retains pending release. The booth uses the shared Connected Lot/Manufacturing illuminated scan sheet.

Screen connections are built from transformed factory screen ports. Source, shared-library and receiving screens stay stationary. Signals travel along the exact orthogonal route by segment distance, with a return acknowledgement before future-site extension. Mini-screen node progress follows evidence, validation and local configuration. Equipment activity is evaluated separately for each scene and site.

Mobile retains a persistent location selector. Camera movement overlaps adjacent site visibility rather than switching sites at one instant. Site-specific equipment scaling and storage distinguish the receiving plant. Equipment installation and the prototype have separate clipping/particle formation windows. Surface samples use Three.js MeshSurfaceSampler; hidden formation particles stop updating. Theme materials update on theme changes rather than on every frame.

Seven model tests now cover chapter timing, stationary dipping, continuous handoffs, final support height, pending review and orthogonal signal motion. Ten responsive/theme cases and eight live scene cases pass after refinement. Native desktop/mobile/theme captures were regenerated. Final production verification uses `.next-network-refinement-20261102`. Nothing published.
