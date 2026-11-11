import { readFile, writeFile } from "node:fs/promises";
import ts from "typescript";
import { knowledgeVersion } from "../lib/vectra/knowledge-version.mjs";
import { compileCorpus } from "./vera-corpus.mjs";
import { databaseConfig } from "../lib/vectra/database-config.mjs";

const sourcePath = new URL("../lib/vectra/knowledge.json", import.meta.url);
const { records: corpus, topics } = await compileCorpus();
const siteRecords = JSON.parse(await readFile(sourcePath, "utf8")).map(record => ({
  ...record,
  topicId: Object.entries(topics).find(([, topic]) => topic.siteIds.includes(record.id))?.[0] || "VL-IDENTITY",
  approval: "approved",
  classification: "public_safe",
}));
const records = [...siteRecords, ...corpus];
const ids = new Set();
const pages = new Map();
const snapshot = [];

for (const record of records) {
  if (ids.has(record.id) || !/^[a-z0-9-]+$/.test(record.id) ||
      !/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?(?:#[a-z0-9-]+)?$/.test(record.href) ||
      !["positioning", "demonstration", "in development", "direction", "available"].includes(record.status) ||
      !record.title?.trim() || !record.body?.trim()) throw new Error(`Invalid public knowledge record: ${record.id}`);
  ids.add(record.id);
  const [route, anchor] = record.href.split("#");
  let page = pages.get(route);
  if (!page) {
    const path = new URL(`../app${route === "/" ? "" : route}/page.tsx`, import.meta.url);
    page = ts.createSourceFile(path.pathname, await readFile(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    pages.set(route, page);
  }

  let excerpt = "";
  if (anchor) {
    let section;
    const find = node => {
      if (ts.isJsxElement(node) && node.openingElement.attributes.properties.some(prop =>
        ts.isJsxAttribute(prop) && prop.name.getText(page) === "id" && prop.initializer &&
        ts.isStringLiteral(prop.initializer) && prop.initializer.text === anchor)) section = node;
      if (!section) ts.forEachChild(node, find);
    };
    find(page);
    if (!section) throw new Error(`Missing public knowledge anchor: ${record.href}`);
    const intro = section.children.find(node => ts.isJsxElement(node) && node.openingElement.tagName.getText(page) === "Intro");
    if (intro) excerpt = intro.children.filter(ts.isJsxText).map(node => node.getText(page).trim()).join(" ");
  } else {
    const declaration = page.statements.filter(ts.isVariableStatement)
      .flatMap(statement => [...statement.declarationList.declarations])
      .find(node => node.name.getText(page) === "metadata");
    const metadata = declaration?.initializer;
    if (metadata && ts.isObjectLiteralExpression(metadata)) {
      const description = metadata.properties.find(prop => ts.isPropertyAssignment(prop) && prop.name.getText(page) === "description");
      if (description && ts.isPropertyAssignment(description) && ts.isStringLiteral(description.initializer)) excerpt = description.initializer.text;
    }
  }
  snapshot.push({ ...record, siteExcerpt: excerpt.replace(/\s+/g, " ").trim() });
}
if (!snapshot.length) throw new Error("No public Vectra knowledge records.");
await writeFile(new URL("../lib/vectra/published.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Validated ${snapshot.length} public knowledge records across ${pages.size} routes.`);

if (process.env.VECTRA_STAGE_KNOWLEDGE === "1" && process.env.VECTRA_DATABASE_URL && process.env.OPENAI_API_KEY) {
  const { Client } = await import("pg");
  const { stageKnowledge } = await import("./stage-vera-knowledge.mjs");
  const version = knowledgeVersion(snapshot);
  const client = new Client(databaseConfig(process.env.VECTRA_PUBLISH_DATABASE_URL || process.env.VECTRA_DATABASE_URL));
  try {
    await client.connect();
    await stageKnowledge(client, snapshot);
    console.log(`Staged Vectra knowledge ${version.slice(0, 12)} for this build.`);
  } catch (error) {
    console.error("Could not stage Vectra knowledge. Verify the configured database connection and migration.");
    console.error("Stage failure:", error.code || error.name,
      String(error.message).replace(/postgres(?:ql)?:\/\/\S+/gi, "[connection]").replace(/sk-[\w-]+/g, "[credential]"));
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}
