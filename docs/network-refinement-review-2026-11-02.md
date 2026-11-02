# Network simulation refinement review

Local review of the complete Network page, 2 November 2026. Publication remains cancelled.

## Implemented refinements

- Rendering: both body renderers now permit device pixel ratio 2. Their quality monitor allows the intended 30fps cadence rather than interpreting every intentionally limited frame as slow. Sustained genuinely slow frames still lower resolution. Other site renderers retain their existing thresholds.
- Owned operation: receiving doors finish opening before component pickup and close before truck departure. Inspection uses a continuous up/down booth sweep with eased limits and a finite illumination envelope. The former modulo reset could visibly jump within inspection.
- Plant construction: utility-to-machine paths now include separate horizontal and vertical segments. Animated signals follow those same routes, removing diagonal last-leg shortcuts. Existing equipment-before-roof and roof-before-completion ordering is preserved.
- Shared architecture: reviewed the five separated factories, elevated exact hero mesh, equatorial attachments, ground corridors and visible-only pulse. Retained the approved latest spacing and topology. Simplified the implementation-oriented legend.
- Engineering: collar withdraws axially before the upright lifts; base, upright, collar and bolts seat in that order. Construction guides disappear when the hardware is seated. Phone framing includes the whole glass bench.
- All sixteen native desktop/phone and light/dark fallback images regenerated from the updated renderers.

## Review and checks

Seventeen tests across six suites cover component support and continuity, receiving-door ordering, bounded inspection motion, assembly ordering, engineering bores, exact mesh topology, projected factory gaps and intentional-30fps quality retention/adaptation. Type checking passes. Ten responsive/theme cases cover widths 360, 390, 768, 1024 and 1440; eight live cases cover all four scenes on phone and desktop, stage seeking, paused poses, errors and overflow. Desktop and phone scene captures were inspected, including updated complete phone bench framing. Shared mesh pulse lifecycle checked separately.

The page remains an authored illustrative simulation: physical routes and assembly clearances are deliberately choreographed, rather than computed by a rigid-body solver or presented as validated manufacturing parameters. Native stills remain the reduced-motion/data-saving/error fallback. Hero globe design is retained.

Production build `.next-network-refinement-20261102` passes; Network initial route JavaScript remains 126 KB. Build-generated configuration references restored after verification. Nothing published.
