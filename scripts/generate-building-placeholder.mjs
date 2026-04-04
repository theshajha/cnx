/**
 * Writes a single solid brand-colored JPEG placeholder for building cards.
 * Copies it as hero.jpg into every public/buildings/{slug}/ directory.
 * Run: node scripts/generate-building-placeholder.mjs
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BUILDINGS_DIR = path.join(ROOT, "content", "buildings");
const PUBLIC_BUILDINGS = path.join(ROOT, "public", "buildings");
const PLACEHOLDER = path.join(PUBLIC_BUILDINGS, "building-placeholder.png");

const R = 230;
const G = 222;
const B = 210;

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

function collectMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectMarkdownFiles(full));
    else if (entry.name.endsWith(".md")) results.push(full);
  }
  return results;
}

const W = 1200;
const H = 800;
fs.mkdirSync(path.dirname(PLACEHOLDER), { recursive: true });
fs.writeFileSync(PLACEHOLDER, buildPng(W, H));
console.log(`Wrote ${PLACEHOLDER} (${W}×${H})`);

const mdFiles = collectMarkdownFiles(BUILDINGS_DIR);
const src = fs.readFileSync(PLACEHOLDER);
let count = 0;

for (const file of mdFiles) {
  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);
  if (!data.slug) continue;
  const photos = Array.isArray(data.photos) ? data.photos : [];
  const dir = path.join(PUBLIC_BUILDINGS, data.slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const photo of photos) {
    const dest = path.join(dir, photo);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, src);
      count++;
    }
  }
}
console.log(`Distributed placeholder into ${count} missing building photo slot(s).`);
