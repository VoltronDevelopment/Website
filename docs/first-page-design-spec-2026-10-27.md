# First page design spec

Date: 27 October 2026
Status: for review
Scope: the home page (`app/page.tsx`) from the hero to the philosophy section.

## Goals

1. The page scrolls smoothly, vertically and horizontally, on desktop and mobile.
2. The hero cube moves exactly with the page while scrolling.
3. Each application card plays one clean animation, inside a centered, readable carousel with smooth parallax.
4. The ten-year roadmap reads as a journey: a road on the left, a milestone card on the right.
5. Every glass surface follows one recipe and one set of radii.
6. The page keeps its design DNA: pearl and smoked glass, Montserrat, blue `#246bd4` (dark `#78b0ff`), ink `#132a42`, the existing header and background.

## Out of scope

- The navigation, footer and the other site pages.
- New dependencies. The work stays on Next.js 15, React 19 and vanilla Three.js.
- The page's section order: hero, applications, Connected Lot, Alpha, roadmap, philosophy.

## Already done (27 October)

- The cube is 10% smaller.
- The dividing lines close when the cube is solved, so each face reads as one tile. They open again only while the layers turn.
- The fourth face reads "Connected intelligence".
- The cube bodies use the previous hero's glass: the pearl top, the softbox reflection bands and the fresnel rim.

---

## 1. Scroll foundation

### Findings

- The hero canvas lives in a `position:fixed` stage outside the page (`components/navigation/LatticeExperience.tsx`, `lattice-experience.css`). A scroll listener re-positions it with `left`/`top` on the next animation frame. The page scrolls on the compositor, so the cube trails the page by one frame or more.
- `.site-presentation` carries `backdrop-filter: blur(7px)`. A `body:has(canvas[data-render-quality])` rule raises it to 14–20px. Behind it, `.lattice-atmosphere` runs infinite 21s transform animations, so the page-sized blur is recalculated every frame, including at rest.
- `body:has(.site-presentation)` sets `background-attachment: fixed`, which repaints the background on scroll.
- The carousel scroll handler is unthrottled (see section 3).

### Design

1. **The hero canvas scrolls with the page.** At rest on the home page, the lattice stage is placed inside `.home-lattice-art` (`position:absolute; inset:0`), so the cube moves in the page's own scroll layer. The fixed stage is used only while a route morph runs. Once a morph finishes, the stage returns to the slot. The shared renderer, the morph API and the poster fallback stay the same.
2. **Blur budget.** Backdrop blur is allowed only on surfaces that are still and smaller than the viewport: the header, the focused card and the roadmap card. The page shell gets a pre-blended translucent fill in place of `backdrop-filter`. The `body:has(...)` blur override is removed.
3. **Atmosphere.** `.lattice-atmosphere` animations pause while the page is scrolling (set a `data-scrolling` attribute on `html`, cleared 150ms after the last scroll event) and while it is off-screen. On the hero, the large atmosphere cube fades to a lower opacity so it doesn't compete with the hero cube.
4. **Background.** Replace `background-attachment: fixed` with a fixed pseudo-element layer on `body::before`, which the compositor can move without repainting.
5. **Anchors.** Add `scroll-margin-top` equal to the header height plus 16px on every home section, so in-page links land with the heading visible.
6. **One scroll scheduler.** A small shared module (`lib/scroll-frame.ts`) runs one passive scroll listener. It reads `scrollY` once per animation frame and notifies subscribers. The carousel, the roadmap, the header and the lattice stage all subscribe to it, so layout reads and writes are grouped once per frame.

### Done when

- Recorded with the Performance panel, scrolling the home page shows no long tasks over 16ms on desktop during the carousel and roadmap.
- The cube's edge and the hero copy stay aligned during a fast scroll, frame by frame.
- The header stays the only element using a page-wide blur.

---

## 2. Hero

### Findings

