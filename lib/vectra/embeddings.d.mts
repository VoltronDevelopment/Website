export const embeddingModel: string;
export const embeddingDimensions: number;
export function embedTexts(texts: string[], apiKey?: string): Promise<number[][]>;
