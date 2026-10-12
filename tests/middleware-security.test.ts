import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { middleware } from "@/middleware";
import { createFounderToken, founderSessionSeconds } from "@/lib/founder-session.server";
import { founderSessionCookie } from "@/lib/founder-session-config";

function makeRequest(path: string, method: string, ip: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      "x-forwarded-for": ip,
      ...(cookie ? { cookie: `${founderSessionCookie}=${cookie}` } : {})
    }
  });
}

describe("Website middleware security controls", () => {
  it.each(["/", "/technology", "/ontology", "/intelligence", "/manufacturing", "/network", "/about", "/about/people-culture", "/about/voltron-commons", "/partner", "/technology/ontology", "/about/commons", "/admin/login"])("preserves access to %s", async path => {
    const now = vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-09T00:00:00Z"));
    try {
      const response = await middleware(makeRequest(path, "GET", "203.0.113.90"));
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    } finally { now.mockRestore(); }
  });
  it("serves the hold page anonymously and protects pages and inquiry APIs before launch", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-20T12:00:00Z"));
    try {
      const home = await middleware(makeRequest("/", "GET", "203.0.113.91"));
      expect(home.headers.get("x-middleware-rewrite")).toContain("/coming-soon");
      expect(home.headers.get("cache-control")).toContain("no-store");
      expect((await middleware(makeRequest("/technology", "GET", "203.0.113.92"))).headers.get("location")).toBe("http://localhost/");
      expect((await middleware(makeRequest("/api/inquiries", "POST", "203.0.113.93"))).status).toBe(423);
      expect((await middleware(makeRequest("/api/founder/login", "POST", "203.0.113.94"))).status).toBe(200);
    } finally { now.mockRestore(); }
  });
  it("allows a valid founder signature to reach the full site before launch", async () => {
    const previous = process.env.FOUNDER_SESSION_SECRET;
    process.env.FOUNDER_SESSION_SECRET = "test-session-secret-with-more-than-32-bytes";
    const now = vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-20T12:00:00Z"));
    try {
      const token = createFounderToken("omkar", Math.floor(Date.now() / 1000) + founderSessionSeconds);
      const response = await middleware(makeRequest("/technology", "GET", "203.0.113.95", token || undefined));
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toContain("no-store");
    } finally {
      now.mockRestore();
      if (previous === undefined) delete process.env.FOUNDER_SESSION_SECRET;
      else process.env.FOUNDER_SESSION_SECRET = previous;
    }
  });
  it("allows ten inquiry posts per client key and rejects the eleventh", async () => {
    const ip = "203.0.113.81";
    const now = vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-09T00:00:00Z"));

    try {
      for (let index = 0; index < 10; index += 1) {
        const response = await middleware(makeRequest("/api/inquiries", "POST", ip));
        expect(response.status).toBe(200);
      }

      const limited = await middleware(makeRequest("/api/inquiries", "POST", ip));
      expect(limited.status).toBe(429);
      await expect(limited.json()).resolves.toMatchObject({ ok: false });
    } finally {
      now.mockRestore();
    }
  });

  it("starts a fresh client window after the configured minute", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-09T00:00:00Z"));
    const ip = "203.0.113.83";

    try {
      for (let index = 0; index < 10; index += 1) {
        await middleware(makeRequest("/api/inquiries", "POST", ip));
      }
      expect((await middleware(makeRequest("/api/inquiries", "POST", ip))).status).toBe(429);

      now.mockReturnValue(Date.parse("2026-11-09T00:00:00Z") + 60_001);
      expect((await middleware(makeRequest("/api/inquiries", "POST", ip))).status).toBe(200);
    } finally {
      now.mockRestore();
    }
  });
});
