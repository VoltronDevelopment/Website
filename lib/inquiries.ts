import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export type InquiryPayload = {
  inquiryType: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  requirement: string;
  componentType?: string;
  material?: string;
  monthlyVolume?: string;
  coatingThickness?: string;
  saltSprayRequirement?: string;
};

export type StoredInquiry = InquiryPayload & {
  id: string;
  createdAt: string;
  source: "website";
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "inquiries.json");
const defaultInquiryEmail = "infor@voltroncoat.com";

const awsRegion = process.env.VOLTRON_AWS_REGION || process.env.AWS_REGION || "ap-south-1";
const inquiriesTableName = process.env.INQUIRIES_TABLE_NAME;
const inquiryToEmail = process.env.INQUIRY_TO_EMAIL || defaultInquiryEmail;
const sesFromEmail = process.env.SES_FROM_EMAIL;

export function validateInquiry(input: unknown): InquiryPayload {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid request body.");
  }

  const body = input as Record<string, unknown>;
  const payload: InquiryPayload = {
    inquiryType: normalizeRequired(body.inquiryType, "Inquiry type"),
    name: normalizeRequired(body.name, "Name"),
    company: normalizeRequired(body.company, "Company"),
    email: normalizeEmail(body.email),
    phone: normalizeOptional(body.phone),
    requirement: normalizeRequired(body.requirement, "Requirement"),
    componentType: normalizeOptional(body.componentType),
    material: normalizeOptional(body.material),
    monthlyVolume: normalizeOptional(body.monthlyVolume),
    coatingThickness: normalizeOptional(body.coatingThickness),
    saltSprayRequirement: normalizeOptional(body.saltSprayRequirement)
  };

  return payload;
}

export async function storeInquiry(payload: InquiryPayload): Promise<StoredInquiry> {
  const inquiry: StoredInquiry = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: "website"
  };

  if (inquiriesTableName) {
    await storeInquiryInDynamoDb(inquiry);
  } else {
    await storeInquiryLocally(inquiry);
  }

  await sendInquiryEmail(inquiry);

  return inquiry;
}

async function storeInquiryLocally(inquiry: StoredInquiry) {
  await mkdir(dataDirectory, { recursive: true });
  const existing = await readInquiries();
  await writeFile(dataFile, JSON.stringify([inquiry, ...existing], null, 2));
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

async function storeInquiryInDynamoDb(inquiry: StoredInquiry) {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: awsRegion }));

  await client.send(
    new PutCommand({
      TableName: inquiriesTableName,
      Item: inquiry
    })
  );
}

async function sendInquiryEmail(inquiry: StoredInquiry) {
  if (!sesFromEmail) {
    return;
  }

  const client = new SESv2Client({ region: awsRegion });
  const subject = `Voltron website inquiry: ${inquiry.company}`;
  const text = formatInquiryEmail(inquiry);

  await client.send(
    new SendEmailCommand({
      FromEmailAddress: sesFromEmail,
      Destination: {
        ToAddresses: [inquiryToEmail]
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject
          },
          Body: {
            Text: {
              Data: text
            }
          }
        }
      }
    })
  );
}

function formatInquiryEmail(inquiry: StoredInquiry): string {
  return [
    "New inquiry from the Voltron website",
    "",
    `Inquiry ID: ${inquiry.id}`,
    `Created: ${inquiry.createdAt}`,
    `Type: ${inquiry.inquiryType}`,
    `Name: ${inquiry.name}`,
    `Company: ${inquiry.company}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone || "-"}`,
    `Component type: ${inquiry.componentType || "-"}`,
    `Material/substrate: ${inquiry.material || "-"}`,
    `Monthly volume: ${inquiry.monthlyVolume || "-"}`,
    `Coating thickness: ${inquiry.coatingThickness || "-"}`,
    `Salt spray requirement: ${inquiry.saltSprayRequirement || "-"}`,
    "",
    "Requirement:",
    inquiry.requirement
  ].join("\n");
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
