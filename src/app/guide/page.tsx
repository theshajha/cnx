import { Metadata } from "next";
import { getAllGuides } from "@/lib/content";
import GuideCard from "@/components/GuideCard";

export const metadata: Metadata = {
  title: "The Expat's Guide to Chiang Mai — CNX Cribs",
  description: "Curated guides to the best coffee shops, co-working spaces, massage spots, and more in Chiang Mai.",
};

export default function GuidePage() {
  const guides = getAllGuides();

  return (
    <div className="pt-4">
      <h1 className="font-serif font-bold text-[40px] text-espresso tracking-tight leading-tight mb-2">
        {"The Expat's Guide to Chiang Mai"}
      </h1>
      <p className="text-latte text-base mb-10 max-w-xl leading-relaxed">
        The places that make daily life here good. Curated, tested, and updated regularly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guides.map((g) => (
          <GuideCard key={g.category} guide={g} />
        ))}
      </div>
    </div>
  );
}
