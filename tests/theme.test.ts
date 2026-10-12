import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { resolveTheme, themeBootstrap } from "@/lib/theme";

describe("Color theme", () => {
  const prelaunchDate = class extends Date {
    static now() { return Date.parse("2026-10-20T12:00:00Z"); }
  };
  const launchedDate = class extends Date {
    static now() { return Date.parse("2026-11-09T12:00:00Z"); }
  };
  it.each([
    ["light", true, "light"], ["dark", false, "dark"],
    [null, true, "dark"], [null, false, "light"],
    ["invalid", true, "dark"], ["invalid", false, "light"],
  ])("resolves saved %s with system dark %s to %s", (saved, systemDark, expected) => {
    expect(resolveTheme(saved, Boolean(systemDark))).toBe(expected);
  });
  it.each([false, true])("applies the system preference before paint with blocked storage (dark=%s)", dark => {
    const document = { documentElement: { dataset: {} as Record<string, string> } };
    runInNewContext(themeBootstrap, { Date: prelaunchDate, document, location: { pathname: "/technology" }, matchMedia: () => ({ matches: dark }), localStorage: { getItem: () => { throw new Error("Storage blocked"); } } });
    expect(document.documentElement.dataset.theme).toBe(dark ? "dark" : "light");
  });
  it("applies a saved explicit preference before paint", () => {
    const document = { documentElement: { dataset: {} as Record<string, string> } };
    runInNewContext(themeBootstrap, { Date: prelaunchDate, document, location: { pathname: "/technology" }, matchMedia: () => ({ matches: false }), localStorage: { getItem: () => "dark" } });
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
  it("starts the pre-launch page in light mode despite a saved dark preference", () => {
    const document = { documentElement: { dataset: {} as Record<string, string> } };
    runInNewContext(themeBootstrap, { Date: prelaunchDate, document, location: { pathname: "/" }, matchMedia: () => ({ matches: true }), localStorage: { getItem: () => "dark" } });
    expect(document.documentElement.dataset.theme).toBe("light");
  });
  it("honors the saved theme on the home page after launch", () => {
    const document = { documentElement: { dataset: {} as Record<string, string> } };
    runInNewContext(themeBootstrap, { Date: launchedDate, document, location: { pathname: "/" }, matchMedia: () => ({ matches: false }), localStorage: { getItem: () => "dark" } });
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
  it("retains the light fallback without browser preference APIs", () => {
    const document = { documentElement: { dataset: {} as Record<string, string> } };
    runInNewContext(themeBootstrap, { Date: prelaunchDate, document, location: { pathname: "/technology" } });
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
