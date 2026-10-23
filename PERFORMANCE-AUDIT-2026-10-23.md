# Voltron performance audit — 23 October 2026

## Assessment

The visual direction is viable. Preserve the glass, machinery, particles and blue atmosphere. The current implementation has useful rendering safeguards, but its asset delivery and some scene preparation and resource handling need work before performance sign-off.

Content generally appears promptly in the tested environment. That does not mean the artwork is cheap or interactions remain responsive during its preparation. The highest priorities are oversized images, a reproducible GPU-buffer accumulation, scene startup stalls, and short caching of public images. A rewrite of the entire rendering architecture is not the first step.

This is an audit of the **current working tree**, including existing uncommitted artwork changes, rather than only the last commit. No application behavior or visual design was changed. Added files are audit scripts and this report; the isolated Next build also generated its normal TypeScript/build metadata.

## What was tested

- Next.js 15.5.28 production build in `.next-performance-audit`, not the development server.
- All ten canonical content routes at 1440 × 900 and 390 × 844, with mobile DPR 3. Fresh browser contexts isolate each route's browser cache; the browser and driver shader caches can remain warm between cases.
- Four mobile load profiles: 150 ms emulated latency, 1.6 Mbps download, 0.75 Mbps upload, CPU slowdown 4×. These are emulated desktop conditions, not a physical phone.
- Dark-theme scene lifecycle, eight Home/Technology client navigations, rapid navigation, back/forward, reduced motion, WebGL unavailable and JavaScript disabled.
- A two-minute Manufacturing observation after starting the guided lot tour, including garbage collection at the end.
- Public deployment response and cache headers from `www.voltronlattice.com`, with a secondary check of the documented Amplify URL. These public endpoints currently serve the prelaunch holding page; private production pages were not accessed.
- Source, built chunks, source-image dimensions, rendering loops, cleanup, lazy imports, fonts, CSS effects and CI configuration.

Build, TypeScript and **172 tests in 26 files passed**. Initial sandbox execution failed because of Windows filesystem restrictions; the successful runs used the necessary process access. Those initial failures are not product failures.

Evidence lives in [.audit-logs/performance-20261023](.audit-logs/performance-20261023/): `browser-results.json`, `static-inventory.json`, `deployment-results.json`, screenshots and focused browser profiles. Source hashes in the inventory identify the implementation inspected. The audit uses disposable credentials configured only in its local server process and normal login; it reads no real founder credentials and submits no inquiries.

## Measured loading

| Mobile profile | LCP | Page load event | Subresource transfer | Largest observed main-thread task |
|---|---:|---:|---:|---:|
| Home | 1.59 s | 31.74 s | 6.03 MB | 1.52 s |
| Home, reduced motion | 1.87 s | 31.34 s | 6.01 MB | 1.52 s |
| Manufacturing | 1.62 s | 15.93 s | 2.94 MB | 3.24 s |
| People Culture | 1.70 s | 23.25 s | 4.16 MB | 1.03 s |

Transfer totals sum Resource Timing `transferSize`, including resource response overhead and excluding the main document. They do **not** sum cached `encodedBodySize` repeatedly. MB means decimal megabytes. Sampling continues for 2.5 seconds after the load event; totals can include optional preparation and prefetching by that point.

The heading was the LCP candidate in these profiles. **A 32-second load event does not mean the page is unusable for 32 seconds.** It shows substantial background traffic after useful content appears. WebGL canvas completion is not adequately represented by these LCP measurements. Track scene readiness separately.

Across the 20 unthrottled route samples, measured CLS was 0–0.00871, with no horizontal overflow at the two tested widths. One early desktop Home sample did not report an LCP candidate before sampling ended; it is missing data, not a zero-second LCP.

## Findings, ordered by priority

### P1 — Both oversized logo variants are preloaded on every normal route

