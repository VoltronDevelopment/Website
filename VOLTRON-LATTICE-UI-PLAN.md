# Voltron Lattice: Refined UI and Build Plan

Status: superseded by the accepted light-theme rebrand on 12 October 2026. See VOLTRON-LATTICE-REBRAND.md for current authority and asset audit. The previous plan below is historical; its Git-parity typography, dark-first layout, routes and motion must not override the accepted specification.
Baseline: Git HEAD d601b39, compared with the current working tree on 10 October 2026.
Content authority: the supplied Voltron Lattice Website Content Blueprint, with the user's later visual instructions taking precedence where they differ.

## 1. Direction and Boundaries

Keep the finished Git site's visual DNA: restrained type, substantial engineering artwork, measured whitespace, meaningful diagrams, dark/light contrast and controlled motion. Change its information architecture and branding, not its entire visual language.

There will be **10 public URL pages**, not ten fullscreen panels. Home is a complete overview. Detail pages are naturally scrollable. QMS, AI and HITL remain distinct sections of one Intelligence page. No additional admin route or deployment work is included in this plan.

Preserve the Git modularity and QMS compositions. Recover the hero glow and original second-screen layout. Reuse original assets and working components before creating anything new. New relationships, labels and copy must reflect the Lattice blueprint; old commercial or leadership claims are not automatically restored with old components.

## 2. Audit Findings

The audit used the Impeccable and frontend-design plugin guidance, source inspection, a temporary Git snapshot server and Playwright screenshots. The Impeccable context engine could not run because its required engine was not installed; its local guidance and project sources were read directly instead.

- Git contains one long homepage with 14 sections. The current implementation contains ten routes but only three Home sections. The missing overview flow is real, not just a spacing problem.
- Finished modularity, QMS, AI, HITL, network and leadership visuals are deleted in the working tree. Their current replacements are largely text. Recovery requires their helper data, styles, hooks and assets too.
- Current generic page containers are 1,200px wide, while much of their copy stops at 680px on the left. This produces empty right-hand areas without a compositional purpose.
- Original widths vary deliberately: 1,040px for ordinary splits; 1,120px for architecture; 1,180px for QMS; 1,280px for the context scene. Uniform width is not the goal. Consistent alignment within each composition is.
- The current lattice is repeated on Home and Technology. Give Home the interactive discovery cube and Technology the technical architecture diagram. Do not maintain two copies of the same full scene.
- Current cube details have a 300px column, 10px projected labels and 36px fallback controls. These understate the assets and need larger, more usable geometry.
- The Home discovery link targets `#foundation`, but the actual next section is `#gap`. Repair the link and retain stable section IDs.
- All ten current routes returned HTTP 200 at desktop and mobile sizes, without horizontal overflow or captured JavaScript errors. Composition and missing visual work are the main problems; do not describe every page as currently overflowing.
- Both versions actually render Segoe UI/Segoe UI Semibold. Inter and Space Grotesk are declared but not loaded. Preserve the actual Git appearance in this pass, rather than introducing an unreviewed font-metric change.
- Original HITL action-looking buttons have no handlers. Restoring their appearance must not imply real plant actions. Make the demonstration explicitly illustrative, with local state if interactive.
- Original mobile second-screen glow extends beyond its container. Retain the current clipping fix while restoring the composition.

### Measured Original Compositions at 1440 x 900

| Section | Content width | Heading | Important visual measurement |
| --- | ---: | ---: | --- |
| Hero | Full viewport | 43.2px original brand heading | 120px logo; 900px section |
| Second screen | 1,040px | 44px / 50.6px | Approximately 496px-wide physical and twin frames |
| Architecture | 1,120px | 46px | 727px total section height |
| Built once | 1,040px | 44px / 49.3px | Approximately 492 x 462px diagram; 623px section |
| Connected context | 1,280px | 44px | 345 x 431px main artwork |
| QMS | 1,180px | 44px / 49.3px | 188px central hub; 658px section |
| HITL | 1,040px | 44px | 492 x 328px station scene |
| Alpha | 1,080px | 44px | 486 x 273px factory asset |
| People | 1,040px | 44px | 76px circular portraits |
| Partner | 1,040px | 44px | Two equal form columns |

These are parity references, not fixed heights to impose on new copy. Let additional content increase page height.

## 3. Shared Layout, Type and Image Rules

### Grid

