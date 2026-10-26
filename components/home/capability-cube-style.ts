import type { GlassFace } from "./lattice-materials";

/** Shared enclosure presentation for the homepage's capabilities and lot snapshots. */
export const capabilityCubeCamera = [12, 9.6, 14] as const;
/** Camera-space dimensions shared by the responsive loading image and live component. */
export function capabilityProjection(){
  const [x,y,z]=capabilityCubeCamera,horizontal=Math.hypot(x,z),length=Math.hypot(x,y,z);
  return {width:1.65*(Math.abs(z)+Math.abs(x))/horizontal,
    height:1.65*((Math.abs(x*y)+Math.abs(z*y))/(length*horizontal)+horizontal/length)};
}
export const capabilityGlassVisibility = (kind: GlassFace) => kind === "front" ? .26 : kind === "rear" || kind === "bottom" ? .4 : .58;
export const capabilityEdgeWidth = { front: .85, rear: 1.15, glow: [5.5, 2.8] } as const;
