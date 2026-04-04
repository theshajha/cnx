import { Building } from "@/lib/types";

interface QuickSummaryProps {
  building: Building;
}

export default function QuickSummary({ building }: QuickSummaryProps) {
  const unitTypes = building.units.map((u) => u.type).join(", ");
  const priceDisplay = `฿${(building.price_range[0] / 1000).toFixed(0)}–${(building.price_range[1] / 1000).toFixed(0)}k/mo`;

  const rows = [
    { label: "Type", value: building.type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
    { label: "Area", value: building.area === "nimman" ? "Nimman" : "Old City" },
    { label: "Units", value: unitTypes },
    { label: "Price", value: priceDisplay, accent: true },
    { label: "Deposit", value: `${building.deposit} month${building.deposit > 1 ? "s" : ""}` },
    { label: "Electric", value: `${building.electric_rate} ฿/unit` },
    { label: "WiFi", value: building.wifi === "included" ? "Included" : `${building.wifi} ฿/mo` },
  ];

  return (
    <div className="bg-milk rounded-[14px] p-6 border border-sand">
      <h3 className="font-serif font-bold text-[17px] text-espresso mb-4">Quick Summary</h3>
      <div className="flex flex-col gap-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <span className="text-latte">{row.label}</span>
            <span className={row.accent ? "text-terracotta font-bold" : "text-espresso font-semibold"}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
