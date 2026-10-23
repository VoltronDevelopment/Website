import type { GlassFace } from "./lattice-materials";

/** Shared enclosure presentation for the homepage's capabilities and lot snapshots. */
export const capabilityCubeCamera = [12, 9.6, 14] as const;
export const capabilityGlassVisibility = (kind: GlassFace) => kind === "front" ? .26 : kind === "rear" || kind === "bottom" ? .3 : .36;
export const capabilityEdgeWidth = { front: .85, rear: 1.15, glow: [5.5, 2.8] } as const;
