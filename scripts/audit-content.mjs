/**
 * Content health report for the monthly refresh.
 *
 * Answers "what actually needs a human this month?" so the sweep is a short
 * worklist instead of re-reading 43 files. Read-only — it never edits content.
 *
 *   node scripts/audit-content.mjs            # full report
 *   node scripts/audit-content.mjs --json     # machine-readable
 *   node scripts/audit-content.mjs --due      # only what's overdue, for a quick pass
 *
 * Freshness thresholds mirror src/lib/freshness.ts so the report and the
 * rendered badges can never disagree.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const AGING_AFTER_DAYS = 60;
const STALE_AFTER_DAYS = 120;

const ROOT = process.cwd();
const BUILDINGS_DIR = path.join(ROOT, "content", "buildings");
const GUIDES_DIR = path.join(ROOT, "content", "guides");
const ARTICLES_DIR = path.join(ROOT, "content", "articles");

const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const dueOnly = args.has("--due");
const NOW = new Date();

const daysSince = (iso) => Math.floor((NOW - new Date(iso)) / 86_400_000);

function loadBuildings() {
  const out = [];
  for (const entry of fs.readdirSync(BUILDINGS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(BUILDINGS_DIR, entry.name);
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const full = path.join(dir, file);
      const { data, content } = matter(fs.readFileSync(full, "utf8"));
      out.push({ ...data, content, _file: path.relative(ROOT, full) });
    }
  }
  return out;
}

const buildings = loadBuildings();

/* ── Checks ──────────────────────────────────────────────────────────
   Each returns { id, severity, title, items[] }. `severity` drives the
   ordering of the worklist: blocking issues first, nice-to-haves last. */

const checks = [];

const stale = buildings
  .filter((b) => daysSince(b.last_verified) > STALE_AFTER_DAYS)
  .sort((a, b) => daysSince(b.last_verified) - daysSince(a.last_verified));
checks.push({
  id: "stale-verification",
  severity: "high",
  title: "Past the freshness window — re-check or the badge goes quiet",
  hint: `Older than ${STALE_AFTER_DAYS} days. Confirm rent and availability, then bump last_verified.`,
  items: stale.map((b) => `${b.slug} — ${daysSince(b.last_verified)}d (${b.last_verified})`),
});

const aging = buildings.filter((b) => {
  const d = daysSince(b.last_verified);
  return d > AGING_AFTER_DAYS && d <= STALE_AFTER_DAYS;
});
checks.push({
  id: "aging-verification",
  severity: "medium",
  title: "Aging — no longer shows a verified tick",
  hint: `Between ${AGING_AFTER_DAYS} and ${STALE_AFTER_DAYS} days old.`,
  items: aging.map((b) => `${b.slug} — ${daysSince(b.last_verified)}d`),
});

const noContact = buildings.filter((b) => {
  const c = b.contact ?? {};
  return !c.phone && !c.line && !c.email && !c.website;
});
checks.push({
  id: "no-contact",
  severity: "high",
  title: "No way to reach anyone — the page cannot convert",
  hint: "Walk in and ask reception for a LINE ID, or pull one from a listing site.",
  items: noContact.map((b) => b.slug),
});

const claimedVerifiedNoVisit = buildings.filter((b) => b.verified && !b.contributed_by);
checks.push({
  id: "verified-without-attribution",
  severity: "medium",
  title: "Marked verified but nobody is named as having visited",
  hint: "Either set contributed_by, or set verified: false.",
  items: claimedVerifiedNoVisit.map((b) => b.slug),
});

const noScore = buildings.filter((b) => !b.recommendation_score);
checks.push({
  id: "no-recommendation-score",
  severity: "medium",
  title: "Unscored — falls back to ฿/sqm ordering on the listing page",
  hint: "Score 1-10 on whether you would actually live there. A dozen a month clears the backlog.",
  items: noScore.map((b) => b.slug),
});

