# Voltron Lattice · sitewide artwork and experience audit

7 November 2026 · Local production build `_kayymHuXVnIg7_jVAimv`

## What I would change first

The site has a recognizable identity. Its best scenes let a visitor follow one thing through a change and see why that change matters. A pack seats in a socket before Machining becomes active. A gauge measures the bore that the spindle just finished. The 13-tank line keeps custody of the same lot. These are better standards for the next pass than increasing glow or adding particles across the site.

Three rendering issues deserve attention first. The most important editorial correction is on About. The most important performance investigation is first entry into the Technology factory. The most useful visual change across multiple pages is to choose a still that explains the action, particularly when a visitor has chosen reduced motion.

| Priority | Finding and evidence | Completion check |
|---|---|---|
| 1 · Intelligence, Point of work | Confirmed. On a direct reduced-motion visit the Situation chart shows its marker but hides the recorded trace. The normalized stroke offset was 1. Selecting the already-active Situation view changed it to 0 and revealed the trace. | The same evidence is visible on first entry, reselection, keyboard selection and return navigation. Motion-enabled entry can still draw the trace. |
| 1 · About, Leadership | Confirmed. After the founder projection had drawn, I simulated graphics-context loss. Both poster pictures remained hidden and the host still reported a live scene. The role text survives but the portrait can disappear. | On loss, show the theme-matched portrait immediately. Keep it until the restored renderer has drawn a valid frame. Exercise the same sequence on the COO and CTO cards. |
| 2 · Home, Connected Lot | Confirmed on a fast phone visit in dark reduced-motion mode. The first visible image had no selected source or decoded width at the 100 ms check. It had a valid decoded source at the later check. This was a transient empty illustration. | Direct entry, fast scrolling and back navigation all show a useful first pose while enhanced art becomes available. Verify on a cold cache and retest light mode. |
| 2 · About, Depth in the work | The introduction describes a reviewer, a missing bore measurement and an inspection bench. The adjacent artwork is an open head encircled by eight skill cubes. There is a working bore-and-gauge illustration in the preceding section. | Pair the bench anecdote with the bench. Introduce the ring through the capability it represents, and identify the selected skill beside its cube. Test the connection before opening any detail sheet. |
| 2 · Network chapter guides | In reduced motion, chapter text changes, while the corresponding study keeps its completed overview. The UI discloses this. At “Site” the visitor can already see the assembled plant. At a learning handoff the overview cannot show which facility originated it. | At minimum, Site, Installation and Connected show different honest poses. A selected transfer identifies its two facilities. Native rendered stills are sufficient. |
| 2 · Page entry and sustained motion | The local build passes its delivery budgets. The motion-enabled phone-size run still showed long frame gaps near the Technology factory, About hero, Network globe and Leadership. A small download does not guarantee a prompt first drawing. | Record poster visibility, first useful drawn frame, input delay and steady frame spacing separately on physical mobile hardware. Prioritize the factory first. |

## Coverage and interpretation

I reviewed 45 top-level sections across eight narrative pages, plus Credits, Enter Lattice and Coming Soon. The layout pass covered each route at 390 × 844, 768 × 1024 and 1440 × 900, in both themes with reduced motion. That produced 66 route checks and 288 section observations. I inspected desktop-light and phone-dark artwork contact sheets, sampled entry into every narrative section with motion enabled at phone size, and ran targeted interaction and failure checks. The [current design authority](../DESIGN.md) governs typography, optics, the Rubik hero and the five-cube roadmap. The [previous Intelligence and Manufacturing verification](intelligence-manufacturing-session-audit-2026-11-07.md) covers replay, first draw, inspector behavior and keyboard details in greater depth.

No tested route had positive document-level horizontal overflow or an uncaught page error. Across all eight narrative pages, opening the mobile menu and pressing Escape returned focus to the opener. Desktop and phone Back checks preserved the tested selections across all eight pages. Phosphating, CED and powder-coating inquiries arrived with their corresponding process selected. CTO and legacy referrals and a subsequent manual override also passed. Submitting an empty production inquiry marked three fields and focused the name field. No inquiry was transmitted.

