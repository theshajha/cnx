/**
 * Verifies every guide spot's `photo` file exists under public/guides/{category}/.
 * Run: yarn check:guide-photos
 * Wired into `yarn build` so missing assets fail CI.
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.join(__dirname, "..");
const GUIDES_DIR = path.join(ROOT, "content", "guides");
const PUBLIC_GUIDES = path.join(ROOT, "public", "guides");

const ALLOWED_EXT = new Set([".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif"]);

function main() {
  if (!fs.existsSync(GUIDES_DIR)) {
    console.error("No content/guides directory.");
    process.exit(1);
  }

  const mdFiles = fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".md"));
  const problems = [];

  for (const file of mdFiles) {
    const raw = fs.readFileSync(path.join(GUIDES_DIR, file), "utf8");
    const { data } = matter(raw);
    const category = data.category;
    if (!category) {
      problems.push({ file, reason: "missing category in frontmatter" });
      continue;
    }

    const spots = Array.isArray(data.spots) ? data.spots : [];
    for (const spot of spots) {
      const slug = spot.slug || "(no slug)";
      if (!spot.photo || String(spot.photo).trim() === "") {
        problems.push({ category, slug, reason: "missing photo filename" });
        continue;
      }
      const photoPath = path.join(PUBLIC_GUIDES, category, spot.photo);
      if (!fs.existsSync(photoPath)) {
        problems.push({
          category,
          slug,
          photo: spot.photo,
          reason: `file not found: public/guides/${category}/${spot.photo}`,
        });
        continue;
      }
      const ext = path.extname(spot.photo).toLowerCase();
      if (!ALLOWED_EXT.has(ext)) {
        problems.push({
          category,
          slug,
          photo: spot.photo,
          reason: `unsupported extension ${ext} (use webp, jpg, png, gif, or avif)`,
        });
      }
    }
  }

  if (problems.length > 0) {
    console.error("Guide photo check failed:\n");
    for (const p of problems) {
      console.error(`  • ${p.category || p.file} / ${p.slug}: ${p.reason}${p.photo ? ` (${p.photo})` : ""}`);
    }
    console.error(`\n${problems.length} problem(s). Add images under public/guides/<category>/ and set photo: in the spot YAML.`);
    process.exit(1);
  }

  let spotCount = 0;
  for (const file of mdFiles) {
    const raw = fs.readFileSync(path.join(GUIDES_DIR, file), "utf8");
    const { data } = matter(raw);
    spotCount += (Array.isArray(data.spots) ? data.spots : []).length;
  }

  console.log(`Guide photos OK — ${mdFiles.length} guide file(s), ${spotCount} spot(s).`);
}

main();
