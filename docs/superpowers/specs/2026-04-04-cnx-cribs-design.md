# CNX Cribs — Design Spec

**Date:** 2026-04-04
**Status:** Draft
**Author:** Shashank + Claude

---

## 1. Overview

CNX Cribs is a curated, community-driven website for long-term monthly rentals in Chiang Mai, Thailand. Built by an expat, for expats. The site provides verified building-level listings with rich detail — unit types, rates, expat tips, gotchas, and nearby spots — that existing rental aggregators lack.

**Tagline:** "long-term rentals, sorted"

**Goals:**
- Rank top 3 on Google for Chiang Mai monthly rental and expat rental queries
- Provide verified, opinionated content that scraped/stale sites cannot match
- Be self-maintained via markdown files — anyone can contribute
- Serve as a "how to Chiang Mai" resource beyond just rentals

**Non-goals for v1:**
- Individual unit availability tracking (buildings are durable, units change weekly)
- User accounts or login
- Booking or payment integration
- Automated ongoing scraping

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js (App Router) | React + SSG for SEO. Static HTML output, zero runtime server. |
| Styling | Tailwind CSS | Rapid styling, consistent design tokens, responsive utilities. |
| Content | Markdown + gray-matter + next-mdx-remote | Frontmatter for structured data, MDX for rich content. |
| Images | next/image + public directory | Optimized WebP, lazy loading, blur placeholders. |
| Fonts | Georgia (serif headers) + system-ui (body) | Café editorial vibe without custom font loading overhead. |
| Deploy | Vercel (or Netlify/Cloudflare Pages) | Zero-config SSG hosting, automatic rebuilds on push. |
| Repo | GitHub | Markdown-driven content, future PR-based contributions. |

---

## 3. Visual Design

### Palette — "Café Editorial"

| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | #FBF7F0 | Page background |
| `espresso` | #3D2B1F | Primary text, headings |
| `dark-roast` | #5C4033 | Secondary text, nav, buttons |
| `terracotta` | #C4703F | Accent, prices, CTAs, active states |
| `latte` | #8B7355 | Muted text, labels, metadata |
| `sand` | #F0E6D6 | Borders, dividers, chip backgrounds |
| `milk` | #FFFFFF | Cards, content surfaces |
| `line-green` | #06C755 | LINE contact button |

### Typography

- **Headers:** Georgia, serif. Bold (700). Tight letter-spacing (-0.5px to -1.5px). Sizes: 38-42px (page title), 22-24px (section headers), 17px (sidebar card headers).
- **Body:** system-ui, sans-serif. Regular (400) / Medium (500) / Semibold (600). Size: 14-15px. Line-height: 1.7.
- **Labels:** system-ui. Semibold (600). Uppercase. Letter-spacing 1.5px. Size: 10-11px.

### Design Principles

- **Bold and spacious** — Flent-inspired scale. Large type, generous padding (32px margins, 28-40px section gaps), big numbers in stats.
- **Café warmth** — Cream canvas, warm whites for cards, coffee-toned accents. Feels like a well-designed café menu, not a tech dashboard.
- **Image-heavy** — Photo gallery grids on hero and unit types. Real photography, not placeholders.
- **Playful but trustworthy** — Casual copy ("long-term rentals, sorted"), verified badges, "last verified" dates.

---

## 4. Project Structure

