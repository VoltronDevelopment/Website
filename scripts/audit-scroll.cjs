/* Frame callback intervals include artwork work. Scrolling may continue on the compositor. */
const assert = require('node:assert/strict');
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function gesture(page, cdp, mobile, x, y, dx, dy) {
  if (!mobile) {
    await page.mouse.move(x, y);
    for (let step=0; step<12; step++) {
      await page.mouse.wheel(dx/12, dy/12);
      await delay(17);
    }
    return;
  }
  await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x,y}]});
  for (let step=1; step<=10; step++) {
    const point = {x:x-dx*step/10, y:y-dy*step/10};
    await cdp.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[point]});
    await delay(20);
  }
  await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
}

async function measure(page, perform) {
  const start = await page.evaluate(() => {
    const sample = {gaps:[], previous:performance.now(), frame:0};
    function tick(time) {
      if (time > sample.previous) sample.gaps.push(time-sample.previous);
      sample.previous = time;
      sample.frame = requestAnimationFrame(tick);
    }
    window.scrollAudit = sample;
    sample.frame = requestAnimationFrame(tick);
    return scrollY;
  });
  await perform();
  await delay(100);
  return page.evaluate(start => {
    const {gaps,frame} = window.scrollAudit;
    cancelAnimationFrame(frame);
    gaps.sort((a,b)=>a-b);
    return {travel:scrollY-start, frames:gaps.length,
      p95:Math.round(gaps[Math.ceil(gaps.length*.95)-1]||0),
      longest:Math.round(gaps.at(-1)||0)};
  },start);
}

module.exports = async function auditScroll({makePage,base,report,save}) {
  const routes = ['/','/network','/about/voltron-commons','/technology','/manufacturing','/intelligence','/about','/partner','/credits'];
  report.scroll = [];
  report.cardNavigation = [];
  for (const mobile of [false,true]) {
    const {page,cdp,context} = await makePage({mobile,instrument:false});
    try {
      const {width,height} = page.viewportSize();
      for (const route of routes) {
        await page.goto(base+route,{waitUntil:'domcontentloaded'});
        assert.equal(new URL(page.url()).pathname, route);
        await delay(250);
        const extent = await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
        for (const position of (extent>height?[0,.45,.78]:[0])) {
          for (const pass of [1,2]) {
            await page.evaluate(top=>scrollTo({top,behavior:'instant'}),extent*position);
            await delay(160);
            const result = await measure(page,()=>gesture(page,cdp,mobile,width*.52,height*.65,0,mobile?180:336));
            report.scroll.push({route,mobile,position,pass,...result});
          }
        }
        save();
        if (route!=='/' && route!=='/technology') continue;
        const home = route==='/';
        const row = page.locator(home?'.application-grid':'.operating-digital-screens').first();
        const tabs = page.locator(home?'.application-tabs button':'.digital-mobile-tabs button');
        for (const last of [true,false]) {
          const tab = last?tabs.last():tabs.first();
          await tab.click();
          await page.waitForFunction(({selector,last})=>{
            const e=document.querySelector(selector);
            return Math.abs(e.scrollLeft-(last?e.scrollWidth-e.clientWidth:0))<12;
          }, {selector:home?'.application-grid':'.operating-digital-screens',last},{timeout:5000});
          assert.equal(await tab.getAttribute('aria-pressed'),'true');
        }
        await row.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
        await delay(600);
        const rect = await row.boundingBox();
        const x=rect.x+rect.width*.65, y=rect.y+rect.height*.5;
        const left=await row.evaluate(e=>e.scrollLeft);
        await gesture(page,cdp,mobile,x,y,mobile?190:336,0);
        await delay(500);
        const horizontal=await row.evaluate(e=>e.scrollLeft)-left;
        const top=await page.evaluate(()=>scrollY);
        await gesture(page,cdp,mobile,x,y,18,mobile?180:336);
        await delay(200);
        const vertical=await page.evaluate(()=>scrollY)-top;
        report.cardNavigation.push({route,mobile,horizontal,vertical});
        save();
        assert(horizontal>20 && vertical>20,'Card gesture failed on '+route);
      }
    } finally { await context.close(); }
  }
  report.scrollReview = report.scroll.filter(sample=>sample.longest>100 || sample.p95>20);
  console.log(report.scroll.length+' scroll samples, '+report.scrollReview.length+' timing samples for review.');
};

