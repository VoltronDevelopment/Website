# Voltron artwork polish audit and implementation plan

25 October 2026 · Audit and planning only · No renderer or UI changes in this pass.

Later user direction: the Network factory hero and Home logo-backdrop approach are superseded by [the revised artwork completion plan](artwork-completion-plan-2026-10-25.md), which specifies a single-turn connected globe and contrast through differentiated glass faces without local logo blur. Original audit follows.

## Direction

Keep the established compositions, exact Voltron mark, navigation, typography, content and finite animation system. Improve the perception of glass, light and physical depth. The signature remains **organic growth through engineered structure**: a repeatable lattice with different contents and purposeful variations in material strength.

The references succeed through shaped white reflections, dark blue reflective bands, substantial transparent edges, selective cyan light, and believable ground contact. Current saved renders communicate the objects and relationships, but often look like blue transparent diagrams. More glow alone will not close that gap. First establish reflective surfaces; then make the active light signals unmistakable.

## Evidence and scope

- Compared all three supplied references: Home seven-cell lattice, Technology component/records cells, Network factories on connected glass foundations.
- Visually inspected saved captures in `.audit-logs/hero-family`: `home-review.png`, `technology-light.png`, `technology-dark.png`, `network-final.png`, `intelligence-review.png`, `manufacturing-light.png`, `manufacturing-sequence-light.png`, `home-mobile.png`, and `network-mobile-light.png`.
- Inspected current material, lighting, timeline, renderer and layout source, `DESIGN.md`, the previous hero quality plan, implementation status and scene continuity notes. No `AGENTS.md` was found in the repository search or the checked user/Desktop/Voltron ancestor locations.
- These are **saved visual captures plus current source inspection**, not a fresh live-browser or deployed-site audit. A saved capture may precede later working-tree changes. Existing verification reports are historical evidence, not tests rerun by this audit.
- The mobile Network filename says light but the image is visibly dark: the fixture switches theme before capture. The Home mobile image was taken shortly after replay/pause and shows an empty artwork area. Neither establishes a settled-state rendering defect; both expose a need for better deterministic audit captures.
- The latest maintained direction removes the Intelligence web and face scan. Preserve that decision; the older pasted five-page brief does not reauthorize those effects. “Increase scan on the first page” is interpreted as the Home lattice's travelling edge highlight.
- Existing uncommitted work is substantial. This document is a proposed next pass, not a claim that previous work was absent or that all scenes need replacement.

## Findings and concrete remedies

