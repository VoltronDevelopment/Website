# Voltron Lattice — site-wide visual, motion and physical-detail audit

Date: 5 November 2026. Audit only; no application changes or deployment.

## Assessment

The website has a recognizable identity: quiet navy/pearl surfaces, cobalt/cyan signals, glass volumes, industrial components, restrained Montserrat typography and open artwork. The approved Home cube, Alpha equipment and Manufacturing component are strong references. The remaining problem is uneven clarity and fidelity, not lack of effects. Some actual defects survive the previous technical checks. Several other sections function correctly but do not make their subject or causal action sufficiently prominent.

Do not rebuild the site. Preserve the current routes, shared shell, approved Home cube, five increasing roadmap cubes on one base, source figures and theme. Resolve semantic/state defects first, then improve physical readability, then make selected composition and timing changes.

## Evidence and limits

Fresh browser inspection used the current local production artifact `.next-factory-alpha-kit-20261104`, build `g2kirBRgUlXHZDV4m_vwi`. Application/component/library files recorded in the previous source manifest match their current hashes. This is an audit of that artifact, not the deployed website.

- Ten routes rendered at 1440×1000 light, 820×1180 light and 390×844 dark, with reduced motion: 30 route/viewport cases, 147 section captures (including nested sections).
- Live-motion sampling at 1440×1000 dark and 390×844 light: 20 route/viewport cases, 63 captures. Short samples inspect formation and intermediate composition; they do not prove every complete animation cycle.
- Focused live About labels, Partner presentation at 8 seconds, factory timeline samples, and ordinary Network hash navigation at desktop and phone sizes.
- Factory samples requested at 27, 51.45, 52.55, 53.2, 54.5, 56.7, 63, 64, 67.5 and 76. The public scrubber quantizes to half seconds; `focused.json` records actual values. Do not interpret these as exact arbitrary-time captures.
- Existing current factory full-cycle pose evidence and motion contact sheets were inspected as supplementary evidence. They are not new continuous full-cycle recordings.
- Fresh focused source tests: **11 files / 71 assertions passed**, covering operating sequence/pace/refinement, original Alpha framing/routes, Partner contact/rig and Network composition/growth. The initial restricted run failed before executing tests because Windows denied temporary-file renames; the permitted rerun passed.
- Fresh capture runs reported no page errors or document-width overflow. This does not certify internal labels, visual hierarchy or accessible contrast. The capability-label defect below demonstrates that distinction.
- Prior 339-test, accessibility and 96-case layout results are historical supporting evidence, not rerun or recertified here.
- Physical-device frame pacing, thermal behavior, battery, screen-reader usage and every possible interaction/pose remain unmeasured. No industrial engineering or anatomical certification is implied.

Evidence directory: `.audit-logs/site-art-audit-20261105/`. `layout.json`, `motion.json`, `focused.json`, individual section captures and contact sheets are retained. Contact sheets deliberately insert grey separators and may scale tall sections smaller; these are not page borders or actual column widths. Nested sections appear twice in some sheets but not twice in the site. Sticky headers in element screenshots are capture artifacts unless separately reproduced. Ordinary `/network#network-learning` navigation placed the phone section at about 93px and its heading at 171px, clear of the header; do not report a general anchor failure from the contact sheets.

## Prioritized findings

