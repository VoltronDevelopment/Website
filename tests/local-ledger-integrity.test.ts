import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const faults = vi.hoisted(() => ({ unreadable: "", failRename: false }));
const inquiry = {
  inquiryType: "Production — CED Coating",
  name: "Test",
  company: "Test",
  email: "test@example.com",
  requirement: "Test integrity"
};

describe("Website local inquiry ledger integrity", () => {
  let previousCwd: string;
  let directory: string;

  beforeEach(async () => {
    previousCwd = process.cwd();
    directory = await mkdtemp(path.join(tmpdir(), "voltron-ledger-proof-"));
    process.chdir(directory);
    vi.resetModules();
    for (const name of ["INQUIRIES_TABLE_NAME", "SES_FROM_EMAIL"]) vi.stubEnv(name, "");
    faults.unreadable = "";
    faults.failRename = false;
    vi.doMock("node:fs/promises", async (importOriginal) => {
      const actual = await importOriginal<typeof import("node:fs/promises")>();
      return {
        ...actual,
        readFile: async (...args: Parameters<typeof actual.readFile>) => {
          if (faults.unreadable && String(args[0]).endsWith(faults.unreadable)) {
            throw Object.assign(new Error("injected read denial"), { code: "EACCES" });
          }
          return actual.readFile(...args);
        },
        rename: async (...args: Parameters<typeof actual.rename>) => {
          if (faults.failRename && String(args[1]).endsWith("inquiries.json")) {
            throw new Error("injected inquiry rename failure");
          }
          return actual.rename(...args);
        }
      };
    });
  });

  afterEach(async () => {
    process.chdir(previousCwd);
    vi.doUnmock("node:fs/promises");
    vi.unstubAllEnvs();
    expect(path.dirname(directory)).toBe(tmpdir());
    expect(path.basename(directory).startsWith("voltron-ledger-proof-")).toBe(true);
    await rm(directory, { recursive: true, force: true });
  });

  it.each(["{broken", "{}", "[null]"])(
    "preserves corrupt inquiries instead of replacing them with a new submission (%s)",
    async (contents) => {
      await mkdir("data");
      await writeFile("data/inquiries.json", contents);
      const { storeInquiry } = await import("@/lib/inquiries");
      await expect(storeInquiry(inquiry)).rejects.toThrow();
      expect(await readFile("data/inquiries.json", "utf8")).toBe(contents);
    }
  );

  it("fails closed on inquiry read denial", async () => {
    await mkdir("data");
    await writeFile("data/inquiries.json", "[]");
    faults.unreadable = "inquiries.json";
    const { storeInquiry } = await import("@/lib/inquiries");
    await expect(storeInquiry(inquiry)).rejects.toThrow("injected read denial");
    expect(await readFile("data/inquiries.json", "utf8")).toBe("[]");
  });

  it("serializes concurrent inquiry submissions without losing any record", async () => {
    const { storeInquiry } = await import("@/lib/inquiries");
    const submitted = await Promise.all(
      Array.from({ length: 20 }, (_, index) => storeInquiry({ ...inquiry, name: `Test ${index}` }))
    );
    const persisted = JSON.parse(await readFile("data/inquiries.json", "utf8"));
    expect(persisted).toHaveLength(20);
    expect(new Set(persisted.map((row: { id: string }) => row.id))).toEqual(
      new Set(submitted.map((row) => row.id))
    );
  });

  it("preserves prior inquiry bytes on atomic-commit failure and permits a subsequent retry", async () => {
    const { storeInquiry } = await import("@/lib/inquiries");
    const first = await storeInquiry(inquiry);
    const before = await readFile("data/inquiries.json", "utf8");
    faults.failRename = true;
    await expect(storeInquiry(inquiry)).rejects.toThrow("injected inquiry rename failure");
    expect(await readFile("data/inquiries.json", "utf8")).toBe(before);
    expect((await readdir("data")).filter((name) => name.endsWith(".tmp"))).toEqual([]);
    faults.failRename = false;
    const second = await storeInquiry(inquiry);
    expect(JSON.parse(await readFile("data/inquiries.json", "utf8")).map((row: { id: string }) => row.id)).toEqual([
      second.id,
      first.id
    ]);
  });
});
