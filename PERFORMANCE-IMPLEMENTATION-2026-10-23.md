# Performance implementation — 23 October 2026

This implements the priorities in `PERFORMANCE-AUDIT-2026-10-23.md` on the existing working tree. Authored artwork originals, the glass/blue visual language, page content, founder access and inquiry behavior are preserved. Existing artwork edits from before this work are retained.

## 1. Image delivery

- Added `scripts/build-performance-assets.mjs` and a generated `lib/optimized-assets.json` manifest. Thirteen current Brand Assets PNGs now have size-limited, high-quality WebP derivatives with content hashes in their filenames. Originals are not overwritten.
- Normal headers/footers request one transparent official mark, rather than preloading both 1.2 MB themed source logos and then hiding them behind a CSS background. The separate holding screen retains its theme-specific logo treatment using small derivatives.
- Factory artwork, Culture/Commons textures, the entry mark, the shared hero texture and server-resolved image artwork use the same URL resolver.
- Factory image elements use a proximity observer instead of depending on the browser's generous native lazy-loading distance. The renderer can prepare from the same declared source without triggering a duplicate large PNG download. No-JavaScript visitors retain a `noscript` image fallback.

Run `npm run optimize-brand-assets` after replacing current PNG sources. The manifest is checked in alongside its generated files, so production builds do not need image conversion or network access.

## 2. Versioned caching

`next.config.ts` serves `/optimized/` with a one-year immutable cache lifetime. `customHttp.yml` supplies the corresponding Amplify Hosting edge policy. Only content-versioned derivatives receive that policy; founder/session documents and the prelaunch document are not made public-cacheable.

