# Voltron coherence implementation goal — 29 October 2026

## Scope and completion contract
Preserve approved identity, geometry, story, content, routing, persistent navigation and native document scrolling. Improve delivery, optical framing, typography, selective glass and interaction consistency. No deployment or push. Unfinished sections receive framing/accessibility corrections only. Preserve the current Montserrat until a licensed Montreal asset and explicit typography decision are established.

## Five phases
1. Loading continuity: scene inventory, nearby preparation, eligibility/priority, motion preference changes, bounded failure recovery and observable fallback reasons.
2. Performance: real frame/long-task evidence, adaptive effects, bounded concurrent initialization, offscreen suspension, no scroll interception.
3. Layout/type: shared hero anchors and section rhythm, optical occupancy per artwork family, readable copy measures, 200% text zoom and short-screen coverage.
4. Surfaces/interactions: atmosphere versus reading versus artwork glass; consistent selected/focus/hover states and phone detail dialogs.
5. Verification: one batched route/theme/viewport review; fix demonstrated defects, then one confirmation pass. Hardware FPS remains a separate device check, never inferred from software-rendered Edge.

## Page-by-page work
| Page | Phase 1: continuity | Phase 2: performance | Phase 3: layout/type | Phase 4: surfaces/interaction | Phase 5: acceptance |
|---|---|---|---|---|---|
| Home | Hero priority; eligible next scene prepares while scrolling; diagnose static Lot/philosophy/app/roadmap states | Queue cannot be blocked by an ineligible job; bound active canvases and expensive effects | Hero/app/lot/roadmap optical scale; consistent section headings and single selected Lot record | Preserve two pearl/two smoked app surfaces, local selection light | Cold/warm loads, rapid scroll, roadmap selection, motion off/on, phone fit |
| Technology | Prepare neural hero ahead; architecture and modularity start when visible | Avoid simultaneous heavy initialization; reduce secondary effects before geometry | Left artwork remains; match copy anchors, diagram/detail proportions | Reading glass separate from cubes; keyboard and mobile detail modal | Sequence/direct selection, modal focus, both themes, tablet |
| Ontology | Inventory live puzzle and supporting diagrams; distinguish static diagrams from failures | Pause offscreen; avoid duplicate context rendering | Specific correspondence, clear reading sequence and compact labels | Shared process accents and useful diagram links | Hero-to-detail continuity, keyboard, narrow screens |
| Intelligence | Prepare head early; recover loading state; motion changes apply immediately | Cap ambient projection/particles; no hidden draws | Portrait occupancy and supporting section measures | Preserve face contours and stronger local projection | Cold load, off/on, ambient suspension, phone/light/dark |
| Manufacturing | Prepare component/tank assets near viewport; preserve matching initial pose | Adaptive shadows/reflections/particles; retain component silhouette | Tank text and canvas scale; short laptop and tablet fit | Quality/process cues localized; consistent diagram contrast | Scan/formation/line stages, selection, narrow and short screens |
| Network | Prepare globe; preserve map and exact shell during handoff | Finite rotation; stop after completion/offscreen | Globe optical size versus heading; readable map | Shared pearl/navy globe and purposeful shell emphasis | Geography contrast, both themes, completed fallback and live match |
| About | Prepare stair rigs early; no unexplained poster stall | Model and shadow budgets, finite playback | Two stairs/three people frame and shared headline anchor | Original abstract sculpture, quiet reading surfaces | Formation/ascent/end fit, mobile and reduced motion |
| People & Culture | Prepare head/contribution scene and helix; shared preference handling | Sequence optional scene work; pause both offscreen | Head prominence, diagram-to-copy spacing | Cube family and restrained particle emphasis | Head/cube story, helix selection, mobile composition |
| Commons | Prepare tree artwork; proper recovery/fallback reason | Root particles and foliage effects bounded; stop at completion | Tree enclosure scale and copy alignment | Glass faces/corners, root-only energy and selective foliage | Whole silhouette at all sizes; live/fallback theme match |
| Partner | Prepare Eric/Carla ahead; respect shared motion controls | Adaptive shadow quality; finite 12-second story | Document readable on phone without clipping figures | Shared-brief contrast and exact emblem; natural arm paths retained | Rig clearance, sequence stages, 34 layout states and playback/fallback checks |
| Enter / Coming Soon | Preserve intentional entry behaviour and exact identity tile | Limit simultaneous ambient effects | Logo/countdown/header alignment | Source of truth for identity glow | Short phone, reduced motion, theme and countdown wrapping |

