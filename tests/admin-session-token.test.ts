import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/admin-session-token";

describe("admin-session-token", () => {
  it("creates and verifies signed session tokens", async () => {
    const secret = "test-admin-session-secret-0123456789";
    const token = await createSessionToken("admin@voltron.example", secret);
    await expect(verifySessionToken(token, secret)).resolves.toBe("admin@voltron.example");
  });

  it("rejects tampered tokens", async () => {
    const secret = "test-admin-session-secret-0123456789";
    const token = await createSessionToken("admin@voltron.example", secret);
    const tampered = `${token}x`;
    await expect(verifySessionToken(tampered, secret)).resolves.toBeNull();
  });
});
