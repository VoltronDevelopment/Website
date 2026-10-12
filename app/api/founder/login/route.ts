import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { launchAt } from "@/lib/launch";
import { createFounderToken, founderCredentials, founderSessionCookie, founderSessionSeconds } from "@/lib/founder-session.server";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetsAt: number }>();

function ipFor(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function response(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, private", "Vary": "Cookie, Origin" } });
}

function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const expectedHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  try { return Boolean(origin) && new URL(origin!).host === expectedHost; } catch { return false; }
}

export async function POST(request: Request) {
  if (Date.now() >= launchAt) return response({ ok: false, message: "Founder preview sign-in has closed." }, 404);
  if (!hasSameOrigin(request)) return response({ ok: false, message: "Sign-in request could not be verified." }, 403);

  const now = Date.now();
  const ip = ipFor(request);
  const current = attempts.get(ip);
  if (current && now < current.resetsAt && current.count >= MAX_ATTEMPTS) return response({ ok: false, message: "Too many sign-in attempts. Please wait a minute and try again." }, 429);
  attempts.set(ip, !current || now >= current.resetsAt ? { count: 1, resetsAt: now + WINDOW_MS } : { ...current, count: current.count + 1 });

  if (!process.env.FOUNDER_SESSION_SECRET || founderCredentials().size < 2) return response({ ok: false, message: "Founder sign-in is not configured." }, 503);

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 4096) return response({ ok: false, message: "Sign-in details are too large." }, 413);
    body = JSON.parse(rawBody);
  } catch { return response({ ok: false, message: "Enter your founder sign-in details." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return response({ ok: false, message: "Enter your founder sign-in details." }, 400);

  const { username, password } = body as { username?: unknown; password?: unknown };
  if (typeof username !== "string" || typeof password !== "string" || password.length > 256) return response({ ok: false, message: "Those sign-in details did not match." }, 401);
  const credential = founderCredentials().get(username.trim().toLowerCase());
  const salt = credential?.salt || Buffer.alloc(16);
  const expected = credential?.digest || Buffer.alloc(32);
  const actual = scryptSync(password, salt, 32, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  if (!credential || !timingSafeEqual(actual, expected)) return response({ ok: false, message: "Those sign-in details did not match." }, 401);

  const expiresAt = Math.floor(now / 1000) + founderSessionSeconds;
  const token = createFounderToken(username.trim().toLowerCase(), expiresAt);
  if (!token) return response({ ok: false, message: "Founder sign-in is not configured." }, 503);

  const result = response({ ok: true }, 200);
  result.cookies.set(founderSessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: founderSessionSeconds
  });
  return result;
}
