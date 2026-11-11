---
id: "GRAPH-OVERVIEW"
title: "Knowledge graph: visual overview"
version: "1.0"
as_of: "2026-11-11"
classification: "public_safe"
ingest: false
approval_status: "pending_owner_review"
claim_status: "retrieval_graph"
source_ids: ["S01", "S03", "S04"]
aliases: []
related_ids: []
---

# Knowledge graph: visual overview

Arrows describe conceptual relationships and future direction. Consult [typed relationships](relations.md) for status and sources and [nodes](nodes.md) for file mappings.

```mermaid
flowchart TD
  V["Voltron Lattice"] --> T["VOS: being developed"]
  V --> H["Human Lattice"]
  V --> R["Ten-year vision"]
  T --> O["V-MO: shared meaning"]
  T --> I["Contextual intelligence"]
  T --> A["Alpha: intended validation"]
  A --> N["Future factory network"]
  N --> P["Future industrial products"]
  R --> P
  H --> C["Commons: developing vision"]
```

The graph supports topic discovery, not proof of deployment. Production availability is always answered from current approved evidence.
