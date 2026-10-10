import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const awsMocks = vi.hoisted(() => ({
  dynamoSend: vi.fn(),
  sesSend: vi.fn()
}));

vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: class {
    constructor(readonly config: unknown) {}
  }
}));

vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({ send: awsMocks.dynamoSend }))
  },
  PutCommand: class {
    constructor(readonly input: unknown) {}
  }
}));

vi.mock("@aws-sdk/client-sesv2", () => ({
  SESv2Client: class {
    constructor(readonly config: unknown) {}
    send = awsMocks.sesSend;
  },
  SendEmailCommand: class {
    constructor(readonly input: unknown) {}
  }
}));

const inquiryPayload = {
  inquiryType: "Production — CED Coating",
  name: "Ada Lovelace",
  company: "Analytical Engines Ltd",
  email: "ada@example.com",
  requirement: "Discuss a coating program"
};

describe("inquiry AWS adapters", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("INQUIRIES_TABLE_NAME", "voltron-inquiries-test");
    vi.stubEnv("SES_FROM_EMAIL", "website@example.com");
    vi.stubEnv("INQUIRY_TO_EMAIL", "sales@example.com");
    vi.stubEnv("VOLTRON_AWS_REGION", "ap-south-1");
    awsMocks.dynamoSend.mockReset().mockResolvedValue({});
    awsMocks.sesSend.mockReset().mockResolvedValue({});
  });

  it("persists a website-sourced inquiry and sends the configured notification", async () => {
    const { storeInquiry } = await import("@/lib/inquiries");

    const stored = await storeInquiry(inquiryPayload);

    expect(stored).toMatchObject({
      ...inquiryPayload,
      source: "website"
    });
    expect(stored.id).toBeTruthy();
    expect(Number.isNaN(Date.parse(stored.createdAt))).toBe(false);

    const putCommand = awsMocks.dynamoSend.mock.calls[0]?.[0] as {
      input: { TableName: string; Item: Record<string, unknown> };
    };
    expect(putCommand.input.TableName).toBe("voltron-inquiries-test");
    expect(putCommand.input.Item).toMatchObject({
      id: stored.id,
      createdAt: stored.createdAt,
      source: "website",
      email: "ada@example.com"
    });

    const emailCommand = awsMocks.sesSend.mock.calls[0]?.[0] as {
      input: {
        FromEmailAddress: string;
        Destination: { ToAddresses: string[] };
        Content: { Simple: { Subject: { Data: string }; Body: { Text: { Data: string } } } };
      };
    };
    expect(emailCommand.input.FromEmailAddress).toBe("website@example.com");
    expect(emailCommand.input.Destination.ToAddresses).toEqual(["sales@example.com"]);
    expect(emailCommand.input.Content.Simple.Subject.Data).toBe(
      "Voltron website inquiry: Analytical Engines Ltd"
    );
    expect(emailCommand.input.Content.Simple.Body.Text.Data).toContain(stored.id);
  });

  it("keeps a persisted inquiry successful when SES notification fails", async () => {
    awsMocks.sesSend.mockRejectedValue(new Error("SES unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const { storeInquiry } = await import("@/lib/inquiries");
      const stored = await storeInquiry(inquiryPayload);

      expect(stored.id).toBeTruthy();
      expect(awsMocks.dynamoSend).toHaveBeenCalledOnce();
      expect(awsMocks.sesSend).toHaveBeenCalledOnce();
      expect(consoleError).toHaveBeenCalledWith(
        "[inquiries] notification email failed",
        expect.objectContaining({ inquiryId: stored.id, error: "SES unavailable" })
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it("does not send notification when durable inquiry persistence fails", async () => {
    awsMocks.dynamoSend.mockRejectedValue(new Error("DynamoDB unavailable"));
    const { storeInquiry } = await import("@/lib/inquiries");

    await expect(storeInquiry(inquiryPayload)).rejects.toThrow("DynamoDB unavailable");
    expect(awsMocks.dynamoSend).toHaveBeenCalledOnce();
    expect(awsMocks.sesSend).not.toHaveBeenCalled();
  });

  it("removes line breaks from the notification subject", async () => {
    const { storeInquiry } = await import("@/lib/inquiries");

    await storeInquiry({ ...inquiryPayload, company: "Acme\r\nInjected Header" });

    const emailCommand = awsMocks.sesSend.mock.calls[0]?.[0] as {
      input: { Content: { Simple: { Subject: { Data: string } } } };
    };
    expect(emailCommand.input.Content.Simple.Subject.Data).toBe(
      "Voltron website inquiry: Acme Injected Header"
    );
  });
});
