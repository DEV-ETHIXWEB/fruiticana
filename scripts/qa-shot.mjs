// QA helper: node scripts/qa-shot.mjs <path> <outPrefix> [width] [fullPage]
// Captures a screenshot and prints console errors / failed requests.
import { chromium } from "playwright";

const [, , path = "/", out = "shot", width = "1440", full = "1"] = process.argv;
const base = process.env.QA_BASE || "http://localhost:4317";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(width) < 600 ? 860 : 900 }, deviceScaleFactor: 1 });
const problems = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && problems.push(`[${m.type()}] ${m.text().slice(0, 300)}`));
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => problems.push(`[failed] ${r.url()} ${r.failure()?.errorText}`));
page.on("response", (r) => r.status() >= 400 && problems.push(`[${r.status()}] ${r.url()}`));
await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 });
if (full === "1") {
  // Scroll through so in-view animations fire, then return to top.
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
}
await page.screenshot({ path: `${out}.png`, fullPage: full === "1" });
console.log(problems.length ? problems.join("\n") : "no console problems");
await browser.close();
