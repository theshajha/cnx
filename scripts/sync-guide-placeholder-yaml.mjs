/**
 * Sets every spot's photo to guide-placeholder.png (honest non-venue placeholder).
 * Run after generate-guide-placeholder.mjs
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES_DIR = path.join(__dirname, "..", "content", "guides");

const PLACEHOLDER = "guide-placeholder.png";

for (const file of fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".md"))) {
  const fp = path.join(GUIDES_DIR, file);
  const raw = fs.readFileSync(fp, "utf8");
  const { data, content } = matter(raw);
  if (!data.spots?.length) continue;

  const spots = data.spots.map((spot) => ({
    ...spot,
    photo: PLACEHOLDER,
  }));

  const out = matter.stringify(content, { ...data, spots }, { lineWidth: 120 });
  fs.writeFileSync(fp, out);
  console.log("Updated", file);
}
