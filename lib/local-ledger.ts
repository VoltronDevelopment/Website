import { readFile } from "node:fs/promises";

/** Missing is empty; unreadable or corrupt is never permission to overwrite. */
export async function readLocalLedger<T>(file: string): Promise<T[]> {
  let contents: string;
  try {
    contents = await readFile(file, "utf8");
  } catch (error) {
    if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
  const parsed: unknown = JSON.parse(contents);
  if (!Array.isArray(parsed)) throw new Error("Stored ledger must be an array; restore or repair it before writing.");
  const ids = new Set<string>();
  for (const row of parsed) {
    if (row === null || typeof row !== "object" || Array.isArray(row)
      || typeof row.id !== "string" || !row.id.trim() || ids.has(row.id)) {
      throw new Error("Stored ledger has invalid or duplicate record identities; restore or repair it before writing.");
    }
    ids.add(row.id);
  }
  return parsed as T[];
}