## Static artwork fidelity (added user requirement)
Static fallbacks must look like premium finished artwork, not low-resolution substitutes. Audit natural dimensions versus displayed CSS size and device pixel ratio. Capture the actual renderer with matching camera, theme, geometry and pose; never upscale a small old image and call it HD. Generate responsive 1x/2x candidates, including a large desktop derivative where justified by actual display size. Prefer lossless or visually verified high-quality alpha WebP/AVIF where supported, retaining WebP compatibility. Validate fine particles, logo edges, glass highlights and gradients at 100% and 200%. Reserve dimensions to prevent layout shift. Deliver only the needed theme/size when possible. Re-evaluate existing per-artwork byte limits against measured quality: no blanket 4K download on phones, no arbitrary compression that destroys detail. This applies to intentional stills and loading/error/reduced-motion alternatives.

## Evidence and progress
- Baseline: production build passed; initial route JavaScript <=180 KB under existing budget checker. This is not a measured device-performance score.
- Recent Partner: 34 responsive states and 8 lifecycle/fallback checks passed; eight focused rig/story tests passed.
- Recent Intelligence: 12 viewport/theme/static-live cases and ambient lifecycle passed.
- Current batch: implement queue eligibility repair and consistent shared motion handling; expand prewarm distance without starting playback offscreen.
- Remaining: bounded transient retry/priority, route-wide metrics and captures, HD derivative audit, hardware profiling, layout/surface verification. These are not marked complete by the baseline tests.

### Batch 1 completed
- Queue chooses eligible work rather than waiting behind an ineligible head job; ten preparation tests pass.
- Six hero/supporting scene wrappers use the shared motion revision and fresh canvas identity on preference changes. This fixes a verified off/on/off/on context-loss regression.
- Preparation margins increased from 60�80px to 450px for these wrappers; renderer visibility remains responsible for playback.
- Intelligence clears its loading lock even when import/mount fails.
- Production build and existing route/asset budgets pass.
- Seven live scene-family tests pass motion off/on/off/on on phone, with no page/shader errors or document overflow. Evidence: `.audit-logs/coherence-20261029/results.json`.
- Poster metadata inventory saved at `.audit-logs/coherence-poster-resolution.json`: multiple 640px sources confirmed; high-resolution replacement remains pending.
- Phases 1�2 remain in progress. Full page layout/surface and HD delivery work remains open.

### Batch 2: high-density completed artwork
- Twenty high-quality alpha WebP captures (ten scene families, two themes) generated directly at 1280–1920px from production WebGL; no bitmap upscaling.
- Shared ScenePoster, engineered heroes and About/Partner now offer responsive width candidates for completed fallback artwork. Baseline images remain available for standard-density delivery.
- Capture mode preserves buffers in four delegated renderers; the capture script rejects empty pixels. Production rendering does not enable buffer preservation.
- A separate 1.2 MB ceiling bounds high-density alternatives; original baseline and initial-JS budgets remain enforced. The largest current HD capture is below 670 KB.
- Twenty-four production browser checks verify actual currentSrc selection at 1x/2x density across six routes and both themes; no overflow or page/shader errors.
- Partner/About adaptive quality now disables shadow rendering at the lightweight quality tier.
- Remaining HD scope: native opening frames and Home supporting stories; the full static-artwork requirement is still open.

### Batch 3: current whole-site measurements
- Twenty-four production route cases (12 routes, desktop/light and phone/dark) report no horizontal overflow, missing assets, duplicate IDs, missing labels or automated WCAG violations. Translucent-background contrast remains manually unproven where axe reports incomplete checks; no compliance claim is made.
- Twenty hero captures and measured anchors show every marketing hero title starts at y=302px on 1440x900 and y=156px on 390x844. Existing canonical framing is working; no arbitrary headline repositioning is justified.
- Optical contact sheets expose a stale standard-density Ontology completed poster. Standard completed captures are being synchronized with the actual live-rendered HD scene rather than preserving the older diagram.
- Evidence: `.audit-logs/coherence-layout-20261029/results.json`, `.audit-logs/coherence-heroes-20261029/results.json` and contact sheets.
- Remaining verification: tablet/short-height/text-zoom matrix, dark desktop/light phone surface review, heavy-scene performance profiling, opening/native fallback fidelity and supporting Home artwork.