| ID | Priority / evidence | Finding | Correction and acceptance |
|---|---|---|---|
| A01 | High / rendered + source | About capability labels on the right collapse to 20–21px columns, with 122–163px heights on desktop. They wrap letter by letter and overlap. Reproduced in live and static views, desktop/tablet/phone. | Give labels a stable measured width before calculating placement, remove shrink-to-fit feedback, solve collisions using the resulting boxes, and route leaders to their actual edges. All eight names must remain readable and separately selectable at 390/820/1440, during reveal and after resize. |
| A02 | High / source + rendered | Technology's factory uses T03; its next product views and Intelligence refer to T06 while claiming one continuous operation. | Either share one scenario identity across the chain or explicitly distinguish the three-stage overview from the detailed Alpha example. Preserve the physical three-tank route. No silent station-number change within a claimed single event. |
| A03 | High / rendered + source | Network static views show completed buildings/networks while initial text says Site preparation, Origin or Establish. Changing a chapter can change text without changing the fixed complete poster. | Synchronize static state and image, using matching chapter poses or a clearly labelled overview with chapter text presented separately. No completed building labelled as bare-site preparation. |
| A04 | High / rendered | About stair fallback has a hard rectangular backdrop and a baked replay glyph; the live scene has neither. | Recapture clean theme-specific posters without controls, with matching crop/background/alpha treatment. Check static/live handoff and phone DPR2. |
| A05 | High / rendered art-direction | Factory panel and scan are visually subordinate to the oven, slab and gantry. A valid quality sequence is difficult to read at actual phone size. | Compose a deliberate inspection shot, reduce obstructing roof/front-frame visual weight, improve panel/background separation and give scan core/plane sufficient projected size. Both directions and a brief result hold must be obvious without reading the caption. |
| A06 | Medium / source | Dispatch forks stretch in X to reach cargo without a clearly visible telescopic construction; trolley wheel rotation uses route progress, not physical travelled distance. | Model actual nested reach stages or move the handler with fixed forks; derive axle rotation from signed travel/radius. Add stationary handoff holds and verify support before release. |
| A07 | Medium / source | Factory still mounts its optional renderer under reduced motion: preferences stop time, but observer imports/mounts unconditionally. | Honor the existing static-scene policy before import/mount; use the matching poster and functioning HTML controls. This is a performance-policy inconsistency, not proof of unwanted motion. |
| A08 | Medium / rendered + source | The mobile Network geography caption crosses the lower globe area. Absolute caption placement does not reserve space. | Give the caption its own bounded row below the art, retaining a clear gap to the principle strip. |
| A09 | Medium / rendered | Intelligence portrait is still small relative to its frame on phone/tablet. About capability head and Partner figures also have lower apparent importance than Home's cube or Manufacturing's component. | Tune visible-subject bounds per scene, not canvas dimensions. Trial a 15–25% focal enlargement and compare at actual size; this is a proposed range, not a mandatory global scale. |
| A10 | Medium / rendered | Tablet keeps all five small factory screens with tiny secondary text. The information hierarchy is too fine for casual reading. | At the tablet threshold use one dominant selected screen with compact product choices, or simplify the miniatures to title/graph/status and put details in the selected view. Do not shrink body text to preserve desktop columns. |
| A11 | Medium / rendered art-direction | Commons, About disciplines, Network products and Partner supporting sections repeat the same bracket/table/panel vocabulary with similar compositions. | Retain the shared component but make the action and framing distinct: measure, compare, share, configure, agree. Remove redundant table/monitor props when they add no meaning. |
| A12 | Medium / source + rendered | State labels in the specialist gallery sound operational although they are autonomous demonstration cycles. | Keep permanent roles separate from illustrative activity. Identify the gallery as illustrative; reserve task completion/evidence claims for the scenario's actual event state. |
| A13 | Medium / source | `DESIGN.md` mixes superseded Home choreography, old roadmap 1→4→8, different typography/layout contracts and current directions. | Establish a short current authority section and move dated decisions to an archive. Explicitly preserve current approved cube and five-cube roadmap. |
| A14 | Medium / source | Factory opacity/camera/geometry checks do not test projected visibility through surrounding machinery. The scan is numerically present but visually weak. | Add screen-space inspection checks and manually reviewed close-up frames. Bounding-box containment alone must not count as scene readability. |

No new critical security/data-loss defect was established in this visual audit. High priority means these defects visibly undermine comprehension or the approved experience.

## Shared design system and layout

