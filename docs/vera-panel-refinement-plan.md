# Vera panel refinement plan

Date: 2026-11-11. Status: implemented locally; production verification pending.

## Verified baseline

Reviewed current components and saved release screenshots at desktop 1440 and mobile 390 widths in light/dark treatments. These are local release artifacts, not a fresh live browser audit. Additional 320 and 768 screenshots exist. Earlier release d956803 was pushed to main; production completion and live verification remain unconfirmed after the previous approval service usage-limit failure.

- VeraCube maps Vera to specialist preset 5 and question cards to presets 3, 4 and 0. Specialist identities are being reused as decorations.
- Header cube is 38px. The welcome heading includes a second 70px cube, 52px on narrow phones. Remove that duplicate.
- Intro offers three question cards, but does not have a coordinated introduction text reveal.
- Desktop panel is 448px wide, expanded 720px. Mobile is a keyboard-aware bottom sheet. Preserve these foundations.
- Responses use one configured VECTRA_MODEL, default gpt-5.4-mini-2026-03-17. There is no user model selector or automatic model router.
- Camera framing was recently corrected for clipping. Revalidate all states after changing sizes and artwork, including static posters and aura bounds.

## 1. Visual identities and question cards

Keep the specialist agent presets unchanged. Give Vera an explicitly separate material configuration, sharing rendering utilities only. Give question cards one non-character cube each with quiet translucent faces, fine edges and distinct blue/cyan/pearl shading. Suggested studies are layered face tones for platform, a gentle inner illumination for industry, and converging face gradients for challenges. Avoid specialist clouds, signature flow patterns and identity colors. Use restrained illumination rather than another agent aura.

Remove the cube beside Where shall we begin. Increase the header identity cube to approximately 48px desktop and 44px mobile. Increase welcome space and question card height modestly, starting near 84px desktop and 88px mobile with content-driven growth. Keep 320px layouts readable without squeezing the arrow or copy. Keep title at 14px and detail at 12-13px, verify actual contrast and wrapping before changing type further.

Add one 80-110px decorative cube watermark behind unused transcript space at approximately 2-4% opacity. No WebGL context or continuous animation for this background. It must not interfere with messages, source links or controls. Use theme-specific opacity after visual review.

## 2. Introduction and motion

Use the header cube as the single focal identity. On the first empty-chat opening, settle its edges and internal illumination over about 600ms, then reveal the welcome text and three cards with overlapping 70-100ms offsets. Total entrance approximately 1-1.3 seconds. Reserve all geometry before animation so the composer and header never move. Typing and card selection work immediately and cancel remaining entrance motion.

Proposed welcome: I'm Vera. Supporting line: Let's explore how manufacturing can work better together. Retain Where shall we begin as a smaller optional prompt above the choices only if it improves the final composition. Avoid a second large heading.

Do not replay the entrance on every minimize/reopen or restored conversation. Reduced motion shows the settled composition immediately. No forced typewriter pacing or fake reasoning progress.

## 3. Quiet top controls

Place a compact Auto dropdown below the identity line, with Auto, GPT-5.4 mini and GPT-6 Luna options. Keep the normal header sparse rather than displaying three permanent model buttons. Add an unobtrusive Motion control with Ambient and Still choices if aura control is desired. Respect reduced-motion and site animation settings as stronger constraints. Model selection must not change Vera's identity or aura.

Visitors may use both models without payment if Voltron funds usage. Do not describe them as free API tiers. Official model pages list Free as unsupported for both. Account access must be verified before offering a model publicly.

## 4. Routing implementation

Create a server-owned allowlist and capability configuration for both exact models. Validate the requested preference, never accept arbitrary model IDs from the client. Persist preference without resetting the conversation. Preserve the same history, personality, evidence, English-only policy, enquiry contract and limits across models.

Evaluate both models on identical existing conversation fixtures before selecting defaults. Candidate policy is Luna for everyday conversation and direct public-content answers, with mini for complex synthesis only if the evaluation supports that division. Do not assume mini wins complex questions because of its label. Use explicit request signals, conversation context and retrieval coverage. Low evidence coverage should trigger appropriate uncertainty or clarification, not a model switch to invent an answer.

Keep routing server-side and inexpensive. Log effective model, route reason, duration, token usage and fallback reason without logging credentials or unnecessary personal data. A bounded fallback may handle a transient provider failure, within one response deadline. Manual choices stay selected; disclose if a fallback model answers. No duplicate saved turns or duplicate enquiry submission. Model switches must not reset daily or guest limits.

## 5. Validation and release

Check 320, 390, 768 and 1440 widths in both themes. Include narrow landscape, expanded desktop, keyboard open, long replies, enquiries, error and limit states. Confirm no clipped geometry/aura, no background overlap, stable opening layout, legible card wrapping, accessible selector focus and usable touch targets.

Exercise static poster to live cube handoff, slow startup, WebGL failure, hidden tab and reduced motion. Do not add another rendering context for backgrounds or question decoration where lightweight rendering is sufficient.

Run existing conversational matrix for each model plus Auto routing cases, manual selection, transient failure, unavailable model, English retry, history retention and limits. Review actual answers in addition to mechanical assertions. Compare completion rate, factual grounding, median/p95 response times and cost. Preserve incomplete results if normal limits are reached.

Release sequence: resolve previous production status, implement identity/layout, add intro, validate model access and routing, run visual and conversational checks, capture review artifacts, then deploy the combined release and verify live in both themes. Update personality/UI documentation that currently describes obsolete linked cube studies.

## Official references

- https://developers.openai.com/api/docs/models/gpt-5.4-mini
- https://developers.openai.com/api/docs/models/gpt-6-luna

## Implementation evidence

The panel now has dedicated Vera material, CSS question cubes, a faint watermark, coordinated welcome motion, model preferences, motion control, server-side routing and disclosed transient fallback. A production build passed. Automated UI checks passed at 320, 390, 768 and 1440 in both themes, including enquiry revisions and chat-limit recovery. Both model IDs were verified accessible with the existing server account. Eight personality/context turns passed using the complete Vera instructions; the expanded coherence evaluation is recorded separately. No claim of comparative model superiority follows from this small sample.
