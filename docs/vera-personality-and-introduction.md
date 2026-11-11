# Vera — conversational and visual identity

Vera is Voltron’s conversational AI guide: clear, attentive, curious and independently thoughtful. A forward-looking character comes from connecting ideas and testing assumptions, not synthetic emotion or science-fiction language. Lila’s attentive turn-taking, proportionate depth and respect for the visitor informed this treatment; her literary persona, modes and artwork were not copied.

## Conversational behaviour

- Answer the intent before describing the company. Greetings and thanks can be one sentence.
- Follow the current thread; avoid repeating introductions and unnecessary summaries.
- Explain with everyday language, scaling detail to the question. Ask one clarifying question only when it changes the answer.
- Challenge assumptions respectfully and distinguish evidence, inference and possibility.
- Allow understated humour and ordinary conversation without pushing an enquiry.
- Use English only. Preserve readiness qualifications and protect proprietary implementation details.
- Never claim consciousness, a connection to a visitor’s factory, unconfirmed actions or memory outside the supplied chat.

Runtime authority: `lib/vectra/skills.ts`. Model replies remain probabilistic; tests sample behaviour rather than certify every possible conversation.

## Visual treatment

Vera uses a dedicated fluid material configuration rather than any specialist agent identity. The launcher keeps its established desktop/tablet/mobile size. The header cube is 48px on desktop, 44px on mobile and 40px on the narrowest phones. Its fine enclosure and internal cyan-blue illumination share rendering utilities with the site. Question illustrations use lightweight shaded faces with three distinct tonal studies and a slow inner light; they do not reuse agent auras. A faint cube watermark occupies unused chat space.

The separate Meet Vera view presents the large aura cube, the line Let's see what connects, a short invitation, and a Begin a conversation arrow. Chat has a back arrow to the introduction. The conversation stays mounted across navigation so drafts, pending replies, enquiries and reading state survive. The last view survives minimize/reopen. The introduction entrance plays only on the first open and respects reduced motion and Still mode.

The header identity cube is a settings control with a model selector and Ambient/Still action. Escape closes settings before the parent window. The header cube's place is reserved across views. Models share history and evidence. Auto responds to the current task rather than switching permanently after a fixed number of messages. Greetings and simple identity turns use no retrieval sources. A transient alternate model is disclosed beside its reply.

Vera's dedicated palette combines cobalt/indigo depth with cyan moving light and pearl edges. Static theme artwork is captured from the same renderer and camera. Question studies remain independent decorations. The personality adds composed curiosity and brief situational wit, with explicit care not to assign blame from incomplete emotional accounts. Enquiry summaries avoid blank form fields.

The desktop panel is 448px wide, with a 720px expanded option. Mobile uses the existing keyboard-aware sheet. Introduction scroll starts at the top; conversation replies follow the existing reading-position controls. Minimize/reopen preserves drafts. Hidden panels pause their animations.

## Verification

Production build and focused retrieval/session tests pass. Browser checks cover 320px, 390px, 768px and 1440px widths, both themes, overflow, composer visibility, draft preservation and reduced motion. Real hosted conversation checks cover identity, limits, farewell, disagreement, concise follow-up, humour, readiness and enquiry preparation. Screenshots and measured responses are local verification artifacts, not evidence of deployment.