- Ordinary content: maximum 1,040px, centered. Standard desktop split: 496px + 48px gap + 496px.
- Architecture: maximum 1,120px. QMS: maximum 1,180px. Context: up to 1,280px only when its three-part diagram needs it. Alpha may retain 1,080px.
- At intermediate widths, all containers contract inside a common page gutter. Mobile gutter: 20px; tablet: 24px; desktop minimum outer gutter: 40px.
- Standard new section padding: 80px top/bottom on desktop, 48px on mobile. Dense explanatory subsections: 48px desktop, 32px mobile. Preserve internal Git spacing for the protected modularity and QMS sections.
- Standard title-to-copy gap: 24px. Paragraph-to-paragraph: 16px. Copy-to-action: 24px. Section introduction-to-main visual: 36px. Ordinary split gap: 48px desktop, 32px stacked.
- Full-width background bands with constrained content, not floating page-sized cards. Cards only for repeated entities, product previews or an actual framed simulation. No decorative card nested inside another card.
- Only Home's hero and second scene retain the original viewport-led presentation. No compulsory scroll snapping, fixed content height or `100vh` on ordinary detail sections.

### Type

- Preserve the rendered Git system-font appearance: Segoe UI with appropriate system fallbacks. Do not claim that the currently unloaded custom fonts are the rendered design.
- Home brand heading: 40px desktop, 32px mobile, with Voltron Lattice fitting naturally on the available width. Do not inherit the old short wordmark's tracking or width blindly.
- Ordinary page H1: 40px desktop / 30px mobile. Protected Git section headings: retain 44px desktop / 28px mobile where the baseline uses them.
- New section H2: 32px desktop / 26px mobile; H3: 20px. Body: 16px with approximately 26px line height; small supporting copy: 14px / 22px. Diagram labels: at least 12px.
- Use fixed sizes at breakpoints, not viewport-scaled font sizes. Letter spacing is zero in new typography rules. Paragraph measure generally 54-62 characters, with deliberate shorter measures beside artwork.
- Long content is edited or allowed to wrap; neither clipping nor shrinking the entire section is an acceptable fix.

### Color and Surfaces

Keep near-black `#050608`, charcoal `#0C0F14`, graphite `#141A22`, off-white `#F4F6F8` and muted `#8B95A5`. Use Lattice blue `#4A8FFD` for highlights and original blue `#2F80ED` for primary actions where the existing treatment is retained. Green belongs to a meaningful success/live demonstration state, not general decoration. Light sections use dark readable text and subdued blue diagrams.

### Assets

- Preserve intrinsic image ratios. Use `contain` for diagrams, login screenshots and equipment cutouts; do not stretch an image into a tall portrait holder or crop its labels.
- The image must be the dominant part of product/system presentations; captions are compact. No large empty holder above and below a tiny contained screenshot.
- Restore the existing WebP files actually used by recovered components. Do not restore duplicate PNGs or generate replacement artwork unnecessarily.
- Recover `scada.webp`, QMS core, Alpha, network, factory-flow, agent and HITL assets with their components. Merge asset registries carefully: current and Git registries have different value shapes.
- Use the approved logo asset wherever a mark is needed. No typed letter V as a substitute. The inner cube uses the actual approved mark on all six faces.
- No fictional plant photography or empty photo placeholders. Existing factory artwork remains artwork and must not be presented as documentary proof of a commissioned facility.

## 4. Page-by-Page Plan

### 1. Home `/`

Purpose: explain the company, establish manufacturing credibility and offer clear routes into the ten-page site.

1. **Hero, dark:** recover `HeroIntro` glow, connectors and original visual timing. Approved logo centered on the radial grid; pillars around the same anchor. Brand: Voltron Lattice. Supporting line: Engineering intelligent industry. Keep the brand compact and readable. Make architecture, partnership and production entry points available without waiting for the animation.
2. **Foundation, dark:** use the Git `#gap` composition exactly as the sizing/placement baseline: left 496px copy, right 496px physical/twin artwork stack, 48px gap, original bridge between the images. Retain the approved cyber-physical/jugaad narrative and rewrite only enough to establish Execution, Context and Intelligence. Preserve the assets and motion, not the generic replacement wrappers.
3. **What Lattice means, dark:** the interactive body-centered cube is the focal explanation. Title above; cube left; selected component's large asset, responsibility and contextual link right. No duplicate explanatory architecture card above it.
4. **Manufacturing application, light:** a concise Alpha introduction using the Git factory artwork and split proportions, not the entire Alpha detail page. Link to Manufacturing. State development/validation status honestly.
5. **Scaling direction, dark:** a short network overview using the existing network artwork. Explain reusable Process Packs and partnerships; link to Network. Do not repeat its full business-model infographic.
6. **Human purpose, light:** restrained editorial statement with two clear links to People Culture and Commons. No invented portraits, programs or beneficiary statistics.
7. **Closing invitation, dark:** compact invitation with production and partnership actions leading to the appropriate `/partner` form. Keep the full forms on Partner, not duplicated on Home.

