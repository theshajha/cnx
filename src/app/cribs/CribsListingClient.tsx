"use client";

import { useState, useEffect, useMemo } from "react";
import type { Building, AreaInfo } from "@/lib/types";
import FilterBar, { type FilterState } from "@/components/FilterBar";
import BuildingCard from "@/components/BuildingCard";
import BuildingRow from "@/components/BuildingRow";
import {
  entryPrice,
  hasFacility,
  layoutsOf,
  sortBuildings,
  ASSUMED_KWH_PER_MONTH,
} from "@/lib/metrics";

interface Props {
  buildings: Building[];
  areas: AreaInfo[];
  activeArea?: string;
}

const VIEW_MODE_KEY = "cnx-view-mode";

export default function CribsListingClient({ buildings, areas, activeArea }: Props) {
  // Compact rows are the default on desktop: this is a reference you scan, not a
  // gallery you browse. Cards stay available and are forced on small screens.
  const [viewMode, setViewMode] = useState<"rows" | "cards">("rows");
  const [filters, setFilters] = useState<FilterState>({
    maxPrice: null,
    layouts: [],
    facilities: [],
    sort: "recommended",
  });

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    if (stored === "rows" || stored === "cards") setViewMode(stored);
  }, []);

  function handleViewModeChange(mode: "rows" | "cards") {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }

  const areaNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of areas) map[a.slug] = a.name;
    return map;
  }, [areas]);

  const filtered = useMemo(() => {
    const matches = buildings.filter((b) => {
      if (filters.maxPrice !== null && entryPrice(b) > filters.maxPrice) return false;
      if (filters.layouts.length > 0) {
        const has = layoutsOf(b);
        if (!filters.layouts.some((l) => has.includes(l))) return false;
      }
      if (filters.facilities.length > 0) {
        if (!filters.facilities.every((f) => hasFacility(b, f))) return false;
      }
      return true;
    });
    // Value tiers are relative to the full area cohort, not the filtered subset,
    // so "good value" doesn't change meaning as you narrow the list.
    return sortBuildings(matches, filters.sort, buildings);
  }, [buildings, filters]);

  return (
    <div>
      <FilterBar
        areas={areas}
        activeArea={activeArea}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={buildings.length}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 mt-8 border border-dashed border-sand rounded-2xl bg-milk">
          <p className="text-lg font-display font-bold text-espresso">Nothing matches all of that</p>
          <p className="text-sm text-latte mt-2 max-w-sm mx-auto leading-relaxed">
            {filters.facilities.length > 1
              ? "Requiring several facilities at once narrows things fast — try dropping one."
              : "Try raising the budget ceiling or widening the layout."}
          </p>
          <button
            onClick={() => setFilters({ ...filters, maxPrice: null, layouts: [], facilities: [] })}
            className="mt-5 bg-espresso text-cream px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-dark-roast transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Rows at every width. 43 cards on a phone is a 30,000px scroll; the row
              layout collapses to thumb + name + price and cuts that by roughly 4×. */}
          {viewMode === "rows" ? (
            <>
              <div className="mt-6 bg-milk border border-sand rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
                <div className="hidden md:grid grid-cols-[92px_minmax(0,2.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-5 px-4 py-2.5 bg-parchment border-b border-sand text-[10px] font-bold uppercase tracking-[0.08em] text-latte">
                  <span />
                  <span>Building</span>
                  <span>Size · ฿/sqm</span>
                  <span>Est. all-in</span>
                  <span className="text-right">Rent from</span>
                </div>
                {filtered.map((b, i) => (
                  <BuildingRow
                    key={b.slug}
                    building={b}
                    areaLabel={areaNames[b.area] ?? b.area}
                    areaPeers={buildings.filter((p) => p.area === b.area)}
                    rank={filters.sort === "recommended" ? i : undefined}
                  />
                ))}
              </div>
              <p className="text-[11px] text-latte mt-3 leading-relaxed max-w-2xl">
                ฿/sqm is calculated from the smallest unit&rsquo;s entry price. &ldquo;Est.
                all-in&rdquo; adds electricity at {ASSUMED_KWH_PER_MONTH} kWh/month, water and
                internet to the rent &mdash; an estimate for comparison, not a quote.
              </p>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {filtered.map((b) => (
                <BuildingCard
                  key={b.slug}
                  building={b}
                  areaLabel={areaNames[b.area] ?? b.area}
                  areaPeers={buildings.filter((p) => p.area === b.area)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
