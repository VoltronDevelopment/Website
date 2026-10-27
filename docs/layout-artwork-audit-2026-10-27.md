# Layout, artwork framing and responsive audit — 27 October 2026

**Audit and discussion only. No application layout, geometry, particle settings, content or unfinished sections were changed.**

The existing Voltron direction remains appropriate: continuous pearl/navy atmosphere, selective glass reading surfaces, manufacturing artwork, restrained typography and alternating compositions. The main problem is uneven responsive framing and optical hierarchy, rather than a need for a new visual identity.

## Evidence and limits

- Audited the current production renderer build `3xUzVCqi_17zmbuSkivdU`.
- 150 route/viewport/theme measurements across ten marketing pages. Widths: 320, 390, 430, 767, 768, 820, 900, 901, 1024, 1280, 1440 and 1920px. Light mode at all sizes; dark mode also at 390, 820 and 1440px.
- 36 live captures examine Culture head formation, arm formation, palm contribution, completed composition, Intelligence portrait formation and the supporting helix, at 390/820/1440px in both themes.
- The geometry/layout pass used completed static artwork to avoid motion changing measurements. Live studies separately verify intermediate poses. Browser measurements are software-rendered Edge evidence, not hardware GPU performance certification.
- No horizontal document overflow or browser errors occurred in these 150 layout cases. Two 320px controls have content wider than their own box. Lack of document overflow does not prove that artwork is framed well: the presentation also clips overflow, and individual control/scene content can still be cramped.
- Evidence: `.audit-logs/layout-audit-20261027/measurements.json`, `hero-metrics.csv`, `live-studies.json`, `desktop-overview.png` and `tablet-overview.png`.

## Principal findings

### 1. Tablet hero layouts diverge because artwork direction controls the breakpoint

`components/brand/hero-art-direction.css` stacks artwork-on-left heroes at 900px, while the general hero family switches at 767px. The intended alternating desktop composition therefore changes the tablet layout strategy.

At **820px**:

| Split columns | Stacked |
|---|---|
| Home, Intelligence, Network, About, Commons | Technology, Manufacturing, Ontology, People & Culture, Partner |

Home copy gets approximately 300px beside a 398px artwork slot, while Technology receives a 714px full-width stage. Home's heading wraps to four lines; the page beside it feels like a different responsive system. People becomes a 1,073px-tall hero, while Intelligence's hero element is 544px before its separate principles strip. At 900→901px, the left-art pages abruptly switch from tall stacked compositions to split compositions.

**Proposed decision:** use one stacking breakpoint for all heroes, independent of artwork side. Start with **1024px and above split; 1023px and below stacked**, then validate 1024px copy measure before locking it. Keep text first in the mobile/tablet DOM and visual flow. Alternation remains a desktop art-direction choice.

### 2. Desktop stage heights and copy anchors drift

Measured at 1440×900, normal text size:

| Page | Hero element height | Artwork wrapper height | Heading top from viewport |
|---|---:|---:|---:|
| Home | 712px | 540px | 326px |
| Technology | 712px | 540px | 338px |
| Intelligence | 644px | 580px | 348px |
| Manufacturing | 712px | 540px | 338px |
| Network | 712px | 540px | 338px |
| Ontology | 712px | 540px | 313px |
| About | 712px | 540px | 313px |
| People & Culture | 840px | 620px | 424px |
| Commons | 780px | 490px | 372px |
| Partner | 722px | 570px | 331px |

**Interpretation:** Intelligence's principles are outside its Hero element, unlike most siblings, so its 644px figure is not a directly comparable whole-intro height. People and Commons include breadcrumbs. These structural differences explain some variation but do not produce consistent visual anchors. People artwork starts lower and pushes the headline roughly 86px below Technology's headline. The copy group is vertically centred by its full height, so a longer paragraph also moves the heading upward.

The outer container is already largely consistent: 1,120px content width, the same 43:57 desktop copy/art proportions, a 24px gap and 36px headings at 1440px. Preserve those strengths.

**Proposed decision:** one hero frame and one principles-strip contract. Standardize breadcrumb allowance without adding an extra full row to only two scenes. Use a common eyebrow/heading anchor zone and allow paragraph/actions to flow below it. Do not fix text block heights in ways that clip longer copy or text zoom. Retain deliberate line breaks and readable copy measures.

### 3. Fixed stage heights are poorly related to shorter viewport heights

At 1280×720, a typical 712px hero begins below an 80px header and the page surround; its bottom lands near 816px. People lands near 944px. This is vertical document scrolling, not horizontal overflow, but the first presentation cannot be viewed as one composed frame on a common laptop.

At 390×844, hero elements range from approximately 803px to 1,050px. Commons artwork begins around y633, leaving only a partial first-fold view. At 320px there is a 250px-wide content area, so long headings/actions naturally increase vertical length.

**Proposed direction:**