`components/brand/BrandLogo.tsx:5` renders both theme variants with `priority` and `unoptimized`. Their source dimensions are 1254 × 1254 although the header reserves 64 × 64 CSS pixels. Light is **1,220,016 bytes** and dark **1,260,578 bytes**: **2.48 MB combined**. CSS hiding a variant does not undo its preload. The presentation header then visually substitutes a third, transparent mark through CSS while keeping the original images hidden.

The public holding page repeats the same pattern at `components/coming-soon/ComingSoonPage.tsx:153–154`. This issue therefore applies to the public experience today, not only the private full site.

**Action:** supply appropriately sized responsive derivatives or use the maintained image pipeline, and preload only the mark needed for the initial presentation. Preserve the official source files. Audit both theme changes and header/footer reuse after changing delivery. A proposed combined header-logo budget is 30 KB, subject to visual verification.

### P1 — Below-the-fold artwork downloads compete with the initial experience

The three Factory Systems PNGs total **3.06 MB**: robot 849 KB, checklist 978 KB and brain 1.24 MB. Their HTML images use native lazy loading, but that is a browser distance heuristic. In the throttled Home run all three began around **1.86 seconds**, without scrolling, and completed around **25.6–31.4 seconds**. `FactorySystems.tsx:89` and its renderer both consume these assets.

Other large source assets include the 1.23 MB Culture hand and 646 KB Commons emblem. Several decoded images occupy about 6.3 MB each as RGBA pixels before accounting for GPU copies or mipmaps. Compressed network size and runtime memory are different costs.

**Action:** create size-appropriate WebP/AVIF derivatives for HTML and suitable transparent texture derivatives for WebGL; share the same delivered asset where practical. Gate optional scene assets by actual proximity and capacity rather than relying only on `loading="lazy"`. Keep a small initial still. The existing `optimize-images.mjs` targets older root-level assets and does not cover these current Brand Assets families.

### P1 — Dashed connection updates accumulate GPU buffers across navigation

The persistent renderer's outstanding buffer count on successive Technology visits was **815 → 869 → 932 → 989**, after explicit garbage collection. Successive Home visits showed **518 → 582 → 639 → 693**. Compare the same destination to avoid confusing the two scenes' legitimate baseline difference.

`hero-renderer.js:439` and `:701` call `coreConnection.computeLineDistances()` during animation/morph updates. The installed Three.js implementation in `node_modules/three/src/objects/Line.js` creates and installs a new `Float32BufferAttribute` on each call. Replacing an uploaded attribute leaves the older GPU buffer outside the geometry's current attribute set; disposing the geometry later does not clean that older attribute through the normal path. The cumulative WebGL allocation counters agree with this source-level explanation.

**Action:** allocate the two-point distance attribute once, update its existing array and set `needsUpdate` only when the endpoint changes. Reuse position and temporary-vector storage as well. Repeat at least 30 transitions and idle pulses; outstanding buffers for each destination must plateau. The measured buffer increase is confirmed; its long-term memory impact in bytes was not measured.

### P1 — Scene preparation can block interaction for seconds

Throttled Manufacturing produced a **3.24-second main-thread task**. The first unthrottled Manufacturing case produced a 4.19-second task; first Home and Technology cases also had multi-second tasks. These are observed stalls around initial scene preparation, not field INP measurements or proof that every visit stalls identically. Browser and driver shader warming affect later runs.

Hero resource preparation constructs a PMREM environment before its texture load. Hero and Alpha initialize substantial procedural scenes and begin rendering without the explicit asynchronous shader preparation used by Factory Systems and Lot Story. Moving a large synchronous job into an idle callback does not divide that job into smaller pieces.

**Action:** establish a static artwork state before importing the renderer, stage geometry/environment/shader preparation, reuse an appropriate environment, and precompile materials before the first visible movement. Use a worker for CPU geometry work only where profiling shows it helps; WebGL driver work needs its own preparation strategy. Test opening navigation during this startup, not only after it settles.

### P1 — Public artwork caching is much shorter than application-chunk caching

Deployment checks returned:

