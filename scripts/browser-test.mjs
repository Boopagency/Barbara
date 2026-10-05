import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { loadEnv } from "vite";
import { bookingUrl, validPhone } from "../src/booking.mjs";
const env = { ...loadEnv("production", process.cwd(), ""), ...process.env };
const phone = (env.VITE_WHATSAPP_NUMBER || "").trim();

const root = resolve("dist");
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".jpg": "image/jpeg",
};
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const file = resolve(root, `.${path === "/" ? "/index.html" : path}`);
  if (!file.startsWith(root + "/")) {
    res.writeHead(403).end();
    return;
  }
  try {
    const content = await readFile(file);
    res.setHeader(
      "Content-Type",
      types[extname(file)] || "application/octet-stream",
    );
    res.end(content);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const address = `http://127.0.0.1:${server.address().port}`;
const launchOptions = {
  headless: true,
  ...(process.env.BROWSER_EXECUTABLE_PATH
    ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
    : {}),
  ...(process.env.BROWSER_ARGS
    ? { args: JSON.parse(process.env.BROWSER_ARGS) }
    : {}),
};
let browser = await chromium.launch(launchOptions);
const errors = [];
try {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(address);
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(async () => {
      document.querySelectorAll("img").forEach((img) => {
        img.loading = "eager";
      });
      await Promise.all(
        [...document.images].map((img) => img.decode().catch(() => {})),
      );
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        broken: [...document.images]
          .filter((img) => !img.naturalWidth)
          .map((img) => img.src),
        titleCount: document.querySelectorAll("h1").length,
      };
    });
    assert.ok(
      layout.scrollWidth <= layout.width,
      `Horizontal overflow at ${width}: ${layout.scrollWidth}`,
    );
    assert.deepEqual(layout.broken, []);
    assert.equal(layout.titleCount, 1);
    console.log(`PASS responsive layout ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(address);
  await page.locator(".menu-toggle").click();
  assert.equal(
    await page.locator(".menu-toggle").getAttribute("aria-expanded"),
    "true",
  );
  await page.locator('#mobile-menu a[href="#atendimentos"]').click();
  assert.equal(
    await page.locator(".menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  console.log("PASS mobile navigation");
  for (const service of ["consulta", "vacinacao", "domiciliar"]) {
    const trigger = page.locator(
      `[data-location="services"][data-booking="${service}"]`,
    );
    await trigger.click();
    assert.ok(await page.locator(".booking-dialog").isVisible());
    assert.equal(
      await page.locator('input[name="service"]:checked').inputValue(),
      service,
    );
    assert.equal(
      await page.locator("#booking-continue").getAttribute("href"),
      bookingUrl(service, phone),
    );
    if (service === "consulta") {
      if (!validPhone(phone)) {
        await page.locator("#copy-message").click();
        const copied = await page.evaluate(() =>
          navigator.clipboard.readText(),
        );
        assert.match(copied, /consulta veterinária/);
      }
      await page.locator('input[value="vacinacao"]').check();
      assert.match(
        await page.locator("#booking-message").innerText(),
        /vacinação/,
      );
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        [],
        "Booking dialog accessibility",
      );
      await page.screenshot({ path: ".playwright/booking-mobile.png" });
    }
    await page.keyboard.press("Escape");
    assert.ok(await page.locator(".booking-dialog").isHidden());
    assert.ok(await trigger.evaluate((el) => el === document.activeElement));
  }
  console.log(
    "PASS service selection, clipboard, Escape, focus restoration, accessible dialog",
  );
  await page.locator("summary").first().click();
  assert.ok(
    await page
      .locator("details")
      .first()
      .evaluate((el) => el.open),
  );
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    [],
    "Page accessibility",
  );
  console.log("PASS FAQ and mobile accessibility");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(address);
  const desktopAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    desktopAudit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    [],
    "Desktop accessibility",
  );
  await page.screenshot({ path: ".playwright/desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: ".playwright/mobile.png", fullPage: true });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(address);
  for (const el of await page.locator("[data-reveal]").all())
    await el.scrollIntoViewIfNeeded();
  assert.equal(await page.locator("[data-reveal]:not(.is-visible)").count(), 0);
  console.log("PASS desktop accessibility and scroll reveals");
  await page.close();
  await context.close();
  await browser.close();
  browser = await chromium.launch(launchOptions);
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const plain = await noJs.newPage();
  await plain.goto(address);
  assert.equal(
    await plain.locator('[data-location="hero"]').getAttribute("href"),
    bookingUrl("geral", phone),
  );
  assert.ok(await plain.locator("#atendimentos").isVisible());
  assert.deepEqual(errors, []);
  console.log(
    "PASS no-JavaScript fallback; no browser errors or failed assets",
  );
  await noJs.close();
} finally {
  await browser.close();
  server.close();
}
