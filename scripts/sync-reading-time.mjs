/**
 * Recomputes `reading_time` on every article from its actual word count.
 *
 * The hand-set values had drifted to anywhere between 170 and 293 words per
 * minute, so a 2,000-word guide claimed 12 minutes while a 1,464-word one
 * claimed 5. Readers use these to decide what to open; they should mean the
 * same thing on every card.
 *
 *   node scripts/sync-reading-time.mjs [--check]
 *
 * Deliberately does not touch `updated` — reading time is derived from the
 * text, not a claim that anyone re-checked the facts.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** Average adult reading speed for informational prose. */
const WORDS_PER_MINUTE = 225;

const ROOT = process.cwd();
const ARTICLES = path.join(ROOT, "content", "articles");
const checkOnly = process.argv.includes("--check");

let changed = 0;

for (const file of fs.readdirSync(ARTICLES).filter((f) => f.endsWith(".md"))) {
  const full = path.join(ARTICLES, file);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  if (data.reading_time === minutes) continue;

  changed++;
  console.log(
    `  ${file}: ${data.reading_time} → ${minutes} min (${words} words)`
  );

  if (!checkOnly) {
    // Surgical replace so the rest of the frontmatter keeps its formatting.
    const next = raw.replace(
      /^reading_time:.*$/m,
      `reading_time: ${minutes}`
    );
    if (next === raw) {
      console.error(`    ! no reading_time field found in ${file}`);
      continue;
    }
    fs.writeFileSync(full, next);
  }
}

console.log(
  changed === 0
    ? "reading_time: all articles already accurate."
    : `\nreading_time: ${changed} article${changed === 1 ? "" : "s"} ${checkOnly ? "would change" : "updated"} at ${WORDS_PER_MINUTE} wpm.`
);

if (checkOnly && changed > 0) {
  console.error("Run `node scripts/sync-reading-time.mjs` to refresh.");
  process.exit(1);
}
