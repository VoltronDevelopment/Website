const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || "playwright");
const assert = require("node:assert/strict");
const base = "http://127.0.0.1:3041";

(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  try {
    const context = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForFunction(() => document.documentElement.dataset.theme === "light");
    const second = await context.newPage();
    await second.goto(base, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await second.waitForFunction(() => localStorage.getItem("voltron-lattice-theme") === "dark");
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await second.waitForFunction(() => document.documentElement.dataset.theme === "light");
    await page.emulateMedia({ colorScheme: "dark" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    await page.goto(`${base}/partner`, { waitUntil: "networkidle" });
    await page.locator("#production-name").fill("Theme audit");
    await page.locator("#production-intent").selectOption({ label: "CED Coating" });
    const selectedIntent = await page.locator("#production-intent").inputValue();
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    assert.equal(await page.locator("#production-name").inputValue(), "Theme audit");
    assert.equal(await page.locator("#production-intent").inputValue(), selectedIntent);
    for (const theme of ["light", "dark"]) {
      await page.evaluate(theme => localStorage.setItem("voltron-lattice-theme", theme), theme);
      for (const width of [320, 390, 720, 768, 1100, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base, { waitUntil: "networkidle" });
        const metrics = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          logos: [...document.querySelectorAll(".brand-mark img")].filter(img => img.getBoundingClientRect().width).map(img => {
            const a = img.parentElement.getBoundingClientRect(), b = img.getBoundingClientRect();
            return b.left >= a.left && b.right <= a.right && b.top >= a.top && b.bottom <= a.bottom;
          }),
        }));
        assert.equal(metrics.overflow, false, `${theme} header at ${width}`);
        assert(metrics.logos.every(Boolean), `${theme} logo at ${width}`);
        if (width === 1440 || width === 390) await page.screenshot({ path: `.audit-logs/rebrand/home-${width}-${theme}.png`, fullPage: true });
      }
    }
    await context.close();
    const blocked = await browser.newContext({ colorScheme: "dark" });
    await blocked.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage disabled for audit"); } }));
    const blockedPage = await blocked.newPage();
    await blockedPage.goto(base, { waitUntil: "networkidle" });
    assert.equal(await blockedPage.locator("html").getAttribute("data-theme"), "dark");
    await blockedPage.getByRole("button", { name: "Switch to light theme" }).click();
    assert.equal(await blockedPage.locator("html").getAttribute("data-theme"), "light");
    await blocked.close();
    console.log("Passed: OS preference, OS changes, explicit override, cross-tab sync, blocked storage, preserved form values, and 12 final logo/layout checks.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