Short motion samples establish entry behavior. They do not certify every frame of every full animation, every joint in a walk cycle, or every physical clearance. This review used desktop Chrome and emulation with software graphics. Physical Safari and Android, dynamic browser toolbars, assistive-technology reading order, real-device GPU memory pressure and field performance remain unverified.

## Page and section findings

### Home

| Section | What reads today | Refinement |
|---|---|---|
| Hero | The Rubik picture cube resolving into the exact mark is the strongest introduction to Voltron. Its transformations have a comprehensible endpoint. | Preserve the held logo and the quiet space around it. Use this scene as the optical reference for edge sharpness, directional faces and a single focal subject. |
| What Voltron connects | The convex desktop gallery and the phone's one-card view give the four previews a common frame. The visible portion of the next card is a swipe cue. V-MES has a meaningful work-order-to-release sequence. | At the actual phone card size, give the work order and its changing inspection status the strongest contrast. Leave full records to Technology. Make the relationship between this combined MES/SCADA introduction and Technology's five individual perspectives explicit in the transition. |
| Connected Lot | Following one lot through four stages establishes the physical thread used later. The selectable record avoids a stack of competing cards. | Fix the early empty image. Choose an initial pose with the part visibly supported by the conveyor and preserve the active stage through the handoff to motion. |
| Alpha preview | Three tanks give the physical process a distinct silhouette between the lot story and the roadmap. The entry sample showed a 1,100 ms frame gap. | Spend the clearest part of the preview on a single lower, dwell and drain. Save detailed equipment inspection for Manufacturing. Profile first entry before adding geometry. |
| Ten-year roadmap | Five cumulative cubes on the same base communicate growth, with one milestone explanation at a time. The first small dark cube has the least convincing ground contact. | Improve the contact shadow and one reflecting face on that first cube. Keep the common base and explicitly associate each increase with its stated capability gate so it cannot be read as a quantitative forecast. |
| Philosophy | A smaller solid cube entering the larger structure is a clear statement about an individual joining the whole. The spatial join earns its place without more particles. | Keep the entry and settled merge. Give About's culture illustration a different still, since its completed nested cube currently repeats this ending. |

### Technology

| Section | What reads today | Refinement |
|---|---|---|
| Neural network hero | Placing the artwork left gives it room beside the copy. The nodes already use the hero's glass language. Several thin links recede into the background in the light overview, and individual nodes can read as islands. | Give one meaningful route enough local contrast to follow across the whole composition. Preserve a readable connected route in the still and keep the unused routes quiet. |
| Order to dispatch | Receiving, treatment, curing, inspection and dispatch are recognizable stations. The digital layer above gives the data a destination. At phone size the moving load is small relative to the equipment and screens. The reduced-mode section exposes 28 visible buttons, selects or disclosure triggers across its full height. | Keep the physical carrier and its destination in the same shot for unloading, bath exit and dispatch loading. Give the drain and release short readable holds. Put secondary records behind the existing inspector and prioritize one active handoff above the factory. Verify hoist clearance and a stationary truck bed before transferring custody. |
| One lot, five perspectives | V-MO, V-MES, SCADA, V-Twin and V-AI give the same manufacturing subject different meanings. The ontology graph works best when the visitor can trace an operation back to its evidence. | Hold one active relationship long enough to follow it from endpoint to endpoint. Keep the same lot, station vocabulary and units through tab changes and the Manufacturing handoff. Distinguish a station example such as T06 from the three-stage factory's T03. |
| Modularity | A process pack leaving and a replacement seating in a common socket is the site's clearest use of a structural cube. The flat resting overview communicates “stack” more readily than “replaceable”. | Make the socket lip and the underside of the removable pack distinguishable in both themes. For an explanatory still, choose a pose with a small visible separation. Keep the selected process and card synchronized to docking. |
| Integration | The closing actions offer a logical route into the investigation and a practical route for partners. Its simpler composition gives the eye a rest. | Give “Follow the investigation” visual priority for a reader following this page as a story; keep the partnership action accessible as the alternative intent. |

