# Voltron Lattice: UI, Scroll and Motion Audit

Date: 21 October 2026. Status: audit only; no website implementation changes or deployment in this pass.

## Decision

Keep the current design direction. The connected lattice, Montserrat identity, fixed isometric views, restrained copy and single glass presentation surface form a coherent brand system. The next improvement is execution quality, not another redesign or additional effects.

The important distinction: **artwork placement is now correct in the tested scroll scenarios; frame pacing is not yet consistently smooth during cold setup and rich route transitions.**

## Scope and Evidence

- Reviewed the current local production preview at `http://localhost:3067`, the maintained `DESIGN.md`, shared tokens, route content, animation controllers and inquiry contracts.
- Git baseline is `46eb640`. The local shadow-following and illumination refinements are included in this audit but are not in that deployed commit. This is not a claim that the live production site already contains those refinements.
- Checked all ten normal routes plus `/enter` at 1440px and 390px in both themes: 44 combinations. Added Home, Technology, Partner and Entry at 320px light and 768px dark: eight more combinations.
- Ran normal-motion timing traces at 1440 x 900 dark, DPR 1, and 390 x 844 light, DPR 2. Recorded native wheel scrolling, assembly, conveyor, philosophy, Culture, Commons, Entry and route navigation.
- Chrome reported AMD Radeon / ANGLE D3D11 hardware rendering. These are headless desktop-browser measurements and mobile-sized viewports, not physical iPhone/Android results.
- Rechecked panel-local transition geometry while scrolling; sampled rendered text contrast using computed foreground colours and nearby screenshot background pixels; tested keyboard disclosure/Escape and empty-form validation.
- Browser diagnostics live in the ignored `.audit-logs/ux-motion-audit-2026-10-21` folder. The scripts use normal founder sign-in; no auth bypass, real inquiry submission or saved session credentials.
- The optional Impeccable engine could not initialize because its runtime was unavailable in the sandbox. This report uses repository and browser evidence, not an invented detector score or a formal independent multi-reviewer certification.

Priority: P1 = important before public launch; P2 = next refinement pass; P3 = lower-risk polish. No P0 blocker was established in this UI-focused audit.

## Findings, In Priority Order

### F01 / P1: The rich Home-Technology morph performs redundant rendering and buffer resets

**Location:** [hero-renderer.js](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/hero-renderer.js:656>), [lattice-activity.ts](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/lattice-activity.ts:67>).

**Evidence:** The desktop transition trace had a 33.4ms median callback interval, 83.4ms p95 and 99.9ms maximum. Four additional warm, bidirectional transitions produced 552 canvas dimension assignments, 518 assigning the dimension its existing pixel value. Source inspection shows `morph()` calling `activity.setEnabled(false)` every frame. That setter resets and invokes `onFrame()`, which renders, before `morph()` performs its own final render. The render path itself has six scene/postprocessing submissions. `setPixelRatio()` and `setSize()` also run during every morph update, while framebuffer sizes are repeatedly reconsidered.

**Impact:** The signature transition feels less fluent than the settled artwork. Scrolling during it remains geometrically correct but competes with unnecessary rendering work.

**Correction:** Disable the activity controller once on transition entry; make repeated enabled-state changes idempotent. Keep backing buffers stable during the morph and update viewport/camera framing separately. Only resize when integer pixel dimensions actually change. Reuse geometry calculations and temporary vectors instead of rebuilding maps/string keys per frame.

**Acceptance:** One intended render path per morph tick; no unchanged-dimension canvas resets; no scroll lock; preserve the 800ms choreography, geometry, camera orientation and final logo position. Compare cold and warm traces separately.

### F02 / P1: New 3D scenes initialize in a cluster as scrolling reaches them

**Location:** [HomeScenes.tsx](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/HomeScenes.tsx:12>), [cube-renderer.ts](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/cube-renderer.ts:216>).

