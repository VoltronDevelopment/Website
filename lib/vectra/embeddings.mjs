export const embeddingModel = "text-embedding-3-small";
export const embeddingDimensions = 1536;

export async function embedTexts(texts, apiKey = process.env.OPENAI_API_KEY) {
  if (!apiKey) throw new Error("Embedding credential missing");
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(6000),
    body: JSON.stringify({ model: embeddingModel, dimensions: embeddingDimensions, input: texts }),
  });
  if (!response.ok) throw new Error("Embedding service failed");
  const result = await response.json();
  if (!Array.isArray(result.data) || result.data.length !== texts.length) throw new Error("Invalid embedding count");
  const ordered = result.data.sort((a, b) => a.index - b.index);
  return ordered.map((item, index) => {
    if (item.index !== index || !Array.isArray(item.embedding) || item.embedding.length !== embeddingDimensions ||
        item.embedding.some(value => !Number.isFinite(value))) throw new Error("Invalid embedding");
    return item.embedding;
  });
}
