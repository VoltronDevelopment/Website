const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const bundledModules = path.join(require("node:os").homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules");
const { chromium } = require(require.resolve("playwright", { paths: [root, bundledModules] }));
const base = process.env.REVIEW_URL || "http://127.0.0.1:3071";
const output = path.join(root, ".audit-logs", "factory-reveal");
fs.mkdirSync(output, { recursive: true });
// Supply a session explicitly saved after normal founder sign-in. Never read app secrets or mint cookies.
const storageState = process.env.REVIEW_STORAGE_STATE;
if (!storageState) throw new Error("Set REVIEW_STORAGE_STATE to a session file saved after normal Founder sign-in before running browser checks.");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-unsafe-swiftshader", "--use-gl=angle"] });
  const report = { frames: [], checks: [], errors: [] };
  async function context(width, theme, extra = {}) {
    const ctx = await browser.newContext({ storageState, viewport: { width, height: width < 768 ? 844 : 900 }, reducedMotion: "no-preference", ...extra });
    await ctx.addInitScript(value => localStorage.setItem("voltron-lattice-theme", value), theme);
    return ctx;
  }
  async function pageIn(ctx) {
    const page = await ctx.newPage(); page.setDefaultTimeout(45000);
    page.on("pageerror", error => report.errors.push(error.message));
    page.on("console", message => { if (message.type() === "error" && /THREE|WebGL|shader/i.test(message.text())) report.errors.push(message.text()); });
    return page;
  }
  async function open(page, query = "") {
    await page.goto(base + "/" + query, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.locator("#factory-systems").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector(".factory-systems-stage")?.dataset.renderer === "webgl");
  }
  async function snapshot(page, name) {
    await page.locator("#factory-systems").screenshot({ path: path.join(output, name + ".png"), animations: "disabled" });
    const result = await page.evaluate(() => {
      const stage = document.querySelector(".factory-systems-stage"), canvas = stage.querySelector("canvas");
      return { phase: canvas.dataset.phase, time: canvas.dataset.animationTime, layout: stage.dataset.layout, running: canvas.dataset.running, overflow: document.documentElement.scrollWidth > innerWidth,
        labels: [...stage.querySelectorAll("h3")].map(node => ({ text: node.textContent, opacity: getComputedStyle(node).opacity })),
        stageHeight: stage.getBoundingClientRect().height };
    });
    assert.equal(result.overflow, false, name + " horizontal overflow");
    report.frames.push({ name, ...result }); console.log("Captured", name, result.phase);
  }
  try {
    const desktop = await context(1440, "dark"), page = await pageIn(desktop);
    for (const [time, name] of [[0, "component"], [2.25, "particle-housing"], [3.05, "separation"], [3.9, "cube-assembly"], [4.65, "artwork-reveal"], [6, "settled"]]) {
      await open(page, "?factory-time=" + time); await snapshot(page, "dark-desktop-" + name);
    }
    // Real elapsed-time playback, suspension, keyboard controls, replay and stable geometry.
    await open(page);
    await page.waitForFunction(() => Number(document.querySelector(".factory-systems-canvas").dataset.animationTime) > .2);
    const footprint = await page.locator(".factory-systems-stage").evaluate(node => node.getBoundingClientRect().height);
    await page.getByRole("button", { name: "Pause component reveal", exact: true }).focus();
    await page.keyboard.press("Enter");
    const pausedAt = await page.locator(".factory-systems-canvas").getAttribute("data-animation-time");
    await page.waitForTimeout(350);
    assert.equal(await page.locator(".factory-systems-canvas").getAttribute("data-animation-time"), pausedAt);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
    const hiddenAt = await page.locator(".factory-systems-canvas").getAttribute("data-animation-time");
    await page.waitForTimeout(350);
    assert.equal(await page.locator(".factory-systems-canvas").getAttribute("data-animation-time"), hiddenAt);
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(150);
    const offscreenAt = await page.locator(".factory-systems-canvas").getAttribute("data-animation-time");
    await page.waitForTimeout(350);
    assert.equal(await page.locator(".factory-systems-canvas").getAttribute("data-animation-time"), offscreenAt);
    await page.locator("#factory-systems").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector(".factory-systems-canvas").dataset.settled === "true", null, { timeout: 25000 });
    assert.equal(await page.locator(".factory-systems-stage").evaluate(node => node.getBoundingClientRect().height), footprint);
    assert.equal(await page.locator(".factory-systems-canvas").getAttribute("data-running"), "false");
    await page.getByRole("button", { name: "Replay component reveal", exact: true }).click();
    assert.equal(await page.locator(".factory-systems-canvas").getAttribute("data-phase"), "component");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => document.querySelector(".factory-systems-canvas").dataset.settled === "true");
    assert.equal(await page.locator(".factory-systems-controls").isVisible(), false);
    report.checks.push("keyboard pause/resume", "hidden-document event suspension", "offscreen suspension and resume", "stable layout", "stop at rest", "replay", "live reduced-motion change");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.evaluate(() => document.querySelector(".factory-systems-canvas").getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
    await page.waitForFunction(() => document.querySelector(".factory-systems-stage").dataset.renderer === "fallback");
    assert.equal(await page.locator(".factory-system-fallback").first().isVisible(), true);
    assert.equal(await page.locator(".factory-system h3").first().evaluate(n => getComputedStyle(n).opacity), "1");
    report.checks.push("GPU context loss restores completed fallback");
    await desktop.close();

    for (const [width, theme] of [[1440, "light"], [390, "dark"], [390, "light"]]) {
      const ctx = await context(width, theme), p = await pageIn(ctx);
      if (width === 390 && theme === "dark") {
        await open(p, "?factory-time=0"); await snapshot(p, "dark-mobile-component");
        await open(p, "?factory-time=2.25"); await snapshot(p, "dark-mobile-particle-housing");
      }
      await open(p, "?factory-time=6"); await snapshot(p, `${theme}-${width < 768 ? "mobile" : "desktop"}-settled`);
      await ctx.close();
    }
    for (const width of [320, 768, 800]) {
      const ctx = await context(width, "light", { reducedMotion: "reduce" }), p = await pageIn(ctx);
      await p.goto(base + "/", { waitUntil: "domcontentloaded" }); await p.locator("#factory-systems").scrollIntoViewIfNeeded();
      await p.waitForTimeout(350);
      const result = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, renderer: document.querySelector(".factory-systems-stage").dataset.renderer, labels: [...document.querySelectorAll(".factory-system h3")].map(n => getComputedStyle(n).opacity) }));
      assert.equal(result.overflow, false); assert.equal(result.renderer, undefined); assert.deepEqual(result.labels, ["1", "1", "1"]);
      report.checks.push(`initial reduced motion at ${width}px: full static composition, no renderer`);
      await ctx.close();
    }
    for (const mode of ["static", "no-javascript"]) {
      const ctx = await context(390, "dark", { javaScriptEnabled: mode !== "no-javascript" }), p = await pageIn(ctx);
      await p.goto(base + "/" + (mode === "static" ? "?renderer=static" : ""), { waitUntil: "domcontentloaded" });
      await p.locator("#factory-systems").scrollIntoViewIfNeeded();
      if (mode === "static") await p.waitForFunction(() => document.querySelector(".factory-systems-stage").dataset.renderer === "fallback");
      assert.equal(await p.locator(".factory-system-fallback img").count(), 3);
      assert.equal(await p.locator(".factory-system-fallback").first().isVisible(), true);
      assert.equal(await p.getByRole("heading", { name: "Intelligence", exact: true }).isVisible(), true);
      report.checks.push(mode + " complete fallback"); await ctx.close();
    }
    assert.deepEqual(report.errors, []);
    fs.writeFileSync(path.join(output, "verification.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ frames: report.frames.length, checks: report.checks, errors: report.errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
