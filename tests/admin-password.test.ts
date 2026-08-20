import { describe, expect, it } from "vitest";
import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/admin-password";

describe("admin-password", () => {
  it("hashes and verifies passwords", () => {
    const stored = hashPassword("voltron-admin");
    expect(isHashedPassword(stored)).toBe(true);
    expect(verifyPassword("voltron-admin", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("supports legacy plaintext migration values", () => {
    expect(verifyPassword("legacy", "legacy")).toBe(true);
    expect(verifyPassword("legacy", "other")).toBe(false);
  });
});
