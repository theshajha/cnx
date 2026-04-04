"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Building } from "@/lib/types";

interface BuildingTableProps {
  buildings: Building[];
  areaNames: Record<string, string>;
}

type SortKey = "name" | "area" | "price" | "type" | "electric";
type SortDir = "asc" | "desc";

const TYPE_LABELS: Record<string, string> = {
  condo: "Condo",
  "serviced-condo": "Serviced Condo",
  "serviced-apartment": "Serviced Apt",
  apartment: "Apartment",
};

export default function BuildingTable({ buildings, areaNames }: BuildingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    const copy = [...buildings];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "area":
          return dir * (areaNames[a.area] ?? a.area).localeCompare(areaNames[b.area] ?? b.area);
        case "price":
          return dir * (a.price_range[0] - b.price_range[0]);
        case "type":
          return dir * a.type.localeCompare(b.type);
        case "electric":
          return dir * (a.electric_rate - b.electric_rate);
        default:
          return 0;
      }
    });

    return copy;
  }, [buildings, areaNames, sortKey, sortDir]);

  function arrow(key: SortKey) {
    if (sortKey !== key) return null;
    return <span className="ml-1 text-terracotta">{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  const thClass =
    "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-latte cursor-pointer select-none hover:text-espresso transition-colors";

  return (
    <div className="overflow-x-auto rounded-2xl border border-sand">
      <table className="w-full text-sm">
        <thead className="bg-sand/50">
          <tr>
            <th className={thClass} onClick={() => handleSort("name")}>
              Building{arrow("name")}
            </th>
            <th className={thClass} onClick={() => handleSort("area")}>
              Area{arrow("area")}
            </th>
            <th className={thClass} onClick={() => handleSort("price")}>
              Price Range{arrow("price")}
            </th>
            <th className={thClass} onClick={() => handleSort("type")}>
              Type{arrow("type")}
            </th>
            <th className={`${thClass} hidden md:table-cell`}>
              Facilities
            </th>
            <th className={thClass} onClick={() => handleSort("electric")}>
              Electric{arrow("electric")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand">
          {sorted.map((b) => (
            <tr key={b.slug} className="group bg-milk hover:bg-sand/40 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/cribs/${b.area}/${b.slug}`}
                  className="font-serif font-bold text-espresso group-hover:text-terracotta transition-colors"
                >
                  {b.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-dark-roast">
                {areaNames[b.area] ?? b.area}
              </td>
              <td className="px-4 py-3 font-serif font-bold text-terracotta whitespace-nowrap">
                ฿{(b.price_range[0] / 1000).toFixed(0)}–{(b.price_range[1] / 1000).toFixed(0)}k
                <span className="text-latte font-normal text-xs">/mo</span>
              </td>
              <td className="px-4 py-3 text-dark-roast text-xs">
                {TYPE_LABELS[b.type] ?? b.type}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex gap-1 flex-wrap">
                  {b.facilities.slice(0, 4).map((f) => (
                    <span
                      key={f}
                      className="bg-sand text-dark-roast px-2 py-0.5 rounded text-[10px] font-medium"
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-dark-roast whitespace-nowrap">
                ฿{b.electric_rate}/unit
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