| Asset | Cache policy | Observed CDN status |
|---|---|---|
| Light rectangle logo | `max-age=5, stale-while-revalidate` | Miss |
| Transparent hero mark | `max-age=5, stale-while-revalidate` | Miss |
| Hashed Next.js chunk | `public, max-age=31536000, immutable` | Hit; Brotli |

**Action:** publish optimized artwork with content-versioned URLs and a long-lived browser/CDN cache policy. Do not add immutable caching to filenames whose contents are overwritten. Confirm the headers on Amplify after deployment.

The prelaunch document's `private, no-store` policy is intentional. Keep founder and session responses private. Three public response samples took about 2.65 s, 473 ms and 457 ms to receive headers; connection setup, backend warmth and network conditions are mixed into those values, so they do not establish a backend-latency distribution. Reassess public HTML caching when the launch gate is removed.

### P2 — Alpha has a substantial per-frame draw and DOM workload

The Manufacturing tour issued roughly **776 draw calls per animation callback** during its first five seconds, including shadow rendering and other passes. Its two-minute observation recorded a callback-duration p95 of **22.6 ms** on the test machine's AMD integrated graphics, exceeding a 16.7 ms frame budget. Callback duration is not a GPU frame-time or FPS measurement, but this leaves insufficient headroom for a dependable 60 fps claim.

Repeated structures share some geometry and materials, which helps memory but does not automatically batch their draw calls. Every bath's `uTime` advances during playback (`alpha-line-renderer.ts:522`), not just the demonstrated tank. `placeLabels()` reads label dimensions, projects positions and writes `left`/`top` during camera/render updates. React state publication is throttled to meaningful signatures including quarter-second updates rather than every frame, which is a positive existing safeguard.

**Action:** batch/instance compatible repeated structures, simplify or bake stable shadows, leave inactive tanks visually still, and update label placement only when the camera/layout/relevant station changes. Measure before reducing visible detail. The full guided tour does stop at its review stage; the homepage Alpha preview instead continues looping while visible. Consider a single playback plus Replay for that preview.

### P2 — Reduced motion controls animation more consistently than download cost

Factory Systems and Lot Story avoid their initial renderer imports under reduced motion. Home/Technology still initialize a WebGL hero and its resources; Culture/Commons and small cubes also import renderers before choosing their final composition. Reduced-motion Home still transferred **6.01 MB**, essentially unchanged from normal Home.

**Action:** offer an HTML-delivered static scene for reduced motion and constrained-data mode, and choose that path before expensive imports and texture work. Keep motion preference distinct from device capability; a user can prefer stillness on a fast device.

### P2 — Primary hero fallbacks arrive too late in the dependency chain

The initial Home/Technology slot is empty HTML, and Culture/Commons initially render an empty canvas. With JavaScript disabled, Home's heading remains readable but its hero slot remains empty. With WebGL denied, the tested Home restores a complete SVG through the downloaded renderer, so GPU failure is handled; a failed renderer chunk still has no equivalent early artwork.

**Action:** server-render a small composed SVG/image inside the reserved slot and hand it over to the live artwork after a confirmed first frame. Match the initial choreography so a finished still does not abruptly restart as an unassembled lattice. Keep links and headings independent.

### P2 — Fixed quality settings and unmeasured compositing costs

DPR is capped at 1.5 for most scenes and 1.75 for heroes, which is good. There is no site-wide measured quality controller or Full/Balanced/Lightweight ladder. The hero performs multiple render passes and uses half-float render targets for selective blur. The document-height presentation surface applies backdrop blur while the fixed blue atmosphere animates behind it. Desktop CSS atmosphere animation continues after foreground WebGL rests. Mobile and reduced-motion CSS remove much of that movement.

**Action:** add measured quality adaptation covering DPR, blur resolution, shadow quality and inactive water. Preserve the blue movement, using bounded soft forms and testing the glass in isolation. Treat full-surface blur as a profiling candidate; this audit does not establish a precise GPU/compositor cost for it.

### P2 — Performance has no automated regression or field feedback loop

