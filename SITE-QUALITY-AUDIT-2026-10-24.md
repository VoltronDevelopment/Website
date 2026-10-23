# Voltron performance and UI re-audit — October 24, 2026

The repeated audit found and fixed two visible regressions: overlapping hero artwork during navigation, and missing homepage process artwork under reduced motion. It also removed unnecessary hero rebuilds on resize and repaired the browser-test installation in CI. The main performance implementation is delivered; remaining startup tasks and field verification mean performance is not universally complete.

## Scope and method

The review used a frozen copy of the staged release, a production Next.js build, Chrome, temporary local accounts created for the test, and the application's normal sign-in endpoint. No real founder credentials were read, sessions forged, or inquiries submitted.

Twelve routes were inspected: Home, Technology, Ontology, Intelligence, Manufacturing, Network, About, People Culture, Commons, Partner, Enter, and Coming Soon. The main matrix contains 62 route/viewport/theme cases: desktop 1440px and mobile 390px in both themes, plus selected 320px and 768px cases. Coming Soon starts in its intentionally authored light preview; its subsequent dark preview was checked separately. Legacy Commons/Ontology redirects and the entry-to-Home path were also tested.

The baseline inspection and one confirmation round combined screenshots, layout measurements, accessibility checks and animation sampling. The Impeccable launcher could not initialize its engine/cache, so existing DESIGN.md and implementation guidance were read directly. No detector-engine result is claimed.

## Implementation integrity and health

The shared Montserrat typography, site shell, navigation, spacing, glass palette and action controls remain coherent. Manufacturing's denser scene layout, the intro and the launch page retain their documented variants. Missing artwork remains explicitly reserved rather than being replaced with unrelated imagery.

| Dimension | Score / 4 | Evidence and limits |
|---|---:|---|
| Accessibility | 3 | No automated WCAG A/AA violations in 62 cases; menus, selection and dialog focus checked. Some contrast/ARIA checks require human judgment. |
| Performance | 3 | Transfer/bundle budgets pass; stable GPU resources; remaining 226–284ms startup tasks in mobile samples. |
| Responsive layout | 4 | No document overflow at tested widths; single main/H1, no duplicate IDs or undersized controls below the tested 24px threshold. |
| Theming | 3 | Main-page themes and launch dark preview work; supplied artwork coverage is incomplete. |
| Implementation integrity | 3 | Shared primitives and finite animations retained; 27 declared artwork families still lack supplied artwork. |
| **Total** | **16 / 20** | **Good; remaining limitations are listed below.** |

This is an engineering assessment, not a WCAG certification or a field Core Web Vitals score.

## Findings and fixes

| Severity | Finding | Resolution |
|---|---|---|
| P1 | Incoming hero posters overlapped the persistent live canvas during Home/Technology navigation. | A slot now owns either its poster, the live canvas, or the active morph. Rich transitions suppress incoming posters before paint; ordinary preparation keeps the canvas hidden until ready. |
| P1 | The homepage Alpha illustration disappeared with reduced motion because scripting CSS hid the SVG while the renderer was intentionally skipped. | The static SVG remains visible for reduced motion and Save-Data without starting WebGL. The live renderer takes ownership when ready. |
| P2 | Window resizing remounted the hero and repeated scene preparation. | Resize updates placement and lets the existing renderer resize itself. Preference changes still switch to the appropriate presentation. |
| P2 | CI failed while installing Playwright after the production build (`edgesOut` dependency-tree error). | Playwright is pinned in development dependencies and package-lock.json. Normal `npm ci` installs it; the browser step only installs Chromium. |

The fixes preserve the approved hero choreography, artwork geometry, launch access rules, and theme palettes. Regression checks were added to CI for page consistency, accessibility, hero overlap, preference changes and resize continuity.

### Hero regression evidence

