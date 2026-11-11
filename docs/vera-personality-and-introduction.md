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

The shared aura cube is 72px on desktop, 68px on tablet and 62px on mobile, with a larger invisible hit area and clearance above the hero strip. The conversation header uses a 38px cube, an 18px VERA name and a quiet AI-guide descriptor. It retains the site’s Montserrat and semantic light/dark palette.

The introduction keeps typing available immediately. Three illustrated cards lead into platform, industry and manufacturing questions. Shaded cube studies form in sequence, then a brief connection travels between them. They settle after two cycles and respect reduced motion. The intro’s aura uses the same cube as the launcher and pending response. Pending copy reads “Connecting the ideas…”; the animation is decorative and does not claim a live reasoning trace.

The desktop panel is 448px wide, with a 720px expanded option. Mobile uses the existing keyboard-aware sheet. Introduction scroll starts at the top; conversation replies follow the existing reading-position controls. Minimize/reopen preserves drafts. Hidden panels pause their animations.

## Verification

Production build and focused retrieval/session tests pass. Browser checks cover 320px, 390px, 768px and 1440px widths, both themes, overflow, composer visibility, draft preservation and reduced motion. Real hosted conversation checks cover identity, limits, farewell, disagreement, concise follow-up, humour, readiness and enquiry preparation. Screenshots and measured responses are local verification artifacts, not evidence of deployment.
