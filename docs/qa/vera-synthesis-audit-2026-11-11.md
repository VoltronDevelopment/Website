# Vera conversational synthesis audit

11 November 2026. Audit and proposed implementation plan only. No runtime, knowledge, UI or deployment changes made in this pass.

## Evidence reviewed

- Vera's deployed graph, prompt, personality, retrieval, routing, conversation types and API.
- Vera's industrial-learning and voice tests, long-context test and prior coherence evaluation protocol.
- Flute & Forge's `content/lila/behavioural-specification.md`, `workflows.md`, architecture map and actual runtime, skill, inquiry and workflow middleware implementations.
- Lila's 60-configuration scoring protocol and performance report, including recorded weaknesses.
- A new six-turn conversation against the public Vera API, with automatic model selection and suggestions enabled. Turn one used General; the remaining turns used Conceptual.

The local search found Lila's implemented architecture and canonical specification. It did not locate a standalone installed skill named Lila Architect. The available downloaded `lila-drishti` skill is a philosophical inquiry lens, distinct from Lila's website conversation runtime. Historical architecture documents contain superseded details; current code is the primary evidence for implementation findings.

## Fresh live observations

All six requests returned HTTP 200, using `gpt-6-luna`. Measured request wall times were 7.674, 6.902, 5.272, 7.261, 5.539 and 8.148 seconds, with a median of 7.08 seconds. This is a small sequential sample. These are complete HTTP response times, not time to first token, and do not isolate database, retrieval or model time.

| Turn | Visitor task | Observed behavior |
| --- | --- | --- |
| 1 | Explore why Voltron connects manufacturing, intelligence and human capability beyond a product list | Useful short overview, followed by “not a claim that the full system or outcome is already proven.” The visitor had not asked about readiness. |
| 2 | Use an orchestra analogy for SCADA, MES, ontology and twin, then explore their combined potential | Explained mappings and one combined benefit. Added a broad closing qualification about integration, current data and autonomous decisions. Some analogy mappings were loose rather than mechanistically developed. |
| 3 | Challenge the fixed-score analogy using factory improvisation | Recognized the distinction between shared context and identical execution. Reused the coating-line example rather than developing the musical analogy further. |
| 4 | Refine the idea to shared understanding without uniform methods | Preserved the correction. Mostly restated the preceding insight, with limited new consequence or counterexample. |
| 5 | Ask what Alpha is and whether production can be booked today | Readiness qualification was appropriate to this direct question. No enquiry form was incorrectly opened. |
| 6 | Return to coherence and improvisation, synthesize implications for India, explicitly discuss possibilities rather than deployment | Recovered the topic and gave a useful tradeoff between transferable learning and bureaucracy. Still ended “That is a possibility, not an established result” and another qualification about a proven national outcome. |

This sample establishes that Vera can synthesize and continue context. It also reproduces unnecessary defensive endings. It does not establish their frequency across all conversations or models.

## Architecture comparison

| Responsibility | Lila's implementation | Vera's implementation |
| --- | --- | --- |
| Per-turn method | Planner selects task, methods, scope, depth and budgets | Special cases for social, playful and edit turns; most substantive turns share one prompt |
| Skills | Triggered methods including comparative inquiry and recursive synthesis | Skills and personality capabilities concatenated into global instructions |
| Inquiry evolution | Structured propositions, ownership, revisions and continuity checks | Server-owned transcript passed to the model; no equivalent structured inquiry state |
| Retrieval | Focused or library scope with bounded tools for missing support | Initial retrieval selects up to five direct records and two related short answers |
| Relationship reasoning | Tools and methods can develop a comparison | Topic edges are supplied, but no explicit test that the needed relationship has been explained |
| Answer depth | Task-sensitive depth, output budget and reasoning effort | 950 output tokens for all replies, low reasoning effort, 4,000-character clipping |
| Review | Structural checks for inquiry, citations and answer shape | `review_reply` validates/cleans output metadata; it does not assess semantic synthesis |
| Routing | Task-aware plan and actual execution record | Current-question length/keyword rule; the history-length argument is unused |

Lila's complexity is selective. It does not require a separate model for every skill. Its evaluation also found memory attribution, irrelevant citation and verbosity failures. Port the useful responsibilities with tests rather than assuming its entire implementation is a proven template.

## Causes and confidence

