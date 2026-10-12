import { createHmac, timingSafeEqual } from "node:crypto";
import { founderSessionSeconds } from "./founder-session-config";
export { founderSessionCookie, founderSessionSeconds } from "./founder-session-config";

function sessionSecret(): string | null {
  const secret = process.env.FOUNDER_SESSION_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}

export function founderCredentials(): Map<string, { salt: Buffer; digest: Buffer }> {
  const result = new Map<string, { salt: Buffer; digest: Buffer }>();
  for (const item of (process.env.FOUNDER_CREDENTIALS || "").split(",")) {
    const [username, saltHex, digestHex, extra] = item.split(":");
    if (!username || !saltHex || !digestHex || extra !== undefined) continue;
    if (!/^[a-z0-9]{3,32}$/i.test(username) || !/^[a-f0-9]{32}$/i.test(saltHex) || !/^[a-f0-9]{64}$/i.test(digestHex)) continue;
    result.set(username.toLowerCase(), { salt: Buffer.from(saltHex, "hex"), digest: Buffer.from(digestHex, "hex") });
  }
  return result;
}

export function createFounderToken(username: string, expiresAt: number): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = `${username}.${expiresAt}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyFounderToken(token: string | undefined, now = Date.now()): string | null {
  const secret = sessionSecret();
  if (!secret || !token) return null;
  const [username, expiryText, signature, extra] = token.split(".");
  if (!username || !expiryText || !signature || extra !== undefined || !/^[a-z0-9]{3,32}$/i.test(username)) return null;
  const expiresAt = Number(expiryText);
  const nowSeconds = Math.floor(now / 1000);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowSeconds || expiresAt > nowSeconds + founderSessionSeconds + 60) return null;
  const expected = createHmac("sha256", secret).update(`${username}.${expiresAt}`).digest();
  let actual: Buffer;
  try { actual = Buffer.from(signature, "base64url"); } catch { return null; }
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? username.toLowerCase() : null;
}