The production cache-header change requires deployment. Local headers and configuration can be verified now; the live CDN's final response must be checked after release. Configuration follows [Amplify's custom-header guidance](https://docs.aws.amazon.com/amplify/latest/userguide/setting-custom-headers.html).

## 3. Persistent GPU buffer fix

`components/performance/line-distance.ts` updates an existing `lineDistance` attribute, allocating only if its required size changes. Both hero state updates and Home/Technology morph updates use it in place of allocating a fresh uploaded attribute every frame.

The browser regression ran **30 transitions**. All fifteen Home samples retained **496 buffers**; all fifteen Technology samples retained **814 buffers**. Before the fix, repeated Technology samples climbed from 815 to 989. A unit regression additionally changes an endpoint 100 times and checks attribute identity and distance correctness.

## 4. Immediate artwork and staged preparation

- Home, Technology, Culture and Commons have theme-matched completed artwork in the initial HTML. The small posters were generated from the actual existing fallback compositions, with images embedded during rasterization rather than relying on unsupported external image references inside an image-loaded SVG.
- Philosophy has a lightweight inline projection of its original three cube sizes and camera direction. Small cube controls retain their original inline SVGs.
- Shared hero setup yields before environment and texture work; hero geometry construction yields between stages. Alpha construction yields between tanks. Hero and Alpha materials are asynchronously compiled before revealing the prepared artwork.
- Navigation remains independent of optional renderer readiness. The approved 800 ms rich morph is retained. If cold Home preparation takes more than two seconds before mounting, it hands over to the completed composition instead of restarting an assembly over a long-visible completed poster.
- Chunk failures retain the poster or existing SVG. Scenes that complete asynchronous initialization after unmount are disposed. Alpha applies the latest requested playback/pause state after preparation, preserving interactions made while its renderer loads.

Shader/driver work can still create long tasks. Staging reduces contention but does not prove that every GPU initialization stays below a 50 ms task budget.

## 5. Alpha's rendering work

- Compatible static, opaque machinery meshes are batched into instanced draws. Transparent tank walls/water, picking proxies, droplets and moving rail bridges are excluded. Instance disposal is explicit, and camera-fitting bounds account for instance transforms.
- The thirteen-tank scene projects and writes HTML label positions only when camera matrices, viewport or the relevant active-station state changes.
- Inactive tanks retain a stationary water surface; only the currently demonstrated bath advances its water time.
- The homepage preview runs one 28-second cycle and stops. Its controls retain pause/resume and replay. The full Manufacturing guided tour retains its existing sequence and review endpoint.

Unit regressions verify that batching retains moving objects, groups compatible static meshes and preserves transformed bounds. Production-browser draw and callback measurements are recorded separately from CPU-only tests.

## 6. Reduced motion and constrained data

Motion preference and `Save-Data` are checked before renderer imports. Home/Technology, Culture/Commons, small cubes, Philosophy and Alpha keep their static artwork without creating a new WebGL scene in that mode. Existing interactive HTML remains available. Turning motion back on re-observes lazy scenes; initialized renderers retain their existing visibility and motion controls.

In the browser regression, reduced-motion Home started **zero WebGL contexts**, and its theme-matched poster loaded successfully. Motion preference is a user choice, not a proxy for hardware speed.

## 7. Adaptive quality

`createRenderQuality` observes visible animation intervals. After sustained slow intervals across 90 samples, it moves through Full → Balanced → Lightweight, with no oscillation or upgrade churn during playback. Long hidden-tab intervals do not count toward a downgrade.

The tiers lower drawing-buffer density, hero blur-buffer resolution, Alpha shadow cost and presentation blur. Artwork composition, geometry placement, colors and choreography remain stable. This is applied to the shared hero, human hero, Factory Systems, Lot Story, Philosophy and both Alpha scenes. The blue atmosphere remains; mobile/reduced-motion CSS already restrains its animation.

The default caps remain 1.5 DPR for most scenes and 1.75 for the main/human heroes. Actual reference-device testing is still required for a sustained frame-rate promise.

## 8. Performance measurement

`PerformanceMonitor` uses Next's Web Vitals hook for LCP, CLS and INP, and observes scene readiness and significant long tasks. It emits `voltron:performance` browser events with numeric values, pathname and viewport class. It does not include query strings, identities, form content or artwork data.

Collection is opt-in. Set `NEXT_PUBLIC_PERFORMANCE_ENDPOINT` to an existing same-origin collector path before building if persistent field collection is wanted. With the setting absent, no metrics are transmitted. This change supplies instrumentation; it does not create an external analytics account, a storage backend or a field p75 dashboard.

Example local inspection:

```js
window.addEventListener('voltron:performance', event => console.log(event.detail));
```

## 9. Budgets and CI

- `npm run performance:budget` checks generated content hashes, a 200 KB per-artwork limit, a 15 KB header-mark limit and a 180 KB gzip initial JavaScript limit per route.
- CI runs that budget after the production build, installs the pinned browser runner and exercises the production fixture with 30 client navigations, GPU-resource plateau assertions, a 1 MB initial Home transfer budget and reduced-motion fallback checks.
- Browser evidence is uploaded even when a check fails. The runner uses disposable credentials through normal local login, sends no inquiries and never uses real founder credentials.

Local regression command in PowerShell:

```powershell
$env:AUDIT_CI='1'
$env:AUDIT_DIST_DIR='.next-performance-optimized'
$env:AUDIT_OUTPUT_DIR='.audit-logs/performance-optimized-ci'
node scripts/performance-audit-20261023.cjs
```

The machine needs Chrome or Playwright's Chromium installed. Set `AUDIT_BROWSER=chromium` for the latter. In CI, `AUDIT_DIST_DIR=.next` selects the normal production output.

## Verification record

- TypeScript and production builds passed during implementation.
- **175 tests across 27 files passed**, including the three new GPU-resource, instancing and adaptive-quality tests.
- Asset/bundle budgets passed.
- The final unthrottled production Home regression transferred **686,755 bytes**, down from approximately 6 MB in the baseline audit. These are local samples, not field distributions.
- Thirty Home/Technology navigations showed a stable per-destination GPU-buffer baseline; reduced-motion Home loaded its poster with zero WebGL contexts and the regression recorded no browser errors.
- The twenty-route desktop/mobile comparison is under `.audit-logs/performance-optimized/`. Final shader/poster checks, 30 navigations, throttled profiles and the completed Alpha soak are under `.audit-logs/performance-final/`. A separate cache-header confirmation is under `.audit-logs/performance-cache/`.

### Mobile comparison

Same emulation as the baseline: 390 × 844, DPR 3, 150 ms latency, 1.6 Mbps download and CPU 4× slowdown. Results are individual local samples, not field distributions.

| Page | Baseline transfer | Optimized transfer | Baseline load event | Optimized load event | Optimized LCP |
|---|---:|---:|---:|---:|---:|
| Home | 6.03 MB | 650 KB | 31.74 s | 6.97 s | 2.76 s |
| Home, reduced motion | 6.01 MB | 473 KB | 31.34 s | 3.49 s | 2.80 s |
| Manufacturing | 2.94 MB | 471 KB | 15.93 s | 3.01 s | 1.39 s |
| People Culture | 4.16 MB | 640 KB | 23.25 s | 3.18 s | 2.54 s |

The new Home/Culture LCP candidate is the visible artwork poster, whereas the baseline candidate was the heading. The metric now includes useful artwork that previously did not exist as an LCP-eligible element. The first optimization pass measured Home's load event around 3 seconds; the final cold pass measured 6.97 seconds with a 1.39-second startup task. Cold GPU/browser variability and remaining preparation work still matter. **Final Home LCP around 2.8 seconds and Culture LCP 2.54 seconds exceed the 2.5-second lab target.** This implementation substantially cuts transfer and rendering work but does not establish a field Core Web Vitals pass or eliminate every startup long task.

The twenty desktop/mobile route samples had no horizontal overflow and maximum CLS 0.00871. The throttled Manufacturing sample had CLS 0.01597, also below 0.1. The thirteen current PNG sources total 12.30 MB; their primary derivatives total 829 KB, and the single delivered header mark is 11,928 bytes.

The full audit's original Alpha soak action expected a manual “Follow a lot” start. The current working-tree tour starts automatically, so that legacy action timed out. It was a harness mismatch, not a route crash. The harness now supports both modes; the final targeted run uses the final shader-preparation build and covers the soak, context loss and resource assertions separately.

These measurements were recorded before production deployment. Live Amplify caching and physical-device checks are separate from these local results; no actual Android/iOS or Safari frame-rate guarantee is claimed.

### Final rendering and recovery checks

The final thirty-transition run retained 496 buffers on every Home sample and 814 on every Technology sample. Alpha averaged approximately 125 draw calls per animation callback in sampled playback, compared with roughly 776 in the baseline sample; these intervals cover similar loading activity but are not an identical GPU trace. Its complete-tour callback p95 was 11.4 ms, compared with 22.6 ms before, with Full quality retained. After the two-minute observation, the tour rested at review (44.96 seconds) and callback count remained exactly 2690 across the additional one-second rest sample. Context loss restored the fallback.

The final browser assertions for rendering, resource counts, reduced motion and no-JavaScript artwork passed. The run then encountered an IPv6 localhost mismatch on its last Node cache fetch. The fetch now uses explicit IPv4; an independent rerun returned HTTP 200 with `public, max-age=31536000, immutable`. Original failed-run evidence is retained rather than rewritten as a successful run. Likewise, readiness sampling now waits for the scene before comparing buffer counts, and poster rasterization embeds PNG data so the logo/hand are retained.
