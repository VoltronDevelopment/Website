---
id: "AGENT-ENQUIRIES"
title: "Inquiry capture and handoff"
version: "1.0"
as_of: "2026-11-11"
classification: "public_safe"
ingest: false
approval_status: "pending_owner_review"
claim_status: "proposed_agent_design"
source_ids: ["S01", "S04"]
aliases: []
related_ids: []
---

# Inquiry capture and handoff

## Proposed flow
1. Answer the visitor’s question before asking for contact information.
2. Offer follow-up only when relevant. Let them choose production, partnership or another collaboration.
3. Explain why details are requested. Collect minimal fields: name, reply email and short requirement; organization where useful. Phone is optional.
4. Show a readable summary and let the visitor edit it.
5. Obtain an explicit request to submit that reviewed summary.
6. Call the implemented submission service. Use idempotency to avoid duplicate inquiries on retries.
7. Confirm success only from a successful response and real reference number. If it fails, preserve the draft and clearly explain that it was not submitted.

## Detailed route
Complex production or partnership needs can move to a verified Partner With Us form. Carry only a safe draft reference through navigation; do not put contact details into query strings. File attachments require an approved secure upload channel and clear permitted uses.

## Data handling
Inquiry records and chat personal data are separate from public knowledge. Do not index them into the shared customer-facing corpus. Apply access controls, retention and deletion rules established by the business. Do not claim a retention period that has not been adopted.

## Missing integration
If the backend is absent, say: “I can prepare the summary, but I cannot submit it from this chat yet.” Offer a copyable summary and a verified contact route when available. No database, CRM or form integration is supplied in this Markdown package.
