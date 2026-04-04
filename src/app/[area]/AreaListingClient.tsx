"use client";

import { useState } from "react";
import { Building } from "@/lib/types";
import FilterBar from "@/components/FilterBar";
import BuildingCard from "@/components/BuildingCard";

interface AreaListingClientProps {
  buildings: Building[];
}

export default function AreaListingClient({ buildings }: AreaListingClientProps) {
  const [filtered, setFiltered] = useState(buildings);

  function handleFilter(state: {
    maxPrice: number | null;
    type: string | null;
  }) {
    let result = buildings;

    // Budget filter: building's min price must be under the selected max
    if (state.maxPrice !== null) {
      result = result.filter((b) => b.price_range[0] <= state.maxPrice!);
    }

    // Type filter: building must match selected type
    if (state.type !== null) {
      result = result.filter((b) => b.type === state.type);
    }

    setFiltered(result);
  }

  return (
    <div className="space-y-8">
      <FilterBar onFilter={handleFilter} />
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
