---
name: monthly-data-refresh
description: Use when running the monthly content sweep for the cnx Chiang Mai rentals site, refreshing building data, bumping last_verified dates, checking prices or contacts, or when asked "what needs updating this month"
---

# Monthly Data Refresh

## Overview

cnx sells one thing: that a real person checked these buildings and will tell you the
truth about them. Every number on the site is load-bearing for that claim.

**A `last_verified` date is a promise that a human looked. Moving it without looking is
the only unrecoverable mistake in this repo.** Everything else here is mechanical.

## The Iron Rule

```
NEVER bump last_verified for a building you did not actually re-check.
```

Re-checked means: someone confirmed the current asking rent and that units are available
— by visiting, calling, messaging the landlord, or reading a listing dated this month.

**No exceptions:**
- Not "the price probably hasn't changed"
- Not "it was accurate last month"
- Not "I'm bumping them all so the badges look fresh"
- Not "the build warns about stale dates"

A stale date renders honestly: the badge drops its tick and says "Last checked Apr 2026".
That is the system working. A wrong date is a lie the whole site rests on.

If you did not check it, leave the date alone.

## Quick Reference

| Step | Command |
|---|---|
| See what needs a human | `node scripts/audit-content.mjs` |
| Only the urgent items | `node scripts/audit-content.mjs --due` |
| Machine-readable | `node scripts/audit-content.mjs --json` |
| Recompute walk-times to directory spots | `node scripts/compute-nearby-spots.mjs` |
| Check nothing drifted (CI-safe) | `node scripts/compute-nearby-spots.mjs --check` |
| Verify photos resolve | `npm run check:building-photos` |
| Full verification | `npm run build` |

## Workflow

### 1. Get the worklist

```bash
node scripts/audit-content.mjs
```

Findings are ordered `HIGH` → `LOW`. HIGH means the page cannot do its job (no contact
method, verification past the 120-day window). Work top-down and stop when the month's
budget is spent — a short honest sweep beats a long fabricated one.

### 2. Do the human part

For each building you actually re-check, update in its `content/buildings/{area}/{slug}.md`:

- `price_range` and each unit's `price_range` if rents moved
- `contact` if you got a LINE ID or phone
- `last_verified` → today, **only for the ones you checked**
- `contributor_note` if your opinion changed
- `recommendation_score` (1–10) if it was missing

Prices are the whole point. If a building's entry rent moved more than ~10%, say so in
the note — that drift is exactly the signal a long-stay renter wants.

### 3. Recompute derived data

```bash
node scripts/compute-nearby-spots.mjs
```

Run after adding or moving any directory spot or building. It only tops up — hand-written
`nearby_spots` entries are preserved, because a real walk beats a formula.

### 4. Verify before shipping

```bash
npm run build
```

The build fails on missing photo files. Then confirm the freshness copy still matches
reality: `/cribs` prints "Last full sweep {month}" from the data, so it self-corrects —
but any hand-written claim about update frequency must match what you actually do.

### 5. Commit

Say what you checked and what you did not:

```
content: July sweep — 12 buildings re-checked, 4 price corrections

Verified in person: the-nimmana, liv-nimman, d-condo-nim, …
Not re-checked this month: the remaining 31 keep their April dates.
```

## What Degrades Gracefully

Missing data hides its UI rather than showing a placeholder. You are never forced to
invent a value:

| Missing | Result |
|---|---|
| `recommendation_score` | Falls back to ฿/sqm ordering on `/cribs` |
| `contributor_note` | Quote block is omitted |
| `contact.*` all null | CTA switches to "No direct line on file" + a tip-off link |
| `nearby_spots` empty | Walking-distance section is omitted |
| `last_verified` old | Badge degrades: tick → "Checked" → "Last checked" |

So leaving a field empty is always safer than guessing at it.

## Data Gotchas

- **`wifi: 0` means "none provided", not "free"** — it renders as "None / arrange your
  own". If the building includes wifi, the value is the string `"included"`.
- **`beds: 1` on studios** — studios and one-beds both carry `beds: 1`. Layout is parsed
  from the unit `type` string first (`src/lib/metrics.ts`, `layoutOf`).
- **Unit `type` is free text** — 37 distinct values already exist. Prefer the existing
  vocabulary (`Studio`, `1 Bedroom`, `2 Bedroom`) over inventing new labels.
- **Walk times are estimates** — derived from coordinates, rendered as `≈` buckets. Do not
  hand-edit them to look precise.
- **Freshness thresholds live in `src/lib/freshness.ts`** — the audit script mirrors them.
  Change both or neither.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Prices rarely change, I'll bump the dates" | Then the date says nothing. Leave it. |
| "I checked one Palm Springs, they're all the same building" | Five separate records with different rents. Check each or date each honestly. |
| "A listing site shows it available, that's verification" | Only if the listing is dated this month — and note that it was desk-checked, not visited. |
| "The stale warning is noisy, let me clear it" | The warning is the product working. Clear it by checking, not by editing. |
| "I'll set verified: true, I'll visit next week" | Set it after the visit. |
| "Scoring all 33 unscored buildings now" | Scores are opinions. Invented ones are worse than none. Do a dozen you actually know. |

## Red Flags — Stop

- About to run `sed` over `last_verified` across many files
- Filling `recommendation_score` for a building you have not been inside
- Writing a `contributor_note` from listing-site copy rather than your own visit
- Setting `verified: true` in bulk
- Editing `walk_minutes` by hand to a rounder number

All of these mean: stop, and only touch the records you actually checked.

## Sources — Not Yet Chosen

Automated price/availability inputs are **deliberately unresolved**. Until a source is
picked, this sweep is human-driven.

When choosing one, the constraint is attribution, not coverage: the site's value is that a
person stands behind each number. Any automated feed needs its own field (e.g.
`price_source: "listing-site"` vs a visit) so the UI can distinguish "we saw this" from
"a portal said this" — do not let scraped numbers inherit the in-person badge.

Candidates worth evaluating: FazWaz / Thailand-Property / PropertyScout listings, Google
Places for the directory, and building Facebook or LINE groups for availability.
