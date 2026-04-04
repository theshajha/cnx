import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllGuides, getGuideByCategory, getAllContributors } from "@/lib/content";
import { guideMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((g) => ({ category: g.category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const guide = getGuideByCategory(category);
  if (!guide) return {};
  return guideMetadata(guide);
}

export default async function GuideCategoryPage({ params }: Props) {
  const { category } = await params;
  const guide = getGuideByCategory(category);
  if (!guide) notFound();

  const contributors = getAllContributors();
  const recommender = guide.recommended_by
    ? contributors.find((c) => c.slug === guide.recommended_by)
    : null;

  return (
    <div className="pt-4">
      {/* Category Header */}
      <div className="mb-10">
        <div className="text-5xl mb-4">{guide.icon}</div>
        <h1 className="font-serif font-bold text-[30px] md:text-[40px] text-espresso tracking-tight leading-tight">
          {guide.name}
        </h1>
        <p className="text-latte text-base mt-2 max-w-xl leading-relaxed">
          {guide.description}
        </p>
        {recommender && (
          <Link href="/contributors" className="inline-flex items-center gap-1.5 mt-3 text-sm text-dark-roast hover:text-terracotta transition-colors">
            Recommended by <span className="font-semibold">{recommender.name}</span>
          </Link>
        )}
      </div>

      {/* Spot Cards */}
      <div className="space-y-5">
        {guide.spots.map((spot) => {
          const areaLabel = spot.area === "nimman" ? "Nimman" : spot.area === "old-city" ? "Old City" : spot.area;
          return (
            <div
              key={spot.slug}
              className="bg-milk rounded-[14px] border border-sand overflow-hidden flex flex-col md:flex-row"
            >
              <div className="relative w-full md:w-[240px] h-[180px] md:h-auto shrink-0">
                <Image
                  src={`/guides/${category}/${spot.photo}`}
                  alt={spot.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 240px"
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-serif font-bold text-lg text-espresso">{spot.name}</h3>
                  <span className="bg-terracotta/90 text-cream px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {areaLabel}
                  </span>
                </div>
                <p className="text-dark-roast text-sm leading-relaxed">{spot.one_liner}</p>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-latte text-xs">{spot.address}</p>
                  <a
                    href={`https://www.google.com/maps?q=${spot.coordinates[0]},${spot.coordinates[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-terracotta font-semibold hover:underline whitespace-nowrap"
                  >
                    View on Map ↗
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide Content */}
      {guide.content.trim() && (
        <div className="mt-12 max-w-3xl">
          {guide.content
            .split(/^## /m)
            .filter((s) => s.trim())
            .map((section) => {
              const newlineIndex = section.indexOf("\n");
              if (newlineIndex === -1) return null;
              const title = section.slice(0, newlineIndex).trim();
              const body = section.slice(newlineIndex + 1).trim();
              return (
                <div key={title} className="mb-8">
                  <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-3">
                    {title}
                  </h2>
                  <div className="text-dark-roast text-sm leading-relaxed space-y-3">
                    {body.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
