import { NextResponse } from "next/server";
import { founderSessionCookie } from "@/lib/founder-session-config";

function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const expectedHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  try { return Boolean(origin) && new URL(origin!).host === expectedHost; } catch { return false; }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store, private" } });
  response.cookies.set(founderSessionCookie, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
