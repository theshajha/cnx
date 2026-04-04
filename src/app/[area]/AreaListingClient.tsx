"use client";

import { useState } from "react";
import { Building } from "@/lib/types";
import FilterBar from "@/components/FilterBar";
import BuildingCard from "@/components/BuildingCard";

interface AreaListingClientProps {
  buildings: Building[];
  allFacilities: string[];
}

export default function AreaListingClient({ buildings, allFacilities }: AreaListingClientProps) {
  const [filtered, setFiltered] = useState(buildings);

  function handleFilter(state: {
    minPrice: number;
    maxPrice: number;
    facilities: string[];
    types: string[];
  }) {
    let result = buildings;

    // Price filter: building's range must overlap with filter range
    result = result.filter(
      (b) => b.price_range[1] >= state.minPrice && b.price_range[0] <= state.maxPrice,
    );

    // Facility filter: building must have all selected facilities
    if (state.facilities.length > 0) {
      result = result.filter((b) =>
        state.facilities.every((f) => b.facilities.includes(f)),
      );
    }

    // Type filter: building must match one of selected types
    if (state.types.length > 0) {
      result = result.filter((b) => state.types.includes(b.type));
    }

    setFiltered(result);
  }

  return (
    <div className="space-y-8">
      <FilterBar allFacilities={allFacilities} onFilter={handleFilter} />
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🏠</div>
          <p className="text-latte text-sm">No buildings match your filters. Try adjusting your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((b) => (
            <BuildingCard key={b.slug} building={b} />
          ))}
        </div>
      )}
      <div className="text-center text-xs text-latte">
        Showing {filtered.length} of {buildings.length} building{buildings.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
