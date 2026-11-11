# Vera — consolidated refinement plan

Date: 11 November 2026
Status: implemented; final release verification in progress. This document supersedes the earlier inline-welcome plan. No application changes are made by this planning update.

## 1. Objective and current baseline

Create a distinctive Voltron conversational experience with a dedicated introduction card, rich but restrained cube artwork, intuitive navigation, useful settings, and a composed, curious personality with quiet wit. Lila supplies interaction principles and quality references. Vera retains its own visual identity, language and manufacturing perspective.

Already deployed and verified:

- Dedicated Vera material configuration and decorative question cubes that do not reuse specialist agent presets.
- Larger header identity, faint chat background cube, responsive panel and keyboard-aware mobile sheet.
- Auto, GPT-5.4 mini and GPT-6 Luna selection, server-side allowlisting, shared conversation rules and disclosed transient fallback.
- Guest chat, public knowledge retrieval, relationship context, source links and deliberate enquiry submission.
- Daily and conversation-count caps temporarily disabled in release 37b9274, Amplify job 93. A real guest reply succeeded after deployment. Eight new reply requests per minute per client, one active reply per session, message-size bounds and 24-hour session expiry remain.
- The previous visual release passed local checks at 320, 390, 768 and 1440 widths in both themes and live desktop/mobile checks in both themes.
- Both models completed 57 synthetic coherence turns each. These tests used the conversation graph and bundled evidence selection, not a complete production retrieval benchmark. Literal checkpoint misses and minor wording issues are documented in docs/qa/vera-panel-release-2026-11-11.md.

Remaining design problems:

- The current welcome lives inside the empty transcript. It is not the requested separate introduction card.
- Vera's aura is too pale. Internal colour variation and depth need stronger definition in both themes.
- The diamond is a motion toggle with weak discoverability. It should become a meaningful cube settings control.
- The introduction and everyday voice need a more recognisable, original character.

## 2. Experience structure and navigation

Use a stable outer window with distinct introduction and conversation views.

1. First open presents the dedicated introduction card.
2. Begin a conversation arrow enters the chat view.
3. A quiet back arrow in chat returns to the introduction.
4. Returning to chat preserves the thread, draft, reading position, pending reply and enquiry draft.
5. Minimize/reopen restores the last view during the current visit. A restored conversation must not be trapped behind a repeated entrance sequence.
6. Settings are accessible from both views. Enquiry remains an explicit action from chat.

The introduction occupies the panel's main body and has its own composition. The composer and question cards belong to the conversation view. Existing conversation state stays mounted or is lifted above the view switch so navigation cannot reset it. Returning to the introduction must not cancel or duplicate an in-flight request.

The header position, window dimensions and bottom boundary remain stable during the transition. Use a short content crossfade with slight lateral movement. Reserve layout before rendering, and avoid a scale transformation from the large presentation cube into the header control.

## 3. Dedicated introduction card

Proposed copy:

VERA
Let's see what connects.

I'm Voltron Lattice's AI guide. Bring a question, explore an idea, or imagine what industry could become.

Begin a conversation →

Composition:

- One large presentation cube, then VERA, the introductory line, concise supporting copy and the arrow action.
- Fine enclosure edges, visible colour depth, quiet material surface and generous negative space.
- Minimal window chrome. Consolidate the existing header identity cube and diamond into one functional settings cube. The larger presentation cube is specific to the introduction.
- On a resumed thread, use Continue conversation for the arrow.
- Preserve the site's Montserrat family, established colour tokens and restrained spacing. Use existing brand lettering conventions for VOLTRON LATTICE whenever it appears.
- Initial artwork targets: 150-170px on desktop and 116-136px on mobile. Final fit is determined by the smallest supported screen and short landscape view.
- Initial type targets: VERA 28-32px desktop / 24-28px mobile, introductory line 18-20px, supporting copy 14-16px. These are composition targets, not additional site-wide type rules.
- Long or short viewport heights must remain usable. Allow content scrolling rather than shrinking text or hiding the arrow.

Entrance sequence, approximately 1.2-1.6 seconds:

- Establish the cube in its final frame immediately with a matching fallback.
- Fine edges and inner illumination resolve, with colour flow developing inside.
- Name, introductory line and supporting copy enter in overlapping stages.
- Arrow settles into place without blocking early interaction.
- The cube continues a slow internal movement after the entrance.

Reduced motion shows the settled composition immediately. Reopening, returning from chat or changing themes must not replay the whole introduction. Define a session-level entrance flag and verify it across view changes. Text stays readable during animation; no typewriter delay, flashing letters or required waiting period.

## 4. Vera's cube identity and visual system

Develop the dedicated Vera material rather than borrowing KAVO, RIXA, MEKO, ZILO, SARO or TEYO identity patterns.

Palette starting points:

- Deep cobalt for body and depth.
- Saturated cyan for moving light.
- Indigo for a secondary colour stream.
- Pearl for thin illuminated edges and highlights.

Use two or three overlapping colour regions with smooth transitions. Preserve dark depth between bright areas so the cube does not become a flat pale volume. The light theme needs stronger internal contrast. The dark theme needs controlled highlights with readable enclosure edges.

