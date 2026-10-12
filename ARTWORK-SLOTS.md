# Artwork Integration

All ten public pages contain their complete content, navigation and existing interactions. Supplied matching artwork is retained. Pale dashed spaces reserve missing artwork without borrowed illustrations, placeholder text or upload controls.

## Pending Families

| Family | Placement | Geometry |
| --- | --- | --- |
| M01-manufacturing-hero | Manufacturing hero; Home Alpha section | Hero; split |
| P03-individual-whole | People Culture; Home people section | Split |
| O01-ontology-hero | Ontology hero | Hero |
| I01-intelligence-hero | Intelligence hero | Hero |
| I04-point-of-work | Intelligence point of work | Split |
| M02-phosphating | Manufacturing process | Process |
| M02-ced | Manufacturing process | Process |
| M02-powder-coating | Manufacturing process | Process |
| M04-process-variation | Manufacturing operating conditions | Entry |
| M04-equipment-constraints | Manufacturing operating conditions | Entry |
| M04-quality-evidence | Manufacturing operating conditions | Entry |
| M04-human-decisions | Manufacturing operating conditions | Entry |
| N01-network-hero | Network hero | Hero |
| N04-compounding-network | Network learning | Split |
| N05-industrial-products | Network future direction | Split |
| A01-about-hero | About hero | Hero |
| A03-people-lattice | About people | Split |
| A05-people-culture | About culture link | Preview |
| A05-voltron-commons | About Commons link | Preview |
| P01-people-hero | People Culture hero | Hero |
| P04-responsibility | People Culture responsibility | Split |
| P05-perspectives | People Culture closing | Entry |
| P05-shared-purpose | People Culture closing | Entry |
| P05-mutual-growth | People Culture closing | Entry |
| C01-commons-hero | Commons hero | Hero |
| C03-learning-nature | Commons learning | Split |
| C04-participation | Commons participation | Split |
| F01-partner-hero | Partner hero | Hero |

These are integration keys, not required filenames. If delivered family names differ, update the page's `family` or `art` property.

## Responsive Geometry

Runtime sizing belongs to `app/globals.css`; do not bake text or these dimensions into artwork.

- Hero: half the 1120px content width minus the column gap; 440px high on desktop, 360px on tablet, 280px on mobile.
- Split: capped at 520px wide and 360px high. Mobile artwork is capped at 360px wide and 300px high.
- Process: full entry width; 240px high on desktop, 200px on mobile.
- Entry: up to 180px wide and 180px high on desktop. Compact capability rows use 96 x 112px on mobile.
- Preview: full preview width; 240px high on desktop, 200px on mobile.

## Adding a Batch

1. Place approved light and dark SVG files and their `asset-manifest.json` inside a batch directory under `public/Brand Assets`.
2. Match each manifest entry's `family` to the table above and set `theme` to `light` or `dark`. Include both variants. Its `svg` path is relative to that batch directory, following the existing batches.
3. Include light 1x PNG exports in the existing manifest format, then run `node scripts/measure-brand-assets.cjs` to derive drawing bounds without modifying source art.
4. Rebuild for production. Development refreshes on the next server render; restart the local server if a new batch is not picked up immediately.

The shared `BrandArt` component replaces each empty space with its matching SVG. It preserves the same outer dimensions, fits rather than clips the artwork, and uses the existing once-only reveal. Live flow diagrams, evidence selectors, specialist icons and form controls are independent of these assets and remain functional.
