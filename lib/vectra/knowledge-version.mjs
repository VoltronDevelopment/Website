import { createHash } from "node:crypto";

export function knowledgeVersion(records) {
  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    }
    return value;
  }
  return createHash("sha256").update(JSON.stringify(canonical(records))).digest("hex");
}
