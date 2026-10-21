# Voltron Lattice design audit

Date: 20 October 2026.
Scope: current founder website, supplied light/dark mockups, latest written brief, and the previously reviewed eleven GitHub references.
This is an audit and proposal. Website implementation was not changed.

## Executive judgment

The identity is coherent: restrained Montserrat, leaf-circuit mark, blue junctions, transparent cubes and manufacturing language. The site has a stronger foundation than its current unfinished appearance suggests.

The largest problems are missing secondary-page artwork, repetitive viewport-height sections, an inconsistent page shell and mobile diagrams that lose their overview. More blur, glow or larger headings will not resolve these.

Recommended direction: one quiet presentation surface, precise editorial spacing, and expressive glass sculptures. The light mockup provides restraint and hierarchy; the dark mockup provides material depth. Preserve approved geometry rather than reconstructing it from generated images.

## Evidence and limits

- Captured all ten canonical pages at 1440 x 900 and 390 x 900 in light and dark: 40 page captures.
- Scrolled each page and inspected screenshots, route structure, styles, asset loading and motion-controller source.
- No document-level horizontal overflow was detected in those 40 views. The lot diagram intentionally scrolls internally.
- Checked empty artwork separately because an empty reserved slot does not generate a broken-image error.
- Screenshots use reduced motion to assess completed compositions. Normal-speed timing, frame rate and pointer lighting were not remeasured in this audit.
- No fresh 768/1024px, exhaustive keyboard, screen-reader, contrast or form-submission certification was performed.
- No production Lighthouse or real-user Core Web Vitals measurements were taken. Development-server speed is not a production performance result.
- Earlier successful checks are historical evidence, not a fresh accessibility or deployment sign-off.

## Prioritized findings

### P1: 37 artwork slots are empty across nine secondary pages

The loader discovers immediate subdirectories containing `asset-manifest.json`. There are currently no such manifest files anywhere under `public/Brand Assets`. `BrandArt` consequently returns reserved, dashed empty slots for all of the families below.

| Page | Empty slots |
| --- | ---: |
| Home | 0 |
| Technology | 6 |
| Ontology | 3 |
| Intelligence | 2 |
| Manufacturing | 8 |
| Network | 3 |
| About | 7 |
| People Culture | 5 |
| Commons | 2 |
| Partner | 1 |

Impact: key explanations disappear, including the architecture and modular configuration illustrations. Users encounter unfinished-looking spaces even though the routes and text load.

Action: inventory the actual files, map available assets explicitly to their families and themes, and identify genuinely unavailable artwork separately. Do not fill gaps with unrelated imagery. Add a release check for required asset families, not merely image HTTP failures.

Evidence: `lib/brand-assets.ts:19`, `components/brand/BrandArt.tsx:8`; `.audit-logs/design-review-assets.json`.

### P2: the mobile manufacturing story has no immediately visible overview

The homepage lot track has a minimum width of 880px below 768px. At 390px, visitors initially see Receive and only part of Process. Verify and Dispatch require horizontal scrolling. Technology also hides its architecture illustration at mobile sizes.

Action: use a compact four-stage HTML overview above a mobile conveyor, or a vertical mobile sequence. Preserve visible stage names and meaning without requiring motion. Replace the hidden architecture image with a simplified responsive diagram rather than leaving only selectors.

Evidence: `app/home.css:104`, `app/globals.css:204`.

### P2: viewport-height sections flatten the information hierarchy

At 1440 x 900, the homepage hero, systems and text-only Alpha each occupy 754px. Alpha occupies 806px at 390 x 900, despite containing only a heading, short paragraph and link. The homepage is 4,266px tall on desktop and 5,102px on mobile.

This follows the earlier full-screen direction, so it is a design tradeoff rather than an accidental regression. It gives reflective artwork room, but makes brief explanations feel empty and gives them the same weight as complex scenes.

Action: retain near-viewport treatment for the signature hero and philosophy. Make Alpha and short closing sections content-sized. Let systems and diagrams determine their own height. Starting point: 64-88px desktop section padding and 40-56px mobile, then tune to actual content.

Evidence: `app/globals.css:54`; `.audit-logs/design-review-results.json`.

### P2: the homepage and secondary pages use visibly different design systems

Home has an inset rounded presentation frame, graphite/pearl surface and modified navigation controls. Technology and other routes remain edge-to-edge, with different header treatment and, on Technology, a background grid. The transparent header logo substitution applies only to Home; other headers and the footer retain rectangular logo assets.