- The three phrases appear four times: in the subheading, the principle strip, the cube faces and the hero tagline.
- The scramble starts 0.4s after load, so most visitors meet a broken logo first.

### Design

1. **The cube sequence:** the solved logo tile holds for 1.2s, then the cube scrambles for about 5.5s, solves in reverse for the same time, closes its dividing lines and turns slowly. The scramble and solve timings stay as tested in `tests/home-cube.test.ts`, and the hold grows from 0.4s to 1.2s.
2. **Copy:** the subheading becomes one sentence about the offer. Proposed: "Connected systems for production, quality and machine records, built and proven on our own factory floor." The principle strip and the cube faces keep the three phrases.
3. **Reduced motion and static mode:** show the solved cube as a still. Generate a new poster from the cube at `?hero-time=12.5` in both themes, replacing the old lattice poster.

### Done when

- Opening the page shows the solved logo first.
- The reduced-motion poster matches the live cube.

---

## 3. Applications carousel

### Findings

- **Two particle waves at once on V-AI:** the 2D ribbon canvas and the WebGL points wave run together.
- **The SVG-to-3D hand-off:** every card can start as an SVG animation and switch to the 3D version partway through the story. The 3D version waits in the idle queue while the hero renders, then takes over at the current story time.
- **Three motions on each card:** the arc transform, the layer shift (`--layer-front` / `--layer-back`) and the camera move inside the 3D scene.
- **A transition fights the per-frame motion:** on V-Twin, a 0.4s CSS transition on `--twin-y` competes with values written every frame, so the carrier smears.
- **Too much work per scroll event:** the handler writes transforms, reads canvas rects and renders up to four WebGL scenes.
- **Five WebGL contexts in total:** the four cards plus the hero.
- **Blur on moving cards:** `backdrop-filter` sits on cards that move every frame.
- **The pin releases early:** progress ignores the 88px sticky offset, so V-MO doesn't settle in the center.
- **Layout:** the group sits right of center, neighbouring cards cover each other's text, and the heading scrolls away while the cards stay pinned.

### Design

**Structure**
- The section heading, the four cards and a row of progress dots form one pinned unit. The stage is `100vh × 4` tall on desktop.
- Progress is `(scrollY − stageTop + headerOffset) / (stageHeight − pinHeight)`, clamped to 0..1 and mapped to positions 0..3. The pin and the progress use the same offset.

**Arc**
- The focused card is centered: 480px wide (`min(480px, 40vw)`), with a 4:5 aspect ratio.
- Each side card is placed by its distance from focus `d`:
  - `translateX(d × 78%)`
  - `rotateY(−d × 10deg)`
  - `scale(1 − |d| × 0.14)`
  - `translateZ(−|d| × 80px)`
- Cards with `|d| > 1.6` fade to 0. With these values, side cards show about 64px beside the focused card and never cover its text.
- Motion is driven from the scroll position with a light spring (critical damping, around 120ms settle), so the arc glides without overshooting.

**Parallax**
- There is one parallax: inside each card, the artwork moves against the text by `d × 18px`.
- The WebGL camera stays still.
- The layer-shift properties are removed from the header, the caption and the state row.

**One animation path per card**
- Desktop with WebGL: a still poster frame of the 3D scene shows until the 3D scene is ready, then fades to it over 200ms. The SVG layer is removed from the DOM.
- Mobile, reduced motion, or no WebGL: only the SVG plays. No 3D canvas mounts.
- The 2D ribbon canvas is removed. The particle wave lives only in the 3D scene, and only on the cards whose stories need it (V-AI, V-MO).
- A card's story starts when it becomes the focused card (`|d| < 0.15`) and pauses when it leaves focus.

**Rendering**
- One shared `WebGLRenderer` draws the visible cards into their rectangles using the scissor test, on one canvas behind the card layer. That brings the page to two contexts: the hero and the carousel.
- Rendering happens once per animation frame, only for cards with `|d| ≤ 1.2`.

