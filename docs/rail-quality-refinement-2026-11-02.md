# Gantry corner and quality placement refinement — 2 November 2026

The return corner previously moved X first when the outer U rail requires Z first. Both rail corners now have an eased first leg, a stationary corner-transfer interval and an eased second leg. The carrier and panel remain on the drawn rail. MES progress uses that same two-leg movement; the Twin already derives its dot position from the carrier. A regression test samples both corners every millisecond and rejects simultaneous X/Z motion, including verifying the corner dwell.

The quality booth moved from x=7 to x=10, aligned behind the dispatch truck in the factory layout. Booth structure, bench, jaws, roof, scanners, status indicator, label/selection position and event source move together. The transfer route approaches outside the booth and tank row; the trolley waits at the booth handover point and collects the released part before returning it to packing. The camera follows those transfers. The packing ground marker is thin enough to clear trolley wheels.

The amber material used for review/inspection indicators is now Voltron cobalt (#246bd4) with blue emission. Completed release retains the existing cyan indication.

Verification: production build, focused rail/clearance/graph tests and responsive browser checks. Exact pose evidence includes both gantry corners, the relocated booth, inspection and booth-to-packing transfer. Evidence directory: .audit-logs/rail-quality-20261102. Local preview only; no commit, push or public deployment.
Verified: 32 focused tests, production build, performance budgets and seven browser cases pass. Browser evidence covers both themes at phone/tablet/desktop widths plus eighteen focused poses, including the two rail corners, the relocated inspection booth and the revised booth-to-packing transfer. The part remains in frame at the tested poses. No page or shader errors were recorded.
