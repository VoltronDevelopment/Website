# Brand entry and hero implementation plan
9 November 2026 · Proposed for review

## Entry alignment

The current dissolve advances on a 4.4-second animation clock. It requests Home at 43% and prepares the live cube at 64%. EntryDissolve freezes the outgoing surface, masks it from left to right, and paints particles over it. It also clones the wordmark into a sibling above that mask. Once Home mounts, it translates and independently scales the two words toward the Home heading for 1.15 seconds, then swaps in the live letters. The intro draws individual letter spans while Home draws whole words. Matching their bounding rectangles does not match individual glyph positions. HomeMotion also animates the keyword line for 1.5 seconds on top of its CSS entrance animation. These are concrete places where the text gets a separate entrance or can appear to settle twice.

1. Capture a cold entry, warm entry and direct Home load. Sample text bounds, cube center, canvas bounds, mask position and visibility on each animation frame around navigation and cleanup. Include clicking the final tile and skipping the introduction.
2. Give the outgoing wordmark the same masking surface as the outgoing tile. Draw it once in intro coordinates. Remove the travelling word clone and per-word transforms. Mount the real Home heading, tagline and strip in their settled positions behind the outgoing surface. Use the existing sweep edge to reveal destination text as it passes. Suppress the standalone text entrance animations on this path. Keep the existing particle generator, tile flip, timings and cube animation.
3. Derive the preview cube and actual hero artwork bounds from one responsive layout. The current preview uses a centered travel-path with independent viewport offsets. On desktop place it in the same right column as Home. On mobile use the current stacked artwork frame. Match the visible subject including internal poster padding, camera, scale and glass edges. Confirm poster-to-canvas continuity at the instant the bridge disappears.
4. Reserve header, font, tagline and strip space from the first frame. Prepare destination content before the sweep uncovers it. Handle route delay, resizing, interruption and Back by cleaning up temporary layers. Direct entry, reduced motion and static artwork should land with readable text and the same final geometry.

## Hero composition

Start desktop proofs at 1024 px with text on the left and artwork on the right. Use the site container and start at 45% copy / 55% art. Align the visual center of the subject with the text block; transparent canvas margins differ by scene. Home gets the one-line Montserrat Light wordmark with existing brand tracking and “Building India’s Intelligent Manufacturing Backbone” beneath. Give the tagline its own line box and allow a natural two-line wrap on compact laptops. Other pages retain their own titles, descriptions, actions and breadcrumbs.

Place a three-item semantic list across the bottom of each hero, in normal document flow. Use a fine theme-aware top rule, three equal columns, 18–20 px outline icons and 15–16 px labels on desktop. The labels explain the chapter and have no click action. Hide the decorative icons from screen readers. Move existing keywords into the strip so each appears once. Review any existing principles row for overlap before combining or retaining its content. Use the available viewport height below the header as a minimum; short windows and zoomed text must be able to scroll.

On mobile keep each scene’s present size, artwork order and centered heading. Place the labels in a compact row after the existing hero content. Stack icon above label if width is tight, let long words fit at 320 px, and respect bottom safe-area padding. Keep the India tagline on desktop Home for this pass.

| Page | Existing words | Suggested outline motifs in order |
|---|---|---|
| Home | People · Manufacturing · Intelligence | People group · factory · connected nodes |
| Technology | Execution · Signals · Knowledge | Workflow · waveform · open book |
| Intelligence | Gather · Compare · Review | Inbox · paired columns · clipboard check |
| Manufacturing | Treatment · Inspection · Traceability | Process tank · inspection lens · linked records |
| Network | Plants · Partners · Reach | Factory · handshake · globe |
| About | Engineering · Craft · Judgment | Calipers · hand tool · balance |
| Commons | Access · Learning · Possibility | Open door · book · branching path |
| Partner | Programs · Factories · Collaboration | Milestone flag · factory · people group |

## Delivery and acceptance

1. Proof Home, Intelligence and Commons together at desktop width in light and dark. Compare mobile before and after. Include a transition recording from the final Enter Lattice tile at normal speed and a frame strip across the route swap.
2. Integrate Home’s custom hero and the shared Hero component using the same desktop grid and tag strip. Retain a dedicated slot for each artwork. Consolidate conflicting centered and stacked overrides. Use approved Home geometry as the entry transition destination.
3. Migrate the five remaining heroes. Inspect the widest factory scene, longest titles, About breadcrumb and Partner actions for clipping and alignment. Legacy ontology URLs redirect to Technology, so verify their destination anchor separately.
4. Test 320 and 390 px phones, portrait tablet, the desktop breakpoint, a short laptop and a wide desktop. Check both themes, keyboard entry, reduced motion, static fallback, 200% text zoom and slow font or route loading. Verify one readable instance per visible text region, no fade restarting, no last-frame change in heading baseline or cube center beyond one CSS pixel at a stable viewport, and no controls hidden behind the strip. Check motion on a physical phone before claiming device smoothness.
5. Review the recorded Home handoff and all eight hero captures before release. After deployment repeat the entry tile flow and direct Home load on the public site.

## Live audit evidence

Checked the production final entry tile and all eight hero grids in Chrome at 1440 × 900 and 390 × 844. At desktop width Home, Intelligence and Commons stack artwork above copy. Technology, Manufacturing and Partner put artwork on the left. Network and About put copy on the left. At phone width all eight stack, with artwork first on Home, Intelligence and Commons and copy first elsewhere. In both entry traces the travelling wordmark was visible while the real Home title was hidden, followed by the swap to the real title. The trace establishes sequential rendering. It does not establish overlapping duplicate letters in a particular frame or a physical-device frame rate.