This is seven sequential homepage sections. The interactive lattice incorporates the technology overview, so a separate repeat of the same architecture story is unnecessary.

**Cube specification:** transparent outer faces, visible lattice edges, eight small cubes at the corners, one centered inner cube, approved logo on six inner faces; no circular atom nodes or logo on the outer faces. Preserve manual drag and selection. Desktop scene uses a 1,120px maximum frame, roughly 640px stage + 40px gap + 440px detail panel; stage around 420px tall. Selected artwork receives approximately 400 x 280px of real display space, not a 220px-wide thumbnail. On smaller desktop frames these columns shrink proportionally; below 900px stack them without compressing labels. Provide keyboard-accessible component selection and rotate/reset controls, stable label positioning, collision handling and a non-WebGL equivalent. These are conceptual relationships, not direct AI control paths.

### 2. Technology `/technology`

Purpose: show how the architecture works and how it can be configured for a factory.

1. **Opening + architecture, dark:** title and brief VOS explanation above the recovered `ArchitectureLayers` diagram. Use the 1,120px Git frame; keep side assets substantial, center logo correct, physical-factory strip aligned with the upper cards' outside edges. No plus button, collapsible diagram title card or repeated operating loop inside this diagram. Add a restrained context/control legend where necessary; no AI-to-PLC command implication.
2. **Systems and responsibility, dark:** organize Execution, Context and Intelligence into readable role groups; use existing ERP/QMS/SCADA/Twin/equipment assets with compact labels. V-MO and Historian responsibilities must be explicit without presenting everything as interchangeable applications. This is an architecture explanation, not a fake login portal.
3. **Operating loop, light:** use the existing horizontal Plan -> Execute -> Observe -> Understand -> Improve composition once, here. Five equal responsive tracks inside the content frame; smaller icons and captions; continuous-feedback line below. On mobile use a readable ordered sequence rather than hiding overflow or shrinking all five items. No stray V badge.
4. **Built once, light:** restore `ModularPlatformVisual` in the original 1,040px split, keeping its composition, icons, connector hierarchy and internal spacing. Voltron Core -> Capability Modules / Process Packs -> Plant Configuration -> AI assistance. Use blueprint terminology while preserving the completed visual design.
5. **Shared meaning and responsibility:** concise V-MO introduction and authority statement. Link to Ontology, Intelligence and Manufacturing at the relevant point. Do not reproduce their complete sections.

Desktop architecture goal: title and complete diagram visible together in a 900px-high viewport when navigated to its anchor. On 768px-high windows, let the section grow naturally rather than making the diagram illegible to force a fit.

### 3. Manufacturing Ontology `/technology/ontology`

Purpose: make identity, relationships, evidence and accountable action understandable.

1. **Opening split:** 1,040px frame, short 40px heading and intro left; recover `ManufacturingContextVisual`/factory-flow artwork right. Keep the useful original image scale instead of a text-only left column.
2. **Connected model:** a labeled relationship diagram centered on a lot. Use Customer -> Part/Requirement -> Lot -> Operation/Equipment -> Inspection/Evidence -> Decision/Release as a guided reading path, not as a claim to represent the entire ontology. Connections use meaningful verbs. Selecting/focusing a node reveals its relevant evidence and responsibility.
3. **From record to situation, light:** five concise editorial rows for Identity, Relationship, Authority, Time and Evidence. No meaningless boxed keyword cloud.
4. **Context for a task:** one practical deviation example, assembling the lot, operating window and relevant inspection/equipment records. Show request, authorized review, committed result and verification as separate states.
5. **Close:** links back to Architecture and forward to Intelligence. Do not repeat the full cube or six-agent display.

Use a 1,040px ordinary grid; expand the relationship scene only if its labels require it. On mobile present the guided sequence and selected detail in document order with no mandatory dragging.

### 4. Intelligence `/intelligence`

Purpose: one scrollable story: evidence -> contextual assistance -> human decision.