**Evidence:** First scrolling into the systems area created four new WebGL contexts in the desktop capture, overlapping tasks of 235ms and 350ms. Its p95 callback interval was 66.6ms. The mobile-sized capture created three contexts in that section and reached 50ms p95 / 100ms maximum. Each enclosure owns a renderer and generates its own environment. A separate cold Culture capture also contained a 449ms task; this did not recur throughout its animation.

**Impact:** The first journey down the page can hesitate precisely when the next visual explanation enters view. Warm captures are substantially calmer, so a simple repeat visit can conceal the issue.

**Correction:** Prepare shared environment/resources during a bounded idle window; schedule scene creation and texture uploads individually instead of initializing several on the same viewport boundary. Keep a correct static composition visible while GPU work is pending. Investigate sharing resources/rendering for the three system enclosures before adding a new abstraction across every scene. Compress delivery textures without changing authored assets.

**Acceptance:** Repeat cold first-scroll traces without the clustered setup stalls. Maintain the asset-first, enclosure-second, single-rotation sequence and offscreen suspension. Verify real phones before making a mobile smoothness claim.

**Causality limit:** Context creation coincides with the stalls and the source exposes synchronous setup work; this is strong evidence for targeted profiling, not a GPU trace proving which individual shader consumed every millisecond.

### F03 / P1: Light-theme text-link contrast does not survive the frosted background

**Location:** [globals.css](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/app/globals.css:68>).

**Evidence:** Technology's 14px, weight-500 "Learn about our approach" uses `#246BD4`. Against its sampled rendered glass background it measured approximately 3.53:1 desktop and 3.57:1 mobile. The comparable dark link measured above 8:1. Sampled ordinary light-theme body copy was around 5:1, so indiscriminately darkening every text role is unnecessary. Entry's sampled final link passed in both themes.

**Impact:** A visually attractive brand blue becomes harder to read when used for small functional text over the grey-blue translucent surface.

**Correction:** Introduce a darker semantic light-theme text-link token, separate from artwork/node blue. Audit its normal, hover and focus appearances over the darkest moving background conditions. Preserve the glass environment and brighter geometric accents.

**Acceptance:** Normal-sized text links meet at least 4.5:1 against their actual composited surface, with margin for changing illumination. This threshold comes from [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). These samples are not a complete site-wide contrast certification.

### F04 / P1: Motion controls do not cover the whole experience

**Location:** [HomeScenes.tsx](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/HomeScenes.tsx:37>), [atmosphere.css](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/brand/atmosphere.css:17>), [entry.css](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/app/enter/entry.css:85>).

**Evidence:** The conveyor runs continuously while visible; Home/Technology sequences last eleven seconds; desktop atmosphere animations continue indefinitely. Normal pages do not provide a user-facing motion pause. On Entry, clicking "Pause animation" paused the rings and foreground but four desktop atmosphere animations remained in `running` state. Mobile atmosphere is already static. Reduced-motion support is present and useful.

**Impact:** Someone can request a pause yet still see movement, or have no convenient control while reading beside automatic motion.

**Correction:** One shared motion preference/controller should cover decorative CSS, Three.js assembly, conveyor and idle lighting. Entry's existing pause should govern its complete visual environment. Keep audio independent and retain completed static scenes for reduced motion. Scope any change to the public coming-soon experience separately rather than silently redesigning it.

