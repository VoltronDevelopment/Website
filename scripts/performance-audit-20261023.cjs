/* Read-only production performance audit. Starts an isolated local fixture server.
 * No real credentials are read, no inquiries are submitted, and no app source is changed. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')] }));
const root = path.resolve(__dirname, '..');
const out = path.resolve(root, process.env.AUDIT_OUTPUT_DIR || '.audit-logs/performance-20261023');
fs.mkdirSync(out, { recursive: true });
const port = process.env.AUDIT_DETAIL ? '3098' : '3097';
const base = 'http://127.0.0.1:' + port;
const password = crypto.randomBytes(24).toString('hex');
const salt = crypto.randomBytes(16);
const digest = crypto.scryptSync(password, salt, 32).toString('hex');
const record = name => `${name}:${salt.toString('hex')}:${digest}`;
const serverLog = fs.openSync(path.join(out, process.env.AUDIT_DETAIL ? 'detail-server.log' : 'server.log'), 'w');
const server = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', port], {
  cwd: root, windowsHide: true, stdio: ['ignore', serverLog, serverLog],
  env: { ...process.env, NEXT_DIST_DIR: process.env.AUDIT_DIST_DIR || '.next-performance-audit', FOUNDER_CREDENTIALS: [record('auditone'), record('audittwo')].join(','), FOUNDER_SESSION_SECRET: crypto.randomBytes(48).toString('hex') }
});
const report = { date: '2026-10-23', mode: 'Next.js production; local fixture login; no real credentials', limitations: ['Local network does not measure production CDN or regional TTFB.', 'Headless Chromium GPU capability must be consulted before interpreting frame timings.', 'Event Timing observations are lab interactions, not field INP.', 'Instrumentation adds overhead; no Lighthouse score is claimed.'], routes: [], profiles: [], lifecycle: {}, errors: [] };
const save = () => fs.writeFileSync(path.join(out, process.env.AUDIT_DETAIL ? 'browser-details.json' : 'browser-results.json'), JSON.stringify(report, null, 2));
const log = message => { console.log(new Date().toISOString(), message); save(); };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function instrumentation() {
  const state = window.__perfAudit = { lcp: null, cls: 0, clsMax: 0, shiftStart: 0, shiftLast: 0, shifts: [], longTasks: [], interactions: [], contexts: [], rafCosts: [], rafCount: 0, errors: [] };
  for (const [type, fn] of [
    ['largest-contentful-paint', e => state.lcp = { time: e.startTime, size: e.size, tag: e.element?.tagName, text: e.element?.textContent?.slice(0, 100), url: e.url }],
    ['layout-shift', e => { if (e.hadRecentInput) return; if (e.startTime - state.shiftLast > 1000 || e.startTime - state.shiftStart > 5000) { state.cls = 0; state.shiftStart = e.startTime; } state.shiftLast = e.startTime; state.cls += e.value; state.clsMax = Math.max(state.clsMax, state.cls); state.shifts.push({ time: e.startTime, value: e.value }); }],
    ['longtask', e => state.longTasks.push({ start: e.startTime, duration: e.duration })],
    ['event', e => { if (e.interactionId) state.interactions.push({ name: e.name, duration: e.duration, inputDelay: e.processingStart - e.startTime }); }]
  ]) { try { new PerformanceObserver(list => list.getEntries().forEach(fn)).observe({ type, buffered: true, ...(type === 'event' ? { durationThreshold: 16 } : {}) }); } catch {} }
  const nativeRaf = window.requestAnimationFrame;
  window.requestAnimationFrame = function (fn) { return nativeRaf.call(window, t => { const start = performance.now(); try { fn(t); } finally { state.rafCount++; state.rafCosts.push(performance.now() - start); if (state.rafCosts.length > 10000) state.rafCosts.shift(); } }); };
  const get = HTMLCanvasElement.prototype.getContext, seen = new WeakMap();
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    const gl = get.call(this, type, ...args);
    if (gl && /^(webgl2?|experimental-webgl)$/.test(type) && !seen.has(gl)) {
      const entry = { id: state.contexts.length, canvas: new WeakRef(this), gl: new WeakRef(gl), type, draws: 0, clears: 0, resources: {}, lost: false, createdAt: performance.now() };
      seen.set(gl, entry); state.contexts.push(entry);
      this.addEventListener('webglcontextlost', () => { entry.lost = true; });
      for (const name of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced', 'clear']) {
        const original = gl[name]; if (!original) continue;
        gl[name] = function (...values) { if (name === 'clear') entry.clears++; else entry.draws++; return original.apply(this, values); };
      }
      for (const kind of ['Buffer', 'Texture', 'Program', 'Shader', 'Framebuffer', 'Renderbuffer', 'VertexArray']) {
        entry.resources[kind] = 0;
        for (const [prefix, delta] of [['create', 1], ['delete', -1]]) { const name = prefix + kind, original = gl[name]; if (!original) continue; gl[name] = function (...values) { const result = original.apply(this, values); if (prefix === 'create' ? result : values[0]) entry.resources[kind] += delta; return result; }; }
      }
    }
    return gl;
  };
}
function snapshot() {
  const a = window.__perfAudit, nav = performance.getEntriesByType('navigation')[0], resources = performance.getEntriesByType('resource');
  const sorted = [...a.rafCosts].sort((x, y) => x - y), percentile = n => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * n))] : 0;
  return { url: location.pathname, time: performance.now(), title: document.title, h1: document.querySelector('h1')?.textContent, ttfb: nav?.responseStart, domContentLoaded: nav?.domContentLoadedEventEnd, load: nav?.loadEventEnd, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime, lcp: a.lcp, cls: a.clsMax, longTasks: { count: a.longTasks.length, total: a.longTasks.reduce((s, t) => s + t.duration, 0), max: Math.max(0, ...a.longTasks.map(x => x.duration)), blockingTimeProxy: a.longTasks.reduce((s, t) => s + Math.max(0, t.duration - 50), 0), entries: a.longTasks.slice(0, 35) }, interactions: a.interactions, raf: { count: a.rafCount, medianCallbackMs: percentile(.5), p95CallbackMs: percentile(.95), maxCallbackMs: sorted.at(-1) || 0 }, resources: resources.map(r => ({ name: r.name.replace(location.origin, ''), type: r.initiatorType, start: r.startTime, end: r.responseEnd, transfer: r.transferSize, encoded: r.encodedBodySize, decoded: r.decodedBodySize })), canvas: [...document.querySelectorAll('canvas')].map(c => ({ className: c.className, connected: c.isConnected, visible: c.getBoundingClientRect().bottom > 0 && c.getBoundingClientRect().top < innerHeight && c.getBoundingClientRect().width > 0 && !c.hidden, width: c.width, height: c.height, data: { ...c.dataset }, parentData: { ...c.parentElement?.dataset } })), contexts: a.contexts.map(e => ({ id: e.id, connected: e.canvas.deref()?.isConnected || false, alive: !!e.gl.deref(), lost: e.lost, className: e.canvas.deref()?.className, width: e.canvas.deref()?.width, height: e.canvas.deref()?.height, draws: e.draws, clears: e.clears, resources: e.resources, createdAt: e.createdAt })), domNodes: document.getElementsByTagName('*').length, pageHeight: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth > innerWidth, cssAnimations: document.getAnimations().map(a => ({ name: a.animationName || '', playState: a.playState, target: a.effect?.target?.className })).filter(a => a.playState === 'running'), heap: performance.memory?.usedJSHeapSize };
}
(async () => {
  let browser;
  try {
    for (let i = 0; i < 100; i++) { try { const r = await fetch(base + '/coming-soon'); if (r.ok) break; } catch {} if (server.exitCode !== null) throw new Error('Audit server exited'); await sleep(300); }
    browser = await chromium.launch({ ...(process.env.AUDIT_BROWSER==='chromium'?{}:{channel:'chrome'}), headless: true, args: ['--enable-unsafe-swiftshader', '--use-gl=angle'] });
    const browserCdp = await browser.newBrowserCDPSession();
    const system = await browserCdp.send('SystemInfo.getInfo');
    report.environment = { browser: browser.version(), gpu: system.gpu.devices, auxiliary: system.gpu.auxAttributes, featureStatus: system.gpu.featureStatus };
    const auth = await browser.newContext();
    // The temporary login closes at launch. Public routes then need no fixture session.
    if(Date.now()<Date.parse('2026-11-07T18:30:00.000Z')) {
      const login = await auth.request.post(base + '/api/founder/login', { headers: { Origin: base }, data: { username: 'auditone', password } });
      if (login.status() !== 200) throw new Error('Local fixture login failed: ' + login.status());
    }
    const storageState = await auth.storageState(); await auth.close();
    async function makePage({ mobile = false, theme = 'light', reduced = false, js = true, webgl = true, throttle = false, instrument = true, authenticated = true } = {}) {
      const context = await browser.newContext({ ...(authenticated ? { storageState } : {}), viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile, reducedMotion: reduced ? 'reduce' : 'no-preference', javaScriptEnabled: js });
      if (js) { await context.addInitScript(t => localStorage.setItem('voltron-lattice-theme', t), theme); if (instrument) await context.addInitScript(instrumentation); if (!webgl) await context.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/.test(type) ? null : get.call(this, type, ...args); }; }); }
      const page = await context.newPage(); page.setDefaultTimeout(25000);
      page.on('pageerror', e => report.errors.push({ url: page.url(), message: e.message }));
      page.on('console', m => { if (m.type() === 'error' || /Too many active WebGL contexts|CONTEXT_LOST/.test(m.text())) report.errors.push({ url: page.url(), message: m.text().slice(0, 350) }); });
      const cdp = await context.newCDPSession(page); await cdp.send('Performance.enable');
      if (throttle) { await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8, connectionType: 'cellular4g' }); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
      return { context, page, cdp };
    }
    if(process.env.AUDIT_CACHE_ONLY) {
      const asset=require(path.join(root,'lib/optimized-assets.json'))['/Brand Assets/voltron brand page/voltron-hero-assets/voltron-mark-original.png'].url;
      const response=await fetch(base.replace('localhost','127.0.0.1')+asset);
      report.assetCache=response.headers.get('cache-control');
      if(response.status!==200||!report.assetCache?.includes('immutable'))throw new Error('Versioned artwork caching failed');
      log('Cache verification passed');return;
    }
    if (process.env.AUDIT_CI) {
      const assert=require('node:assert/strict');
      const p=await makePage();await p.page.goto(base,{waitUntil:'load'});await sleep(2000);
      const initial=await p.page.evaluate(snapshot);report.routes.push(initial);
      assert(initial.resources.reduce((s,x)=>s+x.transfer,0)<1000000,'Home initial transfer exceeds 1 MB');
      assert(!initial.resources.some(x=>x.name.includes('/Brand%20Assets/logo/')&&x.transfer>100000),'Oversized source logo requested');
      report.lifecycle.navigation=[];
      for(let i=0;i<30;i++) {
        const route=i%2===0?'/technology':'/';await p.page.locator(`.site-header a[href="${route}"]`).first().click();await p.page.waitForURL(base+route);
        await p.page.waitForFunction(()=>document.querySelector('[data-lattice-slot]')?.dataset.live==='true');await sleep(250);await p.cdp.send('HeapProfiler.collectGarbage');
        report.lifecycle.navigation.push(await p.page.evaluate(snapshot));
      }
      for(const route of ['/','/technology']) {
        const samples=report.lifecycle.navigation.filter(x=>x.url===route).slice(2).map(x=>x.contexts[0].resources.Buffer);
        assert(Math.max(...samples)-Math.min(...samples)<=20,'Persistent GPU buffers grow on '+route);
      }
      await p.context.close();
      const reduced=await makePage({reduced:true});await reduced.page.goto(base,{waitUntil:'load'});await sleep(500);const still=await reduced.page.evaluate(snapshot);report.lifecycle.reduced=still;
      assert.equal(still.contexts.length,0,'Reduced motion started a WebGL context');
      const poster=await reduced.page.locator('[data-lattice-slot] .scene-poster img.art-theme-light').evaluate(n=>n.complete&&n.naturalWidth>0);assert(poster,'Static artwork did not load');await reduced.context.close();
      if(process.env.AUDIT_FINAL) {
        for(const [route,reduced] of [['/',false],['/',true],['/manufacturing',false],['/about/people-culture',false]]) {
          const m=await makePage({mobile:true,throttle:true,reduced});await m.page.goto(base+route,{waitUntil:'load',timeout:120000});await sleep(2500);
          report.profiles.push({route,reduced,throttle:'150ms latency, 1.6Mbps down, 0.75Mbps up, CPU 4x; 390x844 DPR3',...await m.page.evaluate(snapshot)});await m.context.close();log('Final mobile '+route+' reduced='+reduced);
        }
        for(const route of ['/about/people-culture','/about/voltron-commons']) {
          const h=await makePage({theme:'dark'});await h.page.goto(base+route,{waitUntil:'load'});await sleep(7000);
          report.routes.push(await h.page.evaluate(snapshot));await h.page.screenshot({path:path.join(out,route.replaceAll('/','-')+'.png')});await h.context.close();
        }
        const alpha=await makePage();await alpha.page.goto(base+'/manufacturing',{waitUntil:'load'});await alpha.page.locator('.alpha-line-art').scrollIntoViewIfNeeded();await sleep(1500);
        const follow=alpha.page.getByRole('button',{name:'Follow a lot',exact:true});if(await follow.isVisible())await follow.click();
        report.lifecycle.alphaStart=await alpha.page.evaluate(snapshot);await sleep(5000);report.lifecycle.alphaPlaying=await alpha.page.evaluate(snapshot);log('Final Alpha soak started');
        await sleep(120000);report.lifecycle.alphaSoak=await alpha.page.evaluate(snapshot);await sleep(1000);report.lifecycle.alphaRest=await alpha.page.evaluate(snapshot);
        assert.equal(report.lifecycle.alphaRest.raf.count,report.lifecycle.alphaSoak.raf.count,'Alpha did not stop after its tour');
        await alpha.page.evaluate(()=>document.querySelector('.alpha-line-art canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await sleep(500);
        report.lifecycle.alphaContextLoss=await alpha.page.evaluate(snapshot);assert(report.lifecycle.alphaContextLoss.canvas[0].parentData.fallback==='true','Alpha context loss did not restore fallback');await alpha.context.close();
        const nojs=await makePage({js:false});await nojs.page.goto(base,{waitUntil:'load'});assert(await nojs.page.locator('[data-lattice-slot] .scene-poster img').count()>0,'No-JavaScript artwork absent');await nojs.context.close();
        const asset=require(path.join(root,'lib/optimized-assets.json'))['/Brand Assets/voltron brand page/voltron-hero-assets/voltron-mark-original.png'].url;
        const response=await fetch(base.replace('localhost','127.0.0.1')+asset);report.assetCache=response.headers.get('cache-control');assert(report.assetCache.includes('immutable'),'Versioned asset caching missing');
      }
      log('CI regression checks passed');return;
    }
    if (process.env.AUDIT_CAPTURE) {
      const posters = {};
      for (const [name, route, selector] of [['home','/','[data-lattice-slot] svg.fallback'],['technology','/technology','[data-lattice-slot] svg.fallback'],['culture','/about/people-culture','.human-hero-art svg'],['commons','/about/voltron-commons','.human-hero-art svg']]) {
        posters[name] = {};
        for (const theme of ['light','dark']) {
          const p = await makePage({theme}); await p.page.goto(base+route+'?renderer=static',{waitUntil:'load'});
          await p.page.waitForSelector(selector,{state:'attached'});
          let svg = await p.page.locator(selector).evaluate(n=>n.outerHTML);
          svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
          const optimized = require(path.join(root,'lib/optimized-assets.json'));
          for (const [source,entry] of Object.entries(optimized)) svg = svg.split(source.split('/').map(encodeURIComponent).join('/')).join(entry.url);
          const hash = crypto.createHash('sha256').update(svg).digest('hex').slice(0,16);
          const filename = `poster-${name}-${theme}-${hash}.svg`;
          fs.writeFileSync(path.join(root,'public/optimized',filename),svg); posters[name][theme]='/optimized/'+filename;
          await p.context.close(); log('poster '+name+' '+theme);
        }
      }
      fs.writeFileSync(path.join(root,'lib/scene-posters.json'),JSON.stringify(posters,null,2)+'\n');return;
    }
    if (process.env.AUDIT_DETAIL) {
      report.details = [];
      for (const route of ['/', '/technology', '/manufacturing', '/about/people-culture', '/enter']) {
        const p = await makePage({ theme: 'dark' });
        await p.page.addInitScript(() => {
          window.__frameDetails = [];
          const raf = window.requestAnimationFrame;
          window.requestAnimationFrame = function (fn) { return raf.call(window, t => { const before = window.__perfAudit.contexts.map(c => c.draws), start = performance.now(); fn(t); const draws = window.__perfAudit.contexts.map((c, i) => c.draws - (before[i] || 0)); if (draws.some(Boolean)) window.__frameDetails.push({ start, ms: performance.now() - start, draws }); }); };
          window.__readyEvents = [];
          new MutationObserver(records => { for (const r of records) if (r.target.dataset.ready === 'true') window.__readyEvents.push({ time: performance.now(), tag: r.target.tagName, className: r.target.className, data: { ...r.target.dataset } }); }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-ready'] });
        });
        await p.cdp.send('Profiler.enable'); await p.cdp.send('Profiler.start');
        await p.page.goto(base + route, { waitUntil: 'domcontentloaded' });
        if (route === '/manufacturing') { await p.page.locator('.alpha-line-art').scrollIntoViewIfNeeded(); const follow=p.page.getByRole('button', { name: 'Follow a lot', exact: true });if(await follow.isVisible())await follow.click(); }
        if (route === '/') {
          await p.page.getByRole('button', { name: 'About', exact: true }).click();
          await p.page.keyboard.press('Escape');
        }
        await sleep(route === '/enter' ? 19000 : 7000);
        const cpu = await p.cdp.send('Profiler.stop');
        fs.writeFileSync(path.join(out, 'cpu-' + (route.replaceAll('/', '-') || 'home') + '.json'), JSON.stringify(cpu.profile));
        const item = { route, ...await p.page.evaluate(snapshot), frameDetails: await p.page.evaluate(() => window.__frameDetails), readyEvents: await p.page.evaluate(() => window.__readyEvents), metrics: (await p.cdp.send('Performance.getMetrics')).metrics };
        if (route === '/') { const start = Date.now(); await p.page.locator('.site-header a[href="/technology"]').click(); await p.page.waitForURL(base + '/technology'); item.navigationCommitMs = Date.now() - start; await sleep(1000); item.afterNavigate = await p.page.evaluate(snapshot); }
        if (route === '/manufacturing') {
          await p.page.getByRole('button', { name: /Pause/ }).first().click();
          await p.page.evaluate(() => { const canvas = document.querySelector('.alpha-line-art canvas'); canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext(); }); await sleep(500); item.contextLossFallback = await p.page.evaluate(snapshot);
        }
        report.details.push(item); log('detail ' + route); await p.context.close();
      }
      for (const route of ['/about/people-culture', '/technology']) {
        const p = await makePage({ webgl: false }); await p.page.goto(base + route, { waitUntil: 'load' }); await sleep(1500); report.details.push({ route, webgl: false, ...await p.page.evaluate(snapshot) }); await p.context.close();
      }
      log('details complete'); return;
    }
    const routes = ['/', '/technology', '/ontology', '/intelligence', '/manufacturing', '/network', '/about', '/about/people-culture', '/about/voltron-commons', '/partner'];
    for (const mobile of [false, true]) for (const route of routes) {
      const p = await makePage({ mobile }); const response = await p.page.goto(base + route, { waitUntil: 'load', timeout: 90000 }); await sleep(1200);
      const item = { route, mobile, status: response.status(), headers: { cacheControl: response.headers()['cache-control'], encoding: response.headers()['content-encoding'], vary: response.headers().vary }, ...await p.page.evaluate(snapshot) };
      report.routes.push(item); log(`route ${mobile ? 'mobile' : 'desktop'} ${route}: LCP ${Math.round(item.lcp?.time || 0)}ms; ${item.contexts.length} GL contexts`);
      if (['/', '/manufacturing', '/about/people-culture'].includes(route)) await p.page.screenshot({ path: path.join(out, `${mobile ? 'mobile' : 'desktop'}-${route.replaceAll('/', '-') || 'home'}.png`) });
      await p.context.close();
    }
    for (const [route, reduced] of [['/', false], ['/', true], ['/manufacturing', false], ['/about/people-culture', false]]) {
      const p = await makePage({ mobile: true, throttle: true, reduced });
      await p.page.goto(base + route, { waitUntil: 'load', timeout: 120000 }); await sleep(2500);
      report.profiles.push({ route, reduced, throttle: '150ms latency, 1.6Mbps down, 0.75Mbps up, CPU 4x; 390x844 DPR3', ...await p.page.evaluate(snapshot) });
      log(`throttled ${route} reduced=${reduced}`); await p.context.close();
    }
    const p = await makePage({ theme: 'dark' });
    await p.page.goto(base, { waitUntil: 'load' }); await sleep(18000);
    report.lifecycle.homeRest = await p.page.evaluate(snapshot); log('home at rest');
    for (const selector of ['#factory-systems', '#connected-lot', '#voltron-alpha', '#philosophy']) {
      await p.page.locator(selector).scrollIntoViewIfNeeded(); await sleep(selector === '#voltron-alpha' ? 6000 : 16000);
      const before = await p.page.evaluate(snapshot); await sleep(1000); const after = await p.page.evaluate(snapshot);
      report.lifecycle[selector] = { before, after, drawsOverOneSecond: after.contexts.map((c, i) => ({ id: c.id, draws: c.draws - (before.contexts[i]?.draws || 0), clears: c.clears - (before.contexts[i]?.clears || 0) })) };
      log('lifecycle ' + selector);
    }
    // Emulate a visibility event to test the app's listeners, not browser tab scheduling policy.
    await p.page.locator('#voltron-alpha').scrollIntoViewIfNeeded(); await sleep(500);
    await p.page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const hiddenBefore = await p.page.evaluate(snapshot); await sleep(1200); const hiddenAfter = await p.page.evaluate(snapshot);
    report.lifecycle.hiddenDocumentEvent = { before: hiddenBefore, after: hiddenAfter };
    await p.page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await p.context.close();
    // Real client navigation; compare resources after forced GC to reduce transient noise.
    const n = await makePage({ theme: 'dark' }); await n.page.goto(base, { waitUntil: 'load' }); await sleep(1500);
    report.lifecycle.navigation = [];
    for (let i = 0; i < 8; i++) {
      const route = i % 2 === 0 ? '/technology' : '/';
      const start = Date.now(); await n.page.locator(`.site-header a[href="${route}"]`).first().click();
      await n.page.waitForURL(base + route); await sleep(1100); await n.cdp.send('HeapProfiler.collectGarbage');
      report.lifecycle.navigation.push({ iteration: i, route, elapsedIncluding1100msWait: Date.now() - start, ...await n.page.evaluate(snapshot) });
      log(`navigation ${i} ${route}`);
    }
    // Latest click wins, then native back/forward.
    await n.page.evaluate(() => { document.querySelector('.site-header a[href="/technology"]').click(); setTimeout(() => document.querySelector('.site-header a[href="/"]').click(), 50); }); await sleep(2500);
    report.lifecycle.rapidNavigation = await n.page.evaluate(snapshot);
    await n.page.goBack(); await sleep(1000); report.lifecycle.back = await n.page.evaluate(snapshot);
    await n.page.goForward(); await sleep(1000); report.lifecycle.forward = await n.page.evaluate(snapshot);
    await n.context.close();
    for (const options of [{ reduced: true }, { webgl: false }, { js: false }]) {
      const f = await makePage(options); await f.page.goto(base, { waitUntil: 'load' }); await sleep(2000);
      report.lifecycle['fallback-' + Object.keys(options)[0]] = options.js === false ? await f.page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, heroChildren: document.querySelector('[data-lattice-slot]')?.innerHTML, canvases: document.querySelectorAll('canvas').length })) : await f.page.evaluate(snapshot);
      await f.page.screenshot({ path: path.join(out, 'fallback-' + Object.keys(options)[0] + '.png') }); await f.context.close(); log('fallback ' + Object.keys(options)[0]);
    }
    const alpha = await makePage(); await alpha.page.goto(base + '/manufacturing', { waitUntil: 'load' }); await alpha.page.locator('.alpha-line-art').scrollIntoViewIfNeeded(); await sleep(2500);
    report.lifecycle.alphaIdle = await alpha.page.evaluate(snapshot);
    const follow=alpha.page.getByRole('button', { name: 'Follow a lot', exact: true });if(await follow.isVisible())await follow.click(); await sleep(5000);
    report.lifecycle.alphaPlaying = await alpha.page.evaluate(snapshot); log('Alpha playback and 2 minute soak started');
    await sleep(120000); report.lifecycle.alphaSoak = await alpha.page.evaluate(snapshot);
    await alpha.cdp.send('HeapProfiler.collectGarbage'); report.lifecycle.alphaSoakAfterGC = await alpha.page.evaluate(snapshot);
    await alpha.context.close();
    const publicPage = await makePage({ authenticated: false }); await publicPage.page.goto(base + '/coming-soon', { waitUntil: 'load' }); await sleep(1500); report.publicHolding = await publicPage.page.evaluate(snapshot); await publicPage.context.close();
    log('complete');
  } catch (error) { report.fatal = error.stack; console.error(error.stack); save(); process.exitCode = 1; }
  finally { await browser?.close(); server.kill(); fs.closeSync(serverLog); save(); }
})();
