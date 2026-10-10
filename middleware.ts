import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WINDOW_MS = 60_000;
const MAX_INQUIRY_REQUESTS = 10;

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/api/inquiries"]
};
