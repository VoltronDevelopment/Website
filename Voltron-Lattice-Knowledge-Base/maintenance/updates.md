---
id: "KB-UPDATES"
title: "Keeping the knowledge base current"
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

# Keeping the knowledge base current

## This is a static snapshot
The ZIP does not install automatic synchronization. The following is a proposed publishing workflow for implementation.

## Approved publishing pipeline
1. Use an allowlisted public publishing source with a field explicitly permitting agent use.
2. Export changed public text plus source URL, topic ID, version, capability status and approval record.
3. Compare content hashes, detect changes and identify affected claims and graph edges.
4. Require review for new capability, readiness, certification, commercial or personal-data claims. Ordinary approved copy updates can follow a defined automated policy.
5. Rechunk and reindex changed approved records into a staging index. Remove withdrawn/deleted content and derived FAQ answers.
6. Run retrieval and claim-status checks. Verify updated routes and citations.
7. Switch atomically to the validated version; invalidate stale answer caches. Keep a rollback record.

## Minimum record fields
Stable ID, title, aliases, text, classification, approval status, claim status, source reference, public URL if verified, version, content hash, effective date, last reviewed date and related IDs. Document date and review date must be distinct. Do not fabricate an approver or validity period.

## Deletions and corrections
Withdrawal must remove searchable chunks and cached answers, not merely add a new version beside old claims. Update graph relations and FAQs that relied on the withdrawn claim. Personal inquiries never enter this pipeline.

## Maintenance trigger
Review after changes to Alpha readiness, process availability, product programs, people/Commons opportunities, routes, public contacts or partnership scope. Set a review cadence appropriate to the business; no cadence is currently adopted by this package.