Motion should be slow and continuous, with directional changes that feel organic. Increase local movement slightly during a response without implying a visible trace of hidden reasoning. A soft outer aura supports the cube; most of its colour and interest stay inside the enclosure.

Maintain the same identity across launcher, header/settings control, introduction and response activity. Use size-specific framing and rendering resolution. Verify every rotation/flow state, shadows, glow and static-to-live handoff. Keep a visible margin around the complete artwork. Larger display size must not enlarge the actual geometry unexpectedly during loading.

Question illustrations remain one understated cube each with distinct face gradients. Their illumination is decorative and carries no specialist-agent identity. The chat watermark remains almost invisible and inexpensive to render; it should not animate continuously behind reading text.

## 5. Functional cube settings control

Replace the diamond with a small 3D Vera aura cube in a proper button. Consolidate duplicate header art into this control. Use a subtle hover/focus treatment, accessible name Open Vera settings, and a tooltip so its function is discoverable.

Settings contents:

- Response model: Auto, GPT-5.4 mini, GPT-6 Luna.
- Aura motion: Ambient or Still.
- A concise explanation of Auto.
- A short About Vera link if needed; enquiries and conversation actions remain in their established locations.

Keep the panel compact. Desktop uses an anchored popover; narrow mobile uses a contained settings sheet or panel that stays within the chat window. No decorative sliders without a useful outcome.

Opening, selection and closing must provide visible feedback. Escape closes settings first, focus returns to the cube control, outside interaction closes the popover appropriately, and touch targets remain usable. Moving focus into a native model picker must not minimize the whole chat.

Preference changes persist. A model change applies to the next request and cannot alter an already pending response. Ambient respects reduced motion and the site's stronger motion-off setting. Still freezes the aura immediately while keeping the cube visible. Theme changes preserve the selected model and view.

## 6. Original conversational personality

Core character: composed, observant, curious, precise and quietly witty. Vera should have an independent point of view while welcoming disagreement. Its futuristic character comes from seeing relationships, asking perceptive questions and considering possibilities.

Reference influences, interpreted for this project:

- Data: reason-driven curiosity and attention to human meaning.
- TARS: practical usefulness and occasional dry humour.
- K-2SO: direct observation, softened with tact and respect.
- Lila: attentive turn-taking, responsive pacing, clear navigation and consistency of character.

These are internal creative references. Public copy and replies use Vera's original language and identity.

Behaviour rules:

- Answer the visitor's actual intent first. Ordinary conversation and playful exchanges need no company pitch.
- Make humour brief, situational and kind. Do not joke through safety concerns, distress or serious uncertainty.
- Acknowledge frustration without assigning blame or declaring another person unfair on incomplete evidence.
- Challenge an assumption with a reason or a useful question. Avoid automatically agreeing or forcing a follow-up question after every answer.
- Be optimistic about human ingenuity and India's industrial potential while treating development plans and readiness accurately.
- Scale depth to the question. Give a simple answer to a simple question and a structured explanation when the visitor asks for detail.
- Use English consistently, including when interpreting typos or transliterated queries.
- Identify Vera as an AI guide when relevant. Do not invent feelings, private memories, factory access or actions performed.
- Keep proprietary implementation details outside public answers. Explain verified concepts and capabilities in useful public language.
- Enquiry drafting remains optional and explicit; only a successful form submission may produce a submission confirmation.

Example tone:

Visitor: Our factory runs on Excel and hope.
Vera: Hope is doing a lot of the integration. Where does the information usually stop lining up?

Visitor: We need to automate everything.
Vera: Which work is consuming people's time without benefiting from their judgment? That would be a useful place to start.

Implement this as a focused refinement of the existing personality and examples. Retain the established context, correction, evidence and enquiry safeguards.

## 7. Conversation and content refinements

- Remove the large inline introduction from the empty transcript once the separate card exists. Keep three concise starter cards for platform, industry and a manufacturing challenge.
- Avoid attaching sources to a simple greeting or identity acknowledgement. A mixed greeting and factual question must still retrieve appropriate evidence.
- Replace internal-sounding phrases such as approved evidence and package notes with natural public explanations.
- Present source links with concise visitor-facing titles and keep them collapsed until useful.
- Avoid rendering blank contact-form headings as a model reply. Show a compact requirement summary and the established enquiry action.
- Preserve explicit quantities, units, processes, timelines and revisions across model switches and detours.
- Preserve the current website-first knowledge precedence, reviewed founder-thesis material, relationship-aware retrieval and publication synchronization.
- Verify fresh content reaches retrieval and conflicting older content cannot override current website claims. Do not introduce another database solely for the visual refinement.

## 8. Model routing, performance and temporary limits

Retain server-side model allowlisting and the shared persona, evidence and conversation across both choices. Both are available to visitors without payment under Voltron's funded API usage.

The current Auto policy uses question length, synthesis keywords and thread length. Refine this with evaluation evidence. A long chat alone should not permanently force one model; route based on the current task and necessary context. A short ambiguous question can need more reasoning than a long simple request. Low evidence coverage calls for a qualified answer or clarification.

