import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBuildingsByArea, getUniqueAreas, getAreaMetadata, getAllAreaMetadata } from "@/lib/content";
import { areaMetadata } from "@/lib/seo";
import CribsListingClient from "../CribsListingClient";

interface Props {
  params: Promise<{ area: string }>;
}

export function generateStaticParams() {
  const areas = getUniqueAreas();
  return areas.map((area) => ({ area }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  const buildings = getBuildingsByArea(area);
  if (buildings.length === 0) return {};
  return areaMetadata(area, buildings.length);
}

export default async function AreaCribsPage({ params }: Props) {
  const { area } = await params;
  const buildings = getBuildingsByArea(area);
  if (buildings.length === 0) notFound();

  const areaInfo = getAreaMetadata(area);
  const allAreas = getAllAreaMetadata();

  const minPrice = Math.min(...buildings.map((b) => b.price_range[0]));
  const maxPrice = Math.max(...buildings.map((b) => b.price_range[1]));

  return (
    <>
      <div className="mb-10 pt-8 md:pt-12 pb-0">
        <h1 className="font-serif font-bold text-[36px] md:text-[48px] text-espresso tracking-tight leading-tight">
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

      <CribsListingClient buildings={buildings} areas={allAreas} activeArea={area} />
    </>
  );
}