**Card anatomy (all four the same)**
- Header row: the product name (V-MES), a concept tag on the right, and a one-line kind label underneath.
- An artwork area at 16:10.
- One status row: a dot, the current step and a small progress bar.
- One sentence.
- One action button, aligned to the bottom right.
- Spacing on a 4px grid: 24px padding, 16px between blocks.
- Two pearl cards and two smoked cards, alternating, as before.

**Glass**
- Cards use the glass-card recipe in section 6, with no backdrop blur while moving. Only the focused card gets an 8px blur, after the arc has been still for 150ms.

**Mobile**
- Native horizontal scroll with `scroll-snap-type: x mandatory`.
- Cards are 82vw wide, with no 3D transforms.
- The dots and tabs follow the snapped card through IntersectionObserver.

**Accessibility**
- The tabs work as a tablist: arrow keys move focus, and Enter scrolls to that card.
- Tabs follow the scroll position.

### Done when

- Each card shows one animation, from start to finish.
- On a 1440×900 and a 1920×1080 viewport, the focused card's text is fully visible at every progress value, and all four cards reach the center while pinned.
- Scrolling the carousel holds 60fps on desktop, measured with the Performance panel.

---

## 4. Connected Lot

### Findings

- Two step selectors are stacked: the four stations above the artwork, and five record steps (including Human Review) underneath.
- `lot-story.css` and `home-surfaces.css` still style the earlier tile markup.

### Design

1. Keep one selector with five steps: Receive, Process, Verify, Human review and Dispatch. It drives both the 3D lot story and the caption card.
2. Under the selector, one glass caption card shows the step's title, a sentence and its evidence state (Pending, In progress or Recorded).
3. Remove the second selector and the unused tile CSS. The `data-lot-story-anchor` elements stay, for 3D placement.

### Done when

- There is one selector on desktop and on mobile.
- The 3D scene and the caption update together.

---

## 5. Ten-year roadmap

### Findings

- The scene renders only during a change, so it can show blank.
- The active tab, the highlighted tick and the text can disagree. For example, "Year 5" is highlighted while the text shows Years 1–2.
- The "cube" is an HTML icon sliding along the tick row.
- All five milestones are stacked as long text.

### Design

**Layout on desktop**
- The section pins for five viewport heights.
- The left 60% is the stage; the right 40% is the milestone card, centered vertically.

**Stage (WebGL, one renderer)**
- **The road:** an isometric road that runs from the front left to the back right, made of glass slabs with a soft blue edge line.
  - Ten year markers sit on the road as small raised tiles numbered 1 to 10.
  - Five milestone gates span the road at years 2, 4, 5, 7 and 10. Each gate is a thin glass arch.
- **The cube:** the glass cube travels along the road and hops from year to year. Each hop lasts 180ms with a small arc and a soft landing squash.
  - Years behind the cube stay lit in the milestone colour; years ahead stay pearl.
  - The cube's tint follows the current milestone.
- **The structure at each gate:**
  - Gate 1 places one cell. Gate 2 grows it to four. Gate 3 grows it to eight with one shared core.
  - Gates 4 and 5 raise the globe mesh behind the road. Great-circle particle arcs appear at gate 5.
  - Growth uses the existing sheet-wave particle deposit, and runs only while the step changes.
- **The camera:** it follows the cube along the road with a slow ease, so the active gate stays in the middle third of the stage.
- **Rendering:** the scene renders every frame while the section is on screen and the journey is moving, then holds one final frame. It is never blank.

**The milestone card (HTML, glass-card recipe)**
- Contents: the years label (for example "Years 3–4"), the title, one sentence, four evidence points in two columns, a divider, and "Readiness to advance" with its gate sentence.
- A row of five small dots at the bottom shows which milestone is active.
- When the cube reaches a new gate, the card's content slides out by 16px and fades over 160ms, and the new content slides in from the opposite side over 220ms. The card's frame stays in place and its height animates to fit.
- Its accent line takes the milestone colour.

