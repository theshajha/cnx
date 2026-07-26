"use client";

import Link from "next/link";
import type { AreaInfo } from "@/lib/types";
import { LAYOUT_LABELS, SORT_LABELS, type Layout, type SortKey } from "@/lib/metrics";

export interface FilterState {
  maxPrice: number | null;
  layouts: Layout[];
  facilities: string[];
  sort: SortKey;
}

interface Props {
  areas: AreaInfo[];
  activeArea?: string;
  viewMode: "rows" | "cards";
  onViewModeChange: (m: "rows" | "cards") => void;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  resultCount: number;
  totalCount: number;
}

const BUDGETS = [
  { label: "฿10k", value: 10000 },
  { label: "฿15k", value: 15000 },
  { label: "฿20k", value: 20000 },
  { label: "฿30k", value: 30000 },
] as const;

const LAYOUTS: Layout[] = ["studio", "1br", "2br", "3br+"];

const FACILITIES = [
  { key: "pool", label: "Pool" },
  { key: "gym", label: "Gym" },
  { key: "washer", label: "Washer" },
  { key: "parking", label: "Parking" },
] as const;

const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors border ${
    active
      ? "bg-espresso text-cream border-espresso"
      : "bg-milk text-dark-roast border-sand hover:border-latte"
  }`;

/**
 * Filters that answer the questions a long-stay renter actually has — what fits
 * my budget, how many rooms, does it have the two or three things I won't live
 * without — plus a sort, which the old bar had no concept of.
 */
export default function FilterBar({
  areas,
  activeArea,
  viewMode,
  onViewModeChange,
  filters,
  onChange,
  resultCount,
  totalCount,
}: Props) {
  const toggle = <T,>(list: T[], v: T): T[] =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const isFiltered =
    filters.maxPrice !== null || filters.layouts.length > 0 || filters.facilities.length > 0;

  return (
    <div className="sticky top-14 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-cream/92 backdrop-blur-md border-b border-sand">
      {/* Areas */}
      <div className="flex gap-2 flex-wrap items-center">
        <Link href="/cribs" className={chip(!activeArea)}>
          All areas
        </Link>
        {areas.map((a) => (
          <Link key={a.slug} href={`/cribs/${a.slug}`} className={chip(activeArea === a.slug)}>
            {a.name}
          </Link>
        ))}

        <div className="hidden md:block w-px h-5 bg-sand mx-1" />

        {/* Budget — single-select ceiling */}
        <div className="flex gap-1.5 items-center">
          <span className="text-[11px] text-latte font-semibold uppercase tracking-wide mr-0.5">
            Under
          </span>
          {BUDGETS.map((b) => (
            <button
              key={b.value}
              onClick={() =>
                onChange({ ...filters, maxPrice: filters.maxPrice === b.value ? null : b.value })
              }
              className={chip(filters.maxPrice === b.value)}
            >
              <span className="tnum">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center mt-2.5">
        {LAYOUTS.map((l) => (
          <button
            key={l}
            onClick={() => onChange({ ...filters, layouts: toggle(filters.layouts, l) })}
            className={chip(filters.layouts.includes(l))}
          >
            {LAYOUT_LABELS[l]}
          </button>
        ))}

        <div className="hidden md:block w-px h-5 bg-sand mx-1" />

        {FACILITIES.map((f) => (
          <button
            key={f.key}
            onClick={() => onChange({ ...filters, facilities: toggle(filters.facilities, f.key) })}
            className={chip(filters.facilities.includes(f.key))}
          >
            {f.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-[12px] text-latte hidden sm:inline">
            <span className="tnum font-semibold text-espresso">{resultCount}</span>
            <span className="text-latte"> of {totalCount}</span>
          </span>

          {isFiltered && (
            <button
              onClick={() =>
                onChange({ maxPrice: null, layouts: [], facilities: [], sort: filters.sort })
              }
              className="text-[12px] text-terracotta font-semibold hover:underline"
            >
              Clear
            </button>
          )}

          <label className="sr-only" htmlFor="sort">
            Sort listings
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
            className="bg-milk border border-sand rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-espresso cursor-pointer hover:border-latte focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>

          <div className="flex border border-sand rounded-lg overflow-hidden">
            {(["rows", "cards"] as const).map((m) => (
              <button
                key={m}
                onClick={() => onViewModeChange(m)}
                aria-label={m === "rows" ? "Compact list" : "Photo cards"}
                aria-pressed={viewMode === m}
                className={`px-2.5 py-1.5 text-[13px] transition-colors ${
                  viewMode === m ? "bg-espresso text-cream" : "bg-milk text-latte hover:text-espresso"
                }`}
              >
                {m === "rows" ? "☰" : "▦"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