**Typography.** Montserrat is consistently present. The strongest pages use short headings and quieter supporting text. Mini-screen status copy falls to 9–10px and SVG annotations to 7px in source; these are acceptable only as nonessential texture, not information users must read. Promote essential status into HTML at a comfortable size. Establish three distinct small-text roles: actionable label, status, optional metadata. Do not enlarge every caption indiscriminately.

**Spacing and framing.** Most sections avoid document overflow. However, content-sized presentation should be judged by the visible subject, not a uniform tall canvas. The factory, evidence panel, Partner figures and small roadmap cube leave considerable empty space compared with the strong Manufacturing hero. Reduce dead vertical space around small supporting diagrams before adding background effects. Keep generous spacing around major sculptures. Do not force a complete dense simulation/form into one screen.

**Tablet.** This is the least resolved presentation tier. Some scenes stack coherently while mini-screen rows remain desktop-dense. Audit the 768–1000 range as its own composition, especially Technology screens, selected Modularity card, Intelligence evidence and Partner paths. The 820px snapshots show that avoiding overflow is not enough.

**Materials.** Hero/roadmap/modularity optics are not the same implementation as `factory-kit.ts`: the latter uses simple transparent glass with fixed opacity/roughness, no transmission, and separate theme values. That is an intentional performance opportunity, but visually several supporting cubes look flat or blue plastic. Define clear optical roles: clear enclosure, smoked structural cell, pearl solid, frosted reading surface. Share palette/key-light direction/reflection vocabulary while allowing cheaper materials for tiny objects. Do not put expensive independent transmission on every face.

**Lighting.** Keep cyan local to information, active scans and connection events. Give inactive dark-mode surfaces a readable broad reflection rather than raising edge glow. Pearl parts in light mode need a darker rear/support plane to avoid washing out. Floor shadows should explain contact and height; glowing floors must not compete with the part.

**Tags and controls.** Several parallel mechanisms remain: mini-screen choices, chapter rows, record selector, product tabs, process chips, inquiry tabs and disclosure links. These need distinct roles and consistent wording, not identical styling. Use active-state emphasis only on the current choice. Remove duplicate status sentences before removing useful navigation. Keep purposeful factory/Alpha/investigation controls compact; do not return hero playback strips.

**Background.** Keep the continuous atmosphere. Some background cube edges are visible behind headings, but no extra background particle system is justified. First strengthen foreground contrast and focal hierarchy. Large empty frames are a camera/layout problem, not a reason to fill the page with motion.

## Page-by-page, section-by-section findings

### 1. Home

| Section | Finding and recommended refinement |
|---|---|
| Identity hero | Strongest brand anchor. Preserve approved scramble/solve and exact mark. Dark faces are intentionally quiet; protect mark sharpness during turn and poster handoff. Do not restart the retired seven-cell redesign. |
| Four application previews | Good selective glass and clear choices. The MES view has a very sparse central diagram inside a relatively large card. Give each product one legible action with a cause/result, stronger active node and one status. Preserve held manual selection and normal page scrolling; no new horizontal scrollbar. |
| Connected Lot | Part identity and mobile enlargement work. Desktop carrier occupies a small part of a long thin conveyor; the subject feels less important than empty belt. Tighten active framing or shorten visual travel while retaining station separation. Keep scan → evidence → release → dispatch order. Reduce duplicate captions; static end pose should communicate completion. |
| Three-tank Alpha teaser | Still the best small industrial reference: proportion, rims, water and suspension read clearly. Preserve fixed overall frame and shared equipment. Labels are quiet; align chapter emphasis to physical arrival and keep mobile station names readable. |
| Five-cube roadmap | Approved story is intact. First cube is tiny against the full common base, leaving a visually empty early stage. Retain all five increasing cubes on the same base; improve first-stage camera/contrast and anticipation of the next space without making the first cube falsely large. Reveal each card only after its cube arrives; manual selection must remain authoritative. |
| Philosophy | Solid enclosure/join suits the quieter close. The ending is very similar to About's culture ending. Keep Home's simple join, but let About emphasize the intertwined contribution before settling. Avoid adding particles merely for consistency. |

