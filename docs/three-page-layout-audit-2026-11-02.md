# Home, Technology and Intelligence layout audit

2 November 2026. Audit only; no application changes.

Inspected source, measured every section at 360×800, 390×844, 768×1024, 1024×768, 1440×900 and 1920×1080. Reduced-motion runs established stable layout; separate normal-motion runs at 390 and 1440 checked the active Home carousel and dark presentation. Full-page captures can omit offscreen scissored canvases; blank offscreen artwork in those captures is not evidence of renderer failure. Measurements include section padding. This is a layout/continuity audit, not a complete accessibility or performance certification.

## Findings

No positive page-width overflow or non-positioned content extending beyond the viewport was found at the six tested sizes. Main heading anchors, the shared hero scale and section spacing are mostly consistent. Phone controls measured at least 40px high; desktop factory labels include 36px targets. Hero text is 29px phone, 32px tablet, 36px desktop, with a 32px exception at narrow desktop. Main section headings are mostly 23px phone and 26px desktop; Philosophy intentionally uses a larger centered treatment.

The dominant problem is excessive vertical stacking, not horizontal breakage. On 390×844, Home's normal application carousel section is 983px, Technology operating platform 1633px, and Intelligence investigation 1850px. The user cannot see the main artwork, selected explanation and relevant controls together. Reduced motion expands Home application cards into a 1902px stack; that mode must retain readable content but can use accessible manual selection instead of displaying all cards together.

Home overrides the global stable scrollbar gutter and hides all descendant WebKit scrollbars. At 1440px, its section heading begins at x160, while Technology and Intelligence begin at x155. At 390px, Home body is 390px wide and the other two are 380px wide. Normalize scrollbar reservation across routes; do not hide scroll affordances indiscriminately.

All three phone heroes are approximately 886–902px tall before adding navigation, exceeding the 844px viewport. Desktop hero sections align at 764px. Preserve desktop alternation. On phones reduce duplicated vertical allowances and reserve deliberate artwork space, without shrinking headings or forcing clipping. Tablet portrait remains copy-first; landscape needs its own height-aware treatment rather than relying only on width breakpoints.

## Section inventory: normal motion, approximate heights

| Page / section | 1440×900 | 390×844 | Recommendation |
|---|---:|---:|---|
| Home hero |764|886|Retain desktop; compact phone spacing and principle strip.|
| Home applications |1033|983|Keep convex motion; fit selected card, selectors and explanation into a focused stage.|
| Home connected lot |923|872|Keep sequence; align station controls and selected record close to artwork.|
| Home Alpha |1008|729|Desktop intro and scene need a more efficient composition; phone broadly balanced.|
| Home roadmap |795|847|Keep globe and cube story; tighten phone year controls and selected milestone spacing.|
| Home Philosophy |849|788|Preserve centered ending; remove redundant spacing rather than changing its composition.|
| Technology hero |764|902|Use shared phone hero correction.|
| Technology operating platform |1626|1633|Highest Technology priority: digital layer, physical scene and controls must read as one workspace.|
| Technology product showcase |1121|1125|Keep one selected product; compact chrome, tabs and contextual text; normalize all five product states.|
| Technology modularity |1103|1401|Move core/process/factory explanation into one selected reading surface; preserve the cube animation.|
| Technology closing |292|432|Shared closing composition; natural phone button wrapping.|
| Intelligence hero |764|902|Use shared phone hero correction; retain projection and scans.|
| Intelligence evidence |914|1273|Phone currently stacks part, graph, sources and explanation; consolidate the graph/context and use source details on demand.|
| Intelligence specialists |1435|1188|Desktop grid plus large separate selected feature repeats space; use a compact adjacent selected detail. Preserve six identities.|
| Intelligence investigation |1332|1850|Highest Intelligence priority: selected cube, selectors and one concise state; details sheet, collapsed log and optional variation controls.|
| Intelligence point of work |1097|1445|Display one meaningful product state with compact evidence; human review should be directly associated with the resulting guidance.|
| Intelligence closing |292|432|Use same closing system as Technology.|

## Design continuity

The shared pearl/navy glass, cobalt/cyan signals, geometric language and continuous background already establish a recognizable family. The remaining inconsistency is component grammar: Home previews alternate opaque pearl/smoked reading surfaces, Technology uses product chrome and dense simulation controls, and Intelligence uses many softly rounded cards and small utility labels. Define three common surface roles: open artwork, glass reading card, and product window. Preserve purpose-specific diagrams inside that family.

The new Intelligence gallery appropriately has more material variation than the other pages, but its fluid/particle identity should appear in the Home V-AI preview too. Likewise align the visual vocabulary of Home V-MO with the Technology meaning graph, without making all preview screens equally detailed.

Use a consistent section intro width and line count. Long Technology and Intelligence headings occupy several phone lines before the main content begins. Tighten wording or wrap deliberately; do not reduce text indiscriminately. Utility/status text frequently runs 9–11px and should receive a readability pass at actual phone scale. Home's giant background cubes deserve localized attenuation behind active reading surfaces, preserving the approved background itself.

## Order of correction

1. Shared route framing: gutters, navigation offsets, hero phone height, tablet landscape, section anchors and common surface roles.
2. Home: selected application stage and reduced-motion alternative; compact Alpha/lot/roadmap composition.
3. Technology: combine digital and physical operating views into one bounded workspace, compact products, consolidate modularity details.
4. Intelligence: remove duplicate selected-detail stacks, compact investigation controls/log, consolidate evidence and point-of-work layouts.
5. Recheck every product selection, agent selection, modal, roadmap state and important animation position at all six sizes in both themes. Use live viewport captures for WebGL and reduced-motion captures for layout. Retain natural document scrolling and text enlargement.

Treat each major section as one clear visual chapter. Fit its primary artwork and controls together where feasible. Supporting material may extend or open on demand; forcing all text into a fixed viewport would create clipping and undersized typography.

Evidence: `.audit-logs/three-page-layout/metrics.json`, `live.json`, and associated captures.
