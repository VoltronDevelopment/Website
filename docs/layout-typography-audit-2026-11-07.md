# Voltron Lattice layout and typography audit
7 November 2026 · Local Chrome preview

## Scope and evidence

Reviewed Home, Technology, Manufacturing, Intelligence, Network, About, Commons, Partner, Asset licences, and the open entry screen at viewport widths of 320, 390, 820, and 1440 px in light and dark themes. This produced 80 page and viewport measurements. Also opened the locked countdown and founder sign-in at 320 px, expanded both levels of mobile navigation, and exercised the empty production inquiry form. Legacy ontology, culture and Commons URLs redirect to existing content. No inquiry was sent.

The survey measured rendered text, control dimensions, heading hierarchy, section height, and document overflow. The visual review sampled interior sections in desktop light and phone dark, with reduced motion enabled. Dimensions below are CSS pixels. A text container width describes the available measure. It does not imply that every line uses its full width.

[Desktop interiors](../.visual-check/layout-audit/interiors-1440.jpg) · [Phone interiors](../.visual-check/layout-audit/interiors-390.jpg) · [Narrow form with validation](../.visual-check/layout-audit/form-errors.jpg) · [Raw page measurements](../.visual-check/layout-audit/measurements.json)

## Priority findings

| Priority | Finding and consequence | Change and acceptance check |
|---|---|---|
| High | Home roadmap choices and Network chapter buttons use 10 px text on phones. Manufacturing playback and Technology order stages use 11 px. Network controls are 44 px high and Home year choices are 52 px high, so the visible label is the limiting factor. | Start active labels at 13–14 px. Allow two lines or fewer columns. Verify every option at 320 and 390 px, including the selected state and the longest chapter title. |
| High | At 320 px the Partner form gives a text field only 202 px. The validation summary uses the same width, and its three field links occupy two rows. Repeated page and card padding consumes over a third of the screen. | Keep the outer site frame and reduce the form card’s horizontal padding on narrow phones. Aim for at least 240 px of field width. Preserve 16 px input text, visible focus, and field-specific error links. |
| Medium | At 1440 px, main section headings are 26 px across much of Home, Technology, Intelligence, and Commons. Equivalent headings reach 42 px on Manufacturing, Network, and About. The latter pages feel like a new chapter much more often. The difference largely disappears on phones, where many section headings are 23.4 px. | Define one default chapter heading, starting around 32–36 px on desktop. Assign deliberate variants to major editorial statements and subordinate study headings. Compare the first two chapters on each route, rather than resizing every h2 indiscriminately. |
| Medium | In the Network shared-architecture chapter, the first reduced-motion illustration shows a small central cube surrounded by a broad empty area. On mobile the chapter occupies 1,116 px. In the sampled view the controls and explanation are separated from the visible subject by much of the artwork stage. | Crop or reframe this particular still, or shorten its stage. Keep the full completed network overview available. Verify first and last chapter states at phone and desktop sizes. |
| Medium | Intelligence presents essential instructions and state labels at 10–11 px. Its investigation section alone occupies 1,277 px at 390 px width. Readers encounter controls, agent identities, a diagram, and a detail panel while following one decision. | Keep the current question and its primary action together above the diagram. Give the selected agent and next step normal reading size. Collapse repeated incidental status text where its information is already available in the selected detail. |
| Medium | The mobile heading and paragraph can be separated by an entire study. The shared mobile CSS flattens the intro and moves its paragraph after the artwork in selected sections. This works for captions, but hides the reading instruction when the paragraph explains what to look for. | Keep a short instruction with the heading on task-led diagrams. Put observations about the result below the study. Check Technology’s operating platform and Intelligence’s investigation first. |
| Lower | At 820 px the inner heroes stack. Network consumes 745 px, Partner 656 px, and Commons 622 px, even though all three titles fit in one line at this width. Network’s title occupies three lines at 390 and 1440 px. | Review the title-to-art gap and artwork bounds independently at tablet width. Shorten Network’s title only if the intended meaning of a developing network survives. |
| Lower | Partner’s location heading is 38 px on desktop, above its 26 px inquiry heading. On mobile the inner Production programs title is 25 px, above the 23.4 px section title that introduces the form. | Give the inquiry the strongest heading below the hero. Make program type and location subordinate through size and semantic heading level. |

## Page-by-page review

