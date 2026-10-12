import { describe, expect, it } from "vitest";
import { artwork, readBrandArtwork } from "@/lib/brand-assets";
describe("Approved brand artwork", () => {
  it.each(Object.values(artwork))("resolves the supplied light family %s", family => {
    const svg = readBrandArtwork(family);
    expect(svg).toMatch(/^<svg\s/);
    expect(svg).not.toMatch(/<script\b|\son\w+=|\sid=/);
  });
  it.each(Object.values(artwork))("resolves the supplied dark family %s", family => {
    const svg = readBrandArtwork(family, true, "dark");
    expect(svg).toMatch(/^<svg\s/);
    expect(svg).not.toMatch(/<script\b|\son\w+=|\sid=/);
    expect(svg).not.toBe(readBrandArtwork(family, true, "light"));
  });
  it("uses the supplied family's measured drawing bounds", () => {
    expect(readBrandArtwork(artwork.core, true)).toContain('viewBox="123 66 233 261"');
  });
  it("does not render a broken image for an unavailable family", () => {
    expect(readBrandArtwork("not-supplied-yet")).toBeNull();
  });
  it("does not substitute existing artwork when a missing family requests cropping", () => {
    expect(readBrandArtwork("not-supplied-yet", true)).toBeNull();
    expect(readBrandArtwork("not-supplied-yet", true, "dark")).toBeNull();
  });
});
