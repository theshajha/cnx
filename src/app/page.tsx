import Link from "next/link";
import { getAllBuildings, getAllGuides, getAllArticles, getAllContributors, getAllAreaMetadata } from "@/lib/content";
import { guidePillarTitle } from "@/lib/guide-pillars";
import { websiteJsonLd } from "@/lib/seo";
import BuildingCard from "@/components/BuildingCard";
import GuideCard from "@/components/GuideCard";

export default function Home() {
  const buildings = getAllBuildings();
  const guides = getAllGuides();
  const articles = getAllArticles();
  const contributors = getAllContributors();
  const recentArticles = articles.slice(0, 3);
  const allAreas = getAllAreaMetadata();

  const recommendedBuildings = [...buildings]
    .filter((b) => (b.recommendation_score ?? 0) > 0)
    .sort((a, b) => (b.recommendation_score ?? 0) - (a.recommendation_score ?? 0))
    .slice(0, 6);

  const cheapest = buildings.length > 0
    ? Math.min(...buildings.map((b) => b.price_range[0]))
    : 0;

  // Pick a compelling quote from a top-rated building
  const quoteBuilding = recommendedBuildings.find((b) => b.contributor_note && b.recommendation_score >= 9);
  const quoteText = quoteBuilding?.contributor_note?.split(".").slice(0, 2).join(".") + ".";

  // Guide teasers for "New to Chiang Mai?" section
  const guideTeasers = [
    { slug: "cost-of-living-chiang-mai", icon: "💰", title: "Cost of Living", sub: "Real numbers, 3 budget tiers" },
    { slug: "visa-options-chiang-mai", icon: "📋", title: "Visa Options", sub: "Tourist, ED, retirement, Elite" },
    { slug: "getting-around-chiang-mai", icon: "🛵", title: "Getting Around", sub: "Scooters, Grab, walking" },
    { slug: "healthcare-chiang-mai", icon: "🏥", title: "Healthcare", sub: "Hospitals, dentists, insurance" },
    { slug: "thai-bank-account", icon: "🏦", title: "Bank Account", sub: "Which banks, what documents" },
    { slug: "buying-property-chiang-mai", icon: "🏠", title: "Buying Property", sub: "Condos yes, land no" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />

      {/* ──────────────────────────────────────────────── */}
      {/* HERO — full-bleed atmospheric                     */}
      {/* ──────────────────────────────────────────────── */}
      <section className="-mx-4 md:-mx-8 -mt-2 relative overflow-hidden bg-gradient-to-br from-espresso via-dark-roast to-terracotta">
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,rgba(251,247,240,0.3),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-espresso/40" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-base">🐘</span>
              <span className="text-cream/90 text-[11px] font-bold tracking-[1.5px] uppercase font-sans">CNX Cribs</span>
            </div>

            <h1 className="font-serif font-bold text-[40px] md:text-[56px] text-cream tracking-tight leading-[1.08]">
              Your honest friend<br />in Chiang Mai.
            </h1>

            <p className="text-cream/75 text-base md:text-lg font-sans leading-relaxed mt-5 max-w-lg">
              {buildings.length} verified rentals. Real prices, not listing fantasies. Expat tips from people who actually live here.
            </p>

            <div className="flex gap-3 mt-8 flex-wrap">
              <Link
                href="/cribs"
                className="bg-cream text-espresso px-7 py-3.5 rounded-xl text-[15px] font-bold font-sans hover:bg-sand transition-colors"
              >
                Browse Cribs →
              </Link>
              <Link
                href="/playbook"
                className="bg-white/10 text-cream border border-cream/20 px-7 py-3.5 rounded-xl text-[15px] font-semibold font-sans hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                New here? Start with the guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────── */}
      {/* TRUST BAR                                         */}
      {/* ──────────────────────────────────────────────── */}
      <section className="-mx-4 md:-mx-8 bg-sand">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex justify-center gap-6 md:gap-12 flex-wrap text-[13px] font-sans text-dark-roast">
          <span><strong className="text-espresso font-bold">{buildings.length}</strong> verified buildings</span>
          <span><strong className="text-espresso font-bold">฿{(cheapest / 1000).toFixed(0)}k</strong> cheapest monthly</span>
          <span><strong className="text-espresso font-bold">{allAreas.length}</strong> neighborhoods</span>
          <span>Updated <strong className="text-espresso font-bold">weekly</strong></span>
        </div>
      </section>

      {/* ──────────────────────────────────────────────── */}
      {/* SOCIAL PROOF QUOTE                                */}
      {/* ──────────────────────────────────────────────── */}
      {quoteBuilding && (
        <section className="py-10 md:py-12 text-center max-w-2xl mx-auto">
          <p className="text-dark-roast text-[15px] md:text-base leading-relaxed italic font-sans">
            &ldquo;{quoteText}&rdquo;
          </p>
          <p className="text-latte text-[12px] font-sans mt-3">
            — from{" "}
            <Link href={`/cribs/${quoteBuilding.area}/${quoteBuilding.slug}`} className="text-terracotta hover:underline font-medium">
              {quoteBuilding.name}
            </Link>{" "}
            review
          </p>
        </section>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* RECOMMENDED — horizontal scroll on mobile         */}
      {/* ──────────────────────────────────────────────── */}
      {recommendedBuildings.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-between items-baseline mb-6">
            <div>
              <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight">
                Recommended
              </h2>
              <p className="text-sm text-latte mt-1 font-sans">
                Our top picks based on value, reviews, and overall quality.
              </p>
            </div>
            <Link href="/cribs" className="text-sm font-semibold text-terracotta hover:underline font-sans hidden md:block">
              View all →
            </Link>
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="md:hidden flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {recommendedBuildings.map((b) => (
              <div key={b.slug} className="min-w-[280px] snap-start">
                <BuildingCard building={b} />
              </div>
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-2 gap-6">
            {recommendedBuildings.map((b) => (
              <BuildingCard key={b.slug} building={b} />
            ))}
          </div>

          <Link href="/cribs" className="inline-block mt-6 text-sm font-semibold text-terracotta hover:underline font-sans md:hidden">
            View all cribs →
          </Link>
        </section>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* NEW TO CHIANG MAI? — dark full-bleed section      */}
      {/* ──────────────────────────────────────────────── */}
      <section className="-mx-4 md:-mx-8 bg-espresso py-12 md:py-16 mb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="font-serif font-bold text-2xl text-cream tracking-tight">
            New to Chiang Mai?
          </h2>
          <p className="text-cream/50 text-sm font-sans mt-2 mb-8">
            Start here. These guides cover everything from visas to scooters.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {guideTeasers.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="block bg-white/[0.06] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.12] transition-colors group"
              >
                <div className="text-2xl mb-2">{g.icon}</div>
                <div className="font-bold text-[13px] text-cream font-sans group-hover:text-terracotta transition-colors">
                  {g.title}
                </div>
                <div className="text-[11px] text-cream/40 font-sans mt-1 leading-snug">
                  {g.sub}
                </div>
              </Link>
            ))}
          </div>

          <Link href="/guides" className="inline-block mt-8 text-sm font-semibold text-terracotta hover:underline font-sans">
            View all guides →
          </Link>
        </div>
      </section>

      {/* ──────────────────────────────────────────────── */}
      {/* STATS GRID — pulled from real data                */}
      {/* ──────────────────────────────────────────────── */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-milk rounded-2xl border border-sand p-6 text-center">
            <div className="font-serif font-bold text-[32px] text-espresso">{buildings.length}</div>
            <div className="text-[12px] text-latte font-sans mt-1">Verified Buildings</div>
          </div>
          <div className="bg-milk rounded-2xl border border-sand p-6 text-center">
            <div className="font-serif font-bold text-[32px] text-terracotta">฿{(cheapest / 1000).toFixed(0)}k</div>
            <div className="text-[12px] text-latte font-sans mt-1">Cheapest Monthly</div>
          </div>
          <div className="bg-milk rounded-2xl border border-sand p-6 text-center">
            <div className="font-serif font-bold text-[32px] text-espresso">{articles.length}</div>
            <div className="text-[12px] text-latte font-sans mt-1">In-Depth Guides</div>
          </div>
          <div className="bg-milk rounded-2xl border border-sand p-6 text-center">
            <div className="font-serif font-bold text-[32px] text-espresso">100%</div>
            <div className="text-[12px] text-latte font-sans mt-1">Free, No Agent Fees</div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────── */}
      {/* EXPLORE BY AREA                                   */}
      {/* ──────────────────────────────────────────────── */}
      <section className="mb-16">
        <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight mb-6">
          Explore by Area
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allAreas.map((area) => {
            const areaBuildings = buildings.filter((b) => b.area === area.slug);
            const minPrice = areaBuildings.length > 0
              ? Math.min(...areaBuildings.map((b) => b.price_range[0]))
              : 0;
            const maxPrice = areaBuildings.length > 0
              ? Math.max(...areaBuildings.map((b) => b.price_range[1]))
              : 0;

            return (
              <Link
                key={area.slug}
                href={`/cribs/${area.slug}`}
                className="block bg-milk rounded-2xl border border-sand p-8 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {area.icon && <div className="text-4xl mb-2">{area.icon}</div>}
                <h3 className="font-serif font-bold text-2xl text-espresso">{area.name}</h3>
                <p className="text-sm text-latte mt-2 leading-relaxed font-sans">{area.description}</p>
                <div className="flex gap-6 mt-4 text-sm font-sans">
                  <span>
                    <span className="text-latte">Buildings: </span>
                    <span className="text-espresso font-bold">{areaBuildings.length}</span>
                  </span>
                  {areaBuildings.length > 0 && (
                    <span>
                      <span className="text-latte">From </span>
                      <span className="text-terracotta font-bold">
                        ฿{minPrice.toLocaleString()} – ฿{maxPrice.toLocaleString()}
                      </span>
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────── */}
      {/* DIRECTORY TEASER                                  */}
      {/* ──────────────────────────────────────────────── */}
      {guides.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight mb-2">
            The Directory
          </h2>
          <p className="text-sm text-latte mb-6 font-sans">
            Curated spots for daily life, work, wellness, and more — your yellow pages for living in Chiang Mai.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...guides]
              .sort((a, b) => (b.spots.length > 0 ? 1 : 0) - (a.spots.length > 0 ? 1 : 0))
              .slice(0, 6)
              .map((g) => (
                <GuideCard key={g.category} guide={g} pillarTitle={guidePillarTitle(g.pillar)} />
              ))}
          </div>
          <Link
            href="/directory"
            className="inline-block mt-6 text-sm font-semibold text-terracotta hover:underline font-sans"
          >
            View full directory →
          </Link>
        </section>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* LATEST GUIDES                                     */}
      {/* ──────────────────────────────────────────────── */}
      {recentArticles.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight mb-2">
            Latest Guides
          </h2>
          <p className="text-sm text-latte mb-6 font-sans">
            In-depth articles on living in Chiang Mai, written by expats who have figured it out.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentArticles.map((article) => {
              const author = contributors.find((c) => c.slug === article.author);
              return (
                <Link
                  key={article.slug}
                  href={`/guides/${article.slug}`}
                  className="block bg-milk rounded-2xl border border-sand p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <h3 className="font-serif font-bold text-[20px] text-espresso leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-dark-roast text-[14px] mt-2 leading-relaxed line-clamp-2 font-sans">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-sand text-xs text-latte font-sans">
                    {author && <span className="font-medium text-dark-roast">{author.name}</span>}
                    <span>{article.reading_time} min read</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link
            href="/guides"
            className="inline-block mt-6 text-sm font-semibold text-terracotta hover:underline font-sans"
          >
            View all guides →
          </Link>
        </section>
      )}
    </>
  );
}
