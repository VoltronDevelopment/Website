/**
 * Edge- and Node-safe admin session tokens (Web Crypto HMAC-SHA256).
 * Used by middleware and by lib/admin-auth.ts.
 */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  user: string;
  exp: number;
};

export function resolveSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_SESSION_SECRET is required in production.");
    }
    return "dev-admin-session-secret-change-me";
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const b64 = (value + pad).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(mac));
}

export async function createSessionToken(
  user: string,
  secret: string = resolveSessionSecret()
): Promise<string> {
  const payload: SessionPayload = {
    user,
    exp: Date.now() + SESSION_TTL_MS
  };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSign(encoded, secret);
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret?: string
): Promise<string | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  let resolvedSecret: string;
  try {
    resolvedSecret = secret ?? resolveSessionSecret();
  } catch {
    return null;
  }

  try {
    const expected = await hmacSign(encoded, resolvedSecret);
    const a = fromBase64Url(signature);
    const b = fromBase64Url(expected);
    if (!timingSafeEqualBytes(a, b)) return null;

    const json = new TextDecoder().decode(fromBase64Url(encoded));
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload.user || typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }
    return payload.user;
  } catch {
    return null;
  }
}
