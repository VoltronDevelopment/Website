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

The introduction says "I'm Vera" and reveals its supporting line and three question cards with overlapping delays. The header cube settles first. Space is reserved throughout and typing remains immediately available. There is no duplicate cube beside the welcome heading. Reduced motion and Vera's Still setting show the settled composition immediately. Minimize/reopen preserves the current chat.

A compact model selector offers Auto, GPT-5.4 mini and GPT-6 Luna. Preferences persist locally without resetting history or limits. Auto uses Luna for everyday conversation and mini for synthesis, long questions and longer threads. This is an initial routing policy, not a claim that one model is universally better. A temporary provider 429/5xx may trigger one alternate model attempt within the same response deadline. The actual fallback model is disclosed beside its reply. Both models use identical personality, public evidence, English-only and enquiry rules.

The desktop panel is 448px wide, with a 720px expanded option. Mobile uses the existing keyboard-aware sheet. Introduction scroll starts at the top; conversation replies follow the existing reading-position controls. Minimize/reopen preserves drafts. Hidden panels pause their animations.

## Verification

Production build and focused retrieval/session tests pass. Browser checks cover 320px, 390px, 768px and 1440px widths, both themes, overflow, composer visibility, draft preservation and reduced motion. Real hosted conversation checks cover identity, limits, farewell, disagreement, concise follow-up, humour, readiness and enquiry preparation. Screenshots and measured responses are local verification artifacts, not evidence of deployment.
