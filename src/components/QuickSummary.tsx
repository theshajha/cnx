import { Building } from "@/lib/types";
import { estimatedMonthly, moveInCost, pricePerSqm, wifiLabel } from "@/lib/metrics";
import { ASSUMED_KWH_PER_MONTH } from "@/lib/metrics";

interface QuickSummaryProps {
  building: Building;
  areaLabel: string;
}

export default function QuickSummary({ building, areaLabel }: QuickSummaryProps) {
  const unitTypes = building.units.map((u) => u.type).join(", ");
  const priceDisplay = `฿${(building.price_range[0] / 1000).toFixed(0)}–${(building.price_range[1] / 1000).toFixed(0)}k/mo`;
  const all = estimatedMonthly(building);
  const ppsm = pricePerSqm(building);

  const rows = [
    { label: "Type", value: building.type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
    { label: "Area", value: areaLabel },
    { label: "Units", value: unitTypes },
    { label: "Rent", value: priceDisplay, accent: true },
    ...(ppsm ? [{ label: "฿ per sqm", value: `฿${ppsm.toLocaleString()}` }] : []),
    { label: "Deposit", value: `${building.deposit} month${building.deposit > 1 ? "s" : ""}` },
    { label: "Electric", value: `${building.electric_rate} ฿/unit` },
    { label: "WiFi", value: `${wifiLabel(building.wifi).value}` },
  ];

  return (
    <div className="bg-milk rounded-[14px] border border-sand overflow-hidden">
      <div className="p-6">
        <h3 className="font-display font-bold text-[17px] text-espresso mb-4">Quick summary</h3>
        <dl className="flex flex-col gap-2.5 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-latte shrink-0">{row.label}</dt>
              <dd
                className={`text-right ${
                  row.accent ? "text-terracotta font-bold tnum" : "text-espresso font-semibold"
                }`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* The two numbers that decide it, which no listing site shows you upfront. */}
      <div className="bg-parchment border-t border-sand p-6">
        <div className="flex justify-between items-baseline gap-4">
          <span className="text-[12px] text-latte">Est. monthly, all-in</span>
          <span className="font-display font-bold text-[20px] text-espresso tnum">
            ฿{all.total.toLocaleString()}
          </span>
        </div>
        <p className="text-[11px] text-mist mt-1 leading-snug">
          rent + {ASSUMED_KWH_PER_MONTH} kWh electric + water + internet
        </p>

        <div className="flex justify-between items-baseline gap-4 mt-4 pt-4 border-t border-sand">
          <span className="text-[12px] text-latte">Cash to move in</span>
          <span className="font-display font-bold text-[20px] text-espresso tnum">
            ฿{moveInCost(building).toLocaleString()}
          </span>
        </div>
        <p className="text-[11px] text-mist mt-1 leading-snug">
          first month + {building.deposit} month{building.deposit > 1 ? "s" : ""} deposit
        </p>
      </div>
    </div>
  );
}
