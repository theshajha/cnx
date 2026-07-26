/**
 * Derives each building's `nearby_spots` from coordinates.
 *
 * Every building and every directory spot already carries lat/lng, but 40 of 43
 * buildings shipped with `nearby_spots: []` — so the "Nearby Expat Spots" block
 * (the one thing tying a listing to the directory) rendered on almost nothing.
 * This closes that join without anyone gathering new data.
 *
 * Distance is straight-line haversine scaled by a detour factor, so the result
 * is an estimate and the UI labels it with "≈". Hand-authored entries win: a
 * real walk beats a formula, so anything already in the file is preserved and
 * only topped up.
 *
 *   node scripts/compute-nearby-spots.mjs [--check] [--verbose]
 *
 * --check exits non-zero if any file would change (for CI / the monthly sweep).
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const BUILDINGS_DIR = path.join(ROOT, "content", "buildings");
const GUIDES_DIR = path.join(ROOT, "content", "guides");

/**
 * Effective metres per minute — ~4.2 km/h. Deliberately slower than a raw walking
 * pace: it absorbs getting out of the building, waiting at Nimman crossings, and
 * the heat. Calibrated against the hand-authored times already in the files, which
 * ran 1–4 minutes longer than a naive 4.8 km/h estimate.
 */
const METRES_PER_MINUTE = 70;
/** Sois dog-leg; nobody walks the hypotenuse. Standard urban circuity multiplier. */
const DETOUR_FACTOR = 1.4;
/** Past this, nobody walks — they ride. */
const MAX_WALK_MINUTES = 15;
/** Keep the block scannable rather than exhaustive. */
const MAX_PER_CATEGORY = 2;
const MAX_TOTAL = 8;

function haversineMetres([lat1, lon1], [lat2, lon2]) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Source coordinates are rounded to 3–4 decimals (~10–100 m), so a minute-precise
 * figure would be false precision. The number stored here is an estimate; the UI
 * buckets it to ≤5 / ≤10 / ≤15 and prefixes "≈".
 */
function walkMinutes(from, to) {
  return Math.max(1, Math.ceil((haversineMetres(from, to) * DETOUR_FACTOR) / METRES_PER_MINUTE));
}

function loadSpots() {
  const spots = [];
  for (const file of fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(fs.readFileSync(path.join(GUIDES_DIR, file), "utf8"));
    for (const spot of data.spots ?? []) {
      if (!Array.isArray(spot.coordinates) || spot.coordinates.length !== 2) continue;
      spots.push({ slug: spot.slug, category: data.category, coordinates: spot.coordinates });
    }
  }
  return spots;
}

function collectBuildingFiles() {
  const files = [];
  for (const entry of fs.readdirSync(BUILDINGS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(BUILDINGS_DIR, entry.name);
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      files.push(path.join(dir, file));
    }
  }
  return files.sort();
}

/** Renders the YAML block. Indentation matches the hand-authored files. */
function renderNearbySpots(spots) {
  if (spots.length === 0) return "nearby_spots: []";
  const lines = ["nearby_spots:"];
  for (const s of spots) {
    lines.push(`  - slug: ${s.slug}`);
    lines.push(`    category: ${s.category}`);
    lines.push(`    walk_minutes: ${s.walk_minutes}`);
  }
  return lines.join("\n");
}

/**
 * Replaces only the `nearby_spots` block in the raw frontmatter. Re-serialising
 * the whole thing through js-yaml would reorder keys and reflow every file.
 */
function replaceNearbySpotsBlock(raw, rendered) {
  const empty = /^nearby_spots:\s*\[\s*\]\s*$/m;
  if (empty.test(raw)) return raw.replace(empty, rendered);

  // Block form: the key line plus every following indented list line.
  const block = /^nearby_spots:[ \t]*\n(?:[ \t]+.*\n?)*/m;
  if (block.test(raw)) return raw.replace(block, rendered + "\n");

  return null;
}

const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check");
const verbose = args.has("--verbose");

const allSpots = loadSpots();
if (allSpots.length === 0) {
  console.error("No directory spots with coordinates found — nothing to join against.");
  process.exit(1);
}

let changed = 0;
let skipped = 0;
const report = [];

for (const file of collectBuildingFiles()) {
  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);
  const rel = path.relative(ROOT, file);

  if (!Array.isArray(data.coordinates) || data.coordinates.length !== 2) {
    report.push(`  ${rel}: no coordinates, skipped`);
    skipped++;
    continue;
  }

  const existing = Array.isArray(data.nearby_spots) ? data.nearby_spots : [];
  const claimed = new Set(existing.map((s) => s.slug));

  const candidates = allSpots
    .filter((s) => !claimed.has(s.slug))
    .map((s) => ({ ...s, walk_minutes: walkMinutes(data.coordinates, s.coordinates) }))
    .filter((s) => s.walk_minutes <= MAX_WALK_MINUTES)
    .sort((a, b) => a.walk_minutes - b.walk_minutes);

  // Hand-authored entries keep their position and their stated walk time.
  const merged = [...existing];
  const perCategory = new Map();
  for (const s of existing) perCategory.set(s.category, (perCategory.get(s.category) ?? 0) + 1);

  for (const c of candidates) {
    if (merged.length >= MAX_TOTAL) break;
    const count = perCategory.get(c.category) ?? 0;
    if (count >= MAX_PER_CATEGORY) continue;
    merged.push({ slug: c.slug, category: c.category, walk_minutes: c.walk_minutes });
    perCategory.set(c.category, count + 1);
  }

  // Group by category so the rendered block reads in tidy runs.
  merged.sort((a, b) => a.category.localeCompare(b.category) || a.walk_minutes - b.walk_minutes);

  const next = replaceNearbySpotsBlock(raw, renderNearbySpots(merged));
  if (next === null) {
    report.push(`  ${rel}: could not locate nearby_spots block`);
    skipped++;
    continue;
  }

  if (next !== raw) {
    if (!checkOnly) fs.writeFileSync(file, next);
    changed++;
    const added = merged.length - existing.length;
    report.push(`  ${rel}: ${existing.length} → ${merged.length} (+${added})`);
  }
}

if (verbose || checkOnly) report.forEach((l) => console.log(l));

console.log(
  `\nnearby_spots: ${changed} building${changed === 1 ? "" : "s"} ${checkOnly ? "would change" : "updated"}` +
    (skipped ? `, ${skipped} skipped` : "") +
    ` — joined against ${allSpots.length} directory spots.`
);

if (checkOnly && changed > 0) {
  console.error("\nRun `node scripts/compute-nearby-spots.mjs` to refresh.");
  process.exit(1);
}
