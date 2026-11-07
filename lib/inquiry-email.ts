import type {StoredInquiry} from "./inquiries";

export function sanitizeEmailSubjectPart(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 120);
}

export function formatInquiryEmail(inquiry: StoredInquiry): string {
  return [
    "New inquiry from the Voltron website",
    "",
    `Inquiry ID: ${inquiry.id}`,
    `Created: ${inquiry.createdAt}`,
    `Type: ${inquiry.inquiryType}`,
    `Program / process: ${inquiry.componentType || inquiry.inquiryType}`,
    `Name: ${inquiry.name}`,
    `Company: ${inquiry.company}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone || "-"}`,
    `Part / material: ${inquiry.partOrApplication || inquiry.material || "-"}`,
    `Volume / scale: ${inquiry.expectedVolume || inquiry.monthlyVolume || "-"}`,
    `Spec / timeline: ${inquiry.timing || inquiry.coatingThickness || "-"}`,
    `Quality / model: ${inquiry.qualityRequirements || inquiry.saltSprayRequirement || "-"}`,
    "",
    "Requirement:",
    inquiry.requirement
  ].join("\n");
}
