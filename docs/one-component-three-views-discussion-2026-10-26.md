# One component, three connected perspectives

Implementation update: this discussion is superseded by homepage-materials-and-three-views-2026-10-26.md, including the later transient-overlay and review-badge corrections.

Discussion and implementation direction requested on 26 October 2026. The three-view artwork is not replaced in this pass. The lot's separate five-card Human Review refinement is implemented.

## What is there now

The Factory Systems intro already constructs a real flange-housing mesh and samples it into particles. Its settled Execution, Context and Intelligence pictures are texture planes loaded from the robot, checklist and brain images. Replacing those planes with linked geometric scenes is the relevant change; the page's layout, shared camera and supplied part identity provide a useful starting point.

## Recommended master part

Use a machining-friendly, pocketed version of the current component: retain the distinctive bore and mounting identity, and give the flat stock a clearly visible shallow pocket with an internal radius and a defined base section. Author a near-complete starting mesh, the finished mesh, a small removable stock region, and feature anchors from the same model. The pocket is the shared selected feature across all three scenes. Once approved, reuse this master in the lot to keep page-wide part identity consistent.

“About 70% complete” describes appearance, not calculated manufacturing progress: bore, mounting features and general outline already exist, while one small pocket operation remains. Do not display a percentage. A normalized decorative housing cannot acquire accurate millimetre dimensions just by attaching labels; establish the master's illustrative scale and feature geometry together.

Hold the part in one consistent fixture orientation across the three views. Orient the pocket normal toward the cutter axis. For a vertical spindle, the pocket must face upward; the cutter then follows the pocket in its own plane. Keep that same part orientation for Context and for the small line situation in Intelligence.

## Execution

Show the partially finished part held in a small fixture, with only a spindle nose and end mill. Complete one short pocket-finishing pass. A prepared stock insert or controlled geometry reveal removes material only behind the cutter's contact area. The visible path and removed region must derive from the same feature coordinates. Use a few short-lived chips at contact, a cleaner reflected finish after cutting and a clear tool retraction. This is a controlled illustration, not a machining simulation or a confirmed Alpha capability.

## Context

Keep the same finished part, camera and pocket feature; remove the cutter. Attach one radius arc and one thickness dimension to actual feature anchors. Keep labels in HTML outside the glass silhouette. Put the feed and tool ID in a compact operation record rather than treating them as geometric dimensions.

An internally coherent example to validate against the authored model:

| Class | Illustrative record |
| --- | --- |
| Required geometry | Pocket corner R4 mm; base 8.00 ±0.05 mm |
| Recorded operation | T04, Ø6 mm end mill; feed 240 mm/min |
| Measured result | Base thickness 8.04 mm |

These are proposed demonstration values, not actual machine settings or inspection records. Only the radius, thickness and one operation strip should be prominent together. Use “Required”, “Recorded” and “Measured” explicitly so nominal dimensions are never mistaken for measured results.

## Intelligence

Use three instances of the same part on a short transfer fixture. Select the centre instance and show one small inspection point beside the relevant feature. Avoid another full miniature factory or an abstract brain/network replacement.

Connect the selected result to a compact history record: recent illustrative measurements 8.01, 8.03 and 8.04 mm against the required upper limit of 8.05 mm. The history is a separate record, not a claim that each neighbouring part already has a measured value.

Recommendation: “Thickness approaching its upper limit. Inspect the feature and tool/setup before continuing.” End with “Awaiting human review.” The evidence supports checking; it does not prove tool wear, predict a defect or authorize a feed adjustment. Do not animate an approval or a machine-setting change. A future interactive version can require a real user action.

## One synchronized explanation

These are three views of one example, rather than another literal part journey. The lot section separately owns physical travel. Reuse the master geometry, selected-feature colour, material family and orientation; send a brief light along the cube connections as the explanation advances. Avoid dissolving the part into unrelated icons between stages.

| Time | Focus |
| --- | --- |
| 0–1s | Three glass views establish; Execution is strongest. |
| 1–4s | One finishing pass and tool retraction. |
| 3.5–6.5s | Matching pocket highlight, radius, thickness and operation record. |
| 6–9.5s | Small line and inspection evidence become clear. |
| 9.5–12s | Recommendation appears and settles at Awaiting review. |

Desktop keeps all three views visible, with optional focus selection. Mobile shows one larger view with three accessible stage buttons. Reserve label/panel space to avoid layout shifts; keep the current modest typography. Reuse pause/replay and static/reduced-motion policy, with a legible final still and no continuous rendering after the sequence.

## Build order and acceptance

1. Lock the master part, selected feature and illustrative data record; inspect the finished still in both themes first.
2. Verify tool-axis alignment, toolpath and material removal together.
3. Add geometry-anchored dimension leaders and HTML annotations.
4. Add the miniature line, inspection link and pending recommendation.
5. Integrate the deterministic timeline, mobile selection and renderer-captured fallbacks.

Acceptance requires the same recognizable feature in every view; cutter/stock agreement; readable Required/Recorded/Measured distinctions; no automatic approval; stable label clearances; meaningful mobile selection; pause/seek/replay consistency; and a final still that explains the idea without motion.

## Lot evidence cards implemented now

Five ordered cards: Receive, Process, Verify, Human Review, Dispatch. Human Review is fourth, replaces the separate release strip and has a stronger static halo, increasing while review is active. Its checkmark still follows the existing illustrative release boundary. Physical transport remains four stations and holds at Verify for review. All five cards remain visible on mobile; starting/resuming playback brings the artwork back into view. Forced-colour and reduced-transparency states retain a visible review emphasis.