| Priority | Finding and evidence | Recommended intervention | Acceptance |
|---|---|---|---|
| P1 | Home panes read as large, almost uniform blue planes. The current studio preset already has low roughness and softboxes; simply lowering roughness again is unlikely to solve it. | Tune reflection-card placement against the accepted camera; introduce broad white top reflection, a narrow side reflection and a controlled navy band. Make edge bevels visible at actual display size. | Top, side and front read as different orientations in both themes; clear fronts preserve the mark and all seven cells remain legible. |
| P1 | Home signal is easy to miss. `hero-renderer.js` uses a 0.34s segment, 30% trail, and sine opacity up to .8; broader illumination mostly changes colour/opacity and face emissive strength. | Separate a crisp travelling core from a soft halo; lengthen the travel and synchronize receiver-node response. Keep pane emission subordinate. | At normal playback speed the eye can follow one deliberate scan; no white flash across all faces; every dynamic term settles by 6.5s. |
| P1 | Technology and Network routes are thin, unlayered lines. `route()` uses `THREE.LineBasicMaterial`; draw-range reveal and a shared opacity response do not provide the reference's luminous path. | Use the existing wide-line infrastructure or a small ribbon shader for a stable-width core and halo. Parameterize by path distance; add a bounded travelling tip and node response. | Connections stay visible on pale backgrounds and at mobile DPR without overpowering the contents; no change to relationship meaning. |
| P1 | Floor reflections are faint silhouette echoes, not reflected glass/metal appearance. `createFloorEcho()` copies base colour into a faded shader and omits source shading. | Improve this approximation first: tighter contact, brighter near-contact edge echo, softer distance falloff and shape-aware masking. Prototype one shared low-resolution planar reflection only if the approximation remains inadequate. | Reflection is attached to the correct floor, fades smoothly, and has no detached triangular fragments or doubled edges. A reflection pass must earn its GPU cost. |
| P1 | Network is small and low in the art area; front factory obscures much of a rear factory. Thin bases and dark glazing give a model-diagram impression. | Reframe projected bounds, stagger sites in depth, expose each silhouette and thicken visible base rims. Add selective window reflection and restrained interior light. | Foreground factory dominates but all represented sites can be distinguished; the illuminated foundation/network reads before minor facade details. |
| P2 | Shared glass vocabulary drifts through renderer-local multipliers. Intelligence suppresses panes heavily; Technology halves front opacity; capability/lot scenes have their own intentional rear-glow style. | Name use-case presets and move their values to a shared owner. Keep geometry, palette and highlight logic related, while preserving intentional content-visibility differences. | A side-by-side sheet reads as one material family without identical opacity or glow everywhere. |
| P2 | Manufacturing's coating transformation is present, but the mid-sequence particles read as loose dust. Final metal has useful contrast but some reflected bands look abrupt. | Concentrate particles at the moving treatment boundary, taper density away from it, and align a narrow surface highlight to the same boundary. Refine metal normals/reflection cards after isolated inspection. | Viewer sees a surface changing, with polished bore/top detail retained; no disconnected particle cloud or whole-part glow. |
| P2 | Intelligence's enclosure is nearly just a wireframe; the face has dense grain, particularly around sockets and cheeks. | Restore selective top/side reflected highlights, keep the front exceptionally clear, and tune particle size/contrast by feature rather than raising all particle brightness. | Face remains the focal point; glass can be recognized without drawing edges across the facial features. No web or scanning lines. |
| P2 | Scene controls vary: round icon-only replay on Home/engineered scenes versus labelled replay on Intelligence. | Use one visual/control contract, with consistent placement, target size, focus and accessible labels; keep review controls separate. | No collision with art/captions; consistent Pause/Resume/Replay semantics and at least 44px targets. |

P1 means highest visual payoff in this polish pass, not a production outage or a security severity.

## Shared design DNA with controlled variation

Retain the existing ink `#132A42`, blue `#246BD4`, cyan `#2894BC`, secondary `#526F87`, and canvas `#F3F5F7`. Optical white and darker reflection cards belong to the artwork lighting, not new UI colours. Retain Montserrat and the latest shared hero type scale; no typography redesign is needed.

All cubes share a construction language: planar transparent faces, consistent bevel-to-size proportions, blue absorption concentrated on lateral faces, small junctions, and bright highlights on selected edges. Connections carry meaning; arbitrary extra links are not decoration. Keep Home's exact seven-cell topology. Network uses low lattice plinths rather than copying Home's tall cells. Manufacturing need not acquire a cube enclosure just to fit the family.

Proposed relative art-direction strengths, on a 0–5 scale (not direct shader parameters):

| Use case | Reflected glass | Resting edge emphasis | Active signal | Floor reflection | Primary subject |
|---|---:|---:|---:|---:|---|
| Home | 5 | 3 | 5 | 4 | Seven-cell structure and exact mark |
| Technology | 4 | 2 | 4 | 3 | Component, machine, lot, records |
| Intelligence | 2 | 1 | 1 | 1 | Dimensional particle portrait |
| Manufacturing | 1 where applicable | 1 | 4 at treatment boundary | 3 | Metal and surface change |
| Network | 4 on bases | 3 | 5 on shared paths | 4 | Factories and shared foundation |
| Capability / lot enclosures | 2 | 1 front, 3 rear | 3 on meaningful event | 2 | Contents and process evidence |
| Philosophy / Culture cubes | 3 | 2 | 3 on transfer | 2 | Outer/core/individual hierarchy |

These relative differences are proposed targets. Do not multiply every existing material opacity by this table. Light mode needs a blue core below a white glint for contrast; dark mode generally needs less halo energy because the same signal reads much brighter.

## Home: exact scan and glass pass

Preserve the 6.5s master timeline, cell positions, logo asset, focal plane and established blur/occlusion treatment.