CI runs types, tests, build, secret scan and dependency audit, but has no route transfer budget, scene-ready budget, repeated-navigation GPU-resource check or field Web Vitals reporting. Build output reports roughly **118–128 KB first-load JS** for the content routes, but excludes subsequently requested renderer code and assets. The two largest lazy shared chunks add about **152 KB gzip combined** where requested.

**Action:** record LCP, CLS and field INP by route/device, plus scene-ready time, preparation long tasks, render workload and resource counts. Add a repeatable production-browser budget check. Do not use Next's initial JS column as the total cost of the visual experience.

## Existing behavior worth preserving

- A persistent Home/Technology renderer, cancellable navigation generations, and immediate router navigation rather than waiting for the current assembly to end.
- Rapid last-click navigation and back/forward reached the expected destinations in the tested sequence.
- Factory Systems, Lot Story and Philosophy produced **zero draw calls and zero application RAF callbacks during their one-second settled samples**.
- Hidden-document event testing produced zero additional WebGL draws across all five prepared Home contexts. This tests the application's visibility listeners, not the browser's real background-tab scheduling policy.
- Five Home contexts were prepared after scrolling the page, but offscreen scenes were not all rendering simultaneously. Several idle contexts are a memory-budget question; they do not by themselves justify a total rewrite to one canvas.
- The guided Manufacturing tour settled at review after approximately 45 seconds. Over the two-minute observation, textures/framebuffers stayed stable; no continuing render loop remained after the tour. This does not negate the separately reproduced hero-buffer leak.
- Focused checks confirmed Manufacturing context-loss recovery to its fallback, and WebGL-denied Technology/Culture fallbacks. The standalone entry sequence completed its observed playback window without creating a WebGL renderer. Sampled Home menu interactions took 72–80 ms and the Manufacturing start interaction 40–48 ms; these small samples do not cover every startup stall. One warm Home-to-Technology commit took 911 ms. The rich artwork morph is explicitly 800 ms, with a separate 450 ms desktop fade path, so the current art timing also exceeds the brief's proposed 180–300 ms treatment; decide that choreography separately from route-shell responsiveness.
- Layout dimensions remain reserved, observed CLS is small, fonts are self-hosted with `font-display: swap`, and audio uses `preload="none"`.

## Implementation order and acceptance criteria

1. **Optimize logo and artwork delivery; version image URLs and correct caching.** Proposed initial transfer budget: under 1 MB for Home including its small still; no inactive-theme source logo preload. Verify the artwork visually.
2. **Fix persistent buffer allocation.** At least 30 Home/Technology transitions and repeated idle pulses must return to a stable per-destination GPU-resource baseline after settling and GC.
3. **Make static artwork immediate and stage preparation.** Add scene-ready measurement and eliminate multi-second preparation tasks. Keep essential copy and navigation interactive throughout.
4. **Reduce Alpha frame cost and add adaptive quality.** Set explicit hardware reference devices and test camera detail, interactions and sustained operation. Preserve the plant composition and story.
5. **Add production measurements and CI budgets.** Field goals remain LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 at the 75th percentile. Frame-rate and scene-ready budgets are separate project goals.

## Limits and interpretation

No Lighthouse score is claimed. Local lab interaction timings cannot certify field INP or 75th-percentile Core Web Vitals. Physical Android/iOS, Safari, thermal/battery behavior, regional production full-site loading and precise GPU memory/frame timing remain unmeasured. The two-minute soak is a bounded check, not a long-duration endurance guarantee.

The original unauthenticated local holding-page check hit an IPv6 loopback mismatch (`localhost` rewrite resolved to `::1` while the fixture server listened on IPv4), producing one harness HTTP 500. Public deployment GET checks returned HTTP 200. Intentional WebGL-denial cases emitted expected renderer errors. Neither is counted as an unexplained normal-route failure.

Reference guidance: [Google's Web Vitals definitions](https://web.dev/articles/vitals), [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices), [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading), and [Next.js navigation](https://nextjs.org/docs/app/getting-started/linking-and-navigating). Current Next documentation describes a newer release; conclusions about this site's behavior are grounded in its installed version and measured build.
