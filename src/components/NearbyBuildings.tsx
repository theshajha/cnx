import Link from "next/link";
import { Building } from "@/lib/types";

interface NearbyBuildingsProps {
  buildings: Building[];
  currentSlug: string;
}

export default function NearbyBuildings({ buildings, currentSlug }: NearbyBuildingsProps) {
  const nearby = buildings.filter((b) => b.slug !== currentSlug).slice(0, 3);

  if (nearby.length === 0) return null;

  return (
    <div className="bg-milk rounded-[14px] p-6 border border-sand">
      <h3 className="font-serif font-bold text-[17px] text-espresso mb-4">Nearby Buildings</h3>
      <div className="flex flex-col gap-3">
        {nearby.map((b, i) => (
          <div key={b.slug}>
            {i > 0 && <div className="border-t border-sand mb-3" />}
            <Link href={`/${b.area}/${b.slug}`} className="flex justify-between items-center group">
              <div>
                <div className="text-espresso font-semibold text-sm group-hover:text-terracotta transition-colors">
                  {b.name}
                </div>
                <div className="text-latte text-[11px] mt-0.5">
                  {b.address.split(",")[0]} · ฿{(b.price_range[0] / 1000).toFixed(0)}–{(b.price_range[1] / 1000).toFixed(0)}k
                </div>
              </div>
              <span className="text-terracotta font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
