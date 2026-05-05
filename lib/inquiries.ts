import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type InquiryPayload = {
  name: string;
  company: string;
  email: string;
  phone?: string;
  requirement: string;
  componentType?: string;
  monthlyVolume?: string;
};

export type StoredInquiry = InquiryPayload & {
  id: string;
  createdAt: string;
  source: "website";
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "inquiries.json");

export function validateInquiry(input: unknown): InquiryPayload {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid request body.");
  }

  const body = input as Record<string, unknown>;
  const payload: InquiryPayload = {
    name: normalizeRequired(body.name, "Name"),
    company: normalizeRequired(body.company, "Company"),
    email: normalizeEmail(body.email),
    phone: normalizeOptional(body.phone),
    requirement: normalizeRequired(body.requirement, "Requirement"),
    componentType: normalizeOptional(body.componentType),
    monthlyVolume: normalizeOptional(body.monthlyVolume)
  };

  return payload;
}

export async function storeInquiry(payload: InquiryPayload): Promise<StoredInquiry> {
  await mkdir(dataDirectory, { recursive: true });

  const inquiry: StoredInquiry = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: "website"
  };

  const existing = await readInquiries();
  await writeFile(dataFile, JSON.stringify([inquiry, ...existing], null, 2));

  return inquiry;
}

async function readInquiries(): Promise<StoredInquiry[]> {
  try {
    const content = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeRequired(value: unknown, label: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new Error(`${label} is required.`);
  }
  if (normalized.length > 800) {
    throw new Error(`${label} is too long.`);
  }
  return normalized;
}

function normalizeOptional(value: unknown): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

function normalizeEmail(value: unknown): string {
  const email = normalizeRequired(value, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  return email;
}