```
cnx/
├── src/
│   └── app/
│       ├── layout.tsx                    # Root layout, fonts, Nav, Footer
│       ├── page.tsx                      # Home
│       ├── about/page.tsx                # About
│       ├── playbook/page.tsx             # Rental tips guide
│       ├── guide/
│       │   ├── page.tsx                  # Guide hub
│       │   └── [category]/page.tsx       # e.g. /guide/coffee
│       └── [area]/
│           ├── page.tsx                  # Area listing (e.g. /nimman)
│           └── [slug]/page.tsx           # Building page (e.g. /nimman/punna-nimman)
├── content/
│   ├── buildings/
│   │   ├── nimman/
│   │   │   ├── punna-nimman.md
│   │   │   ├── yantarasri-nimman.md
│   │   │   └── d-condo-nim.md
│   │   └── old-city/
│   │       ��── ...
│   ├── guides/
│   │   ├── coffee.md
│   │   ├── massage.md
│   │   ├── bikes.md
│   │   ├── weed.md
│   │   └── coworking.md
│   └── playbook.md
├── public/
│   ├── buildings/
│   │   ├── punna-nimman/
│   │   │   ├── hero.jpg
│   │   │   ├── lobby.jpg
│   │   │   ├── pool.jpg
│   │   │   ├── studio-interior.jpg
│   │   │   ├── studio-bathroom.jpg
│   │   │   └── 1br-interior.jpg
│   │   └── yantarasri-nimman/
│   │       └── ...
│   └── guides/
│       ├── ristr8to.jpg
│       ├── graph-cafe.jpg
│       └── ...
├── lib/
│   ├── content.ts                        # Markdown parser, content loaders
│   ├── seo.ts                            # JSON-LD generators, meta helpers
│   └── types.ts                          # TypeScript interfaces
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── BuildingCard.tsx
│   ├── PhotoGallery.tsx
│   ├── UnitTabs.tsx
│   ├── FacilityChips.tsx
│   ├── FilterBar.tsx
│   ├── ContactCard.tsx
│   ├── QuickSummary.tsx
│   ├── LocationCard.tsx
│   ├── NearbyBuildings.tsx
│   ├── NearbySpots.tsx
│   ├── VerifiedBadge.tsx
│   ├── SEOHead.tsx
│   └── GuideCard.tsx
├── scripts/
│   └── seed-scrape.ts                    # One-time bootstrap scraper
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 5. Data Model

### Building Markdown Frontmatter

```yaml
---
name: Punna Nimman
area: nimman                          # nimman | old-city
slug: punna-nimman                    # URL slug, matches filename
address: Nimman Soi 7-9, Nimmanhaemin Road
type: serviced-condo                  # condo | serviced-apartment | apartment
coordinates: [18.797, 98.967]
price_range: [10000, 18000]           # THB/mo, min-max across all unit types
deposit: 2                            # months
electric_rate: 7                      # THB/unit
water_rate: 20                        # THB/unit
wifi: included                        # included | number (THB/mo)
facilities:
  - pool
  - gym
  - parking
  - keycard
  - cctv
  - wifi
contact:
  phone: "+66-xxx-xxx-xxxx"
  line: "@punna"
  email: null
  website: null
photos:
  - hero.jpg
  - lobby.jpg
  - pool.jpg
verified: true
last_verified: 2026-04-04
units:
  - type: Studio
    sqm: 30
    price_range: [10000, 13000]
    beds: 1
    bathrooms: 1
    features: [ac, fridge, balcony]
    recommended_floor: "4-8"
    recommended_facing: "north or east"
    photos: [studio-interior.jpg, studio-bathroom.jpg, studio-balcony.jpg]
  - type: 1 Bedroom
    sqm: 45
    price_range: [14000, 18000]
    beds: 1
    bathrooms: 1
    features: [ac, fridge, washer, balcony]
    photos: [1br-interior.jpg, 1br-bathroom.jpg]
nearby_spots:
  - slug: ristr8to-lab
    category: coffee
    walk_minutes: 3
  - slug: lila-thai-massage
    category: massage
    walk_minutes: 4
  - slug: camp-maya
    category: coworking
    walk_minutes: 7
---

## Overview

Punna Nimman is managed by the Punna group...

## Expat Tips

- Ask for the 3-month rate...

## Gotchas

- Electric rate is fair at 7 THB/unit but confirm at signing...
```

### Guide Entry Markdown Frontmatter

```yaml
---
name: Coffee Shops
category: coffee
icon: ☕
description: The best cafés for remote work and good beans in Chiang Mai.
spots:
  - name: Ristr8to Lab
    slug: ristr8to-lab
    area: nimman
    address: Nimman Soi 3
    coordinates: [18.796, 98.967]
    one_liner: Award-winning latte art, solid WiFi, packed after 10am.
    photo: ristr8to.jpg
  - name: Graph Café
    slug: graph-cafe
    area: nimman
    address: Nimman Soi 9
    coordinates: [18.798, 98.966]
    one_liner: Industrial vibe, good for long sessions, average coffee.
    photo: graph-cafe.jpg
---

## About Coffee in Chiang Mai

