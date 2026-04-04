"use client";

import { useState } from "react";
import Image from "next/image";
import { Unit } from "@/lib/types";

interface UnitTabsProps {
  units: Unit[];
  buildingSlug: string;
}

export default function UnitTabs({ units, buildingSlug }: UnitTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const unit = units[activeTab];

  return (
    <div>
      <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-4">
        Unit Types
      </h2>

      <div className="flex gap-0">
        {units.map((u, i) => (
          <button
            key={u.type}
            onClick={() => setActiveTab(i)}
            className={`py-3 px-6 text-sm font-bold transition-colors ${
              i === activeTab
                ? "text-espresso bg-milk border border-sand border-b-0 rounded-t-[10px]"
                : "text-latte hover:text-dark-roast"
            }`}
          >
            {u.type} · {u.sqm} sqm
          </button>
        ))}
      </div>

      <div className="bg-milk border border-sand rounded-b-[10px] rounded-tr-[10px] p-6">
        {unit.photos.length > 0 && (
          <div className="grid grid-cols-[1.4fr_1fr] gap-1 rounded-lg overflow-hidden h-[140px] mb-5">
            <div className="relative">
              <Image
                src={`/buildings/${buildingSlug}/${unit.photos[0]}`}
                alt={`${unit.type} interior`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="grid grid-rows-2 gap-1">
              {unit.photos.slice(1, 3).map((photo, i) => (
                <div key={photo} className="relative">
                  <Image
                    src={`/buildings/${buildingSlug}/${photo}`}
                    alt={`${unit.type} photo ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  {i === Math.min(unit.photos.length - 2, 1) && unit.photos.length > 3 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">+{unit.photos.length - 3} more</span>
                    </div>
                  )}
                </div>
              ))}
              {unit.photos.length < 3 && (
                <div className="bg-sand flex items-center justify-center text-latte text-xs">📸</div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cream p-4 rounded-[10px]">
            <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Monthly Rent</div>
            <div className="font-serif font-bold text-xl text-terracotta mt-1.5">
              ฿{unit.price_range[0].toLocaleString()} – {unit.price_range[1].toLocaleString()}
            </div>
          </div>
          <div className="bg-cream p-4 rounded-[10px]">
            <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Bed / Bath</div>
            <div className="font-serif font-bold text-xl text-espresso mt-1.5">
              {unit.beds} / {unit.bathrooms}
            </div>
          </div>
          <div className="bg-cream p-4 rounded-[10px]">
            <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Best Floor</div>
            <div className="font-bold text-lg text-espresso mt-1.5">{unit.recommended_floor}</div>
          </div>
          <div className="bg-cream p-4 rounded-[10px]">
            <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Best Facing</div>
            <div className="font-bold text-lg text-espresso mt-1.5">{unit.recommended_facing}</div>
          </div>
        </div>

        {unit.features.length > 0 && (
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {unit.features.map((f) => (
              <span key={f} className="bg-sand text-dark-roast px-3 py-1.5 rounded-md text-xs font-medium">
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
