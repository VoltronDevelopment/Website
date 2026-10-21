# Voltron Lattice artwork upload guide

The page folders below have been created inside `public/Brand Assets`. Existing logo, Home, Culture and Commons source folders remain in place. The website reserves missing artwork spaces and loads files when supplied under the declared names.

## Upload rules

- Each pending family needs a light and a dark version with identical composition and aspect ratio.
- Preferred filenames: `<family>-light.webp` and `<family>-dark.webp`, with transparency and no baked page background.
- SVG alternatives named `<family>-light.svg` and `<family>-dark.svg` are already declared and take precedence.
- To use PNG, change the corresponding `image` filename in that folder's `asset-manifest.json` to `.png`.
- Keep illustration labels and controls in HTML. Do not bake website headings, navigation or buttons into the image.
- Dimensions below are recommended source sizes, not fixed display dimensions. Keep 6-10% clear padding around important artwork.
- Restart the development server if new files are not detected; rebuild the production site to publish them.

## Page checklist

| Page | Folder | Pending families | Files for two themes |
| --- | --- | ---: | ---: |
| Home | `01-home/` | 0 | 0 |
| Technology | `02-technology/` | 6 | 12 |
| Manufacturing Ontology | `03-ontology/` | 3 | 6 |
| Intelligence | `04-intelligence/` | 2 | 4 |
| Manufacturing | `05-manufacturing/` | 8 | 16 |
| Network | `06-network/` | 3 | 6 |
| About | `07-about/` | 4 | 8 |
| People Culture | `08-people-culture/` | 5 | 10 |
| Voltron Commons | `09-commons/` | 2 | 4 |
| Partner | `10-partner/` | 1 | 2 |

**Total: 34 pending families / 68 theme files.** Choose WebP or SVG per theme; both formats are not required.

## Home

Route: `/`

Folder: `public/Brand Assets/01-home/`

Existing logo and the three system illustrations stay in ../voltron brand page/. The hero, conveyor and philosophy cubes are generated in Three.js; no replacement lattice image is needed.

No new files required. Home's seven-cube hero, system enclosures, conveyor and philosophy scene are rendered in Three.js.

## Technology

Route: `/technology`

Folder: `public/Brand Assets/02-technology/`

The hero is already Three.js; do not upload a replacement hero cube image.

| Family filename prefix | Artwork | Recommended source |
| --- | --- | --- |
| `T02-architecture-composition` | Execution, shared meaning and intelligence in one connected architecture | 1600 x 700px |
| `T03-voltron-core` | Common model and runtime | 600 x 600px |
| `T03-capability-modules` | Quality, maintenance and traceability modules | 600 x 600px |
| `T03-process-packs` | Reusable process layers | 600 x 600px |
| `T03-plant-configuration` | Factory configuration | 600 x 600px |
| `T03-voltron-ai` | Manufacturing intelligence | 600 x 600px |

Add `-light.webp` and `-dark.webp` to each prefix above.

## Manufacturing Ontology

Route: `/ontology`

Folder: `public/Brand Assets/03-ontology/`



| Family filename prefix | Artwork | Recommended source |
| --- | --- | --- |
| `O01-ontology-hero` | Manufacturing identity and meaning hero | 1200 x 1000px |
| `O03-identity-relationships` | Plant, part, lot, operation and machine relationships | 1000 x 900px |
| `O04-manufacturing-relationships` | Requirements, processes, equipment, inspection and evidence | 1000 x 900px |

Add `-light.webp` and `-dark.webp` to each prefix above.

## Intelligence

Route: `/intelligence`

Folder: `public/Brand Assets/04-intelligence/`

QMS source selection, specialist agents and human review remain native interactive UI. Do not bake those controls into artwork.

| Family filename prefix | Artwork | Recommended source |
| --- | --- | --- |
| `I01-intelligence-hero` | Connected quality evidence, intelligence and human judgment | 1200 x 1000px |
| `I04-point-of-work` | Operator at the point of work | 1200 x 900px |

Add `-light.webp` and `-dark.webp` to each prefix above.

## Manufacturing

Route: `/manufacturing`

Folder: `public/Brand Assets/05-manufacturing/`

Mark conceptual imagery as conceptual. Upload operational photographs only when verified and cleared for publication. Home Alpha remains text-only.

