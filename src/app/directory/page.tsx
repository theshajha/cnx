import { Metadata } from "next";
import { getAllGuides } from "@/lib/content";
import GuideCard from "@/components/GuideCard";
import { GUIDE_PILLAR_SEQUENCE, guidePillarTitle } from "@/lib/guide-pillars";

export const metadata: Metadata = {
  title: "The Chiang Mai Directory — CNX Cribs",
  description:
    "Your yellow pages for living in Chiang Mai. Curated spots for work, daily life, wellness, health, and local eats.",
};

export default function DirectoryPage() {
  const guides = getAllGuides();

  const byPillar = new Map<string, typeof guides>();
  for (const g of guides) {
    const list = byPillar.get(g.pillar) ?? [];
    list.push(g);
    byPillar.set(g.pillar, list);
  }

  const pillars = GUIDE_PILLAR_SEQUENCE.filter((p) => byPillar.has(p));
  const orphanPillars = [...byPillar.keys()].filter((p) => !(GUIDE_PILLAR_SEQUENCE as readonly string[]).includes(p));
  orphanPillars.sort();

  const totalSpots = guides.reduce((sum, g) => sum + g.spots.length, 0);
  const totalCategories = guides.length;

  return (
    <div className="pt-8 md:pt-12 pb-8">
      <h1 className="font-serif font-bold text-[36px] md:text-[48px] text-espresso tracking-tight leading-tight mb-2">
        The Chiang Mai Directory
      </h1>
      <p className="text-latte text-base mb-1 max-w-xl leading-relaxed">
        Your yellow pages for living in Chiang Mai. Practical picks for monthly renters and long-stay visitors — grouped
        by how you actually live here.
      </p>
      <p className="text-sm text-dark-roast font-medium mb-10">
        {totalSpots} spots across {totalCategories} categories
      </p>

      <div className="space-y-14">
        {pillars.map((pillar) => (
          <section key={pillar}>
            <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-1">
              {guidePillarTitle(pillar)}
            </h2>
            <div className="w-12 h-0.5 bg-terracotta mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(byPillar.get(pillar) ?? []).map((g) => (
                <GuideCard key={g.category} guide={g} pillarTitle={guidePillarTitle(pillar)} />
              ))}
            </div>
          </section>
        ))}

        {orphanPillars.length > 0 && (
          <section>
            <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-1">More</h2>
            <div className="w-12 h-0.5 bg-terracotta mb-2" />
            <p className="text-latte text-sm mb-6">Additional categories we have not filed under a main section yet.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orphanPillars.flatMap((p) =>
                (byPillar.get(p) ?? []).map((g) => (
                  <GuideCard key={g.category} guide={g} pillarTitle={guidePillarTitle(p)} />
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
