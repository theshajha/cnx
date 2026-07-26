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
  areaLabel?: string;
  /** Full area cohort, used to place this building's ฿/sqm against its peers. */
  areaPeers?: Building[];
}

const VALUE_COPY = {
  great: { label: "Good value", tone: "text-verified bg-verified/10" },
  fair: { label: "Market rate", tone: "text-latte bg-sand" },
  premium: { label: "Premium", tone: "text-caution bg-caution/10" },
} as const;

function titleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BuildingCard({ building, areaLabel, areaPeers }: Props) {
  const value = areaPeers ? valueVsArea(building, areaPeers) : null;
  const sizes = sqmRange(building);
  const all = estimatedMonthly(building);
  const fresh = freshnessOf(building.last_verified);
  const layouts = layoutsOf(building);
  const area = areaLabel ?? titleCase(building.area);

  return (
    <Link
      href={`/cribs/${building.area}/${building.slug}`}
      className="group flex flex-col bg-milk rounded-2xl border border-sand overflow-hidden hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative h-[172px] bg-sand">
        <SafeImage
          src={`/buildings/${building.slug}/${building.photos[0] || "hero.jpg"}`}
          alt={building.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-espresso/55 to-transparent pointer-events-none" />

        <span className="absolute top-3 left-3 bg-cream/92 text-espresso px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
          {area}
        </span>
        {fresh.tier === "fresh" && (
          <span className="absolute top-3 right-3 bg-verified text-cream px-2.5 py-1 rounded-full text-[10px] font-bold">
            ✓ Verified
          </span>
        )}

        {/* Price sits on the photo so the eye lands on it first. */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="font-display font-bold text-[24px] text-cream tnum leading-none drop-shadow-sm">
            ฿{(entryPrice(building) / 1000).toFixed(0)}k
            <span className="text-[12px] font-sans font-medium text-cream/75 ml-1">/mo</span>
          </div>
          {sizes && (
            <div className="text-[11px] text-cream/85 tnum bg-espresso/40 px-2 py-0.5 rounded backdrop-blur-sm">
              {sizes[0] === sizes[1] ? sizes[0] : `${sizes[0]}–${sizes[1]}`} sqm
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-[17px] text-espresso leading-tight group-hover:text-terracotta transition-colors">
          {building.name}
        </h3>
        <p className="text-[12px] text-latte mt-0.5 line-clamp-1">{building.address}</p>

        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {layouts.map((l) => (
            <span
              key={l}
              className="text-[10px] font-semibold text-dark-roast bg-sand px-1.5 py-0.5 rounded"
            >
              {LAYOUT_LABELS[l]}
            </span>
          ))}
          {value && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${VALUE_COPY[value.tier].tone}`}
            >
              {VALUE_COPY[value.tier].label}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between text-[11px] border-t border-sand mt-3">
          {value ? (
            <span className="text-latte">
              <span className="tnum text-dark-roast font-semibold">
                ฿{value.ppsm.toLocaleString()}
              </span>
              /sqm
            </span>
          ) : (
            <span />
          )}
          <span className="text-latte">
            ≈<span className="tnum text-dark-roast font-semibold">
              ฿{(all.total / 1000).toFixed(1)}k
            </span>{" "}
            all-in
          </span>
        </div>
      </div>
    </Link>
  );
}