| Family filename prefix | Artwork | Recommended source |
| --- | --- | --- |
| `M01-manufacturing-hero` | Surface-treatment process concept | 1400 x 900px |
| `M02-phosphating` | Phosphating process | 800 x 700px |
| `M02-ced` | CED process | 800 x 700px |
| `M02-powder-coating` | Powder coating process | 800 x 700px |
| `M04-process-variation` | Material and part variation | 600 x 600px |
| `M04-equipment-constraints` | Equipment constraints | 600 x 600px |
| `M04-quality-evidence` | Inspection evidence | 600 x 600px |
| `M04-human-decisions` | Human judgment on the shopfloor | 600 x 600px |

Add `-light.webp` and `-dark.webp` to each prefix above.

## Network

Route: `/network`

Folder: `public/Brand Assets/06-network/`



| Family filename prefix | Artwork | Recommended source |
| --- | --- | --- |
| `N01-network-hero` | Connected plants sharing one architecture | 1200 x 1000px |
| `N04-compounding-network` | Learning across a governed network | 1200 x 900px |
| `N05-industrial-products` | Industrial products as a future direction | 1200 x 900px |

Add `-light.webp` and `-dark.webp` to each prefix above.

## About

Route: `/about`

Folder: `public/Brand Assets/07-about/`

Existing Home system PNG files can be reused by changing these manifest image paths; do not duplicate source files unnecessarily.

| Family filename prefix | Artwork | Recommended source |
| --- | --- | --- |
| `A01-about-hero` | Voltron identity and industrial purpose | 1200 x 1000px |
| `A03-people-lattice` | People connected through shared purpose | 1200 x 900px |
| `A05-people-culture` | People Culture preview | 1000 x 700px |
| `A05-voltron-commons` | Commons preview | 1000 x 700px |

Add `-light.webp` and `-dark.webp` to each prefix above.

The three Execution / Context / Intelligence images already reuse the current Home PNG sources through their existing folder manifest. No new copies are needed.

## People Culture

Route: `/about/people-culture`

Folder: `public/Brand Assets/08-people-culture/`

The animated hero reuses ../voltron people culture/ hand artwork and its foreground mask; keep those files in place.

| Family filename prefix | Artwork | Recommended source |
| --- | --- | --- |
| `P03-individual-whole` | Individual within a larger whole | 1200 x 900px |
| `P04-responsibility` | Growth through responsibility | 1200 x 900px |
| `P05-perspectives` | Distinct perspectives | 600 x 600px |
| `P05-shared-purpose` | Shared purpose | 600 x 600px |
| `P05-mutual-growth` | Mutual growth | 600 x 600px |

Add `-light.webp` and `-dark.webp` to each prefix above.

## Voltron Commons

Route: `/about/voltron-commons`

Folder: `public/Brand Assets/09-commons/`

The animated hero reuses ../voltron commons/ and the supplied emblem. No replacement Three.js cube artwork is needed.

| Family filename prefix | Artwork | Recommended source |
| --- | --- | --- |
| `C03-learning-nature` | Learning, reflection and nature | 1200 x 900px |
| `C04-participation` | Participation and collaboration | 1200 x 900px |

Add `-light.webp` and `-dark.webp` to each prefix above.

## Partner

Route: `/partner`

Folder: `public/Brand Assets/10-partner/`

Production and partnership forms stay native HTML, not an uploaded image.

| Family filename prefix | Artwork | Recommended source |
| --- | --- | --- |
| `F01-partner-hero` | Two connected partners | 1200 x 900px |

Add `-light.webp` and `-dark.webp` to each prefix above.

## Existing assets to keep

- `logo/`: original approved logos.
- `voltron brand page/voltron-hero-assets/`: transparent mark and original reference pack.
- `voltron brand page/voltron-factory-systems/`: existing robot, context and brain sources.
- `voltron people culture/`: hand artwork and foreground thumb mask.
- `voltron commons/`: opened emblem and related source artwork.

Do not replace animated Three.js compositions with images of completed cubes. The artwork slots above are separate supporting illustrations.

## Check the upload status

Run `node scripts/check-brand-artwork.mjs` from the project folder. It lists pending families page by page. Add `--strict` for a release check that fails while required files remain missing. The manifests and `lib/brand-asset-catalog.json` define the expected families.