### 2. Technology

| Section | Finding and recommended refinement |
|---|---|
| Neural hero | Muted cube surfaces fit the brand better than neon. Dense connecting strands remain visually dominant in dark mode. Emphasize a few active routes through thickness/opacity hierarchy while retaining the approved network. Keep all nodes fixed; avoid unrelated orbiting effects. |
| Operating platform — digital layer | Placement above the factory establishes a clear hierarchy. At tablet size five mini-screens are too text-dense. Keep title/diagram/status only in the row and expand the selected view. Numbers should come from actual operating windows and fade in the reserved gap; no numbered containers. |
| Operating platform — physical scene | Shared tanks/trolley, grounded lower oven and adjacent booth improve coherence. Main remaining issue is readability of the small carried panel and scan. Use authored receiving, process, oven and inspection compositions with overlapping visual continuity. Do not chase every tiny movement with the camera. |
| Receiving / dispatch | Separate bays and truck doors exist. Forklift body and truck overlap visually at dispatch; they may be physically separated in depth but the projection obscures the handoff. Stage a clear stop → reach → supported transfer → withdrawal → doors → departure. Fix unexplained fork stretching and show depth separation at the camera angle. |
| Gantry / oven | Two indexed corners are preserved. Keep vertical lift, horizontal travel and stationary rotation distinct. The fixed high camera reveals equipment but makes the panel nearly edge-on at some turns. Use a small deliberate framing adjustment, not a large orbit. Oven doors should lead the part and close only after full clearance. |
| Quality booth | Give horizontal and vertical scans visible swept area and an observation/result hold. At present the booth/roof edges compete with faint scan geometry. Keep quality immediately beside the oven; improve optics/shot rather than relocate it again. |
| Five product perspectives | V-MO orthogonal topology is clearer and more symmetrical than earlier versions. Keep this. Correct T03/T06 continuity; show node emphasis and packets from the same event clock. Mobile's two-column graph can retain relationships without imitating the desktop coordinates. Simplify repeated “concept/illustrative” footer copy. |
| Modularity | Clear/smoked cells and plug metaphor fit well. Early sampled frame is mostly sparse particles; make the shared foundation readable sooner, then deliver the process cell. Selection/card must follow contact. A direct choice should transition from the current state instead of rebuilding the whole scene. |
| Integration close | Quiet content is appropriate after the deepest simulation. Do not add another factory. Use the existing linked identities and one concise boundary/handoff explanation if a diagram is needed. Correct the outgoing “same lot” claim before sending users to Intelligence. |

### 3. Intelligence

| Section | Finding and recommended refinement |
|---|---|
| Portrait hero | Face is readable, projector subordinate, but overall figure occupies too little phone/tablet art space. Enlarge face within the existing frame and keep a modest projection fan. Maintain the two scan directions and a settled final orientation. |
| Connected evidence | Current demonstration panel is an extremely simple flat rectangle, noticeably less refined than surrounding metal components. It can remain the same panel used by Alpha, but show its actual thickness, edge and attachment rather than replacing it with an unrelated part. Consolidate eight source choices into a calmer selector at narrow widths; optional records should remain accessible. |
| Six specialists | Real differences exist: broad cloud, fine particles, deep volume, bands and wispy flow. Preserve these. Avoid equal maximum speed/brightness across all six; selected/task-active motion should lead. Clarify illustrative state labels, retain stable cube shell and recognizable base texture through transitions. |
| Working together | Parallel branch layout is meaningful. Desktop labels and progress bars are very small; phone replaces the relationship diagram with six status tiles, weakening visible handoffs. Keep one active agent plus a small persistent branch map on phone, with event-driven packets and one event sentence. Existing compact scenario controls are justified. |
| Point of work | Human authority is clearly stated. The default screen is sparse and then repeats status beneath it. Make the observed condition, linked evidence and proposed next check the three dominant items; make review availability explicit without requiring the visitor to infer an earlier unfinished section. Keep “advance to outcome” available. |
| Closing transition | Preserve transition to Manufacturing. Fix scenario identity first. Shorten repeated descriptions of connected context/evidence so the page ends with a clear next action. |

