import { founderSessionSeconds } from "./founder-session-config";

function decodeBase64Url(value: string): Uint8Array | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function verifyFounderTokenEdge(token: string | undefined, now = Date.now()): Promise<string | null> {
  const secret = process.env.FOUNDER_SESSION_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32 || !token) return null;
  const [username, expiryText, signature, extra] = token.split(".");
  if (!username || !/^[a-z0-9]{3,32}$/i.test(username) || !expiryText || !signature || extra !== undefined) return null;
  const expiresAt = Number(expiryText);
  const nowSeconds = Math.floor(now / 1000);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowSeconds || expiresAt > nowSeconds + founderSessionSeconds + 60) return null;
  const signatureBytes = decodeBase64Url(signature);
  if (!signatureBytes) return null;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(`${username}.${expiresAt}`));
    return valid ? username.toLowerCase() : null;
  } catch {
    return null;
  }
}
