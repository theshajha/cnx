# Unified /cribs Page Design

## Summary

Collapse the separate Nimman and Old City listing pages into a single `/cribs` page with area as a URL-based filter, card/list view toggle, and dynamic area taxonomy derived from building data. This prepares the site for adding new areas and properties (Astra Condo, Sky River, etc.) without code changes.

## Routing

```
/cribs                    → All buildings, no area filter active
/cribs/[area]             → Pre-filtered by area (e.g. /cribs/nimman)
/cribs/[area]/[slug]      → Building detail page (e.g. /cribs/nimman/d-condo-nim)
```

### Redirects (backwards compatibility)

Old routes redirect to new paths via Next.js `redirects` in `next.config`:

```
/nimman              → /cribs/nimman             (308 permanent)
/old-city            → /cribs/old-city           (308 permanent)
/nimman/[slug]       → /cribs/nimman/[slug]      (308 permanent)
/old-city/[slug]     → /cribs/old-city/[slug]    (308 permanent)
```

### Static generation

- `/cribs` — single static page
- `/cribs/[area]` — generated via `generateStaticParams()` from `getUniqueAreas()`
- `/cribs/[area]/[slug]` — generated via `generateStaticParams()` from `getAllBuildings()`

## Content Layer

### Directory structure (unchanged)

```
content/
  buildings/
    nimman/          # Nimman buildings
    old-city/        # Old City buildings
    santitham/       # Future areas — just add a folder
    riverside/       # ...
  areas.yml          # Area display metadata
```

Subdirectories exist for human organization. The content loader scans all subdirectories recursively and uses each building's `area` frontmatter field for filtering — directory names are not coupled to routing.

### areas.yml (new file)

Maps area slugs to display names and descriptions. The page auto-discovers areas from building data; this file provides optional display metadata.

```yaml
nimman:
  name: Nimman
  description: The digital nomad hub — cafes, coworking, walkable everything
old-city:
  name: Old City
  description: Inside and around the moat — temples, markets, riverside living
```

Adding a new area: create the subdirectory, add `.md` files, add an entry to `areas.yml`. No code changes.

### Content loader changes (src/lib/content.ts)

- `getAllBuildings()` — scan all subdirectories under `content/buildings/` recursively instead of hardcoded `nimman` and `old-city` paths
- `getUniqueAreas()` — new function, returns deduplicated area slugs from all buildings' frontmatter
- `getAreaMetadata(slug)` — new function, reads `areas.yml` for display name/description, falls back to title-cased slug if not configured
- `getBuildingsByArea(area)` — unchanged in interface, filters by frontmatter `area` field
- `getBuildingBySlug(area, slug)` — unchanged

### Type changes (src/lib/types.ts)

- Remove `AreaSlug = "nimman" | "old-city"` — replace with `string`
- Remove hardcoded `AREAS` constant — replaced by `areas.yml` + `getAreaMetadata()`
- Add `AreaMeta` interface: `{ name: string; description: string }`

## Page Components

### /cribs page (src/app/cribs/page.tsx)

Server component. Fetches all buildings via `getAllBuildings()`, all areas via `getUniqueAreas()`, and area metadata. Passes to `CribsListingClient`.

### /cribs/[area] page (src/app/cribs/[area]/page.tsx)

Server component. Fetches buildings for the area via `getBuildingsByArea(area)`. Same `CribsListingClient` component with `activeArea` prop set.

### /cribs/[area]/[slug] page (src/app/cribs/[area]/[slug]/page.tsx)

Building detail page. Essentially the same as current `[area]/[slug]/page.tsx` with updated imports and breadcrumb pointing to `/cribs`.

### CribsListingClient (src/app/cribs/CribsListingClient.tsx)

Client component replacing `AreaListingClient`. Manages:

- **Area filter state** — synced with URL. Clicking an area pill navigates to `/cribs/[area]`. Clicking "All Areas" navigates to `/cribs`.
- **Budget filter** — dropdown, client-side filtering
- **Type filter** — pill toggle, client-side filtering
- **View mode** — card or list, stored in `localStorage`, not in URL
- **Result count** — "Showing X of Y buildings"

### FilterBar (src/components/FilterBar.tsx)

Updated to include:

1. **Area pills** — dynamic from `areas` prop. "All Areas" + one pill per area. Active state matches current area.
2. **Budget dropdown** — unchanged (Any Budget, Under 10k, 15k, 20k, 30k)
3. **Type pills** — unchanged (All, Condo, Serviced Apartment)
4. **View toggle** — Cards / List toggle button group, right-aligned

### BuildingCard (src/components/BuildingCard.tsx)

Add area badge overlay on the hero image (small pill showing "Nimman" / "Old City" etc.) so cards are identifiable when viewing all areas together.

### BuildingTable (src/components/BuildingTable.tsx) — new

Table component for list view. Columns:

| Column | Data | Sortable |
|--------|------|----------|
| Building | name (linked to detail page) | Yes (alpha) |
| Area | area display name | Yes (alpha) |
| Price Range | formatted min–max | Yes (by min price) |
| Type | condo / serviced-apartment | Yes |
| Facilities | facility chips (pool, gym, etc.) | No |
| Electric | rate in THB/unit | Yes (numeric) |

Rows are clickable — navigate to building detail page. Hover highlight. Default sort: price ascending.

## Navigation

Update `Nav.tsx`:

- Replace "Nimman" and "Old City" links with a single **"Cribs"** link pointing to `/cribs`
- Keep Directory, Guides, Playbook, About unchanged

## Home Page

Update `src/app/page.tsx`:

- Area cards currently link to `/nimman` and `/old-city` — update to link to `/cribs/nimman` and `/cribs/old-city`
- Add a "View All Cribs" link pointing to `/cribs`

## SEO

- `areaMetadata()` updated to use `areas.yml` data and `/cribs/[area]` paths
- `buildingMetadata()` updated to use `/cribs/[area]/[slug]` paths
- `/cribs` page gets its own metadata: "All Cribs — CNX Cribs Chiang Mai Rental Guide"
- Redirects preserve SEO juice from old URLs

## Adding New Properties

To add a new building (e.g., Astra Condo in a new "riverside" area):

1. Create `content/buildings/riverside/astra-condo.md` with standard frontmatter (`area: riverside`)
2. Add to `content/areas.yml`:
   ```yaml
   riverside:
     name: Riverside
     description: Along the Ping River — quiet, scenic, local feel
   ```
3. Add photos to `public/buildings/astra-condo/`
4. Build — the page auto-discovers the new area and building

No code changes required.

## Out of Scope

- Additional filters beyond area + budget + type (can be added later)
- Map view
- Search functionality
- Sorting in card view (only table view gets sorting)