const noNote = buildings.filter((b) => !b.contributor_note);
checks.push({
  id: "no-contributor-note",
  severity: "medium",
  title: "No first-person take — the thing that makes a page worth reading",
  items: noNote.map((b) => b.slug),
});

// `wifi: 0` reads as "free" but means "none provided". Flag the ambiguity.
const wifiZero = buildings.filter((b) => b.wifi === 0 || b.wifi === "0");
checks.push({
  id: "wifi-zero",
  severity: "low",
  title: "wifi: 0 — confirm this means 'none provided', not 'free'",
  hint: "The UI renders it as 'None / arrange your own'. If the building includes wifi, use \"included\".",
  items: wifiZero.map((b) => b.slug),
});

const thinContent = buildings.filter((b) => (b.content ?? "").length < 700);
checks.push({
  id: "thin-content",
  severity: "low",
  title: "Thin write-up",
  items: thinContent.map((b) => `${b.slug} — ${(b.content ?? "").length} chars`),
});

// Missing photo files would break the build, but an over-thin gallery is a soft signal.
const fewPhotos = buildings.filter((b) => (b.photos ?? []).length < 3);
checks.push({
  id: "few-photos",
  severity: "low",
  title: "Fewer than 3 photos",
  items: fewPhotos.map((b) => `${b.slug} — ${(b.photos ?? []).length}`),
});

const noNearby = buildings.filter((b) => (b.nearby_spots ?? []).length === 0);
checks.push({
  id: "no-nearby-spots",
  severity: "medium",
  title: "No nearby directory spots",
  hint: "Run `node scripts/compute-nearby-spots.mjs`. If still empty, the building sits outside every spot's walk radius.",
  items: noNearby.map((b) => b.slug),
});

/* ── Directory + article freshness ─────────────────────────────────── */

const guideSpotCounts = fs
  .readdirSync(GUIDES_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const { data } = matter(fs.readFileSync(path.join(GUIDES_DIR, f), "utf8"));
    return { category: data.category, count: (data.spots ?? []).length };
  });
checks.push({
  id: "thin-directory-category",
  severity: "low",
  title: "Directory categories with under 5 spots",
  items: guideSpotCounts.filter((g) => g.count < 5).map((g) => `${g.category} — ${g.count}`),
});

const staleArticles = fs.existsSync(ARTICLES_DIR)
  ? fs
      .readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const { data } = matter(fs.readFileSync(path.join(ARTICLES_DIR, f), "utf8"));
        return { slug: data.slug, updated: data.updated || data.published };
      })
      .filter((a) => a.updated && daysSince(a.updated) > 180)
  : [];
checks.push({
  id: "stale-article",
  severity: "medium",
  title: "Guides not touched in 6 months — prices and visa rules move",
  items: staleArticles.map((a) => `${a.slug} — ${daysSince(a.updated)}d`),
});

/* ── Output ────────────────────────────────────────────────────────── */

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };
const active = checks
  .filter((c) => c.items.length > 0)
  .filter((c) => !dueOnly || c.severity === "high")
  .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

if (asJson) {
  console.log(
    JSON.stringify(
      { generated: NOW.toISOString().slice(0, 10), buildingCount: buildings.length, checks: active },
      null,
      2
    )
  );
} else {
  const freshest = buildings.map((b) => b.last_verified).sort().at(-1);
  console.log(`\ncnx content health — ${NOW.toISOString().slice(0, 10)}`);
  console.log(`${buildings.length} buildings · newest verification ${freshest}\n`);

  if (active.length === 0) {
    console.log("Nothing outstanding. Bump last_verified on anything you re-checked and ship.\n");
  }

  for (const c of active) {
    const tag = c.severity.toUpperCase().padEnd(6);
    console.log(`[${tag}] ${c.title}  (${c.items.length})`);
    if (c.hint) console.log(`         ${c.hint}`);
    for (const item of c.items.slice(0, 12)) console.log(`         · ${item}`);
    if (c.items.length > 12) console.log(`         · …and ${c.items.length - 12} more`);
    console.log();
  }
}
