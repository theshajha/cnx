"use client";

import { useState } from "react";
import Link from "next/link";
import { AreaInfo } from "@/lib/types";

interface FilterState {
  maxPrice: number | null;
  type: string | null;
}

interface FilterBarProps {
  areas: AreaInfo[];
  activeArea?: string;
  viewMode: "cards" | "list";
  onViewModeChange: (mode: "cards" | "list") => void;
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

export default function FilterBar({
  areas,
  activeArea,
  viewMode,
  onViewModeChange,
  onFilter,
}: FilterBarProps) {
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
    <div className="flex flex-wrap items-center gap-3 md:gap-4">
      {/* Area Pills */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/cribs"
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
            !activeArea
              ? "bg-espresso text-cream"
              : "bg-sand text-dark-roast hover:bg-espresso/10"
          }`}
        >
          All Areas
        </Link>
        {areas.map((area) => (
          <Link
            key={area.slug}
            href={`/cribs/${area.slug}`}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeArea === area.slug
                ? "bg-espresso text-cream"
                : "bg-sand text-dark-roast hover:bg-espresso/10"
            }`}
          >
            {area.icon} {area.name}
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-sand" />

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

      {/* Spacer */}
      <div className="ml-auto" />

      {/* View Toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => onViewModeChange("cards")}
          className={`px-3 py-2 rounded-l-lg text-sm font-bold transition-colors ${
            viewMode === "cards"
              ? "bg-espresso text-cream"
              : "bg-sand text-dark-roast"
          }`}
          aria-label="Card view"
        >
          ▦
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-2 rounded-r-lg text-sm font-bold transition-colors ${
            viewMode === "list"
              ? "bg-espresso text-cream"
              : "bg-sand text-dark-roast"
          }`}
          aria-label="List view"
        >
          ☰
        </button>
      </div>
    </div>
  );
}
