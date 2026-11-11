# Vera introduction release review

11 November 2026

Implemented the separate introduction and chat views with return navigation, preserved drafts/pending replies, dedicated cube settings, stronger Vera colours, matching theme posters and refined typography. Header space is reserved to prevent artwork movement between views. The intro uses a short coordinated entrance and respects reduced motion. Question artwork and the background watermark retain independent decorative treatments.

Verification completed before release:

- Production compilation and type checking passed. The initial local build encountered a filesystem permission error; the final production build succeeded with normal generated output.
- 21 focused API, model-routing and retrieval tests passed, including greeting intent separation and continuation beyond the former reply cap.
- 57 conversation turns per model completed using the refined personality and bundled evidence graph. The mini sample met the selected literal inclusion/enquiry checkpoints. Luna omitted the literal word defect in one edited inference while preserving meaning. This remains an editorial fixture miss, not a hidden full-pass claim.
- Both models retained project code, quantity, material and finish after a 60-turn synthetic conversation. This does not certify arbitrary unbounded context.
- Browser checks at 320, 390, 768 and 1440 widths in both themes passed settings interaction, return navigation, draft preservation, enquiry revision and reduced motion. The rendered cube occupies [21,22,234,233] inside its 256px surface.
- Pending replies survived navigation to the intro and back with one request. Reopening preserved the reply. Expanded desktop, reduced mobile height and 844x390 short landscape settings bounds passed.
- Typography was refined after the broad checks. Narrow-phone screenshots were reviewed; the preview hot-reloaded during one follow-up capture, requiring a repeat of the affected size.
- No real enquiry was submitted. Synthetic tests used mock enquiry payloads or direct model evaluation. Daily/conversation caps remain disabled.

Final live publication and response checks are recorded in the local release evidence after deployment. Screenshots and synthetic transcripts are under data/vectra-smoke.
