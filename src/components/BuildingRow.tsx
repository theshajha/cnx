import Link from "next/link";
import SafeImage from "./SafeImage";
import type { Building } from "@/lib/types";
import { freshnessOf } from "@/lib/freshness";
import {
  entryPrice,
  estimatedMonthly,
  layoutsOf,
  LAYOUT_LABELS,
  sqmRange,
  valueVsArea,
} from "@/lib/metrics";

interface Props {
  building: Building;
  areaLabel: string;
  areaPeers: Building[];
  rank?: number;
}

const VALUE_COPY = {
  great: { label: "Good value", tone: "text-verified" },
  fair: { label: "Market rate", tone: "text-latte" },
  premium: { label: "Premium", tone: "text-caution" },
} as const;

/**
 * The scanning unit for desktop. A field guide is a reference you read down a
 * column of, so this leads with the numbers that separate one building from
 * another — ฿/sqm, size, all-in monthly — instead of repeating the same photo
 * card 43 times.
 */
export default function BuildingRow({ building, areaLabel, areaPeers, rank }: Props) {
  const value = valueVsArea(building, areaPeers);
  const sizes = sqmRange(building);
  const all = estimatedMonthly(building);
  const fresh = freshnessOf(building.last_verified);
  const layouts = layoutsOf(building);

  return (
    <Link
      href={`/cribs/${building.area}/${building.slug}`}
      className="group grid grid-cols-[76px_minmax(0,1fr)_auto] md:grid-cols-[92px_minmax(0,2.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-x-4 md:gap-x-5 gap-y-1 px-3 md:px-4 py-3.5 border-b border-sand last:border-b-0 hover:bg-parchment/70 transition-colors"
    >
      {/* Thumb */}
      <div className="relative h-[58px] md:h-[64px] rounded-lg overflow-hidden bg-sand">
        <SafeImage
          src={`/buildings/${building.slug}/${building.photos[0] || "hero.jpg"}`}
          alt=""
          fill
          className="object-cover"
          sizes="92px"
        />
        {rank !== undefined && rank < 3 && (
          <span className="absolute top-0 left-0 bg-espresso/85 text-cream text-[10px] font-bold px-1.5 py-0.5 rounded-br-md tnum">
            {rank + 1}
          </span>
        )}
      </div>

      {/* Identity */}
      <div className="min-w-0">
        <h3 className="font-display font-bold text-[16px] md:text-[17px] text-espresso leading-tight truncate group-hover:text-terracotta transition-colors">
          {building.name}
        </h3>
        <p className="text-[12px] text-latte truncate mt-0.5">
          {areaLabel} · {building.address}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {layouts.map((l) => (
            <span key={l} className="text-[10px] font-semibold text-dark-roast bg-sand px-1.5 py-0.5 rounded">
              {LAYOUT_LABELS[l]}
            </span>
          ))}
          {fresh.tier === "fresh" && (
            <span className="text-[10px] font-semibold text-verified">✓ {fresh.label}</span>
          )}
        </div>
      </div>

      {/* Size + ฿/sqm — the comparison columns */}
      <div className="hidden md:block">
        {sizes && (
          <div className="text-[13px] text-dark-roast tnum">
            {sizes[0] === sizes[1] ? `${sizes[0]}` : `${sizes[0]}–${sizes[1]}`}
            <span className="text-latte text-[11px] font-sans ml-1">sqm</span>
          </div>
        )}
        {value && (
          <div className={`text-[12px] mt-0.5 ${VALUE_COPY[value.tier].tone}`}>
            <span className="tnum">฿{value.ppsm.toLocaleString()}</span>
            <span className="text-[10px] font-sans">/sqm</span>
          </div>
        )}
      </div>

      {/* All-in estimate */}
      <div className="hidden md:block">
        <div className="text-[13px] text-dark-roast tnum">
          ฿{Math.round(all.total / 100) / 10}k
          <span className="text-latte text-[11px] font-sans ml-1">all-in</span>
        </div>
        {value && (
          <div className={`text-[11px] mt-0.5 ${VALUE_COPY[value.tier].tone}`}>
            {VALUE_COPY[value.tier].label}
          </div>
        )}
      </div>

      {/* Price — column header already says "rent from", so no repeated label here. */}
      <div className="text-right">
        <div className="font-display font-bold text-[17px] md:text-[19px] text-espresso tnum leading-none">
          ฿{(entryPrice(building) / 1000).toFixed(0)}k
        </div>
        {sizes && (
          <div className="text-[11px] text-latte mt-1 md:hidden tnum">
            {sizes[0] === sizes[1] ? sizes[0] : `${sizes[0]}–${sizes[1]}`} sqm
          </div>
        )}
      </div>
    </Link>
  );
}