### Intelligence

| Section | What reads today | Refinement |
|---|---|---|
| Projected head | The portrait is the subject, the cube is the projector, and the two scan directions reveal the same volume. The pale cheek and jaw lose separation against the light page. | Use a darker local reflection or cooler side plane behind the jaw. Retain the bottom projection and the face scale. Stronger bloom around the whole head would obscure its contours. |
| Observation and context | The suspended specimen and its linked records establish that a reading belongs to a part, operation and source. The mobile sequence separates the art from deeper record controls. | Highlight the route between the selected feature and its evidence, then let the light settle. Keep record detail in the inspector and the active observation adjacent to the specimen. |
| Six specialists | A common sharp enclosure makes the agents a family. Differences in internal mass, texture and flow are more informative than a change of hue alone. | Judge each at phone thumbnail size and in a still. A dense stream, fine particulate cloud and broad layered flow should remain distinguishable without motion. Preserve visible role names and distinguish the gallery's demonstration from actual investigation activity. |
| Working together | The shared situation gives a handoff a sender, receiver and reason. On the reduced-motion phone layout the section is 1,259 px tall, so a change above the fold can be separated from its explanation. | Put the current assignment or evidence sentence beside the active specialist. Keep manual stepping and the existing pause/resume behavior in the inspector. Preserve the specialist's image until its own first live frame. |
| Point of work | The compact V-AI views keep the next step and human review connected. The opening Situation view loses its trace in reduced motion, despite having a condition marker. | Render the entire recorded trace immediately for a static viewer. Add a regression check for first entry before any tab click and for switching motion preferences while the chart is visible. |
| Closing invitation | The transition to the physical process follows naturally from reviewing the evidence. | Make Manufacturing the apparent next chapter. A partnership inquiry can remain secondary for visitors who are ready to act. |

### Manufacturing

| Section | What reads today | Refinement |
|---|---|---|
| Hero | The machined metal bracket, its bore and the light on its edges make the physical subject tangible. It is a useful contrast to the surrounding glass. | Preserve the metallic finish and physical scale. This is the clearest place to introduce the recurring part before later pages ask a more specific question about it. |
| 13-tank journey | The gantry, suspended load, ordered stations and lot records make this the site's strongest example of mechanical storytelling. Replay and inspection were verified in the previous pass. | Protect those gains. On short screens prioritize the carrier, current tank and one route control. Keep lowering, immersion, withdrawal and drain distinct. Test the full tour and exceptions whenever changing camera framing or speed. |
| Production disciplines | Process consistency, traceability, quality and economics give the reader a change of pace after a complex simulation. | For each selection emphasize one concrete observation and what it changes in the record. The four choices and supporting blocks can otherwise feel like another product-screen selector. |
| Surface requirement | Reusing the bracket works when the reader is comparing what a treatment does to the same surface. | Keep the feature and camera fixed and make the finish or section boundary distinguishable at phone size. Preserve the illustrative qualification for the three process routes. |
| Production inquiry | Selected process context survives the link into the inquiry. All three production routes passed in this run. | Retain the short exit and prefilled process. Extra fields or a new artwork here would interrupt a working handoff. |

### Network

