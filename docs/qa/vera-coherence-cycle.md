# Vera conversation coherence review

This review checks whether Vera keeps a visitor's meaning, facts, constraints and intent straight as the conversation gets harder. The [extended fixtures](../../tests/fixtures/vera-coherence.json) contain 57 turns across 12 fresh guest sessions. They cover invented words, typos, transliteration, conflicting acronyms, ambiguous pronouns, nested negation, compound instructions, strategy tradeoffs, evidence and quotation traps, indirect instructions, tone shifts, safe industrial handoff and enquiry revisions. An eleven-turn case checks details introduced before the recent context window. The [original 80-turn suite](../../tests/fixtures/vera-multiturn.json) covers the earlier personality, grounding and boundaries cases.

## Run a cycle

1. Use the Voltron Website workspace and a local Next.js preview with the configured Vera backend. Reuse the preview on port 3043 if it is serving this workspace. If it is down, run `node --env-file=.env.local node_modules/next/dist/bin/next dev --port 3043` and wait for the API to respond. Use the existing credentials without printing them.
2. Run `node scripts/evaluate-vera.mjs http://localhost:3043 tests/fixtures/vera-coherence.json`. The runner creates a dated folder under `data/vera-evaluation`. It sends synthetic visitor messages through the same API as the chat, checks the full saved thread after each reply, and records per-turn text, sources, enquiry state and timings. The ordinary per-minute rate limit applies. The runner waits for its next window when needed.
3. Read actual replies against the fixture expectations. The runner checks selected identifiers, word counts and enquiry flags. Review meaning separately because string matches cannot establish that a response understood a correction, grounded a claim or answered all parts. Record the turn, what happened, severity, and a concrete example. Treat infrastructure failures as incomplete results. Keep evaluator expectations out of the messages sent to Vera.
4. When a failure is reproducible, change the smallest responsible part of the local code or conversation instructions. Add a general regression case when the existing fixture misses the failure. Rerun affected threads with fresh guests and sample the most relevant original regressions. Keep the first run and retest in separate folders. A single scheduled review can make one focused batch of fixes and run one confirmation pass. Record what remains for the next review.
5. Record the date, fixture hash, completed turns, mechanical failures, missed checkpoints, observed issues and retest evidence in a short report. Compare median and p95 reply time, excluding deliberate waits for the rate window. Include recurring conversational issues even if every automated check passed. Keep the changes and evidence in the workspace for review.
6. If Vera reaches the daily chat limit, preserve the partial run and classify it as incomplete. Start the affected threads again with fresh guests after the ordinary limit resets.

To rerun specific threads, pass an output directory followed by their IDs:

```powershell
node scripts/evaluate-vera.mjs http://localhost:3043 tests/fixtures/vera-coherence.json data/vera-evaluation/coherence-retest C03 C04
```

An unsuccessful mechanical check or checkpoint gives the runner a nonzero exit status. The reports are still written for inspection.

## Coherence end state

- All planned turns complete with correctly saved history, valid source links, and no failed factual or intent checkpoints.
- At least 11 of 12 extended threads meet their editorial expectations. Any remaining issue is a minor style issue with its example recorded.
- Zero material errors involving invented claims or quotations, unsafe guidance, a visitor belief or project detail assigned incorrectly, or enquiry actions misrepresented.
- Early project details survive side topics and corrections within the same guest conversation. Vera uses the visitor's definitions, handles ambiguity proportionately, and answers the requested parts and format.
- Targeted retests pass after a fix. Two fresh full-suite reviews meeting the criteria establish a stable baseline for the recurring checks. Reopen the relevant case when the behavior regresses.

A production change is a separate release step. Scheduled reviews use synthetic local conversations and the existing configured model. They leave reports and local patches for inspection.
