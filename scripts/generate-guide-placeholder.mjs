/**
 * Writes a single solid brand-colored PNG (no venue implied) for guide cards.
 * Run: node scripts/generate-guide-placeholder.mjs
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "guides", "guide-placeholder.png");

/** Café palette: sand / cream — clearly UI, not a location photo */
const R = 240;
const G = 230;
const B = 214;

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(typeStr, data) {
  const type = Buffer.from(typeStr, "latin1");
  const chunk = Buffer.concat([type, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(chunk), 0);
  return Buffer.concat([len, chunk, crc]);
}

function buildPng(w, h) {
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(1 + w * 4);
    row[0] = 0;
    for (let x = 0; x < w; x++) {
      const i = 1 + x * 4;
      row[i] = R;
      row[i + 1] = G;
      row[i + 2] = B;
      row[i + 3] = 255;
    }
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

const W = 1200;
const H = 900;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, buildPng(W, H));
console.log(`Wrote ${OUT} (${W}×${H})`);

const categories = [
  "coffee",
  "coworking",
  "massage",
  "motorbikes",
  "supermarkets",
  "laundry",
  "gyms",
  "dentists",
  "language-schools",
  "international-schools",
  "visa-legal",
  "local-eats",
];
const src = fs.readFileSync(OUT);
for (const c of categories) {
  const dir = path.join(ROOT, "public", "guides", c);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "guide-placeholder.png"), src);
}
console.log(`Copied guide-placeholder.png into ${categories.length} category folders.`);
