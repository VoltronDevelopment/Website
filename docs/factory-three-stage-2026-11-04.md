# Factory scene — Alpha equipment refinement, 4 November 2026

Local implementation uses the approved Alpha equipment family. Shared source helpers in components/home/alpha-equipment.ts build the tank shell and wheeled trolley. The homepage three-tank scene uses both; the detailed thirteen-tank scene uses the same trolley body; the Technology factory uses a uniformly scaled version of each. The original homepage liquid shader is shared through alpha-bath-surface.ts. Existing alphaVisualColors and createAlphaStackLight supply theme values and industrial status lamps. No new dependencies or models.

Factory tanks now have glass fronts/sides, liquid volumes and animated reflection/immersion surfaces, polished frames/rims, fasteners and feet. The carried perforated panel follows Alpha geometry. The trolley has wheels, motor housing, suspension cables, hook and gripping jaws. Fixed rail spacing follows the trolley wheels. Rail runs are trimmed around two stationary indexed 90-degree transfer tables.

The U-shaped process is loading, three tanks, two corner turns, camelback oven, adjacent inspection and dispatch. The oven has a ground-mounted foundation, insulated lower enclosure, raised chamber, sloping entrance/exit hoods, a viewing window and a suspension slot. Split entry doors open before arrival and close for curing. Exit doors open before departure and close after clearance. Inspection is directly at the return-line exit; the former remote inspection detour is removed. The fixture lowers the same panel onto the inspection support and retracts through its roof clearance slot. After release, a cart reaches from outside the booth with supporting forks before packing/loading.

Receiving/dispatch remain separate bays at the open end of the U. Truck rear door, fork/cargo-floor and release-before-departure phases remain governed by the timeline. Factory Twin/MES follow the independent overview route; Manufacturing retains its detailed thirteen-tank route.

Verification: 37 focused tests pass for factory/graph/Alpha choreography, including stationary corner rotations, oven door interlocks, curing dwell, continuous supported panel poses, direct exit inspection and rear loading. Shared-equipment build passed; original homepage and full Alpha rendered on desktop/phone in both themes without page/shader errors. Final grounded factory viewport/theme review is recorded under .audit-logs/factory-alpha-kit-20261104.

The factory remains an illustrative process pack, not a validated engineering drawing or curing recipe. No push/deployment is included. Broader site-goal acceptance remains separate.

## Proportion and clearance pass

Oven vertical profile reduced by 14% while retaining its grounded enclosure. Curing panel height is 2.236 scene units; explicit approach/exit poses at 2.2 prevent the panel clipping the lower hoods. Chamber floor and roof slot remain clear of the panel/fixture envelope. The inspection booth is directly beside the exit, and the dispatch cart remains outside its base while reaching beneath the released panel. The current production artifact is .next-factory-alpha-kit-20261104.

## Detailed equipment review in progress

User rejected the earlier compact factory fidelity despite passing route/layout checks. Completion of this scene is therefore not established by those checks. The next pass adds Alpha-style bearing housings, polished rail caps, station joints/bolts, diagonal support brackets and anchored feet; enables controlled cast/contact shadows; replaces the broad glass-blue foundation with the Alpha foundation material; and reduces unrelated active-process labels. TypeScript passes. Production build passed. The rendered desktop comparison confirms grounded shadows, bearing detail and quieter foundation; responsive review covers both themes. Further visual/mechanical acceptance remains required.

## Physical timing and effects continuation

The tank-travel multiplier no longer accelerates corner indexing or oven transit. Canonical 50–58 seconds use a slower transfer clock, with normal-rate curing dwell; total automatic playback is approximately 96.5 seconds. This preserves existing chapter/event identities while giving both turns, door clearance and curing entry/exit readable time. Drainage droplets remain under the current lifted panel. Quality scan uses a horizontal sweep followed by a vertical sweep with separate envelopes. Receiving now owns its scan material so quality opacity cannot accidentally hide its identification pass. Thirty focused factory/graph/timing assertions pass. Current final full-cycle playback evidence is being refreshed and must supersede earlier factory timing captures.

Additional chamber-clearance regression samples the whole transit: panel lower/upper edges stay clear of the scaled floor/roof, and both door crossings occur with the respective aperture fully open. Thirty-one focused checks now pass.

Current production full-cycle review completed at 1440/light and 390/dark with no page or shader errors. Fourteen live moments per case cover receiving, immersion, hold, both indexed turns, both door crossings, curing, exit lowering, sequential scans, inspection collection, loading and completed dispatch. Evidence: .audit-logs/factory-motion-20261104/physical-cycles.json and corresponding visible PNG frames. The first browser attempt timed out before readiness and is not counted as playback evidence; the completed retry supplies the evidence. Software browser checks remain distinct from physical-device frame-rate measurements.

## Matching fallback completion

Factory loading/graphics failure now retains native captures of this exact scene, not the prior thirteen-tank version or text alone. Desktop images are 2240×882; phone images are 640×702. Captures exclude interface labels/buttons. WebP delivery is approximately 45–47 KB desktop and 16 KB phone. Both themes at desktop/phone passed forced context loss: active-theme image decoded, became visible, and the live scene recovered. The refined-artwork gate now explicitly covers all four factory images and passes. Production build includes the loading/recovery presentation. Evidence harness: factory-poster-recovery.cjs, captures under .audit-logs/factory-alpha-kit-20261104.
