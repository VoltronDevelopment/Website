# Connected lot: single carrier motion

## Five-card refinement

The evidence row now reads Receive → Process → Verify → Human Review → Dispatch. Human Review is the fourth card, with a stronger localized cyan/blue halo and an increased active glow. Selecting it pauses at 9s, shows review in progress and leaves Dispatch pending. The separate release strip has been consolidated into this card. The physical route remains four stations, with review held at Verify. All five cards stay visible on mobile; resume/replay scrolls the artwork back into view so offscreen suspension does not prevent playback.

Verified against the production build in twelve motion/static cases at 1440, 768 and 390px across both themes. Checks cover all five cards and their order, the review hold, release boundary, replay/pause, resize and reduced-motion pictures. Scoped axe WCAG A/AA checks pass in all six animated review views, with no browser errors or missing assets. Review screenshots and results are in `.audit-logs/connected-lot-moving/production/`.

Implemented on 26 October 2026 following the user's request for one travelling box, particle arrival/departure, stronger scanning and mobile conveyor movement.

The renderer owns one glass enclosure, the existing component and its locating plate. Four fixed HTML stage anchors and connected evidence records remain. The box travels along the existing diagonal conveyor on desktop. On mobile the anchors coincide, the same box stays centred, and belt treads move beneath it during travel; rollers rotate while the supporting rails stay fixed. The process tool appears only while actually working on the carrier.

| Time | Physical action |
| --- | --- |
| 0–1.3s | A compact particle cloud forms the actual enclosure and component surfaces at Receive. |
| 1.65–2.4s | The single carrier travels to Process. |
| 2.4–4.65s | The tool operates while the carrier is held. |
| 4.65–5.4s | Carrier travels to Verify. |
| 5.4–7.9s | A brighter scan plane and rectangular core/halo sweep through the component. |
| 8–10.5s | Carrier and belt hold at Verify for illustrative human review. |
| 10.5–11.25s | Travel to Dispatch begins after release. |
| 12.4s | All five evidence records are available; stage navigation selects this useful released pose. |
| 12.65–13.9s | The box and part dissolve into short outgoing particles. |
| 14s | Carrier has left; connected evidence remains. The render loop stops. |

Surface and particle shaders share one local reveal field, sampled from the existing enclosure and component geometry. Material copies keep conveyor glass separate from carrier formation. No physics engine or GPU-computation library is added. Seeded attributes and absolute timeline evaluation keep seeking, replay, resize and theme changes deterministic. Shader/material changes preserve the component geometry.

Static and reduced-motion visitors see a representative released Dispatch pose from 12.4s, with completed evidence, instead of an empty conveyor after departure. Four stage pictures per theme/layout support useful stage selection even when WebGL fails. Normal animation really completes the outgoing dissolve. No-JavaScript retains the initial Receive picture and accessible evidence content.

Verification evidence is under `.audit-logs/connected-lot-moving/`. The authoring review captures twelve keyframes in both themes at desktop/mobile widths and checks one carrier, monotonic travel, release gating, stationary review, particle completion, stronger scan output, fixed mobile carrier placement and finite playback. Renderer/controller tests additionally cover pause, hidden/offscreen suspension, reduced motion and preparation/context-loss disposal.

Completed validation: 215 regression tests pass across 38 files, with 16 focused lot tests confirming the current controller/timeline behaviour. The production build and TypeScript checks pass. The renderer review passes all 48 keyframes without shader or browser errors. The real-page production review passes eight motion/static theme/layout cases, including all stage buttons, replay/pause, resize without clock reset, completed outgoing particles and reduced-motion stage pictures. All twenty opening/stage images were regenerated; the largest is 125,046 bytes. Production screenshots and results are in `.audit-logs/connected-lot-moving/production/`. No deployment was performed; software WebGL tests do not replace hardware GPU profiling.