### 4. Manufacturing

| Section | Finding and recommended refinement |
|---|---|
| Component hero | Best focal hierarchy among the non-Home heroes. Metal thickness, bore and edge highlights read well. Preserve it as the part-material reference. Formation/scan should end with a clean surface; do not add perpetual dust. |
| Alpha line | The most developed physical sequence. Keep original equipment/attachment logic and detailed route. At phone size the whole overview is necessarily small; “Follow a lot” should lead to readable work shots without losing route context. Protect suspended part silhouette at corners and submerged stages. |
| Connected evidence | Four records are clear but can become a second row of dashboard chrome beneath an already complex scene. Emphasize the active record and expose details on demand. Keep sequence distinct from quality approval. |
| Deviation | Purposeful optional branch. Keep it short and explain where it rejoins the main lot. No additional decorative scene needed. |
| What Alpha validates | Quiet diagram is a useful contrast to industrial animation. Improve selected-node contrast and alignment; keep text compact rather than add another cube illustration. |
| Process scope | Same bracket makes comparison coherent. Its SVG-like surface illustration is intentionally simpler, but currently looks flatter than the hero. Match angle and key highlight; make coating-layer changes visible without suggesting literal engineering scale. |
| Inquiry close | Good natural next action. Keep specification/inquiry content readable and avoid another screen-height artwork. |

### 5. Network

| Section | Finding and recommended refinement |
|---|---|
| Globe hero | Geography and envelope are recognizable. Mobile caption overlaps lower globe area (A08). Keep exact envelope topology and no reintroduced geographic arcs. Match final glow to a readable map rather than whitening the entire sphere. |
| Owned plants | Larger factory is useful but substantially simpler than Technology's equipment. It should communicate capability transfer, not compete as a second detailed factory. Emphasize material arrival, work and retained evidence; keep only necessary physical motion. |
| Build the next plant | Supported construction order is the correct concept. Static state mismatch is a defect. In motion, assemble visibly supported structure before enclosure; use local formation for emerging structure, not global unrelated sparks. End with bounded commissioning light, not uniformly luminous walls. |
| Shared architecture | Ground factories and elevated mesh now form a good silhouette. Large view has empty space before the group fully forms; this is acceptable briefly but should not dominate most of the section. Keep visible orthogonal ground routes and defined mesh ports, distinct from informational pulses. Reconcile selected chapter with static image. |
| Industrial products | Bracket/bench is too similar to About/Commons/Partner. Let the requirement drawing and comparison be the hero here, with the physical part as reference. This changes the visual action without inventing a new product. |
| Closing | Keep a compact invitation. Remove redundant “future/illustrative” repetition from every adjacent line; retain one accurate qualification per scene. |

### 6. About Voltron

| Section | Finding and recommended refinement |
|---|---|
| Stairs hero | Two structures/three people remain recognizable and slightly isometric. Live integration is better than static poster. Fix backdrop/replay-glyph mismatch; verify each planted foot against the step plane through ascent rather than only final pose. |
| Connected disciplines | Shared component gives useful continuity. Current early scene may show an isolated line before related screens arrive. Reveal connection and destination together so it never looks like stray decoration. Distinguish measurement/engineering from the Network product study. |
| Capabilities / how we work | Highest-priority layout repair. Four right-side names collapse/overlap; the circle and head lose meaning. Fix A01 before adding glow or denser particles. Keep cube edges consistent with site, one label per cube and one selected explanation. |
| People / shared practice | Helix has a distinct initial gesture but ends as another cube-in-cube. Hold the meaningful intertwining stage longer and connect the four practice lines to those events. Preserve final unity without making it visually interchangeable with Philosophy. |
| Leadership | Quiet editorial section works. Keep it quieter than art-heavy sections; no animated portrait or extra cube required. Improve optical alignment and content measure only. |
| Long-term direction | Optional readiness disclosure avoids repeating Home's full roadmap. Keep it. The paragraph is long on phone; tighten sentence structure without losing qualification about ambitions. |
| Destinations | Two cards provide clear onward routes. Keep matching action alignment and hierarchy; avoid introducing a third competing action. |

