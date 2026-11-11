# Vera — final coherence audit and implementation plan

Date: 11 November 2026. Status: core refinements implemented; release verification underway. The longer-term benchmark and structured-memory proposals below remain follow-up work, not claims of completed implementation.

## Outcome

Final approved visual correction: background artwork is additive and belongs to the overall Vera panel. Preserve the foreground 3D question cubes with moving aura, add three faint cubes behind the full intro/conversation surface, and place a live unframed settings cube at the top right. This supersedes earlier proposals below about artwork on individual question cards or removing the foreground artwork column.

Unify Vera's visible identity, conversational judgment, evidence retrieval and response performance. Preserve English-only guest chat, the separate introduction, existing model choice, the unframed header cube and Voltron's own aesthetic. Lila is a reference for interaction and engineering principles, not a personality to copy.

## Findings from the current implementation

1. **Settings have not been removed.** The small cube beside VERA is a native disclosure control opening model and aura settings. Removing the rounded frame addressed the earlier request but weakened discoverability. Its accessible label and desktop tooltip remain. A touch visitor has no obvious visual indication of settings.
2. **Question artwork is still a foreground icon.** Each of the three invitation cards uses a separate cube column, copy and arrow. A single extremely faint watermark exists behind the transcript. This is different from artwork embedded into a card surface.
3. **Vera has a real shared personality contract.** Both models use the same identity, English rule, source boundaries, emotional judgment and correction instructions. However, conversation consistency largely depends on passing the full history and prompting. It does not yet have Lila's explicit validated proposition/correction state.
4. **Retrieval is hybrid, but typo resolution is implicit.** The runtime combines Postgres full-text search, embeddings, exact aliases, token overlap and one-hop topic relationships. There is no explicit conservative typo or partial-name resolver. Semantic search can compensate, but it does not establish reliable treatment of ambiguous fragments.
5. **Follow-up retrieval is shallow.** Contextual embedding uses the immediately preceding question when certain pronouns appear. Local ranking also adds previous-question tokens for short turns. It does not systematically recover the latest cited topic across a harmless aside. Conversely, indiscriminate history expansion would risk dragging stale topics into a new question.
6. **Graph expansion needs stronger intent control.** Related short-answer sections are chosen from relationship endpoints, currently allowing both directions. Relationships passed to the model preserve their labels and direction, but retrieval selection itself needs tests for irrelevant neighbouring topics and status-qualified edges.
7. **Citation validation is structural.** Sources must belong to retrieved evidence and are deduplicated by page. That prevents invented source IDs; it does not prove every sentence is supported by the cited passage.
8. **Latency is partly observable.** HTTP timing separates knowledge-release loading, the combined answer phase and persistence. Retrieval and model timings exist in server logs but are not separately represented in the HTTP measurement. Embedding requests may take up to six seconds before lexical fallback. The response is buffered, not streamed.
9. **Long sessions have growing cost.** Reply-count caps remain disabled as requested. Full history is sent for ordinary turns, so response cost and latency can grow. The 60-turn retention check is useful evidence, not a guarantee for unlimited history.
10. **Documentation has drift.** Older plan/contract sections still describe superseded welcome layouts and cube artwork. Consolidate current behaviour separately from historical release notes.

## Current live sample

Four sequential synthetic guest requests through the public API, Auto selection; all selected Luna and returned HTTP 200. No enquiry was submitted.

| Question | End-to-end | Server total | Combined answer phase | Observed result |
|---|---:|---:|---:|---|
| What is V-MO? | 6.11 s | 4.95 s | 4.38 s | Correct ontology explanation and relevant source |
| how does ontolgy connect to manufac intelligence? | 4.28 s | 3.27 s | 2.98 s | Interpreted misspellings in context; linked manufacturing meaning to intelligence |
| and alph readiness? | 3.61 s | 2.64 s | 2.36 s | Correct Alpha interpretation; retained unconfirmed readiness qualifications |
| I meant Commons, not Alpha. How does it connect to learning? | 3.69 s | 3.08 s | 2.80 s | Followed explicit correction; described Commons as developing, not launched programs |

The first measured knowledge-release load took 285 ms; subsequent recorded loads were approximately zero due to the existing release cache. Persistence was about 72 ms. This is a four-turn sample, not cold-start proof, model comparison or a p95 benchmark. End-to-end overhead includes network and request handling, not just model generation. Evidence: `data/vectra-smoke/coherence-audit-live.json`.

The existing live browser audit also passed at 1440 px and 390 px in both light and dark themes: settings opening, model selection, aura toggle, intro/chat navigation, stable header position and draft preservation. A separate live greeting returned a valid identity reply without sources. Screenshots were captured under `data/vectra-smoke/previews/release/`. Desktop-light and mobile-dark chat captures were visually inspected. These are browser-emulated viewport checks, not physical-device testing.

## What to transfer from Lila

Reviewed Lila's cover, card/background styles, named-reference retrieval, conversation-reference recovery and four coherence-phase reports.

- Keep artwork and intro transitions independent of the conversation runtime.
- Recover references from persisted citations and named mentions, while stopping at unrelated subject changes.
- Carry the source's actual passage and qualifications; do not rely on title-level relevance alone.
- Preserve hypotheses, endorsed claims and corrections as distinct states. Ambiguous corrections must not erase whichever fact happens to be easiest to find.
- Retain failed runs, test paraphrases and unseen examples, and distinguish successful execution from editorial correctness.
- Do not copy Lila's literary voice, multilingual behaviour, subject catalogues or private-person framing into Vera.

## Implementation sequence

### 1. Restore settings discoverability and embed card artwork

Keep the header cube unboxed. Add a tiny neutral disclosure chevron next to it, inside the existing 44–48 px hit area. Provide a clear expanded state and keyboard focus indication without reinstating the blue square. Keep the native disclosure and existing model/motion preferences.

