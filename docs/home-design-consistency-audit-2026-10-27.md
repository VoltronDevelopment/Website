# Home design consistency audit — 27 October 2026

Status update: the corrective implementation and final verification are recorded in [Home DNA implementation](home-dna-implementation-2026-10-27.md). The findings below preserve the state observed before that correction.

This is a review of the current working copy after the latest Home changes. It does not approve the revision for publication. Source files changed during the review, so earlier screenshots and the earlier passing 239-test result cannot establish correctness of this latest revision. No visual implementation changes were made during this audit.

## Findings, in priority order

1. **Automatic card scrolling can interrupt reading.** `ApplicationPreviews` advances its rail every 8.2 seconds and calls `scrollIntoView`. The interval checks hidden documents, motion preferences and recent rail activity, but not whether the section is on screen. It can pull the document back to the application section. Horizontal parallax should follow deliberate scrolling or card selection and stop offscreen.

2. **The current typecheck is blocked.** The latest completed `npm run typecheck` reports TS2365 at `components/home/home-cube-renderer.ts:187`: `image.width` can be either a number or SVGAnimatedLength. An earlier missing `subscribeScroll` reference disappeared in subsequent source changes. A clean current build and browser verification are still required.

3. **V-MO breaks the brand palette.** Its visible SVG has a fixed lavender background (#f4effc), yellow/pink/mint/periwinkle puzzle pieces and a purple centre (#6d4adf). Those colours bypass the two-theme Voltron navy/pearl/cobalt/cyan system. The concept can survive in brand colours, with depth represented through tone and overlap rather than unrelated categorical colours.

4. **Application artwork implementations are disconnected.** The route currently renders `Diagram` SVGs. `application-artwork.ts` contains a separate Three.js renderer, but the visible card component does not import or mount it. Its presence is not proof that the new 3D artworks are implemented. Choose the actual art direction and finish one renderer per view.

5. **Roadmap cubes do not share the complete hero optics.** Their single rounded-body material is tagged as the Home crown and uses `tuneHomeGlass(..., 'top', ...)` for the entire object. Top/near/recess faces therefore do not receive distinct treatment. It has transparent opacity around .5–.62 and depthWrite=true across assembled cells, requiring overlap/order checks. Keep the 1/4/8 structure and globe, but establish face-specific pearl/smoked surfaces and shared reflection conventions.

6. **The new Connected Lot card misses the shared sheen selector.** It renders `.lot-selected-record`; the added reflective-glass pseudo-element recipe still targets retired `.lot-story-tiles button`. The one-card interaction is present, but its material finish is weaker than the app/roadmap cards. Update the actual component owner rather than adding another inactive selector.

7. **Home and Diwali tile glow proportions diverge.** They share `IdentityTile`, and the larger Home mark is intentional. However Home overrides the halo inset to -22px versus the shared -56px, and the pulse inset to -6px versus -12px. This is a different glow envelope. Use common proportional tokens if the requirement remains the exact Diwali treatment.

8. **The HD logo needs fidelity validation.** The 1024/2048 WebPs are created from a 1254px raster light-rectangle asset by colour-distance alpha extraction. The larger output does not create extra original detail, and the extraction thresholds can affect pale antialiased strokes. Compare silhouette, fine leaf/circuit strokes and colour against the approved original before calling it an exact HD replacement.

9. **Reflections need theme lifecycle verification.** The hero captures a cube environment once after completion. Its local `reflected` flag is not reset by the theme update function. Switching themes after the reveal can retain an environment captured for the other theme. Validate/invalidate captures on theme changes, with bounded capture cost.

10. **Wave and object formation clocks diverge.** Hero glass arrivals complete over 2.1 seconds with cell offsets up to .8 seconds. The current particle sheet uses 3.6 seconds plus offsets up to 1.08 seconds, but switches to release after 3.6 seconds. The objects can finish before the sheet resolves, and late particle arrivals are interrupted. A clearly visible sheet should approach, compress, deposit, then release under one shared event timeline.

11. **The requested year-travelling cube is not currently mounted.** There is `.roadmap-runner` CSS, but the roadmap markup contains a fill line and milestone dots rather than the travelling cube. The automatic milestone sequence is separate from that missing object. Implement one visible traveller tied to active year/stage and the main 1/4/8 core.

12. **Cascade and semantic cleanup remain.** Home CSS retains multiple older roadmap/card layouts and appended replacements. Current app/roadmap buttons declare tab roles without a complete tab-panel/arrow-key contract. Consolidate active owners; use ordinary selection groups where all content is not a tabbed interface.

## Material direction to preserve

The hero still has the strongest material basis: face-specific pearl/smoked colour, clear/recess/crown roles, authored softbox bands, studio environment and geometric rims. It has not lost all glass treatment. The inconsistency is that several new surfaces only reproduce isolated parts of that system.

Use five purposeful profiles: hero optical glass; foreground reading glass; clear process enclosure; satin/polished manufacturing metal; quiet background atmosphere. Share pearl/navy/cobalt/cyan, light direction, roughness families, highlight width and glow limits. Keep artwork-specific transparency: applying one opacity to every object would obscure the part and flatten hierarchy.

The corrective sequence is: stabilize the current build and scroll behavior; reconcile palette and actual mounted artwork; connect actual card selectors; unify face materials/reflections and tile glow; synchronize particle clocks; finish the year traveller; regenerate matching fallbacks; verify both themes, phones/tablets/desktops, reduced motion, slow loading and offscreen disposal.

## Verification boundary

Read-only source review, asset metadata inspection and TypeScript checks were completed. The latest typecheck fails at the location above. Earlier successful browser checks covered a previous Home revision at 1440×900, 820×1180, 390×844 and 360×640 in both themes. They must be repeated after the current implementation stabilizes; they are not current acceptance evidence.
