import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-constants";
import { verifyPassword } from "@/lib/admin-password";
import {
  SESSION_TTL_MS,
  createSessionToken as createToken,
  resolveSessionSecret,
  verifySessionToken as verifyToken
} from "@/lib/admin-session-token";

export { ADMIN_SESSION_COOKIE, SESSION_TTL_MS };

export async function createSessionToken(user: string): Promise<string> {
  return createToken(user, resolveSessionSecret());
}

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  return verifyToken(token);
}

export function parseAdminCredentials(): Map<string, string> {
  const raw = process.env.ADMIN_CREDENTIALS?.trim();
  const map = new Map<string, string>();

  if (raw) {
    for (const entry of raw.split(",")) {
      const colon = entry.indexOf(":");
      if (colon <= 0) continue;
      const user = entry.slice(0, colon).trim().toLowerCase();
      const pass = entry.slice(colon + 1).trim();
      if (user && pass) map.set(user, pass);
    }
    return map;
  }

  const fallback = process.env.ADMIN_PASSWORD?.trim();
  if (fallback) {
    map.set("admin", fallback);
    map.set("omkar", fallback);
  } else if (process.env.NODE_ENV !== "production") {
    map.set("admin", "voltron");
    map.set("omkar", "voltron");
  }

  return map;
}

export function verifyLogin(username: string, password: string): string | null {
  const creds = parseAdminCredentials();
  const expected = creds.get(username.trim().toLowerCase());
  if (!expected) return null;
  if (!verifyPassword(password, expected)) return null;
  return username.trim();
}

export async function getSessionUser(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(token: string) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000
  };
}
