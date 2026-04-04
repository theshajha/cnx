import Link from "next/link";
import Image from "next/image";
import { getAllBuildings, getAllGuides, getAllArticles, getAllContributors } from "@/lib/content";
import { guidePillarTitle } from "@/lib/guide-pillars";
import { websiteJsonLd } from "@/lib/seo";
import { getAllAreaMetadata } from "@/lib/content";
import BuildingCard from "@/components/BuildingCard";
import GuideCard from "@/components/GuideCard";

export default function Home() {
  const buildings = getAllBuildings();
  const guides = getAllGuides();
  const articles = getAllArticles();
  const contributors = getAllContributors();
  const recentArticles = articles.slice(0, 3);

  const recommendedBuildings = [...buildings]
    .filter((b) => (b.recommendation_score ?? 0) > 0)
    .sort((a, b) => (b.recommendation_score ?? 0) - (a.recommendation_score ?? 0))
    .slice(0, 6);

  const allAreas = getAllAreaMetadata();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />

      {/* Hero */}
      <section className="text-center py-16 md:py-24">
        <Image src="/mascot.svg" alt="CNX Cribs mascot" width={80} height={80} className="mx-auto mb-6 w-16 h-16 md:w-20 md:h-20" />
        <h1 className="font-serif font-bold text-[36px] md:text-[68px] text-espresso tracking-tight leading-[1.1]">
          Find your place in<br />Chiang Mai.
        </h1>
        <p className="text-base md:text-lg text-dark-roast mt-4 md:mt-6 max-w-xl mx-auto leading-relaxed">
          Verified monthly rentals, real prices, and expat tips for Nimman and Old City.
        </p>
        <div className="flex gap-3 md:gap-4 justify-center mt-8 md:mt-10">
          <Link
            href="/cribs"
            className="bg-espresso text-cream px-6 md:px-8 py-3 md:py-3.5 rounded-[10px] text-sm md:text-base font-bold hover:bg-dark-roast transition-colors"
          >
            Browse All Cribs &rarr;
          </Link>
        </div>
      </section>

      {/* Area Cards */}
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
                <p className="text-sm text-latte mt-2 leading-relaxed">{area.description}</p>
                <div className="flex gap-6 mt-4 text-sm">
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

      {/* Recommended */}
      {recommendedBuildings.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight mb-2">
            Recommended
          </h2>
          <p className="text-sm text-latte mb-6">
            Our top picks based on value, location, community feedback, and overall quality.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedBuildings.map((b) => (
              <BuildingCard key={b.slug} building={b} />
            ))}
          </div>
          <Link
            href="/cribs"
            className="inline-block mt-6 text-sm font-semibold text-terracotta hover:underline"
          >
            View all cribs →
          </Link>
        </section>
      )}

      {/* Directory Teaser */}
      {guides.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight mb-2">
            The Directory
          </h2>
          <p className="text-sm text-latte mb-6">
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
            className="inline-block mt-6 text-sm font-semibold text-terracotta hover:underline"
          >
            View full directory →
          </Link>
        </section>
      )}

      {/* Latest Guides */}
      {recentArticles.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight mb-2">
            Latest Guides
          </h2>
          <p className="text-sm text-latte mb-6">
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
                  <p className="text-dark-roast text-[14px] mt-2 leading-relaxed line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-sand text-xs text-latte">
                    {author && <span className="font-medium text-dark-roast">{author.name}</span>}
                    <span>{article.reading_time} min read</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link
            href="/guides"
            className="inline-block mt-6 text-sm font-semibold text-terracotta hover:underline"
          >
            View all guides →
          </Link>
        </section>
      )}
    </>
  );
}