- Desktop: use a height-aware stage, starting around `clamp(420px, calc(100svh - 300px), 560px)`, with enough room for real text, header and principles. This is a prototype range, not an approved final token.
- Tablets: stacked copy plus a bounded 380–460px artwork stage; center the artwork within the full container rather than stretching its geometry.
- Phones: naturally scrolling copy, actions and a 300–380px artwork stage. A portrait-shaped People composition may need the upper end. Keep the entire artwork silhouette and controls inside its frame.
- Short landscape screens: shrink excess stage whitespace first and allow ordinary page scrolling. Preserve readable text and touch targets.
- Treat scene projection, object scale and canvas dimensions separately. A cube, a globe, a wide neural network and a tall head/arm arrangement should have equal visual authority, not equal raw world-unit scale.

### 4. Two narrow controls need local wrapping fixes

At 320px:

- Manufacturing: the **Intelligence** control has 74px scroll width inside a 66px client box.
- Network: **Direct manufacturing** has 91px scroll width inside a 78px client box.

These do not widen the document, but the labels overrun their allocated control space. Use wrapped labels or an earlier control-grid reflow, while preserving minimum 44px touch targets. Do not solve this by reducing type indiscriminately or hiding the overflow.

### 5. Section rhythm is continuous but insufficiently differentiated

The shared presentation intentionally removes section borders and backgrounds. Page-specific CSS then alternates 80/88px desktop spacing, 64/88px tablet spacing and 48/56px phone spacing. Some adjacent sections have the same background, similar heading weight and no clear change of chapter. A continuous page can still have distinct sections.

**Proposed rhythm:** one default **80/64/48px** section padding family for desktop/tablet/phone, with an explicit major-chapter variant where needed. Pair consistent heading-to-content spacing with a broad, low-opacity surface-tone change or soft shadow at significant chapter transitions. Keep hero titles and main artwork open. Use glass only for short reading/action surfaces. Avoid bright boundary rules and a card around every section.

Manufacturing uses custom `alpha-explore` and `alpha-architecture` sections as well as the shared Section component; Intelligence also wraps its hero/principles differently. Include these in the same chapter-spacing rules rather than relying only on `.section` selectors.

**Scope boundary:** preserve the existing contents, arrangements and interactions of unfinished sections. Their labels are not sufficiently explicit in the repository to identify every unfinished block with certainty. The next pass should therefore be limited to shared framing, spacing, fit and the named artwork corrections; defer section-specific redesigns.

## People & Culture: the story order is right, but the pose is incomplete

Verified live:

- Head and outer Voltron enclosure form together.
- The medium contribution comes from the head.
- The arm forms later, and the smaller contribution has a distinct palm origin.
- Both arrive at the same Voltron centre.

The final image still shows a long upper-arm/biceps mass and a conspicuous flat cut-off top. The requested **elbow-to-palm** crop is not actually enforced in the offline asset preparation: `scripts/build-human-sculptures.mjs` loads and normalizes the whole arm, and currently has no elbow-specific trim. A comment about compacting geometry "after crop" is not evidence that such an arm crop happens.

`cultureArmPose` also uses a non-uniform scale of **5.2, 4.42, 5.2**, compressing one anatomical axis by about 15%. The hand reads as angled down toward the enclosure more than as a clearly viewer-facing, three-quarter palm. The palm contribution sits close enough to the wrist/hand silhouette that its source could be more legible.

The head is below the cube in world space, but its crown and the lower cube face overlap in the projected image. On a phone, the hand is small while the upper arm occupies a disproportionate amount of space. The light-mode outer enclosure is also much closer to a wireframe than the Home hero's face-rich glass treatment.

**Recommended correction:**

1. Identify the elbow in the approved source asset and crop above that joint offline, preserving the forearm, wrist, fingers and a natural elbow termination. Use a short particle fade at the cut rather than a prominent flat cap.
2. Restore uniform anatomical scaling. Recompose the camera and object positions to fit the shorter silhouette.
3. Rotate around the forearm axis until palm, thumb and fingers are legible from the hero camera; verify with a solid-geometry study before particles. The final palm should be a restrained three-quarter view toward the user.
4. Keep the head visually prominent below the outer cube. Start with roughly 16–24px projected clearance on desktop / 10–16px on phones between the crown and the cube's lower visual edge, then verify the full motion path.
5. Keep one medium head-origin cube and one smaller palm-origin cube. Make the palm-origin hold clear before its transfer begins.
6. Use the established pearl/smoked per-face glass on the outer enclosure, with enough light-mode contrast to show volume. Keep the inner contributions darker and quiet.
7. Fit the corrected scene into the shared hero frame; do not solve the scene by making the whole People hero taller.

These are proposed corrections, not edits to the approved source assets in this audit.

## Particle density: apparent density needs attention before blanket count increases

Counts below are allocated samples, not the number simultaneously visible at a given frame:

