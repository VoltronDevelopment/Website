import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { founderSessionCookie } from "@/lib/founder-session-config";
import { verifyFounderToken } from "@/lib/founder-session.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(founderSessionCookie)?.value;
  const response = NextResponse.json({ authenticated: Boolean(verifyFounderToken(token)) }, { headers: { "Cache-Control": "no-store, private", "Vary": "Cookie" } });
  return response;
}