| Section | What reads today | Refinement |
|---|---|---|
| Globe | Land and sea establish geography; the polygonal outer mesh establishes scope. Its revolution and hold create a clear arrival. | Keep the landmass readable through the brightest pulse. Retain the distinction between network ambition and actual facility locations. First entry merits profiling. |
| Owned plant | The cutaway gives a plant physical credibility. Its equipment and process sequence also resemble the Technology demonstration. | Make the focal event the improvement proved locally and the evidence it produces. Technology already explains how the whole line operates. |
| Build the next plant | The live construction sequence has a distinct beginning and completion. The reduced-motion Site chapter shows a completed building above the chapter text. | Provide matched stills for site preparation, structural assembly, equipment installation and connection. Hold the final glow for the actual completion state. |
| Shared architecture and learning | Eight facilities occupy the corners of a cubical network. The central contributor and two directed transfers express local knowledge being shared. In the overview the center can compete with the smaller facilities. | Keep origin, destination and their connecting edge legible together. Dim inactive nodes during the transfer. Use a source/destination still for the corresponding chapter. Preserve the globe mesh for geographic scope in the hero. |
| Industrial products | The progression from requirement to drawing to component explains how recurring needs could lead to products. The bracket has already appeared several times by this point. | Fix the crop around one datum or bore and show the drawing decision beside the outcome. Keep the future-product qualification visible. |
| Invitation | Partner and About serve two plausible next intentions. | Keep the plant-building inquiry first and the company story second. A short editorial exit works here. |

The four middle studies tell different stories but share a similar vertical rhythm of heading, large art, chapter choices and explanation. On a 390 px phone they measure 1,052, 1,252, 1,193 and 1,106 px in reduced motion. The repetition becomes noticeable on consecutive scrolls. Use construction stages for the build, an origin/destination selection for learning and a drawing/part comparison for products. Reuse existing controls and keep the visual family.

### About Voltron

| Section | What reads today | Refinement |
|---|---|---|
| Stairs hero | Two abstract stair structures and three figures give progress a human scale. Dark mode separates the silhouettes better; one pale figure recedes on the light landing. | Strengthen contact shadows beneath feet and the light-side silhouette at the landing. Preserve the viewpoint that shows both flights and their occupants. |
| Connected disciplines | Finishing and measuring the same bore ties engineering, manufacturing and inspection together. It gives the recurring part new meaning. | Keep the tool withdrawing before the gauge approaches, the same datum visible and the recorded observation close to the result. This is the right home for the following section's bench anecdote. |
| Depth in the work | The head and eight surrounding capability cubes invite exploration. The introduction sets up a different scene. The selected capability's name is principally explained outside the artwork. | Introduce the skill ring in plain language and anchor one selected name at its cube. Keep the head enclosed by the circle and the mobile detail sheet for depth. A permanent halo of eight long labels would crowd the face. |
| Individual excellence, shared progress | Two contributions intertwine during motion. The settled reduced-motion image is another small cube in a clear enclosure, close to Home Philosophy. A direct phone visit confirmed the image did load. | Capture the two identifiable strands and their first bridge. A visitor should see how learning travels between people in one still. |
| Leadership | Monochrome founder, automotive chassis and recruitment study distinguish three roles without inventing portraits. “Revealing soon” and “Search underway” communicate the different statuses. Three full-width portraits and texts occupy 1,898 px on the phone. | Fix graphics-loss recovery first. Preserve portrait scale. Tighten repeated role framing or disclose extended bios progressively, keeping role and status visible. Initialize projections according to actual visibility and profile adjacent cards arriving together. |
| Strategic readiness | Criteria give substance to an ambition already introduced on Home. An editorial treatment is a useful change in pace. | Keep expandable evidence and readiness criteria here. Reserve the growing cubes and ten-year chronology for Home. |
| Build with us | The two paths to Partner and Commons make sense. At 778 px on the phone, this fork approaches the height of the 799 px hero. | Condense the invitation around the two distinct intentions and destinations. Preserve the generous artwork space for the preceding sections. |

### Voltron Commons