Action: settle on one shared presentation shell for normal website pages and consistent transparent logo treatment. Apply shared color, corner, header and spacing tokens. Keep coming-soon and the optional entry experience separate. Preserve content-specific compositions inside that shell.

Evidence: `components/brand/SiteShell.tsx:17`, `app/home.css:13`, `components/brand/BrandLogo.tsx`.

### P2: the settled lattice lacks the material clarity of the mockups

In the captured resting compositions, pale edges and relatively uniform faces carry most of the structure. Compared with the mockups, exposed-face reflections and contact shading are weaker. Dark-mode logo details compete with the surrounding blue glass; the system illustrations occupy relatively small areas within their enclosures.

Action: keep the seven-cell arrangement and camera. Tune exposed-face reflections, top/side contrast, near/far edge hierarchy and a tight ground contact shadow. Keep local logo separation feathered and small. Fit each system asset by its visible alpha bounds, allowing margin inside the enclosure. Do not enlarge all images by one arbitrary percentage.

The target is clear volume and a recognizable mark at mobile size. Constant bright nodes or heavy bloom would obscure those improvements.

### P2: the commercial journey is weaker than the visual story

Home's approved button-free hero is clean, but its first two sections contain no direct route into the architecture. The next in-content link is Explore manufacturing in Alpha. A new visitor must interpret the header to choose a technical next step.

Action: retain the button-free hero and place a restrained "Explore the architecture" link after the three capability illustrations. Alpha leads to Manufacturing; Philosophy leads to Culture; an understated closing partnership action can complete the journey. This is a proposal, not permission to restore previously removed hero buttons.

### P3: glass is present technically, but its optical effect is weak

Home uses 28px backdrop blur over a smooth matte gradient, with a high-opacity foreground tint. There is little backdrop detail to blur, so the surface reads as satin or translucent paint. This is expected from the composition, not a broken CSS filter.

Action: retain one surface. Use a directional rim highlight, subtle tonal variation and restrained edge depth. Keep the center quiet for reading. Use genuine refraction only in the Three.js artwork or a small justified control treatment; full-page WebGL refraction would add considerable complexity.

### P3: asset weight merits a targeted optimization pass

The three system PNG sources total approximately 3.06MB: robot 0.85MB, context 0.98MB, brain 1.24MB. They are loaded as raw images/textures.

Action: preserve originals, generate appropriately sized transparent derivatives, compare detail at actual mobile/desktop sizes, and measure network transfer and GPU texture use. Compressed file size alone does not establish decoded memory or a Core Web Vitals failure.

### P3: the brief and implementation notes contain contradictory design authority

The latest attached brief specifies Montreal, hero CTAs, a five-second sequence and content-driven heights. Earlier direct decisions establish Montserrat, no hero CTAs and a longer assembly/settle sequence. `DESIGN.md` also retains historical statements about background grids and old asset directories alongside newer decisions.

Action: consolidate approved current rules in one short authoritative specification. Preserve Montserrat and approved geometry. Treat CTA, timing and rhythm changes as explicit design decisions. The brief mentions Strategy, but the current route set has no separate Strategy page; decide whether About/Network carry that story before adding navigation.

## What already works

- The brand proposition and human-centered signature are distinct and consistent.
- Hero text remains native HTML and does not depend on WebGL loading.
- Shared cube geometry and fixed cameras provide continuity across the custom scenes.
- Reduced-motion compositions remain intelligible in the captured views.
- Source includes lazy scene initialization, visibility-aware activity and quiet idle periods.
- Navigation source has current-page states, disclosure buttons, Escape handling and focus return.
- The type scale is restrained. Larger headlines are not the main missing ingredient.
- Text-only Alpha avoids confusing conceptual artwork with evidence of an operating facility.
- Network and Commons include useful language identifying future/developing directions.
- Both themes retain readable overall hierarchy in the reviewed captures.

## How to use the supplied references

