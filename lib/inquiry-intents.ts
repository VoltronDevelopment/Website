export const productionIntents = [
  "Production — Phosphating",
  "Production — CED Coating",
  "Production — Powder Coating",
  "Production — Other",
  "Production — Need guidance"
] as const;

export const partnerIntents = [
  "Factory JV",
  "Strategic investment",
  "Platform partnership",
  "Commons collaboration",
  "Building with Voltron",
  "Partnership — Other"
] as const;

export const defaultProductionIntent = "Production — CED Coating";
export const defaultPartnerIntent = "Factory JV";

export const allowedInquiryTypes = [
  ...new Set([...productionIntents, ...partnerIntents])
] as string[];

export function isAllowedInquiryType(value: string): boolean {
  return allowedInquiryTypes.includes(value);
}
