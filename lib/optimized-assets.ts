import assets from './optimized-assets.json';

/** Authored originals stay untouched. Published derivatives have content-versioned URLs. */
export function optimizedAsset(source: string, small = false): string {
  let key = source;
  try { key = decodeURIComponent(source); } catch { /* Keep an unknown URL unchanged. */ }
  const asset=(assets as Record<string, {url:string;smallUrl?:string}>)[key];
  return (small ? asset?.smallUrl ?? asset?.url : asset?.url) ?? source;
}