| Reference | Useful principle | Voltron application |
| --- | --- | --- |
| Light mockup | Clean reading space, clear hierarchy, pale reflective volumes | Main composition and daylight material reference |
| Dark mockup | Stronger cube depth, cyan junctions, grounded sculpture | Local artwork lighting; moderate the all-over blue glow |
| themesberg/glass-ui | Reusable component organization | Component structure, not proof of an advanced glass renderer |
| NanKillBro/glassy-music-nankill | Immersive desktop mood and layered effects | Inspiration for the separate brand entry; too visually active for explanatory pages |
| AmreshSinha/glassFolio | Straightforward content grouping and translucent containers | Simple reading hierarchy; avoid turning every section into a portfolio card |
| crenspire/glass-ui | Distinct glass materials, optical rendering and CSS fallback | Material vocabulary and optional small-surface experimentation |
| glincker/glinui | Explicit light/dark glass levels and tokens | A shared surface recipe with predictable contrast |
| snail-z/DawnTransition | Interruptible gesture-aware transitions | Motion behavior reference; its native Swift implementation is not a web dependency |
| samabid/3d-portfolio | React/Three scene organization and progressive loading | Scene lifecycle ideas; preserve Voltron's current working renderer |
| ladunjexa/reactjs18-3d-portfolio | Canvas boundaries, loading, DPR and demand rendering | Performance patterns; do not copy its desktop-only scene decision |
| Laniman/threejs-brain-animation | Local signals traveling through connections | Meaningful connection highlights and an eventual intelligence scene |
| pmndrs/react-three-fiber | React integration for Three.js | Consider only if future scene complexity justifies migration |
| ykob/sketch-threejs | Material and render-target experiments | Selective reflection/refraction study, not wholesale adoption of an older stack |

Primary references: [Crenspire](https://github.com/crenspire/glass-ui), [Glin UI glass physics](https://glinui.com/docs/glass-physics), [Laniman](https://github.com/Laniman/threejs-brain-animation), [React Three Fiber](https://github.com/pmndrs/react-three-fiber), [ykob](https://github.com/ykob/sketch-threejs).

## Proposed finished direction

One restrained presentation surface contains the website. Glass depth is strongest in the sculptures, moderate at navigation, and quiet behind reading content. Pearl-white light mode and charcoal dark mode share geometry and hierarchy. Blue and cyan communicate connection and interaction.

Use the current Montserrat weights and moderate headline scale. Maintain a consistent content anchor and paragraph measure; do not import the mockup's enlarged headings simply because its artwork is stronger.

Three surface roles are sufficient: the continuous page surface, a denser navigation surface, and opaque-enough menus/forms. These are functional roles, not three decorative background layers.

The logo stays exact and crisp. Reflection quality, selective illumination and contact shadows establish depth. Preserve the separate compositions: Home as assembled manufacturing structure, Technology as connected core, Commons as growth from a foundation, Culture as careful placement.

## Page-specific ideas

| Page | Recommended design move |
| --- | --- |
| Home | Keep the signature hero. Compact Alpha, improve mobile process overview, and add the architecture path after the capability section. |
| Technology | Restore the architecture and modular assets first. Show a small persistent architecture overview on mobile beside or above the detail selector. |
| Ontology | Explain one part/lot through identity, process and evidence, with a consistent selected entity across diagrams. |
| Intelligence | Preserve QMS/AI/HITL as distinct sections. Carry a clearly labelled illustrative evidence example through them to clarify their relationship. |
| Manufacturing | Restore process illustrations and label conceptual imagery. Keep operational readiness separate from future capability claims. |
| Network | Visually distinguish direct manufacturing, future partnerships and industrial-product development without adding three competing hero scenes. |
| About | Tighten the leadership area; do not give two "Profile coming soon" entries equal visual weight to completed information. |
| People Culture | Keep the approved hand placement. Use one cell scale and consistent glass treatment, with a quiet lower-page layout after the hero. |
| Commons | Preserve the dominant opened emblem and airy lower lattice. Keep proposed programs explicitly described as developing directions. |
| Partner | Reduce the introductory distance to the forms. Make the two inquiry intents easy to choose on mobile and retain clear submission feedback. |

## Recommended execution order

1. Restore and verify required asset mappings across all ten pages.
2. Resolve mobile conveyor/architecture overviews and excessive sparse-section height.
3. Normalize the page shell, navigation, logo transparency and theme tokens.
4. Tune Home and Technology resting materials against identical-size light/dark captures.
5. Apply that material recipe to Culture, Commons and smaller cube scenes.
6. Improve contextual links and clarify unfinished/future content.
7. Verify normal motion, reduced motion, keyboard flows, forms, 390/768/1024/1440 layouts and a production performance build.

Acceptance: no required empty artwork slots; all four lot stages understandable on mobile; stable page identity between routes; logo remains crisp at rest; purposeful section heights; and measured accessibility/performance results reported separately from design judgment.

## Review artifacts

- ` .audit-logs/design-review-results.json`: 40 responsive/theme measurements.
- ` .audit-logs/design-review-assets.json`: verified missing family IDs by route.
- ` .audit-logs/hero-comparison.png`: current Home, Technology, Culture and Commons dark heroes.
- ` .audit-logs/secondary-review.png`: six current secondary-page compositions.
- ` .audit-logs/review-*.png`: individual full-page captures.