Compare both models on the same questions, evidence and history. Record factual accuracy, correction retention, tone, source relevance, enquiry behaviour, median/p95 timing, completion rate and token cost. Current samples do not prove a universal speed or reasoning advantage for either model.

Keep a bounded transient fallback and disclose the actual fallback model. Preserve idempotency and manual preferences. Do not retry indefinitely or duplicate an enquiry.

Daily and conversation-count caps stay disabled unless the owner asks to restore them. Preserve the existing burst and concurrent-request protections and 24-hour session expiry. Test longer conversations now that the count cap is disabled. If context needs compaction, preserve named facts, corrections, units and unresolved requirements explicitly, and test recall before enabling it. Context management must not silently become a new visitor reply cap.

Avoid loading extra rendering contexts for question decorations, watermarks or each settings cube. Reuse the renderer, pause offscreen/hidden work, and scale resolution to visible size. Keep the intro's first meaningful paint independent of model calls. Measure browser opening time separately from retrieval, model generation and persistence.

## 9. Implementation order and deliverables

1. Inspect Lila's existing intro/back-navigation implementation as an interaction reference; confirm current Voltron state ownership and focus handling. Deliver a concrete view/state map.
2. Build the separate intro and chat navigation. Deliver preserved drafts/history and stable dimensions before motion work.
3. Refine Vera's material and matching static fallback. Deliver light/dark artwork at launcher, header and intro sizes.
4. Implement the cube settings popover and consolidate header controls. Deliver keyboard/touch and preference behaviour.
5. Add coordinated intro motion and refine empty-chat cards, spacing and watermark. Deliver screenshots at all target widths and a transition recording.
6. Refine personality, source presentation, enquiry summaries and Auto routing against the existing conversation contract. Deliver scored paired-model examples and targeted regression cases.
7. Run the complete verification matrix, resolve observed issues, and prepare the combined release. Deliver a concise report that distinguishes automated assertions from editorial review.
8. Publish the completed refinement through the established main branch/Amplify pipeline after the checks pass, then verify the deployed version and real conversations. The present planning turn changes documentation only.

Likely implementation files:

- components/vectra/Vectra.tsx — panel view, header/settings control, viewport and focus behaviour.
- components/vectra/VectraConversation.tsx — persistent chat state, return navigation and starter cards.
- components/vectra/VeraIntroduction.tsx — dedicated introduction composition, or split into intro and starter-card components.
- components/vectra/VeraCube.tsx and vera-cube-renderer.ts — coherent identity, framing and motion preferences.
- components/vectra/vectra.css — responsive layout, settings, visual hierarchy and motion.
- lib/vectra/personality.ts and skills.ts — character and conversational examples.
- lib/vectra/models.ts and graph.ts — measured routing and source/reply handling.
- Existing conversation/API tests and opt-in model matrix — behavioural and state regressions.

## 10. Acceptance checks

Visual and interaction matrix:

- 320, 390, 768 and 1440 widths in light and dark; short landscape and expanded desktop.
- First opening, return from chat, minimize/reopen, restored thread, new conversation and theme change.
- Intro and cube ready under slow loading, WebGL failure and reduced motion.
- Keyboard open, long messages, scrolling, source disclosure, enquiry revision and pending reply while switching views.
- Settings keyboard navigation, outside click, Escape, focus restoration and model change during a pending response.
- No clipped cube/glow, sudden scale change, text wobble, unexpected scroll jump, obscured composer or horizontal overflow.
- Motion switches visibly work. No blue focus ring on ordinary clicks; keyboard focus remains clearly visible.
- The introduction arrow is available immediately, and back navigation never deletes the conversation.

Conversation matrix:

- Existing 57-turn coherence set for both models, plus Auto routing and cross-model continuation.
- Greetings, ordinary conversation, playful nonsense, complex industrial questions, disagreement, distress and blunt criticism.
- Typos, acronym collisions, ambiguous pronouns, nested negation, format constraints and earlier-fact recall.
- Readiness questions, quotation traps, conflicting old/current content, unsupported claims and proprietary-detail requests.
- Enquiry creation, correction, withdrawal, return navigation and verified submission language.
- Existing quota exhaustion no longer blocks new replies; conversation continues beyond 24 replies.
- Extended threads exercise growing context and response time without silently losing key visitor facts.

Release criteria:

All planned UI flows work in both themes and all target layouts. No material factual, privacy, enquiry, context or navigation failure remains in the reviewed cases. Any minor wording limitation is recorded rather than hidden behind an aggregate pass count. The production build and focused tests pass. Deployment completion and fresh live replies are verified. Screenshots, recordings and measured conversation results identify their version and environment.

## Reference material

- Data and reason-driven curiosity: https://www.startrek.com/en-un/news/twain-made-his-mark-on-star-trek
- TARS and practical wit: https://www.raspberrypi.com/news/go-interstellar-and-build-your-own-replica-tars-robot/
- K-2SO character profile: https://www.starwars.com/databank/k-2so-kay-tuesso
- Existing local personality contract: docs/vera-conversation-contract.md
- Existing model/panel findings: docs/qa/vera-panel-release-2026-11-11.md
