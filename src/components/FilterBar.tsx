"use client";

import { useState } from "react";

interface FilterState {
  minPrice: number;
  maxPrice: number;
  facilities: string[];
  types: string[];
}

interface FilterBarProps {
  allFacilities: string[];
  onFilter: (state: FilterState) => void;
}

const BUILDING_TYPES = [
  { value: "condo", label: "Condo" },
  { value: "serviced-condo", label: "Serviced Condo" },
  { value: "serviced-apartment", label: "Serviced Apartment" },
  { value: "apartment", label: "Apartment" },
];

export default function FilterBar({ allFacilities, onFilter }: FilterBarProps) {
  const [minPrice, setMinPrice] = useState(5000);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  function emit(
    min: number,
    max: number,
    facs: string[],
    types: string[],
  ) {
    onFilter({ minPrice: min, maxPrice: max, facilities: facs, types });
  }

  function toggleFacility(f: string) {
    const next = selectedFacilities.includes(f)
      ? selectedFacilities.filter((x) => x !== f)
      : [...selectedFacilities, f];
    setSelectedFacilities(next);
    emit(minPrice, maxPrice, next, selectedTypes);
  }

  function toggleType(t: string) {
    const next = selectedTypes.includes(t)
      ? selectedTypes.filter((x) => x !== t)
      : [...selectedTypes, t];
    setSelectedTypes(next);
    emit(minPrice, maxPrice, selectedFacilities, next);
  }

  function handleMinChange(val: number) {
    const clamped = Math.min(val, maxPrice);
    setMinPrice(clamped);
    emit(clamped, maxPrice, selectedFacilities, selectedTypes);
  }

  function handleMaxChange(val: number) {
    const clamped = Math.max(val, minPrice);
    setMaxPrice(clamped);
    emit(minPrice, clamped, selectedFacilities, selectedTypes);
  }

  return (
    <div className="bg-milk rounded-[14px] border border-sand p-6 space-y-5">
      {/* Price Range */}
      <div>
        <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold mb-3">
          Price Range (฿/month)
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-latte mb-1 block">Min</label>
            <input
              type="range"
              min={5000}
              max={50000}
              step={1000}
              value={minPrice}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              className="w-full accent-terracotta"
            />
            <div className="text-sm font-semibold text-espresso">฿{minPrice.toLocaleString()}</div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-latte mb-1 block">Max</label>
            <input
              type="range"
              min={5000}
              max={50000}
              step={1000}
              value={maxPrice}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              className="w-full accent-terracotta"
            />
            <div className="text-sm font-semibold text-espresso">฿{maxPrice.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Facility Toggles */}
      <div>
        <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold mb-3">
          Facilities
        </div>
        <div className="flex gap-2 flex-wrap">
          {allFacilities.map((f) => (
            <button
              key={f}
              onClick={() => toggleFacility(f)}
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

      {/* Building Type Pills */}
      <div>
        <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold mb-3">
          Type
        </div>
        <div className="flex gap-2 flex-wrap">
          {BUILDING_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleType(t.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                selectedTypes.includes(t.value)
                  ? "bg-espresso text-cream"
                  : "bg-sand text-dark-roast hover:bg-espresso/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
