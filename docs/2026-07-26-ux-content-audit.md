# cnx — UX and Content Audit

**Date:** 2026-07-26
**Scope:** Whole product — home, /cribs, area pages, building detail, directory, guides, playbook
**Method:** Read every content file and component; rendered all pages at 1440px and 390px; queried the content set directly for coverage and consistency.

---

## Verdict

The content is better than the product wrapped around it.

Building pages are genuinely good — the Overview, Expat Tips and Gotchas sections read like
someone who lives here wrote them, because someone did. Everything upstream of those pages
was failing to get people to them, and the site was making trust claims its own data
contradicted.

Two problems dominated everything else:

1. **The site claimed verification it could not evidence.** All 43 buildings carried
   `verified: false` and a `last_verified` of 2026-04-04, while the hero said "43 verified
   rentals", the trust bar said "Updated weekly", and the footer said "Every listing verified
   on foot." For a product whose entire positioning is *your honest friend*, this was the most
   damaging thing on the site.

2. **`/cribs` was a wall, not a tool.** 43 visually identical cards, no sort, no ranking, no
   search, and filters that could not express what a long-stay renter actually wants. The one
   page that should do the deciding did none of it.

A third, quieter problem: the site was sitting on data it never joined. Every building and
every directory spot had coordinates, but 40 of 43 buildings had an empty `nearby_spots`, so
the block that ties a listing to the neighbourhood rendered on almost nothing.

---

## What was already working

Worth protecting through any redesign:

- **Editorial voice in building content.** "Studios don't come with a washer — factor in
  laundry costs" is the product. Listing portals cannot write this.
- **Gotchas as a first-class section.** Leading with what's wrong is the differentiator.
- **Honest sourcing notes.** Several buildings distinguish firsthand observation from
  aggregated review data.
- **The directory itself** — 96 spots across 12 categories with one-liners and photo credits.
- **Static export, no client-side bloat.** Fast, cheap, durable.

---

## Design findings

| # | Finding | Severity |
|---|---|---|
| D1 | Homepage was seven sections, six of them near-identical card grids. No rhythm, no hierarchy, no primary path. | High |
| D2 | `/cribs` presented 43 undifferentiated cards with no sort, rank, or search. | High |
| D3 | On mobile, `/cribs` was a ~30,000px scroll. | High |
| D4 | One card treatment (`bg-milk rounded-2xl border-sand p-6`) repeated 20+ times across every page, so nothing could be emphasised. | High |
| D5 | Terracotta served as price, link, CTA, bullet, accent and border. A colour used for everything signals nothing. | Medium |
| D6 | Georgia + system-ui with no numeric treatment — a data product typeset as a blog. | Medium |
| D7 | Location map was a 120px sliver, lazy-loaded, built from a hand-assembled Google `pb` string; it rendered blank for seconds. | Medium |
| D8 | Emoji used as the icon system (☕ 🏯 💰 🛵) — the strongest generic-template signal on the page. | Medium |
| D9 | Filter `<select>` had no label; page had no skip link. | Medium |
| D10 | Stats row ("100% Free, No Agent Fees") was filler occupying prime position. | Low |

### D1 in detail

Section order was: hero → quote → Recommended (6 cards) → New to Chiang Mai (6 cards) → Stats
(4 cards) → Explore by Area (2 cards) → Directory (6 cards) → Latest Guides (2–3 cards).

Every section after the hero was a grid of equal-weight cards on the same background. Nothing
told a visitor where to start, and the page read as long rather than deep.

### D4 in detail

Because every container looked the same, the only available emphasis tools were size and
position. A building we'd strongly recommend and a directory category link had identical
visual weight.

---

## Content and data findings

| # | Finding | Count | Severity |
|---|---|---|---|
| C1 | `verified: false` on every building while the UI claimed verification. `VerifiedBadge` renders only when true, so zero badges displayed anywhere. | 43/43 | Critical |
| C2 | "Updated weekly" in the trust bar; newest `last_verified` was 113 days old. | — | Critical |
| C3 | `nearby_spots` empty despite coordinates existing on both sides of the join. | 40/43 | High |
| C4 | No contact method at all — the primary conversion path is dead on half the inventory. | 22/43 | High |
| C5 | `recommendation_score` missing, so the homepage "Recommended" section drew from 10 buildings and `/cribs` had no ordering signal. | 33/43 | High |
| C6 | `wifi: 0` rendered as "0 ฿ per month", which reads as free. It means the building provides none — building notes confirm "No building WiFi — arrange your own ISP". | 7/43 | High |
| C7 | `beds: 1` on both studios and one-bedrooms, so bedroom filtering was impossible from that field alone. | — | Medium |
| C8 | Unit `type` is free text with 37 distinct values ("Superior", "Loft Apartment", "Type C 1 Bedroom"). | — | Medium |
| C9 | No `contributor_note` — the first-person take is the reason to read the page. | 4/43 | Medium |
| C10 | Homepage pull-quote was built by splitting on "." and taking two sentences, producing fragments that ended mid-thought. | — | Medium |
| C11 | Hand-authored `walk_minutes` were internally inconsistent — Ristr8to Lab appears as 5 min from 111m and 5 min from 246m. | — | Low |
| C12 | Nivas Chiangmai's hero image is a brand logo, not the building. | 1/43 | Low |

