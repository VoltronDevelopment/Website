import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { founderSessionCookie } from "@/lib/founder-session-config";
import { launchAt } from "@/lib/launch";

const WINDOW_MS = 60_000;
const MAX_INQUIRY_REQUESTS = 10;
const PUBLIC_SITE_PATHS = new Set([
  "/",
  "/enter",
  "/technology",
  "/technology/ontology",
  "/ontology",
  "/intelligence",
  "/manufacturing",
  "/network",
  "/about",
  "/about/people-culture",
  "/about/commons",
  "/about/voltron-commons",
  "/partner",
]);

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

function privateResponse(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("Vary", "Cookie");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prelaunch = Date.now() < launchAt;

  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/founder/login" || pathname === "/api/founder/logout" || pathname === "/api/founder/session") {
      return prelaunch ? privateResponse(NextResponse.next()) : NextResponse.next();
    }
    if (prelaunch && (pathname === "/api/inquiries" || pathname.startsWith("/api/"))) {
      return privateResponse(NextResponse.json({ ok: false, message: "Inquiries open at launch." }, { status: 423 }));
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

  if (pathname.startsWith("/_next/") || /\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  if (!prelaunch) {
    if (pathname === "/coming-soon") return NextResponse.redirect(new URL("/", request.url));
    if (PUBLIC_SITE_PATHS.has(pathname) || pathname === "/admin" || pathname.startsWith("/admin/")) return NextResponse.next();
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/coming-soon") {
    return privateResponse(NextResponse.next());
  }
  if (PUBLIC_SITE_PATHS.has(pathname)) {
    if (request.cookies.has(founderSessionCookie)) return privateResponse(NextResponse.next());
    if (pathname === "/") return privateResponse(NextResponse.rewrite(new URL("/coming-soon", request.url)));
  }

  return privateResponse(NextResponse.redirect(new URL("/", request.url)));
}

export const config = {
  matcher: ["/:path*"]
};
