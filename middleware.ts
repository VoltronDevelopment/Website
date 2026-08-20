import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-constants";
import { verifySessionToken } from "@/lib/admin-session-token";

const WINDOW_MS = 60_000;
const MAX_INQUIRY_REQUESTS = 10;
const MAX_LOGIN_REQUESTS = 8;

type RateEntry = {
  count: number;
  reset: number;
};

const rateLimit = new Map<string, RateEntry>();

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function takeRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.reset) {
    rateLimit.set(key, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const user = await verifySessionToken(token);
  return Boolean(user);
}

/** Reject cross-site mutating admin requests (cookie CSRF mitigation). */
function isTrustedAdminMutation(request: NextRequest): boolean {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return true;
  }

  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return false;
  if (site === "same-origin" || site === "same-site" || site === "none") return true;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const host = request.headers.get("host");
    if (!host) return false;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    if (!isTrustedAdminMutation(request)) {
      return NextResponse.json({ ok: false, message: "Forbidden origin." }, { status: 403 });
    }
  }

  if (pathname === "/api/admin/login" && request.method === "POST") {
    const ip = clientIp(request);
    if (!takeRateLimit(`admin-login:${ip}`, MAX_LOGIN_REQUESTS)) {
      return NextResponse.json(
        { ok: false, message: "Too many login attempts. Try again in a minute." },
        { status: 429 }
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login")) {
    if (!(await hasValidAdminSession(request))) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Exact /admin has no page — always bounce to projects or login.
  if (pathname === "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = (await hasValidAdminSession(request)) ? "/admin/projects" : "/admin/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!(await hasValidAdminSession(request))) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (request.method !== "POST" || pathname !== "/api/inquiries") {
    return NextResponse.next();
  }

  const ip = clientIp(request);
  if (!takeRateLimit(`inquiry:${ip}`, MAX_INQUIRY_REQUESTS)) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/inquiries", "/api/admin/:path*", "/admin", "/admin/:path*"]
};
