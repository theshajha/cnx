import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAllBuildings, getBuildingBySlug, getBuildingsByArea, getAllGuides, getAllContributors } from "@/lib/content";
import Link from "next/link";
import { buildingMetadata, buildingJsonLd } from "@/lib/seo";
import Image from "next/image";
import PhotoGallery from "@/components/PhotoGallery";
import VerifiedBadge from "@/components/VerifiedBadge";
import FacilityChips from "@/components/FacilityChips";
import UnitTabs from "@/components/UnitTabs";
import NearbySpots from "@/components/NearbySpots";
import ContactCard from "@/components/ContactCard";
import QuickSummary from "@/components/QuickSummary";
import LocationCard from "@/components/LocationCard";
import NearbyBuildings from "@/components/NearbyBuildings";

interface Props {
  params: Promise<{ area: string; slug: string }>;
}

export function generateStaticParams() {
  const buildings = getAllBuildings();
  return buildings.map((b) => ({ area: b.area, slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, slug } = await params;
  const building = getBuildingBySlug(area, slug);
  if (!building) return {};
  return buildingMetadata(building);
}

function parseContentSections(content: string) {
  const sections: { title: string; lines: string[] }[] = [];
  const parts = content.split(/^## /m);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const newlineIndex = trimmed.indexOf("\n");
    if (newlineIndex === -1) continue;
    const title = trimmed.slice(0, newlineIndex).trim();
    const body = trimmed.slice(newlineIndex + 1).trim();
    const lines = body.split("\n").filter((l) => l.trim() !== "");
    sections.push({ title, lines });
  }
  return sections;
}

function sectionBorderClass(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("expat") || lower.includes("tip")) return "border-l-4 border-l-terracotta";
  if (lower.includes("gotcha") || lower.includes("warning")) return "border-l-4 border-l-latte";
  return "";
}

export default async function BuildingPage({ params }: Props) {
  const { area, slug } = await params;
  const building = getBuildingBySlug(area, slug);
  if (!building) notFound();

  const areaBuildings = getBuildingsByArea(building.area);
  const guides = getAllGuides();
  const contributors = getAllContributors();
  const contributor = building.contributed_by
    ? contributors.find((c) => c.slug === building.contributed_by)
    : null;

  const allPhotos = [
    ...building.photos,
    ...building.units.flatMap((u) => u.photos),
  ];

  const areaLabel = building.area === "nimman" ? "Nimman" : "Old City";
  const typeLabel = building.type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const allSections = parseContentSections(building.content);
  const overviewSection = allSections.find((s) => s.title.toLowerCase() === "overview");
  const sections = allSections.filter((s) => s.title.toLowerCase() !== "overview");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildingJsonLd(building)) }}
      />

      {/* Photo Gallery Hero */}
      <div className="-mx-4 md:-mx-8 mb-8">
        <PhotoGallery
          photos={allPhotos}
          basePath={`/buildings/${building.slug}`}
          alt={building.name}
        />
      </div>

      {/* Title Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          <span className="bg-terracotta/90 text-cream px-3 py-1 rounded-full text-[11px] font-bold">
            {areaLabel}
          </span>
          <span className="bg-sand text-dark-roast px-3 py-1 rounded-full text-[11px] font-bold">
            {typeLabel}
          </span>
          {building.verified && <VerifiedBadge date={building.last_verified} />}
        </div>
        <h1 className="font-serif font-bold text-[28px] md:text-[38px] text-espresso tracking-tight leading-tight">
          {building.name}
        </h1>
        <p className="text-latte text-sm mt-1">{building.address}</p>
      </div>

      {/* Overview — right after title */}
      {overviewSection && (
        <div className="mb-8 text-[15px] text-dark-roast leading-relaxed max-w-3xl">
          {overviewSection.lines.map((line, i) => (
            <p key={i} className={i > 0 ? "mt-3" : ""} dangerouslySetInnerHTML={{
              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-espresso font-semibold">$1</strong>'),
            }} />
          ))}
        </div>
      )}

      {/* Contributor Card */}
      {contributor && (
        <div className="mb-8 bg-milk rounded-[14px] border border-sand p-5 flex gap-4 items-start">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-sand">
            {contributor.photo ? (
              <Image
                src={`/contributors/${contributor.photo}`}
                alt={contributor.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-latte text-sm font-serif font-bold">
                {contributor.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href="/contributors" className="text-sm font-semibold text-espresso hover:text-terracotta transition-colors">
                {contributor.name}
              </Link>
              <span className="text-[10px] text-latte">contributed this listing · {building.last_verified}</span>
            </div>
            {building.contributor_note && (
              <p className="text-sm text-dark-roast leading-relaxed mt-1.5 italic">
                &ldquo;{building.contributor_note}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Price Banner */}
          <div className="bg-milk rounded-[14px] border border-sand p-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Monthly Rent</div>
              <div className="font-serif font-bold text-3xl text-terracotta mt-1">
                ฿{building.price_range[0].toLocaleString()} – {building.price_range[1].toLocaleString()}
              </div>
            </div>
            <div className="text-sm text-latte">per month</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-milk rounded-[10px] border border-sand p-4 text-center">
              <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Electric</div>
              <div className="font-bold text-espresso text-lg mt-1">{building.electric_rate} ฿</div>
              <div className="text-[10px] text-latte">per unit</div>
            </div>
            <div className="bg-milk rounded-[10px] border border-sand p-4 text-center">
              <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Water</div>
              <div className="font-bold text-espresso text-lg mt-1">{building.water_rate} ฿</div>
              <div className="text-[10px] text-latte">per unit</div>
            </div>
            <div className="bg-milk rounded-[10px] border border-sand p-4 text-center">
              <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">WiFi</div>
              <div className="font-bold text-espresso text-lg mt-1">
                {building.wifi === "included" ? "Free" : `${building.wifi} ฿`}
              </div>
              <div className="text-[10px] text-latte">{building.wifi === "included" ? "included" : "per month"}</div>
            </div>
            <div className="bg-milk rounded-[10px] border border-sand p-4 text-center">
              <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold">Deposit</div>
              <div className="font-bold text-espresso text-lg mt-1">{building.deposit}</div>
              <div className="text-[10px] text-latte">month{building.deposit > 1 ? "s" : ""}</div>
            </div>
          </div>

          {/* Facility Chips */}
          <FacilityChips facilities={building.facilities} />

          {/* Unit Tabs */}
          <UnitTabs units={building.units} buildingSlug={building.slug} />

          {/* Markdown Content Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-serif font-bold text-[22px] text-espresso tracking-tight mb-4">
                {section.title}
              </h2>
              <div className={`bg-milk rounded-[14px] border border-sand p-6 ${sectionBorderClass(section.title)}`}>
                {section.lines.map((line, i) => {
                  if (line.trimStart().startsWith("- ")) {
                    const text = line.trimStart().slice(2);
                    return (
                      <div key={i} className="flex gap-2 mb-2 last:mb-0">
                        <span className="text-terracotta mt-1 shrink-0">&#8226;</span>
                        <span
                          className="text-dark-roast text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: text.replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-espresso font-semibold">$1</strong>'
                            ),
                          }}
                        />
                      </div>
                    );
                  }
                  return (
                    <p
                      key={i}
                      className="text-dark-roast text-sm leading-relaxed mb-3 last:mb-0"
                      dangerouslySetInnerHTML={{
                        __html: line.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="text-espresso font-semibold">$1</strong>'
                        ),
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Nearby Spots */}
          <NearbySpots spots={building.nearby_spots} guides={guides} />

          {/* Bottom CTA */}
          <div className="bg-terracotta rounded-[14px] p-5 md:p-8 text-center">
            <h2 className="font-serif font-bold text-2xl text-cream mb-2">
              Interested in {building.name}?
            </h2>
            <p className="text-cream/80 text-sm mb-5">
              Get in touch directly or read the playbook first.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {building.contact.line && (
                <a
                  href={`https://line.me/R/ti/p/${building.contact.line.replace("@", "")}`}
                  className="bg-cream text-espresso px-6 py-3 rounded-[10px] text-sm font-bold hover:bg-sand transition-colors"
                >
                  Message on LINE
                </a>
              )}
              {building.contact.phone && (
                <a
                  href={`tel:${building.contact.phone}`}
                  className="bg-cream text-espresso px-6 py-3 rounded-[10px] text-sm font-bold hover:bg-sand transition-colors"
                >
                  Call Now
                </a>
              )}
              <Link
                href="/playbook"
                className="bg-cream/20 text-cream px-6 py-3 rounded-[10px] text-sm font-bold hover:bg-cream/30 transition-colors"
              >
                Read the Playbook
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5 lg:sticky lg:top-8">
          <div className="hidden lg:block">
            <ContactCard contact={building.contact} />
          </div>
          <QuickSummary building={building} />
          <LocationCard coordinates={building.coordinates} address={building.address} />
          <NearbyBuildings buildings={areaBuildings} currentSlug={building.slug} />
        </div>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="h-16 lg:hidden" />

      {/* Mobile Sticky Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-milk border-t border-sand p-3 flex gap-2 justify-center lg:hidden z-40">
        {building.contact.phone && (
          <a
            href={`tel:${building.contact.phone}`}
            className="bg-dark-roast text-cream px-5 py-2.5 rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Call
          </a>
        )}
        {building.contact.line && (
          <a
            href={`https://line.me/R/ti/p/${building.contact.line.replace("@", "")}`}
            className="bg-line-green text-white px-5 py-2.5 rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            LINE
          </a>
        )}
        {building.contact.email && (
          <a
            href={`mailto:${building.contact.email}`}
            className="bg-terracotta text-cream px-5 py-2.5 rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Email
          </a>
        )}
      </div>
    </>
  );
}
