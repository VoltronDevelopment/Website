# Voltron Lattice UI Audit

Date: 12 October 2026. Scope: all ten public pages, shared navigation/footer, artwork, interactive diagrams and inquiry forms. The accepted typography, content width, page order and reserved artwork spaces are retained.

## Findings Addressed

| Priority | Finding | Resolution |
| --- | --- | --- |
| P2 | A 64px logo image was inside a 44px-wide clipped wrapper. | Shared BrandLogo fits the complete source into a 64px desktop, 48px mobile or 44px narrow-mobile square. No overflow clipping or source modification. |
| P2 | Header and footer independently implemented the logo. | Both now use the same component and supplied theme-specific assets. |
| P2 | Artwork resolution only supported light variants. | Both authored SVG variants are resolved; CSS displays the correct one without changing layout. Missing artwork remains a reserved space. |
| P1 | Form boundaries used the pale section-divider color rather than a stronger control boundary. | Dedicated theme-specific control-border tokens distinguish inputs against their surfaces. |
| P2 | Menus, fields, hover fills and success messages hard-coded light colors. | All now use semantic tokens with corresponding dark values. Native controls inherit the matching color scheme. |
| P2 | Footer links, breadcrumbs and some navigation entries did not meet the project's 44px target-height contract. | Increased these targets without changing their text sizes. |
| P2 | Several selectors lacked a deliberate hover fill, and browser surfaces did not share theme tokens. | Added restrained hover states, selection/caret colors and global scrollbar styling with forced-color compatibility. |

## Page Coverage

Each route passed light/dark layout, HTML text-contrast, heading, image, artwork-variant and logo-containment checks at 320, 390, 768, 1100 and 1440px.

| Page | Additional checks |
| --- | --- |
| Home | Full supplied hero artwork, compact capability rows, vertical mobile flow, retained future-art spaces. |
| Technology | Architecture selection, mobile cube alternative, modular configuration and process-pack select. |
| Ontology | Responsive identity/relationship columns and governed-action flow remain intact. |
| Intelligence | Evidence selection, specialist selection and explicit illustrative human review. |
| Manufacturing | Distinct process/operating-condition artwork spaces, release flow and production-inquiry destination. |
| Network | Responsive ownership/JV lists, network selector and correctly qualified future-product direction. |
| About | Leadership content, responsive discipline selector and culture/Commons destinations. |
| People Culture | Growth disclosures, individual/whole selector, responsive artwork spaces and breadcrumb target. |
| Voltron Commons | Developing-program qualifiers, mobile pathway grid and collaboration destination. |
| Partner | Labelled native fields, validation focus, retained values on failure, acknowledged success and duplicate-submission locking. |

## Theme Behavior

- Sun/Moon switch is always reachable, including when mobile navigation is closed; its accessible name and tooltip describe the next action.
- OS preference applies initially, before paint. Manual choice persists across reloads and navigation.
- OS changes apply without an explicit choice; saved choices override them. Cross-tab changes synchronize.
- Blocked storage falls back safely and does not prevent manual switching.
- Theme changes preserve entered form text and the selected production process.
- Layout, section heights, typography, copy and interactions are shared between themes.

## Verification Evidence

- 81 Vitest tests passed across seven files, including all 15 supplied dark artwork families and theme-bootstrap fallbacks.
- TypeScript validation and production build passed for all public routes.
- Main Playwright audit: 100 route/theme/viewport checks, 40 screenshots and zero page errors, horizontal overflow, logo clipping or incorrect-theme artwork. Computed HTML text contrast met the tested 4.5:1 normal / 3:1 large-text thresholds.
- Interaction checks passed for navigation/Escape, evidence, specialist roles, human-review illustration, reduced motion and intercepted form failure/success. No real browser inquiry was submitted.
- Final theme-state audit passed OS updates, explicit preference, cross-tab synchronization, blocked storage, preserved form values and 12 shared-logo/layout checks, including a 720px reflow width.
- Strict premium UI static audit returned no findings. The Impeccable engine was unavailable in the sandbox; its audit and craft guidance were read directly alongside the existing design contract.

Scripts: `scripts/rebrand-audit.cjs` and `scripts/theme-state-audit.cjs`. Browser evidence is under `.audit-logs/rebrand`.

## Full-Screen Section Revision

The latest request replaces compact content bands with viewport-sized scenes across all ten routes. Each main section now fills the usable screen below the sticky header, centers its content vertically and retains the established 1120px content boundary. Desktop/tablet/mobile section padding is 80/64/56px. Split-column spacing is 48px on desktop, with larger hero, split, process and preview artwork spaces. Typography and theme behavior are unchanged.

Hero scenes leave a 24px next-section hint. People Culture and Commons breadcrumbs are inside their hero rather than adding an extra band above it. The principle strip and footer remain compact utility areas. No scroll snapping, hidden overflow or fixed-height content traps were introduced; forms, expanded disclosures and dense mobile layouts can exceed one screen.

Additional browser checks cover all ten routes at 1366x768, 844x390 landscape and 1920x1080: 30 checks passed without horizontal overflow or scene-content clipping. The main audit now asserts minimum scene height, content containment and vertical centering on every route/theme/viewport combination: all 100 checks and existing interaction checks passed, with 40 refreshed screenshots and zero page errors. Representative desktop hero, architecture and mobile breadcrumb scenes were visually inspected. TypeScript, 81 tests, strict static UI audit and Git whitespace checks passed.

## Remaining Limits

Page-specific artwork still needs uploading as listed in ARTWORK-SLOTS.md, ideally in both theme variants. These empty spaces are intentional, not broken images. No artwork was fabricated or borrowed to fill them.

This is a bounded source/browser audit, not a complete assistive-technology certification or Lighthouse performance study. Full screen-reader coverage, physical touch-device testing and third-party browser-native popup rendering remain outside this pass. No deployment or absent admin implementation is claimed.
