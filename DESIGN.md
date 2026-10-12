# Voltron Lattice Design Context

## Authority and Scope
The accepted source is `C:/Users/Omkar/Downloads/Voltron-Lattice-UI-Specification.md`, its ten page mockups, the supplied motion notes, and `public/Brand Assets`. The October 12 user request authorises replacement of the previous public implementation and a matching dark theme. This remains a quiet industrial identity in both themes, not the earlier neon site. The inquiry storage, API and existing data are retained. No deployment is part of this change.

## Audience and Purpose
Production customers, manufacturing partners, technology collaborators and prospective contributors need to understand execution, manufacturing meaning and evidence-led intelligence without confusing their responsibilities. Voltron Alpha is the first manufacturing application; future network and Commons directions must not imply established operating outcomes.

## Canonical UI
Model B: runtime CSS in `app/globals.css` is the token authority. Shared public components live in `components/brand`. All ten pages use the same header, footer, container, headings and section rhythm. Use Inter locally, 400 for headings/body, 500 for labels, 600 only when necessary for small emphasis. Icons are Lucide, artwork is supplied brand SVG. Text remains HTML.

## Tokens
Canvas #F3F5F7; surface #FFFFFF; ink #132A42; secondary #526F87; blue #246BD4; cyan #2894BC; divider #CCD7E1; cube outline #397CAE. No arbitrary colours, gradients or decorative orbs. Content width 1120px. Gutters 48/32/24px, 20px below 390px. Header 80px desktop, 72px compact. Per the latest October 12 request, main sections are viewport scenes: minimum height 100svh minus the header and its border, with vertically centered content and 80/64/56px vertical padding. Hero scenes leave a 24px glimpse of the next band. Main split columns have a 48px desktop gap, 32px tablet gap and stack with 40px spacing on mobile. Dense content, forms, expanded disclosures and short screens grow naturally; never fix heights, clip content or force scroll snapping. Breadcrumbs belong inside their hero scene. Utility principle strips and the footer retain content-sized heights.

Desktop H1 34/42, H2 26/34, H3 20/28; mobile H1 28/36, H2 23/31. Body 16/25; compact body 14/22. Letter spacing is zero. Controls are at least 44px tall, form inputs 48px. Panel radii 4-6px. Page sections are unframed full-width bands, not nested cards.

## Assets and Motion

Prelaunch homepage: a minimal Diwali holding screen branded “Voltron Lattice” with the existing tagline, date countdown and discreet founder sign-in. Reuse the original Git hero assembly timing and 2.5-second logo pulse; keep the current official light/dark logo marks. Launch is November 8, 2026 at 12:00 AM IST. Before launch, the public sees only the countdown; the full ten-page site is privately reviewable by the two founder accounts. Inquiry submission is closed until launch. The coming-soon route and all founder responses are private/no-store; the holding screen is noindex and the sitemap is empty until launch. A founder session lasts eight hours.

Home and Network include their Repeatable / Measurable / Traceable / Scalable / Intelligent strip inside the hero scene, not below it. The strip participates in the viewport height budget. Those heroes use 220px artwork on mobile and 164px below 390px so the text and complete principle strip remain visible on standard portrait screens.
The official theme-matched rectangle mark is paired with a live wordmark through the shared BrandLogo component. Its full square source fits a 64px desktop, 48px mobile or 44px narrow-mobile wrapper without overflow clipping. No substituted letter V. Batches 01-03 supply 15 artwork families in light/dark SVG and PNG variants. A server-side manifest resolver reads both variants, preserving authored aspect ratios and matching crop geometry. CSS displays only the active theme's SVG. Missing families reserve a quiet, empty artwork space using the same responsive geometry as the final illustration. Never borrow an unrelated family to fill a missing asset. Empty spaces have no upload controls or instructional copy and are hidden from assistive technology. See ARTWORK-SLOTS.md for the pending families. Final static diagrams remain intelligible without motion. SVG reveal plays once; interactive steps, evidence and agent views respond to selection. Reduced motion disables animation. No approval is issued automatically.

## Theme Contract
The root `data-theme` selects the runtime CSS token set. Dark canvas #040406, surface #101318, ink #EDF3FA, secondary #A8BACB, blue #78B0FF, cyan #36BEDA and divider #303B47 complement the supplied dark artwork. Action, hover, selection, success/error, field-border, cube and scrollbar tokens are theme-specific; component rules never hard-code a light surface.

The header's labelled Sun/Moon button remains visible outside collapsed mobile navigation. On first visit the theme follows the OS; a manual selection persists under `voltron-lattice-theme`. A small pre-paint script restores the theme without a light flash. Invalid or unavailable storage falls back to the OS, and storage failures never disable switching. OS changes apply while no explicit preference exists; cross-tab preference changes synchronize. Native fields use the matching `color-scheme`. With JavaScript disabled, the default light theme remains readable. Theme switching changes colors and artwork only, not layout or form values.

## Routes
Home, Technology, Ontology, Intelligence, Manufacturing, Network, About, People Culture, Voltron Commons, Partner. Legacy ontology and Commons URLs permanently redirect. Partner owns the two complete forms; manufacturing links to the production form rather than duplicating it.

## Interaction and Accessibility
Keyboard-operable disclosure navigation, Escape dismissal, visible focus, labelled form controls, first-invalid focus and inline errors. Required choices are not silently defaulted. Failed submissions retain input, duplicate submission is guarded, and success requires an acknowledged inquiry ID. Mobile navigation is a disclosure, not a modal. Evidence, specialist and manufacturing selectors have pressed state and polite feedback. Human review is an explicitly labelled illustration with no plant command.

## Verification
Run TypeScript, Vitest and a production build. Inspect all canonical routes at 1440px and 390px, plus 320/768px stress widths. Check page overflow, headings, image clipping, navigation, interactive selection, form validation and simulated API failure/success. Keep pending asset families visible in handoff notes. Do not claim absent admin pages are implemented.

### October 12 Verification Record
- Production build and TypeScript validation passed.
- 81 tests passed across inquiry validation, API, persistence adapters, ledger integrity, canonical route access, light/dark brand asset resolution and pre-paint theme restoration.
- Playwright audit: 10 routes in both themes at 320, 390, 768, 1100 and 1440px; 100 checks passed, 40 screenshots, zero page errors, detected text-contrast failures, logo clipping, wrong-theme artwork or horizontal/artwork overflow. Reserved artwork spaces remain nonzero-sized, empty and hidden from assistive technology.
- Desktop/mobile disclosure navigation, Escape dismissal, evidence/agent selection, explicit illustrative review and reduced motion passed.
- Forms: first-invalid focus, Commons intent, retained values after failure, success after an acknowledged ID and submission locking passed using intercepted responses. No real inquiry was sent by the browser audit.
- Strict design audit and Git whitespace check passed. Windows sandbox path restrictions required the test runner's bundle loader and unsandboxed browser/server execution.
- Theme-state audit passed system preference changes, explicit overrides, cross-tab sync, blocked storage, retained form values and 12 final shared-logo/layout checks. See UI-AUDIT.md for findings and audit limits.

### Adding Artwork
Keep authored sources in `public/Brand Assets`; do not crop source files. Each supplied batch has an `asset-manifest.json`. Supply matching light and dark variants by family name. Run `node scripts/measure-brand-assets.cjs` after adding or replacing a batch to refresh the derived SVG drawing bounds in `lib/brand-art-bounds.json`. Map a new page-specific family in its page component when its delivered name differs from the requested slot. The production build must be regenerated to publish new artwork.