### C1 — the resolution

Confirmed with the site owner: the buildings *were* visited; the flags were never flipped.
The data was stale, not the claim. All 43 now carry `verified: true`, and the UI was rebuilt
so the claim decays on its own rather than standing forever.

### C3 — free data nobody joined

All 43 buildings and all 96 directory spots carry coordinates. Deriving walk times is pure
computation. `scripts/compute-nearby-spots.mjs` now does it, and populated all 43 buildings.

*Fig. 1 — nearby_spots coverage before and after the join: 3/43 → 43/43.*

---

## What changed in this pass

### Trust model

Verification now **degrades with age** instead of asserting itself forever
(`src/lib/freshness.ts`):

| Age | Renders as |
|---|---|
| ≤ 60 days | ✓ Verified Jul 2026 |
| 61–120 days | Checked Apr 2026 *(no tick)* |
| > 120 days | Last checked Apr 2026 — prices may have moved |

"Updated weekly" is gone. `/cribs` prints "Last full sweep {month}" computed from the data, so
it cannot drift out of sync with reality. The footer now says what is actually true: no agent
fees, no paid placement, and every listing carries the date it was last seen.

### `/cribs`: wall → decision tool

- **Dense row view is now the default at every width**, cards optional. Mobile went from
  ~30,000px of scroll to roughly a quarter of that.
- **Sorting added** — our pick order, cheapest, priciest, best ฿/sqm, biggest units.
- **Filters that match the decision** — budget ceiling, layout (studio/1/2/3+ bed, parsed from
  the free-text `type`), and must-have facilities.
- **Two derived columns no listing portal shows**: ฿/sqm, and an all-in monthly estimate
  (rent + electricity at 300 kWh + water + internet), each labelled as an estimate.
- **Value tier** — each building's ฿/sqm placed against the median *for its own area*, so a
  Nimman condo is judged against Nimman.

*Fig. 2 — the row anatomy: rank, identity, size and ฿/sqm, all-in estimate, entry rent.*

### Ranking without inventing opinions

Only 10 of 43 buildings have a human score. Rather than sink the other 33 to the bottom in
file order, unscored buildings fall back to value-for-money against their area cohort. The
ordering is honest, explainable, and improves as scores get filled in.

### Homepage recomposed

New rhythm — photo hero → three entry paths → editorial lead-plus-list → **dark cost band** →
neighbourhood comparison → pull-quote → compact index. Each section has a different shape, so
the page reads as structured rather than long.

The cost band answers the question everyone actually arrives with — *what does it cost to live
here?* — computed from the site's own listings by layout, rather than from a blog post.

*Fig. 3 — homepage section rhythm, before and after: seven card grids vs. six differentiated shapes.*

### Design system

Colour now carries meaning: `verified` green for things confirmed on foot, `caution` for
gotchas, `flag` for deal-breakers, terracotta reserved for brand and primary action.
Typography moved to Fraunces (display) + IBM Plex Sans (text) + IBM Plex Mono (all numbers,
tabular). Prices and rates now read as measurements.

### Building detail

- Quick summary gained the two numbers that decide it: **est. monthly all-in** and **cash to
  move in** (first month + deposit).
- WiFi reads "None / arrange your own" instead of "0 ฿ per month".
- Map replaced with OpenStreetMap at 200px — no API key, paints immediately.
- Walking-distance block now populated on all 43 buildings, shown as `≈` buckets rather than
  false-precision minutes.
- The CTA is honest when there's no contact on file: it says so, and offers a tip-off link,
  instead of showing a lone "Read the Playbook" button.

---

## What's still open, ranked

1. **22 buildings have no contact method** (C4). Highest-value manual work available — half the
   inventory currently cannot convert.
2. **33 buildings unscored** (C5). Each score sharpens the default ordering.
3. **Only 2 neighbourhoods.** Santitham, Hang Dong and Chang Khlan are where long-stayers
   actually end up, and their absence caps the site's usefulness more than any design issue.
4. **No search.** Fine at 43 buildings; needed by ~80.
5. **No map view of the listings.** Location is the top decision factor and there's still no
   way to see the set spatially.
6. **4 buildings without a contributor note** (C9), and one with a logo for a hero photo (C12).
7. **Directory and buildings still only meet in one direction** — a building lists nearby
   spots, but a spot doesn't list nearby buildings.

---

## Monthly refresh

Shipped as a project skill at `.claude/skills/monthly-data-refresh/`, built around one rule:
**a `last_verified` date is a promise a human looked; moving it without looking is the only
unrecoverable mistake in the repo.**

Supporting tooling:

| Command | Does |
|---|---|
| `npm run audit:content` | Prioritised worklist of what needs a human |
| `npm run compute:nearby` | Recomputes building ↔ directory walk times |
| `npm run check:nearby` | Fails the build if derived data drifted |

Automated price sources are deliberately unresolved. The constraint when choosing one is
attribution, not coverage: scraped numbers must not inherit the in-person badge, so any feed
needs its own provenance field.
