import { Metadata } from "next";
import { getAllGuides } from "@/lib/content";
import GuideCard from "@/components/GuideCard";
import { GUIDE_PILLAR_SEQUENCE, guidePillarTitle } from "@/lib/guide-pillars";

export const metadata: Metadata = {
  title: "The Expat's Guide to Chiang Mai — CNX Cribs",
  description:
    "Curated guides for long-stay visitors: work spots, daily life, wellness, health, schools, visas, and local eats.",
};

export default function GuidePage() {
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

  return (
    <div className="pt-4">
      <h1 className="font-serif font-bold text-[40px] text-espresso tracking-tight leading-tight mb-2">
        {"The Expat's Guide to Chiang Mai"}
      </h1>
      <p className="text-latte text-base mb-10 max-w-xl leading-relaxed">
        Practical picks for monthly renters and long-stay visitors — grouped by how you actually live here. We add new
        spots over time; a few categories are still filling in.
      </p>

      <div className="space-y-14">
        {pillars.map((pillar) => (
          <section key={pillar}>
            <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-6">
              {guidePillarTitle(pillar)}
            </h2>
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
            <p className="text-latte text-sm mb-6">Additional guides we have not filed under a main section yet.</p>
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
