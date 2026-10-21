# Lattice navigation and brand entry

## Implemented experience

Home and Technology share one persistent canvas, WebGL renderer, logo texture and lighting environment. On eligible desktop navigation, the same seven cube identities interpolate between the approved closed and separated arrangements over 800ms. The central core appears as the gap opens; the logo moves to the Technology position and its connection grows underneath it. Orthographic viewing orientation stays fixed. The existing local logo blur remains active during the transition.

Text stays readable while a route loads. Once the destination commits, a brief inert, accessibility-hidden snapshot fades the old hero copy upward while the new copy enters. Navigation stays available. Loading feedback appears only when waiting exceeds 350ms.

Rapid navigation cancels the previous frame loop and retargets from the current lattice mixture. A new scene mounts into the same canvas after the transformation and releases the old route's objects. Common GPU resources persist until the shared experience unmounts.

Transition rectangles are stored relative to the frosted presentation, not the viewport. Every animation frame reads its current panel and destination bounds, so scroll remains aligned throughout the morph. Artwork is clipped against the presentation, sticky header and open menus. Outgoing copy is also attached to the panel and scrolls with it. No scroll locking is used.

## Behavior by situation

| Situation | Behavior |
| --- | --- |
| Home to Technology, or reverse, with a visible settled desktop hero | 800ms geometry transition |
| Mobile below 768px | Completed destination with a short fade |
| Reduced motion | Completed destination, no geometry transition |
| Data-saving preference | Short transition without the richer morph |
| Navigation from below the hero | Normal route change and restrained destination fade |
| First Home visit, including through the optional entry page | Approved full assembly timing |
| Direct Technology URL | Completed composition immediately |
| Browser back/forward | Native history and scroll restoration; completed composition |
| WebGL unavailable or lost | Local static SVG fallback |
| Other website artwork | Short opening dissolve; separate approved compositions |

Keyboard-triggered navigation focuses the destination heading with `preventScroll`. Modified link clicks, downloads, external URLs and anchor links retain normal browser behavior. Header and menu rectangles clip the floating artwork so geometry cannot paint across navigation popups.

## Brand entry card

`/enter` has a pearl/graphite glass card with 24px desktop corners and 16px mobile corners, a fine rim, 24px backdrop blur and one soft outer shadow. A darker matte backdrop frames it. There is no website header/footer. The existing pulse, rings, pixel grid, 17.2-second face sequence, manual theme/music controls and final clickable face are retained. Reduced-transparency and increased-contrast preferences provide an opaque card.

## Key files

- `components/navigation/LatticeExperience.tsx`: persistent canvas ownership, navigation coordination, focus, clipping and visibility.
- `components/navigation/lattice-transition.ts`: logical cube endpoints and transition eligibility.
- `components/navigation/lattice-resources.ts`: common GPU resource lifetime.
- `components/home/hero-renderer.js`: approved resting scenes and geometry interpolation.
- `components/navigation/lattice-experience.css`: restrained text/artwork transitions.
- `app/enter/entry.css`: entry presentation material and responsive framing.

The founder middleware and server-side route checks are unchanged. No new packages or framework migration were needed. The View Transition API is not a dependency of this implementation.
