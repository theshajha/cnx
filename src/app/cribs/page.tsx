import { Metadata } from "next";
import { getAllBuildings, getAllAreaMetadata } from "@/lib/content";
import { cribsMetadata } from "@/lib/seo";
import { freshnessOf } from "@/lib/freshness";
import { entryPrice } from "@/lib/metrics";
import CribsListingClient from "./CribsListingClient";

export async function generateMetadata(): Promise<Metadata> {
  const buildings = getAllBuildings();
  return cribsMetadata(buildings.length);
}

export default function CribsPage() {
  const buildings = getAllBuildings();
  const areas = getAllAreaMetadata();
  const cheapest = Math.min(...buildings.map(entryPrice));

  // State the real sweep date rather than a standing "updated weekly" claim.
  const newest = buildings
    .map((b) => b.last_verified)
    .sort()
    .at(-1)!;
  const swept = freshnessOf(newest);

  return (
    <>
      <header className="pt-8 md:pt-12 pb-6">
        <h1 className="font-display font-bold text-[38px] md:text-[52px] text-espresso tracking-tight leading-[1.05]">
          Every building we&rsquo;d live in
        </h1>
        <p className="text-dark-roast text-[15px] md:text-base mt-3 max-w-2xl leading-relaxed">
          {buildings.length} long-stay buildings across {areas.length}{" "}
          neighbourhoods, checked in person. Sorted so the ones worth the money come first &mdash;
          nobody pays for placement here.
        </p>
        <p className="text-[12px] text-latte mt-3">
          From{" "}
          <span className="tnum font-semibold text-dark-roast">฿{cheapest.toLocaleString()}</span>
          /mo · Last full sweep{" "}
          <span className="font-semibold text-dark-roast">
            {swept.label.replace(/^(Verified|Checked|Last checked) /, "")}
          </span>
        </p>
      </header>

      <CribsListingClient buildings={buildings} areas={areas} />
    </>
  );
}
