# CNX Cribs — Guide taxonomy & content rules

**Purpose:** Map the full universe of “Chiang Mai directory” style sites onto a **curated** guide that serves monthly renters and long-stay visitors. This doc is the source of truth for **which categories exist**, how they are **grouped on `/guide`**, and how to **grow content** without turning into an unmaintainable yellow pages clone.

**Scale target:** Up to **100–200 spots per category** in frontmatter. If a single topic approaches that ceiling, **split into a new category** (new markdown file = new `/guide/[category]` URL), do not append multiple unrelated files into one route.

---

## 1. Pillars (hub sections)

Guides are grouped under these pillars on the site. Each guide file sets `pillar` to one of these slugs:

| Pillar slug      | Hub title                 | Intent |
|-----------------|---------------------------|--------|
| `work`          | Work & connect            | Remote work, cafés, connectivity |
| `daily-life`    | Daily life                | Getting around, groceries, chores |
| `wellness`      | Wellness                  | Body care, fitness, recovery |
| `health`        | Health                    | Medical and dental (English-friendly bias) |
| `family`        | Family & learning         | Kids, schools, Thai study |
| `professional`  | Visas, legal & pros       | Immigration, lawyers, trusted agents |
| `explore`       | Eat, drink & explore      | Food culture and leisure (editorial, not exhaustive) |

Pillar **order** on the page is fixed in code (`src/lib/guide-pillars.ts`). Within a pillar, guides sort by numeric `order` in frontmatter (ascending).

---

## 2. Category inventory (markdown = one route)

| `category` slug (filename)   | Pillar           | `order` | Focus |
|-----------------------------|------------------|--------|--------|
| `coworking`                 | work             | 1      | Paid / dedicated workspaces |
| `coffee`                    | work             | 2      | Laptop-friendly cafés |
| `motorbikes`                | daily-life       | 1      | Rentals, shops, helmet / deposit notes |
| `supermarkets`              | daily-life       | 2      | Where to stock a kitchen (incl. Western imports) |
| `laundry`                   | daily-life       | 3      | Wash-by-kilo, self-service |
| `massage`                   | wellness         | 1      | Thai massage, trusted shops |
| `gyms`                      | wellness         | 2      | Weights, classes, day passes |
| `dentists`                  | health           | 1      | English-speaking, cleaning / emergencies |
| `language-schools`          | family           | 1      | Thai group classes, intensive |
| `international-schools`     | family           | 2      | Curricula, ages (high effort to verify) |
| `visa-legal`                | professional     | 1      | Lawyers / visa agents (verify carefully) |
| `local-eats`                | explore          | 1      | Cheap eats, markets, “one plate” culture — not every cuisine |

**Deferred / do not add until you have a maintenance owner:** generic shopping, nightlife grids, landmark dumps, duplicate “condo directory” (buildings already own housing).

---

## 3. Frontmatter contract (`content/guides/*.md`)

Every guide file **must** include:

```yaml
name: Display Name          # e.g. "Coffee shops"
category: url-slug          # must match filename stem
pillar: work                # one of the pillar slugs above
order: 2                    # sort within pillar
icon: "☕"
recommended_by: shashank    # contributor slug or null
description: One line for cards and SEO.
spots: []                   # array of GuideSpot (can be empty while building)
```

Optional body markdown after `---` renders as sections below the spot cards (same as today).

### Spot entries

- `slug` — stable id for `nearby_spots` in building markdown.
- `area` — neighborhood slug; use `nimman`, `old-city`, or add new slugs and extend the area label map in `src/app/guide/[category]/page.tsx` if needed.
- `photo` — filename only; file lives at `public/guides/{category}/{photo}`.

---

## 4. Using external directories (Locator, etc.)

1. **Inventory** their sitemap / categories into a spreadsheet — labels only, not copied text.
2. **Map** rows to a pillar + `category` from the table above (or propose a **new** row + new file if justified).
3. **Score** for your audience: pain if wrong, first-90-days relevance, whether Maps is already good enough.
4. **Add spots** manually: verify on Maps / LINE, write original one-liners, own photos or licensed images.

Do **not** bulk-scrape descriptions or photos; that creates legal and trust debt.

**Current guides (2026):** Initial spot lists were **cross-checked** against public directory headings (notably [Chiang Mai Locator](https://www.chiangmailocator.com/sitemap)) and then rewritten in our voice. Business names are factual; **one-liners, coordinates, and area tags** should be re-verified on the ground before you mark content “verified.”

---

## 5. When to split a category

- Approaching **~150+ spots** in one YAML list, **or**
- Two distinct user intents in one file (e.g. spa vs street massage), **or**
- Different update cadence (schools vs cafés).

Create a **new** `content/guides/new-slug.md` with its own `category` and `order`, and adjust this doc’s inventory table.

---

## 6. Related code

- Hub grouping: `src/app/guide/page.tsx`
- Pillar config: `src/lib/guide-pillars.ts`
- Types: `GuideCategory` in `src/lib/types.ts`
- Loader: `getAllGuides()` in `src/lib/content.ts`
