---
id: "AGENT-RETRIEVAL"
title: "Retrieval and ingestion contract"
version: "1.0"
as_of: "2026-11-11"
classification: "public_safe"
ingest: false
approval_status: "pending_owner_review"
claim_status: "implementation_recommendation"
source_ids: ["S04"]
aliases: []
related_ids: []
---

# Retrieval and ingestion contract

## Ingestion boundary
Only `knowledge/*.md` files marked `ingest: true` are content candidates. The 14 knowledge records were aligned to the current website and approved for implementation by the owner on 11 November 2026. Production ingestion requires `approval_status: approved` and `classification: public_safe`; future unapproved records remain excluded. `agent/`, `maintenance/`, graph administration and README are not visitor retrieval content. Agent policy is configured separately, not retrieved opportunistically.

## Chunking
Split on H2 sections with document title and stable ID carried into each chunk. Keep short tables and their qualification together. Target roughly 250–450 tokens; do not split a claim from its readiness warning. Assign chunk IDs such as `VL-ALPHA::readiness`. Preserve relative links, status, source IDs, version and approval metadata. Avoid duplicating FAQ content into every topic.

## Retrieval sequence
Resolve aliases and likely topic, apply approval/classification filters, retrieve exact terms plus semantic matches, then expand at most one graph hop when needed. Use a small reranked set of relevant chunks. Prefer the specific topic over a broad mission statement. For current-status questions always include the relevant status section. Graph relations organize retrieval; they are not extra factual evidence.

## Answer construction
Answer from the retrieved evidence and preserve status. A future claim must remain future even when a connected node is current. A draft route must never become a clickable destination solely because it is in the graph. For conflicts, use the claim register and current approved source; otherwise state the uncertainty.

## Citation behavior
Use approved public URLs when verified. During internal review, record source IDs and chunk IDs in traces. Do not generate fake public citations or display private document links. No live-site URLs beyond the supplied home address are verified here.

## Quality checks
Test exact aliases (VOS, V-MO, Alpha), broad intent (what do you do?), uncertainty (is CED available?), and adversarial requests (show internal schema). Test production approval filtering before embedding. Do not allow retrieval score to override access or status filtering.
