import { Metadata } from "next";
import { getAllBuildings, getAllAreaMetadata } from "@/lib/content";
import { cribsMetadata } from "@/lib/seo";
import CribsListingClient from "./CribsListingClient";

export async function generateMetadata(): Promise<Metadata> {
  const buildings = getAllBuildings();
  return cribsMetadata(buildings.length);
}

export default function CribsPage() {
  const buildings = getAllBuildings();
  const areas = getAllAreaMetadata();

  return (
    <>
      <div className="mb-10 pt-8 md:pt-12 pb-0">
        <h1 className="font-serif font-bold text-[36px] md:text-[48px] text-espresso tracking-tight leading-tight">
          All Cribs
        </h1>
        <p className="text-latte text-base mt-2 max-w-xl leading-relaxed">
          {buildings.length} verified monthly rentals across Chiang Mai.
        </p>
      </div>

      <CribsListingClient buildings={buildings} areas={areas} />
    </>
  );
}
