# Connected operating platform — 1 November 2026

Technology now leads with a single Three.js operating story between its hero and individual product presentations. The separate integration diagram was absorbed into this story. The detailed ontology page remains linked from manufacturing record details.

The scene is a locally authored conceptual factory using the existing Alpha station coordinates and thirteen-tank square-U arrangement. It includes receiving, material allocation, an overhead carrier and panel, condition review, inspection, packing and a departing vehicle. Studio reflections and pearl/navy/glass materials use existing artwork helpers. This is a compact representation, not a copy of the detailed Manufacturing renderer or a validated plant layout.

One deterministic 52-second state model drives all objects, product activity, chapter captions, hold status and quality release. The carrier reaches T06 at 26 seconds and remains there until the recorded review at 34 seconds. Processing resumes; inspection follows, release occurs at 42 seconds, packing begins at 44 seconds and dispatch completes at 50 seconds. AI investigation never grants quality release. Scene time is compressed and illustrative.

Seven identifiable records can be selected through projected labels, scene picking or the accessible record selector. Selection pauses playback, highlights its direct relationships and opens a desktop inspector or native phone dialog. Related record buttons navigate the same entity registry. Closing details restores prior playback and focus. Six chapters support direct navigation; overview and operation framing use the same camera. Phone shows the active label to prevent crowding.

The renderer loads near the viewport, prepares shaders asynchronously, limits pixel ratio and pauses rendering offscreen or when the document is hidden. Paused/completed scenes render only a short camera-settling interval. Reduced motion exposes a finished overview and allows still chapter exploration. A readable record/chapter fallback remains if WebGL fails. No external models or new libraries were introduced.

Verification: four state-model tests cover the stationary review hold, release-before-dispatch constraints, simultaneous product roles and relationship validity. Ten existing product/modularity tests also pass. Production build and browser checks are recorded in .audit-logs/operating-platform-20261101. The browser matrix covers 390/820/1440 widths, light/dark, all six chapters, record details, mobile Escape/focus restoration, live dispatch completion and offscreen suspension.

Local inspection only. No commit, push or public deployment is included.
