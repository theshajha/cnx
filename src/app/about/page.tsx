import { Metadata } from "next";
import { getAllBuildings } from "@/lib/content";

export const metadata: Metadata = {
  title: "About — CNX Cribs",
  description: "Why CNX Cribs exists, what verified means, and how to contribute.",
};

export default function AboutPage() {
  const buildings = getAllBuildings();
  const areaCount = new Set(buildings.map((b) => b.area)).size;

  return (
    <div className="max-w-3xl mx-auto pt-8 md:pt-12 pb-8">
      <h1 className="font-serif font-bold text-[36px] md:text-[48px] text-espresso tracking-tight leading-tight mb-2">
        About
      </h1>
      <p className="text-sm text-dark-roast font-medium mb-10">
        Currently listing {buildings.length} buildings across {areaCount} areas
      </p>

      <div className="space-y-10">
        {/* Why This Exists */}
        <section>
          <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-4">
            Why this exists
          </h2>
          <div className="space-y-4">
            <p className="text-dark-roast text-base leading-[1.8]">
              Finding a monthly rental in Chiang Mai is either scrolling through
              blurry Facebook photos, trusting agent listings with inflated prices,
              or walking door-to-door hoping for the best.
            </p>
            <p className="text-dark-roast text-base leading-[1.8]">
              CNX Cribs is what I wished existed when I moved here. Real pricing,
              honest reviews, and the insider details that only come from actually
              living in these buildings. No sponsored listings, no agent
              commissions, no BS.
            </p>
            <p className="text-dark-roast text-base leading-[1.8]">
              Every building on this site has been visited on foot. Every price has
              been confirmed. Every tip comes from lived experience.
            </p>
          </div>
        </section>

        {/* What Verified Means */}
        <section>
          <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-4">
            What verified means
          </h2>
          <div className="bg-milk rounded-2xl border border-sand p-6">
            <div className="space-y-3 text-dark-roast text-sm leading-relaxed">
              <div className="flex gap-2">
                <span className="text-terracotta shrink-0">&#8226;</span>
                <span>
                  <strong className="text-espresso font-semibold">Visited in person</strong> —
                  someone from the team has physically walked the building, checked
                  common areas, and inspected at least one unit.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-terracotta shrink-0">&#8226;</span>
                <span>
                  <strong className="text-espresso font-semibold">Prices confirmed</strong> —
                  rent, deposit, electric rate, and water rate have been verified
                  directly with management or an owner.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-terracotta shrink-0">&#8226;</span>
                <span>
                  <strong className="text-espresso font-semibold">Date stamped</strong> —
                  every listing shows when it was last verified. Information older
                  than 60 days gets flagged for re-verification.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Contribute */}
        <section>
          <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-4">
            Contribute
          </h2>
          <div className="bg-milk rounded-2xl border border-sand p-6">
            <p className="text-dark-roast text-sm leading-relaxed mb-4">
              Know a building that should be listed? Have updated pricing or a
              correction? Lived somewhere great (or terrible) that other expats
              should know about?
            </p>
            <a
              href="mailto:hello@cnxcribs.com"
              className="inline-block bg-terracotta text-cream px-6 py-3 rounded-[10px] text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Email us at hello@cnxcribs.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
