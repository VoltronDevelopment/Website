import {formatInquiryEmail,sanitizeEmailSubjectPart} from "./inquiry-email";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { readLocalLedger } from "@/lib/local-ledger";
import path from "node:path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { validationError } from "@/lib/errors";
import { isAllowedInquiryType } from "@/lib/inquiry-intents";

export type InquiryPayload = {
  inquiryType: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  requirement: string;
  submissionKey?: string;
  partOrApplication?: string;
  expectedVolume?: string;
  timing?: string;
  qualityRequirements?: string;
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

const MAX_FIELD_LENGTH = 800;
const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "inquiries.json");
let localInquiryWriteTail: Promise<void> = Promise.resolve();
const defaultInquiryEmail = "info@voltroncoat.com";

const awsRegion = process.env.VOLTRON_AWS_REGION || process.env.AWS_REGION || "ap-south-1";
const inquiriesTableName = process.env.INQUIRIES_TABLE_NAME;
const inquiryToEmail = process.env.INQUIRY_TO_EMAIL || defaultInquiryEmail;
const sesFromEmail = process.env.SES_FROM_EMAIL;
const notifyByEmail = process.env.VOLTRON_INQUIRY_EMAIL === "1";

export function validateInquiry(input: unknown): InquiryPayload {
  if (!input || typeof input !== "object") {
    validationError("Invalid request body.");
  }

  const body = input as Record<string, unknown>;
  const inquiryType = normalizeRequired(body.inquiryType, "Inquiry type");

  if (!isAllowedInquiryType(inquiryType)) {
    validationError("Select a valid inquiry intent.");
  }

  const submissionKey = normalizeOptional(body.submissionKey);
  if (submissionKey && !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(submissionKey)) validationError("Invalid submission reference.");
  const payload: InquiryPayload = {
    submissionKey,
    partOrApplication: normalizeOptional(body.partOrApplication),
    expectedVolume: normalizeOptional(body.expectedVolume),
    timing: normalizeOptional(body.timing),
    qualityRequirements: normalizeOptional(body.qualityRequirements),
    inquiryType,
    name: normalizeRequired(body.name, "Name"),
    company: normalizeOptional(body.company) || "",
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
  const {submissionKey, ...fields} = payload;
  const inquiry: StoredInquiry = {
    ...fields,
    id: submissionKey ? createHash("sha256").update(submissionKey).update(JSON.stringify(fields)).digest("hex").slice(0,32) : randomUUID(),
    createdAt: new Date().toISOString(),
    source: "website"
  };

  if (inquiriesTableName) {
    if (!await storeInquiryInDynamoDb(inquiry)) return inquiry;
  } else {
    if (process.env.NODE_ENV === "production") throw new Error("Inquiry persistence is not configured.");
    if (!await storeInquiryLocally(inquiry)) return inquiry;
  }

  if (!notifyByEmail) return inquiry;
  let delivered=false;
  try {
    await sendInquiryEmail(inquiry);
    delivered=Boolean(sesFromEmail);
  } catch (error) {
    console.error("[inquiries] notification email failed", {
      inquiryId: inquiry.id, error: error instanceof Error ? error.message : error
    });
  }
  if (inquiriesTableName) {
    try {
      await db().send(new UpdateCommand({
        TableName: inquiriesTableName, Key: {id: inquiry.id},
        UpdateExpression: "SET notificationStatus = :status",
        ExpressionAttributeValues: {":status": delivered ? "sent" : "failed"}
      }));
    } catch {
      console.error("[inquiries] notification status needs reconciliation", {inquiryId:inquiry.id,delivered});
    }
  }

  return inquiry;
}

async function storeInquiryLocally(inquiry: StoredInquiry) {
  // Serialize the entire read/modify/replace, not just the write. This is a
  // process-local adapter; multi-instance deployments must use DynamoDB.
  const previous = localInquiryWriteTail;
  let release!: () => void;
  localInquiryWriteTail = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    const existing = await readLocalLedger<StoredInquiry>(dataFile);
    if (existing.some(row=>row.id===inquiry.id)) return false;
    await mkdir(dataDirectory, { recursive: true });
    const temporaryFile = `${dataFile}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporaryFile, JSON.stringify([inquiry, ...existing], null, 2), { flag: "wx" });
      await rename(temporaryFile, dataFile);
    } catch (error) {
      await rm(temporaryFile, { force: true }).catch(() => {});
      throw error;
    }
    return true;
  } finally {
    release();
  }
}

function db() {
  return DynamoDBDocumentClient.from(new DynamoDBClient({region: awsRegion}), {marshallOptions:{removeUndefinedValues:true}});
}

async function storeInquiryInDynamoDb(inquiry: StoredInquiry) {
  try {
    await db().send(new PutCommand({
      TableName: inquiriesTableName, Item: {...inquiry, notificationStatus:notifyByEmail ? "pending" : "stored"},
      ConditionExpression: "attribute_not_exists(id)"
    }));
    return true;
  } catch (error) {
    if (error instanceof Error && error.name==="ConditionalCheckFailedException") return false;
    throw error;
  }
}

async function sendInquiryEmail(inquiry: StoredInquiry) {
  if (!sesFromEmail) {
    if (inquiriesTableName) throw new Error("Inquiry notification sender is not configured.");
    return;
  }

  const client = new SESv2Client({ region: awsRegion });
  const subject = `Voltron website inquiry: ${sanitizeEmailSubjectPart(inquiry.company)}`;
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

function normalizeRequired(value: unknown, label: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    validationError(`${label} is required.`);
  }
  if (normalized.length > MAX_FIELD_LENGTH) {
    validationError(`${label} is too long.`);
  }
  return normalized;
}

function normalizeOptional(value: unknown): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    return undefined;
  }
  if (normalized.length > MAX_FIELD_LENGTH) {
    validationError("One or more fields is too long.");
  }
  return normalized;
}

function normalizeEmail(value: unknown): string {
  const email = normalizeRequired(value, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    validationError("Enter a valid email address.");
  }
  return email;
}
