/**
 * Renders /start to public/cnx-first-two-weeks.pdf.
 *
 * The PDF is generated from the live page rather than drawn by hand, so the
 * printed sheet cannot drift away from the listings. Re-run it after any price
 * or building change — a stale PDF in someone's downloads folder is exactly the
 * kind of quietly-wrong artifact this site is supposed to avoid.
 *
 *   npm run build            # must run first — this reads out/
 *   node scripts/generate-onepager.mjs
 *
 * Serves the exported `out/` directory over localhost because Chromium will not
 * resolve the page's absolute asset paths from a file:// URL.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const TARGET = path.join(ROOT, "public", "cnx-first-two-weeks.pdf");
const ROUTE = "/start";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

if (!fs.existsSync(OUT_DIR)) {
  console.error("No out/ directory. Run `npm run build` first.");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const candidates = [
    path.join(OUT_DIR, url),
    path.join(OUT_DIR, url, "index.html"),
    path.join(OUT_DIR, `${url}.html`),
  ];
  const file = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!file) {
    res.writeHead(404);
    return res.end("not found");
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage();

const problems = [];
page.on("pageerror", (e) => problems.push(String(e)));

await page.goto(`http://127.0.0.1:${port}${ROUTE}`, { waitUntil: "networkidle" });
// next/font self-hosts, but give the faces a beat to swap in before printing.
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

await page.emulateMedia({ media: "print" });
await page.pdf({
  path: TARGET,
  format: "A4",
  printBackground: true,
  margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
});

/*
  A brief that spills onto a second page is a brief nobody prints.
  Measure the *content* block, not #sheet — the latter carries
  `min-height: 297mm` in print, so it always reports a full page and any
  rounding tipped the check into a false positive.
*/
const fill = await page.evaluate(() => {
  const content = document.querySelector("#sheet > div");
  if (!content) return null;
  const A4_PX = 297 * (96 / 25.4); // 1122.5px at 96dpi
  return { ratio: content.getBoundingClientRect().height / A4_PX };
});

await browser.close();
server.close();

if (problems.length) {
  console.error("Page errors while rendering:", problems.slice(0, 5));
  process.exit(1);
}

const kb = (fs.statSync(TARGET).size / 1024).toFixed(0);
const pct = fill ? Math.round(fill.ratio * 100) : 0;
console.log(`Wrote ${path.relative(ROOT, TARGET)} — ${kb} KB, content fills ${pct}% of one A4.`);

if (fill && fill.ratio > 1) {
  console.error("\nThe sheet overflows onto a second page. Trim it before shipping.");
  process.exit(1);
}
// Half an empty page reads as unfinished, not as whitespace.
if (fill && fill.ratio < 0.82) {
  console.warn("\nMore than a fifth of the page is empty — the sheet looks unfinished.");
}
