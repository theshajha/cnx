import Link from "next/link";
import Image from "next/image";
import { Building } from "@/lib/types";
import VerifiedBadge from "./VerifiedBadge";
import FacilityChips from "./FacilityChips";

interface BuildingCardProps {
  building: Building;
}

export default function BuildingCard({ building }: BuildingCardProps) {
  const priceDisplay = `฿${(building.price_range[0] / 1000).toFixed(0)}–${(building.price_range[1] / 1000).toFixed(0)}k`;
  const areaLabel = building.area === "nimman" ? "Nimman" : "Old City";
  const heroPhoto = building.photos[0] || "hero.jpg";

  return (
    <Link
      href={`/${building.area}/${building.slug}`}
      className="block bg-milk rounded-[14px] border border-sand overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative h-[180px]">
        <Image
          src={`/buildings/${building.slug}/${heroPhoto}`}
          alt={building.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-terracotta/90 text-cream px-3 py-1 rounded-full text-[11px] font-bold">
            {areaLabel}
          </span>
        </div>
        {building.verified && (
          <div className="absolute top-3 right-3">
            <VerifiedBadge date={building.last_verified} />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif font-bold text-lg text-espresso">{building.name}</h3>
        <p className="text-xs text-latte mt-1">{building.address}</p>
        <div className="mt-3">
          <FacilityChips facilities={building.facilities.slice(0, 4)} size="sm" />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="font-serif font-bold text-xl text-terracotta">
            {priceDisplay}<span className="text-sm font-normal text-latte">/mo</span>
          </div>
          <div className="text-xs text-latte">
            {building.units.map((u) => u.type).join(" · ")}
          </div>
        </div>
      </div>
    </Link>
  );
}
