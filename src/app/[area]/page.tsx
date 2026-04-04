import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBuildingsByArea } from "@/lib/content";
import { areaMetadata } from "@/lib/seo";
import { AREAS, AreaSlug } from "@/lib/types";
import AreaListingClient from "./AreaListingClient";

interface Props {
  params: Promise<{ area: string }>;
}

export function generateStaticParams() {
  return [{ area: "nimman" }, { area: "old-city" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  if (!(area in AREAS)) return {};
  const buildings = getBuildingsByArea(area as AreaSlug);
  return areaMetadata(area as "nimman" | "old-city", buildings.length);
}

export default async function AreaPage({ params }: Props) {
  const { area } = await params;
  if (!(area in AREAS)) notFound();

  const areaInfo = AREAS[area as AreaSlug];
  const buildings = getBuildingsByArea(area as AreaSlug);

  const allFacilities = Array.from(
    new Set(buildings.flatMap((b) => b.facilities)),
  ).sort();

  const minPrice = buildings.length > 0
    ? Math.min(...buildings.map((b) => b.price_range[0]))
    : 0;
  const maxPrice = buildings.length > 0
    ? Math.max(...buildings.map((b) => b.price_range[1]))
    : 0;

  return (
    <>
      {/* Area Header */}
      <div className="mb-10 pt-4">
        <h1 className="font-serif font-bold text-[40px] text-espresso tracking-tight leading-tight">
          {areaInfo.name}
        </h1>
        <p className="text-latte text-base mt-2 max-w-xl leading-relaxed">
          {areaInfo.description}
        </p>
        <div className="flex gap-6 mt-4">
          <div className="text-sm">
            <span className="text-latte">Buildings: </span>
            <span className="text-espresso font-bold">{buildings.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-latte">Price range: </span>
            <span className="text-espresso font-bold">
              ฿{minPrice.toLocaleString()} – ฿{maxPrice.toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>

      <AreaListingClient buildings={buildings} allFacilities={allFacilities} />
    </>
  );
}
