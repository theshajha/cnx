import Link from "next/link";
import type { NearbySpotRef, GuideCategory } from "@/lib/types";
import { walkBucket, APPROX } from "@/lib/freshness";

interface Props {
  spots: NearbySpotRef[];
  guides: GuideCategory[];
}

const CATEGORY_LABELS: Record<string, string> = {
  coffee: "Coffee",
  coworking: "Co-working",
  gyms: "Gyms",
  massage: "Massage",
  "local-eats": "Local eats",
  supermarkets: "Groceries",
  laundry: "Laundry",
  motorbikes: "Scooter rental",
  dentists: "Dentists",
  "visa-legal": "Visa & legal",
  "language-schools": "Language schools",
  "international-schools": "Schools",
};

/**
 * The block that makes a listing feel like local knowledge rather than a
 * classified ad. Walk times are derived from coordinates, so they're shown as
 * buckets with an "≈" — precise-looking minutes would be false confidence.
 */
export default function NearbySpots({ spots, guides }: Props) {
  if (spots.length === 0) return null;

  const byCategory = new Map<string, NearbySpotRef[]>();
  for (const s of [...spots].sort((a, b) => a.walk_minutes - b.walk_minutes)) {
    byCategory.set(s.category, [...(byCategory.get(s.category) ?? []), s]);
  }

  return (
    <section>
      <h2 className="font-display font-bold text-[22px] text-espresso tracking-tight">
        What&rsquo;s within walking distance
      </h2>
      <p className="text-[13px] text-latte mt-1.5 mb-5">
        Straight-line estimates from this building, not sponsored placements.
      </p>

      <div className="bg-milk rounded-2xl border border-sand divide-y divide-sand overflow-hidden">
        {[...byCategory.entries()].map(([cat, items]) => {
          const guide = guides.find((g) => g.category === cat);
          return (
            <div key={cat} className="px-5 py-4">
              <div className="flex items-baseline justify-between gap-3 mb-2.5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-latte">
                  {CATEGORY_LABELS[cat] ?? cat.replace(/-/g, " ")}
                </h3>
                {guide && (
                  <Link
                    href={`/directory/${cat}`}
                    className="text-[11px] font-bold text-terracotta hover:underline shrink-0"
                  >
                    all {guide.spots.length} →
                  </Link>
                )}
              </div>

              <ul className="space-y-2">
                {items.map((spot) => {
                  const detail = guide?.spots.find((gs) => gs.slug === spot.slug);
                  return (
                    <li key={spot.slug} className="flex items-baseline justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[14px] font-semibold text-espresso">
                          {detail?.name ?? spot.slug.replace(/-/g, " ")}
                        </span>
                        {detail?.one_liner && (
                          <p className="text-[12px] text-latte leading-snug mt-0.5">
                            {detail.one_liner}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-dark-roast whitespace-nowrap shrink-0 tnum">
                        {APPROX}
                        {walkBucket(spot.walk_minutes)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