1. **Opening, dark:** concise intro and three anchor links: Digital QMS, Voltron AI, HITL. Ordinary 1,040px frame; no oversized title or empty fullscreen opening.
2. **QMS, light:** recover `DigitalQmsVisual` and `DigitalQmsCapabilityStrip` together. Preserve the 1,180px Git composition: digital sources left, 188px hub center, existing ecosystem right, capability strip below. Keep its internal visual scale, spacing and motion. Update wording only where needed for the approved Lattice content.
3. **Contextual AI, dark:** recover `VoltronAiVisual` artwork and context-input structure. Explain context-grounded assistance and evidence limitations; remove absolute claims that generic AI has no awareness of the real world. Use a content-led height rather than restoring a 1,020px fullscreen wrapper unchanged.
4. **Specialist roles:** recover the six existing agent assets and compact card style: KAVO, RIXA, MEKO, ZILO, SARO, TEYO. Desktop three columns by two rows in a 1,040px frame with 24px gaps; tablet two columns; mobile one. Each card contains one role, one real question and an appropriately large image. Describe designed roles, not six independently deployed autonomous workers.
5. **Investigation example:** reuse the TEYO investigation visual as one framed illustrative tool showing competing hypotheses, evidence, missing information and human review. Avoid duplicating the full agent grid inside it.
6. **HITL, dark:** restore the original 1,040px split and approximately 492 x 328px station scene. Show a temperature-deviation example with relevant context and an authorized next step. Demonstration interactions may update local illustrative state; they do not send plant commands. Maintain the distinction between suggestion, decision and verified result.
7. **Close:** a compact manufacturing/partner action, not another QMS recap.

QMS, AI and HITL are three clear sections of one page, not three items squeezed into a single viewport. Use normal scroll and stable anchor offsets; prevent the global page paragraph rule from overriding diagram captions.

### 5. Manufacturing `/manufacturing`

Purpose: show Alpha as the first practical application and make production inquiries usable.

1. **Alpha opening:** recover the Git Alpha split, 1,080px frame and existing factory artwork. Headline and short development-context copy left, meaningful factory image right. Preserve artwork scale and its equipment details.
2. **Production setting:** explain surface treatment, process engineering, equipment, quality and operating discipline. Process readiness must distinguish commissioned, commissioning and planned work once verified; never infer readiness from the diagram.
3. **Factory overview:** show the existing detailed factory artwork across the content width if its labels require inspection. Do not replace it with an abstract Alpha logo scene. A clear caption distinguishes illustration from a photograph or as-built layout.
4. **Traceability and customer visibility, light:** recover relevant context/customer visual logic as ONE compact demonstration, beside the copy. Merge status, lot evidence, quality and dispatch into one scene; no separate digital-thread card below. Start with a roughly 496px-wide, 340-380px-high scene and adjust only to match the adjacent copy's actual height. Labels are real text; sample data is marked illustrative.
5. **Production entry:** discuss part, process, volume, requirements and timing; link to `/partner` with the production interest preselected. Keep the actual form on Partner.

### 6. Network `/network`

Purpose: distinguish reusable capability, plant deployment, partnerships and future products.

1. **Opening:** concise heading and explanation, not a full screen of copy.
2. **Business model, dark:** recover `BusinessModelInfographic` at approximately 1,100px. Explain shared platform, directly operated plants and Factory JVs as distinct responsibilities. Preserve the original hierarchy and diagram connections.
3. **Compounding capability:** recover `NetworkAdvantageVisual` in the original 1,040px frame. Show process knowledge, engineering methods and deployment standards feeding better future capability. Label proposed factory nodes as a scaling vision, not live operating locations.
4. **Industrial products, light:** one editorial section distinguishing the longer-term product direction from Process Pack expansion. Avoid launching an unconfirmed product catalogue.
5. **Partnership close:** a clear action to the partnership form. Retain customer/plant data boundaries; common architecture does not imply unrestricted sharing.

### 7. About `/about`

Purpose: make the company, human purpose and current leadership clear.

1. **Opening, dark:** systems approach to industrial progress; concise explanation of manufacturing as the first application.
2. **Distinct capabilities:** technology, operations and plant engineering as complementary disciplines, not fictional separate executives.
3. **Leadership, light:** reuse the Git people-card design, circular portrait treatment, proportions and spacing. Publish Omkar Todkar as CEO using the approved relevant asset. COO and CTO say profiles coming soon; do not restore the old names, titles, IP ownership or experience claims. Use deliberate unavailable-profile treatment rather than invented faces.
4. **Human purpose:** brief bridge to People Culture and Commons, each with a distinct description and link. Keep their full content on their own routes.

### 8. People Culture `/about/people-culture`

