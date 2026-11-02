# Reworked-page responsive review — 2 November 2026

Read-only UI audit of Home, Technology, Intelligence, Manufacturing, Network and About. No production or design changes made.

60 rendered cases: six routes, five widths (360, 390, 820, 1024, 1440), two themes. Phone height 844, tablet width-820 height 1180, other views height 900. Reduced motion used for repeatable full-page captures; this review does not newly certify every live animation frame, physical device GPU performance, landscape phone or 200% zoom.

All cases have one primary heading, no page-level horizontal overflow and no page-script errors. Main content gutters and computed headline sizes are aligned: at width390 headlines are29px in320px columns, at820 headlines32px in640px columns, at1440 headlines36px in471px desktop columns. Visible main buttons on phones have at least40px height in this measurement.

## Findings

1. Technology mobile controls extend beyond the viewport despite no page scrollbar: at360 Production lot reaches365 and Quality & release reaches376; at390 Quality & release reaches401. Contained scrolling/clipping needs closer treatment. Prefer a fully fitting wrapped/grid chapter selector, with a visible selected item.
2. About hero height901px at390 versus630–690px for the other supporting main pages (Home676). Longer text partly explains it, but artwork controls and stage spacing add substantial extra height. About is omitted from the shared layout-polish selectors and maintains independent layout rules. Align the spacing policy while preserving enough room for the stairs.
3. Fallback artwork backgrounds show visible rectangular patches in Network factory scenes and About stairs/workspaces. Images include page atmosphere that does not remain aligned with the real page background. Capture transparent artwork with native contact shadows, or use one deliberate scene surface consistently.
4. Intelligence head appears smaller than the neighbouring hero subjects on phones/tablets. Enlarge the head within its stage while preserving the projector and beam; compare apparent subject bounds rather than only canvas size.
5. Network globe caption is cramped near the lower globe silhouette on phone. Reserve a separate caption baseline or relocate qualification text below the stage.
6. Manufacturing desktop simulation has five32px-high controls (Load/Process/Unload and Previous/Next), while other inspected controls are generally44px or greater. Increase hit areas for touch laptops/tablets while retaining compact visual icons.
7. Section cadence remains route-specific: About section padding80/52px, Network general88/56px and factory64/44px. Differences may be intentional but should derive from major-story versus supporting-detail roles rather than route names.
8. Compact factory labels and stage buttons reach10–11px. Layout fits, but secondary labels should remain identifiers; essential detail belongs in readable adjacent text or accessible selected panels.

## Recommended order

Fix Technology chapter fit and control hit areas first. Align About hero pacing and common stage/caption spacing second. Rebuild fallback transparency and tune apparent subject scale third. Then compare full-page typography, shadows, border strength, and section cadence using the existing distinct artwork compositions.

Evidence: .audit-logs/site-fit-review/results.json and full-page light captures at390/820/1440; phone/tablet opening comparison sheets. Dark themes are included in measurements. Existing live-scene verification remains in previous page records.