### Batch 4: reflow and preparation priority
- Home's preparation queue now re-evaluates eligible scene priorities when work can start. Currently visible scenes take precedence over more distant scenes after a fast scroll. Lot, philosophy and retained factory views provide their live proximity; eleven queue tests pass.
- Thirty-six route/viewport cases cover 820x1180 tablets, 1280x720 laptops and 390x844 phones with doubled text.
- Corrected clipped enlarged labels in Technology architecture, Ontology nodes/actions, Network cycle and About discipline controls. Labels wrap within their touch surfaces and use scalable line height.
- Enter/Coming Soon's lettered wordmark can wrap into complete words under text enlargement.
- Shared motion-off state now rests decorative atmosphere animation too.
- Confirmation reports no horizontal document overflow and no remaining visible text-width clipping. Three intentional screen-reader descriptions remain flagged by the raw width detector and are excluded from the visual-defect conclusion.
- Production build, eleven focused tests and performance budgets pass. Evidence: `.audit-logs/coherence-reflow-20261029/results.json`.
- Still open: full optical/surface confirmation on dark desktop/light phone, opening-frame and Home-story HD capture/delivery, transient-failure recovery, bounded scene preparation across supporting pages and performance evidence during real scroll/playback. Tablet geometry collision checks at doubled text require visual confirmation beyond width-only measurements.

### Batch 5: supporting-page preparation and recovery
- Six supporting hero/helix wrappers now use ScenePreparationObserver and the shared eligibility/priority queue. Initialization is serialized, visible targets take precedence, and pending work is cancelled on unobserve/disconnect.
- Loading failures record an explicit asset-or-renderer fallback reason and receive one automatic retry after 700 ms. Each retry gets a fresh canvas; persistent failures remain on the completed fallback. Intentional static preferences never initiate a retry.
- Operating-system reduced-motion changes now recreate optional canvases consistently, fixing the settled/frozen renderer case on re-enable.
- Twelve focused preparation tests pass, including cancellation of queued supporting-page work.
- Production browser evidence verifies recovery after one aborted Carla model request and exactly two total attempts on persistent failure. Seven scene families pass both repeated site motion toggles and OS reduced-motion toggles. No page/shader errors or horizontal overflow in these cases.
- Production build and asset/route budgets pass. Evidence: `.audit-logs/coherence-retry-20261029/results.json` and `.audit-logs/coherence-20261029/results.json`.
- Remaining: native opening and Home supporting-story HD assets, full scroll/playback performance measurements, optical confirmation of enlarged diagrams and dark-desktop/light-phone surfaces, and final interaction regression across pages. The full goal remains active.

### Batch 6: matching high-density opening artwork
- Captured sixty 2x opening images directly from ten live scene families across native desktop/mobile/tablet/short/tall layouts and both themes. Pixel dimensions follow the actual CSS projection frame, not an enlarged old bitmap.
- Capture-only poster-dpr=2 permits a genuine 2x render buffer without changing normal live-rendering caps. Empty alpha captures and incorrect dimensions are rejected by the capture tool.
- Responsive picture sources now offer matching 1x/2x pairs. Their standard versions are downsampled from the same capture so camera, theme and opening time stay synchronized.
- Fifty-eight production browser checks verify actual currentSrc selection across all ten families, both themes, density 1/2 and the extra manufacturing/People screen variants.
- Largest current HD opening is approximately 505 KB. Baseline <=200 KB, HD <=1.2 MB and initial route JS limits pass. Production build passes.
- Evidence: `.audit-logs/hd-openings-20261029/results.json`, `.audit-logs/hd-opening-delivery-20261029/results.json`, `lib/scene-hd-openings.json`.
- Remaining image scope: Home supporting stories (Lot/philosophy/process/app previews/roadmap where raster fallbacks are used). Remaining goal scope also includes real-scroll/playback measurements, enlarged diagram optical confirmation, dark-desktop/light-phone surface review and final interaction regression.