1. **Brevity pressure is explicit.** The prompt says to expand only when asked or a distinction matters. The fixed output budget includes structured metadata and optional suggestions. This limits space for substantial exploration. It is not proof that every brief answer was token-limited.
2. **Exploration is permitted but weakly organized.** Conceptual adds a prompt paragraph about definition, analogy and example. It does not select recursive synthesis, track the active question or require a causal connection between retrieved concepts.
3. **Readiness cautions are globally available.** The prompt contains repeated company-status instructions, and retrieved records carry broad status and qualification fields. The live sample demonstrates these cautions spilling into possibility discussions. Their exact individual causal contributions require controlled comparisons.
4. **Context recall is stronger than idea development.** Full transcript access can recover earlier details, but there is no explicit distinction between the open question, visitor premise, Vera inference, adopted conclusion and unresolved disagreement outside prompt instructions.
5. **Retrieval resolves terms more directly than explanatory gaps.** Related short-answer records may add company context without the mechanism, counterexample or cross-domain connection needed to answer why. Simply expanding record count or adding a graph database would not solve this.
6. **Review and evaluation leave a semantic gap.** Recent tests check identifiers, expected terms, brevity, source shape, suggestion limits and enquiry behavior. A response can pass while merely listing concepts or repeating the last answer. The older review protocol calls for editorial assessment, but the recent synthesis tests do not operationalize sufficient standards for insight development.

## Proposed implementation sequence

### 1. Define conversational behavior and claim scope

Separate four useful bases for a statement internally: sourced company fact, established general concept, visitor-specified scenario and Vera's inference or hypothetical. Preserve status qualifications with the relevant company fact. Surface them when readiness is asked about, when the answer would otherwise imply a deployed capability, or when the limitation changes the conclusion. Do not append a general disclaimer to an explicitly hypothetical discussion.

General should remain capable of exploration. Conceptual should favor mental models and accessible examples. Neither setting should determine whether Vera can reason. Current instructions for requested length and simplicity retain priority.

### 2. Add selective conversational methods

Introduce a lightweight per-turn plan with direct answer, explanation, exploration, comparison, synthesis/revision, practical guidance, readiness, social and closure tasks. Use current intent plus relevant conversation context; routes remain provisional. Select only the needed methods, with no mandatory extra classification call.

Methods should include first-principles explanation, causal connection, analogy mapping and limits, comparative reasoning, recursive synthesis, counterexample, human context and conversational restraint. Keep Vera's composed industrial character and English-only behavior.

An exploratory reply should develop an answer through the relationship that matters, one concrete illustration and an implication or useful tension. This is editorial guidance, not compulsory headings or a fixed template.

### 3. Preserve the evolving inquiry

Add bounded session state for the active question, scenario, explicit definitions, assumptions, corrections, candidate conclusions and open tensions. Each item needs its source turn and attribution. Preserve earlier wording and record revisions separately. Vera's proposed interpretation must not become the visitor's belief without adoption.

Use the existing server-owned transcript as authority. Retain exact earlier turns for recovery when context is compacted. No cross-session personal profiling. Generate state updates alongside the normal answer where practical and validate them before persistence. Test misleading, withdrawn and ambiguous corrections as well as normal updates.

### 4. Make retrieval serve the question being explored

Build retrieval from the current inquiry and missing relationship, not only surface terms. Separate company-readiness records from general explanatory material and visitor scenarios. Curate explanatory links such as measurement to context, context to interpretation, interpretation to accountable action, and recorded outcomes to transferable learning.

Each explanatory connection needs a supported mechanism, a useful example, its limits and provenance. Clearly distinguish editorial synthesis from a source's own claim. Allow one bounded follow-up retrieval when a material factual gap remains. No graph-database migration is required for the first version.

### 5. Budget for useful depth and review

Give simple answers a short budget and substantial synthesis a larger budget. Consider medium reasoning effort only for tasks that benefit in paired tests. Remove silent character clipping in favor of complete validated answers. Keep the normal path to one answer-generation call; add a bounded second pass only when a specific missing-evidence or coherence condition justifies it.

Record selected task, methods, actual model, retrieval count, token usage and stage timings without exposing private reasoning or logging visitor text as operational telemetry. Compare both supported models on matched conversations before changing automatic selection.

### 6. Evaluate meaning, then release

Prepare 24 conversation scenarios, normally four to eight turns, across beginner learning, analogy development and failure, cross-concept synthesis, industrial strategy, corrections, detours, ambiguous references, criticism, readiness, uncertainty, humour, human concern and enquiry intent. Include terse follow-ups whose complexity comes from history. Run both supported models on matched cases and automatic routing separately where relevant. Repeat consequential or inconsistent failures with fresh sessions.

Review full transcripts and saved inquiry state. Score task fit, factual support, causal explanation, analogy fidelity, new useful insight, continuity/attribution, proportionate uncertainty, conversational quality and answer economy. Do not award synthesis credit just because all requested nouns appear. Include some cases where no defensible synthesis is possible.

Acceptance proposal: no material invented company claim, altered visitor position, misleading analogy, false enquiry action or corrupted correction. At least 90% of substantive scenarios should achieve a strong editorial rating for synthesis and fit, with no weak scenario concealed by an average. Direct readiness questions must remain accurate while exploratory turns stop receiving routine status endings. Report every failing scenario and the review basis.

Measure median and tail latency separately for routine and exploratory work, using enough observations for meaningful comparison. Choose explicit performance gates from the paired baseline before release. Check response layout, long-answer readability and optional suggestion behavior on desktop and mobile in both themes. Deploy after semantic review, then repeat representative production conversations and retain rollback evidence.