Chiang Mai's café culture is world-class...
```

### TypeScript Interfaces

```typescript
interface Building {
  name: string;
  area: "nimman" | "old-city";
  slug: string;
  address: string;
  type: "condo" | "serviced-apartment" | "apartment";
  coordinates: [number, number];
  price_range: [number, number];
  deposit: number;
  electric_rate: number;
  water_rate: number;
  wifi: "included" | number;
  facilities: string[];
  contact: {
    phone: string | null;
    line: string | null;
    email: string | null;
    website: string | null;
  };
  photos: string[];
  verified: boolean;
  last_verified: string;
  units: Unit[];
  nearby_spots: NearbySpotRef[];
  content: string; // rendered markdown body
}

interface Unit {
  type: string;
  sqm: number;
  price_range: [number, number];
  beds: number;
  bathrooms: number;
  features: string[];
  recommended_floor: string;
  recommended_facing: string;
  photos: string[];
}

interface NearbySpotRef {
  slug: string;
  category: string;
  walk_minutes: number;
}

interface GuideCategory {
  name: string;
  category: string;
  icon: string;
  description: string;
  spots: GuideSpot[];
  content: string;
}

interface GuideSpot {
  name: string;
  slug: string;
  area: string;
  address: string;
  coordinates: [number, number];
  one_liner: string;
  photo: string;
}
```

---

## 6. Pages

### Home (`/`)

- **Hero:** "cnx cribs" in 42px Georgia serif, tagline "long-term rentals, sorted", "built by an expat, for expats" subtitle. Cream background.
- **Area cards:** Two large cards — Nimman and Old City. Each shows: area photo, building count, price range summary, short vibe description. Links to area page.
- **Recently verified:** 4-6 BuildingCard components in 2-column grid, sorted by `last_verified` descending. Each card: hero photo, name, area badge, price range, facility icons, verified badge.
- **Guide teaser:** "Beyond rentals" section with category cards linking to `/guide/coffee`, `/guide/massage`, etc.
- **Footer:** About blurb, email for contributions, GitHub link, nav links.

### Area Page (`/nimman`, `/old-city`)

- **Area header:** Area name in large serif, description paragraph (walkability, vibe, who it's for), area hero photo.
- **Filter bar:** Price range slider, facility toggle chips (pool, gym, wifi, etc.), building type pills (condo, serviced apartment, apartment). All client-side filtering — no server round-trip.
- **Building grid:** 2-column on desktop, 1-column on mobile. BuildingCard components. Sort by: price low-high, recently verified, name.
- **Area stats:** Number of buildings, price range across all, average electric rate.

### Building Page (`/[area]/[slug]`)

**Full-width above fold:**
- **Photo gallery hero:** Grid layout — large main image (60% width) + 2 stacked side images (40% width). "View all X photos" overlay opens lightbox with all building + unit photos. Border radius 14px.
- **Title bar:** Area badge (pill), type badge, verified badge with date. Building name in 38px Georgia serif. Address below.

**Two-column layout (content: 1fr, sidebar: 360px):**

Left column (scrollable content):
1. **Price banner:** Price range in 32px Georgia, deposit and unit types below.
2. **Stats grid:** 4-column grid with electric rate, water rate, WiFi, deposit. Big numbers (22px), labels below.
3. **Facility chips:** Rounded pills with emoji + label.
4. **Unit types:** Section header "Unit Types" in 22px serif. Tabbed interface — one tab per unit type (e.g. "Studio · 30 sqm", "1BR · 45 sqm"). Active tab content shows:
   - Mini photo gallery (same grid pattern as hero but smaller)
   - 2x2 stat grid: monthly rent, bed/bath, best floor, best facing
   - Feature chips (AC, fridge, balcony, etc.)
5. **Overview:** Rendered from markdown body. 15px body text, 1.7 line-height.
6. **Expat Tips:** Rendered from markdown. Styled with terracotta left border (4px solid #C4703F), white background card, rounded right corners.
7. **Gotchas:** Same style as tips but with latte left border (#D4A574).
8. **Nearby Expat Spots:** Full-width section in main content. Broken into categories (Coffee, Massage, Co-working, etc.). Each category shows 2-4 spots as horizontal cards: spot name, walk time, one-liner. "See full guide →" link per category.
9. **Bottom CTA:** "Last verified: [date]" + "Know something we don't?" + "Drop us a line →" button linking to email.

Right sidebar (sticky):
1. **Contact card:** Call, LINE, Email buttons. Full-width stacked buttons in the sidebar.
2. **Quick Summary:** Key-value pairs — type, area, units, price, deposit, electric, WiFi.
3. **Location card:** Google Maps embed (static image or iframe), address text, "Open in Google Maps ↗" link.
4. **Nearby Buildings:** 2-3 other buildings in the same area with name, soi, price range, and → link.

**Mobile behavior:**
- Photo gallery becomes swipeable horizontal carousel
- Two-column collapses to single column — content first, then sidebar cards
- Contact card becomes sticky bottom bar with Call / LINE / Email buttons

### Playbook (`/playbook`)

Single-page rental guide. Content from markdown. Sections:
- Unit selection tips (facing, floor, avoid ground floor)
- Pricing norms (electric rates, water, deposit standards)
- Deal structures (1/3/6/12 month discounts)
- Negotiation tips (low season leverage, long-vacant units, skip agents)
- Red flags (high electric markup, no contract, no deposit receipt)
- Move-in checklist (photo everything, get receipts)
- Useful Thai phrases

SEO target: "how to rent apartment chiang mai long term", "chiang mai rental tips expat"

### Guide Hub (`/guide`)

- Header: "The Expat's Guide to Chiang Mai" in large serif.
- Category cards in 2-3 column grid. Each card: emoji icon, category name, spot count, short description. Links to `/guide/[category]`.

### Guide Category (`/guide/[category]`)

- Category header with icon, name, description.
- Spot cards: Photo, name, area badge, one-liner, address. Each spot is a card (not a separate page — spots live within the category page as a scrollable list).
- Filter by area (Nimman / Old City / All).

### About (`/about`)

- The story — why this exists, the problem with outdated listings.
- What "verified" means — visited in person, rates confirmed, photos taken.
- How to contribute — email for v1. Future: GitHub PRs.
- Who built it — brief bio, link to socials.

---

## 7. Components

| Component | Props | Description |
|-----------|-------|-------------|
| `Nav` | — | Logo (Georgia serif "cnx cribs"), links: Nimman, Old City, Guide, Playbook, About. Cream bg, espresso text. |
| `Footer` | — | About blurb, email, GitHub link, nav links. Cream bg with sand top border. |
| `BuildingCard` | `building: Building` | Hero photo, name, area badge, price range, facility icons (max 4), verified badge. White card, 14px border radius, subtle sand border. |
| `PhotoGallery` | `photos: string[], basePath: string` | Grid layout (60/40 split). "View all X photos" overlay. Click opens lightbox. |
| `UnitTabs` | `units: Unit[], buildingSlug: string` | Tab per unit type. Active tab shows mini gallery, stat grid, feature chips. |
| `FacilityChips` | `facilities: string[]` | Rounded pills with emoji + label. Sand background, dark-roast text. |
| `FilterBar` | `onFilter: (filters) => void` | Price range slider, facility toggles, type pills. Client-side only. |
| `ContactCard` | `contact: Contact` | Stacked buttons: Call (espresso), LINE (green), Email (terracotta). |
| `QuickSummary` | `building: Building` | Key-value list: type, area, price, deposit, electric, WiFi. |
| `LocationCard` | `coordinates: [number, number], address: string` | Google Maps static image, address, "Open in Maps" link. |
| `NearbyBuildings` | `buildings: Building[], current: string` | 2-3 building links with name, soi, price range. Excludes current building. |
| `NearbySpots` | `spots: NearbySpotRef[], guideData: GuideCategory[]` | Full-width section. Spots grouped by category. Name, walk time, one-liner per spot. |
| `VerifiedBadge` | `date: string` | Green check + date. Two variants: light (for dark hero bg) and dark (for cards). |
| `SEOHead` | `title, description, ogImage, jsonLd` | Per-page meta tags, Open Graph, Twitter Card, JSON-LD structured data. |
| `GuideCard` | `category: GuideCategory` | Category icon, name, spot count, description. Links to guide page. |

---

## 8. SEO Strategy

### Target Keywords

**Primary (home + area pages):**
- chiang mai monthly rental
- chiang mai long term rental
- chiang mai expat rental
- nimman condo monthly rent
- old city chiang mai apartment monthly

**Long-tail (building + playbook + guide pages):**
- how to rent apartment chiang mai long term
- nimman condo prices 2026
- best condo nimman digital nomad
- chiang mai rental deposit electric rate
- best coffee shops nimman chiang mai
- chiang mai coworking spaces expat

### Per-Page SEO

| Page | Title Pattern | JSON-LD |
|------|--------------|---------|
| Home | CNX Cribs — Chiang Mai Long-Term Rentals for Expats | WebSite + ItemList |
| Area | Nimman Rentals — Monthly Condos & Apartments \| CNX Cribs | ItemList + Place |
| Building | {name} — Monthly Rental from ฿{min_price} \| CNX Cribs | ApartmentComplex + Offer |
| Playbook | How to Rent in Chiang Mai — Expat Guide \| CNX Cribs | Article + HowTo |
| Guide Hub | Expat Guide to Chiang Mai — Coffee, Co-working & More \| CNX Cribs | ItemList |
| Guide Category | Best {category} in Chiang Mai for Expats \| CNX Cribs | ItemList + Place |
| About | About CNX Cribs — Built by an Expat, for Expats | Organization |

### Technical SEO

- **Static HTML output (SSG):** Every page pre-rendered at build time. Google sees full content, zero JS needed to index.
- **sitemap.xml:** Auto-generated from all building and guide markdown files. Submitted to Google Search Console.
- **robots.txt:** Allow full crawl.
- **Canonical URLs:** Every page declares its canonical.
- **Open Graph + Twitter Cards:** Per-page title, description, og:image (building hero photo or area photo).
- **next/image:** Optimized WebP output, proper `alt` text on all images, blur placeholder.
- **Semantic HTML:** `<article>` for building pages, `<section>` for page sections, `<nav>` for navigation, proper `h1` > `h2` > `h3` hierarchy.
- **Internal linking:** Area pages → buildings. Buildings → nearby buildings. Buildings → guide spots. Playbook → specific buildings as examples. Guide → related buildings.
- **Core Web Vitals:** Static HTML + optimized images + minimal JS = near-perfect Lighthouse scores.
- **Structured data (JSON-LD):** ApartmentComplex schema on building pages with priceRange, address, geo coordinates, amenities.

### Content Advantage

The verified, opinionated content (expat tips, gotchas, recommended floors/facing, nearby spots) is exactly what existing scraper/aggregator sites lack. Google rewards original, helpful content with depth. Each building page is a comprehensive guide, not a thin listing.

---

## 9. Data Seeding

One-time bootstrap scrape (`scripts/seed-scrape.ts`) to populate initial building data:

**Sources:**
- FazWaz.com — building names, addresses, rate ranges
- RentHub.in.th — facilities, electric/water rates, contact info
- MonthlyChiangMai.com — building descriptions, amenities

**Process:**
1. Scrape building metadata from each source
2. Merge and deduplicate by building name + area
3. Output one `.md` file per building with frontmatter populated
4. Manual enrichment: Shashank verifies on foot, adds photos, tips, gotchas, unit details
5. Script lives in repo but is not part of the build — run once, then content is maintained manually

**Not scraped (added manually):**
- Photos (taken in person)
- Expat tips and gotchas (personal experience)
- Unit type details (verified at viewing)
- Nearby expat spots (curated)
- Last verified dates (updated on visit)

---

## 10. Contribution Model

**v1:** Email-based. "Know something we don't? Drop us a line →" CTA on every building page. Shashank reviews and updates markdown files.

**Future (not v1):**
- GitHub PR-based contributions for technical users
- "Suggest an edit" form that auto-generates a PR
- Comment/review layer (GitHub Discussions or similar)

---

## 11. Mobile Behavior

- **Photo gallery:** Becomes horizontal swipeable carousel
- **Two-column layout:** Collapses to single column — main content first, sidebar cards stack below
- **Contact card:** Becomes sticky bottom bar with Call / LINE / Email buttons (always visible)
- **Filter bar:** Horizontal scroll for chips, collapsible panel for price slider
- **Unit tabs:** Horizontal scroll if more than 2-3 tabs
- **Building cards:** Single column, full-width

---

## 12. Deployment

- **Hosting:** Vercel (zero-config for Next.js SSG)
- **Domain:** TBD (cnxcribs.com or similar)
- **Build trigger:** Git push to main rebuilds and deploys
- **Google Search Console:** Submit sitemap post-launch, monitor indexing
