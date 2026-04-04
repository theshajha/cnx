import Link from "next/link";
import { NearbySpotRef, GuideCategory } from "@/lib/types";

interface NearbySpotsProps {
  spots: NearbySpotRef[];
  guides: GuideCategory[];
}

export default function NearbySpots({ spots, guides }: NearbySpotsProps) {
  if (spots.length === 0) return null;

  const categories = Array.from(new Set(spots.map((s) => s.category)));

  const CATEGORY_ICONS: Record<string, string> = {
    coffee: "☕",
    massage: "💆",
    coworking: "💻",
    motorbikes: "🛵",
    supermarkets: "🛒",
    laundry: "🧺",
    gyms: "🏋️",
    dentists: "🦷",
    "language-schools": "📚",
    "international-schools": "🎒",
    "visa-legal": "📋",
    "local-eats": "🍜",
    bikes: "🚲",
    weed: "🌿",
  };

  return (
    <div>
      <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-5">
        Nearby Expat Spots
      </h2>
      <div className="space-y-6">
        {categories.map((cat) => {
          const guide = guides.find((g) => g.category === cat);
          const catSpots = spots.filter((s) => s.category === cat);

          return (
            <div key={cat}>
              <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold mb-3">
                {CATEGORY_ICONS[cat] || "•"} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
              <div className="space-y-2">
                {catSpots.map((spot) => {
                  const guideSpot = guide?.spots.find((gs) => gs.slug === spot.slug);
                  return (
                    <div key={spot.slug} className="flex justify-between items-center bg-milk p-3 rounded-lg border border-sand">
                      <div>
                        <div className="text-espresso font-medium text-sm">{guideSpot?.name || spot.slug}</div>
                        {guideSpot?.one_liner && (
                          <div className="text-latte text-xs mt-0.5">{guideSpot.one_liner}</div>
                        )}
                      </div>
                      <span className="text-latte text-[11px] whitespace-nowrap ml-4">{spot.walk_minutes} min walk</span>
                    </div>
                  );
                })}
              </div>
              {guide && (
                <Link href={`/guide/${cat}`} className="text-terracotta text-sm font-semibold mt-2 inline-block hover:underline">
                  See full guide →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
