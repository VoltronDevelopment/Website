# Manufacturing story refinement — 2 November 2026

Local implementation only. Publication remains cancelled.

## Page story

The approved mounting-bracket hero and thirteen-tank square-U renderer remain. Manufacturing now follows the shared Home, Technology and Intelligence chapter proportions, heading measures, compact responsive hero and continuous atmosphere. The plant remains the principal artwork; short reading panels use pearl/smoked foreground glass and soft shadows.

The page sequence is: component hero → lot journey → connected evidence → exception investigation → validation disciplines → surface scope → production inquiry.

## Interactions

- The existing deterministic plant clock owns the new evidence chain. Lot, operation, history and quality-record states derive directly from the displayed plant state, including backward seeks. Quality remains pending; connected evidence never implies authorised release.
- Evidence records open through the shared native dialog. No playback update opens a dialog automatically.
- Desktop retains a concise side inspector; tablet places it below the stage. Phone has an explicit “Inspect lot & records” action. Selecting scene geometry on phone also opens inspection as a direct user action.
- Recipe, dwell and measurement context sit inside Inspect records. Camera/full-route controls sit inside View options. Existing inspector lenses, station selection, playback and camera controls remain functional.
- The existing six-stage deviation has a selectable strip beneath the plant, with the current proposed response visible. The underlying paused equipment pose, human decision and open quality disposition are preserved.
- Four validation choices reveal aligned three-step diagrams. They describe disciplines under development, without fabricated performance results.
- Three process choices share a lightweight mounting-bracket surface study. Its contour resolves once per selection; thickness is conceptual and explicitly not to scale. Powder coating remains separate from the demonstrated tank route.

## Rendering and accessibility

No dependencies or models were added. Existing near-viewport preparation, offscreen/hidden suspension, static fallbacks, reduced motion, data-saving policy and adaptive rendering remain. Supporting diagrams use HTML/SVG without another WebGL context. Native selections remain useful in static mode.

The shared dialog focus trap now includes summaries, form fields and valid tab stops, so the phone inspector's expandable records remain keyboard reachable. Automatic scene updates do not move focus.

## Verification

- 37 existing process, tour, framing and route tests pass.
- Ten browser cases at widths 360, 390, 768, 1024 and 1440 in both themes pass: no horizontal overflow, inspector dialogs/tabs, keyboard access to records, chapter selection, evidence inspection, validation and treatment selections.
- Additional 844×390 landscape and 1920×1080 desktop layout-fit checks pass.
- Two live-renderer cases at 390 and 1440 pass scene loading, exception selection and decision seeking without page errors or overflow.
- Isolated production build uses `.next-manufacturing-story-20261102`.
- Browser captures and scripts are in `.audit-logs/manufacturing-refinement` and `.audit-logs/check-manufacturing-*.cjs`.

No production inquiry, plant command or external publication was submitted.
