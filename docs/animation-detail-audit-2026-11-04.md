# Animation detail audit — 4 November 2026

## Scope and evidence

Audit only. No application implementation, asset replacement, push or deployment was performed.

Reviewed current renderer/timeline/material/particle/lifecycle code across Home, Technology, Intelligence, Manufacturing, Network, About, Commons, Partner and entry timelines. Browser sweep used the current production build locally at 1440, 768 and 390 CSS pixels: 24 route/viewport cases, 94 section samples, zero uncaught page errors and zero document horizontal overflow. These were normal-motion, dark-theme section-entry samples, not full-cycle recordings. Additional light-theme desktop/phone captures examined the completed Network envelope, About capabilities, Partner at 8 seconds and Technology inspection around 63 seconds.

Browser artifacts: `.audit-logs/animation-detail-20261104/report.json`, section PNGs, and `focus/`. Browser uses software graphics; do not infer physical-phone frame rate from it. Some section screenshots include a sticky header or focused skip link due to automated scrolling/capture; these are not independently established page defects. Early particle captures are not evidence of failed loading. Entry routes received source review, not a fresh full browser cycle. Every-frame collision and rig validation remains part of the proposed implementation verification.

## Highest-value confirmed issues

1. **Home fragment handoff loses volume instantly.** `components/home/hero-timeline.ts` removes upper parents at 3.6 seconds. Non-retained children start at scale `.1*n` even though their geometry is already subdivided to `1/n` in `home-reveal-renderer.ts`. A half-size child starts at scale .2; a third-size child at .3. Most volume disappears at breakup instead of separating first. Start with scale 1 at the parent's exact grid position; separate, retreat, then shrink continuously. Avoid a new-object flash.
2. **Home depth shrink is very small after that initial jump.** Fragment scale changes only about 4% over its travel. The orthographic camera supplies no natural perspective shrink. Explicitly map scale to retreat distance, preserving a readable separation phase before distant fade. Two retained cubes should remain rigid: the current impact permits about 22% squash, which reads like rubber rather than glass. Use a short contact settle and changing contact shadow instead.
3. **Technology camera smoothing depends on frames.** `operating-renderer.ts:93` uses `.lerp(...,.09)` each draw. At 30 Hz the same move takes roughly twice as long as at 60 Hz. Use delta-based exponential damping or an absolute-time camera trajectory. Seeking should resolve to a deterministic pose without borrowing the previous camera's motion history.
4. **Technology transfer speed is uneven.** `operating-model.ts` moves the transfer from x=-4 to x=8 in one canonical second (59–60). Numerical sampling gives approximately 18 scene units/second peak speed at 59.5. Adjacent loading/inspection moves are much slower. Boundary samples at 24/41/50/58/67/78/82 seconds showed no large positional jump; this is primarily a speed/acceleration problem, not evidence of a remaining diagonal teleport. Allocate travel duration by path length; preserve separate lift, translate, turn, lower, support and release phases.
5. **Labels have incomplete exclusion rules.** `operating-label-layout.ts` checks canvas edges and occupied label rectangles, not projected equipment silhouettes, controls or digital panels. Reserve screen-space exclusion zones; anchor leaders at real ports; hold a candidate while it remains valid to avoid side switching. On phones retain one meaningful label and put secondary detail in the existing sheet.
6. **Rapid roadmap selection can jump.** `roadmap-renderer.ts` stores `fromPhase=phase` on selection rather than the currently displayed interpolated cell transforms. A second click during a transition starts from the previous destination. Snapshot current transforms, material state and envelope coverage before retargeting. Reverse progression should dissolve excess cells rather than hide them immediately.
7. **Network idle scheduling is unfinished.** Both `network-renderer.ts` and `authored-renderer.ts` schedule the next animation frame before checking paused, hidden or offscreen state. They skip drawing, but keep callbacks alive. Cancel scheduling and wake on visibility/selection/theme changes. Keep only the explicitly requested visible shared-mesh pulse running.
8. **Context-loss recovery differs by section.** About has explicit lost/restored lifecycle. Commons sets ready=false on loss but has no restored listener; Technology sets fallback on loss without rebuilding; Network disposes on loss without a normal retry path. Standardize one recoverable lifecycle with a matching fallback and one bounded retry. Do not resume drawing into a lost context from selection/theme callbacks.
9. **Formation methods do not yet share a consistent visual quality.** Connected Lot uses a shared material coverage field and sampled component particles. Network authored scenes combine a global clipping plane with an initial point cloud; subsequent factories largely clip into view. Commons clouds converge through simple sine offsets. StoryFormation distributes samples by triangle count, not surface area, which can overweight finely tessellated regions. Use surface-area-weighted samples and the same local reveal field for geometry and particles. Keep direct deposition for industrial scenes; do not add waves everywhere.
10. **Agent time can jump on re-entry.** `orb-renderer.ts` skips updating offscreen slots while the shared clock continues. `fluid-cube-materials.ts` advances fluid phase with the resulting full delta, while formation spring delta is bounded. Re-entering cards can jump in flow phase while their formation catches up. Define per-agent active time or resynchronize both fields consistently with a brief entry blend.
11. **Visible Partner floor clipping.** Light-theme 8-second captures show the cast shadow terminating at a straight right edge. Increase/fade the receiving surface and keep shadows within the composed frame. This is more distracting than insufficient glow.
12. **Phone network legibility.** The completed five-factory composition fits at 390 px, but factories, feeder lines and the mesh occupy a small central region. Two sets of chapter controls also repeat the selection story. Use a tighter phone camera and one compact chapter control, while preserving the whole network's relationship. Avoid reducing whitespace indiscriminately; enlarge meaningful objects first.