Purpose: communicate the organization being built, without turning people into machine nodes.

1. Light opening with 40px heading and a 560-620px reading measure.
2. Depth, Craft, Courage, Imagination and Humanity as a restrained editorial sequence. Use a balanced two-column text grid where useful, not empty cards or a lattice of interchangeable people.
3. Daily work: visible reasoning, clear responsibility, disagreement and learning.
4. Working with AI: direction, judgment and accountability remain human responsibilities.
5. Close with Commons and Contact links. No unverified job openings or fabricated workplace photos.

A lighter editorial page need not force an image into every section. Use the original typography, rules and spacing to connect it to the wider site.

### 9. Commons `/about/commons`

Purpose: clearly present a developing external contribution, separate from internal culture.

1. Light opening; explicit Developing vision status beside the introduction.
2. Access, Apprenticeship, Fellowships, Residencies and Regeneration in the same restrained editorial rhythm as Culture, with distinct content.
3. Possible future forms and guiding principle, clearly conditional; no fictional impact figures, deadlines or Apply now controls.
4. Collaboration invitation linking to `/partner` with Commons collaboration selected. No invented programs or unsupported media needed to finish the page.

### 10. Partner `/partner`

Purpose: preserve the functional inquiry paths and finished Git form presentation.

1. Compact centered opening in a 1,040px frame.
2. Two equal desktop form columns, 32px gap: Production Programs and Partnership/JV. Stack on mobile; keep labels above controls, appropriate input types and clear required/optional treatment.
3. Preserve existing API wiring, validation, disabled/submitting state, confirmed success and error behavior. Keep entered data after failure. Do not restore a stale Git API over current changes.
4. Contextual links preselect Production, Factory JV or Commons as appropriate; deep links must scroll to the right form and respect header offsets.
5. Pune context, accurate privacy notice and shared footer. No animated backgrounds or shifting layout during form entry.

## 5. Navigation, Motion and Accessibility

### Navigation

Keep six primary destinations: Technology, Intelligence, Manufacturing, Network, About, Partner With Us. Home is the brand link. Ontology sits under Technology; People Culture and Commons under About. Submenus work with click, keyboard and touch, not hover alone. Mark the current route clearly.

Retain the 48px desktop header baseline and existing auto-hide behavior: visible at the top; hides when scrolling down; returns on upward scroll, pointer near the top, or keyboard focus. Never hide while a menu is open or focus is inside it. On touch, scrolling and the menu control provide access without relying on pointer proximity. Use `scroll-margin-top` so revealed navigation does not cover anchored headings.

### Motion

- Recover the hero's original timing and glow, including its approximately 5.1-second opening sequence. Do not delay navigation or text accessibility until the sequence ends. Animate around the master logo, not its geometry.
- Preserve completed Git internal animations in modularity and QMS. Do not add unrelated particles, floating shapes or extra pulsing to them.
- New content reveal: opacity plus at most 12px translation, approximately 400ms; stagger 60-80ms; once per section. No revealing every sentence independently.
- Cube selection: approximately 200ms panel transition in a stable frame. Manual rotation never requires auto-spin. Stop offscreen render loops rather than merely making them invisible.
- Relationship/event demonstrations move only to explain their sequence, approximately one purposeful transition every 2-3 seconds; provide pause when continuous motion is offered.
- Reduced motion: static hero, no continuous glow/auto-rotation/traveling signals; all content and manual controls remain available. No motion-dependent meaning.

### Interaction Integrity

Use actual icon-library controls with accessible names/tooltips for rotate, reset, play/pause and navigation commands. Target 44px hit areas even if an icon or projected tag looks smaller. Visible focus, readable contrast and keyboard alternatives are required. Do not add action-looking controls to decorative imagery unless they do something understandable.

## 6. Reuse and Implementation Method

| Work | Source to reuse | Integration rule |
| --- | --- | --- |
| Hero | `HeroIntro.tsx`, its original CSS and assets | New branding; original glow/composition |
| Second Home scene | Git `app/page.tsx` gap section + `CyberPhysicalStack` | Preserve sizing, assets, bridge and motion |
| Lattice discovery | Current `components/lattice/LatticeCube.tsx` | Correct geometry, detail scale, controls and fallback |
| Technical architecture | `ArchitectureLayers.tsx` | Restore once on Technology; update responsibility copy |
| Modularity | `ModularPlatformVisual.tsx` | Preserve original finished composition |
| Ontology/context | `ManufacturingContextVisual.tsx` and factory-flow asset | Reuse artwork; new meaning/evidence labels |
| QMS | `DigitalQmsVisual.tsx`, capability strip, source arrays | Recover as a complete dependency set |
| AI and agents | `VoltronAiVisual.tsx`, agents experience, compact cards, HUD helpers | Existing artwork; qualified new copy; scroll-page layout |
| HITL | `HitlVisual.tsx`, HITL asset and agent | Illustrative local behavior only |
| Alpha/customer context | `AlphaProofVisual.tsx`, existing factory/customer visuals | Keep detailed assets; one merged customer simulation |
| Network | Business model and network advantage components | Honest scaling status, no fictional live fleet |
| People/forms | Original card layout and current forms/API | New leadership facts; retain current working inquiry contract |

