# Intelligence and Manufacturing session audit

7 November 2026. Review of local production build `am2btggDv07WwTUl1NWvl`.

## Change boundary

The preceding Home and Technology production build finished at 18:01 IST. The Intelligence and Manufacturing build finished at 18:10. Seven application files have modification times between the two builds. Git has no commit between those builds, so timestamps and the handoff establish the likely session boundary. The cumulative working tree at audit start differed from commit `1b0fcd4` by 228 tracked files with content changes and 75 untracked files. Those totals span several passes.

| Files in the final edit window | Current behavior |
|---|---|
| `components/intelligence/AgentOrbs.tsx` | Queues the gallery, waits for scrolling to settle and keeps the still artwork until the renderer reports preparation complete. |
| `components/intelligence/InvestigationSimulation.tsx` | Runs the clock with at least 20% of the scenario visible, holds it during scrolling, and treats the specialist sheet as a temporary hold independent of manual pause. Also delays preparing the investigation artwork. |
| `components/intelligence/IntelligenceStory.tsx` | Holds the evidence presentation while the source sheet is open. Evidence, specialist and review selections also use the entry-specific selection mechanism from the wider work. |
| `app/intelligence/intelligence.css` | Tightens four content sections and locks document scrolling for an open Intelligence sheet. |
| `components/manufacturing/AlphaLineExperience.tsx` | Combines temporary inspector hold with the visitor's play/pause choice. Waits for scrolling to settle and rechecks the canvas location before mounting it. Station selection deliberately holds the line. |
| `components/manufacturing/alpha-line-renderer.ts` | Tracks visibility of the artwork itself at a 15% threshold, suspends advancement during page scrolling, and attaches wheel zoom when the visitor enters camera exploration. |
| `app/manufacturing/alpha.css` | Reduces outer padding for the journey, production disciplines and process scope. The current stylesheet also accommodates a compact inspector on shorter and narrower screens. |

Earlier adjacent edits include the Home gallery's scroll and selection handling, the roadmap, Technology's product-screen clock, factory and Modularity preparation, return-navigation selections and production inquiry links. The larger working tree also contains the previously developed About, Commons, Network, Partner, leadership and rendering-asset work. File history does not isolate every changed line within a file to the last editing session.

## Findings in priority order

1. **Manufacturing replay can leave the journey stationary.** Select **Watch full route**, then **Replay simulation**. The header stays at Plant overview, the timeline stays at zero and the transport offers Pause the lot. The replay handler seeks the current mode to zero, including the stationary overview mode. After selecting T06 in the guided tour, replay starts the lot at Loading but retains the T06 inspection and detached camera selection. Route both replay paths through a deliberate restart that clears inspection and restores guided framing. Preserve the chosen route length and give deviation playback its own restart case. Test overview, mid-journey, station inspection and deviation.
2. **The Intelligence investigation hides the still artwork too early.** In a 390 px motion-on run, the visible specialist stills became hidden about 1,168 ms before the first visible orb registered a draw. This is a local software-rendered sample. The gallery already awaits the prepared renderer. Apply that readiness rule to the investigation, revealing the canvas after a useful draw and retaining the still if rendering fails.
3. **Reduced-motion Intelligence offers an ineffective Play button.** At 320, 768 and 844 px, pressing Play left the label at Play and the clock at 0.00. The clock immediately reapplies the static preference. Keep the manual Step and Advance to outcome actions prominent and omit the unavailable playback action, or implement an explicit motion opt-in with clear behavior.
4. **The source sheet has an intermittent scroll-position discrepancy.** The full mobile gesture-to-dialog run measured a −125 px change with the first source sheet open. In two stationary follow-ups the document stayed at exactly 1,090 px, including after wheel input. Focus returned correctly. The timing does not establish that the wheel caused the first movement. Record scroll and focus events during an immediate open after a touch gesture. Make the regression check assert drift as well as focus restoration.
5. **The longest sections still need a lot of scrolling.** At 390 × 844 the journey spans 2.11 viewport heights and Point of work spans 1.71. The measured section padding is already 32 px per end. Preserve equipment and label size. Keep the selected operation beside the relevant evidence and consolidate secondary explanation before reducing padding again.

## Measured section heights

Motion enabled, Chrome, CSS pixels. Every row had zero positive horizontal page overflow.

| Intelligence | 1440 × 900 | 390 × 844 |
|---|---:|---:|
| Hero | 778 | 683 |
| Observation and evidence | 825 | 986 |
| Specialist agents | 885 | 1,050 |
| Working together | 1,056 | 1,368 |
| Point of work | 1,019 | 1,444 |
| Closing invitation | 292 | 463 |

| Manufacturing | 1440 × 900 | 390 × 844 |
|---|---:|---:|
| Hero | 778 | 707 |
| 13-tank journey | 1,665 | 1,783 |
| Production disciplines | 711 | 841 |
| Process scope | 723 | 802 |
| Production inquiry | 292 | 457 |

## Verification

- Both desktop and mobile passed T06 record inspection and Home/End tab selection. The mobile lot inspector held a running journey and resumed it after Escape. A deliberately selected station stayed paused. The Intelligence investigation resumed after its sheet closed and preserved manual pause. Mobile keyboard focus returned to the triggers.
- Supplementary reduced-motion checks covered 768 × 1024 dark, 844 × 390 light and 320 × 740 dark. The main-content accessibility scan reported zero violations in those six route/viewport cases. No specialist button rectangles overlapped and no lot dialog had internal horizontal overflow. This is limited automated coverage.
- The four fresh scroll samples measured 17 ms at the 95th percentile. They used Chrome with software graphics and synthetic scrolling. They cannot rule out the earlier reported 91 ms long task or establish real-device frame pacing.
- Type checking, refined-artwork delivery checks and all 380 tests in 89 files passed. The audit exercised the existing local production build. Physical Safari and Android, mobile browser toolbar resizing, assistive-technology reading order and field performance remain unverified.

## Follow-up implementation and verification

All five findings above received a local implementation pass on 7 November. Replay now restores the guided camera, clears the station selection and restarts the selected tour, full route or deviation. The investigation and gallery retain each visible specialist's still until its renderer draws that specialist. Static mode presents Step, Advance to outcome and Reset. The Intelligence sheets cancel outstanding page scroll on entry and restore the opening focus and position on dismissal.

The lot inspector now owns the four linked evidence records. The V-AI screen shows guidance for the selected view and reveals record choices in Evidence. The production build and 380 tests passed. One motion test timed out during a concurrent build and passed in the full rerun with three test workers.

| Section | 390 × 844 before → after | 1440 × 900 before → after |
|---|---:|---:|
| Manufacturing journey | 1,783 → 1,254 px | 1,665 → 1,231 px |
| Intelligence point of work | 1,444 → 1,093 px | 1,019 → 918 px |

Motion-on Chrome checks at 390, 768 and 1440 px covered station and full-route replay, deviation, record access, first drawing, view selection and changes to motion preference. The original mobile gesture sequence and the additional swipe-to-inspect check held the background in place and restored focus. The original desktop and mobile pause, resume and keyboard checks passed. Additional reduced-motion checks at 320 × 740, 768 × 1024 and 844 × 390 found no positive horizontal overflow or automated main-content accessibility violations.
