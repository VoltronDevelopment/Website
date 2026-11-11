# Vera

Vera is Voltron Lattice’s English-speaking public guide. Visitors chat as guests; contact details belong only in the optional enquiry form. The lazily loaded panel uses a shaded aura cube, respects reduced motion, and keeps its launcher above the hero strip on desktop and mobile.

## Conversation and evidence

LangGraph runs public-context retrieval, conversation skills and reply review. Retrieval combines English full-text search, OpenAI embeddings and explicit topic aliases, then expands one hop through approved topic relationships. Evidence is bounded and retains readiness qualifications. This is a relational knowledge graph in Postgres, not a separate graph service. Exact vector search is appropriate for the current 87-section corpus; reconsider an approximate index when measured growth warrants it.

The 15 approved public knowledge files contribute 76 sections; 11 website records bring the total to 87. Twenty typed relationships connect topics. The founder-thesis addition is a reviewed Flute & Forge snapshot; source fingerprints and current-site precedence are retained. Administrative documents, private documents and enquiry records are excluded. `scripts/vera-corpus.mjs` checks approval, topic IDs and relationship endpoints. `scripts/build-vectra-knowledge.mjs` also validates public routes and anchors. Current website claims take precedence over historical content; future additions and readiness changes require review.

The model receives selected evidence and the current guest conversation, which is capped at 24 turns. Visitor messages and Vera's replies are marked separately. For a simple edit of the latest reply, Vera works from that reply directly. It has no database, machine-control or submission tools. Reply review restricts source links to supplied records and enforces English script, with one repair attempt. The enquiry form requires deliberate submission through the established website endpoint. Partner handoff carries the requirement and enquiry type for ten minutes, without contact details in URLs.

## Hosted storage and configuration

Project: `mzrdnvpfrxmwghmegfqn`, Ireland. Apply all ordered SQL files in `supabase/migrations`. The first creates release/session storage; the second adds pgvector, full-text search and graph edges; the third schedules hourly expiry cleanup. Tables use RLS, with direct public, anon and authenticated access revoked.

Use separate Postgres logins:
- `vectra_app`: schema usage; SELECT on knowledge releases/chunks/edges; SELECT/INSERT/UPDATE/DELETE on guest sessions and request windows. Corresponding role-specific RLS policies are required.
- `vectra_publisher`: schema usage and SELECT/INSERT on releases/chunks/edges, with role-specific read/insert policies. It cannot read guest conversations.

Set `VECTRA_DATABASE_URL` for the runtime and `VECTRA_PUBLISH_DATABASE_URL` for the build publisher. Use the transaction pooler with verified TLS and the public Supabase CA bundled in `lib/vectra/supabase-ca.json`. Never use the administrator password for the website. `OPENAI_API_KEY` is server-only; Model IDs are allowlisted in `lib/vectra/models.ts`; the panel supports Auto, GPT-5.4 mini and GPT-6 Luna. The former `VECTRA_MODEL` environment value is superseded by this routing policy. Credentials stay in ignored local environment files or hosting configuration.

`VECTRA_STAGE_KNOWLEDGE=1 npm run build` stages and verifies an immutable knowledge release before publication. Embeddings are reused by content hash. Each application build reads only its bundled release checksum, so a failed build does not replace the running website’s knowledge. The publisher credential is not written to the runtime environment. Website summaries refresh from approved site source during each build; new subjects still need reviewed records.

Guest cookies are opaque and HTTP-only. Stored token hashes, bounded history, turn leases and retry IDs protect session isolation and duplicate requests. A conversation can accept 24 completed replies before the visitor needs a fresh chat, and its stored session expires after one day. Hourly cleanup removes expired rows. The API admits up to eight new reply requests per minute per client address and 350 across the site per UTC day. The shared daily allowance resets at 00:00 UTC (5:30 a.m. IST). Starting a new chat resets the conversation count. The per-minute and daily allowances still apply. Provider response storage is disabled. Logs contain timings and counts. Server-Timing reports context, answer and persistence durations.

## Verification, 11 November 2026

The hosted database contains 80 sections, 14 topics and 17 relationships. Runtime publishing is denied, as is direct anonymous access. The first production-preview run completed 18 real two-turn conversations against Supabase and OpenAI: median 4.30 seconds, maximum/p95 8.39 seconds. These are local-to-hosted measurements, not live website latency. They exposed overly administrative language and one mixed-script word; subsequent refinement shortened the default voice and added English validation.

Focused tests cover retrieval, qualification preservation, graph validity, nested JSON release checksums, guest retry/reset and source filtering. UI checks cover desktop/mobile, both themes, reading position, enquiry drafting and launcher placement. Enquiries continue to use the website’s existing storage; Supabase owns Vera’s conversation and public knowledge data.
