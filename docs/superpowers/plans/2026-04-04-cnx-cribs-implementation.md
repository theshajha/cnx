# CNX Cribs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js SSG site for Chiang Mai long-term rentals with markdown-driven content, café editorial design, and SEO-first architecture.

**Architecture:** Next.js App Router with static generation. Content lives as markdown files in `content/` parsed with gray-matter at build time. All pages pre-rendered to static HTML. Tailwind CSS for styling with custom café palette tokens. Images served from `public/buildings/` and `public/guides/`.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, gray-matter, next-mdx-remote, Vercel deployment.

**Spec:** `docs/superpowers/specs/2026-04-04-cnx-cribs-design.md`

---

### Task 1: Project Scaffolding & Config

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `src/app/globals.css`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

When prompted, accept defaults. If it asks about overwriting existing files, say yes (only the docs dir and .git exist).

- [ ] **Step 2: Install content dependencies**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
npm install gray-matter next-mdx-remote remark remark-html
```

- [ ] **Step 3: Configure Tailwind with café palette tokens**

Replace the content of `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F0",
        espresso: "#3D2B1F",
        "dark-roast": "#5C4033",
        terracotta: "#C4703F",
        latte: "#8B7355",
        sand: "#F0E6D6",
        milk: "#FFFFFF",
        "line-green": "#06C755",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Set up global CSS**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #FBF7F0;
  color: #3D2B1F;
}

h1, h2, h3, h4 {
  font-family: Georgia, serif;
}
```

- [ ] **Step 5: Configure next.config.ts for static export**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 6: Add .superpowers/ to .gitignore**

Append to `.gitignore`:

```
.superpowers/
```

- [ ] **Step 7: Verify dev server starts**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
npm run dev
```

Expected: Dev server starts on localhost:3000 with default Next.js page.

- [ ] **Step 8: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add -A
git commit -m "feat: project scaffolding — Next.js, Tailwind, café palette"
```

---

### Task 2: Types & Content Loader

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/content.ts`

- [ ] **Step 1: Create TypeScript interfaces**

Create `src/lib/types.ts`:

```typescript
export interface Building {
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
  content: string;
}

export interface Unit {
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

export interface NearbySpotRef {
  slug: string;
  category: string;
  walk_minutes: number;
}

export interface GuideCategory {
  name: string;
  category: string;
  icon: string;
  description: string;
  spots: GuideSpot[];
  content: string;
}

export interface GuideSpot {
  name: string;
  slug: string;
  area: string;
  address: string;
  coordinates: [number, number];
  one_liner: string;
  photo: string;
}

export type AreaSlug = "nimman" | "old-city";

export interface AreaInfo {
  slug: AreaSlug;
  name: string;
  description: string;
  photo: string;
}

export const AREAS: Record<AreaSlug, AreaInfo> = {
  nimman: {
    slug: "nimman",
    name: "Nimman",
    description: "The digital nomad heartland. Cafés, co-working, and condos within walking distance of everything.",
    photo: "/areas/nimman.jpg",
  },
  "old-city": {
    slug: "old-city",
    name: "Old City",
    description: "Temples, night markets, and affordable living inside the ancient moat. Quieter pace, rich culture.",
    photo: "/areas/old-city.jpg",
  },
};
```

- [ ] **Step 2: Create content loader**

Create `src/lib/content.ts`:

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Building, GuideCategory, AreaSlug } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getAllBuildings(): Building[] {
  const areas: AreaSlug[] = ["nimman", "old-city"];
  const buildings: Building[] = [];

  for (const area of areas) {
    const areaDir = path.join(CONTENT_DIR, "buildings", area);
    if (!fs.existsSync(areaDir)) continue;

    const files = fs.readdirSync(areaDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(areaDir, file), "utf-8");
      const { data, content } = matter(raw);
      buildings.push({ ...data, content } as Building);
    }
  }

  return buildings;
}

export function getBuildingsByArea(area: AreaSlug): Building[] {
  return getAllBuildings().filter((b) => b.area === area);
}

export function getBuildingBySlug(area: string, slug: string): Building | undefined {
  return getAllBuildings().find((b) => b.area === area && b.slug === slug);
}

export function getAllGuides(): GuideCategory[] {
  const guidesDir = path.join(CONTENT_DIR, "guides");
  if (!fs.existsSync(guidesDir)) return [];

  const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(guidesDir, file), "utf-8");
    const { data, content } = matter(raw);
    return { ...data, content } as GuideCategory;
  });
}

export function getGuideByCategory(category: string): GuideCategory | undefined {
  return getAllGuides().find((g) => g.category === category);
}