### Batch 7: Home raster fidelity and lifecycle
- Thirty-two genuine 2x captures cover the Home identity, philosophy, three-tank process and all Receive/Process/Verify/Dispatch Lot states in both themes and desktop/phone layouts. Four further native captures cover process openings. Standard assets are derived from the same renderer pixels; no old bitmap is enlarged.
- Home ScenePoster sources use the shared HD delivery helpers. Lot responsive picture sources select matching 1x/2x device and stage captures.
- Application diagrams and roadmap use vector fallback geometry, retaining resolution independence.
- Home Lot/process/philosophy/roadmap now receive new canvas elements when their motion revision changes. Reset also clears the previous renderer state and hidden flag before loading.
- Production verification passes sixteen Lot HD selections across desktop/phone and both themes, plus repeated motion recovery for all four supporting scenes. Scene is brought back into view after the preference-induced app-section layout change; offscreen preparation is not mistaken for playback failure.
- Build and budgets pass; Home initial route JS remains about 139 KB. Evidence: `.audit-logs/home-hd-20261029/results.json`, `.audit-logs/home-process-opening-hd-20261029/results.json`, `.audit-logs/home-coherence-20261029/results.json`.
- Still open before full completion: inventory fidelity of the Manufacturing 13-tank detail fallback and retained BrandArt surfaces, scroll/playback profiling, enlarged-diagram optical confirmation, dark-desktop/light-phone surface review and final interaction regression. The goal remains active.

### Batch 8: Manufacturing, enlarged diagrams and live scroll evidence
- Manufacturing's 13-tank scene now uses queued preparation, the shared bounded retry/motion lifecycle and fresh canvas identity. Playback state and paused choice are retained across reduced-motion changes.
- Added matching standard/2240x1200 HD plant overview captures in both themes; ScenePoster serves them responsively.
- Optical inspection found a genuine overlap of Ontology records on phones with doubled text. Mobile layout now flows in rows and grows with text; measured edge/rail connectors preserve all seven authored relationships without crossing labels. Desktop layout remains the original diagram. Confirmation detects no overlapping controls in the six enlarged-text targets.
- Reviewed the dark desktop hero family and reduced supporting-page background cube opacity to keep artwork and reading in front; Home's approved background is excluded.
- Eight scene families pass shared/OS motion cycles, including the 13-tank detail. Eight live route scroll tests verify actual initialized WebGL contexts and zero further draws after moving to the footer. Retained BrandArt image arrays are empty on the tested routes, confirming those surfaces use SVG rather than low-resolution raster substitutes.
- Live trace records large startup long tasks (approximately 2–6 seconds on some scenes in this test environment), so performance is NOT complete. Initial scene/environment/material preparation needs profiling before final sign-off. These browser traces do not certify real-device GPU frame rates.
- Evidence: `.audit-logs/coherence-scroll-20261029/results.json`, `.audit-logs/coherence-optical-20261029/results.json`, `.audit-logs/coherence-20261029/results.json`.
- Remaining: isolate startup long-task causes and reduce avoidable synchronous work; confirm final phone/dialog/navigation interactions and accessibility on the current diagram; complete requirement-by-requirement closure. Goal remains active.

### Batch 9: startup preparation and interaction confirmation
- Live CPU profiles identify synchronous first-use shader work on the AMD Radeon D3D11 renderer. Premature tuning/resize callbacks were drawing before asynchronous compilation. Home, Neural, Intelligence and Commons now retain their matching poster while preparing the actual material state, then draw and reveal. Neural initializes its instance colours before compilation, preventing a new shader variant on first draw.
- Technology's profiled first-use shader samples fell from about 2.5 seconds to about 0.54 seconds. Intelligence's largest initial task fell from about 4.9 seconds to 0.87 seconds in the initial comparison. Commons' later profile reports a largest task of 186 ms. These are environment-specific measurements, not universal frame-rate guarantees.
- The remaining People stall was traced to PCFSoftShadowMap, which Three.js 0.186 has removed. Its internal fallback changed the shader configuration during the first draw. People, Partner and Ontology now request PCFShadowMap directly, preserving the effective runtime shadow appearance. An experimental two-sided warmup helper did not resolve the cause and was removed.
- Twelve production browser interaction cases pass: phone architecture/process dialogs open with focus inside, close on Escape, restore trigger focus and body scrolling; desktop selection stays inline; all seven Ontology relationships remain with selected-record interaction and no automated WCAG violations in that component; Network selection, Manufacturing keyboard tabs and route/theme persistence pass at 390px and 1440px.
- Production build passes after the final shadow correction. All 59 test files / 267 tests passed immediately before that constant-only correction. Initial route JS remains 120–139 KB for the marketing pages, under the 180 KB ceiling. Earlier HD delivery, fallback, reflow and lifecycle evidence remains recorded above.
- The final live-scroll rerun after the shadow correction was NOT executed: automatic approval review failed because its usage limit was reached. This is a review-service failure, not an unsafe-action finding. Do not infer the final performance result from the earlier trace. The last executed eight-route scroll pass still proves offscreen suspension and no document overflow, but predates the final startup fixes.