## Page-by-page refinement specification

### Home
- Hero: exact parent-to-child geometry continuity; coherent retreat direction; explicit distance-based scale; rigid retained-cube landing; synchronize material reflections, contact shadows and settling. Preserve the exact approved identity tile and its protected readability area.
- Limit visual competition: breakup/landing first, logo reveal next, low-amplitude tile pulse last. Maintain one strongest light event at a time.
- Application previews: graph pulses follow actual connector paths and stop at port boundaries. Keep product identities distinct; shared timings should not make four screens perform identical beats.
- Connected Lot: preserve the shared part and direct particle deposition. Add a readable scan hold, align conveyor/contact movement and finish particle dispatch before clearing the physical object. Active detail must follow the same clock as the artwork.
- Three-tank teaser: keep short and recognizable; reuse the physical lift/transfer language of the detailed line rather than inventing another machine rhythm.
- Roadmap: retarget from current transforms, preserve cell volumes, hide internal faces consistently, grow the same shared globe topology and make final illumination a clear but restrained event. Keep the milestone path attached to tablets.
- Philosophy cube: verify every selected/replay path completes particle formation before descent, aligns with the enclosing cube and resolves inside it. No lingering origin point, duplicate face or particle cloud after completion.

### Technology
- Factory: physical support and ownership of the part must be explicit through receiving forks, fixture, cart, booth and dispatch. Use one authoritative part transform and attachment state.
- Slow the long post-process cart transfer relative to its path; preserve current compressed tank processing without speeding up inspection/review comprehension.
- Pallet bridge: extend, dock, unload, retract; truck doors close before movement. Fork extension must not look like elastic geometry; use a designed telescoping mechanism or move the vehicle to complete the reach.
- Inspection: separate the workpiece, glass enclosure and scan plane by contrast. Use a thin bright scan core, low-opacity plane, surface response, short evidence hold, then release indicator. Avoid illuminating the whole booth equally.
- Digital layer: source numbers from active equipment/records, travel through the reserved gap, fade into the receiving screen. No numbered cubes. Persistent numeric flow can remain, but evidence handoffs must be distinct events.
- Product graphs: fixed node centres, port-aligned orthogonal connectors, arc-length packet travel and stable labels. Keep the current concise diagram approach.
- Modularity: maintain plug -> contact -> glow -> machining selection -> detail reveal. Selecting a process midway should retarget cleanly, not replay unrelated assembly.
- Integration: align highlight timing with the equipment and corresponding digital screen; keep semantic relationships distinct from physical transport.