export function getPlaybookContent(): { content: string } {
  const filePath = path.join(CONTENT_DIR, "playbook.md");
  if (!fs.existsSync(filePath)) return { content: "" };
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  return { content };
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/lib/types.ts src/lib/content.ts
git commit -m "feat: types and content loader for markdown parsing"
```

---

### Task 3: Sample Content — Buildings, Guides, Playbook

**Files:**
- Create: `content/buildings/nimman/punna-nimman.md`
- Create: `content/buildings/nimman/yantarasri-nimman.md`
- Create: `content/buildings/nimman/d-condo-nim.md`
- Create: `content/guides/coffee.md`
- Create: `content/guides/massage.md`
- Create: `content/guides/coworking.md`
- Create: `content/playbook.md`

This task creates seed content so all pages have real data to render. Use the data already researched in `disha/knowledge/chiang-mai-rentals.md`.

- [ ] **Step 1: Create Punna Nimman listing**

Create `content/buildings/nimman/punna-nimman.md` with full frontmatter per the spec data model. Use the unverified research data from earlier — name, address, facilities, rate ranges. Set `verified: false` for now. Include realistic unit types (Studio, 1BR). Include `nearby_spots` referencing coffee/massage/coworking slugs.

- [ ] **Step 2: Create Yantarasri@Nimman listing**

Create `content/buildings/nimman/yantarasri-nimman.md`. Data from the detailed research: 40 sqm studios, 10,000-13,000 THB, Soi 8, communal kitchen, coin laundry, pool at resort on Soi 6. Contact: LINE @atnimman, phone +66-82-885-5545.

- [ ] **Step 3: Create D Condo Nim listing**

Create `content/buildings/nimman/d-condo-nim.md`. Condo type, main Nimman Road, 8,000-15,000 THB studios, individual owner-managed units.

- [ ] **Step 4: Create coffee guide**

Create `content/guides/coffee.md` with 3-4 Nimman coffee spots: Ristr8to Lab (Soi 3), Graph Café (Soi 9), CAMP at Maya. Each with slug, area, address, coordinates, one_liner, photo filename.

- [ ] **Step 5: Create massage and coworking guides**

Create `content/guides/massage.md` and `content/guides/coworking.md` with 2-3 spots each.

- [ ] **Step 6: Create playbook content**

Create `content/playbook.md` using the "Nimman Rental Playbook" section from `disha/knowledge/chiang-mai-rentals.md`. Sections: Unit Selection, Pricing Norms, Deal Structures, Negotiation, Red Flags, Move-In Checklist, Useful Thai.

- [ ] **Step 7: Create placeholder images**

Create placeholder SVG files so the build doesn't break on missing images:

```bash
mkdir -p public/buildings/punna-nimman public/buildings/yantarasri-nimman public/buildings/d-condo-nim public/guides public/areas
```

For each building, create a simple placeholder `hero.jpg` (can be a 1x1 pixel or small placeholder). We'll use real photos later.

- [ ] **Step 8: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add content/ public/
git commit -m "feat: seed content — 3 Nimman buildings, 3 guides, playbook"
```

---

### Task 4: Layout, Nav & Footer

**Files:**
- Create: `src/components/Nav.tsx`
- Create: `src/components/Footer.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create Nav component**

Create `src/components/Nav.tsx`:

```tsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex justify-between items-center px-8 py-5">
      <Link href="/" className="font-serif font-bold text-[22px] text-espresso tracking-tight hover:text-terracotta transition-colors">
        cnx cribs
      </Link>
      <div className="flex gap-7 text-sm font-medium text-dark-roast">
        <Link href="/nimman" className="hover:text-terracotta transition-colors">Nimman</Link>
        <Link href="/old-city" className="hover:text-terracotta transition-colors">Old City</Link>
        <Link href="/guide" className="hover:text-terracotta transition-colors">Guide</Link>
        <Link href="/playbook" className="hover:text-terracotta transition-colors">Playbook</Link>
        <Link href="/about" className="hover:text-terracotta transition-colors">About</Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create Footer component**

Create `src/components/Footer.tsx`:

```tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-sand mt-16 py-12 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-md">
          <div className="font-serif font-bold text-lg text-espresso">cnx cribs</div>
          <p className="text-sm text-latte mt-2 leading-relaxed">
            Curated long-term rentals in Chiang Mai. Built by an expat, for expats.
            Every listing verified on foot.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <div>
            <div className="font-semibold text-espresso mb-3">Explore</div>
            <div className="flex flex-col gap-2 text-latte">
              <Link href="/nimman" className="hover:text-terracotta transition-colors">Nimman</Link>
              <Link href="/old-city" className="hover:text-terracotta transition-colors">Old City</Link>
              <Link href="/guide" className="hover:text-terracotta transition-colors">Guide</Link>
              <Link href="/playbook" className="hover:text-terracotta transition-colors">Playbook</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-espresso mb-3">Contribute</div>
            <div className="flex flex-col gap-2 text-latte">
              <a href="mailto:hello@cnxcribs.com" className="hover:text-terracotta transition-colors">Email Us</a>
              <Link href="/about" className="hover:text-terracotta transition-colors">About</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-sand text-xs text-latte">
        © {new Date().getFullYear()} CNX Cribs. Built with ☕ in Chiang Mai.
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "CNX Cribs — Chiang Mai Long-Term Rentals for Expats",
  description: "Curated, verified monthly rentals in Chiang Mai. Real prices, expat tips, and honest reviews. Built by an expat, for expats.",
  openGraph: {
    title: "CNX Cribs — Chiang Mai Long-Term Rentals for Expats",
    description: "Curated, verified monthly rentals in Chiang Mai. Real prices, expat tips, and honest reviews.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream text-espresso antialiased">
        <Nav />
        <main className="max-w-6xl mx-auto px-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/components/Nav.tsx src/components/Footer.tsx src/app/layout.tsx
git commit -m "feat: Nav, Footer, and root layout with café theme"
```

---

### Task 5: Shared UI Components

**Files:**
- Create: `src/components/VerifiedBadge.tsx`
- Create: `src/components/FacilityChips.tsx`
- Create: `src/components/ContactCard.tsx`
- Create: `src/components/QuickSummary.tsx`
- Create: `src/components/LocationCard.tsx`

- [ ] **Step 1: Create VerifiedBadge**

Create `src/components/VerifiedBadge.tsx`:

```tsx
interface VerifiedBadgeProps {
  date: string;
  variant?: "light" | "dark";
}

export default function VerifiedBadge({ date, variant = "dark" }: VerifiedBadgeProps) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (variant === "light") {
    return (
      <span className="bg-white/15 text-sand px-3.5 py-1.5 rounded-lg text-xs font-medium">
        ✓ Verified {formatted}
      </span>
    );
  }

  return (
    <span className="bg-sand/60 text-dark-roast px-3 py-1 rounded text-[11px] font-semibold">
      ✓ Verified {formatted}
    </span>
  );
}
```

- [ ] **Step 2: Create FacilityChips**

Create `src/components/FacilityChips.tsx`:

```tsx
const FACILITY_ICONS: Record<string, string> = {
  pool: "🏊",
  gym: "💪",
  parking: "🅿️",
  keycard: "🔑",
  cctv: "📹",
  wifi: "📶",
  laundry: "🧺",
  kitchen: "🍳",
  elevator: "🛗",
  garden: "🌿",
};

interface FacilityChipsProps {
  facilities: string[];
  size?: "sm" | "md";
}

export default function FacilityChips({ facilities, size = "md" }: FacilityChipsProps) {
  const padding = size === "sm" ? "px-2.5 py-1" : "px-4 py-2";
  const text = size === "sm" ? "text-[11px]" : "text-[13px]";

  return (
    <div className="flex gap-2 flex-wrap">
      {facilities.map((f) => (
        <span key={f} className={`bg-sand text-dark-roast ${padding} rounded-full ${text} font-medium`}>
          {FACILITY_ICONS[f] || "•"} {f.charAt(0).toUpperCase() + f.slice(1)}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create ContactCard**

Create `src/components/ContactCard.tsx`:

```tsx
interface ContactCardProps {
  contact: {
    phone: string | null;
    line: string | null;
    email: string | null;
    website: string | null;
  };
}

export default function ContactCard({ contact }: ContactCardProps) {
  return (
    <div className="bg-milk rounded-[14px] p-6 border border-sand">
      <h3 className="font-serif font-bold text-[17px] text-espresso mb-4">Get in Touch</h3>
      <div className="flex flex-col gap-2.5">
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="bg-dark-roast text-cream py-3.5 px-4 rounded-[10px] text-sm font-semibold text-center block hover:opacity-90 transition-opacity">
            📞 {contact.phone}
          </a>
        )}
        {contact.line && (
          <a href={`https://line.me/R/ti/p/${contact.line.replace("@", "")}`} className="bg-line-green text-white py-3.5 px-4 rounded-[10px] text-sm font-semibold text-center block hover:opacity-90 transition-opacity">
            💬 LINE {contact.line}
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="bg-terracotta text-cream py-3.5 px-4 rounded-[10px] text-sm font-semibold text-center block hover:opacity-90 transition-opacity">
            ✉️ Email
          </a>
        )}
        {contact.website && (
          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="bg-sand text-dark-roast py-3.5 px-4 rounded-[10px] text-sm font-semibold text-center block hover:opacity-90 transition-opacity">
            🌐 Website
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create QuickSummary**

Create `src/components/QuickSummary.tsx`:

```tsx
import { Building } from "@/lib/types";

interface QuickSummaryProps {
  building: Building;
}

export default function QuickSummary({ building }: QuickSummaryProps) {
  const unitTypes = building.units.map((u) => u.type).join(", ");
  const priceDisplay = `฿${(building.price_range[0] / 1000).toFixed(0)}–${(building.price_range[1] / 1000).toFixed(0)}k/mo`;

  const rows = [
    { label: "Type", value: building.type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
    { label: "Area", value: building.area === "nimman" ? "Nimman" : "Old City" },
    { label: "Units", value: unitTypes },
    { label: "Price", value: priceDisplay, accent: true },
    { label: "Deposit", value: `${building.deposit} month${building.deposit > 1 ? "s" : ""}` },
    { label: "Electric", value: `${building.electric_rate} ฿/unit` },
    { label: "WiFi", value: building.wifi === "included" ? "Included" : `${building.wifi} ฿/mo` },
  ];

  return (
    <div className="bg-milk rounded-[14px] p-6 border border-sand">
      <h3 className="font-serif font-bold text-[17px] text-espresso mb-4">Quick Summary</h3>
      <div className="flex flex-col gap-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <span className="text-latte">{row.label}</span>
            <span className={row.accent ? "text-terracotta font-bold" : "text-espresso font-semibold"}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create LocationCard**

Create `src/components/LocationCard.tsx`:

```tsx
interface LocationCardProps {
  coordinates: [number, number];
  address: string;
}

export default function LocationCard({ coordinates, address }: LocationCardProps) {
  const mapsUrl = `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`;

  return (
    <div className="bg-milk rounded-[14px] p-6 border border-sand">
      <h3 className="font-serif font-bold text-[17px] text-espresso mb-3">Location</h3>
      <div className="bg-sand h-[120px] rounded-[10px] flex items-center justify-center text-latte text-sm mb-3">
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d${coordinates[1]}!3d${coordinates[0]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sth`}
          className="w-full h-full rounded-[10px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location map"
        />
      </div>
      <p className="text-sm text-dark-roast leading-relaxed">{address}</p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block bg-cream text-dark-roast py-2.5 px-4 rounded-lg text-sm font-semibold text-center hover:bg-sand transition-colors"
      >
        Open in Google Maps ↗
      </a>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/components/VerifiedBadge.tsx src/components/FacilityChips.tsx src/components/ContactCard.tsx src/components/QuickSummary.tsx src/components/LocationCard.tsx
git commit -m "feat: shared UI components — badges, chips, contact, summary, location"
```

---

### Task 6: Photo Gallery & Unit Tabs

**Files:**
- Create: `src/components/PhotoGallery.tsx`
- Create: `src/components/UnitTabs.tsx`

- [ ] **Step 1: Create PhotoGallery**

Create `src/components/PhotoGallery.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface PhotoGalleryProps {
  photos: string[];
  basePath: string;
  alt: string;
}

export default function PhotoGallery({ photos, basePath, alt }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="bg-sand h-[260px] rounded-[14px] flex items-center justify-center text-latte">
        No photos yet
      </div>
    );
  }

  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 3);

  return (
    <>
      <div className="grid grid-cols-[1.6fr_1fr] gap-1 rounded-[14px] overflow-hidden h-[260px] md:h-[340px]">
        <button
          onClick={() => { setActiveIndex(0); setLightboxOpen(true); }}
          className="relative overflow-hidden group"
        >
          <Image
            src={`${basePath}/${mainPhoto}`}
            alt={`${alt} — main photo`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        </button>
        <div className="grid grid-rows-2 gap-1">
          {sidePhotos.map((photo, i) => (
            <button
              key={photo}
              onClick={() => { setActiveIndex(i + 1); setLightboxOpen(true); }}
              className="relative overflow-hidden group"
            >
              <Image
                src={`${basePath}/${photo}`}
                alt={`${alt} — photo ${i + 2}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {i === sidePhotos.length - 1 && photos.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    +{photos.length - 3} more
                  </span>
                </div>
              )}
            </button>
          ))}
          {sidePhotos.length < 2 && (
            <div className="bg-sand flex items-center justify-center text-latte text-sm">
              📸
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-2xl font-bold hover:opacity-70"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + photos.length) % photos.length); }}
          >
            ‹
          </button>
          <div className="relative w-[90vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={`${basePath}/${photos[activeIndex]}`}
              alt={`${alt} — photo ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % photos.length); }}
          >
            ›
          </button>
          <div className="absolute bottom-6 text-white text-sm">
            {activeIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Create UnitTabs**

Create `src/components/UnitTabs.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Unit } from "@/lib/types";

interface UnitTabsProps {
  units: Unit[];
  buildingSlug: string;
}

export default function UnitTabs({ units, buildingSlug }: UnitTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const unit = units[activeTab];

  return (
    <div>
      <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-4">
        Unit Types
      </h2>

      <div className="flex gap-0">
        {units.map((u, i) => (
          <button
            key={u.type}
            onClick={() => setActiveTab(i)}
            className={`py-3 px-6 text-sm font-bold transition-colors ${
              i === activeTab
                ? "text-espresso bg-milk border border-sand border-b-0 rounded-t-[10px]"
                : "text-latte hover:text-dark-roast"
            }`}
          >
            {u.type} · {u.sqm} sqm
          </button>
        ))}
      </div>

      <div className="bg-milk border border-sand rounded-b-[10px] rounded-tr-[10px] p-6">
        {unit.photos.length > 0 && (
          <div className="grid grid-cols-[1.4fr_1fr] gap-1 rounded-lg overflow-hidden h-[140px] mb-5">
            <div className="relative">
              <Image
                src={`/buildings/${buildingSlug}/${unit.photos[0]}`}
                alt={`${unit.type} interior`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="grid grid-rows-2 gap-1">
              {unit.photos.slice(1, 3).map((photo, i) => (
                <div key={photo} className="relative">
                  <Image
                    src={`/buildings/${buildingSlug}/${photo}`}
                    alt={`${unit.type} photo ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  {i === Math.min(unit.photos.length - 2, 1) && unit.photos.length > 3 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">+{unit.photos.length - 3} more</span>
                    </div>
                  )}
                </div>
              ))}
              {unit.photos.length < 3 && (
                <div className="bg-sand flex items-center justify-center text-latte text-xs">📸</div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cream p-4 rounded-[10px]">
            <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Monthly Rent</div>
            <div className="font-serif font-bold text-xl text-terracotta mt-1.5">
              ฿{unit.price_range[0].toLocaleString()} – {unit.price_range[1].toLocaleString()}
            </div>
          </div>
          <div className="bg-cream p-4 rounded-[10px]">
            <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Bed / Bath</div>
            <div className="font-serif font-bold text-xl text-espresso mt-1.5">
              {unit.beds} / {unit.bathrooms}
            </div>
          </div>
          <div className="bg-cream p-4 rounded-[10px]">
            <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Best Floor</div>
            <div className="font-bold text-lg text-espresso mt-1.5">{unit.recommended_floor}</div>
          </div>
          <div className="bg-cream p-4 rounded-[10px]">
            <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Best Facing</div>
            <div className="font-bold text-lg text-espresso mt-1.5">{unit.recommended_facing}</div>
          </div>
        </div>

        {unit.features.length > 0 && (
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {unit.features.map((f) => (
              <span key={f} className="bg-sand text-dark-roast px-3 py-1.5 rounded-md text-xs font-medium">
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/components/PhotoGallery.tsx src/components/UnitTabs.tsx
git commit -m "feat: PhotoGallery with lightbox and UnitTabs components"
```

---

### Task 7: Building Card & Nearby Components

**Files:**
- Create: `src/components/BuildingCard.tsx`
- Create: `src/components/NearbyBuildings.tsx`
- Create: `src/components/NearbySpots.tsx`
- Create: `src/components/GuideCard.tsx`

- [ ] **Step 1: Create BuildingCard**

Create `src/components/BuildingCard.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { Building } from "@/lib/types";
import VerifiedBadge from "./VerifiedBadge";
import FacilityChips from "./FacilityChips";

interface BuildingCardProps {
  building: Building;
}

export default function BuildingCard({ building }: BuildingCardProps) {
  const priceDisplay = `฿${(building.price_range[0] / 1000).toFixed(0)}–${(building.price_range[1] / 1000).toFixed(0)}k`;
  const areaLabel = building.area === "nimman" ? "Nimman" : "Old City";
  const heroPhoto = building.photos[0] || "hero.jpg";

  return (
    <Link
      href={`/${building.area}/${building.slug}`}
      className="block bg-milk rounded-[14px] border border-sand overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative h-[180px]">
        <Image
          src={`/buildings/${building.slug}/${heroPhoto}`}
          alt={building.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-terracotta/90 text-cream px-3 py-1 rounded-full text-[11px] font-bold">
            {areaLabel}
          </span>
        </div>
        {building.verified && (
          <div className="absolute top-3 right-3">
            <VerifiedBadge date={building.last_verified} />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif font-bold text-lg text-espresso">{building.name}</h3>
        <p className="text-xs text-latte mt-1">{building.address}</p>
        <div className="mt-3">
          <FacilityChips facilities={building.facilities.slice(0, 4)} size="sm" />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="font-serif font-bold text-xl text-terracotta">
            {priceDisplay}<span className="text-sm font-normal text-latte">/mo</span>
          </div>
          <div className="text-xs text-latte">
            {building.units.map((u) => u.type).join(" · ")}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create NearbyBuildings**

Create `src/components/NearbyBuildings.tsx`:

```tsx
import Link from "next/link";
import { Building } from "@/lib/types";

interface NearbyBuildingsProps {
  buildings: Building[];
  currentSlug: string;
}

export default function NearbyBuildings({ buildings, currentSlug }: NearbyBuildingsProps) {
  const nearby = buildings.filter((b) => b.slug !== currentSlug).slice(0, 3);

  if (nearby.length === 0) return null;

  return (
    <div className="bg-milk rounded-[14px] p-6 border border-sand">
      <h3 className="font-serif font-bold text-[17px] text-espresso mb-4">Nearby Buildings</h3>
      <div className="flex flex-col gap-3">
        {nearby.map((b, i) => (
          <div key={b.slug}>
            {i > 0 && <div className="border-t border-sand mb-3" />}
            <Link href={`/${b.area}/${b.slug}`} className="flex justify-between items-center group">
              <div>
                <div className="text-espresso font-semibold text-sm group-hover:text-terracotta transition-colors">
                  {b.name}
                </div>
                <div className="text-latte text-[11px] mt-0.5">
                  {b.address.split(",")[0]} · ฿{(b.price_range[0] / 1000).toFixed(0)}–{(b.price_range[1] / 1000).toFixed(0)}k
                </div>
              </div>
              <span className="text-terracotta font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create NearbySpots**

Create `src/components/NearbySpots.tsx`:

```tsx
import Link from "next/link";
import { NearbySpotRef, GuideCategory } from "@/lib/types";

interface NearbySpotsProps {
  spots: NearbySpotRef[];
  guides: GuideCategory[];
}

export default function NearbySpots({ spots, guides }: NearbySpotsProps) {
  if (spots.length === 0) return null;

  const categories = Array.from(new Set(spots.map((s) => s.category)));

  const CATEGORY_ICONS: Record<string, string> = {
    coffee: "☕",
    massage: "💆",
    coworking: "🏋️",
    bikes: "🚲",
    weed: "🌿",
  };

  return (
    <div>
      <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-5">
        Nearby Expat Spots
      </h2>
      <div className="space-y-6">
        {categories.map((cat) => {
          const guide = guides.find((g) => g.category === cat);
          const catSpots = spots.filter((s) => s.category === cat);

          return (
            <div key={cat}>
              <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold mb-3">
                {CATEGORY_ICONS[cat] || "•"} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
              <div className="space-y-2">
                {catSpots.map((spot) => {
                  const guideSpot = guide?.spots.find((gs) => gs.slug === spot.slug);
                  return (
                    <div key={spot.slug} className="flex justify-between items-center bg-milk p-3 rounded-lg border border-sand">
                      <div>
                        <div className="text-espresso font-medium text-sm">{guideSpot?.name || spot.slug}</div>
                        {guideSpot?.one_liner && (
                          <div className="text-latte text-xs mt-0.5">{guideSpot.one_liner}</div>
                        )}
                      </div>
                      <span className="text-latte text-[11px] whitespace-nowrap ml-4">{spot.walk_minutes} min walk</span>
                    </div>
                  );
                })}
              </div>
              {guide && (
                <Link href={`/guide/${cat}`} className="text-terracotta text-sm font-semibold mt-2 inline-block hover:underline">
                  See full guide →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create GuideCard**

Create `src/components/GuideCard.tsx`:

```tsx
import Link from "next/link";
import { GuideCategory } from "@/lib/types";

interface GuideCardProps {
  guide: GuideCategory;
}

export default function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link
      href={`/guide/${guide.category}`}
      className="block bg-milk rounded-[14px] border border-sand p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="text-3xl mb-3">{guide.icon}</div>
      <h3 className="font-serif font-bold text-lg text-espresso">{guide.name}</h3>
      <p className="text-sm text-latte mt-2 leading-relaxed">{guide.description}</p>
      <div className="mt-3 text-xs text-terracotta font-semibold">
        {guide.spots.length} spot{guide.spots.length !== 1 ? "s" : ""} →
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/components/BuildingCard.tsx src/components/NearbyBuildings.tsx src/components/NearbySpots.tsx src/components/GuideCard.tsx
git commit -m "feat: BuildingCard, NearbyBuildings, NearbySpots, GuideCard"
```

---

### Task 8: SEO Utilities

**Files:**
- Create: `src/lib/seo.ts`

- [ ] **Step 1: Create SEO helpers**

Create `src/lib/seo.ts`:

```typescript
import { Building, GuideCategory } from "./types";
import { Metadata } from "next";

const SITE_NAME = "CNX Cribs";
const SITE_URL = "https://cnxcribs.com";

export function buildingMetadata(building: Building): Metadata {
  const minPrice = building.price_range[0].toLocaleString();
  return {
    title: `${building.name} — Monthly Rental from ฿${minPrice} | ${SITE_NAME}`,
    description: `${building.name} in ${building.area === "nimman" ? "Nimman" : "Old City"}, Chiang Mai. ${building.units.map((u) => u.type).join(" & ")} from ฿${minPrice}/mo. Verified expat reviews, tips, and real pricing.`,
    openGraph: {
      title: `${building.name} — Monthly Rental from ฿${minPrice} | ${SITE_NAME}`,
      description: `Verified monthly rental in Chiang Mai. ${building.units.map((u) => u.type).join(" & ")} from ฿${minPrice}/mo.`,
      images: building.photos[0] ? [`${SITE_URL}/buildings/${building.slug}/${building.photos[0]}`] : [],
    },
  };
}

export function areaMetadata(area: "nimman" | "old-city", buildingCount: number): Metadata {
  const areaName = area === "nimman" ? "Nimman" : "Old City";
  return {
    title: `${areaName} Rentals — Monthly Condos & Apartments | ${SITE_NAME}`,
    description: `${buildingCount} verified monthly rentals in ${areaName}, Chiang Mai. Real prices, expat tips, and honest reviews.`,
  };
}

export function guideMetadata(guide: GuideCategory): Metadata {
  return {
    title: `Best ${guide.name} in Chiang Mai for Expats | ${SITE_NAME}`,
    description: guide.description,
  };
}

export function buildingJsonLd(building: Building) {
  return {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: building.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: building.address,
      addressLocality: "Chiang Mai",
      addressCountry: "TH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: building.coordinates[0],
      longitude: building.coordinates[1],
    },
    priceRange: `฿${building.price_range[0]}–${building.price_range[1]}/month`,
    amenityFeature: building.facilities.map((f) => ({
      "@type": "LocationFeatureSpecification",
      name: f,
      value: true,
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Curated, verified monthly rentals in Chiang Mai. Built by an expat, for expats.",
  };
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/lib/seo.ts
git commit -m "feat: SEO utilities — metadata, JSON-LD generators"
```

---

### Task 9: Building Page

**Files:**
- Create: `src/app/[area]/[slug]/page.tsx`

- [ ] **Step 1: Create the building detail page**

Create `src/app/[area]/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getAllBuildings, getBuildingBySlug, getBuildingsByArea, getAllGuides } from "@/lib/content";
import { buildingMetadata, buildingJsonLd } from "@/lib/seo";
import PhotoGallery from "@/components/PhotoGallery";
import UnitTabs from "@/components/UnitTabs";
import FacilityChips from "@/components/FacilityChips";
import ContactCard from "@/components/ContactCard";
import QuickSummary from "@/components/QuickSummary";
import LocationCard from "@/components/LocationCard";
import NearbyBuildings from "@/components/NearbyBuildings";
import NearbySpots from "@/components/NearbySpots";
import VerifiedBadge from "@/components/VerifiedBadge";

interface Props {
  params: Promise<{ area: string; slug: string }>;
}

export async function generateStaticParams() {
  const buildings = getAllBuildings();
  return buildings.map((b) => ({ area: b.area, slug: b.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { area, slug } = await params;
  const building = getBuildingBySlug(area, slug);
  if (!building) return {};
  return buildingMetadata(building);
}

export default async function BuildingPage({ params }: Props) {
  const { area, slug } = await params;
  const building = getBuildingBySlug(area, slug);
  if (!building) notFound();

  const areaBuildings = getBuildingsByArea(building.area);
  const guides = getAllGuides();
  const areaLabel = building.area === "nimman" ? "Nimman" : "Old City";
  const typeLabel = building.type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const allPhotos = [
    ...building.photos,
    ...building.units.flatMap((u) => u.photos),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildingJsonLd(building)) }}
      />

      {/* Photo Gallery Hero */}
      <section className="-mx-8 mb-0">
        <div className="px-8">
          <PhotoGallery
            photos={allPhotos}
            basePath={`/buildings/${building.slug}`}
            alt={building.name}
          />
        </div>
      </section>

      {/* Title Bar */}
      <section className="pt-6 pb-2">
        <div className="flex gap-2 items-center mb-2">
          <span className="bg-terracotta/90 text-cream px-3.5 py-1 rounded-full text-xs font-bold">
            {areaLabel}
          </span>
          <span className="bg-dark-roast/10 text-dark-roast px-3 py-1 rounded-full text-xs font-semibold">
            {typeLabel}
          </span>
          {building.verified && (
            <VerifiedBadge date={building.last_verified} />
          )}
        </div>
        <h1 className="font-serif font-bold text-[38px] text-espresso tracking-[-1.5px] leading-tight">
          {building.name}
        </h1>
        <p className="text-[15px] text-latte mt-1.5">{building.address}</p>
      </section>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0 min-h-[600px]">
        {/* Left Column */}
        <article className="pr-0 lg:pr-8 lg:border-r lg:border-sand">
          {/* Price Banner */}
          <section className="mb-7 pt-4">
            <div className="font-serif font-bold text-[32px] text-espresso tracking-tight">
              ฿{building.price_range[0].toLocaleString()} – {building.price_range[1].toLocaleString()}
              <span className="text-base font-normal text-latte ml-1">/mo</span>
            </div>
            <p className="text-sm text-latte mt-1">
              {building.units.map((u) => u.type).join(" & ")} · {building.deposit} month deposit
            </p>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-4 border border-sand rounded-xl overflow-hidden mb-6">
            {[
              { value: String(building.electric_rate), label: "฿/unit elec" },
              { value: String(building.water_rate), label: "฿/unit water" },
              { value: building.wifi === "included" ? "Free" : `${building.wifi}฿`, label: "WiFi" },
              { value: `${building.deposit} mo`, label: "deposit" },
            ].map((stat, i) => (
              <div key={stat.label} className={`py-4 px-3 text-center bg-milk ${i > 0 ? "border-l border-sand" : ""}`}>
                <div className="font-serif font-bold text-[22px] text-espresso">{stat.value}</div>
                <div className="text-[11px] text-latte mt-0.5">{stat.label}</div>
              </div>
            ))}
          </section>

          {/* Facilities */}
          <section className="mb-7">
            <FacilityChips facilities={building.facilities} />
          </section>

          {/* Unit Types */}
          <section className="mb-7">
            <UnitTabs units={building.units} buildingSlug={building.slug} />
          </section>

          {/* Markdown Content */}
          <section className="prose-cnx space-y-8">
            {building.content && renderMarkdownSections(building.content)}
          </section>

          {/* Nearby Expat Spots */}
          {building.nearby_spots.length > 0 && (
            <section className="mt-10 mb-8">
              <NearbySpots spots={building.nearby_spots} guides={guides} />
            </section>
          )}

          {/* Bottom CTA */}
          <section className="pt-6 pb-8 border-t border-sand text-center">
            <p className="text-sm text-latte">Last verified: {building.last_verified}</p>
            <p className="mt-3 font-serif text-lg text-espresso font-bold">Know something we don&apos;t?</p>
            <a
              href="mailto:hello@cnxcribs.com"
              className="mt-3 inline-block bg-terracotta text-cream py-3 px-7 rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Drop us a line →
            </a>
          </section>
        </article>

        {/* Right Sidebar */}
        <aside className="pt-4 lg:pl-6 space-y-4 lg:sticky lg:top-4 lg:self-start">
          <ContactCard contact={building.contact} />
          <QuickSummary building={building} />
          <LocationCard coordinates={building.coordinates} address={building.address} />
          <NearbyBuildings buildings={areaBuildings} currentSlug={building.slug} />
        </aside>
      </div>
    </>
  );
}

function renderMarkdownSections(content: string) {
  const sections = content.split(/^## /m).filter(Boolean);

  return sections.map((section, i) => {
    const [title, ...bodyLines] = section.split("\n");
    const body = bodyLines.join("\n").trim();

    if (!body) return null;

    const isExpat = title.toLowerCase().includes("expat") || title.toLowerCase().includes("tip");
    const isGotcha = title.toLowerCase().includes("gotcha") || title.toLowerCase().includes("warning");

    const borderClass = isExpat
      ? "border-l-4 border-l-terracotta"
      : isGotcha
        ? "border-l-4 border-l-latte"
        : "";

    const items = body.split("\n").filter((line) => line.startsWith("- ")).map((line) => line.slice(2));
    const paragraphs = body.split("\n").filter((line) => !line.startsWith("- ") && line.trim());

    return (
      <div key={i}>
        <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight">
          {title.trim()}
        </h2>
        <div className={`mt-3 p-5 bg-milk rounded-r-[10px] text-sm text-dark-roast leading-relaxed ${borderClass}`}>
          {items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          ) : (
            paragraphs.map((p, j) => <p key={j} className={j > 0 ? "mt-3" : ""}>{p}</p>)
          )}
        </div>
      </div>
    );
  });
}
```

- [ ] **Step 2: Verify the building page renders**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
npm run dev
```

Navigate to `http://localhost:3000/nimman/punna-nimman` and verify the page renders with the two-column layout, photo gallery, unit tabs, sidebar cards, and markdown content sections.

- [ ] **Step 3: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/app/\\[area\\]/\\[slug\\]/page.tsx
git commit -m "feat: building detail page with two-column layout and sidebar"
```

---

### Task 10: Area Page with Filter Bar

**Files:**
- Create: `src/app/[area]/page.tsx`
- Create: `src/components/FilterBar.tsx`

- [ ] **Step 1: Create FilterBar**

Create `src/components/FilterBar.tsx`:

```tsx
"use client";

import { useState } from "react";

interface Filters {
  maxPrice: number;
  facilities: string[];
  type: string | null;
}

interface FilterBarProps {
  onFilter: (filters: Filters) => void;
  allFacilities: string[];
}

const BUILDING_TYPES = ["condo", "serviced-apartment", "apartment"];

export default function FilterBar({ onFilter, allFacilities }: FilterBarProps) {
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleFacilityToggle = (f: string) => {
    const next = selectedFacilities.includes(f)
      ? selectedFacilities.filter((x) => x !== f)
      : [...selectedFacilities, f];
    setSelectedFacilities(next);
    onFilter({ maxPrice, facilities: next, type: selectedType });
  };

  const handleTypeToggle = (t: string) => {
    const next = selectedType === t ? null : t;
    setSelectedType(next);
    onFilter({ maxPrice, facilities: selectedFacilities, type: next });
  };

  const handlePriceChange = (value: number) => {
    setMaxPrice(value);
    onFilter({ maxPrice: value, facilities: selectedFacilities, type: selectedType });
  };

  return (
    <div className="bg-milk rounded-[14px] border border-sand p-5 mb-6 space-y-4">
      <div>
        <label className="text-[11px] text-latte uppercase tracking-[1.5px] font-semibold block mb-2">
          Max Budget: ฿{maxPrice.toLocaleString()}/mo
        </label>
        <input
          type="range"
          min={5000}
          max={50000}
          step={1000}
          value={maxPrice}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full accent-terracotta"
        />
      </div>
      <div>
        <label className="text-[11px] text-latte uppercase tracking-[1.5px] font-semibold block mb-2">Facilities</label>
        <div className="flex gap-2 flex-wrap">
          {allFacilities.map((f) => (
            <button
              key={f}
              onClick={() => handleFacilityToggle(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedFacilities.includes(f)
                  ? "bg-terracotta text-cream"
                  : "bg-sand text-dark-roast hover:bg-terracotta/20"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[11px] text-latte uppercase tracking-[1.5px] font-semibold block mb-2">Type</label>
        <div className="flex gap-2">
          {BUILDING_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => handleTypeToggle(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedType === t
                  ? "bg-terracotta text-cream"
                  : "bg-sand text-dark-roast hover:bg-terracotta/20"
              }`}
            >
              {t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create area page**

Create `src/app/[area]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getBuildingsByArea } from "@/lib/content";
import { AREAS, AreaSlug } from "@/lib/types";
import { areaMetadata } from "@/lib/seo";
import BuildingCard from "@/components/BuildingCard";
import AreaListingClient from "./AreaListingClient";

interface Props {
  params: Promise<{ area: string }>;
}

export async function generateStaticParams() {
  return [{ area: "nimman" }, { area: "old-city" }];
}

export async function generateMetadata({ params }: Props) {
  const { area } = await params;
  if (!AREAS[area as AreaSlug]) return {};
  const buildings = getBuildingsByArea(area as AreaSlug);
  return areaMetadata(area as AreaSlug, buildings.length);
}

export default async function AreaPage({ params }: Props) {
  const { area: areaSlug } = await params;
  const areaInfo = AREAS[areaSlug as AreaSlug];
  if (!areaInfo) notFound();

  const buildings = getBuildingsByArea(areaSlug as AreaSlug);
  const allFacilities = Array.from(new Set(buildings.flatMap((b) => b.facilities)));
  const minPrice = Math.min(...buildings.map((b) => b.price_range[0]));
  const maxPrice = Math.max(...buildings.map((b) => b.price_range[1]));

  return (
    <>
      <section className="pt-8 pb-6">
        <h1 className="font-serif font-bold text-[40px] text-espresso tracking-[-1.5px]">
          {areaInfo.name}
        </h1>
        <p className="text-[15px] text-latte mt-2 max-w-2xl leading-relaxed">
          {areaInfo.description}
        </p>
        <div className="flex gap-6 mt-4 text-sm text-dark-roast">
          <span><strong>{buildings.length}</strong> buildings</span>
          <span>฿{(minPrice / 1000).toFixed(0)}k – ฿{(maxPrice / 1000).toFixed(0)}k/mo</span>
        </div>
      </section>

      <AreaListingClient buildings={buildings} allFacilities={allFacilities} />
    </>
  );
}
```

- [ ] **Step 3: Create AreaListingClient**

Create `src/app/[area]/AreaListingClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Building } from "@/lib/types";
import BuildingCard from "@/components/BuildingCard";
import FilterBar from "@/components/FilterBar";

interface Props {
  buildings: Building[];
  allFacilities: string[];
}

export default function AreaListingClient({ buildings, allFacilities }: Props) {
  const [filtered, setFiltered] = useState(buildings);

  const handleFilter = (filters: { maxPrice: number; facilities: string[]; type: string | null }) => {
    let result = buildings;

    result = result.filter((b) => b.price_range[0] <= filters.maxPrice);

    if (filters.facilities.length > 0) {
      result = result.filter((b) =>
        filters.facilities.every((f) => b.facilities.includes(f))
      );
    }

    if (filters.type) {
      result = result.filter((b) => b.type === filters.type);
    }

    setFiltered(result);
  };

  return (
    <>
      <FilterBar onFilter={handleFilter} allFacilities={allFacilities} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((b) => (
          <BuildingCard key={b.slug} building={b} />
        ))}
        {filtered.length === 0 && (
          <p className="text-latte text-sm col-span-2 text-center py-12">
            No buildings match your filters. Try adjusting.
          </p>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/components/FilterBar.tsx src/app/\\[area\\]/page.tsx src/app/\\[area\\]/AreaListingClient.tsx
git commit -m "feat: area listing page with client-side filter bar"
```

---

### Task 11: Home Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create home page**

Replace `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { getAllBuildings, getAllGuides } from "@/lib/content";
import { AREAS } from "@/lib/types";
import { websiteJsonLd } from "@/lib/seo";
import BuildingCard from "@/components/BuildingCard";
import GuideCard from "@/components/GuideCard";

export default function Home() {
  const buildings = getAllBuildings();
  const guides = getAllGuides();
  const recentBuildings = [...buildings]
    .sort((a, b) => new Date(b.last_verified).getTime() - new Date(a.last_verified).getTime())
    .slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />

      {/* Hero */}
      <section className="pt-16 pb-12 text-center">
        <h1 className="font-serif font-bold text-[52px] text-espresso tracking-[-2px] leading-[1.1]">
          cnx cribs
        </h1>
        <p className="text-xl text-latte mt-3">long-term rentals, sorted</p>
        <p className="text-sm text-dark-roast mt-2">built by an expat, for expats</p>
      </section>

      {/* Area Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {Object.values(AREAS).map((area) => {
          const areaBuildings = buildings.filter((b) => b.area === area.slug);
          const minPrice = areaBuildings.length > 0 ? Math.min(...areaBuildings.map((b) => b.price_range[0])) : 0;
          const maxPrice = areaBuildings.length > 0 ? Math.max(...areaBuildings.map((b) => b.price_range[1])) : 0;

          return (
            <Link
              key={area.slug}
              href={`/${area.slug}`}
              className="block bg-milk rounded-[14px] border border-sand p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <h2 className="font-serif font-bold text-[28px] text-espresso tracking-tight">
                {area.name}
              </h2>
              <p className="text-sm text-latte mt-2 leading-relaxed">{area.description}</p>
              <div className="mt-4 flex gap-4 text-sm text-dark-roast">
                <span><strong>{areaBuildings.length}</strong> buildings</span>
                {areaBuildings.length > 0 && (
                  <span>from ฿{(minPrice / 1000).toFixed(0)}k/mo</span>
                )}
              </div>
              <div className="mt-4 text-terracotta font-semibold text-sm">
                Explore {area.name} →
              </div>
            </Link>
          );
        })}
      </section>

      {/* Recently Verified */}
      {recentBuildings.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif font-bold text-[28px] text-espresso tracking-tight mb-6">
            Recently Verified
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentBuildings.map((b) => (
              <BuildingCard key={b.slug} building={b} />
            ))}
          </div>
        </section>
      )}

      {/* Guide Teaser */}
      {guides.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif font-bold text-[28px] text-espresso tracking-tight mb-2">
            Beyond Rentals
          </h2>
          <p className="text-sm text-latte mb-6">The expat&apos;s guide to living in Chiang Mai</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((g) => (
              <GuideCard key={g.category} guide={g} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/app/page.tsx
git commit -m "feat: home page with hero, area cards, recent listings, guide teaser"
```

---

### Task 12: Playbook, Guide, and About Pages

**Files:**
- Create: `src/app/playbook/page.tsx`
- Create: `src/app/guide/page.tsx`
- Create: `src/app/guide/[category]/page.tsx`
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Create playbook page**

Create `src/app/playbook/page.tsx`:

```tsx
import { getPlaybookContent } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Rent in Chiang Mai — Expat Guide | CNX Cribs",
  description: "Everything you need to know about renting long-term in Chiang Mai. Unit selection, pricing, negotiation, red flags, and move-in checklist.",
};

export default function PlaybookPage() {
  const { content } = getPlaybookContent();

  const sections = content.split(/^## /m).filter(Boolean);

  return (
    <>
      <section className="pt-8 pb-6">
        <h1 className="font-serif font-bold text-[40px] text-espresso tracking-[-1.5px]">
          The Rental Playbook
        </h1>
        <p className="text-[15px] text-latte mt-2 max-w-2xl leading-relaxed">
          Everything you need to know about renting long-term in Chiang Mai. Tested on the ground by expats who&apos;ve been through it.
        </p>
      </section>

      <article className="max-w-3xl space-y-8 pb-12">
        {sections.map((section, i) => {
          const [title, ...bodyLines] = section.split("\n");
          const body = bodyLines.join("\n").trim();
          const items = body.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
          const paragraphs = body.split("\n").filter((l) => !l.startsWith("- ") && l.trim());

          return (
            <section key={i}>
              <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight">
                {title.trim()}
              </h2>
              <div className="mt-3 text-[15px] text-dark-roast leading-relaxed">
                {items.length > 0 ? (
                  <ul className="space-y-2">
                    {items.map((item, j) => (
                      <li key={j} className="pl-4 border-l-2 border-sand">{item}</li>
                    ))}
                  </ul>
                ) : (
                  paragraphs.map((p, j) => <p key={j} className={j > 0 ? "mt-3" : ""}>{p}</p>)
                )}
              </div>
            </section>
          );
        })}
      </article>
    </>
  );
}
```

- [ ] **Step 2: Create guide hub page**

Create `src/app/guide/page.tsx`:

```tsx
import { getAllGuides } from "@/lib/content";
import GuideCard from "@/components/GuideCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expat Guide to Chiang Mai — Coffee, Co-working & More | CNX Cribs",
  description: "The expat's guide to living in Chiang Mai. Best coffee shops, massage, co-working, and more — curated by locals.",
};

export default function GuidePage() {
  const guides = getAllGuides();

  return (
    <>
      <section className="pt-8 pb-6">
        <h1 className="font-serif font-bold text-[40px] text-espresso tracking-[-1.5px]">
          The Expat&apos;s Guide to Chiang Mai
        </h1>
        <p className="text-[15px] text-latte mt-2 max-w-2xl leading-relaxed">
          Beyond rentals — the places that make Chiang Mai home.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {guides.map((g) => (
          <GuideCard key={g.category} guide={g} />
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Create guide category page**

Create `src/app/guide/[category]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getAllGuides, getGuideByCategory } from "@/lib/content";
import { guideMetadata } from "@/lib/seo";
import Image from "next/image";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((g) => ({ category: g.category }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const guide = getGuideByCategory(category);
  if (!guide) return {};
  return guideMetadata(guide);
}

export default async function GuideCategoryPage({ params }: Props) {
  const { category } = await params;
  const guide = getGuideByCategory(category);
  if (!guide) notFound();

  return (
    <>
      <section className="pt-8 pb-6">
        <div className="text-4xl mb-3">{guide.icon}</div>
        <h1 className="font-serif font-bold text-[40px] text-espresso tracking-[-1.5px]">
          {guide.name}
        </h1>
        <p className="text-[15px] text-latte mt-2 max-w-2xl leading-relaxed">
          {guide.description}
        </p>
      </section>

      <div className="space-y-4 pb-12">
        {guide.spots.map((spot) => (
          <div key={spot.slug} className="bg-milk rounded-[14px] border border-sand p-5 flex gap-5 items-start">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-sand">
              {spot.photo && (
                <Image
                  src={`/guides/${spot.photo}`}
                  alt={spot.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-espresso">{spot.name}</h3>
                <span className="bg-sand text-dark-roast px-2 py-0.5 rounded text-[10px] font-semibold">
                  {spot.area === "nimman" ? "Nimman" : "Old City"}
                </span>
              </div>
              <p className="text-sm text-latte mt-1">{spot.one_liner}</p>
              <p className="text-xs text-dark-roast mt-2">{spot.address}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Create about page**

Create `src/app/about/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CNX Cribs — Built by an Expat, for Expats",
  description: "Why CNX Cribs exists, what verified means, and how you can contribute.",
};

export default function AboutPage() {
  return (
    <article className="max-w-3xl pt-8 pb-12 space-y-8">
      <section>
        <h1 className="font-serif font-bold text-[40px] text-espresso tracking-[-1.5px]">
          About CNX Cribs
        </h1>
        <p className="text-[15px] text-latte mt-2">Built by an expat, for expats.</p>
      </section>

      <section>
        <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight">Why this exists</h2>
        <div className="mt-3 text-[15px] text-dark-roast leading-relaxed space-y-3">
          <p>
            Finding a long-term rental in Chiang Mai shouldn&apos;t mean scrolling through outdated listings
            on five different websites, none of which agree on the price. Or walking into a building
            blind because the last review was from 2019.
          </p>
          <p>
            CNX Cribs is a curated guide to monthly rentals in Chiang Mai. Every listing is
            building-level — not individual units that come and go — with real prices, honest
            expat tips, and gotchas that only someone who&apos;s been there would know.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight">What &ldquo;verified&rdquo; means</h2>
        <div className="mt-3 text-[15px] text-dark-roast leading-relaxed space-y-3">
          <p>
            A verified listing means someone physically visited the building, confirmed rates
            with management, and took photos. The &ldquo;last verified&rdquo; date tells you
            exactly when that happened.
          </p>
          <p>
            Unverified listings are based on online research — useful as a starting point, but
            take them with a grain of salt until someone confirms on the ground.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight">Contribute</h2>
        <div className="mt-3 text-[15px] text-dark-roast leading-relaxed space-y-3">
          <p>
            Know a building we&apos;re missing? Found a rate that&apos;s changed? Spotted a gotcha
            we should warn people about?
          </p>
          <p>
            Drop us a line at{" "}
            <a href="mailto:hello@cnxcribs.com" className="text-terracotta font-semibold hover:underline">
              hello@cnxcribs.com
            </a>
            . Every contribution makes this guide better for the next person landing in Chiang Mai.
          </p>
        </div>
      </section>
    </article>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/app/playbook/ src/app/guide/ src/app/about/
git commit -m "feat: playbook, guide hub, guide category, and about pages"
```

---

### Task 13: Sitemap, Robots, and Final SEO

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create dynamic sitemap**

Create `src/app/sitemap.ts`:

```typescript
import { MetadataRoute } from "next";
import { getAllBuildings, getAllGuides } from "@/lib/content";

const BASE_URL = "https://cnxcribs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const buildings = getAllBuildings();
  const guides = getAllGuides();

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/nimman`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/old-city`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/playbook`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/guide`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const buildingPages = buildings.map((b) => ({
    url: `${BASE_URL}/${b.area}/${b.slug}`,
    lastModified: new Date(b.last_verified),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guidePages = guides.map((g) => ({
    url: `${BASE_URL}/guide/${g.category}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...buildingPages, ...guidePages];
}
```

- [ ] **Step 2: Create robots.txt**

Create `src/app/robots.ts`:

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://cnxcribs.com/sitemap.xml",
  };
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: dynamic sitemap and robots.txt for SEO"
```

---

### Task 14: Build Verification & Cleanup

- [ ] **Step 1: Run production build**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
npm run build
```

Expected: Build succeeds with static HTML pages generated for all routes. Fix any TypeScript or build errors.

- [ ] **Step 2: Verify all routes render**

Start the production server and check each route:

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
npx serve out
```

Check:
- `/` — home page with hero, area cards, recent buildings, guide teaser
- `/nimman` — area page with filter bar and building cards
- `/nimman/punna-nimman` — building page with full layout
- `/playbook` — rental guide
- `/guide` — guide hub
- `/guide/coffee` — guide category
- `/about` — about page

- [ ] **Step 3: Fix any issues found during verification**

Address build errors, missing images (use placeholder divs where photos don't exist yet), broken links.

- [ ] **Step 4: Final commit**

```bash
cd /Users/shashankjha/Sites/theshajha/cnx
git add -A
git commit -m "fix: build verification and cleanup"
```
