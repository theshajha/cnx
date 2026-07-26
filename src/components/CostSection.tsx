import Link from "next/link";
import type { CostBand } from "@/lib/metrics";
import { ASSUMED_KWH_PER_MONTH } from "@/lib/metrics";

interface Props {
  bands: CostBand[];
  buildingCount: number;
}

/*
  Palette validated against the espresso surface (#33241A) with the dataviz
  six-check validator: both hues sit inside the dark lightness band L 0.48–0.67,
  clear the chroma floor, and separate at ΔE 21.3 normal / 8.5 protan. Two warm
  hues could not do this — inside the narrow dark band the orange pair collapsed
  to ΔE 8, so bills take a teal that is genuinely far away in hue.
*/
const RENT = "#C4713F";
const BILLS = "#0F8F84";

export default function CostSection({ bands, buildingCount }: Props) {
  // One shared scale across all three bars, or the widths are not comparable.
  const max = Math.max(...bands.map((b) => b.typical));
  const studio = bands.find((b) => b.layout === "studio");
  const twoBed = bands.find((b) => b.layout === "2br");
  const utilities = bands[0]?.utilities ?? 0;

  return (
    <section className="-mx-4 md:-mx-8 bg-espresso py-14 md:py-18 mb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="md:flex md:justify-between md:items-end gap-10">
          <div className="max-w-xl">
            <h2 className="font-display font-bold text-[28px] md:text-[34px] text-cream tracking-tight">
              What it actually costs
            </h2>
            <p className="text-cream/60 text-[14px] md:text-[15px] leading-relaxed mt-3">
              Median monthly cost across our {buildingCount} buildings, split into the rent you are
              quoted and the bills you are not.
            </p>
          </div>

          {/* Legend — required for two series, and it doubles as the sub-header. */}
          <div className="flex gap-5 mt-6 md:mt-0 shrink-0">
            {[
              { c: RENT, label: "Rent", note: "median asking" },
              { c: BILLS, label: "Bills", note: `elec · water · net` },
            ].map((s) => (
              <div key={s.label} className="flex items-start gap-2">
                <span
                  className="w-3 h-3 rounded-[3px] mt-0.5 shrink-0"
                  style={{ background: s.c }}
                  aria-hidden
                />
                <span className="leading-tight">
                  <span className="block text-cream text-[13px] font-semibold">{s.label}</span>
                  <span className="block text-cream/40 text-[11px]">{s.note}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bars */}
        <div className="mt-10 space-y-5">
          {bands.map((b) => {
            const rentPct = (b.rent / max) * 100;
            const billsPct = (b.utilities / max) * 100;
            return (
              <div key={b.layout}>
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <span className="text-cream text-[14px] font-semibold">
                    {b.label}
                    {b.sqm && (
                      <span className="text-cream/35 text-[11px] font-normal ml-2 tnum">
                        ~{b.sqm} sqm
                      </span>
                    )}
                  </span>
                  <span className="font-display font-bold text-[19px] md:text-[21px] text-cream tnum leading-none">
                    ฿{(b.typical / 1000).toFixed(1)}k
                    <span className="text-cream/40 text-[11px] font-sans font-medium ml-1.5">
                      /mo
                    </span>
                  </span>
                </div>

                {/* 2px surface gap between segments; rounded outer ends only. */}
                <div className="flex h-9 md:h-10 w-full">
                  <div
                    className="h-full rounded-l-[4px] flex items-center px-3"
                    style={{ width: `${rentPct}%`, background: RENT }}
                  >
                    <span className="text-cream text-[12px] font-semibold tnum whitespace-nowrap">
                      ฿{(b.rent / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="w-[2px] h-full bg-espresso shrink-0" aria-hidden />
                  {/* The bills segment is only ~12% wide on a two-bed, so its label
                      does not fit inside until the bar is wide. Below that the
                      figure lives in the caption rather than spilling onto the
                      rent segment. */}
                  <div
                    className="h-full rounded-r-[4px] flex items-center justify-end px-2.5 overflow-hidden"
                    style={{ width: `${billsPct}%`, background: BILLS }}
                  >
                    <span className="hidden lg:inline text-cream text-[11px] font-semibold tnum whitespace-nowrap">
                      +฿{(b.utilities / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>

                <p className="text-cream/40 text-[11px] mt-1.5 tnum">
                  <span className="lg:hidden">
                    +฿{(b.utilities / 1000).toFixed(1)}k bills
                    <span className="font-sans"> · </span>
                  </span>
                  {Math.round(b.utilityShare * 100)}% of the total
                  <span className="font-sans"> · </span>
                  cheapest ฿{(b.low / 1000).toFixed(1)}k
                  <span className="font-sans"> · </span>
                  {b.sampleSize} units
                </p>
              </div>
            );
          })}
        </div>

        {/* The takeaway, stated. A chart nobody reads the conclusion off is decoration. */}
        {studio && twoBed && (
          <div className="mt-9 pt-7 border-t border-cream/12 md:flex md:items-start md:justify-between gap-10">
            <p className="text-cream/70 text-[14px] leading-relaxed max-w-2xl">
              Bills land at a near-flat{" "}
              <span className="tnum text-cream font-semibold">
                ฿{utilities.toLocaleString()}
              </span>{" "}
              whatever the size &mdash; mostly electricity, at{" "}
              {ASSUMED_KWH_PER_MONTH} kWh a month with the AC on. So they take{" "}
              <span className="text-cream font-semibold tnum">
                {Math.round(studio.utilityShare * 100)}%
              </span>{" "}
              off the top of a studio but only{" "}
              <span className="text-cream font-semibold tnum">
                {Math.round(twoBed.utilityShare * 100)}%
              </span>{" "}
              of a two-bed. The cheaper the unit, the more the bills matter.
            </p>
            <Link
              href="/guides/cost-of-living-chiang-mai"
              className="inline-block mt-5 md:mt-0 text-[13px] font-bold text-terracotta hover:underline shrink-0"
            >
              Full cost breakdown →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