### Intelligence
- Hero: retain readable face contours. Shape the bottom projection to the face footprint, use graded rather than uniform rays, keep facial details stronger than the cone. Do not reintroduce the removed hand.
- Evidence workpiece: preserve source-to-record identity and use direct particles at the transition; stop residual dust after the story resolves.
- Six agents: keep individual palettes, flow families and particle structures. Fix offscreen phase consistency; use permanent identity independent from temporary state. Stage a strongest formation in one or two agents at once rather than six competing peaks.
- Labels: state text should follow the visually achieved state after damping, not announce completion before the transition settles. Replace leftover presentation wording such as `Complete · fluid identity` if surfaced.
- Investigation: messages occur only on actual handoffs, waiting retains identity, human review remains explicit, completion quiets the scene. Keep simulation time separate from decorative shader time.
- Performance: retain the shared renderer/scissor architecture. Reduce volumetric shader work before reducing the clarity of text or cube silhouettes.

### Manufacturing
- Preserve the detailed Alpha state sequence: pickup, attach, raise, rail travel, corner turn, lower, dwell, raise, drain, unload support, release. The existing timeline already models these more clearly than the simplified Technology transfer.
- Make machine mass readable through acceleration and braking, not long theatrical delays. Travel speed should follow path length; dwell is a separate state.
- Verify hoist ropes/fixtures remain attached through every turn and loading transition. No part disappearance before its next support becomes active.
- Particle hero: formation precedes scan; scan response follows the actual component boundary, with a clean final material.
- V-Twin and labels: match Technology's part/lot identity and state language. Use chapter-specific phone framing rather than shrinking all 13 tanks and every label into one unreadable view.

### Network
- Preserve the globe topology and factory assets. Shared architecture needs a tighter phone crop, slightly stronger light-mode lines and less control duplication.
- Ground routes should remain visually separate from elevated feeders. Feeders meet actual mesh vertices/collar ports; packets must run the exact visible route.
- Construction: foundation -> structural support -> envelope -> equipment -> connection -> completion light. Later pieces should have local deposition particles, not only a rising clipping reveal. Do not show roof/equipment floating unsupported except during an explicitly readable placement.
- Completed plants settle; shared-mesh pulse continues only while visible. Use staggered receiving responses instead of arbitrary synchronized roof beacons.
- Engineering opportunity: show a clear observation -> drawing -> component study -> proposed production result; give each transition its own mechanism rather than reskinning factory assembly.

### About Voltron
- Stair hero: retain two stairs and three people. Verify each foot plant against its tread, no stride-loop wrap jump, and composition shows both structures. This audit does not claim a full skeletal/contact sweep.
- Disciplines: same component, different evidence/action; connect tools and diagrams to an actual point on the component.
- Capability circle: retain the enclosing circle and sharp glass cells. Improve the association between selected capability and cube, especially when labels become a separate list. Selection glow should be localized and reversible.
- Skill labels: compare label bounds, leader paths and head silhouette at tablet widths; keep the face unobstructed. Avoid excessive labels orbiting continuously.
- DNA/culture: strands need visible depth and an intentional formation/settle sequence. Prevent it feeling like two detached decorative curves in opening moments.
- Expanded roadmap uses the same interrupted-transition repair as Home.

### Voltron Commons
- Tree: energy travels from cube centre to roots; a delayed, local response appears in selected foliage. No uniform full-tree flash or beam continuing through the crown.
- Program/learning/participation studies: keep differentiated objects and actions. Improve particle placement by surface area and local formation timing; a shared particle transition should not erase the identity of the selected story.
- Retarget from the displayed selection rather than clearing to empty; reduce the repeated nine-second introduction where a small selection change only needs a short local transition.
- Fix context restoration before adding more effects. Preserve the existing transparent WebP fallbacks.

