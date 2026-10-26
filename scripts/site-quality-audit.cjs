/* Local production QA: disposable credentials and normal login, no real secrets or submissions. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')] }));
const root = process.cwd(), phase = process.env.SITE_AUDIT_PHASE || 'baseline';
const accessibilityOnly = process.env.SITE_AUDIT_AXE_ONLY === '1';
const ci = process.env.SITE_AUDIT_CI === '1';
const extraOnly = process.env.SITE_AUDIT_EXTRA_ONLY === '1';
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const out = process.env.SITE_AUDIT_OUTPUT_DIR || path.join(root, '.audit-logs/site-quality-20261024', phase);
fs.mkdirSync(out, { recursive: true });
const port = '3102', base = 'http://127.0.0.1:' + port;
const password = crypto.randomBytes(24).toString('hex'), salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, Buffer.from(salt, 'hex'), 32).toString('hex');
const credentials = ['auditone', 'audittwo'].map(user => `${user}:${salt}:${hash}`).join(',');
const log = fs.openSync(path.join(out, 'server.log'), 'w');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', port], {
  cwd: root, windowsHide: true, stdio: ['ignore', log, log],
  env: { ...process.env, NEXT_DIST_DIR: process.env.SITE_AUDIT_DIST || '.next-ui-audit-20261024', FOUNDER_CREDENTIALS: credentials, FOUNDER_SESSION_SECRET: crypto.randomBytes(48).toString('hex') }
});
const report = { phase, date: new Date().toISOString(), routes: [], motion: [], interactions: [], errors: [], missing: [] };
const save = () => fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function instrument() {
  window.__quality = { cls: 0, shifts: [], longTasks: [], lcp: 0, frames: [], contexts: 0 };
  const q = window.__quality;
  for (const [type, handle] of [
    ['largest-contentful-paint', e => q.lcp = e.startTime],
    ['layout-shift', e => { if (!e.hadRecentInput) { q.cls += e.value; q.shifts.push(e.value); } }],
    ['longtask', e => q.longTasks.push(e.duration)]
  ]) try { new PerformanceObserver(list => list.getEntries().forEach(handle)).observe({type, buffered:true}); } catch {}
  const get = HTMLCanvasElement.prototype.getContext, seen = new WeakSet();
  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
    const value = get.call(this, type, ...args);
    if (value && /webgl/.test(type) && !seen.has(value)) { seen.add(value); q.contexts++; }
    return value;
  };
  const visible = e => !!e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' && getComputedStyle(e).opacity !== '0' && !e.hidden;
  function sample() {
    const slot = document.querySelector('[data-lattice-slot]');
    const stage = document.querySelector('[data-persistent-stage]'), canvas = stage?.querySelector('canvas');
    if (slot && stage && q.frames.length < 2500) {
      const posters = [...slot.querySelectorAll('.scene-poster img')].filter(visible).length;
      const svg = slot.querySelector('svg.fallback');
      const live = visible(stage) && visible(canvas) && Number(canvas.dataset.renderedFrames) > 0;
      q.frames.push({ handoff:slot.dataset.sceneState==='handoff', t: Math.round(performance.now()), route: location.pathname, posters, svg:visible(svg), live, ready:canvas?.dataset.ready, liveState:slot.dataset.live, transition:stage.dataset.transition, time:canvas?.dataset.animationTime });
    }
    if (performance.now() < 45000) requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
}
function measure() {
  const visible = e => { const r=e.getBoundingClientRect(),s=getComputedStyle(e); return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&!e.closest('[inert]'); };
  const label = e => e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent?.trim() || e.querySelector('img')?.alt || (e.labels?.length ? [...e.labels].map(l=>l.textContent).join(' ') : '');
  const ids = [...document.querySelectorAll('[id]')].map(e=>e.id);
  const interactive = [...document.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea')].filter(visible);
  const q=window.__quality, resources=performance.getEntriesByType('resource');
  const h1=document.querySelector('h1'), header=document.querySelector('.site-header');
  return { title:document.title, h1:[...document.querySelectorAll('h1')].map(e=>e.textContent), main:document.querySelectorAll('main').length,
    overflow:document.documentElement.scrollWidth-innerWidth, duplicateIds:[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))],
    unlabelled:interactive.filter(e=>!label(e)&&!e.getAttribute('aria-labelledby')).map(e=>e.outerHTML.slice(0,180)),
    smallTargets:interactive.filter(e=>e.matches('button,input,select')&&e.getBoundingClientRect().height<24).map(e=>({label:label(e),height:e.getBoundingClientRect().height})),
    brokenImages:[...document.images].filter(e=>e.complete&&e.currentSrc&&!e.naturalWidth).map(e=>e.currentSrc),
    missingAlt:[...document.images].filter(e=>!e.hasAttribute('alt')).map(e=>e.src),
    headingLevels:[...document.querySelectorAll('h1,h2,h3,h4')].map(e=>({level:Number(e.tagName[1]),text:e.textContent?.slice(0,75)})),
    font:getComputedStyle(document.body).fontFamily, headingSize:h1&&getComputedStyle(h1).fontSize, headingWeight:h1&&getComputedStyle(h1).fontWeight,
    headerHeight:header?.getBoundingClientRect().height, theme:document.documentElement.dataset.theme,
    cls:q.cls,lcp:q.lcp,longTasks:q.longTasks,contexts:q.contexts,transfer:resources.reduce((s,r)=>s+r.transferSize,0),
    canvases:[...document.querySelectorAll('canvas')].map(e=>({data:{...e.dataset},visible:visible(e)})),
    reservedArtwork:[...document.querySelectorAll('.artwork-slot')].map(e=>({family:e.dataset.artworkFamily,class:e.className})),
    overflowElements:[...document.querySelectorAll('main *')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.width>innerWidth+1&&r.left<innerWidth&&r.right>0;}).map(e=>({tag:e.tagName,class:e.className?.baseVal??e.className,width:Math.round(e.getBoundingClientRect().width)})).slice(0,15)
  };
}
(async()=>{
  let browser;
  try {
    let ready=false;
    for(let i=0;i<100;i++){try{if((await fetch(base+'/coming-soon')).ok){ready=true;break;}}catch{}if(server.exitCode!==null)throw Error('Fixture server exited');await sleep(200);}
    if(!ready)throw Error('Fixture server failed to start');
    browser=await chromium.launch({...(process.env.SITE_AUDIT_BROWSER==='chromium'?{}:{channel:'chrome'}),headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle']});
    const auth=await browser.newContext();
    if(Date.now()<Date.parse('2026-11-07T18:30:00Z')) {
      const login=await auth.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'auditone',password}});
      if(login.status()!==200)throw Error('Fixture login failed '+login.status());
    }
    const storageState=await auth.storageState();await auth.close();
    async function context(width,theme,motion='reduce') {
      const context=await browser.newContext({storageState,viewport:{width,height:width<768?844:900},deviceScaleFactor:width<768?2:1,isMobile:width<768,hasTouch:width<768,reducedMotion:motion});
      await context.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);
      await context.addInitScript(instrument);
      const page=await context.newPage();page.setDefaultTimeout(20000);
      page.on('pageerror',e=>report.errors.push({url:page.url(),width,theme,message:e.message}));
      page.on('response',r=>{if(r.status()>=400)report.missing.push({url:r.url(),status:r.status()});});
      return {context,page};
    }
    const routes=['/','/technology','/ontology','/intelligence','/manufacturing','/network','/about','/about/people-culture','/about/voltron-commons','/partner','/enter','/coming-soon'];
    for(const [width,theme] of (extraOnly?[]:ci?[[1440,'light'],[390,'dark']]:[[1440,'light'],[1440,'dark'],[390,'light'],[390,'dark'],[320,'light'],[768,'dark']])) {
      const p=await context(width,theme);
      const subset=width===320||width===768?['/','/technology','/ontology','/intelligence','/manufacturing','/partner','/enter']:routes;
      for(const route of subset) {
        await p.page.goto(base+route,{waitUntil:'load'});await p.page.evaluate(()=>document.fonts.ready);await sleep(200);
        const metrics=await p.page.evaluate(measure);
        await p.page.evaluate(axeSource);
        const accessibility=await p.page.evaluate(async()=>{
          const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
          return {violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};
        });
        report.routes.push({route,width,theme,...metrics,accessibility});save();
        const name=(route==='/'?'home':route.slice(1).replaceAll('/','-'))+'-'+width+'-'+theme;
        if(!accessibilityOnly&&!ci)await p.page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
        console.log('Page',route,width,theme,'overflow',metrics.overflow,'CLS',metrics.cls.toFixed(4));
      }
      await p.context.close();
    }
    if(accessibilityOnly){report.complete=true;return;}
    for(const [width,theme,slow] of (extraOnly?[]:[[1440,'light',false],[1440,'dark',true],[390,'light',false]])) {
      const p=await context(width,theme,'no-preference');
      if(slow){const cdp=await p.context.newCDPSession(p.page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});}
      await p.page.goto(base,{waitUntil:'domcontentloaded'});await sleep(800);
      await p.page.screenshot({path:path.join(out,`hero-opening-${width}-${theme}.png`)});
      await p.page.waitForFunction(()=>document.querySelector('[data-lattice-slot]')?.dataset.live==='true');await sleep(1200);
      await p.page.locator('.site-header a[href="/technology"]').first().evaluate(e=>e.click());await p.page.waitForURL(base+'/technology');await sleep(1600);
      await p.page.locator('.site-header a[href="/"]').first().evaluate(e=>e.click());await p.page.waitForURL(base+'/');await sleep(1400);
      const frames=await p.page.evaluate(()=>window.__quality.frames);
      report.motion.push({width,theme,slow,frames,overlap:frames.filter(f=>(f.live||f.svg)&&f.posters>0&&!f.handoff),metrics:await p.page.evaluate(measure)});save();
      await p.page.emulateMedia({reducedMotion:'reduce'});await sleep(300);
      report.interactions.push({name:'motion-preference-change',width,theme,...await p.page.evaluate(measure)});
      await p.page.emulateMedia({reducedMotion:'no-preference'});await sleep(600);
      report.interactions.push({name:'motion-preference-restore',width,theme,...await p.page.evaluate(measure)});
      await p.page.waitForFunction(()=>document.querySelector('[data-lattice-slot]')?.dataset.live==='true');
      const beforeResize=await p.page.locator('[data-persistent-stage] canvas:not([data-scene-blend])').evaluate(e=>Number(e.dataset.renderedFrames));
      await p.page.setViewportSize({width:width+16,height:width<768?844:900});await sleep(300);
      const afterResize=await p.page.locator('[data-persistent-stage] canvas:not([data-scene-blend])').evaluate(e=>Number(e.dataset.renderedFrames));
      report.interactions.push({name:'resize-preserves-scene',width,theme,beforeResize,afterResize});
      await p.context.close();console.log('Motion',width,theme,'overlap frames',report.motion.at(-1).overlap.length);
    }
    const p=await context(390,'light');await p.page.goto(base,{waitUntil:'load'});
    await p.page.getByRole('button',{name:'Open navigation',exact:true}).click();await p.page.getByRole('button',{name:'About',exact:true}).click();
    await p.page.keyboard.press('Escape');await p.page.keyboard.press('Escape');
    report.interactions.push({name:'mobile-menu-escape',...await p.page.evaluate(()=>({expanded:document.querySelector('.menu-toggle')?.getAttribute('aria-expanded'),focused:document.activeElement?.getAttribute('aria-label')}))});
    await p.page.goto(base+'/intelligence',{waitUntil:'load'});const calibration=p.page.getByRole('button',{name:'Calibration',exact:true});await calibration.click();assert.equal(await calibration.getAttribute('aria-pressed'),'true','Evidence source selection');
    report.interactions.push({name:'intelligence-selection',...await p.page.evaluate(measure)});
    await p.page.goto(base+'/ontology',{waitUntil:'load'});const equipment=p.page.getByRole('button',{name:'Equipment',exact:true});if(await equipment.count())await equipment.click();
    report.interactions.push({name:'ontology-selection',text:await p.page.locator('.ontology-explanation').textContent().catch(()=>null)});
    await p.page.goto(base,{waitUntil:'load'});
    await p.page.locator('.alpha-process').scrollIntoViewIfNeeded();
    report.interactions.push({name:'reduced-process-fallback',visible:await p.page.locator('.alpha-process-fallback').isVisible(),contexts:await p.page.evaluate(()=>window.__quality.contexts)});
    await p.context.close();
    const saver=await context(390,'light','no-preference');
    await saver.context.addInitScript(()=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true}}));
    await saver.page.goto(base,{waitUntil:'load'});await saver.page.locator('.alpha-process').scrollIntoViewIfNeeded();await sleep(300);
    report.interactions.push({name:'save-data-static',visible:await saver.page.locator('.alpha-process-fallback').isVisible(),contexts:await saver.page.evaluate(()=>window.__quality.contexts)});
    await saver.context.close();
    if(extraOnly) {
      const p=await context(390,'dark');
      if(Date.now()<Date.parse('2026-11-07T18:30:00Z')) {
        await p.page.goto(base+'/coming-soon',{waitUntil:'load'});
        await p.page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
        await p.page.evaluate(axeSource);
        const dark=await p.page.evaluate(async()=>({theme:document.documentElement.dataset.theme,violations:(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>v.id)}));
        assert.equal(dark.violations.length,0,'Coming-soon dark theme accessibility');
        await p.page.screenshot({path:path.join(out,'coming-soon-dark-preview.png')});
        await p.page.getByRole('button',{name:'Founder login',exact:true}).click();await p.page.keyboard.press('Escape');
        const focus=await p.page.evaluate(()=>document.activeElement?.getAttribute('aria-label'));
        assert.equal(focus,'Founder login','Founder dialog did not restore focus');
        report.interactions.push({name:'coming-soon-dark-preview',...dark,dialogFocus:focus});
      }
      for(const [alias,target] of [['/about/commons','/about/voltron-commons'],['/technology/ontology','/ontology']]){
        await p.page.goto(base+alias,{waitUntil:'load'});assert.equal(new URL(p.page.url()).pathname,target,'Route alias '+alias);
        report.interactions.push({name:'route-alias',alias,target});
      }
      await p.page.goto(base+'/enter',{waitUntil:'load'});
      await p.page.getByRole('link',{name:'Enter Lattice',exact:true}).click();await p.page.waitForURL(base+'/');
      await p.page.emulateMedia({reducedMotion:'no-preference'});await p.page.waitForFunction(()=>document.querySelector('[data-lattice-slot]')?.dataset.live==='true');await sleep(800);
      const frames=await p.page.evaluate(()=>window.__quality.frames);
      const overlap=frames.filter(f=>(f.live||f.svg)&&f.posters>0&&!f.handoff);
      assert.equal(overlap.length,0,'Entry-to-home doubled the hero');report.interactions.push({name:'entry-to-home',overlap:overlap.length});
      await p.context.close();
      for(const width of [1440,390]) {
        const p=await context(width,'light','no-preference');await p.page.goto(base,{waitUntil:'load'});
        const factory=p.page.locator('.factory-systems-stage');await factory.scrollIntoViewIfNeeded();
        await p.page.waitForFunction(()=>document.querySelector('.factory-systems-canvas')?.dataset.ready==='true');await sleep(400);
        await p.page.locator('.alpha-process').scrollIntoViewIfNeeded();await sleep(200);
        const paused=await p.page.locator('.factory-systems-canvas').getAttribute('data-animation-time');await sleep(500);
        assert.equal(await p.page.locator('.factory-systems-canvas').getAttribute('data-animation-time'),paused,'Offscreen component animation continued');
        await factory.scrollIntoViewIfNeeded();await p.page.waitForFunction(()=>document.querySelector('.factory-systems-canvas')?.dataset.settled==='true');
        const factoryState=await p.page.locator('.factory-systems-canvas').evaluate(e=>({...e.dataset}));
        await factory.screenshot({path:path.join(out,`component-reveal-${width}.png`)});
        const lot=p.page.locator('.lot-story-art');await lot.scrollIntoViewIfNeeded();
        await p.page.waitForFunction(()=>document.querySelector('.lot-story-canvas')?.dataset.ready==='true');
        await p.page.waitForFunction(()=>document.querySelector('.lot-story-canvas')?.dataset.settled==='true');
        const lotState=await p.page.locator('.lot-story-canvas').evaluate(e=>({...e.dataset}));
        await lot.screenshot({path:path.join(out,`lot-journey-${width}.png`)});
        const philosophy=p.page.locator('.home-cube-philosophy');await philosophy.scrollIntoViewIfNeeded();
        await p.page.waitForFunction(()=>document.querySelector('.home-cube-philosophy canvas')?.dataset.ready==='true');
        report.interactions.push({name:'homepage-scenes',width,factory:factoryState,lot:lotState,philosophy:await philosophy.locator('canvas').evaluate(e=>({...e.dataset}))});
        await p.context.close();save();console.log('Homepage scenes',width,'settled and paused offscreen');
      }
    }
    if(phase==='verified') {
      for(const route of report.routes){
        assert(route.overflow<=1,'Horizontal overflow '+route.route);
        assert.equal(route.main,1,'Main landmark '+route.route);
        assert.equal(route.h1.length,1,'H1 count '+route.route);
        for(const key of ['duplicateIds','unlabelled','smallTargets','brokenImages','missingAlt'])assert.equal(route[key].length,0,key+' '+route.route);
        assert.equal(route.accessibility.violations.length,0,'Accessibility violations '+route.route);
      }
      for(const sample of report.motion)assert.equal(sample.overlap.length,0,'Doubled hero '+sample.width+' '+sample.theme);
      for(const sample of report.interactions.filter(x=>x.name==='resize-preserves-scene'))assert(sample.afterResize>=sample.beforeResize,'Resize rebuilt the hero');
      assert(report.interactions.find(x=>x.name==='reduced-process-fallback').visible,'Reduced-motion process artwork missing');
      const saver=report.interactions.find(x=>x.name==='save-data-static');assert(saver.visible,'Save-Data process artwork missing');assert.equal(saver.contexts,0,'Save-Data started WebGL');
      assert.equal(report.errors.length,0,'Browser page errors');assert.equal(report.missing.length,0,'Missing resources');
    }
    report.complete=true;
  }catch(error){report.fatal=error.stack;process.exitCode=1;console.error(error.stack);}
  finally{save();await browser?.close();server.kill();fs.closeSync(log);}
})();
