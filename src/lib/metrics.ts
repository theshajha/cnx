/**
 * Derived numbers that turn a listing wall into a decision tool.
 *
 * Everything here is computed from data already in the content files — no new
 * research needed. Two of these (฿/sqm and the all-in monthly estimate) are the
 * things a friend who lives here would actually tell you and that no listing
 * portal shows, so they carry the "field guide" positioning.
 *
 * Every function returns null rather than guessing when inputs are missing.
 */

import type { Building } from "./types";

/**
 * Electricity assumption for the all-in estimate. A Chiang Mai one-bed running
 * AC nightly lands near this; it is stated in the UI so nobody mistakes it for a
 * measurement. Sourced from the cost-of-living guide's own working.
 */
export const ASSUMED_KWH_PER_MONTH = 300;
/** Municipal water is metered but small; most buildings bill a flat-ish figure. */
export const ASSUMED_WATER_UNITS_PER_MONTH = 12;

/** Lowest advertised rent — what the building actually starts at. */
export function entryPrice(b: Building): number {
  return b.price_range[0];
}

/**
 * ฿ per square metre at the entry price, using the smallest unit that price
 * plausibly belongs to. The single most comparable number across buildings.
 */
export function pricePerSqm(b: Building): number | null {
  const withSize = b.units.filter((u) => u.sqm > 0 && u.price_range?.[0] > 0);
  if (withSize.length === 0) return null;
  const cheapest = withSize.reduce((a, u) => (u.price_range[0] < a.price_range[0] ? u : a));
  return Math.round(cheapest.price_range[0] / cheapest.sqm);
}

/** Smallest and largest unit sizes on offer. */
export function sqmRange(b: Building): [number, number] | null {
  const sizes = b.units.map((u) => u.sqm).filter((s) => s > 0);
  if (sizes.length === 0) return null;
  return [Math.min(...sizes), Math.max(...sizes)];
}

export type ValueTier = "great" | "fair" | "premium";

/**
 * Positions a building's ฿/sqm against the median for its own area, so a Nimman
 * condo is judged against Nimman rather than against the Old City.
 */
export function valueVsArea(
  b: Building,
  areaPeers: Building[]
): { ppsm: number; median: number; ratio: number; tier: ValueTier } | null {
  const ppsm = pricePerSqm(b);
  if (ppsm === null) return null;

  const peers = areaPeers.map(pricePerSqm).filter((n): n is number => n !== null);
  if (peers.length < 3) return null;

  const sorted = [...peers].sort((a, c) => a - c);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
  if (median === 0) return null;

  const ratio = ppsm / median;
  const tier: ValueTier = ratio <= 0.85 ? "great" : ratio >= 1.15 ? "premium" : "fair";
  return { ppsm, median, ratio, tier };
}

/**
 * Rent plus the bills that catch people out. Deposit is excluded — it's upfront,
 * not monthly — but surfaced separately because two months' deposit on top of
 * first month is the real move-in number.
 */
export function estimatedMonthly(b: Building): {
  rent: number;
  electric: number;
  water: number;
  wifi: number;
  total: number;
} {
  const rent = entryPrice(b);
  const electric = Math.round(b.electric_rate * ASSUMED_KWH_PER_MONTH);
  const water = Math.round(b.water_rate * ASSUMED_WATER_UNITS_PER_MONTH);
  const wifi = b.wifi === "included" ? 0 : Number(b.wifi) || 0;
  return { rent, electric, water, wifi, total: rent + electric + water + wifi };
}

/** Cash needed on day one: first month plus deposit. */
export function moveInCost(b: Building): number {
  return entryPrice(b) * (1 + (b.deposit || 0));
}

export type Layout = "studio" | "1br" | "2br" | "3br+";

export const LAYOUT_LABELS: Record<Layout, string> = {
  studio: "Studio",
  "1br": "1 bed",
  "2br": "2 bed",
  "3br+": "3+ bed",
};

/**
 * Unit `type` is free text across 37 distinct values ("Superior", "Loft
 * Apartment", "Type C 1 Bedroom"…) and `beds` is 1 for studios as well as
 * one-beds, so neither field alone can answer "does this have a studio?".
 * Parse the label first, fall back to the bed count.
 */
export function layoutOf(unitType: string, beds: number): Layout {
  const t = unitType.toLowerCase();
  if (t.includes("studio")) return "studio";
  const named = t.match(/(\d)\s*bed/);
  if (named) {
    const n = Number(named[1]);
    return n >= 3 ? "3br+" : n === 2 ? "2br" : "1br";
  }
  if (beds >= 3) return "3br+";
  if (beds === 2) return "2br";
  return "1br";
}

export function layoutsOf(b: Building): Layout[] {
  const order: Layout[] = ["studio", "1br", "2br", "3br+"];
  const found = new Set(b.units.map((u) => layoutOf(u.type, u.beds)));
  return order.filter((l) => found.has(l));
}

/**
 * `wifi: 0` appears on 7 buildings and does not mean "free" — it means the
 * building provides none and you arrange your own line. Rendering it as
 * "0 ฿ per month" read as included, which is the opposite of the truth.
 */