Interpret the requested three cubes as **one pale background cube in each of the three invitation cards**. Remove the foreground artwork column. Use oversized, softly cropped cube faces at the trailing edge with a gradient fading before the text. Platform: cool blue; industry: muted teal; challenge: blue-violet. These are decorative tonal variations, not specialist-agent identities. Start around 5–9% opacity in light and 7–12% in dark, then tune from screenshots rather than treating opacity as a quality target. Text and arrow remain the visual priority.

Use lightweight CSS/SVG surfaces rather than three new WebGL renderers. If animated, move only a restrained light gradient; stop for reduced motion and hidden panels. Preserve the distinct larger Vera aura on the intro and title. Check 320, 390, 768 and 1440 widths, short landscape, keyboard-open mobile and both themes. Keep card height content-driven and body text readable; no decorative layer may intercept clicks.

### 2. Resolve fragments and references conservatively

Introduce a query-resolution stage before retrieval, returning original text, canonical candidates, confidence and reference provenance. Preserve the original user message for generation and audit.

Order: exact current-release alias → explicit visitor-defined term → clear contextual reference → conservative spelling candidate → semantic retrieval. Use Unicode/punctuation normalization and bounded typo matching only against approved public names. Do not fuzzy-expand short acronyms, quantities, identifiers or ordinary words without context. A fragment such as `manuf` alone may need clarification; `ontolgy` beside V-MO is much safer. Do not announce every harmless spelling correction.

Recover recent topics from validated citations, not only the last question. Explicit new topics override carry-over. A joke or acknowledgement may preserve the topic; an unrelated factual question forms a boundary. If two candidates remain plausible, ask one short clarification rather than retrieving whichever has the largest lexical score.

### 3. Keep evidence, relationships and release data coherent

Retain the existing Supabase relational/vector design; no separate graph database is justified by the current corpus size. Validate topic IDs, directional relationship labels, status and source-release version together. Expand only relationships useful to the current question, with a bounded evidence budget and qualifications attached.

Add checks for stale published snapshots, withdrawn aliases, obsolete URLs and conflicting readiness claims. Current website wording governs current capability; older knowledge-base/thesis material remains attributed perspective. Website builds continue publishing reviewed releases; private files must never become approved automatically. Audit any proposed SQL/index change against query plans before adopting it.

### 4. Strengthen continuity without making Vera mechanical

Maintain one voice: composed, precise, curious and capable of understated wit. Avoid stock empathy, compulsory questions, excessive caveats and brand promotion during personal concerns.

Add bounded, validated session context only where tests show full-history prompting is insufficient: active topic, visitor-defined terms, visitor facts, hypotheses, explicit corrections and enquiry draft. Associate facts with their originating turn and revision. Never convert Vera's own suggestion into the visitor's belief. Preserve the previous valid state if a proposed update is malformed or ambiguous. No persistent emotional labels. Evaluate memory compression separately before replacing full history; do not silently truncate early project facts to improve speed.

### 5. Measure and improve latency

Measure request validation/session access, release load, query resolution, embedding, database search, generation, persistence and browser rendering separately. Use redacted trace IDs and timing metadata; do not log contact details or whole conversations by default.

Run a modest production sample plus a larger staging benchmark: social, factual, typo, correction, synthesis, enquiry preparation and long-history questions; both explicit models and Auto; warm requests and observed cold-start candidates reported separately. Publish sample counts, median/p95, failures and actual chosen model. Do not call a fresh browser a cold server.

First optimize redundant work and reference recovery without another model call. Benchmark concurrent lexical search and semantic retrieval with a bounded embedding budget, then merge results without losing qualifications. Cache only versioned public indexes by default; any per-session query cache must have a small lifetime and expire with the session. Do not share private response caches. Compare serial versus parallel search load before adopting it. Streaming requires its own source/validation design and must not expose unvalidated partial claims.

### 6. Run the final coherence matrix

Create a held-out set alongside known regressions: 20 typo/fragment cases, 12 ambiguous-reference cases, 12 topic-switch/correction chains, 12 character/emotional/humour chains, 12 evidence/readiness/privacy cases, 8 enquiry revision cases and 8 long-context cases. Run deterministic retrieval checks first, then multi-turn generation through both models and Auto. Use fresh sessions for independent scenarios.

Score intent, reference resolution, source support, readiness qualification, speaker attribution, correction preservation, tone, English-only output and response timing separately. Include nonsense, conflicting abbreviations, invented terms, negation, mistaken company names, no-advice requests, humour-to-seriousness and attempts to elicit private/IP details. Enquiry tests must not send real messages or fabricate successful submissions.

Repeat targeted failures after fixes, then run the complete regression and unseen paraphrases. Stop after all critical failures are resolved and two consecutive full runs have no critical regressions; document residual minor variability rather than claiming exhaustive reliability.

## Release conditions

- Settings are findable on touch and keyboard, remain functional and have no enclosing cube frame.
- Three invitation backgrounds remain subtle with readable text, stable layout and no clipped Vera aura.
- No unsupported readiness/IP claim, invented citation, lost explicit correction or false enquiry-success claim in the release matrix.
- Low-confidence fragments trigger useful clarification; relevant typo queries recover expected evidence.
- Latency report has actual measured stage timings and no unexplained p95 regression greater than 10% against a comparable baseline; quality cannot be sacrificed to meet speed targets.
- Desktop/mobile, both themes, reduced motion, refresh, back/forward intro navigation, draft/pending preservation and keyboard state pass.
- Update the current contract and release notes; retain historical reports as historical.
- Deploy the reviewed implementation through the existing main-branch release path, then repeat live settings, conversation, correction and visual smoke checks. This audit itself changes no production runtime.