Do not blanket-restore the Git tree. Recover only needed pieces from d601b39, carrying their exact styles, data and hooks. Preserve unrelated current edits, especially inquiry handling. Keep new shared layout rules scoped so a global paragraph or heading selector cannot resize recovered diagram text. Consolidate only conflicting selectors relevant to this work; avoid a full unrelated rewrite of the approximately 11,800-line stylesheet.

### Build Order and Checkpoints

1. **Lock the visual baseline:** record recovered assets, computed fonts, widths and protected section screenshots; establish ordinary/wide/QMS/context container variants and spacing tokens.
2. **Restore the approved pieces:** hero, second Home scene, modularity and QMS first. Compare them against Git before building new visual sections on top.
3. **Complete Home and Technology:** full seven-section Home flow, one cube, technical architecture, horizontal operating loop and contextual links. Check the 1366 x 768 short-window case early.
4. **Complete Intelligence and Ontology:** recovered evidence/agent/HITL visuals; new meaningful relationship content; normal long-page flow.
5. **Complete Manufacturing and Network:** Alpha artwork, one customer demonstration, business-model and network graphics.
6. **Complete About, Culture and Commons:** correct current leadership and purpose content, deliberate lighter editorial layouts.
7. **Integrate navigation and Partner:** route menus, header reveal behavior, anchor offsets, preselected inquiry intents, footer and metadata. Keep all ten routes reachable.
8. **Run one full audit, fix by cause, then confirm:** computed geometry, screenshots, interactions, accessibility, type/build checks and content deduplication. Do not declare completion from source changes alone.

## 7. Acceptance Checklist

- Check all ten routes at 1440 x 900, 1366 x 768, 768 x 1024, 390 x 844 and 360 x 800; include 200% zoom/reflow checks for reading and forms.
- Compare hero/second Home screen/modularity/QMS against the Git baseline. Preserve intended visual hierarchy; document any necessary copy-driven height increase.
- No horizontal document overflow, clipped labels, overlapping text, stretched assets or fixed-height content truncation. Measure widths and bounding boxes, not screenshots alone.
- Major artwork is readable at its intended breakpoint; no login screenshot buried in a tall empty holder. Product/diagram labels remain legible; body copy does not unexpectedly inherit diagram sizing.
- Canvas screenshot and pixel checks confirm the lattice is nonblank, correctly framed, genuinely rotatable/selectable and using the correct logo/asset. Verify fallback, keyboard selection and mobile scroll behavior.
- Check header reveal by upward scroll, top-pointer proximity and keyboard focus, plus open-menu retention. Check all Home and detail-page anchors.
- Verify reduced motion and offscreen suspension. Never use animation as the only way to learn a component's role.
- Forms: invalid, busy, successful and failed submissions with a local stub/interception, not real external inquiries. Confirm retained fields after error and correct contextual preselection.
- All links, titles, sitemap entries, active navigation and footer destinations agree with the ten-route structure. No empty menus, dead Know more links or surprise additional public pages.
- Content review: current versus planned status, approved leadership, actual legal entity, verified LinkedIn, customer data boundaries and no unsupported AI/control claims.
- Run the project's available type/build checks and focused tests for changed behavior. Report any check that could not run.

## 8. Evidence and Remaining Publication Inputs

Audit artifacts are in `.visual-check/plan-ui-audit/`: `report.json`, `current-overview.png`, `git-overview.png`, and desktop/mobile screenshots by route or original section. They are local review artifacts, not public site assets.

Before publication, confirm the registered legal entity, process readiness and which demonstrations can be described as implemented. These inputs do not block recovering the UI or building the ten-page structure; provisional wording stays explicit until verified.

Implementation is complete only when the recovered Git quality and the new page flow work together at the tested sizes. More content alone, smaller type alone or more decorative cards will not meet this plan.
