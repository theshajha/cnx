"use client";

import { useState } from "react";

interface FilterState {
  maxPrice: number | null;
  type: string | null;
}

interface FilterBarProps {
  onFilter: (state: FilterState) => void;
}

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: null },
  { label: "Under \u0E3F10k", value: 10000 },
  { label: "Under \u0E3F15k", value: 15000 },
  { label: "Under \u0E3F20k", value: 20000 },
  { label: "Under \u0E3F30k", value: 30000 },
] as const;

const TYPE_OPTIONS = [
  { label: "All", value: null },
  { label: "Condo", value: "condo" },
  { label: "Serviced Apartment", value: "serviced-apartment" },
] as const;

export default function FilterBar({ onFilter }: FilterBarProps) {
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  function handleBudget(value: number | null) {
    setMaxPrice(value);
    onFilter({ maxPrice: value, type: selectedType });
  }

  function handleType(value: string | null) {
    setSelectedType(value);
    onFilter({ maxPrice, type: value });
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
      {/* Budget Dropdown */}
      <select
        value={maxPrice ?? ""}
        onChange={(e) =>
          handleBudget(e.target.value === "" ? null : Number(e.target.value))
        }
        className="bg-milk border border-sand rounded-[10px] px-4 py-2.5 text-sm font-medium text-espresso appearance-none cursor-pointer hover:border-latte transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta/30"
      >
        {BUDGET_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value ?? ""}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Type Pills */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t.label}
            onClick={() => handleType(t.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              selectedType === t.value
                ? "bg-espresso text-cream"
                : "bg-sand text-dark-roast hover:bg-espresso/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
