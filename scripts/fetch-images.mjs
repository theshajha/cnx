#!/usr/bin/env node
/**
 * Fetch hero images for CNX Cribs buildings using Playwright.
 * Uses headless Chromium to search Google Images and download
 * the first high-quality result for each building.
 */

import { chromium } from 'playwright';
import { writeFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public', 'buildings');
const MIN_SIZE = 30000; // 30KB

const BUILDINGS = [
  ["punna-nimman", "Punna Residence Nimman Chiang Mai condo exterior"],
  ["yantarasri-nimman", "Yantarasri at Nimman Chiang Mai building"],
  ["d-condo-nim", "dcondo nim Chiang Mai Sansiri building"],
  ["hillside-3", "Hillside 3 Condominium Chiang Mai building"],
  ["hillside-4", "Hillside 4 Condominium Chiang Mai"],
  ["hillside-2", "Hillside 2 Condominium Nimman Chiang Mai"],
  ["the-nimmana", "The Nimmana Condominium Chiang Mai pool"],
  ["the-unique-nimman", "The Unique at Nimman Chiang Mai condo"],
  ["the-unique-nimman-2", "The Unique at Nimman 2 Chiang Mai"],
  ["liv-nimman", "Liv Nimman Condominium Chiang Mai"],
  ["my-hip", "My Hip Condo Chiang Mai building"],
  ["s-condominium", "S Condominium Nimman Chiang Mai"],
  ["the-siri", "The Siri Condominium Chiang Mai"],
  ["palm-springs-nimman", "Palm Springs Nimman Condominium Chiang Mai"],
  ["the-empire-nimman", "The Empire Nimman Chiang Mai"],
  ["nivas-chiangmai", "Nivas Chiangmai serviced apartment"],
  ["green-hill-place", "Green Hill Place Chiang Mai"],
  ["the-bliss", "The Bliss Chiang Mai apartment"],
  ["the-mirror", "The Mirror Chiang Mai serviced apartment"],
  ["mountain-view", "Mountain View Condominium Chiang Mai"],
  ["trams-1", "Trams 1 Condominium Chiang Mai"],
  ["one-plus-huay-kaew", "One Plus Huay Kaew Condominium Chiang Mai"],
  ["the-cosy-hk", "The Cosy Huay Kaew Chiang Mai"],
  ["galare-thong-tower", "Galare Thong Tower Chiang Mai"],
  ["viengping-mansion", "Viengping Mansion Chiang Mai"],
  ["smith-residence", "Smith Residence Chiang Mai apartment"],
  ["smith-suites", "Smith Suites Chiang Mai"],
  ["view-doi-mansion", "View Doi Mansion Chiang Mai"],
  ["dvieng-santitham", "dVieng Santitham Sansiri Chiang Mai"],
  ["nakornping-condo", "Nakornping Condominium Chiang Mai"],
  ["huay-kaew-residence", "Huay Kaew Residence Chiang Mai"],
  ["srithana-condo", "Srithana Condominium 2 Chiang Mai"],
  ["supalai-monte-2", "Supalai Monte 2 Chiang Mai condo"],
  ["promt-condo", "Promt Condominium Chiang Mai"],
  ["doi-ping-mansion", "Doi Ping Mansion Chiang Mai"],
  ["serene-teak", "Serene Teak Apartment Chiang Mai"],
  ["pansook-condo", "Pansook Condo Chiang Mai"],
  ["the-51-hometel", "The 51 Hometel Chiang Mai"],
  ["baan-thai-condo", "Baan Thai Condominium Chiang Mai"],
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < MIN_SIZE) {
          reject(new Error(`Too small: ${buf.length} bytes`));
          return;
        }
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, buf);
        resolve(buf.length);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchImageForBuilding(page, slug, query) {
  const dest = join(PUBLIC_DIR, slug, 'hero.jpg');

  // Skip if already have good image
  if (existsSync(dest) && statSync(dest).size > MIN_SIZE) {
    console.log(`  ✓ ${slug}: already has image (${Math.round(statSync(dest).size / 1024)}KB)`);
    return true;
  }

  try {
    // Search Google Images
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&tbs=isz:m`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Click on first result to get full-size image
    const firstResult = await page.$('div[data-ri="0"] img, div.isv-r img');
    if (firstResult) {
      await firstResult.click();
      await page.waitForTimeout(1500);

      // Get the full-size image URL from the side panel
      const fullImg = await page.$('img.sFlh5c.FyHeAf, img[jsname="kn3ccd"]');
      if (fullImg) {
        const src = await fullImg.getAttribute('src');
        if (src && src.startsWith('http') && !src.includes('google') && !src.includes('gstatic')) {
          try {
            const size = await downloadFile(src, dest);
            console.log(`  ✓ ${slug}: ${Math.round(size / 1024)}KB from Google Images`);
            return true;
          } catch (e) {
            // Fall through to next method
          }
        }
      }
    }

    // Fallback: extract any large image URLs from the page
    const allSrcs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .map(img => img.src || img.dataset.src || '')
        .filter(src => src.startsWith('http') && !src.includes('google') && !src.includes('gstatic'));
    });

    for (const src of allSrcs.slice(0, 5)) {
      try {
        const size = await downloadFile(src, dest);
        console.log(`  ✓ ${slug}: ${Math.round(size / 1024)}KB from search result`);
        return true;
      } catch {
        continue;
      }
    }

  } catch (e) {
    // Silently continue
  }

  console.log(`  ✗ ${slug}: no image found`);
  return false;
}

async function main() {
  console.log(`Fetching hero images for ${BUILDINGS.length} buildings...\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  let success = 0;
  let failed = 0;

  for (const [slug, query] of BUILDINGS) {
    const result = await fetchImageForBuilding(page, slug, query);
    if (result) success++;
    else failed++;
    await page.waitForTimeout(500);
  }

  await browser.close();

  console.log(`\nDone: ${success} images, ${failed} missing`);
}

main().catch(console.error);
