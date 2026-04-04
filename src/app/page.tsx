import Link from "next/link";
import { getAllBuildings, getAllGuides } from "@/lib/content";
import { websiteJsonLd } from "@/lib/seo";
import { AREAS, AreaSlug } from "@/lib/types";
import BuildingCard from "@/components/BuildingCard";
import GuideCard from "@/components/GuideCard";

export default function Home() {
  const buildings = getAllBuildings();
  const guides = getAllGuides();

  const recentBuildings = [...buildings]
    .sort((a, b) => new Date(b.last_verified).getTime() - new Date(a.last_verified).getTime())
    .slice(0, 6);

  const areaEntries = Object.entries(AREAS) as [AreaSlug, (typeof AREAS)[AreaSlug]][];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />

      {/* Hero */}
      <section className="text-center py-16 md:py-24">
        <h1 className="font-serif font-bold text-[36px] md:text-[68px] text-espresso tracking-tight leading-[1.1]">
          Find your place in<br />Chiang Mai.
        </h1>
        <p className="text-base md:text-lg text-dark-roast mt-4 md:mt-6 max-w-xl mx-auto leading-relaxed">
          Verified monthly rentals, real prices, and expat tips for Nimman and Old City.
        </p>
        <div className="flex gap-3 md:gap-4 justify-center mt-8 md:mt-10">
          <Link
            href="/nimman"
            className="bg-espresso text-cream px-6 md:px-8 py-3 md:py-3.5 rounded-[10px] text-sm md:text-base font-bold hover:bg-dark-roast transition-colors"
          >
            Browse Nimman &rarr;
          </Link>
          <Link
            href="/old-city"
            className="bg-sand text-espresso px-6 md:px-8 py-3 md:py-3.5 rounded-[10px] text-sm md:text-base font-bold hover:bg-terracotta/20 transition-colors"
          >
            Browse Old City &rarr;
          </Link>
        </div>
      </section>

      {/* Area Cards */}
      <section className="mb-16">
        <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight mb-6">
          Explore by Area
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {areaEntries.map(([slug, area]) => {
            const areaBuildings = buildings.filter((b) => b.area === slug);
            const minPrice = areaBuildings.length > 0
              ? Math.min(...areaBuildings.map((b) => b.price_range[0]))
              : 0;
            const maxPrice = areaBuildings.length > 0
              ? Math.max(...areaBuildings.map((b) => b.price_range[1]))
              : 0;

            return (
              <Link
                key={slug}
                href={`/${slug}`}
                className="block bg-milk rounded-[14px] border border-sand p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
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

      {/* Recently Verified */}
      {recentBuildings.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight mb-6">
            Recently Verified
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentBuildings.map((b) => (
              <BuildingCard key={b.slug} building={b} />
            ))}
          </div>
        </section>
      )}

      {/* Guide Teaser */}
      {guides.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif font-bold text-2xl text-espresso tracking-tight mb-2">
            Beyond Rentals
          </h2>
          <p className="text-sm text-latte mb-6">
            The expat essentials — cafes, co-working, massage, and more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((g) => (
              <GuideCard key={g.category} guide={g} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
