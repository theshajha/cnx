import Link from "next/link";
import { GuideCategory } from "@/lib/types";

interface GuideCardProps {
  guide: GuideCategory;
  pillarTitle: string;
}

export default function GuideCard({ guide, pillarTitle }: GuideCardProps) {
  const spotLabel =
    guide.spots.length === 0
      ? "Recommendations coming soon"
      : `${guide.spots.length} spot${guide.spots.length !== 1 ? "s" : ""}`;

  return (
    <Link
      href={`/directory/${guide.category}`}
      className="block bg-milk rounded-2xl border border-sand p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="text-4xl mb-3">{guide.icon}</div>
      <h3 className="font-serif font-bold text-lg text-espresso">{guide.name}</h3>
      <p className="text-sm text-latte mt-2 leading-relaxed line-clamp-2">{guide.description}</p>
      <div className="mt-3 text-xs text-terracotta font-semibold">
        {spotLabel} →
      </div>
    </Link>
  );
}