export function wifiLabel(wifi: Building["wifi"]): { value: string; note: string } {
  if (wifi === "included") return { value: "Included", note: "in the rent" };
  const n = Number(wifi);
  if (!n) return { value: "None", note: "arrange your own" };
  return { value: `฿${n.toLocaleString()}`, note: "per month" };
}

/** Facilities that actually change a long-stay decision, in priority order. */
export const KEY_FACILITIES = ["pool", "gym", "washer", "parking", "sauna", "garden"] as const;

export function hasFacility(b: Building, facility: string): boolean {
  if (b.facilities.includes(facility)) return true;
  // `washer` lives on units, not the building.
  if (facility === "washer") return b.units.some((u) => u.features?.includes("washer"));
  return false;
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? Math.round((s[mid - 1] + s[mid]) / 2) : s[mid];
}

/** Headline numbers for an area, all derived — nothing here needs maintaining by hand. */
export function areaStats(buildings: Building[]) {
  const prices = buildings.map(entryPrice);
  const ppsms = buildings.map(pricePerSqm).filter((n): n is number => n !== null);
  return {
    count: buildings.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...buildings.map((b) => b.price_range[1])),
    medianPpsm: median(ppsms),
    withPool: buildings.filter((b) => hasFacility(b, "pool")).length,
    withGym: buildings.filter((b) => hasFacility(b, "gym")).length,
  };
}

/**
 * Typical all-in monthly cost by layout, computed across the whole dataset.
 * "What does it actually cost to live here" is the question everyone arrives
 * with, and this answers it from our own listings rather than from a blog post.
 */
export interface CostBand {
  layout: Layout;
  label: string;
  /** Cheapest advertised rent for this layout anywhere in the set. */
  low: number;
  /** Median rent alone. */
  rent: number;
  /** Electricity + water + internet. Near-constant across layouts. */
  utilities: number;
  /** rent + utilities. */
  typical: number;
  /** Utilities as a share of the total — the point of the whole section. */
  utilityShare: number;
  sqm: number | null;
  sampleSize: number;
}

/**
 * Typical monthly cost by layout, split into rent and the bills that get left
 * out of a listing price. Utilities land near-constant regardless of size, so
 * they eat a much larger share of a studio's total than a two-bed's — that
 * asymmetry is the reason this section exists, and it only shows if the two
 * parts are rendered separately.
 */
export function costBands(buildings: Building[]): CostBand[] {
  const utilities = median(
    buildings.map((b) => {
      const e = estimatedMonthly(b);
      return e.electric + e.water + e.wifi;
    })
  )!;

  const bands: CostBand[] = [];
  for (const layout of ["studio", "1br", "2br"] as Layout[]) {
    const rows: { price: number; sqm: number }[] = [];
    for (const b of buildings) {
      for (const u of b.units) {
        if (layoutOf(u.type, u.beds) !== layout) continue;
        if (!(u.price_range?.[0] > 0)) continue;
        rows.push({ price: u.price_range[0], sqm: u.sqm });
      }
    }
    if (rows.length === 0) continue;
    const rent = median(rows.map((r) => r.price))!;
    const typical = rent + utilities;
    bands.push({
      layout,
      label: LAYOUT_LABELS[layout],
      low: Math.min(...rows.map((r) => r.price)),
      rent,
      utilities,
      typical,
      utilityShare: utilities / typical,
      sqm: median(rows.map((r) => r.sqm).filter((n) => n > 0)),
      sampleSize: rows.length,
    });
  }
  return bands;
}

export type SortKey = "recommended" | "price-asc" | "price-desc" | "value" | "size";

export const SORT_LABELS: Record<SortKey, string> = {
  recommended: "Our pick order",
  "price-asc": "Cheapest first",
  "price-desc": "Priciest first",
  value: "Best ฿/sqm",
  size: "Biggest units",
};

/**
 * Ranked buildings. `recommendation_score` only exists on 10 of 43 records, so
 * anything unscored falls back to value-for-money rather than sinking to the
 * bottom of the list in file order.
 */
export function sortBuildings(list: Building[], key: SortKey, areaPeers: Building[]): Building[] {
  const out = [...list];
  switch (key) {
    case "price-asc":
      return out.sort((a, b) => entryPrice(a) - entryPrice(b));
    case "price-desc":
      return out.sort((a, b) => entryPrice(b) - entryPrice(a));
    case "value":
      return out.sort((a, b) => (pricePerSqm(a) ?? 1e9) - (pricePerSqm(b) ?? 1e9));
    case "size": {
      const big = (x: Building) => sqmRange(x)?.[1] ?? 0;
      return out.sort((a, b) => big(b) - big(a));
    }
    case "recommended":
    default:
      return out.sort((a, b) => {
        const sa = a.recommendation_score ?? 0;
        const sb = b.recommendation_score ?? 0;
        if (sa !== sb) return sb - sa;
        const va = valueVsArea(a, areaPeers)?.ratio ?? 99;
        const vb = valueVsArea(b, areaPeers)?.ratio ?? 99;
        return va - vb;
      });
  }
}
