# Vera synthesis release verification

Status: implementation and evaluation in progress. Publication and completion are not yet established.

## Implemented behavior

- Task-sensitive methods for causal explanation, analogy limits, comparative reasoning and revision across turns.
- Adaptive low/medium internal reasoning. Complexity and requested answer length are separate decisions.
- Larger complete-response budgets for substantive answers and controlled rejection instead of silent character clipping.
- Bounded inquiry context reconstructed from the saved transcript, with exact visitor wording and attribution. Vera's prior contributions remain proposed explanations unless the visitor adopts them.
- Context recovery for returning scenarios; company readiness excluded from unrelated visitor projects and ordinary technical follow-ups.
- Unsupported alleged quotations cannot be preserved as softened paraphrases. Submission status remains unknown without an actual confirmation signal.
- Automatic routing takes contextual synthesis into account. Explicit Mini/Luna choices remain intact; GPT-5.4 remains an evaluation candidate.

## Model comparison

Three matched four-turn scenarios per model/effort configuration. These are direct graph timings with bundled evidence selection, not end-to-end visitor latency. Runs were not randomized or repeated enough to establish a general ranking. The sample used an earlier checkpoint before later semantic repairs.

| Configuration | Completed turns in comparison | Median | Maximum |
| --- | ---: | ---: | ---: |
| GPT-5.4 Mini low | 12 | 3.83 s | 13.90 s |
| GPT-5.4 Mini medium | 12 | 4.30 s | 6.46 s |
| GPT-5.4 low | 12 | 10.38 s | 15.14 s |
| GPT-5.4 medium, 32-second evaluation allowance | 12 | 18.58 s | 25.76 s |

GPT-5.4 medium first exceeded the production 24-second model deadline. That partial attempt is preserved separately. Its successful longer repeat does not prove compliance with the production deadline. GPT-5.4 sometimes gave more developed causal explanations, particularly distinguishing reconstructed context from declared requirements. Mini medium sometimes overcompressed a conditional recommendation into a build-order slogan. The prompt was refined to preserve the distinction between offline modeling and live integration across later recommendations. No result establishes that more effort always produces better answers.

Provider usage and reasoning effort are logged by the runtime. The comparison transcript files retain response timings but do not retain a full per-turn token ledger, so no measured monetary total is reported.

## Semantic failures and repairs

Review of initial Mini transcripts found company readiness leaking into a visitor delivery question; an unsupported autonomy quote surviving in a supposed paraphrase; scan-evidence follow-ups switching to company validation; and a claim that an enquiry was not submitted based only on missing chat confirmation. Retrieval scope and instructions were corrected. Fresh targeted conversations on Mini and Luna resolved these four observed failures. The full corrected matrix remains the broader acceptance gate.

The C03 literal requirement for the word “defect” in the edited inference was removed after reviewing both replies. The visitor asked to rewrite only the middle inference while avoiding “cause”; both replies preserved supplier uncertainty without that exact noun. The case still checks the requested format, prohibited wording and absence of unrelated scenario text, with semantic review of the inference. This is an evaluation correction, not a claim that a runtime failure was fixed.

## Verification so far

33 focused tests and type checking passed after retrieval repairs. The earlier production build completed successfully; a final build is required after the latest runtime edits.

The initial release matrix was superseded and intentionally stopped after its semantic issues were found. Its partial outputs remain under `release-synthesis`. A first confirmation attempt was stopped after unit tests exposed a mismatch between educational record status metadata and the proposed scope filter; the filter now uses actual topic/provenance fields. No database or corpus release was changed. The authoritative new run writes to `release-synthesis-final`.

Long-answer UI checks passed at 1440 and 390 widths in both themes, using an actual approximately 3,000-character comparison answer as a mocked API response. Complete text, horizontal bounds, editable suggestions, draft preservation, setting persistence and reload were checked. Screenshots are under `data/vectra-smoke/synthesis-layout`. All four desktop/mobile light/dark screenshots were visually inspected. Long text wraps within the panel, with the reply end, source disclosure, suggestions and composer accessible. Live backend behavior remains to be reviewed. The preview build predates later backend-only repairs; the panel itself was unchanged.

## Pending completion gates

Finish and review all 24 scenarios on both supported models, record case-level semantic judgments, resolve failures and retest affected cases. Verify final runtime build, inspect the remaining screenshots, deploy only the Vera change set, confirm the exact production revision, and repeat representative real hosted conversations and responsive checks. Goal completion remains unproven until those gates pass.


## Prepublication acceptance review

All 24 scenarios on both supported models have complete reviewed transcripts, totaling 48 conversations and 210 turns in the selected evidence set. The scorecard records a 0–5 holistic AI editorial assessment and a case-specific reason. A score of 4 means strong task fulfillment with minor style or completeness limitations; 5 means particularly strong fulfillment. These are editorial judgments, not human validation or a calibrated guarantee. Both models have 24/24 cases at 4 or above after targeted repairs; no unresolved material safety, quotation, visitor-attribution or enquiry-action error was found in this selected set.

The full initial final-matrix run completed 48 cases with 45 structural passes. Its three failures were Mini's ignored three-word constraint and the obsolete literal “defect” checkpoint for both models. The latter was corrected after semantic review. Fourteen affected full conversations then passed the updated constraints and intent gate; eight additional conversations confirmed scoped explanation and source-marker cleanup; two bakery conversations confirmed the distinction between no sensor feed and no automatic updates at all. The scorecard explicitly links each case to the latest applicable transcript, rather than claiming the first run passed unchanged.

Review also found and repaired an unsolicited enquiry form in a ticket summary, a repeated rather than opposite argument, misleading continuation of a coined definition, invented clarification controls and visible source transport markers. Server-side enquiry authorization now requires explicit contact intent or an active draft edit, in addition to the model flag. Unit regressions cover the gate and marker cleanup. All 35 focused unit tests pass. Secret scanning passes.

Minor limitations remain. Mini sometimes repeats the same contrast or adds an unnecessary analogy. Luna's first S03 reply omitted the digital thread, then explicitly recovered it in the following explanation and synthesis. Some company explanations still include cautious wording. The reviewed final S01 examples explain India's manufacturing possibility without a deployment-status ending. No perfect conversational behavior is claimed.

Long-answer screenshots at desktop/mobile widths in both themes were all visually inspected. Automated checks confirmed complete response text, no horizontal panel overflow, usable sources/suggestions, preserved drafts and persisted settings. Final publication and real hosted verification remain pending.