## Current acceptance ledger
| Scope | Current evidence | Status |
|---|---|---|
| Detailed page-by-page five-phase plan | Scope contract and page matrix above | Complete |
| Sharp static alternatives | Native 2x captures, matched standard derivatives, responsive currentSrc checks; vector app/roadmap diagrams | Implemented and verified |
| Loading and preference continuity | Serialized eligibility/priority queue, bounded recovery, repeated shared/OS motion cycles | Implemented and verified |
| Cross-page layout and readable text | 24 route/theme cases, 36 reflow cases, 20 hero anchors, enlarged Ontology correction | Implemented and verified |
| Selective surfaces and interactions | Supporting atmosphere adjustment; 12 final interaction cases; enlarged controls wrap | Implemented and verified |
| Startup performance | Profiles, guarded first draws, instanced-colour preparation and supported shadow mode | Implemented and verified; remaining device-dependent startup cost documented |
| Offscreen rendering | Actual draw counters stop on eight live routes in previous run | Verified on final eight-route rerun |
| Production build and budgets | Final build passes; asset/route budgets pass in preceding build | Final build and budgets pass |
| Whole-goal completion | Final Home confirmation, eight-route suspension and bounded verification evidence below | Complete |

No deploy, push or commit was performed. Hardware frame-rate certification across physical phones/tablets is outside what these browser traces can establish. Preserve that distinction when reviewing performance. No real inquiry was submitted.

### Final scroll confirmation (approval service recovered after its reported reset)
- The retry executed successfully: eight live routes, no page/shader errors, no horizontal overflow, and actual offscreen draw suspension on every route.
- Largest observed tasks: Home 6744 ms, Technology 134 ms, Intelligence 198 ms, Manufacturing 700 ms, Network 969 ms, People 148 ms, Commons 224 ms, Partner 957 ms. This confirms the People shadow correction; Home still needs isolation and improvement before performance completion.
- Final asset/route budgets pass. Latest full suite: 266/267 passed with one unchanged ledger test hitting its explicit five-second timeout; that file's focused rerun passed all six tests in 928 ms. Earlier full 267-test run passed. No inquiry code was changed.
- Remaining final performance investigation continues. No deployment or push.
### Remaining Home task isolated
- CPU/GL stacks identify Roadmap's first draw as the remaining multi-second shader burst (chunk 5656). Roadmap now awaits asynchronous material compilation before revealing the live scene, with disposal of a late mount if the wrapper unmounts. Visual materials and sequence are unchanged. Build/browser confirmation is in progress; do not mark this change verified yet.

### Closure: verified final Home correction
- Final production build and all asset/initial-route budgets pass after Roadmap's asynchronous preparation. Home remains approximately 139 KB initial route JS.
- Home's largest recorded long task is now 681 ms (previously 6744 ms), with no page/shader errors, no overflow and confirmed offscreen suspension. Other routes retain the final eight-route evidence in `.audit-logs/coherence-scroll-final-eight-20261029.json`; Home confirmation is `.audit-logs/coherence-scroll-20261029/results.json`.
- Sixteen Home Lot responsive HD selections and repeated motion recovery for Lot, three-tank process, philosophy and Roadmap pass on the final build. Evidence: `.audit-logs/home-coherence-20261029/results.json`.
- Completion audit: the original five-phase scope is covered by the page matrix, matching HD assets and actual currentSrc checks, queue/retry and motion lifecycle tests, route/theme/viewport/reflow/optical evidence, current mobile dialog and keyboard checks, production build/budgets and measured live-scroll evidence. No remaining required implementation or verification item is open in this bounded coherence pass.
- Limits retained: startup tasks of roughly 0.1–1 second remain device-dependent; these checks do not certify sustained frame rates on every physical device. Automated contrast analysis is incomplete over some translucent backgrounds, so no WCAG certification is asserted. The recorded unchanged ledger timeout passed its focused rerun; the earlier full 267-test suite passed.
- Goal complete. No deployment, push, commit, foundational redesign or real inquiry submission was performed.