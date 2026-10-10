import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/lib/errors";
import { storeInquiry, validateInquiry } from "@/lib/inquiries";
import { POST } from "@/app/api/inquiries/route";

vi.mock("@/lib/inquiries", () => ({
  storeInquiry: vi.fn(),
  validateInquiry: vi.fn()
}));

const validPayload = {
  inquiryType: "Production — CED Coating",
  name: "Ada Lovelace",
  company: "Analytical Engines Ltd",
  email: "ada@example.com",
  requirement: "Discuss a coating program"
};

function makeRequest(body: string) {
  return new Request("http://localhost/api/inquiries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body
  });
}

describe("POST /api/inquiries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateInquiry).mockReturnValue(validPayload);
    vi.mocked(storeInquiry).mockResolvedValue({
      ...validPayload,
      id: "inquiry-123",
      createdAt: "2026-10-03T00:00:00.000Z",
      source: "website"
    });
  });

  it("stores a valid inquiry and returns its identifier", async () => {
    const response = await POST(makeRequest(JSON.stringify(validPayload)));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      inquiryId: "inquiry-123"
    });
    expect(validateInquiry).toHaveBeenCalledWith(validPayload);
    expect(storeInquiry).toHaveBeenCalledWith(validPayload);
  });

  it("returns 400 for malformed JSON without validating or storing", async () => {
    const response = await POST(makeRequest("{broken"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message: "Request body must be valid JSON."
    });
    expect(validateInquiry).not.toHaveBeenCalled();
    expect(storeInquiry).not.toHaveBeenCalled();
  });

  it("returns 400 for inquiry validation errors", async () => {
    vi.mocked(validateInquiry).mockImplementation(() => {
      throw new ValidationError("Select a valid inquiry intent.");
    });

    const response = await POST(makeRequest(JSON.stringify(validPayload)));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message: "Select a valid inquiry intent."
    });
    expect(storeInquiry).not.toHaveBeenCalled();
  });

  it("returns 500 when persistence fails", async () => {
    vi.mocked(storeInquiry).mockRejectedValue(new Error("storage unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const response = await POST(makeRequest(JSON.stringify(validPayload)));

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({
        ok: false,
        message: "Unable to submit inquiry. Please try again shortly."
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});
