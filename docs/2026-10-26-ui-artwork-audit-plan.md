# Voltron Lattice — UI and artwork audit / next implementation plan

Status: original audit and implementation plan, 26 October 2026. Local implementation and final verification are tracked in [the completion record](remaining-implementation-2026-10-27.md). Findings below preserve the original baseline; they are not a list of current defects. Publication remains cancelled.

## 1. Brief and evidence

The governing idea remains **organic growth through engineered structure**. Preserve the framework, routing, working navigation, content, theme system, exact identity and approved industrial/anatomical assets. Apply the supplied glass-card reference for surface separation and readability, not its portrait layout, pink palette or decorative content.

Reviewed evidence:

- Current homepage, shared shell, header, glass/material helpers, hero/lot/Philosophy renderers, People & Culture, Commons, globe, neural artwork and Alpha framing/sign sources.
- Desktop and mobile, light and dark captures in `.audit-logs/artwork-refinements-20261026/`; earlier full-page and Home evidence in `.audit-logs/home-materials/` and `.audit-logs/release-20261026/`.
- The latest browser run contains 28 scene/theme/device cases and two real mobile Philosophy clock checks, with no recorded shader/page errors. It is evidence for that build, not proof of all later working-tree changes or short-phone layouts.
- Frontend Design and Frontend Design Premium guidance; Impeccable audit/critique playbooks. Independent visual and technical assessments are kept separate. The Impeccable binary is unavailable because its engine is not installed and its cache location is not writable; do not describe a missing detector run as a clean scan.
- Local example sources: `vector-plankton-three-js`, `hologram-effect-threejs`, `trails-in-spiral-threejs`, `pixels-as-frequencies-threejs`, `neural-net-three-js-interactive-javascript-guide`, `chroma-glass-orbiter-multi-themes`.
- [The Capacity to Create — Voltron Lattice](https://www.fluteandforge.com/strategy/voltron-lattice), read successfully through direct HTTP after the web reader failed. The reference describes a proposed, readiness-dependent sequence counted from the start of operations, with original product development beginning in Year 5.

Publication state at this audit: production release `a36a2dc` was verified through Amplify job 43. Local commit `20a3340` contains loading refinements but its Git push did not complete; the authentication dialog was cancelled. Additional artwork changes remain in the working tree. This plan must not be presented as a deployment announcement. Reconcile the pending work, refresh renderer posters and verify the final release before publication.

## 2. Decisions already resolved

1. Keep the seven-cell Home lattice and **four retained base cubes**. The upper cells become **8 fragments + 27 fragments + one intact logo cube**. The user explicitly selected this arrangement.
2. Connected Lot carries the manufacturing/evidence story. The current Execution–Context–Intelligence section is redundant and should be replaced rather than enlarged.
3. The logo cube remains complete, makes **two complete rotations**, sheds sharp-edge particles as its corners become rounded, and finishes with one face directly facing the viewer. This supersedes the previous half-cut/isometric final chamber.
4. Its final face uses the exact Enter Lattice logo image and theme backing. The volumetric body owns the pulsating glow; the logo remains clear.
5. Keep the globe’s polygon envelope, remove the long route arcs, and make land/ocean separation stronger than the present dotted map.
6. Keep one supporting cube below the Commons tree. Energy stops at the roots; separate canopy patches respond afterward.
7. Keep titles, hero descriptions and primary artwork out of cards. Use stronger glass selectively for compact app screens and supporting text.

## 3. Audit findings and priorities

The independent technical assessment gives a **provisional 13/20**: Accessibility 3/4, Performance 3/4, Responsive Design 3/4, Theming 2/4, Implementation Integrity 2/4. This is a working-build assessment with mixed-age local evidence, not a production certification. The earlier page-quality fixture covered 24 route/theme cases with zero axe violations or missing resources. The earlier performance fixture recorded 863,694 bytes initial Home transfer, 1,828 ms LCP, CLS 0.00161 and a 1,085 ms maximum startup long task, with 30 navigation cycles. Its date label is hard-coded to 23 October; these are local lab measurements, not current field performance.

The strongest engineering foundations are lifecycle cleanup, reserved layout space, a real reduced-motion path and product-specific artwork. The main integrity failure is synchronization: source, posters, accessible descriptions and design guidance currently describe different versions of the same story.

| Priority | Verified finding / evidence | Consequence | Next action |
|---|---|---|---|
| P1 | `app/page.tsx` repeats “connected manufacturing story” in adjacent component and lot sections. | Visitors see the same proposition twice before learning what the technology does. | Replace the first section with four app previews; retain Connected Lot as the physical narrative. |
| P1 | The Home logo captures show stair-stepping and uneven line weight; `voltron-mark.ts` derives the face from contour geometry, unlike the flat Enter image. | The most important brand mark looks less precise than the entry tile. | Put the exact original image on an independent, unclipped front plane. Compare it at equal displayed ink size with Enter Lattice. |
| P1 | The current source does not implement the requested two full turns, 27-cell breakup or receding-depth fragment motion. | The latest narrative cannot be achieved with timing tweaks alone. | Replace the Home choreography/state model with the storyboard below. |
| P1 | Current static posters predate several working-tree changes. | Reduced-motion and loading artwork can disagree with the live scene. | Regenerate from the final renderer only, including responsive variants where screen-space strokes differ. |
| P1 | `HumanHeroArtwork.tsx` still describes four Commons cubes and energy up the trunk; `ParticleHandHero.tsx` describes the old palm roll/descent. | Screen-reader users receive a superseded story even when automated accessibility checks pass. | Update descriptions, visible captions, fallback illustrations and timelines as one release unit. |
| P2 | `presentation.css` has an outer border, an additional masked gradient rim and inset rim shadow. Card styles add more bright edges and internal rules. | Nested containers compete with the 3D artwork and make the page feel segmented. | Remove structural rims and use broad shadows, spacing and surface changes. Keep meaningful diagram edges and focus outlines. |
| P2 | `home-surfaces.css` applies one broad treatment to factory cards, Alpha and the entire Philosophy content block. | Too much content becomes a card, including material that should breathe on the page. | Restrict card ownership to previews and short text/evidence groups. Keep artwork canvases open. |
| P2 | Culture’s desktop arm enters from the upper arm; mobile shows the detached upper-arm end. | The intended elbow crop and anatomical scale are inconsistent across viewports. | Use an elbow-to-hand derivative/pose, shared body scale, palm orientation and separate mobile framing. |
| P2 | Large receiving cubes in Culture/Commons are less volumetric than Home’s base cubes. | The same lattice means different things visually. | Share optical face roles and lighting while retaining different transparency for different contents. |
| P2 | Globe coastlines are improved, but dense dots remain the dominant land texture. | Geography loses prominence against the polygon shell. | Replace dominant stipple with coherent land surfaces; retain a much lighter optional technical point texture. |
| P2 | Neural topology has been reduced by approximately 20%, but small cubes and many strands still compete. | Increased bloom would wash out the structure. | Keep 346 displayed links and 54 nodes; improve face shading and darken light-theme strands. Highlight only selected travelling paths. |
| P2 | Philosophy’s latest implemented destination is the top of the core, and the individual has a different shade. | It contradicts the latest “go inside and merge” meaning. | Match the medium-cube material family and settle at its center, with a controlled merge response. |
| P2 | The Home source still creates an independent junction sprite. | A small floating dot can survive without a clear narrative purpose. | Audit the junction sprite, corner nodes and selection/interaction highlights separately; remove unmotivated points, retaining intentional engineering junctions. |
| P2 | The current header has no scroll-compaction state; existing mobile checks emphasize tall 390×1000 captures. | Short phones and landscape get less usable canvas space than the screenshots imply. | Add restrained mobile compaction and test actual short viewports, text zoom, safe areas and controls. |
| P2 | The earlier brief names Montreal, but `globals.css` currently declares Montserrat for body and wordmark text. | DOM text and canvas labels can diverge from the intended typography while appearing internally consistent. | Resolve the approved, licensed font source once, then use it consistently across page text, app diagrams and rendered labels. Do not silently introduce a third font during the artwork pass. |
| P2 | Alpha’s three-tank scale/quality regression is reported by the user but not established by an identical-frame comparison yet. | A guessed fix could distort the approved process geometry. | Compare the same viewport/time against the earlier approved capture before changing camera, padding or quality policy. |
| P2 | Thirteen-tank board lettering is a lit texture (`#174b80` on a pearl board). Its source colors have approximately 8.09:1 contrast. | This is not a proved source-color contrast failure; projected size, filtering and illumination can still weaken legibility. | Darken the ink as requested and verify rendered letters at near/far/mobile views. Preserve board mounting. |
| P2 | A prior local fixture recorded a 1,085 ms startup long task; the formation already uses 7,200 samples. | More effects can increase startup cost even when the steady-state motion is smooth. | Profile startup separately from frame rate; share GPU buffers and reveal layers, avoid per-particle JS objects and additional independent contexts. |

Preserve the strongest current work: recognizable industrial parts, the one-carrier lot, camera-stable engineering compositions, restrained typography, complete evidence states, offscreen pausing, visible controls, coherent theme support and the improved single-cube tree composition.

## 4. Page hierarchy and card policy

Recommended homepage order:

1. Home hero — lattice / identity / primary proposition.
2. Four compact application previews — what Voltron connects.
3. Connected Lot — how physical work and evidence stay connected.
4. Voltron Alpha, three-tank overview — the first manufacturing setting.
5. A compact decade roadmap — how capability grows into products and a brand.
6. Philosophy — individual contribution entering and strengthening the whole.
7. A concise invitation / existing navigation into deeper pages.

Use one continuous page atmosphere rather than a separate glass panel for every section. Reduce shell haze and bright rims. Put stronger frosted glass on the four app previews, short capability/evidence blocks and selected calls to action. Do not enclose hero headings, full artwork scenes or every paragraph. The reference’s transferable lesson is separation of readable foreground surfaces from a quieter background.

Container boundaries use soft shadows and tonal separation. Remove decorative borders from the shell and repeated section/card frames. Retain high-visibility keyboard focus, active selection indicators and actual geometry/diagram strokes; these communicate state or structure rather than page decoration.

## 5. Four app previews replacing the three manufacturing cards

Working labels require alignment with the existing product vocabulary; do not imply that concept previews are shipping software. Use four previews rather than squeezing five full dashboards into a row.

| Preview | Minimal visible UI | Diagram and movement | What it teaches |
|---|---|---|---|
| V-MES, with a clearly labelled SCADA signal strip | Header, one lot identifier, current operation, a small telemetry strip | Four station nodes; a single work item advances; machine signals update alongside it | Execution and machine visibility remain distinct but connected. |
| V-Twin | Header, three process labels, play/pause state | A simplified three-tank diagram with a moving carrier and a synchronized state highlight | The physical process has a corresponding digital representation. |
| V-AI / Intelligence | Header, one observation and one short suggested action | Evidence nodes converge into a recommendation; a human approval node remains distinct | Intelligence uses evidence and supports accountable decisions. |
| V-MO / Ontology | Header and a small readable graph | Part → operation → inspection → requirement → lot, with one relationship highlighted at a time | Shared meaning connects records that would otherwise be isolated. |

SCADA appears visibly within the execution preview but is not described as MES or as a replacement for PLC/control systems. If five independently named products are commercially important, use five previews on the Technology page rather than reducing every Home preview to an unreadable thumbnail.

Desktop: a balanced 2×2 layout when four diagrams would be too small in a single row. Wider screens may use a four-column variant only if labels and diagram semantics remain readable. Mobile: one full-width screen at a time with a visible four-item selector and ordinary scroll access to all four; avoid nested swipe traps and auto-advancing carousels.

Each preview has a short header, a diagram occupying most of the surface, at most two short supporting lines and one real link. Avoid dense KPI grids, tiny sidebars, decorative app controls or an imitation of a full desktop dashboard. Label the scene as illustrative demonstration data once for the group.

Entry animation: one seeded particle wave reveals the preview surfaces, followed by the actual DOM/SVG content. Keep one shared decorative particle layer rather than four independent WebGL renderers. SVG/DOM diagrams handle graphs, station status and evidence motion; reuse a small Three.js scene only where a dimensional Twin materially helps. Content and links remain available to assistive technology; visual animation never delays access to the information.

## 6. Home hero storyboard

Suggested total introduction: approximately 13–15 seconds, to be tuned in a timed preview rather than fixed by arbitrary frame counts.

| Phase | Approximate time | Required result |
|---|---:|---|
| Formation | 0–1.5 s | A coherent particle front resolves into the complete seven-cell lattice. Faces and reflections appear with the geometry. |
| Establish | 1.5–2.5 s | Readable assembled structure; a short localized scan travels along its engineering edges. |
| Exchange and lift | 2.5–5.5 s | One upper cell tiles into 2×2×2, another into 3×3×3; the intact logo cell lifts during the same interval. Four base cells remain. |
| Depth retreat | 3–6.5 s | The 35 fragments flow backward through world depth, shrink with distance, lose high-frequency detail and disappear through a receding particle field. No abrupt simultaneous fade. |
| Prepare the identity cell | 5–6 s | The intact cell reaches its position and establishes a clear rotation axis and silhouette. |
| Two turns / rounding | 6–11 s | Two full turns are explicitly accumulated. Sharp corners shed particles in traveling bands while the cell becomes rounded. No half-cube cut. |
| Identity resolve | 11–12.5 s | Rotation eases to an exact face-on stop. The original logo image and Enter Lattice backing resolve on the front face. |
| Ambient hold | after resolve | A bounded volumetric pulse continues; the identity image remains steady and readable. Stop work offscreen, in hidden tabs or on navigation. |

Important implementation rules:

- Quaternion shortest-path interpolation cannot represent two complete rotations by itself. Accumulate an explicit 0→4π turn parameter and compose it with the intended camera-facing orientation.
- The latest final pose is genuinely front-facing; do not leave the current small isometric residual. Keep depth visible through the side/rear pulse, reflection falloff and earlier turns rather than skewing the final logo plane.
- The exact Enter image goes on an independent full front plane. Do not crop it to the extruded contour or use vertex-color sampling for the visible brand face. Shallow extrusion may remain behind it if it does not alter the image.
- Share the Enter tile’s theme backing, relative corner radius and the current 2.5-second pulse rhythm. Its 6% expansion should become a three-dimensional shell/silhouette response, not a large billboard washing over the front face.
- Animate rounding with prepared matched topology or a shader parameter. Do not allocate/rebuild geometry every frame. Particle emission follows the changing edge field and conserves the visual relationship between material disappearing and particles leaving.
- Depth retreat must include depth travel and scale/parallax, not just opacity. Keep the camera stable and match the approved composition; explicitly author the depth projection if retaining the existing orthographic camera.
- Preserve logo clear space throughout. Fragments move behind and away from it, not through its face. Reserve the brightest core light for a few edges and moving fronts.

## 7. Shared cube and optical design system

One design family does not mean identical transparency everywhere.

| Optical role | Surface behavior | Intended use |
|---|---|---|
| Clear enclosure | Low front opacity, stronger side/rear presence, pale crown and restrained softbox reflections | Culture receiver, process enclosures, Twin diagrams |
| Smoked structural glass | Deeper blue/navy recesses, greater body opacity, reflective crown and softer edge contrast | Neural nodes, medium contribution cube, structural cells |
| Pearl glass | Light/white face body with visible reflective gradients and darker adjoining faces | Selected Home cells and light-theme highlights |
| Identity backing | Stable pearl in light mode / deep navy in dark mode; minimal distortion | Logo face only |
| Small contribution | Same hue/material family as the medium cube, with enough opacity/edge difference to remain visible while nested | Philosophy and Culture’s second contribution |

Centralize palette, face roles, roughness, environment gain, edge width, particle colors and glow thresholds in shared presets. Give scenes explicit role overrides rather than independent copied hex values. Preserve a consistent lighting direction and the relationship between pearl crowns, deeper sides and rear attenuation.

Opacity is an art-directed visibility tool. It is not interchangeable with transmission. Physical thickness/refraction should be selective; use a shared environment/render buffer where possible instead of an independent transmission scene pass per cube. Screen-space strokes and particles need CSS/DPR-aware sizing so a phone does not turn bright points into large balls or lose strands through poster downscaling.

The 3D edge glow follows geometry. It does not become a bright UI border around every panel. Physical reflections remain sharper near contact and softer/weaker with distance. Avoid uniform mirror-floor copies and global bloom that destroys dark/light face separation.

## 8. Scene-by-scene direction

Page ownership keeps the story consistent without repeating the same artwork everywhere:

| Page | Primary story / artwork | Supporting UI treatment |
|---|---|---|
| Home | Identity → app previews → connected lot → Alpha → roadmap → Philosophy | Selective compact cards; uncarded titles and main canvases |
| Technology | Neural structure and how MES/SCADA, Twin, AI and Ontology relate | Expand the four preview diagrams into readable architecture/exploration states |
| Intelligence | Preserve the approved dimensional portrait/particle formation and evidence-led explanation | Short evidence/recommendation surfaces with readable labels, no duplicated Home manufacturing sequence |
| Manufacturing | Component formation/scan, Alpha process overview and the detailed thirteen-tank Twin | Preserve the inspector and guided camera; improve screen/board contrast and mobile composition |
| Network | Readable globe and polygon envelope, followed by plants/partnership paths | A few concise supporting blocks; keep illustrative geography distinct from actual sites |
| About | Organisational purpose and the expanded decade roadmap | Continuous timeline with optional detail panels, not ten unrelated cards |
| People & Culture | Head-first contribution, then elbow/palm contribution into Voltron | One short interpretation and meaningful playback controls |
| Commons | Cube-to-root energy and independent canopy response | Keep the tree prominent; short context outside its canvas |
| Partner | Preserve the approved paired-hand/artwork narrative and working enquiry flow | Reuse the surface/particle family; keep real form controls clear and fully functional |
| Enter Lattice / Coming Soon | Identity reference and existing entry choreography | Keep its exact logo/backing/pulse as the authority for the new Home identity face |

### People & Culture

- Keep the head prominent below the Voltron cube, with a human-scale relationship to the hand. The head and clear receiving cube form in parallel from particles.
- A dark medium cube appears within the head, exits through the crown and reaches the receiver center first.
- Only then does the elbow-to-hand form become the active contributor; its palm turns toward the viewer in the requested isometric pose, angled left. Frame/crop at the elbow in both desktop and mobile rather than revealing the source model’s detached shoulder end.
- The smaller cube forms at the palm, travels on a clear arc, enters the receiver and meets the medium cube. Nested transparency must let the contribution remain discernible.
- Prefer an authored elbow/forearm derivative or a deliberate crop envelope over stretching the full arm independently. Verify anatomy, contact, pose and source clearances using the same transform data in renderer and audit.
- Hold the final meaning clearly before any pulse. Do not let both contributions appear to originate from the head.

### Philosophy

- Form the small cube from a coherent wave, with no early wire outline.
- Give it the same shade family as the medium cube.
- Descend through the outer enclosure into the medium cube, settle at its center, and merge through a short inner material/particle response. It no longer rests at the current `.53` top-contact height.
- Remove the unexplained dot/junction effect. Keep only corner nodes that visibly belong to the structure.
- Preserve the newly verified mobile visibility gate: playback starts once a meaningful portion is visible and pauses when it leaves. Add an accessible replay if the final experience otherwise makes the story easy to miss.

### Connected Lot

Keep one part and carrier, five evidence stages and Human Review in the fourth position. Preserve the mobile conveyor-relative-motion treatment. Improve arrival/dispatch with a coherent traveling particle front: particles gather into the same part at Receive, and the outgoing field removes that same surface at Dispatch. Add density through smaller seeded points and narrow bright cores, not larger glowing spheres. Keep evidence synchronized and retain a complete static/reduced-motion view.

### Technology neural network

Keep all 54 nodes and the approximately 20% link reduction (346 displayed source links). Verify that the displayed graph is one connected component. Use the same clear/pearl/smoked face language as Home, with enough body to read cubes in dark mode and darker structural lines in light mode. Only selected paths carry strong moving energy; the full web should not bloom continuously. Preserve the approved layer layout and fixed camera.

### Network globe

Use coherent continent fills with readable coastlines: darker slate/navy land on pearl ocean in light mode, restrained light/blue land against a navy ocean in dark mode. Reduce dots to a secondary texture or remove them. Keep the outer connected polygon shell visually quieter than the land. Long route arcs remain removed. Preserve the single full rotation and settled final state; avoid a permanently spinning globe. Any site markers remain illustrative rather than claims of operating plants.

### Commons tree

Preserve the improved one-cube/tree composition and full in-frame fit. A dense but coherent particle field travels from the cube center to the root/base region and stops there. Separate seeded canopy patches respond with different delays, durations and intensities, leaving pauses and darker foliage between them. Do not extend the energy stream up the trunk into every leaf. The final canopy may retain restrained material glow while the traveling particles settle.

### Manufacturing hero

Particles form the approved component first; only then does a glowing plane scan across it. Make the formation and scan visibly different phases. Preserve material continuity as the front advances, surface-relative particles and a clean completed component. Match light-theme scan contrast to the darker body instead of making the whole artwork brighter.

### Alpha three-tank overview

First capture an identical-time, identical-viewport comparison against the earlier approved image. Inspect card padding, the artwork’s CSS height/aspect ratio, camera envelope, backing-buffer dimensions, adaptive DPR and poster resolution independently. Restore the projected tank/gantry size without clipping the travel envelope. Preserve approved geometry and motion. On phones, show a readable fitted overview and an intentional guided close-up rather than uniformly shrinking the entire line.

### Alpha thirteen-tank / V-Twin

Keep the approved boards, gantry mounting, overview/close-up sequence and inspector. Darken board ink, retain a near-solid light backing and ensure minification does not erase letters. Validate actual rendered text in both themes and guided views. Keep real UI text in DOM wherever possible; texture lettering needs its own screenshot contrast review. Do not shrink all physical objects to recover space consumed by header/controls.

## 9. Shared particle motion language

Use a reusable seeded surface/flow-field system with scene-specific paths:

- Entry: a coherent front approaches and deposits particles onto the target surface.
- Build: points converge with decreasing displacement and become material; geometry/particles share the same reveal field.
- Process: a localized band moves across the existing object; points belong to the operation rather than a random atmosphere.
- Exit: the material releases points into a directed wave, with velocity, depth and lifespan rather than an alpha-only vanish.
- Hold: traveling particles end. Only the expressly approved identity pulse continues.

Borrow wave/trail shaping from `vector-plankton-three-js`, bounded surface reveal from `hologram-effect-threejs`, and short-lived trail rhythm from `trails-in-spiral-threejs`. Keep the site’s controlled blue palette. Do not copy the example’s global neon/plasma composition, per-frame random jitter, unrestricted device pixel ratio or whole-scene bloom. Check licenses before transferring actual code or assets.

Start with shader-driven positions and surface samples. Add GPU texture simulation only if the required motion cannot be expressed with these simpler fields. Share clocks and seeded parameters so replay, screenshots, static posters and QA remain deterministic. Initial working budgets can be approximately 6–10k points for the principal desktop formation and 2–4k on phones, with smaller, brighter cores; finalize against measured frame time rather than maximizing count.

## 10. Mobile, accessibility and layout verification

- Test 360×640, 390×844, 430×932, 768×1024, desktop 1440×900 and 1920×1080, plus landscape and 200% text scaling.
- Compact the mobile header after deliberate downward scroll; retain logo/menu/theme access with 44px touch targets. Expand on upward scroll, keyboard focus, open menus and navigation. Do not hide a focused control or reset an artwork clock when the header changes size.
- Fit each scene to a measured visible viewport minus header, safe areas and controls. Use separate scene framing envelopes; preserve readable object size and intentionally crop only anatomy approved for cropping.
- Keep body text and app-preview labels dark enough in light mode; brighten labels against dark glass. Validate 4.5:1 normal text and 3:1 relevant large text/non-text controls on the final composited surfaces.
- Avoid nested scrolling canvases, tiny floating numbers, controls over important geometry and text that relies on the glow for visibility.
- Pause offscreen and when the document is hidden. Respect reduced motion and Save-Data; show the completed narrative meaning with no compulsory spin or particle loop.
- Regenerate opening/completed posters after geometry/material changes. Check the first live frame against its loading image at desktop and phone sizes. Preserve clock continuity during handoff.
- On slower devices reduce decorative point density, shadow resolution or optional reflections before shrinking the industrial scene or removing its meaningful geometry.

## 11. Ten-year roadmap: content and animation

Use the supplied strategy as a source, with the user’s Year 5/7/10 ambition made explicit. Count years from the start of operations, not from an invented calendar launch date. Present the roadmap as a proposed direction with evidence/readiness gates, not a statement that future capability, certification, exports or brand recognition already exist.

| Period | Visitor-facing milestone | Proposed capability / readiness evidence | Artwork state |
|---|---|---|---|
| Years 1–2 | Prove the process | Repeatable process results, traceability, safe operation, measurement and quality discipline in Alpha | One substantial process/plant cell forms; the shared part travels through it and returns with a verified record. |
| Years 3–4 | Connect and reproduce capability | Connected production/quality/machine records; reusable methods and independently operable deployments | The first cell seeds a small lattice. Records and selected app diagrams connect the cells. |
| Year 5 | Begin the OEM transition | A validated customer problem, original engineering program, design/test/manufacturing traceability and a credible product path | Accumulated process cells assemble a new product silhouette. A central engineering/product cell becomes the focus. |
| Years 6–7 | Compete through original products | Customer validation, reliable quality, support capability, controlled intelligence and selected global-market readiness | The product and its evidence connect to a small, readable global field. Year 7 is the clear global-competition milestone. |
| Years 8–10 | Establish a global brand | Repeat demand, sustained product quality, original capability and dependable lifecycle support | The field resolves into a coherent Voltron lattice/identity, with geography subordinate to product and trust. Year 10 is the global-brand ambition. |

“World-class quality by Year 5” should be expressed through verified readiness criteria, not an unsupported badge. Define appropriate process capability, measurement, traceability, customer qualification and quality-system evidence during implementation/content review; do not invent certification or numerical performance claims.

Roadmap presentation:

- Homepage: one continuous structure with four/five readable milestone states, ten subtle year ticks and a short proposed-roadmap caption. Avoid ten equally weighted cards.
- About: expand the same data into the full ten-year sequence and readiness criteria. One shared data source prevents conflicting dates or milestones.
- Desktop: a fixed, modest camera follows changes in the structure; the year cursor changes with scroll or explicit selection. Text remains DOM and is not painted into the canvas.
- Mobile: one milestone/artwork state at a time, with an accessible labelled selector and ordinary page scrolling. Never compress a ten-year horizontal diagram into a phone.
- Use one bounded transition between states. Scrubbing should seek a deterministic state rather than launching overlapping animations. Reduced motion swaps complete milestone states with a brief dissolve.
- Product identity, factory expansion and brand recognition are distinct stages. Do not make global branding appear to be merely a larger globe or a bigger logo.

## 12. Implementation order and completion gates

1. **Lock the current brief and source truth.** Preserve pending work, document which earlier directions are superseded, reconcile local/publication state and establish representative baseline captures.
2. **Fix page hierarchy and surfaces.** Replace the redundant three-view section with the four previews; simplify shell/card boundaries and reclaim mobile header/canvas space. Gate: understandable page flow with all artwork temporarily still.
3. **Finish shared materials and identity face.** Centralize cube presets, exact Enter face and volumetric pulse. Gate: one review sheet comparing Home, Culture, Philosophy, neural and process cubes in both themes.
4. **Implement the approved Home choreography.** Four base cells, 8+27 fragments, depth retreat, two turns, particle rounding and exact front stop. Gate: timed desktop/mobile storyboard, no logo obstruction and no offscreen work.
5. **Finish scene narratives.** Culture elbow/palm/proportion/sequence; Philosophy center merge; tree root energy/canopy patches; globe land surfaces; manufacturing formation/scan. Gate: each story is understandable without explanatory labels.
6. **Restore Alpha quality and label contrast.** Use the matched baseline comparison, then validate overview/close-up behavior on short screens. Gate: readable tanks, carrier and boards at agreed display sizes.
7. **Build the roadmap from shared content data.** Establish static milestone states before scroll choreography. Gate: Year 5/7/10 ambitions and readiness criteria are clear without animation.
8. **Bounded final verification and release.** One batched desktop/mobile/theme review, one consolidated repair batch and one confirmation pass. Run appropriate type/build/unit, route, accessibility, motion lifecycle and performance checks. Refresh all affected posters, verify the resulting deployment and report its actual status.

No new dependency is justified solely to add glass, particles or a roadmap. Evaluate a library only against a specific missing capability, installed Three.js compatibility, licence and measured rendering cost.

Proposed ownership of the changes:

- `app/page.tsx`: replace the three-perspective section, retain Connected Lot and introduce the compact roadmap in the agreed order.
- New `ApplicationPreviews` component and shared preview data: four semantic DOM/SVG screens, a single particle reveal layer and mobile selection.
- `hero-timeline.ts`, `home-reveal-renderer.ts` and a small identity-cube helper: 8/27 cell specifications, depth trajectories, accumulated two-turn rotation, rounding and exact front face.
- `lattice-materials.ts`, `home-glass.ts` and scene tuning: shared optical roles with explicit scene overrides.
- `SiteHeader.tsx`, `presentation.css`, `home-surfaces.css`: compact navigation, quiet shell and selective card roles.
- Hand/Philosophy/tree/globe/Alpha renderers: bounded, scene-specific changes with their existing geometry and working controllers preserved.
- Shared roadmap data plus DOM selector and a renderer/timeline: one source for Home and About, deterministic seeking and reduced-motion states.
- Poster capture and continuity scripts, visible captions and accessible descriptions: updated together with the rendering changes, not as a later cosmetic task.

### Library / rendering choices checked

The installed project uses Next 15.5.28, React 19.0.0 and Three.js 0.186.1. Preserve this stack. Existing Three.js physical materials, surface sampling, shader uniforms, shared environment maps and the current deterministic controllers cover the proposed work.

[Three.js physical-material documentation](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) distinguishes opacity from transmission, recommends an environment map and notes the extra cost of advanced material features. Select a clear visibility treatment or physical transmission deliberately; when enabling transmission, follow its opacity requirements rather than stacking contradictory settings.

[Drei transmission documentation](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material) confirms an extra scene pass and supports shared buffers, adjustable resolution and samples. A vanilla adaptation is an option for one important hero surface only if the current implementation cannot meet the visual target. It is not a reason to migrate the site to React Three Fiber or give every cell a separate expensive pass.

Use the existing timeline system for the two turns and roadmap seeking. SVG/DOM is the first choice for app diagrams; CSS handles foreground card frost and header motion. Add selective postprocessing only after a measured comparison shows a specific gap. Preserve antialiasing and text/edge clarity if a compositor is introduced. Do not add GSAP, a globe library or a GPU simulation package simply to reproduce behavior already supported by the project.

## 13. Required review artifacts before publishing

- A 0/2/4/6/8/10/12/14-second Home storyboard, plus a short captured playback proving two complete turns.
- A cube/material comparison sheet in both themes, including the exact entry/hero logo at equal ink size.
- Culture frames showing head formation, first contribution at center, elbow/palm formation, second delivery and merged final state.
- Philosophy frames proving center entry/merge and removal of the unexplained dot.
- Globe land/ocean contrast and polygon-envelope comparison; tree root-only energy and independent canopy response.
- Identical-state Alpha before/after captures and rendered board-letter contrast checks.
- Four app preview layouts and roadmap milestone states at desktop, short phone and reduced-motion settings.
- Updated static/live parity evidence, no horizontal overflow, accessible controls, no unexpected background rendering, and a verified live release identifier.