### 7. Voltron Commons

| Section | Finding and recommended refinement |
|---|---|
| Tree hero | Strong ecological subject, but bright enclosure corners dominate the opening while tree is absent. Reveal a recognizable root/trunk earlier; corners should frame it. Keep energy limited to roots and separate restrained canopy response. |
| Access / programs | Current cube/book/bench action is difficult to decode without the reading card. Make the resource visibly available or opened, then the participant outcome. Keep the selected reading surface; no need for five simultaneous cards. |
| Shared learning | Bracket/two-cube composition repeats industrial pages. Distinguish the process of comparing observations through changed viewpoints/measurements, keeping the common model if useful. |
| Participation | Two floating monitors and a cube are visually generic. Show one contribution becoming a shared record, with a clear destination. End in a stable arrangement; preserve developing-program qualification. |

### 8. Partner With Us

| Section | Finding and recommended refinement |
|---|---|
| Shared-brief hero | Current sampled presentation no longer shows the severe arm twist described earlier; rig/contact tests pass. It still reads as a formal held tableau, with hands and brief smaller than ideal on phone. Bring the group slightly closer in frame, preserve authored finger/hinge orientation and planted feet, and keep gestures staggered. Do not restore handshake. |
| Opportunity pathways | Useful single selected card. At tablet width its column becomes narrow while the artwork remains modest. Rebalance to a wider reading column or stack earlier. Make production fixture, factory opportunity, technology and Commons actions visibly distinct. |
| Collaboration process | Similar bench/cube imagery to adjacent pages. Make “understand → define fit → agree next step” resolve one evolving brief with changes users can recognize. Keep all choices available without replaying a long particle introduction. |
| Inquiry | Restrained form is appropriate. Keep labels above fields, optional details collapsed and one strong submit. No real inquiry was submitted in this audit; server outcomes are not recertified. Test opened native select, validation and success separately before release. |
| Contact | Quiet geographic/company closing is enough. No extra artwork or ornamental status badges needed. |

### 9–10. Enter Lattice and Coming Soon

Preserve exact identity tile, its supplied image, atmosphere and independent composition. Entry's prominent pulse can remain a distinct brand moment; do not copy its maximum halo everywhere else. Phone wordmark and tile fit the reviewed composition. Verify actual delivered pixel density on high-DPR phones; large source dimensions alone do not guarantee sharpness. Keep useful entrance navigation available before decoration completes. Coming Soon's countdown should remain aligned and readable; the launch date is displayed content, not a new business-date decision made by this audit. Clean fallbacks must contain no baked controls.

### Shared navigation, footer and legacy routes

Persistent shell, alternating desktop heroes and mobile copy-first order are appropriate. Preserve normal document scroll and hash clearance. Keep header open menus opaque enough for reading and distinguish menu actions from decorative glyphs. Footer should remain a compact orientation point rather than repeat page introductions. Source confirms legacy Ontology routes redirect to Technology, People & Culture to About, and Commons alias to the canonical Commons route; there is no need to revive these as separate designed pages.

## Animation and physics refinement rules

