import { createHash } from "node:crypto";
import { embedTexts, embeddingModel } from "../lib/vectra/embeddings.mjs";
import { knowledgeVersion } from "../lib/vectra/knowledge-version.mjs";

export async function stageKnowledge(client, records) {
  const version = knowledgeVersion(records);
  const chunks = [];
  for (let start = 0; start < records.length; start += 12) {
    const batch = records.slice(start, start + 12).map(record => {
      const text = [record.title, record.terms, record.body, record.qualification || ""].join("\n");
      return { record, text, hash: createHash("sha256").update(text).digest("hex") };
    });
    const cached = await client.query(
      "select distinct on (content_hash) content_hash, embedding::text from vectra.knowledge_chunks where content_hash = any($1::text[]) and embedding_model = $2",
      [batch.map(item => item.hash), embeddingModel]);
    const embeddings = new Map(cached.rows.map(row => [row.content_hash, row.embedding]));
    const missing = batch.filter(item => !embeddings.has(item.hash));
    if (missing.length) {
      const generated = await embedTexts(missing.map(item => item.text));
      missing.forEach((item, index) => embeddings.set(item.hash, JSON.stringify(generated[index])));
    }
    for (const item of batch) chunks.push({ ...item, embedding: embeddings.get(item.hash) });
  }
  const edges = new Map(records.flatMap(record => record.relationships || []).map(edge => [edge.id, edge]));
  await client.query("begin");
  try {
    await client.query("insert into vectra.knowledge_releases(version,records) values ($1,$2) on conflict do nothing", [version, JSON.stringify(records)]);
    for (const chunk of chunks) {
      await client.query(
        `insert into vectra.knowledge_chunks(release_version,id,topic_id,record,content_hash,embedding_model,embedding)
         values ($1,$2,$3,$4,$5,$6,$7::extensions.vector) on conflict do nothing`,
        [version, chunk.record.id, chunk.record.topicId, JSON.stringify(chunk.record), chunk.hash, embeddingModel, chunk.embedding]);
    }
    for (const edge of edges.values()) {
      await client.query(
        "insert into vectra.knowledge_edges values ($1,$2,$3,$4,$5,$6) on conflict do nothing",
        [version, edge.id, edge.from, edge.to, edge.relation, edge.status]);
    }
    const { rows } = await client.query(
      `select records, (select count(*)::int from vectra.knowledge_chunks where release_version=$1) as chunks,
       (select count(*)::int from vectra.knowledge_edges where release_version=$1) as edges
       from vectra.knowledge_releases where version=$1`, [version]);
    if (!rows[0] || knowledgeVersion(rows[0].records) !== version ||
        rows[0].chunks !== records.length || rows[0].edges !== edges.size) throw new Error("Knowledge release verification failed");
    await client.query("commit");
    return { version, chunks: chunks.length, edges: edges.size };
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}
