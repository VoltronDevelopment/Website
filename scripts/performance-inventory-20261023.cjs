const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.audit-logs/performance-20261023');
fs.mkdirSync(out, { recursive: true });
function files(folder) { return fs.readdirSync(folder, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(folder, e.name)) : [path.join(folder, e.name)]); }
function relative(file) { return path.relative(root, file).replaceAll('\\', '/'); }
(async () => {
  const assets = [];
  for (const file of files(path.join(root, 'public'))) {
    const buffer = fs.readFileSync(file), item = { file: relative(file), bytes: buffer.length };
    if (/\.(png|jpe?g|webp|avif)$/i.test(file)) { try { const m = await sharp(buffer).metadata(); Object.assign(item, { width: m.width, height: m.height, rgbaBytes: m.width * m.height * 4, hasAlpha: m.hasAlpha }); } catch {} }
    assets.push(item);
  }
  const chunks = files(path.join(root, '.next-performance-audit/static')).filter(f => /\.(js|css|woff2)$/.test(f)).map(file => {
    const buffer = fs.readFileSync(file);
    return { file: relative(file), bytes: buffer.length, gzip: zlib.gzipSync(buffer).length, brotli: zlib.brotliCompressSync(buffer).length };
  });
  const sources = [...files(path.join(root, 'app')), ...files(path.join(root, 'components')), ...files(path.join(root, 'lib')), path.join(root, 'next.config.ts'), path.join(root, 'middleware.ts')].filter(f => /\.(ts|tsx|js|css)$/.test(f)).map(file => ({ file: relative(file), sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }));
  const result = { measuredAt: '2026-10-23', assets: assets.sort((a, b) => b.bytes - a.bytes), chunks: chunks.sort((a, b) => b.bytes - a.bytes), sources, appBuildManifest: JSON.parse(fs.readFileSync(path.join(root, '.next-performance-audit/app-build-manifest.json'), 'utf8')) };
  fs.writeFileSync(path.join(out, 'static-inventory.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ assets: result.assets.slice(0, 18), chunks: result.chunks.slice(0, 14), totals: { assets: result.assets.reduce((s, x) => s + x.bytes, 0), js: result.chunks.filter(x => x.file.endsWith('.js')).reduce((s, x) => s + x.gzip, 0), css: result.chunks.filter(x => x.file.endsWith('.css')).reduce((s, x) => s + x.gzip, 0), fonts: result.chunks.filter(x => x.file.endsWith('.woff2')).reduce((s, x) => s + x.bytes, 0) } }, null, 2));
})();