| Section | What reads today | Refinement |
|---|---|---|
| Tree hero | The living canopy inside a structured enclosure is the most literal expression of organic growth through engineered structure. On a dark phone the corner elements compete with the trunk. | Lower the contrast of the nearer corner faces and retain grounded light at the roots. Keep the tree's silhouette and subtle crown response central. |
| Access and agency | A field book points to an identifiable inspection feature and an actual factory the visitor can explore now. This is the strongest demonstration of what Commons already offers. | Increase local contrast at the matching hole and drawing callout. Prioritize this useful destination over future programs. Profile the transition into this study. |
| Shared learning | Sketches, relationships, comparisons and terrain introduce different ways of learning. The opening workbench arrangement follows a similar arrangement in the preceding section. | Start with a distinctly framed ribbon or active sketch. Reuse the assets but show a different question and gesture immediately. |
| Developing directions | Planting, staking and watering give the courtyard study a human action and connect it to the tree in the hero. Developing programs are explicitly qualified. | Let each physical action complete visibly. Keep concrete resources distinct from planned programs and preserve the qualification at phone size. |
| Participation | Three invitations offer different reasons to engage and converge on a Commons inquiry. | If visitors choose a specific intent, carry it into the form or its introduction. Keep the shared conversation route. |

### Partner With Us

| Section | What reads today | Refinement |
|---|---|---|
| Hero | Eric and Carla introduce a shared brief. The brief gives the figures a reason to meet and belongs to this page. One pale figure loses separation in the light treatment. | Strengthen its local side light and foot contact, then hold the readable brief between the figures. Review approach, planted feet, elbow bend and stationary wrist at the hold in real-time playback before any further rig adjustment. No new joint defect was established in the entry sample. |
| Opportunity paths | Four routes offer useful routing. The default production bracket is familiar after Manufacturing and tells little about what the prospective partner should bring. | Pair the sample with the information that starts a conversation, such as drawing revision, volume or surface requirement. Preserve the known physical part and change the question being answered. |
| Understand, fit, next steps | The brief can progress into a defined next action. In the static default, pale panels and the bracket make it hard to read what was decided, especially at phone size. | Show one recognizable requirement becoming an accepted brief, then the agreed next step. Shapes and one status label will survive the small scale better than a page of miniature text. |
| Inquiry form | Routing and validation work. At 1,245 px on the phone there is legitimate reading and input to accommodate. | Keep the selected route visible near the active fields and the first error easy to reach. Preserve natural page scrolling and existing disclosures. |
| Pune | A short location close gives the page a quiet finish. | Keep it typographic. The visitor has already reached the main action. |

### Entry and reference pages

| Page | Finding |
|---|---|
| Enter Lattice | The square front-facing tile, recessed mark, soft light and generous space make a good optical reference for the brand. Preserve the skip and direct handoff. A second brand introduction should stay short when the visitor's destination is Home. |
| Coming Soon | The cube, wordmark and countdown establish a separate prelaunch identity. The phone layout separates the mark and timer; the desktop light lettering is visually quieter. Preserve clear numeral/divider contrast as digits change and when the browser toolbar reduces available height. |
| Credits | A readable attribution list serves the page. Keep source links identifiable by keyboard and let long attribution text wrap. Additional glass cards would obstruct scanning. |

## Cube materials and meaning

| Role | Where it belongs | Optical and interaction rule |
|---|---|---|
| Brand identity | Home Rubik cube, Enter tile, Coming Soon | The exact mark gets the cleanest face and highest local contrast. Preserve crisp manufactured edges and a deliberate settled pose. |
| A replaceable or accumulating module | Modularity and Home roadmap | Give a block directional faces, a real supporting surface and a visible seat or contact shadow. In Modularity, docking changes process selection. In the roadmap, size accumulates five stated capabilities. |
| An agent with a changing internal state | Intelligence specialists | The sharp transparent shell stays stable. Interior material identifies the specialist; flow communicates activity. Keep a name and explicit status readable when animation is unavailable. |
| A named contribution or facility | Philosophy, About skills, Network learning | Make the actor, destination and consequence legible. A cube joins a whole, represents a named skill, or locates a facility. Shape and blue coloration alone cannot explain which one. |
| An enclosure for a subject | Commons tree, Leadership projections and Intelligence projector | The glass supports the subject. Use quieter front faces, directional side reflections and a local source of light. The face, tree or portrait should hold the strongest informative contrast. |

