/**
 * Verifies every building's `photos` and unit `photos` files exist under
 * public/buildings/{slug}/.
 * Run: yarn check:building-photos
 * Wired into `yarn build` so missing assets fail CI.
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.join(__dirname, "..");
const BUILDINGS_DIR = path.join(ROOT, "content", "buildings");
const PUBLIC_BUILDINGS = path.join(ROOT, "public", "buildings");

const ALLOWED_EXT = new Set([".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif"]);

function collectMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(full));
    } else if (entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  if (!fs.existsSync(BUILDINGS_DIR)) {
    console.error("No content/buildings directory.");
    process.exit(1);
  }

  const mdFiles = collectMarkdownFiles(BUILDINGS_DIR);
  const problems = [];
  let buildingCount = 0;
  let photoCount = 0;

  for (const file of mdFiles) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    const slug = data.slug;
    if (!slug) {
      problems.push({ file: path.relative(ROOT, file), reason: "missing slug in frontmatter" });
      continue;
    }
    buildingCount++;

    const photos = Array.isArray(data.photos) ? data.photos : [];
    if (photos.length === 0) {
      problems.push({ slug, reason: "empty photos array (needs at least hero.jpg)" });
    }

    for (const photo of photos) {
      const photoPath = path.join(PUBLIC_BUILDINGS, slug, photo);
      if (!fs.existsSync(photoPath)) {
        problems.push({
          slug,
          photo,
          reason: `file not found: public/buildings/${slug}/${photo}`,
        });
        continue;
      }
      const ext = path.extname(photo).toLowerCase();
      if (!ALLOWED_EXT.has(ext)) {
        problems.push({
          slug,
          photo,
          reason: `unsupported extension ${ext} (use webp, jpg, png, gif, or avif)`,
        });
        continue;
      }
      photoCount++;
    }

    const units = Array.isArray(data.units) ? data.units : [];
    for (let i = 0; i < units.length; i++) {
      const unitPhotos = Array.isArray(units[i].photos) ? units[i].photos : [];
      for (const photo of unitPhotos) {
        const photoPath = path.join(PUBLIC_BUILDINGS, slug, photo);
        if (!fs.existsSync(photoPath)) {
          problems.push({
            slug,
            photo,
            reason: `unit[${i}] file not found: public/buildings/${slug}/${photo}`,
          });
          continue;
        }
        const ext = path.extname(photo).toLowerCase();
        if (!ALLOWED_EXT.has(ext)) {
          problems.push({
            slug,
            photo,
            reason: `unit[${i}] unsupported extension ${ext}`,
          });
          continue;
        }
        photoCount++;
      }
    }
  }

  if (problems.length > 0) {
    console.error("Building photo check failed:\n");
    for (const p of problems) {
      console.error(`  • ${p.slug || p.file}: ${p.reason}${p.photo ? ` (${p.photo})` : ""}`);
    }
    console.error(
      `\n${problems.length} problem(s). Add images under public/buildings/<slug>/ and set photos: in the building YAML.`
    );
    process.exit(1);
  }

  console.log(
    `Building photos OK — ${buildingCount} building(s), ${photoCount} photo(s) verified.`
  );
}

main();
