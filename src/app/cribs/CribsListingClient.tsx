"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Building, AreaInfo } from "@/lib/types";
import FilterBar from "@/components/FilterBar";
import BuildingCard from "@/components/BuildingCard";
import BuildingTable from "@/components/BuildingTable";

interface FilterState {
  maxPrice: number | null;
  type: string | null;
}

interface CribsListingClientProps {
  buildings: Building[];
  areas: AreaInfo[];
  activeArea?: string;
}

const VIEW_MODE_KEY = "cnx-view-mode";

export default function CribsListingClient({
  buildings,
  areas,
  activeArea,
}: CribsListingClientProps) {
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [filters, setFilters] = useState<FilterState>({
    maxPrice: null,
    type: null,
  });

  // Restore view mode from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    if (stored === "cards" || stored === "list") {
      setViewMode(stored);
    }
  }, []);

  function handleViewModeChange(mode: "cards" | "list") {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }

  const handleFilter = useCallback((state: FilterState) => {
    setFilters(state);
  }, []);

  const filtered = useMemo(() => {
    return buildings.filter((b) => {
      if (filters.maxPrice !== null && b.price_range[0] > filters.maxPrice) {
        return false;
      }
      if (filters.type !== null && b.type !== filters.type) {
        return false;
      }
      return true;
    });
  }, [buildings, filters]);

  // Build area slug -> name map for table view
  const areaNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of areas) {
      map[a.slug] = a.name;
    }
    return map;
  }, [areas]);

  return (
    <div>
      <FilterBar
        areas={areas}
        activeArea={activeArea}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onFilter={handleFilter}
      />

      <p className="text-sm text-latte mt-6 mb-4">
        Showing {filtered.length} of {buildings.length} buildings
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-sand rounded-2xl bg-milk">
          <p className="text-lg font-serif text-dark-roast">
            No buildings match your filters
          </p>
          <p className="text-sm text-latte mt-2">
            Try widening your budget or changing the property type.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((b) => (
            <BuildingCard key={b.slug} building={b} />
          ))}
        </div>
      ) : (
        <BuildingTable buildings={filtered} areaNames={areaNames} />
      )}
    </div>
  );
}