The code already shares optical behavior through the supporting materials, studio lighting and hero-derived face treatment. The remaining mismatches are predominantly compositional. In light mode several heads, pale figures and neural links lose separation; in dark mode some enclosure corners overpower their subjects. Adjust the reflecting face or the background immediately behind the subject before changing global exposure. Keep liquid motion tied to contact, particle movement tied to formation or transfer, and glow tied to a source or a completed state. Keep the steel bracket recognizably metal.

## Responsive layout and performance

Representative **reduced-motion, light-theme** section heights in CSS pixels illustrate where the visitor has to scroll to connect a cause with its effect.

| Section | Phone 390 × 844 | Tablet 768 × 1024 | Desktop 1440 × 900 |
|---|---:|---:|---:|
| Technology · operating platform | 1,363 | 1,513 | 1,538 |
| Intelligence · working together | 1,259 | 1,302 | 1,034 |
| Manufacturing · lot journey | 1,301 | 1,429 | 1,231 |
| Network · shared learning | 1,193 | 1,420 | 1,332 |
| About · leadership | 1,898 | 782 | 964 |
| Partner · inquiry | 1,245 | 1,232 | 1,301 |

Home's six phone sections already fit individually within the tested 844 px viewport. Complex studies and forms legitimately span more than one screen. Prioritize keeping the active object, its changing state and the primary action in one glance. Tablet deserves a separate pass: the factory, lot journey and Network learning all grow taller at 768 px than on the phone. Inspect how controls, secondary records and artwork share that intermediate width before reducing canvas scale or section padding. The site's artwork-motion preference is currently reached from Home; expose it from a shared, keyboard-accessible location for visitors who enter on another route.

The current production budget checker passed its 13 derivatives with ceilings of 200 KB per artwork, 15 KB for the header and 180 KB initial JavaScript per route. The separate native-capture dimensions and delivery checks also passed. These checks cover declared assets and bundles; they do not measure first drawing or prove that the selected phone derivative looks sharp on a high-density display.

| Section entered in the motion-enabled phone-size run | Largest sampled frame interval |
|---|---:|
| Technology · operating platform | 1,700 ms |
| About · stairs | 1,383 ms |
| Network · globe | 1,350 ms |
| About · leadership | 1,183 ms |
| Home · Alpha | 1,100 ms |
| Commons · access and agency | 1,083 ms |
| Manufacturing · hero | 1,033 ms |

These are short software-rendered section-entry observations. They include work from the page and potentially adjacent scenes. They identify where to investigate and do not attribute the whole delay to a single renderer. The previous audit's roughly 17 ms steady-scroll samples measured a different part of the experience. Start with cold and warm factory entries on a physical phone, then repeat on the globe and projections. Record time to visible poster, first complete frame, longest blocked input and steady scrolling. Check fast reverse scrolling, app background/foreground, context loss and high-density poster sharpness before reducing artwork quality.

## Suggested order of work

1. Repair the three reproducible rendering failures. Save first-entry and failure-mode checks alongside the existing replay and inspector tests.
2. Align About's bench, skills and culture narratives. Replace ambiguous Network chapter stills and put the matching source/destination or build stage on screen. These changes improve both meaning and reduced-motion access.
3. Refine phone and tablet composition on the factory, Network studies and Leadership. Preserve subject size and make the current event visible beside its explanation. Verify keyboard, sheet dismissal and selection ownership after each change.
4. Profile first drawings on physical devices, then target measured setup costs. Recheck the same scene at cold entry, warm entry and after crossing several pages. Preserve native artwork quality, meaningful mechanical timing and the successful interaction paths.

Local evidence includes the [layout matrix](../.audit-logs/site-artwork-review/matrix.json), [motion-entry samples](../.audit-logs/site-artwork-review/live-sections.json), [targeted reproductions](../.audit-logs/site-artwork-review/targeted.json) and [navigation and form observations](../.audit-logs/site-artwork-review/interactions.json). These local QA artifacts sit outside the shipped site.
