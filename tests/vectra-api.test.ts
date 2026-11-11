import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, POST } from "@/app/api/vectra/route";
import { vectraGraph } from "@/lib/vectra/graph";
import { createSession, finishTurn, loadTurns, reserveTurn } from "@/lib/vectra/store";

vi.mock("@/lib/launch", () => ({ isPrelaunch: () => false }));
vi.mock("@/lib/vectra/graph", () => ({ vectraGraph: { invoke: vi.fn() } }));
vi.mock("@/lib/vectra/store", () => ({
  createSession: vi.fn(), digest: (value: string) => `hash:${value}`,
  finishTurn: vi.fn(), loadTurns: vi.fn(), releaseKnowledge: vi.fn(async () => []),
  reserveTurn: vi.fn(), takeWindow: vi.fn(async () => true), vectraConfigured: () => true,
}));

const origin = "http://localhost:3000";
const oldToken = "a".repeat(64);
const id = "72f41e27-5142-4ae2-b66c-873fd4cb73b9";
const question = "What does Voltron Alpha do?";

function request(method: "GET" | "DELETE" | "POST", cookie = oldToken) {
  return new NextRequest(`${origin}/api/vectra`, {
    method,
    headers: { origin, cookie: `voltron_vectra=${cookie}`, "content-type": "application/json" },
    body: method === "POST" ? JSON.stringify({ id, message: question }) : undefined,
  });
}

describe("Vectra guest recovery", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("rotates the cookie and rejects turns against the cleared session", async () => {
    const cleared = await DELETE(request("DELETE"));
    const cookie = cleared.cookies.get("voltron_vectra");
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: "strict" });
    expect(cookie?.value).not.toBe(oldToken);
    expect(createSession).toHaveBeenCalledWith(`hash:${cookie?.value}`, `hash:${oldToken}`);
    vi.mocked(loadTurns).mockResolvedValue(null);
    expect((await POST(request("POST"))).status).toBe(401);
    expect(reserveTurn).not.toHaveBeenCalled();
    const restored = await GET(request("GET"));
    expect(restored.cookies.get("voltron_vectra")?.value).not.toBe(oldToken);
  });

  it("releases a failed turn and saves one reply when the same turn is retried", async () => {
    vi.mocked(loadTurns).mockResolvedValue([]);
    vi.mocked(reserveTurn).mockResolvedValueOnce({ lease: "00000000-0000-4000-8000-000000000001", turns: [] })
      .mockResolvedValueOnce({ lease: "00000000-0000-4000-8000-000000000002", turns: [] });
    vi.mocked(finishTurn).mockResolvedValue(true);
    const answer = { text: "Alpha is Voltron’s first manufacturing environment.", sources: [], enquiry: false };
    vi.mocked(vectraGraph.invoke).mockRejectedValueOnce(new Error("Provider unavailable"))
      .mockResolvedValueOnce({ question, preference: "auto", history: [], records: [], evidence: [], candidate: answer, reply: answer });

    expect((await POST(request("POST"))).status).toBe(503);
    expect(finishTurn).toHaveBeenNthCalledWith(1, `hash:${oldToken}`, "00000000-0000-4000-8000-000000000001");
    const retried = await POST(request("POST"));
    expect(retried.status).toBe(200);
    await expect(retried.json()).resolves.toEqual({ turns: [{ id, question, reply: answer }] });
    expect(finishTurn).toHaveBeenCalledTimes(2);
  });
});