**Acceptance:** Pausing leaves a readable, stationary composition and never blocks navigation; resuming preserves progress. Non-essential automatic movement longer than five seconds beside other content needs a pause/stop/hide mechanism under [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

### F05 / P2: Direct section links apply the sticky-header offset twice

**Location:** [globals.css](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/app/globals.css:12>), [presentation.css](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/brand/presentation.css:77>).

**Evidence:** A direct `/technology#architecture` load placed the section top at 204px and its heading at 284px, with the sticky header ending at 81px. Root scroll padding is 100px; `:target` adds another 104px margin. `/#connected-lot` and `/partner#partnership` showed the same 204px target position. Clicking Technology's in-page action instead placed the target at 100px, because that path did not apply the same `:target` state.

**Impact:** The same destination lands differently depending on how it is reached, leaving an unnecessary blank interval and weakening scroll rhythm.

**Correction:** Give anchor clearance one owner, derived from header height plus a small intentional gap. Retain normal document scrolling and section padding; do not fix this with scroll snapping or fixed section heights.

**Acceptance:** Direct links, in-page actions, keyboard navigation and history restoration show the heading below the header with consistent clearance at desktop and mobile widths.

### F06 / P2: Desktop staggering creates an initially empty mobile system illustration

**Location:** [cube-renderer.ts](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/cube-renderer.ts:22>).

**Evidence:** Enclosures use `sequence * 1.4` seconds even when stacked vertically. In the mobile Context sample, the host was onscreen at y=352px but asset reveal remained zero through elapsed 0.52 seconds and was only about 0.074 at elapsed 1.53 seconds. The source assigns the third enclosure a 2.8-second delay, although a visitor may encounter it independently.

**Impact:** A fast reader can see a heading above a seemingly empty illustration area or leave before the explanation forms.

**Correction:** Keep the desktop narrative stagger when all three are visible together. On mobile, begin each newly encountered illustration promptly from its own visibility event, with a short entrance delay at most. Separate resource preparation from the visible animation clock.

**Acceptance:** Each mobile card shows recognizable artwork promptly; preserve asset -> enclosure -> rotation -> local glow -> rest. Do not enlarge the text or change the section layout to hide the timing issue.

### F07 / P2: Conveyor selection and automatic process emphasis communicate different states

**Location:** [lot-flow-renderer.ts](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/lot-flow-renderer.ts:197>), [HomeScenes.tsx](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/HomeScenes.tsx:37>).

**Evidence:** After selecting Verify, the detail panel and `aria-pressed` moved to Verify while `data-process-active` remained Process on desktop and Receive in the mobile-sized capture. Manual selection does not seek or pause the automatic conveyor.

**Impact:** The visitor receives two competing indications of which stage they are inspecting. The animation is presentational, but its relationship to the controls is not self-evident.

**Correction:** Prefer manual selection taking temporary ownership: pause/seek the illustrative cycle to that stage and synchronize the label, node and explanation. Alternatively, visibly distinguish an inspection selection from the autonomous demonstration playhead. Do not imply live manufacturing state.

**Acceptance:** Clicking a stage produces one understandable response in both themes and reduced motion; automatic progression resumes only according to an explicit, consistent rule.

### F08 / P2: Production renderers perform synchronous full-canvas readback for QA metadata

**Location:** [hero-renderer.js](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/hero-renderer.js:488>), [cube-renderer.ts](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/home/cube-renderer.ts:134>), [human-hero-renderer.ts](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/brand/human-hero-renderer.ts:228>).

**Evidence:** Settled renders allocate a full pixel buffer and call `readPixels()` to populate `data-nonblank-samples`. Captured calls took roughly 3-8ms on this GPU. This is not the sole explanation for the much larger cold-start stalls.

**Impact:** Avoidable GPU synchronization is attached to a moment that should simply settle. It also consumes a substantial fraction of a high-refresh frame budget.

**Correction:** Move pixel validation into test-only instrumentation, or enable it only through an explicit diagnostic flag. Bypass the blur passes before the logo/local softening is visible; keep the approved local blur once needed. [MDN's WebGL guidance](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) recommends avoiding blocking production calls and unnecessary framebuffer attachment changes.

**Acceptance:** Default visitors trigger no proof-only pixel readback; screenshot/canvas nonblank checks remain available to the test harness.

### F09 / P3: Entry does not reuse the optimized intro-audio delivery

**Location:** [EntryAudio.tsx](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/entry/EntryAudio.tsx:22>).

**Evidence:** Entry requests the original 11,329,201-byte `Intro.mp3` when music is requested. Coming-soon already has a 4,294,510-byte Opus asset and 5,665,479-byte compatibility MP3, together with playback fallback and lower initial volume. Entry uses `preload="none"`, so this is not an initial page-download penalty.

**Correction:** Share the tested source-selection/fallback and volume policy while preserving Entry's approved manual music selection. Do not reintroduce compulsory autoplay.

**Acceptance:** Manual playback remains predictable and uses the appropriate optimized source; unsupported formats recover without disabling the experience.

### F10 / P3: A partially revealed small diagram can restart after leaving the viewport

**Location:** [small-cube-renderer.ts](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/components/brand/small-cube-renderer.ts:47>).

**Evidence:** Source review: `stop()` clears `start`; the next tick derives `progress` from a fresh zero-time origin, even if an incomplete reveal had already progressed. Completed diagrams correctly stay completed. This brief sub-650ms interruption was not independently pixel-reproduced in this run.

**Correction:** Preserve elapsed reveal time across visibility changes, matching the larger scene controllers.

**Acceptance:** Interrupting a reveal and scrolling back continues smoothly rather than moving the cube backwards. This is lower priority than the measured route/cold-start stalls.

## Scroll and Frame-Pacing Results

RequestAnimationFrame callback intervals are a diagnostic proxy for main-thread pacing, not compositor-presented FPS or field Core Web Vitals. Instrumentation adds some overhead. No artificial CPU/network throttle was applied to the table below.

| Capture | Desktop p95 / maximum | Mobile-sized p95 / maximum |
| --- | --- | --- |
| First 2.5s sampled after Home renderer ready | 17.3 / 333.3ms | 16.8 / 100ms |
| Cold wheel scroll into systems | 66.6 / 349.9ms | 50 / 100ms |
| Systems animation after initialization | 16.9 / 50.1ms | 16.8 / 33.3ms |
| Conveyor while reading | 16.9 / 17.1ms | 16.9 / 66.7ms |
| Philosophy | 17 / 66.7ms | 16.9 / 17.4ms |
| Technology -> Home navigation | 83.4 / 99.9ms | 17 / 266.6ms |
| Culture | 16.8 / 450ms | 16.8 / 33.3ms |
| Commons | 16.8 / 16.8ms | 16.8 / 17.2ms |
| Complete Entry sequence | 16.8 / 17.5ms | 16.8 / 17.3ms |

The mobile navigation uses the shorter fade, not the desktop rich morph. Its isolated long task still means the transition is not immune to cold setup.

**Placement:** Additional desktop checks compared the actual persistent-stage bounds against the expected panel-local interpolation, with and without wheel scrolling during the morph. Maximum sampled positional error was below 0.02 CSS px; settled error was zero. At scroll offsets up to 500px the clip remained consistent with the sticky header. No artwork detaching from the presentation panel was reproduced. Do not replace this correct placement logic as a speculative lag fix.

**Layout shift:** The separate transition captures recorded approximately 0.0009-0.0012 cumulative layout shift. This is a small controlled sample, not a field CLS result.

## Animation Inventory and Refinement Contract

| Scene | Current story | Audit decision |
| --- | --- | --- |
| Home hero | Seven cubes assemble by ~5s; logo 5.4-6s; localized wave settles within 11s | Keep timing/composition. Remove cold/render overhead; retain moving contact shadows and restrained local blur. |
| Technology hero | Central core first; seven separated outer cubes settle by 5.55s; connection then logo 6.7-7.4s; rest by 11s | Keep. Direct Technology navigation intentionally shows the completed composition rather than replaying the intro. |
| Home <-> Technology | Persistent canvas; ~800ms geometry reconfiguration; stable orthographic orientation | Keep the narrative; fix duplicate work and stable buffer sizing. |
| Other route changes | Restrained content/artwork fade | Appropriate. Do not force unrelated hand/emblem art through a cube morph. |
| Execution / Context / Intelligence | Asset, enclosure, one full enclosure rotation, node response, rest; 6.5s plus stagger | Preserve depth-tested artwork inside the enclosure. Adapt stagger on stacked mobile. |
| Connected lot | Lots travel/pause on a glass conveyor; stage indicator follows lead lot | Keep the conveyor. Resolve manual/automatic state ownership and add pause. |
| Philosophy | Outer cube first, inner reveal, small cube rises; five-second sequence | Keep. Current hierarchy communicates individual and whole without explanatory card clutter. |
| Culture | Establish lattice, hold/approach, guided placement/drop, local response; 5.2s | Keep approved placement. Single-pose hand remains an intentional illustration, not a physically rigged release. |
| Commons | Low foundation, anchored emblem reveal, satellites, connection response; 4.2s | Keep. Preserve original emblem proportions and open space around its tips. |
| Small diagram cubes | ~650ms reveal with shared offscreen renderer | Keep resource-sharing approach; fix interrupted progress. |
| Node idle/pointer light | Eight-second still interval, short ~1.4s path; pointer takes priority | Good restraint; preserve shared ownership and offscreen suspension. Connect to global pause. |
| Background lattice | One slow 21s drift/reflection system; static mobile/reduced motion | Keep subordinate to foreground. Do not add more floating objects or brighten the entire glass surface. |
| Entry | Logo hold, three phrase faces, final fully clickable face; 17.2s; manual music/theme | Keep optional brand journey and current layout. Make its pause comprehensive and optimize manual music. |
| Coming-soon | Separate public holding experience, countdown, staged identity/theme preview and optimized audio | Preserve. Sign-in was exercised; full normal-motion holding-page choreography was source-reviewed, not exhaustively retraced as part of the founder-site performance captures. |

## Four Independent Design Dimensions

| Dimension | What works | Refinement, not redesign |
| --- | --- | --- |
| Visual polish | Consistent Montserrat roles, compact headings, recognizable leaf/circuit mark, shared camera/material grammar, calm dark surface | Correct light-theme text-link contrast. Judge glass against actual backgrounds, not white swatches. Preserve logo clearance and local softness. |
| Interaction quality | Native scrolling, meaningful focus/pressed states, keyboard disclosure, static reduced-motion versions, optional sound | Fix cold/morph pacing, anchor ownership, comprehensive pause and conveyor state ambiguity. |
| Information architecture | Home -> connected capabilities -> lot story -> Alpha -> people is a coherent narrative; Technology separates execution, shared meaning and intelligence | Keep stable navigation. Retain targeted links into Ontology and Partner. Final visual hierarchy on empty artwork slots remains conditional on upload. |
| Product intelligence | Evidence/agent/context choices reveal relevant explanations; human review explicitly states it is illustrative and issues no plant command | Link illustrative selection and diagrams using existing frontend state. Never turn decorative pulses into implied live status or invented AI output. |

## Route Coverage and Completion Limits

| Page | Current assessment | Reserved artwork families |
| --- | --- | --- |
| Home `/` | Full visual story present; highest priority is cold scroll, morph and conveyor controls | 0 |
| Technology `/technology` | Distinct central-core story; architecture and modular sections structurally complete | 6 |
| Ontology `/ontology` | Relationship/context explanation and native controls retained; hero/relationship art incomplete | 3 |
| Intelligence `/intelligence` | Evidence sources, specialist examples and clearly illustrative review establish useful hierarchy | 2 |
| Manufacturing `/manufacturing` | Process inquiry path and execution sequence remain legible; largest artwork readiness gap | 8 |
| Network `/network` | Plant/JV contributions and compounding narrative are structurally clear | 3 |
| About `/about` | Purpose, people and leadership information accessible; final image balance not yet assessable | 4 |
| People Culture `/about/people-culture` | Animated hand hero present; lower reference artwork reserved | 5 |
| Commons `/about/voltron-commons` | Animated opened emblem present; nature/participation imagery reserved | 2 |
| Partner `/partner` | Labelled forms, first-invalid focus and explicit async feedback; no real inquiry submitted | 1 |
| Brand Entry `/enter` | Separate headerless/footerless experience; full final-face link; manual controls | 0 |

The asset checker confirms **34 pending families / 68 theme files**, as already requested and documented in [ASSET-UPLOAD-GUIDE.md](<C:/Users/Omkar/Desktop/Voltron/Voltron Website/ASSET-UPLOAD-GUIDE.md:30>). These are deliberate reserved spaces, not broken image requests. Do not fill them with unrelated art or redesign the layout around their temporary emptiness. The site is reviewable, but final artwork completeness should not be described as finished.

## Accessibility and Functional Checks

- 52 layout cases: one H1 and one main landmark, no detected duplicate IDs, no detected unlabelled visible controls/fields, no broken loaded images, no page-level horizontal overflow and no visible buttons below the 24px minimum bounding-box check.
- First Tab reached "Skip to main content". Mobile navigation stayed inside the viewport. Escape closed About and restored its trigger, then closed mobile navigation and restored the menu button.
- Empty production inquiry focused Full name, showed specific required errors, and associated the focused field with its error text. No real inquiry was sent.
- Local founder sign-in succeeded through the ordinary UI. Prelaunch route restrictions and disabled public inquiry submission are intentional, not UI bugs.
- The measured link-contrast and motion-control findings prevent calling this a completed WCAG AA audit. Target-size checks alone also do not establish full accessibility; [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) has shape/spacing conditions beyond a simple bounding box.
- 93 automated tests passed. The first attempt hit a Windows sandbox temporary-file rename restriction before executing tests; the permitted rerun passed all 15 suites.

## Recommended Implementation Order

### Pass 1: Rendering and Scrolling Stability

Keep all approved art and layout. Make activity state changes idempotent, eliminate duplicate morph renders, keep buffers stable, remove production pixel-proof readbacks, then schedule/cache cold GPU setup. Retest exact same cold/warm wheel routes. Preserve panel-local positioning, clipping, free scrolling, direct links and history.

Use a 16.7ms frame interval as the 60Hz engineering budget and 8.3ms at 120Hz, not as a performance guarantee. First eliminate the repeatable >50ms setup tasks and transition regressions. Do not hide stalls by extending every animation or adding a smooth-scroll library.

### Pass 2: Readability and Interaction Coherence

Use a darker semantic link colour only where the frosted light surface needs it. Establish one anchor-offset owner. Connect shared motion pause. Adapt mobile enclosure delays. Resolve conveyor selection/playhead ownership with an explicit rule. Extend tests for these behaviours rather than changing API/data contracts.

### Pass 3: Finish and Release Evidence

Optimize Entry's manual audio; preserve interrupted small-cube progress; upload the reserved art; validate alpha edges, perspective, glass face contrast and logo clearance at the final small display sizes. Test physical iPhone Safari and mid-range Android Chrome, touch scrolling, address-bar changes, 200% browser zoom/reflow, screen readers, reduced motion/transparency and slower-network first visits. Then capture same-size light/dark before/after comparisons and repeat founder review before deployment.

## Product Intelligence: What Is and Is Not in Scope

- **Existing frontend state:** synchronize an illustrative diagram and selected explanation; show selected stage through text and colour; prioritize pointer highlights; coordinate pause and transitions. No backend required.
- **Backend/API-dependent:** real plant status, evidence freshness, inquiry follow-up state, role-specific data or authoritative approval history. Do not simulate these as real facts. The current generic inquiry email labels intentionally adapt legacy storage keys; a cosmetic pass must not silently rename that contract.
- **AI-dependent:** live specialist answers, investigation suggestions or production recommendations require real retrieval/provenance, permissions, freshness, review authority and governance. Existing example questions are explanatory content, not a working AI system.

## Limits and Open Questions

No physical-phone thermal/battery testing, Safari compositor trace, field Core Web Vitals, full assistive-technology session, formal automated accessibility-engine pass or exhaustive worst-frame contrast sweep was completed. The glass layer's separate GPU contribution has not been isolated through controlled A/B profiling; it is a performance risk to measure, not an established reason to remove the accepted glass treatment. Backend persistence/delivery was not exercised with real inquiries. Audience/task priorities are inferred from the maintained project brief, not new user research.

The recommended direction is therefore **the current design, rendered more efficiently and controlled more consistently**. No new palette, layout concept, camera flight, oversized typography or additional decorative layer is proposed.
