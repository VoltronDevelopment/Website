import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { siteUrl } from "@/lib/assets";
import { isPrelaunch } from "@/lib/launch";
import { vectraGraph } from "@/lib/vectra/graph";
import { createSession, digest, finishTurn, loadTurns, releaseKnowledge, reserveTurn, takeWindow, vectraConfigured } from "@/lib/vectra/store";
import { conversationTurnLimit, messageLimit, type Turn } from "@/lib/vectra/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 50;

const cookieName = "voltron_vectra";
const tokenPattern = /^[a-f0-9]{64}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function reply(data: object, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}
function allowed(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin || fetchSite === "cross-site") return false;
  if (origin === new URL(siteUrl).origin || origin === request.nextUrl.origin) return true;
  // Next can canonicalize a local request URL to localhost while the browser
  // uses 127.0.0.1. Host is the HTTP host the browser actually connected to.
  return fetchSite === "same-origin" &&
    ["http", "https"].some(protocol => origin === `${protocol}://${request.headers.get("host")}`);
}
function sessionToken(request: NextRequest) {
  const value = request.cookies.get(cookieName)?.value;
  return value && tokenPattern.test(value) ? value : undefined;
}
function setToken(response: NextResponse, token: string, maxAge: number) {
  response.cookies.set(cookieName, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/api/vectra", maxAge });
  return response;
}
function unavailable() {
  return reply({ message: "Vera is temporarily unavailable. You can still contact the Voltron team." }, 503);
}
function enabled() {
  return !isPrelaunch() && vectraConfigured();
}
function clientKey(request: NextRequest) {
  const client = request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || request.headers.get("x-real-ip") || "unknown";
  return digest(client);
}
async function startSession(request: NextRequest, previous?: string) {
  const minute = Math.floor(Date.now() / 60_000);
  if (!await takeWindow(`session/${minute}/${clientKey(request)}`, 16, new Date((minute + 1) * 60_000))) {
    return reply({ message: "Please wait a minute before starting another chat." }, 429);
  }
  const token = randomBytes(32).toString("hex");
  await createSession(digest(token), previous ? digest(previous) : undefined);
  return setToken(reply({ turns: [] }), token, 86400);
}
function expired() {
  return reply({ message: "Your guest chat expired. Start a new chat to continue." }, 401);
}
function failed(error: unknown) {
  console.error("[vectra] request failed", error instanceof Error ? error.name : "unknown");
  return unavailable();
}

export async function GET(request: NextRequest) {
  if (!enabled()) return unavailable();
  if (request.headers.get("sec-fetch-site") === "cross-site") return reply({}, 403);
  try {
    const existing = sessionToken(request);
    const turns = existing ? await loadTurns(digest(existing)) : null;
    return turns ? reply({ turns }) : await startSession(request, existing);
  } catch (error) { return failed(error); }
}

export async function DELETE(request: NextRequest) {
  if (!enabled()) return unavailable();
  if (!allowed(request)) return reply({}, 403);
  try {
    return await startSession(request, sessionToken(request));
  } catch (error) { return failed(error); }
}

async function readTurn(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let size = 0;
  let text = "";
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12_000) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    const data = JSON.parse(text + decoder.decode()) as { id?: unknown; message?: unknown } | null;
    const question = typeof data?.message === "string" ? data.message.trim() : "";
    return question && question.length <= messageLimit && typeof data?.id === "string" && uuidPattern.test(data.id)
      ? { question, id: data.id } : null;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  if (!enabled()) return unavailable();
  if (!allowed(request)) return reply({}, 403);
  const token = sessionToken(request);
  if (!token) return expired();
  const input = await readTurn(request);
  if (!input) return reply({ message: "Enter a message of 1 to 1,500 characters." }, 400);

  const session = digest(token);
  const started = performance.now();
  let lease: string | undefined;
  try {
    const saved = await loadTurns(session);
    if (!saved) return expired();
    const replay = saved.find(turn => turn.id === input.id);
    if (replay) return replay.question === input.question ? reply({ turns: saved }) : reply({}, 409);
    if (saved.length >= conversationTurnLimit) {
      return reply({ code: "conversation_limit", message: "This conversation has reached its reply limit. Start a new chat to keep going." }, 429);
    }
    const now = Date.now();
    const day = Math.floor(now / 86_400_000);
    const minute = Math.floor(now / 60_000);
    if (!await takeWindow(`minute/${minute}/${clientKey(request)}`, 8, new Date((minute + 1) * 60_000))) {
      return reply({ message: "Please wait a minute before sending another message." }, 429);
    }

    const reserved = await reserveTurn(session);
    if (!reserved) return reply({ message: "A reply is already in progress or this conversation is full. Try again in a moment." }, 409);
    lease = reserved.lease;
    const duplicate = reserved.turns.find(turn => turn.id === input.id);
    if (duplicate) return duplicate.question === input.question ? reply({ turns: reserved.turns }) : reply({}, 409);
    if (!await takeWindow(`day/${day}`, 350, new Date((day + 1) * 86_400_000))) {
      return reply({ code: "daily_limit", message: "Vera has reached its chat limit for today. You can still contact the Voltron team." }, 429);
    }

    const contextStart = performance.now();
    const records = await releaseKnowledge();
    const contextMs = performance.now() - contextStart;
    const answerStart = performance.now();
    const { reply: answer } = await vectraGraph.invoke({ question: input.question, history: reserved.turns, records });
    const answerMs = performance.now() - answerStart;
    const turn: Turn = { id: input.id, question: input.question, reply: answer };
    const persistStart = performance.now();
    if (!await finishTurn(session, lease, turn)) return reply({ message: "The conversation changed. Please try again." }, 409);
    lease = undefined;
    const response = reply({ turns: [...reserved.turns, turn] });
    response.headers.set("Server-Timing", [
      `context;dur=${contextMs.toFixed(1)}`,
      `answer;dur=${answerMs.toFixed(1)}`,
      `persist;dur=${(performance.now() - persistStart).toFixed(1)}`,
      `total;dur=${(performance.now() - started).toFixed(1)}`,
    ].join(", "));
    return response;
  } catch (error) { return failed(error); }
  finally {
    if (lease) await finishTurn(session, lease).catch(() => {});
  }
}