**Driving the journey**
- Scroll progress maps to a position from year 1 to year 10.
- The cube hops toward that year one step at a time, so a fast scroll still shows every year passing.
- Clicking a gate or a year marker scrolls to that year's position.
- One state value, `activeYear`, drives the stage, the card and the dots, so they always agree.

**Mobile**
- The stage sits on top at 56vh, sticky, with the card below it.
- The card swaps as the cube passes each gate.

**Reduced motion**
- A still road with the cube at the selected milestone, and the card with tab-style gate buttons.

**Data**
- `lib/voltron-roadmap.ts` keeps its five entries and gains each gate's year (`gateYear`) and accent colour. `roadmapVisualState` stays as the source of the cell count and the globe state.

### Done when

- Scrolling the section moves the cube through all ten years, and the card shows each of the five milestones in turn.
- The stage, the card and the dots always show the same milestone.
- The stage never shows blank, in both themes.

---

## 6. Glass system

### Findings

- Five radii are in use: 24, 16, 12, 10 and 8px.
- `--card-*` tokens are defined twice with different values.
- Glass rules target markup that is no longer rendered: `.factory-system` and `.lot-story-tiles`.
- The application cards define their own palette.

### Design

Tokens live in one place (`app/home-surfaces.css`, top):

| Token | Light | Dark |
|---|---|---|
| `--glass-fill` | `rgba(244,248,251,.72)` | `rgba(16,24,32,.66)` |
| `--glass-fill-smoked` | `rgba(19,42,66,.82)` | `rgba(8,16,24,.82)` |
| `--glass-edge` | `rgba(255,255,255,.7)` top, `rgba(36,107,212,.14)` sides | `rgba(120,176,255,.22)` |
| `--glass-shadow` | `0 18px 48px rgba(19,42,66,.14)` | `0 18px 48px rgba(0,0,0,.42)` |
| `--radius-shell` / `--radius-card` / `--radius-control` | 24px / 16px / 10px | same |

**The glass-card recipe**
- The fill.
- A 1px inner top highlight.
- A hairline side edge.
- The shadow.
- An 8px blur, only when the card is still.

**Where it applies**
- The application cards, the Lot caption card and the roadmap milestone card.
- Controls (tabs, selectors, gate buttons) use `--radius-control`, with the pressed state as a filled pearl or smoked chip.
- Remove the duplicate tokens and the unused rules listed above.

---

## 7. Verification

For each section, check in the browser, light and dark, at 1920×1080, 1440×900, 768×1024 and 390×844:

- A screenshot at the key states (hero at 0s, 3s and 12.5s; carousel at positions 0, 1.5 and 3; roadmap at years 1, 5 and 10).
- A recording in the Performance panel of a full-page scroll.
- Reduced motion.
- Keyboard use of the carousel tabs, the Lot selector and the roadmap gates.
- The existing tests pass (`tests/home-cube.test.ts`, `tests/home-motion.test.ts`, `tests/home-glass.test.ts`, `tests/home-chamber.test.ts`), plus new unit tests for:
  - carousel progress with the header offset
  - the roadmap's year-to-milestone mapping
  - the roadmap's hop sequence

## Build order

1. The scroll foundation (section 1).
2. The applications carousel (section 3).
3. The roadmap journey (section 5).
4. The Connected Lot merge and the glass system (sections 4 and 6).
5. The hero copy and hold refinements (section 2).

Each step ends with the verification in section 7 for the sections it touches.

## Open questions

1. The proposed hero subheading in section 2, step 2: keep it, or provide your own wording?
2. The roadmap gate years: are 2, 4, 5, 7 and 10 right, as the last year of each milestone?
3. Should the carousel's focused card show a small "1 / 4" counter beside the progress dots?
