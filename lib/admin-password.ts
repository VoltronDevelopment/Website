import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const PREFIX = "scrypt";
const KEYLEN = 64;

/** Create a stored credential of the form `scrypt$<salt>$<hash>` (base64url). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, KEYLEN, { N: 16384, r: 8, p: 1 }).toString("base64url");
  return `${PREFIX}$${salt}$${hash}`;
}

/**
 * Verify a password against a stored value.
 * Supports scrypt hashes and legacy plaintext (migration).
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith(`${PREFIX}$`)) {
    const parts = stored.split("$");
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const expected = parts[2];
    if (!salt || !expected) return false;
    const actual = scryptSync(password, salt, KEYLEN, { N: 16384, r: 8, p: 1 }).toString("base64url");
    const a = Buffer.from(actual);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  const a = Buffer.from(stored);
  const b = Buffer.from(password);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isHashedPassword(stored: string): boolean {
  return stored.startsWith(`${PREFIX}$`);
}
