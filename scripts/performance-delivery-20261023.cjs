const fs = require('node:fs');
const path = require('node:path');
const base = 'https://www.voltronlattice.com';
const result = { date: '2026-10-23', documents: [], assets: [] };
function headers(response) { return Object.fromEntries(['cache-control', 'content-length', 'content-encoding', 'content-type', 'server', 'x-cache', 'x-amz-cf-pop', 'age', 'vary', 'etag'].map(k => [k, response.headers.get(k)])); }
(async () => {
  let html = '';
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    try { const r = await fetch(base, { signal: AbortSignal.timeout(15000) }); const responseMs = performance.now() - start; html = await r.text(); result.documents.push({ status: r.status, responseMs, totalMs: performance.now() - start, decodedBytes: Buffer.byteLength(html), headers: headers(r) }); }
    catch (e) { result.documents.push({ error: e.message }); }
  }
  const chunk = html.match(/src="([^"]*\/_next\/static\/[^"]+\.js)/)?.[1];
  for (const p of ['/Brand%20Assets/logo/light%20rectangle.png', '/Brand%20Assets/voltron%20brand%20page/voltron-hero-assets/voltron-mark-original.png', chunk].filter(Boolean)) {
    try { const r = await fetch(new URL(p, base), { method: 'HEAD', signal: AbortSignal.timeout(15000) }); result.assets.push({ path: p, status: r.status, headers: headers(r) }); }
    catch (e) { result.assets.push({ path: p, error: e.message }); }
  }
  fs.writeFileSync(path.resolve(__dirname, '../.audit-logs/performance-20261023/deployment-results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
})();
