import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";

export const corpusRoot = new URL("../Voltron-Lattice-Knowledge-Base/", import.meta.url);
const hash = text => createHash("sha256").update(text).digest("hex");
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function parseRecord(text) {
  const match = text.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Knowledge record requires front matter");
  const metadata = {};
  for (const line of match[1].split("\n").filter(line => line.trim())) {
    const field = line.match(/^([a-z_]+):\s*(.+)$/);
    if (!field) throw new Error("Unsupported metadata field");
    metadata[field[1]] = JSON.parse(field[2]);
  }
  return { metadata, body: match[2] };
}

export async function compileCorpus() {
  const topics = JSON.parse(await readFile(new URL("../lib/vectra/topics.json", import.meta.url), "utf8"));
  const records = [];
  const documents = new Map();
  for (const file of (await readdir(new URL("knowledge/", corpusRoot))).filter(file => file.endsWith(".md")).sort()) {
    const { metadata, body } = parseRecord(await readFile(new URL("knowledge/" + file, corpusRoot), "utf8"));
    if (documents.has(metadata.id)) throw new Error("Duplicate topic " + metadata.id);
    documents.set(metadata.id, { metadata, body });
  }
  const relationships = (await readFile(new URL("graph/relations.md", corpusRoot), "utf8"))
    .split(/\r?\n/).filter(line => /^\| E\d+ /.test(line)).map(line => {
      const [id, from, relation, to, status, sources] = line.split("|").slice(1, -1).map(value => value.trim());
      if (!documents.has(from) || !documents.has(to)) throw new Error("Invalid graph endpoint " + id);
      return { id, from, relation, to, status, sources: sources.split(",") };
    });
  for (const [id, { metadata, body }] of documents) {
    if (!metadata.ingest || metadata.classification !== "public_safe" || metadata.approval_status !== "approved") continue;
    const topic = topics[id];
    if (!topic) throw new Error("Unmapped public topic " + id);
    for (const related of metadata.related_ids) {
      if (!documents.has(related)) throw new Error("Unknown related topic " + related);
    }
    const sections = [...body.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
    // A glossary may consist of a single table without section headings.
    if (!sections.length) sections.push([body, "Overview", body.replace(/^# .+\n/, "")]);
    const qualification = sections.filter(section => /status|readiness|boundar|evidence discipline|not promised|product framing|qualification/i.test(section[1]))
      .map(section => section[2].trim()).join("\n\n");
    const edges = relationships.filter(edge => edge.from === id || edge.to === id)
      .filter(edge => documents.get(edge.from).metadata.approval_status === "approved" && documents.get(edge.to).metadata.approval_status === "approved");
    for (const [, heading, text] of sections) {
      if (heading === "Related knowledge") continue;
      const plain = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
      if (!plain) continue;
      const record = {
        id: slug(id) + "--" + slug(heading), topicId: id, title: metadata.title + " — " + heading,
        href: topic.href, status: topic.status, body: plain, terms: metadata.aliases.join(" "),
        aliases: metadata.aliases, section: heading, qualification,
        relationships: edges, classification: metadata.classification, approval: metadata.approval_status,
        revision: metadata.version, sourceIds: metadata.source_ids, reviewedAt: metadata.as_of,
      };
      records.push({ ...record, contentHash: hash(JSON.stringify(record)) });
    }
  }
  return { records, topics };
}
