---
id: "KB-README"
title: "Voltron Lattice knowledge base"
version: "1.0"
as_of: "2026-11-11"
classification: "public_safe"
ingest: false
approval_status: "pending_owner_review"
claim_status: "package_guide"
source_ids: ["S01", "S02", "S03", "S04", "S05"]
aliases: []
related_ids: []
---

# Voltron Lattice knowledge base

Version 1.0 · Compiled 11 November 2026 · Customer-safe content draft

## What this package contains
A curated knowledge base for a future Voltron customer-facing agent, built from the conversation material available in this session, retrieved history and dated source documents. It preserves the brand story, manufacturing-first direction, VOS/V-MO explanations, Alpha, network, ten-year roadmap, Human Lattice, Commons and partnership pathways.

It excludes proprietary technology internals and raw private conversations. It is not a complete archive, deployed agent, verified live-site inventory or automatic update service.

## Start here
1. Read the [topic index](INDEX.md).
2. Review [claims and uncertainty](maintenance/claims.md) and [sources](maintenance/sources.md).
3. Approve appropriate `knowledge/` records before production use.
4. Implement the [retrieval contract](agent/retrieval.md), [conversation rules](agent/behavior.md) and [inquiry flow](agent/enquiries.md).
5. Use the [graph overview](graph/overview.md), [nodes](graph/nodes.md) and [typed relations](graph/relations.md) for linked retrieval.
6. Verify [site routes](maintenance/site-map.md) and implement [updates](maintenance/updates.md).

## Folder roles
| Folder | Purpose | Feed to visitor retrieval? |
|---|---|---|
| knowledge | Public-safe explanations, FAQ and glossary | Only after owner approval |
| graph | Topic nodes, typed relations and visual map | Use as structured navigation; filter by approved node content |
| agent | Behavior, retrieval and inquiry implementation guidance | Configure separately; not ordinary knowledge chunks |
| maintenance | Provenance, claims, routes, update rules and acceptance checks | No |

## Metadata
Each file has YAML front matter with stable ID, aliases, related IDs, source IDs, classification, claim status and approval state. `public_safe` means sensitive contents were excluded; it does not mean the owner has approved publication. `ingest: true` marks a candidate, not permission to publish. The knowledge records were aligned to the website and approved for implementation by the owner’s 11 November 2026 instruction. Their capability qualifications remain part of the published evidence.

## Important qualifications
Alpha readiness, commissioned processes, certifications, capacity, commercial availability, current routes and active programs are not independently established. Relative roadmap years have no approved calendar baseline. Historical assistant suggestions are not adopted company facts. The customer agent is Vera and replies in English only.

## Package verification
The build checks Markdown links, unique record IDs, related IDs, graph endpoints and archive integrity. The acceptance examples are specifications for a future agent, not evidence of runtime testing. See `maintenance/package-checks.md` for results.