| Artwork | Desktop | Phone | Assessment |
|---|---:|---:|---|
| Home transport | 2,800 | 2,800 | Fine detail; strengthen only the active arrival/retreat band if needed |
| Connected Lot | 2,800 including lag samples | Same | Surface deposit/release reads well; preserve one-part continuity |
| Philosophy contribution | 720 | 720 | Sparse active ribbon at small screen size; a focused pilot for more visible formation |
| Neural formation | 2,592 | 2,592 | Small samples across 54 nodes; prioritize their formation front and selected signals |
| Intelligence portrait | 64,000 | 48,000 | Already dense; improve incoming-current visibility and surface handoff |
| Culture head | 20,000 | 10,000 | Face itself forms densely; incoming paths are thin/brief |
| Culture arm | 22,000 | 11,000 | Fix crop/pose first, then resample the retained anatomy |
| Culture helix | 4,800 | 2,400 | Fine line-like strands; light-mode strand contrast can increase modestly |
| Manufacturing bracket | 18,000 | 9,000 | Keep the part silhouette and scan plane as the primary reading |

The supplied references show why counts alone are misleading:

- [Codrops noise-point source](https://raw.githubusercontent.com/jackrugile/3d-particle-explorations/master/js/demo-8/system.js) uses 8,000 points, additive blending, disabled depth testing, a radial sprite and changing point sizes. Its full-screen luminous impression is strongly influenced by those choices.
- [Three.js wave source](https://raw.githubusercontent.com/mrdoob/three.js/master/examples/webgl_points_waves.html) uses a 50×50 grid (2,500 points), perspective-scaled point sizes and coordinated wave displacement.
- [Codrops helix source](https://raw.githubusercontent.com/jackrugile/3d-particle-explorations/master/js/demo-4/system.js) uses 48 bead objects plus 24 rungs; our supporting helix intentionally uses much finer sampled ribbons.
- The local spiral study adds bloom and bright trailing structures. The local vector-plankton study uses SVG-driven sampling. Both are useful motion references, but their rendered footprint and glow cannot be compared directly with a small Voltron canvas.

In the new live Culture captures, the anatomical deposit front has many fine points, but free incoming samples are isolated and faint, especially in light mode. Finished opaque geometry takes over early in already-deposited areas, so a dense buffer can still produce a sparse-looking incoming wave.

**First pilot:** keep counts initially stable; widen the active transport band modestly, retain a denser bright core within each ribbon, extend its visible approach/deposit overlap, and give light mode a darker blue core with a small bright highlight. Keep depth occlusion and the approved palette. Compare matched frames and CSS display sizes. If this is still insufficient, increase targeted transport samples by an initial 15–25% where profiling allows, rather than increasing every anatomical surface or enabling additive blending everywhere. Avoid large glowing balls or a washed-out face.

## Background review

The backgrounds are not generally empty: the fixed lattice, wash, veil and scene-local light fields are already present. Large background cubes can compete with the smaller neural nodes in light mode. Improving object scale and the local contrast pocket will often help more than adding another effect.

| Page | Recommended background/artwork treatment |
|---|---|
| Home | Retain current atmosphere; keep the identity area clear and use ground light/reflection for depth |
| Technology | Soften/mask background lattice behind the neural silhouette; a brief fine directional current can reinforce formation |
| Intelligence | Keep a quiet contrast pocket behind the portrait; scan-relative motes only during scans; preserve one portrait |
| Manufacturing | Restrained floor light and a surface-bound deposition tail; avoid dust over the headline or plant boards |
| Network | Retain the readable globe, atmosphere and polygon envelope; no route arcs or additional dense background network |
| Ontology | Small selected-record pulses can use existing paths; preserve the current section content and layout |
| About | Use material/ground-light depth around the existing structures; no extra continuous emitter |
| People & Culture | Correct the arm crop and camera first; local head/palm currents, with clear negative space around the face |
| Commons | Root-bound fine energy and independent canopy response; keep the surrounding space calm |
| Partner | Restrained exchange/contact response around the approved hands; keep forms visually quiet |

A useful default is **static shaped light plus transient story-driven particles**. Finished scenes stay still apart from Home's approved identity pulse. Do not add a new global WebGL background or looping particle effect to every section. `examples/glowing-background-threejs` is actually an HTML/CSS glow example in this workspace, so a low-cost CSS light field is also available as a technique reference.

## Proposed implementation order after discussion

1. **Shared layout pass:** one breakpoint policy, common hero/copy/principles framing, short-laptop height fitting, unified section spacing and the two 320px control fixes. Preserve unfinished sections.
2. **Optical framing pass:** compare actual object silhouettes, camera bounds and text clearance at 390/820/1024/1440px, rather than setting every object to the same raw scale. Refresh matching posters when projection changes.
3. **People correction:** elbow crop, uniform proportions, viewer-readable palm, projected head/cube clearance and outer-cube glass faces, with the established contribution order unchanged.
4. **Density/background pilot:** Philosophy and Culture first; tune active-band visibility and local contrast before adding samples. Apply successful settings selectively to other scenes.
5. **Verification:** breakpoint boundaries, 320px controls, tablet portrait/landscape, 1280×720 laptop, 200% text, keyboard controls, light/dark, live/poster matching, reduced motion, silhouette clearance and horizontal overflow. Retest loading/formation/scan/settled phases, not just completed artwork.

No push, deployment or application implementation is included in this audit.
