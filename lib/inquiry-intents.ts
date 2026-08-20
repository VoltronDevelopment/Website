export const alphaVisitIntent = "Voltron Alpha Visit";

export const productionIntents = [
  alphaVisitIntent,
  "Production — CED Coating",
  "Production — Phosphating",
  "Production — Powder Coating",
  "Production — Other"
] as const;

export const partnerIntents = [
  alphaVisitIntent,
  "Factory JV / Replication",
  "Strategic Investment",
  "Technology / Platform Partnership",
  "General Partnership Discussion"
] as const;

export const defaultProductionIntent = "Production — CED Coating";
export const defaultPartnerIntent = "Factory JV / Replication";

export const allowedInquiryTypes = [
  ...new Set([...productionIntents, ...partnerIntents])
] as string[];

export function isAllowedInquiryType(value: string): boolean {
  return allowedInquiryTypes.includes(value);
}
