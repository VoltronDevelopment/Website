# UI/UX Refinement Progress

## Step 1: Transition Rendering and Diagnostic Readback

Implemented and verified locally on 21 October 2026. No deployment in this pass.

- F01: unchanged lighting state no longer redraws. The transition disables lighting once rather than resetting it on every animation tick.
- F01: the morph reserves a stable buffer envelope; the orthographic camera and panel-local artwork bounds still follow the actual display size. A shared sizing helper guards canvas and render-target allocations, including display-density changes.
- F08: proof-only full-canvas readbacks require `?diagnostics=pixels`. Normal rendering still publishes readiness and theme metadata. Gaussian blur passes are skipped until the logo's local blur becomes visible; the completed treatment is unchanged.
- Preserved existing local shadow/glow edits. Concurrent Alpha work was left untouched. No layout, typography, entry/coming-soon choreography, asset replacement or inquiry/API changes were made by this step.

### Verification

- Production build passed in isolated `.next-refinement-build` output, leaving the existing preview build intact.
- 97 tests passed at the initial rendering checkpoint, including four new rendering regressions. The final shared-workspace rerun passed 104 tests across 17 suites, including concurrent Alpha additions. Production build and standalone type checking passed.
- Sixteen desktop/mobile-sized, light/dark route checks covered Home, Technology, Culture and Commons with zero default proof readbacks and no page errors or page overflow.
- Explicit diagnostic mode still produced nonzero pixel samples in all four tested theme/viewport combinations.
- Four comparable transitions reduced canvas dimension assignments from 552 to 8. The remaining assignments accompany genuine transition-boundary size changes, not repeated per-frame reallocation.
- Scrolled and unscrolled morph placement stayed within 0.02 CSS px of the expected panel-local position; settled error was zero. Screenshots retained the glass depth and logo treatment.
- Initial traces suggested better frame pacing, but repeat testing showed the warmed baseline can also reach a 16.7ms median. Do not claim a guaranteed 2x FPS improvement. Isolated spikes persist, and cold initialization still needs its own measured pass.

Local review: http://localhost:3068/

Ignored diagnostic evidence: `.audit-logs/refinement-step-one`, `.audit-logs/refinement-step-one-baseline`, and `.audit-logs/ux-motion-audit-2026-10-21/scroll-refined.json`.

## Step 2: Nearby Scene Preparation

Implemented locally on 22 October 2026. No deployment in this pass.

- F02, scheduling portion: Home's nearby scenes share a serialized, cancellable preparation queue. Each job yields to input; failures do not block later jobs.
- Defer optional setup while the opening hero is actively rendering and at least 60% visible. Hidden documents do not start optional preparation.
- Preserve the concurrently introduced single-renderer Factory Systems composition. Removed the superseded enclosure-sharing prototype rather than introducing a competing renderer path.
- Factory Systems, conveyor and philosophy preparation starts near visibility. Cube preparation waits for assets and shader compilation; disposal releases the queue even when preparation has not finished.
- Corrected a narrow chapter-navigation type in concurrent Manufacturing code that blocked the production build; no navigation behaviour was changed.

### Verification

- Initial checkpoint: 128 tests across 20 suites passed, including nine queue/foreground-guard tests. Final shared-workspace rerun: 135 tests across 21 suites passed, including concurrent additions. Windows sandbox cache permissions required running Vitest outside the sandbox; successful runs used two workers.
- Isolated production build `.next-loading-final` and standalone TypeScript checks passed.
- Chrome checks at 1440px and 390px in both themes verified deferred initial preparation, one Factory Systems canvas, pause/resume, offscreen progress retention, six-second completion, stopped rendering after completion, replay and subsequent philosophy initialization.
- Reduced-motion checks at 320px and 768px retained complete loaded artwork without creating the Factory Systems GPU renderer. No page overflow was detected in these checks.
- Screenshots inspected at desktop/dark and mobile/light confirm nonblank artwork and retained composition. These are desktop Chrome viewport tests, not physical-phone performance certification.
- Home/Technology transitions remained panel-local while scrolling: maximum measured positional error below 0.02 CSS px; settled error zero. Four transitions retained eight boundary canvas-dimension assignments.
- Sixteen light/dark desktop/mobile-sized route regressions passed across Home, Technology, Culture and Commons, with zero default proof readbacks, page errors or detected page overflow. Explicit diagnostic pixel sampling remained nonzero in all four theme/viewport combinations. Warm traces still contained isolated stalls and were taken alongside other browser work; they are not a controlled FPS benchmark.
- Do not reuse the discarded enclosure-sharing prototype's timing numbers as evidence for this implementation. Cold GPU costs are deferred/serialized, not eliminated; no guaranteed frame-rate improvement is claimed.

