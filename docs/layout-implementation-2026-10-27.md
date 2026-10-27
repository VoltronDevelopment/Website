# Shared layout and People contribution implementation — 27 October 2026

Implemented the layout/artwork audit, incorporating the user's subsequent decision to remove the arm from People & Culture. No push or deployment is included. Existing unfinished section content and internal arrangements remain intact.

## Shared hero and section framing

`components/brand/responsive-frames.css` is the canonical framing owner. Its selectors scope to the marketing main content, leaving Enter/Coming Soon and supporting application diagrams independent.

- One split/stack policy: split from 1024px; stack below 1024px, independent of artwork side. Desktop alternation remains intact; smaller screens retain text-first reading order.
- Consistent 43:57 copy/art proportions, 24px desktop gap and 1,120px content container.
- Shared copy anchor, heading scale, paragraph spacing, action wrapping and principles strip. Intelligence now uses the shared principles component inside its Hero.
- Height-aware artwork: desktop `clamp(420px, calc(100svh - 360px), 560px)`; tablets `clamp(380px,43svh,460px)`; phones `clamp(300px,43svh,380px)`. Short landscape screens use a 300px stage and ordinary vertical scrolling. Text can expand the hero rather than clipping.
- Breadcrumbs occupy the existing top allowance and no longer add a full row to only People/Commons. Hero headings align across all ten routes at common viewports.
- Desktop/tablet/phone chapter spacing follows 80/64/48px. Alternating existing white sections receive a restrained tonal falloff and soft shadow, without bright rules or turning open artwork into cards. Custom Alpha chapters participate in the same spacing contract.
- Manufacturing's narrow tabs wrap into two columns with the last tab across the row below 360px. Network focus controls stack at that size. Text stays readable, with 44px minimum targets.
- A localized contrast pocket behind the neural artwork quietens competing background lattice. The established page atmosphere, typography and content remain the baseline.

Measured before the final poster pass: at 1440×900 all ten heroes use a 540px stage, 684px hero element, and headline top at 286px. At 1280×720 the shared stage is 420px and the standard hero is 564px, fitting below the existing header within the viewport. At 820px every hero uses a single column and 460px stage; copy length can vary the total height naturally. The complete viewport audit also checks 320/390/430/767/768/900/901/1024/1920px, both themes at representative sizes, and local control overflow.

## People & Culture: revised contribution story

The user superseded the elbow/palm direction with a simpler overhead contribution. The runtime renderer now loads the head only; it does not load the arm mesh, arm points or arm path. The original arm source/derivatives are preserved as unused assets, and the interrupted crop experiment was reverted. The separate Partner hands artwork remains in place.

1. Head and clear Voltron enclosure form together (0.25–3.25s).
2. A medium dark cube emerges from the head and reaches the enclosure centre (3.6–6.7s).
3. A small cube forms from a downward particle wave above the enclosure (7–8.8s).
4. The completely formed cube holds above the enclosure (8.8–9.3s).
5. It descends vertically into the same centre (9.3–12.2s).
6. The nested contribution resolves and holds; frame scheduling stops at 14s.

The small cube's edge lines remain hidden during formation; the particle field and progressively revealed surfaces establish it before descent. `createPhilosophyWave` now accepts optional authored direction/reach parameters, reusing the existing bounded GPU field rather than creating a separate clock. The head is larger, lower and more front-readable; camera framing is centred without a right-hand allowance. The cube/head separation is judged in the projected image, not only in world coordinates. The outer enclosure uses the established pearl crown, darker recesses and clear front glass treatment.

Pause/replay, seeking, hidden/offscreen suspension, context restoration and completed static artwork remain available. Accessible artwork descriptions now describe the overhead cube and no longer mention the arm.

## Particle and optical refinements

- Shared anatomical transport now follows deliberately directed ribbons, with stronger incoming opacity and a darker light-mode core. Fine point sizes and existing sample counts are retained.
- Philosophy's small-cube deposition band remains visible longer without an early wireframe. The Culture overhead contribution uses this same mechanism.
- The Culture helix's light-mode cyan strand gains contrast. Completed scenes retain their finite endpoints.
- Shared nested-cube glass uses explicit crown, near, recess, base and clear face roles for stronger depth without a uniform bright blue fill.
- No global particle background, new dependency or full-screen bloom pass was added.

## Poster continuity under fluid sizing

A native image must represent the captured camera bounds rather than stretching to every new canvas rectangle. ScenePoster uses captured frame dimensions plus each scene's minimum framing to retain the same projection while the responsive stage changes height. Engineered hero posters likewise derive their display dimensions from the captured aspect and the renderer's authored 960:760 framing basis.

Dense opening fields for People, Partner and Commons receive native desktop/phone captures. Manufacturing also has short-laptop and tablet captures because its broad deposition field exposes different source bounds at wider aspect ratios. These files are renderer captures with content hashes; they are not replacement artwork. Existing image and colour/alpha matching budgets are retained.

## Verification

Final reports are recorded in `.audit-logs/layout-implementation-20261027/` after the production build, browser matrices and loading-image comparisons finish. Initial layout and live passes already confirm consistent breakpoints, no local text/page overflow, and no arm requests. The complete final results are appended below.

### Verification snapshot before the next artwork discussion

The isolated production build passes, typecheck passes, and all 232 tests across 45 files pass with bounded worker concurrency. The strict premium audit reports zero findings; secret scan and performance budgets pass. `final-frames/measurements.json` passes 150 layout cases with shared heading anchors and no page/control overflow. `final-site/results.json` passes 126 cases and five interaction flows.

The expanded 112-case `final-verified-parity/results.json` passes 108 cases. It identifies tablet Alpha plant poster resampling (two themes) and phone Partner opening-image resampling (two themes). The Partner native capture has since been corrected using a capture-only preserved drawing buffer; that latest image manifest still needs a production rebuild and repeat check. The tablet plant comparison remains unresolved. The primary live scene renders show no arm downloads or shader errors, but the concurrent run recorded two intermittent React 418 hydration errors on About; a clean isolated lifecycle repeat remains outstanding. These are not declared passed.

The user then requested discussion of new About stairs and Partner figures, and selected keeping the two Human After All figures while deferring KUKA. The new direction and source inspection are recorded in `docs/about-partner-artwork-direction-2026-10-27.md`; these replacement scenes are discussion-only at this point.