1. **Model events before visual emphasis.** Contact precedes carry; support precedes release; doors precede crossing; evidence precedes recorded disposition. Keep one authoritative transform/state per moving part.
2. **Use distance-based motion for mechanisms.** Wheels follow distance/radius, reach comes from a visible mechanical joint/stage, hooks retain their relation to the part. Avoid changing geometry scale to imitate machinery extension unless it is visibly a telescopic mechanism.
3. **Do not apply one ease to every movement.** The factory travel helper smoothsteps each path segment, producing full stops at every knot. Preserve real operation/indexing stops but use continuous velocity through authored travel segments when no stop is intended. Do not globally shorten all durations.
4. **Camera intent precedes camera follow.** Establish the whole; move to a working view before important contact; hold during scan/inspection; pull back after the result. Avoid viewpoint changes during the exact moment users need to understand a handoff.
5. **Particles need a role.** Keep surface formation, material departure, agent flow and root energy distinct. Do not use the same incoming cloud for every object. Make most of the silhouette legible early enough for ordinary scrolling.
6. **Glows must have a local owner.** Scan core, active port, mesh pulse or source glow—not all surfaces simultaneously. In light mode use saturation/darker cores; in dark mode preserve face depth before increasing emission.
7. **Freeze and resume must preserve meaning.** Static image, selected chapter, caption and record state need to agree. This is currently violated by Network. Offscreen suspension is useful only if reentry preserves the user's selection.
8. **Labels belong to visible objects.** Test rendered label width, line count, collisions, leaders, motion and theme. Add screenshots where text can wrap; do not accept zero document overflow as label validation.

## Implementation order and acceptance gates

| Phase | Scope | Effort / regression risk | Completion condition |
|---|---|---|---|
| 1 — Correct meaning and broken UI | A01 labels, A02 scenario identity, A03 static state, A04 clean stair poster, A08 globe caption, A13 current design authority | Small/medium changes; medium risk where state is shared | Names readable on three sizes; static image/caption agree; same-story claims are accurate; no baked controls; hash navigation remains clear. |
| 2 — Factory physical readability | A05/06/14; shot framing, part contrast, scanner area, handler reach, wheel rotation, handoff holds | Medium/large focused work; highest regression risk | Review receiving, three tanks, both indexed turns, oven doors, both scan directions, packing/load/departure in both themes on desktop/phone. Check silhouettes and support, not only coordinates. |
| 3 — Responsive composition | Portrait/Partner scale, tablet mini-screen hierarchy, roadmap first-stage presence, evidence choices and form-adjacent spacing | Medium; moderate layout risk | Actual 360/390/820/1024/1440 widths plus short landscape; stable controls, no cut text, no important artwork/caption collisions. |
| 4 — Distinct storytelling | Commons studies, About disciplines/culture, Network products, Partner process and specialist activity semantics | Medium/large selective art work; preserve geometry | Each section has one identifiable action and outcome; it is distinguishable without reading a full paragraph; reduced-motion alternatives tell the same story. |
| 5 — Optical and runtime finish | Shared optical roles, active/rest contrast, poster parity, A07 static loading, device profiling | Medium; rendering risk | Match theme and camera between live/static; defer optional graphics in static mode; measure representative real-phone frame pacing/memory before a performance claim. |

Avoid a site-wide geometry/material replacement or more decorative backgrounds. Keep the best references intact and bring weaker scenes up to their clarity. The next implementation should begin with verified defects, then the factory's visual/physical handoffs—not another broad claim that the site is complete because tests pass.

## Final shell check

The footer, opened compact navigation and full Coming Soon composition were additionally rendered at 390, 820 and 1440px. Phone menu text has a clear opaque reading surface and reachable controls; footer links reflow into two columns. Coming Soon's cube, wordmark and countdown fit the 390×900 capture. The large space between wordmark and countdown is an art-direction choice that could be tightened on short screens, not a reproduced overflow defect. Evidence: `shell-menu-*`, `shell-footer-*`, `shell-coming-*`. No form submission, deployment, or application code mutation occurred.
