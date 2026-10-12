# Voltron Lattice: Accepted Rebrand and Asset Audit

Accepted by the user on 12 October 2026. The revised public implementation is now in place; see DESIGN.md for the canonical runtime design contract.

## Authority

The user's supplied Voltron-Lattice-UI-Specification.md, ten page mockups and accompanying page-specific artwork/motion notes are accepted. They supersede conflicting instructions in VOLTRON-LATTICE-UI-PLAN.md and the previous dark-first Git-parity direction. The specification resolves inconsistencies in generated mockups; page-specific interaction notes describe the intended behavior. Later direct user instructions take precedence.

Source specification: C:/Users/Omkar/Downloads/Voltron-Lattice-UI-Specification.md.

Source motion notes: C:/Users/Omkar/.codex/attachments/ed8b188a-c102-4a18-9722-158a87a2b795/Pasted text.txt.

## Accepted Foundation

- Ten public routes: /, /technology, /ontology, /intelligence, /manufacturing, /network, /about, /about/people-culture, /about/voltron-commons, /partner.
- Preserve existing admin access and backend inquiry behavior during the public-site redesign.
- Light canvas #F3F5F7, white surfaces, navy text #132A42, secondary text #526F87, brand blue #246BD4 and restrained cyan #2894BC.
- Shared maximum content width 1120px. Inter 400 for main typography; desktop H1 34/42px, H2 26/34px, body 16/25px. Follow the specification's responsive sizes and gutters.
- Natural document scrolling, content-driven section heights, consistent footer and controls, flat sections and restrained separators.
- One approved logo asset. Never extract or redraw a production logo from a generated mockup. Supplied hero growth/circuit artwork is an illustration, not the official logo lockup.
- Founder copy: Omkar Todkar, Founder & CEO; IIT Madras, B.Tech + M.Tech. COO and CTO profiles remain coming soon. Use the exact LinkedIn destination supplied in the specification.
- Canonical complete Production and Partnership forms on /partner. Success follows actual backend acknowledgment.
- Follow all page content, technical corrections, semantic responsibilities and developing-program status in the accepted specification.
- One short hero reveal/assembly, then still; explanatory sequences primarily use visitor-controlled selection or steps. Honor reduced motion and retain equivalent static meaning.
- Actual plant imagery when supplied; otherwise clearly labeled conceptual process artwork. Powder coating is a dry process. Reuse supplied assets with their aspect ratios preserved.

## Asset Snapshot

Folder: public/Brand Assets. Checked 12 October 2026. Three batches and the approved logo directory are currently present.

Each batch contains five asset families in light and dark variants: ten SVGs, twenty PNG exports at 1x/2x, a preview, a manifest, a README and an animation demo. All supplied manifest paths have been checked. The official light rectangle mark is paired with a live wordmark.

| Batch | Available families |
| --- | --- |
| 01 | Home hero lattice; Execution; Context; Intelligence; connected-lot flow |
| 02 | Technology hero lattice; architecture composition; Voltron Core; Capability Modules; Process Packs |
| 03 | Plant Configuration; Voltron AI; system responsibilities; identity relationships; manufacturing relationships |

The two preview sheets have been visually inspected. Their geometry, face colors and line treatment are consistent across the batches. The actual supplied illustrations are flatter and simpler than the original dimensional mockups; use the supplied artwork as artwork authority without assuming equivalent visual density.

## Sizing Findings

Bounds below measure nontransparent pixels in light-theme 1x PNGs, ignoring alpha values of 8 or less. They describe artwork, not surrounding live labels.

| Asset | Canvas | Visible artwork bounds |
| --- | --- | --- |
| Home hero | 480 x 360 | 243 x 258 |
| Technology hero | 480 x 360 | 230 x 209 |
| Voltron Core | 240 x 240 | 102 x 115 |
| Capability Modules | 240 x 240 | 142 x 99 |
| Process Packs | 240 x 240 | 134 x 143 |
| Connected-lot flow | 1000 x 280 | 792 x 120 |
| Architecture composition | 1000 x 380 | 846 x 164 |

Do not equate image canvas width with visible artwork width. Adjust the artwork viewport or rendered scale deliberately when composing hero and module sections; preserve source files. Flow and architecture whitespace includes intentional room for live labels and must not be blindly trimmed. Match visual weight across module illustrations without forcing identical image-box sizes.

## Remaining Asset Coverage

- Approved light/dark circle and rectangle logo assets are present and the light rectangle is integrated.
- Home: Alpha/process artwork and people/whole illustration remain to be supplied for the new direction.
- Technology: all supplied families are available; system responsibility content currently uses accessible semantic icons.
- Ontology: identity and relationships are integrated; governed action uses a reusable live step diagram.
- Intelligence: QMS composition, role icons, point-of-work and review artwork remain.
- Manufacturing: technically distinct phosphating, CED, dry powder-coating and operating-condition artwork remain.
- Network, About, People Culture, Commons and Partner need their page-specific artwork as described in the specification.

## Integration Findings

The ten public routes now use the new shared light shell. The old public components and conflicting legacy stylesheets are removed. Supplied SVGs use module/connection/detail animation hooks for a short once-only reveal. Diagrams, evidence sources, specialist roles and illustrative human review respond to visitor selection. Labels remain live HTML. Old ontology and Commons URLs redirect to the canonical routes. Page-specific missing artwork reserves an empty, consistently sized space rather than substituting unrelated illustrations. ARTWORK-SLOTS.md lists the pending families and their placements.

The existing inquiry API, local/DynamoDB storage and notification adapters remain in place. Company/organization is now optional to match the accepted forms. No admin page or authentication implementation was present in this checkout at the start of this rebrand; the middleware admin exemption remains, but this work does not claim to restore an absent admin application.

The brief is accepted. Additional asset batches can extend this snapshot without reopening the design direction.