## Suggested first milestone

Implement task-sensitive methods, scoped qualifications and adaptive answer depth first. Re-run the six-turn orchestra conversation and paired cases before adding persistent inquiry state. This isolates whether improved response shaping addresses the largest visible issue. Follow with inquiry state and targeted retrieval, then the full release gate. Keep the existing cube, panel and public interface unchanged during this conversation-quality work unless testing reveals a readability problem.

## Implementation checkpoint and added reasoning/model work

The first local milestone is implemented in `lib/vectra/conversation.ts`, `graph.ts`, `skills.ts` and `retrieval.ts`. It selects task-specific methods, scopes readiness guidance, raises the generation allowance for substantive work, rejects oversized answers intact instead of clipping them, and supplies exact attributed visitor anchors from the existing server-owned transcript. Returning to a named earlier scenario now searches relevant visitor turns before inheriting the latest detour. These anchors are a continuity aid, not a persisted proposition/revision system.

Verification completed: 32 focused tests and type checking passed. Fourteen model-backed scenarios passed, including six new four-turn synthesis scenarios across Mini and Luna. After editorial refinements for repetition, explicitly illustrative details and unsolicited company framing, a fresh six-scenario, 24-turn confirmation also passed. These are sampled semantic reviews and structural checkpoints, not completion of the planned 24-scenario release matrix. No deployment occurred in this checkpoint.

The user added Lila-style internal reasoning and a GPT-5.4/GPT-5.4 Mini comparison to the active goal. Lila's actual runtime selects low or medium reasoning effort from the task and passes it to the Responses API. Its specification explicitly calls for internal reasoning and an intentional source-based explanation to the reader, rather than exposing or fabricating raw private reasoning. Vera currently requests low effort for all tasks, including the first milestone above.

Next model experiment: compare GPT-5.4 Mini at low and medium against GPT-5.4 at low and medium on identical multi-turn scenarios. Include routine questions, difficult synthesis, corrections, competing evidence and short follow-ups whose complexity comes from history. Measure semantic quality, complete-response latency, input/output/reasoning usage and failure rates. Verify actual project access and API billing conditions separately. A model name or free-tier assumption does not establish account eligibility. Do not replace Luna or change public model controls until this requested model discussion and comparison establish the intended routing.

Candidate routing for discussion: Mini low for routine turns; Mini medium for substantive explanation/comparison; GPT-5.4 medium for difficult synthesis or conflicting assumptions when paired evidence supports the improvement. Keep model selection independent from answer length and General/Conceptual style. Budget enough tokens and time for reasoning plus the complete response; add bounded fallback and record actual effort/model usage. Persistent inquiry revisions, the full scenario matrix, responsive readability checks, release and live verification remain in the active goal.

### Adaptive reasoning implementation in progress

`conversationPlan` now selects medium internal reasoning for substantive exploration, comparison and revision, and low effort otherwise. Requested brevity still controls response scope. Medium runs receive a larger total generation budget to leave room for internal reasoning. The model log records the actual requested effort and provider-reported reasoning-token usage. Public model options remain Mini/Luna while the GPT-5.4 comparison is reviewed; an experiment override exists only on the server function and is not accepted by the public API.

The bounded inquiry view is rebuilt from the authoritative saved transcript on each turn. It includes exact attributed visitor definitions/corrections and references to Vera's recent proposed explanations. It preserves rejected and hypothetical wording rather than applying unverifiable model-authored belief updates. Full original turns remain available. This implementation deliberately uses replayable conversation evidence as continuity authority; semantic attribution still needs the release review.

The 24-scenario fixture is `tests/fixtures/vera-synthesis-release.json`. `vera-release.live.test.ts` runs each scenario on Mini and Luna and saves every turn with timings under `data/vera-evaluation/release-synthesis`. `vera-reasoning.live.test.ts` runs three matched four-turn scenarios on GPT-5.4 and Mini, each at low and medium effort, under `data/vera-evaluation/reasoning`. Both runs are underway at this checkpoint; structural success must not be reported as completed semantic review.

Current local unit confirmation is 32 passing tests and type checking passes. A production build initially failed on a Windows output-directory permission error. Retrying with the required directory access compiled successfully; later build stages are still pending at this checkpoint. Deployment remains pending the matrix results, semantic review and responsive check.

The retried production build completed successfully. The first reasoning comparison completed all three scenarios for Mini low, Mini medium and GPT-5.4 low. GPT-5.4 medium failed during its first scenario at Vera's 24-second model deadline after replies taking approximately 18 and 23 seconds. Its partial transcript is preserved with a `24s-partial` suffix. A targeted repeat is running with an explicitly recorded 32-second evaluation deadline; results from that repeat cannot be represented as meeting the production deadline. The 24-scenario Mini/Luna release matrix is still running. No model-quality ranking or release decision has been established yet.
