import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { middleware } from "@/middleware";

function makeRequest(path: string, method: string, ip: string) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      "x-forwarded-for": ip
    }
  });
}

describe("Website middleware security controls", () => {
  it("allows ten inquiry posts per client key and rejects the eleventh", async () => {
    const ip = "203.0.113.81";

    for (let index = 0; index < 10; index += 1) {
      const response = await middleware(makeRequest("/api/inquiries", "POST", ip));
      expect(response.status).toBe(200);
    }

    const limited = await middleware(makeRequest("/api/inquiries", "POST", ip));
    expect(limited.status).toBe(429);
    await expect(limited.json()).resolves.toMatchObject({ ok: false });
  });

  it("starts a fresh client window after the configured minute", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const ip = "203.0.113.83";

    try {
      for (let index = 0; index < 10; index += 1) {
        await middleware(makeRequest("/api/inquiries", "POST", ip));
      }
      expect((await middleware(makeRequest("/api/inquiries", "POST", ip))).status).toBe(429);

      now.mockReturnValue(1_060_001);
      expect((await middleware(makeRequest("/api/inquiries", "POST", ip))).status).toBe(200);
    } finally {
      now.mockRestore();
    }
  });
});
