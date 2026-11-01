# Event-connected operating platform — 1 November 2026

This revision supersedes the 52-second timeline in the earlier operating-platform documents. The single deterministic story now lasts 68 seconds. Chapter starts are Order 0, Receive 6, Execute 20, Review 37, Release 46 and Dispatch 57. Inspection begins at 54, quality release occurs at 56, outbound movement begins at 62 and dispatch completes at 66.

## Spatial composition

A separate digital band above the physical scene contains SCADA, V-MES, V-MO, V-Twin and V-AI. V-MO appears first. Pearl/smoked translucent surfaces, sparse SVG diagrams and a shallow depth treatment keep the digital layer quieter than a full dashboard. Mobile uses five product selectors and one expanded product representation. The physical scene occupies its own lower viewport. Former freestanding information screens and their empty pads were removed. The opening chapter frames a complete factory overview before following the active operation.

Product screen selection pauses the physical story and opens the relevant record explanation. Desktop details reserve a side column; mobile retains its native sheet. The miniature Twin derives its position from the same carrier coordinates as the factory.

## Physical sequence

The inbound vehicle faces outward and reverses into the receiving dock between 6 and 10 seconds. It stops before doors open. The panel and pallet stay in the cargo area during approach. Unloading transfers the material to receiving from 11 to 14; identification runs from 14 to 16; staging holds until 17; transfer to the distinct production loading point runs from 17 to 20. The empty handler withdraws. Doors close before the inbound vehicle pulls forward out of the bay.

One panel mesh follows the lot throughout execution, the T06 hold, inspection and packing. Carrier hangers extend with the fixture rather than leaving gaps during lowering. A transfer support carries the part after production unloading. Outbound doors close before the dispatch vehicle departs. All timings and logistics are illustrative and compressed, not a validated plant-control simulation.

## Event semantics

Ten explicit events connect order identification, material allocation, loading, station observation, investigation, supporting evidence, authorised review, inspection, quality release and shipment. Signals exist only for two seconds following those events. There are no continuously circulating connection dots. Each visible digital pulse has a named physical/record source and one or more product destinations. Screen state and the event caption derive from the same clock. Selection can show static relationships without inventing new events. AI never grants quality release.

## Verification

Ten focused model/layout tests cover hold/release constraints, continuous material transfers, reverse docking, staging, cargo-door ordering, valid identities and event-window signal emission. Existing modularity and product-scenario tests remain part of the focused check. Production build and responsive browser evidence are stored under .audit-logs/operating-digital-20261101 and .audit-logs/operating-digital-final-20261101. Checks cover all six chapters at phone/tablet/desktop widths in both themes, digital-screen selection and details, focus restoration, live dispatch and offscreen suspension. Initial Technology route JavaScript remains approximately 137 KB.

Local inspection only. No public deployment or push is included.
