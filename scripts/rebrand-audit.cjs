const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || "playwright");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const routes = ["/", "/technology", "/ontology", "/intelligence", "/manufacturing", "/network", "/about", "/about/people-culture", "/about/voltron-commons", "/partner"];
const out = path.resolve(".audit-logs/rebrand");
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  const failures = [];
  page.on("pageerror", error => failures.push(error.message));
  const results = [];
  try {
    for (const theme of ["light", "dark"]) {
      await page.goto("http://127.0.0.1:3041/", { waitUntil: "networkidle" });
      await page.evaluate(theme => localStorage.setItem("voltron-lattice-theme", theme), theme);
    for (const width of [1440, 390, 768, 320, 1100]) {
      await page.setViewportSize({ width, height: width > 767 ? 900 : 844 });
      for (const route of routes) {
        const response = await page.goto(`http://127.0.0.1:3041${route}`, { waitUntil: "networkidle", timeout: 120000 });
        await page.evaluate(() => document.fonts.ready);
        const metrics = await page.evaluate(() => ({
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth, h1: document.querySelectorAll("h1").length,
          title: document.querySelector("h1")?.textContent,
          brokenImages: [...document.images].filter(img => img.complete && img.naturalWidth === 0).map(img => img.src),
          font: getComputedStyle(document.body).fontFamily,
          theme: document.documentElement.dataset.theme,
          scheme: getComputedStyle(document.documentElement).colorScheme,
          scenes: [...document.querySelectorAll("main > .section,main > .hero")].map(el => {
            const box = el.getBoundingClientRect();
            const available = innerHeight - document.querySelector(".site-header").getBoundingClientRect().height;
            const content = [...el.children].map(child => child.getBoundingClientRect());
            return { height: box.height, minimum: available - (el.classList.contains("hero") ? 24 : 0), contained: content.every(child => child.top >= box.top - 1 && child.bottom <= box.bottom + 1), centered: el.classList.contains("hero") || Math.abs((content[0].top - box.top) - (box.bottom - content[0].bottom)) <= 2 };
          }),
          logoOverflow: [...document.querySelectorAll(".brand-mark img")].filter(img => { const b = img.getBoundingClientRect(), a = img.parentElement.getBoundingClientRect(); return b.width && (b.left < a.left - 1 || b.right > a.right + 1 || b.top < a.top - 1 || b.bottom > a.bottom + 1); }).length,
          artworkSpaces: [...document.querySelectorAll(".artwork-slot")].map(el => ({ family: el.dataset.artworkFamily, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height, hidden: el.getAttribute("aria-hidden"), empty: el.childElementCount === 0 && el.textContent === "" })),
          artworkOverflow: [...document.querySelectorAll(".brand-art")].filter(el => { if (!el.offsetHeight) return false; const a = el.getBoundingClientRect(); return [...el.querySelectorAll("svg")].some(svg => { const b = svg.getBoundingClientRect(); return b.width > a.width + 1 || b.height > a.height + 1; }); }).map(el => el.className),
          wrongThemeArt: [...document.querySelectorAll(`.art-theme-${document.documentElement.dataset.theme === "dark" ? "light" : "dark"}`)].filter(el => el.getBoundingClientRect().width > 0).length,
        }));
        const contrastFailures = await page.evaluate(() => {
          const rgb = value => (value.match(/[\d.]+/g) || []).map(Number);
          const luminance = color => color.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
          const failures = [];
          for (const el of document.querySelectorAll("body *")) {
            if (!el.getBoundingClientRect().width || el.closest("svg,.sr-only,[disabled]")) continue;
            if (![...el.childNodes].some(node => node.nodeType === 3 && node.textContent.trim())) continue;
            const style = getComputedStyle(el);
            let parent = el, background;
            while (parent) { const candidate = rgb(getComputedStyle(parent).backgroundColor); if (candidate.length === 3 || candidate[3] === 1) { background = candidate; break; } parent = parent.parentElement; }
            if (!background) continue;
            const a = luminance(rgb(style.color)), b = luminance(background);
            const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
            const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
            if (ratio + .01 < (large ? 3 : 4.5)) failures.push({ text: el.textContent.trim().slice(0, 70), ratio });
          }
          return failures;
        });
        assert.equal(response.status(), 200, `${route} HTTP status`);
        assert.equal(metrics.theme, theme, `${route} wrong theme`);
        assert.equal(metrics.scheme, theme, `${route} native color scheme`);
        assert.equal(metrics.logoOverflow, 0, `${route} clipped logo`);
        assert.equal(metrics.wrongThemeArt, 0, `${route} wrong artwork variant`);
        assert.equal(contrastFailures.length, 0, `${route} ${theme} text contrast: ${JSON.stringify(contrastFailures)}`);
        assert.equal(metrics.h1, 1, `${route} H1`);
        for (const scene of metrics.scenes) {
          assert(scene.height >= scene.minimum - 1, `${route} undersized scene at ${width}`);
          assert(scene.contained, `${route} scene clips content at ${width}`);
          assert(scene.centered, `${route} scene content is not vertically centered at ${width}`);
        }
        assert(metrics.scrollWidth <= metrics.width, `${route} overflows at ${width}: ${metrics.scrollWidth}`);
        assert.equal(metrics.brokenImages.length, 0, `${route} broken images`);
        assert.equal(metrics.artworkOverflow.length, 0, `${route} artwork overflow: ${metrics.artworkOverflow.join(", ")}`);
        for (const slot of metrics.artworkSpaces) {
          assert(slot.family && slot.empty && slot.hidden === "true", `${route} invalid artwork space`);
          assert(slot.width >= 80 && slot.height >= 112, `${route} collapsed artwork space: ${slot.family}`);
        }
        results.push({ route, viewport: width, ...metrics });
        if (width === 1440 || width === 390) {
          // Reveal on-scroll artwork before capturing a complete page.
          await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 650) { scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 80)); } scrollTo(0, 0); });
          await page.waitForTimeout(1600);
          await page.screenshot({ path: path.join(out, `${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}-${theme}.png`), fullPage: true });
        }
      }
    }
    }
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    await page.getByRole("button", { name: "Switch to dark theme" }).focus();
    await page.keyboard.press("Space");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://127.0.0.1:3041/technology");
    await page.getByRole("button", { name: /^Execution ERP/ }).click();
    assert.equal(await page.getByRole("button", { name: /^Execution ERP/ }).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "About", exact: true }).click();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("button", { name: "About", exact: true }).getAttribute("aria-expanded"), "false");
    await page.goto("http://127.0.0.1:3041/intelligence");
    await page.getByRole("button", { name: "Lab report", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "Lab report", exact: true }).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: /^MEKO/ }).click();
    await page.getByRole("button", { name: "Record illustrative review" }).click();
    assert(await page.getByText("Human review recorded in this illustration.", { exact: false }).isVisible());
    await page.goto("http://127.0.0.1:3041/partner?interest=commons#partnership");
    assert.equal(await page.locator("#partnership-intent").inputValue(), "Commons collaboration");
    const production = page.getByRole("form", { name: "Production inquiry", exact: true });
    await production.getByRole("button", { name: "Submit production inquiry" }).click();
    assert.equal(await page.locator("#production-name").evaluate(el => document.activeElement === el), true);
    await page.locator("#production-name").fill("Layout audit");
    await page.locator("#production-email").fill("layout@example.com");
    await page.locator("#production-intent").selectOption({ label: "Phosphating" });
    let calls = 0;
    await page.route("**/api/inquiries", async route => { calls++; await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ ok: false, message: "Audit failure. Please retry." }) }); });
    await production.getByRole("button", { name: "Submit production inquiry" }).click();
    await production.getByRole("alert").waitFor();
    assert.equal(await page.locator("#production-name").inputValue(), "Layout audit");
    await page.unroute("**/api/inquiries");
    await page.route("**/api/inquiries", async route => { calls++; await new Promise(resolve => setTimeout(resolve, 400)); await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, inquiryId: "audit-only" }) }); });
    await production.getByRole("button", { name: "Submit production inquiry" }).click();
    await production.getByRole("status").waitFor();
    assert.equal(calls, 2);
    assert(await page.locator("#production-name").isDisabled());
    await page.unroute("**/api/inquiries");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://127.0.0.1:3041/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("button", { name: "About", exact: true }).click();
    await page.getByRole("link", { name: "People Culture", exact: true }).click();
    await page.waitForURL("**/about/people-culture");
    assert(page.url().endsWith("/about/people-culture"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("http://127.0.0.1:3041/");
    const animation = await page.locator(".brand-art .module").first().evaluate(el => getComputedStyle(el).animationName);
    assert.equal(animation, "none");
    assert.equal(failures.length, 0, failures.join("\n"));
    fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ results, interactions: "passed", pageErrors: failures }, null, 2));
    console.log(JSON.stringify({ routes: routes.length, viewportChecks: results.length, themes: 2, interactions: "passed", screenshots: 40, pageErrors: failures.length }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