| Scenario | Overlapping frames before | After |
|---|---:|---:|
| Desktop, light | 77 | 0 |
| Desktop, dark, CPU 4× slowdown | 27 | 0 |
| Mobile, light | 11 | 0 |

Entry-to-Home also produced zero overlapping frames. Turning reduced motion on restores the poster; turning it off restores the live scene. In each resize check the existing canvas advanced from three rendered frames to four rather than resetting its frame count.

## Final performance checks

The production build, all 175 tests in 27 files, secret scan, and performance budgets passed. The four measured cold browser-context profiles used 390×844, DPR 3, 150ms latency, 1.6Mbps download and CPU 4× slowdown. GPU/driver caches may still be warm; these are individual local samples.

| Route | Transfer | LCP | Load event | Largest task |
|---|---:|---:|---:|---:|
| Home | 688 KB | 2.21s | 2.53s | 260ms |
| Home, reduced motion | 474 KB | 2.44s | 2.52s | 284ms |
| Manufacturing | 473 KB | 0.82s | 1.94s | 259ms |
| People Culture | 641 KB | 1.62s | 2.30s | 226ms |

These samples are below the 2.5-second LCP target. The previous cold run exceeded it on Home and Culture, demonstrating variation; the new samples do not establish a field pass or a guaranteed improvement of this size on every device.

Thirty Home/Technology transitions retained exactly 496/814 GPU buffers respectively. Reduced-motion and Save-Data page checks created zero WebGL contexts. The manufacturing tour completed its two-minute observation with animation callback count unchanged at 2689 during the subsequent rest sample. Its callback p95 was 9.3ms and maximum 16.3ms; callback duration is not a measurement of delivered display FPS. Context-loss recovery, no-JavaScript artwork and versioned-asset caching checks passed. Browser error and missing-resource lists were empty.

The page matrix's largest observed CLS was 0.00288. It had no horizontal overflow, duplicate IDs, unlabeled interactive controls, broken loaded images, missing image alt attributes, or automated accessibility violations. Header/menu Escape behavior, evidence selection, ontology selection, founder-dialog focus restoration, and legacy redirects were checked. The component reveal and lot journey both reached settled poses in normal motion on desktop and mobile; the component reveal also paused while offscreen.

## Remaining work and practical limits

1. **P2 — Startup responsiveness:** 226–284ms tasks remain in the throttled samples. GPU/environment preparation and shader work still merit profiling on representative low-end devices. A fast LCP alone does not demonstrate good INP.
2. **P2 — Field/device evidence:** actual Android/iPhone/Safari behavior and production field LCP/INP/CLS distributions have not been established. The existing performance monitor emits browser events; remote collection remains opt-in and requires a configured collector.
3. **P2 — Artwork availability:** 27 unique declared families render reserved slots because their actual files have not been supplied. This predates these fixes and is documented in ARTWORK-SLOTS.md. It affects the visual completeness of several hero and supporting illustrations; it is not a failed image download.
4. **Accessibility review:** automated checks left some contrast and ARIA cases for human review, especially around translucent surfaces. Zero automated violations is not a complete conformance assessment.

Use the same production browser checks on future rendering changes, then finish with a bounded visual polish check. Device measurements and supplied artwork should resolve the remaining evidence/content gaps before claiming the whole site is fully finished.

## Reproduction and evidence

`npm run quality:browser` runs the page audit against a local production build selected by `SITE_AUDIT_DIST`; use `SITE_AUDIT_PHASE=verified` to enforce its assertions. `SITE_AUDIT_EXTRA_ONLY=1` checks additional intro, launch and homepage-scene paths. `npm run performance:browser` runs the performance harness; its CI/final modes exercise navigation, static alternatives, mobile profiles and longer playback.

Local evidence is retained under `.audit-logs/site-quality-20261024/` and `.audit-logs/performance-recheck-20261024/`. Reports include screenshots, per-frame overlap samples, accessibility results, resources and timing data. CI uploads its own performance and page-quality evidence artifacts.