1. **Arrival, 1.2–3.6s:** retain staggered assembly. Strengthen contact glints only when the cell reaches its destination; do not illuminate all approaching edges.
2. **Resolve, 3.6–4.0s:** maintain the transition to assembled geometry. Ensure arrival and assembled rails have matching thickness and brightness so the material does not pop.
3. **Scan, approximately 3.9–5.6s:** run one deliberately ordered sweep across connected structural edges. Stagger segments enough for the direction to remain readable. Start with 0.55–0.70s segment travel instead of 0.34s, and a 35–45% tapered trail instead of 30%. Remap start times so the last receiver response fits inside the existing duration.
4. **Logo and response, 4.0–6.2s:** preserve the current logo reveal. Let adjoining junctions respond briefly after the travelling tip arrives, then fade. No glow bloom over the logo itself.
5. **Settle, 6.2–6.5s:** dynamic halo and node response reach exactly zero. Static reflected edge highlights remain, with no idle pulsing or render loop.

Initial tuning envelope at desktop CSS size: 1.5–2px bright core, 4–7px low-opacity halo, and a tightly bounded junction halo. Start around .85–1 core peak opacity and .12–.22 halo opacity in light mode; reduce halo for dark mode. These are calibration values, not approved final tokens. Follow the existing DPR-aware line path so width is consistent across displays. Reduce halo radius on mobile before reducing core visibility.

Do not raise all pane opacity or emissive intensity to produce “glass.” Compare the same frame with signal disabled: the glass must still show thickness, reflection and depth. Avoid duplicating shared internal faces and rails, which would create muddy overlap and bright double seams.

## Page-specific follow-through

**Technology:** retain the five-cell arrangement and current component/records semantics. Give the central cell the strongest reflection and metal detail; secondary cells have quieter glazing. Keep equipment, part bore and evidence legible through front faces. Increase connection visibility with clear elbows and small receiver highlights. Keep the document and telemetry panels matte enough to distinguish them from surrounding glass. First improve light and separation; additional industrial geometry is a later asset task.

**Network:** use more of the available art area, moving the composition upward and spreading rear sites before increasing scale. Test approximately 10–15% greater occupied bounds against text/control clearance. Use a clear top and a richer blue sidewall for plinths; small white-cyan corner glints and a faded ground response make the bases feel substantial. Give existing sites clearer volume and future sites a progressively lighter treatment. Retain the future-network caption and existing relationship semantics; do not imply live plant-to-plant operational data exchange. Architectural detail and vegetation are optional second-stage improvements, not prerequisites for the light pass.

**Intelligence:** preserve corrected anatomy, accepted camera and independent head pose. Add white top reflection and one muted side band; do not strengthen front edges across the face. Reduce bright-density clumping around eyes and lips while retaining depth occlusion. Evaluate at final rendered size before changing sampling counts. No added web, face scanner, or continuous motion.

**Manufacturing:** retain the bracket, bore, mounting geometry and shared colour/roughness treatment boundary. Make the boundary physically legible through a narrow moving highlight and nearby surface particles. Keep coated material more diffuse than exposed machined regions. Ground contact should explain whether the object rests or intentionally floats; the reflection must agree with its pose. Keep the Alpha line below independent.

**Other cube use cases:** review capability and lot enclosures together because they already share `capability-cube-style.ts`. Preserve their rear-glow/front-normal rule. Review Philosophy and Culture together through `philosophy-cubes.ts`; keep their shared proportions and transfer timing. Ontology/About can inherit the calibrated engineered preset only after individual comparison. Commons and Partner are outside the primary five-page visual comparison and should not receive blind global changes.

## Implementation order and source ownership