Local review: http://localhost:3073/

Ignored evidence: `.audit-logs/loading-final/`. The preview is an isolated build snapshot; unrelated concurrent work may continue changing the source workspace.

## Step 3: Readable Links and Anchor Clearance

Implemented locally on 22 October 2026. No deployment in this pass.

- F03: normal website presentation surfaces define a semantic text-link colour, #174F9E in light and the existing blue in dark. Artwork blue, nodes, glass, source assets and typography are unchanged. Shared links, navigation text states and selected manufacturing text use the semantic role. Entry and coming-soon retain their original colour roles.
- F05: root scroll padding now owns the header height, divider and 20px gap. Removed additive margins from Home sections, presentation targets, inquiry panels and Alpha. No JavaScript scrolling override or scroll locking was added.
- Preserved concurrent Factory Systems, Manufacturing and new connected-lot work. The first build encountered an unfinished lot-scene import; the subsequent build passed after those files arrived.

### Verification

- Initial checkpoint: 147 tests across 23 suites passed, including two new parsed-CSS regression tests protecting semantic colour separation and single-owner anchor clearance. Final shared-workspace rerun: 162 tests across 25 suites passed, including concurrent additions. Isolated production build `.next-readability-build`, standalone TypeScript and strict static design audit passed.
- Actual glass-background pixel samples for Technology's small secondary link: light minimum rose from 3.36 to 5.24:1 desktop and 3.57 to 5.56:1 mobile. Normal, keyboard-focus and hover states passed. Dark retained its original colour and measured at least 8.40:1 desktop / 7.48:1 mobile in the sampled normal/focus states.
- Nine deterministic positions across the desktop background's complete 42-second outward/return cycle passed in both themes. These are sampled composited backgrounds, not an exhaustive site-wide accessibility certification. Sampling masks label ink with transitions disabled; otherwise label antialiasing contaminates the background measurement.
- Ten fresh-tab direct links covered Architecture, Connected Lot, Production, Partnership and Alpha at 1440px and 390px. Every tested target landed 20px below the sticky header with zero additive margin and no page overflow. Keyboard activation, back restoration and normal-motion smooth anchor navigation also passed at both widths.
- Earlier sequential full-page `goto` runs intermittently failed to apply a fragment scroll, rather than producing a wrong offset. Fresh-tab direct URLs and separately tested in-app/history paths passed; repeated full-load restoration remains an interoperability observation to recheck, not a reason to add a speculative scrolling override.
- Desktop/light and mobile/dark screenshots were inspected; artwork remained nonblank and layout was retained. No real inquiry submission was sent.

Local review: http://localhost:3075/ (isolated build snapshot).

Ignored evidence: `.audit-logs/readability-anchors/` and `.audit-logs/readability-baseline/`.

## Remaining Audit Items

1. F02: measure remaining cold costs, including Culture/Commons and actual mobile hardware. Home preparation scheduling is implemented; site-wide performance is not closed.
2. F03: the audited link is corrected; extend contrast checks to newly introduced lot/Manufacturing controls and all eventual artwork states before claiming site-wide AA compliance.
3. F04: comprehensive page/Entry pause behaviour, independent of audio.
4. F05: offset ownership is corrected; recheck repeated full-load fragment restoration across supported browsers.
5. F06: reassess mobile reveal timing against the new single-clock Factory Systems animation; the legacy three-enclosure stagger is superseded.
6. F07: reassess selection/playhead ownership against the concurrent new connected-lot story; preserve that work rather than patching the superseded conveyor UI.
7. F09: reuse optimized audio delivery for Entry without changing manual playback.
8. F10: retain incomplete small-cube reveal progress after visibility interruptions.

The audit baseline remains in `UI-UX-MOTION-AUDIT-2026-10-21.md`. These checkpoints cover rendering and Home preparation, not the entire refinement programme.