### Partner
- Preserve Eric/Carla and the shared brief story. No return to handshake/table without a new decision.
- Fix the cut-off floor shadow; tune material contrast in light mode without making the white figure disappear into the page.
- Sequence: finish particle formation, plant arrival steps, settle weight, orient attention, gesture, form the brief, resolve its content, small acknowledgement, settle.
- Hands: clamp reachable targets, retain authored fingers, verify elbow/shoulder bend planes and wrist roll at intermediate frames. Add bounded follow-through to shoulders/head rather than full-body idle movement.
- Give the brief a short readable hold. Keep particles at its active formation edge, away from faces/hands. Final hand-to-panel gap must look deliberate rather than failed contact.
- Opportunity/process studies: use short contextual transition on selection and synchronize supporting copy.

### Enter / Coming soon
- Preserve the approved HD identity artwork as the optical reference. Keep title/countdown legible while ambient pulse runs.
- Source timeline is 17.2 seconds before the entry sequence finishes, with a longer coming-soon celebration. Review perceived waiting time and ensure content/navigation are usable independently of decorative completion.
- Verify ring/wordmark separation and countdown dividers in a dedicated final browser pass; no new visual claim is made from source alone.

## Shared animation rules to implement

1. One scene clock for physical objects, labels, graphs and captions; separate low-amplitude ambient clock only where required.
2. Time-based movement and damping. On tab return, resume from the paused state rather than skipping elapsed wall-clock time.
3. One supported object at every physical handoff. No simultaneous duplicate, unsupported teleport or disappearing carrier.
4. Rigid glass and metal; bounded human joint motion; no rubber squash for industrial cubes.
5. Particles have an identifiable source, destination and reveal front. Density follows projected importance and surface area, not an indiscriminate count increase.
6. Glass profiles share face hierarchy, reflection scale and bevel ratio, while object purpose can vary transmission. The current shared material helper is a foundation, not a requirement that every scene have identical opacity.
7. A consistent scan language: bright edge + restrained plane + local surface response + readable result hold.
8. Labels use protected zones, stable placement, strong theme contrast, port anchoring and a compact phone detail mode.
9. Freeze settled scenes; suspend hidden/offscreen work; recover from context loss; preserve high-quality matching posters.
10. Respect reduced motion and manual artwork-off throughout shader, DOM and CSS effects.

## Implementation order and acceptance

Phase 1 — continuity and reliability: fix hero fragment birth/shrink, Technology camera/transfer, roadmap retargeting, Network scheduling, lost-context recovery and agent re-entry. Acceptance: boundary sampling, interrupt/reselect, scroll-away/return, hidden-tab resume and context loss never cause jumps or blank persistent canvases.

Phase 2 — physical storytelling: rigid landings, machine/support handoffs, scan visibility, local construction deposits, Partner shadows and intermediate joint/contact review. Acceptance: inspect start, contact, release, turn and settle frames at both themes; record real-time clips, not just end stills.

Phase 3 — labels and responsive composition: exclusion zones, fixed graph ports, capability association, larger phone network, compact controls. Acceptance: desktop/1024/768/390/360 widths; no label/subject collisions, clipping or tap targets hidden behind overlays. Validate sticky-header scroll destinations separately from full-section screenshot artifacts.

Phase 4 — finish and performance: unify reveal/scan/response timings, refresh changed fallback families, tune adaptive rendering. Acceptance: test physical mid-range phone and tablet, stable scroll while canvas is active, near-zero inactive rendering, memory recovery after repeated navigation. Provisional target is a stable 60 fps on capable hardware and a deliberate stable 30 fps tier on constrained devices, not an unmeasured guarantee.

Do not increase global bloom, add arbitrary background particles or replace approved geometry to solve these issues. Preserve the established design; make cause, motion, contact, light and meaning agree.