| Batch | Work and files | Review gate |
|---|---|---|
| 0 — trustworthy baseline | Capture current sources at deterministic times using the existing hero/continuity fixtures. Record route, actual theme, viewport, time and source revision/hash. | Settled, active and reduced-motion frames are distinguishable; no review-slider or paused-opening confusion. |
| 1 — Home calibration | `components/home/lattice-materials.ts`, `components/brand/artwork-studio.ts`, `components/home/hero-renderer.js`, `components/home/hero-timeline.ts`. Tune glass and local scan together on Home first. | Compare current/proposed Home in both themes at rest and scan peak. Seven cells and exact mark retained. |
| 2 — shared presets and paths | Introduce named profiles in the shared material owner; replace ad hoc multipliers incrementally. Add reusable path core/halo/receiver treatment alongside existing artwork helpers. | Same optical language, deliberate content visibility differences; no unrelated scene change. |
| 3 — Technology and Network | `components/brand/engineered-hero-renderer.ts`, `hero-scene-timeline.ts`. Apply path treatment, refine composition and plinth contact. | Central component and each factory remain readable; no overexposed edges or disconnected routes. |
| 4 — Intelligence and Manufacturing | `components/brand/intelligence-hero-renderer.ts` and the manufacturing branch of the engineered renderer. Tune enclosure/portrait and treatment-boundary visibility separately. | Portrait stays dominant; coating action is readable at normal speed. |
| 5 — secondary cubes and UI | `capability-cube-style.ts`, `philosophy-cubes.ts`, relevant lot/capability renderers and `hero-art-direction.css`. Standardize motion controls through existing React wrappers. | Preserve previously approved rear-edge emphasis, typography, control placement and responsive flow. |
| 6 — final stills and verification | Rebuild only affected opening/completed posters and manifests using established scripts; run source tests and browser checks. Update `DESIGN.md` only with accepted durable decisions. | Static/live material parity and lifecycle behavior pass before declaring polish complete. |

Keep each batch independently reviewable. Extend the existing Three.js implementation; do not introduce React Three Fiber, a second timeline, screenshot-based mockup artwork, or a global bloom pipeline for this pass.

## Reflection and performance decision

The current floor echo is useful as a low-cost fallback. A stronger colour silhouette will still not reproduce metal/environment reflections. If it fails the Home calibration, test a single bounded half-resolution reflection target for the hero floor, with distance fade and roughness blur. Avoid per-cube captures and avoid including the floor recursively. Cache settled output and refresh only for motion, theme or size changes. Retain the approximation on lower quality tiers. Measure actual frame cost before choosing the default.

For glass, the current material is transparent physical shading, not configured transmissive volume. A selective transmission prototype is possible for the main visible shell, but nested transparent/transmissive surfaces require ordering and content-visibility checks. Do not switch every pane to transmission. Reflection structure and bevel geometry are the first intervention.

Retain adaptive DPR, preparation scheduling, hidden/offscreen suspension, resource disposal and static fallback. Keep existing asset/initial-JS budgets (200KB per configured artwork asset and 180KB gzip initial route JS). Performance improvements or device FPS are not claimed from screenshots or software WebGL.

## Acceptance and verification plan

Capture 1440px and 1920px desktop, 768px tablet, and 390px/360px mobile in both themes. For Home inspect 0.65, 2.7, 3.8, 4.5, 5.3, 6.2 and 6.5 seconds; add the exact revised scan peak once defined. For Technology/Network inspect arrival, path travel, response and settlement. For Manufacturing inspect before/during/after treatment. Inspect Intelligence formation and final pose.

- Side-by-side reference/current/proposed crops should show broader shaped reflections, glass thickness and selective light without sacrificing interior readability.
- Inspect normal-speed replay as well as stills. A brighter screenshot does not prove a more readable animation.
- Check mobile core-line visibility, cube silhouette, artwork occupancy, logo clearance, captions and controls; do not force all content into one screen by shrinking it beyond readability.
- Verify Pause freezes all light layers, Resume continues, Replay reproduces the same state, and settled frames stop scheduling animation.
- Theme and resize must not restart motion. Offscreen/hidden pauses and route interruption must retain existing lifecycle behavior.
- Reduced motion, Save-Data, no JavaScript, asset failure and WebGL failure retain appropriate stills. Opening and final posters must be regenerated from the changed renderer, with matching framing and theme.
- Check keyboard focus, accessible control names, at least 44px targets, no horizontal overflow, and text/background contrast after atmospheric changes.
- Use `npm run typecheck`, `npm test`, an isolated production build and `npm run performance:budget` during implementation. Extend meaningful timeline/disposal tests for new effects; run existing hero-family and scene-continuity browser fixtures against the new build.
- Collect shader/runtime errors, draw calls and visible-frame timing before/after. Software-WebGL checks establish behavior, not real-device performance. Profile at least one representative mobile GPU before enabling an extra reflection pass by default.

The first reviewable implementation should be **Home glass plus its stronger scan**, followed by **Technology/Network connection and foundation light**. These establish the family; the remaining pages then receive controlled variations rather than separate visual reinventions.