| Page | What to retain | What to improve |
|---|---|---|
| Home | The centered brand title and three words work as one unit. At 390 px the main chapter text is readable at 16 px. | Distinguish the adjacent applications and lot-story headings. “Five applications, one factory” and “Follow one production lot” convey separate jobs. Increase the roadmap year labels first. |
| Technology | The 44–48 px product and stage controls leave room for larger labels. | The operating platform occupies 1,339 px on mobile. Separate the short instruction from record detail, and group the active stage with its result. |
| Manufacturing | The opening title fits on one line at 390 px. Navigation among Load, Process and Unload is straightforward. | The Alpha exploration occupies 1,357 px on mobile. Prioritize its phase names and reading instructions over small simulation notes. On desktop a study-level “One lot / Carrier 03” appears as an 18 px h2 among 42 px chapter headings. Use a subordinate heading level for that study. |
| Intelligence | The hero leads cleanly into the investigation. The strongest recurring explanation links evidence to human review. | Raise active labels, remove duplicated status language from the first reading path, and move the selected agent’s explanation nearer its control. |
| Network | Numbered chapters communicate progress, and the hero text fits all tested widths. | The shared-architecture still needs a closer crop. Rework the six-choice rows around readable labels. The dark interior screenshot makes the subject-to-stage imbalance especially clear. |
| About | The three leadership subjects are distinct on desktop. Role, status, and person remain visible text. | The leadership section is 1,950 px tall at 390 px width, over two phone screens. Trim repeated vertical gaps around each portrait before reducing artwork detail. Retain the status and role beside each subject. |
| Commons | The access, apprenticeship and fellowship descriptions reflow from columns to a clear mobile list. No sampled text in the monitored element set fell below 12 px on the 390 px light layout. | Use the common desktop chapter scale. Keep naturally flowing text sections as the reference when tuning denser pages. |
| Partner | Input text is 16 px and the sampled text fields are 48–49 px high. Errors appear beside fields and the summary links to each issue. | Recover field width, then adjust the relative prominence of form, location and secondary headings. |
| Asset licences | The 16 px text and 28 px line height suit reference reading. Underlines make links recognizable. | The desktop text column is 763 px wide. If more attributions are added, group by asset type before adding decorative elements. No immediate reflow fix surfaced. |
| Entry and countdown | At 320 px the locked wordmark wraps within 256 px, the countdown is 20 px, and its four visible top controls are each 44 px square. Founder sign-in fields fit the viewport. | The open-entry link uses 11 px text at 390 px. Give this primary action more visual weight and test it alongside the corner controls at short landscape heights. |

## Shared components and themes

- All eight main heroes have one visible h1. The measured main title size is 57.6 px at 1440, 40 px at 820, and 35.1 px at 390. The three-word line consistently sits beneath it. Keep this treatment.
- No surveyed page had document-level horizontal overflow. Home and Technology expose neighboring cards outside the current card viewport, so offscreen card coordinates alone do not demonstrate clipping of the document.
- The expanded mobile menu and About submenu fit the 320 × 700 test. The combined panel was 290 px wide and 459 px tall. Main links were 48 px high and submenu links were 44 px high. The footer uses a two-column mobile link grid with 13 px links and 44 px minimum height.
- Both themes preserve the primary reading hierarchy. As a spot check, Asset licences body text against a nearby sampled background measured approximately 6.6:1 in desktop light and 11.7:1 in phone dark. These approximate local samples do not establish contrast across translucent cards, artwork, dynamic scenes, or all states.
- The wide-screen heading difference is visible in the page-specific styles for About, Manufacturing, and Network, alongside the shared frame rules. Consolidate the chapter style where it is declared, then remove superseded page overrides. Increasing selector specificity again would make later refinements harder.

## Implementation order

1. Adjust shared control-label sizes and narrow Partner form spacing. Recheck the longest labels, errors, and the 320 px layout.
2. Normalize editorial chapter headings and distinguish instructions from post-scene captions. Check desktop and tablet together.
3. Reframe the Network still and tighten the longest About and Intelligence chapters. Compare static and animated states before signing off on scene changes.

The audit used local Chromium with static artwork for reproducible comparisons. It did not establish physical-device behavior, text-only zoom behavior, screen-reader usability, contrast for every composited frame, or the layout of every optional simulation state. The form check covered client-side validation without submitting data.
