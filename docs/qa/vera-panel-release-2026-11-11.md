# Vera panel and model release review

2026-11-11

Production build and 19 focused automated tests passed. UI checks covered 320, 390, 768 and 1440 widths in both themes, reduced motion, cube pixel margins, model and motion controls, enquiry draft revision, source disclosure and chat-limit recovery. No horizontal panel overflow was detected. Cube alpha bounds remained [13,13,146,145] on its 160px source surface.

Both models passed the eight-turn combined personality/context smoke test using the full deployed instructions. The expanded evaluation ran 57 turns per model through the conversation graph with bundled approved evidence selection. It did not exercise hosted vector retrieval, production persistence or site-wide network timing. Existing guest limits were not reset.

- mini: 57 turns completed. Median 2153ms, sampled p95 3132ms. These are direct graph timings, not visitor end-to-end response times.
- luna: 57 turns completed. Median 2593ms, sampled p95 4601ms. These are direct graph timings, not visitor end-to-end response times.

Editorial review found no material error in the sampled safety handoff, false quotation, roadmap readiness, enquiry correction or retained project details. Both models omitted the exact word defect in C03 turn 4, preserving the requested inference and its meaning; this literal fixture checkpoint remains a recorded miss. Mini sometimes described source boundaries as approved evidence and repeated blank enquiry headings. These are minor style limitations, not grounds for claiming exhaustive conversational correctness.

Auto initially chooses Luna for everyday turns and mini for synthesis, long prompts and longer threads. This is a conservative explicit policy, not proven comparative superiority. Manual choice persists locally. One transient provider fallback is bounded by the original deadline and disclosed in the reply. Full semantic review remains distinct from the automated English/script and completion assertions.

Local preview artifacts: data/vectra-smoke/previews/release. Synthetic matrix results: data/vectra-smoke/matrix-mini.json and matrix-luna.json. Live publication status will be added after deployment.
