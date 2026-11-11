---
id: "GRAPH-RELATIONS"
title: "Knowledge graph: typed relationships"
version: "1.0"
as_of: "2026-11-11"
classification: "public_safe"
ingest: false
approval_status: "pending_owner_review"
claim_status: "retrieval_graph"
source_ids: ["S01", "S03", "S04", "S05"]
aliases: []
related_ids: []
---

# Knowledge graph: typed relationships

This graph describes public topics and intended relationships. It is not Voltron’s proprietary manufacturing ontology. Each row’s status applies to that relationship; no path upgrades a plan into an operational fact.

| Edge ID | From | Relationship | To | Status | Sources |
|---|---|---|---|---|---|
| E01 | VL-IDENTITY | expresses | VL-VISION | positioning | S01,S04 |
| E02 | VL-IDENTITY | is_building | VL-VOS | in_development | S01,S03 |
| E03 | VL-IDENTITY | embodies | VL-HUMAN | philosophy | S01,S04 |
| E04 | VL-VISION | is_phased_by | VL-ROADMAP | planned | S04,S05 |
| E05 | VL-VOS | uses_shared_meaning_from | VL-ONTOLOGY | intended_architecture | S01 |
| E06 | VL-VOS | includes_intelligence_direction | VL-AI | in_development | S01 |
| E07 | VL-VOS | is_intended_for_validation_in | VL-ALPHA | planned_validation | S01,S03 |
| E08 | VL-ALPHA | can_inform | VL-NETWORK | planned | S01 |
| E09 | VL-NETWORK | may_generate_needs_for | VL-PRODUCTS | planned | S01 |
| E10 | VL-ROADMAP | includes_future_phase | VL-PRODUCTS | planned | S04,S05 |
| E11 | VL-HUMAN | extends_outward_through | VL-COMMONS | developing_vision | S01 |
| E12 | VL-PARTNER | routes_production_interest_to | VL-ALPHA | inquiry_direction | S01 |
| E13 | VL-PARTNER | routes_factory_interest_to | VL-NETWORK | inquiry_direction | S01 |
| E14 | VL-PARTNER | routes_collaboration_interest_to | VL-COMMONS | inquiry_direction | S01 |
| E15 | VL-AI | depends_on_responsible_judgment_in | VL-HUMAN | philosophy | S01 |
| E16 | VL-FAQ | summarizes | VL-IDENTITY | answer_navigation | S01 |
| E17 | VL-GLOSSARY | defines_terms_for | VL-VOS | terminology | S01 |

| E18 | VL-THESIS | motivates | VL-VISION | founder_perspective | S06 |
| E19 | VL-THESIS | proposes_validation_through | VL-ALPHA | planned_validation | S06 |
| E20 | VL-THESIS | grounds_strategy_in | VL-HUMAN | philosophy | S06 |
