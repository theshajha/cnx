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
      href={`/guide/${guide.category}`}
      className="block bg-milk rounded-[14px] border border-sand p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="text-[10px] text-latte uppercase tracking-[1.5px] font-semibold mb-2">{pillarTitle}</div>
      <div className="text-3xl mb-3">{guide.icon}</div>
      <h3 className="font-serif font-bold text-lg text-espresso">{guide.name}</h3>
      <p className="text-sm text-latte mt-2 leading-relaxed">{guide.description}</p>
      <div className="mt-3 text-xs text-terracotta font-semibold">
        {spotLabel} →
      </div>
    </Link>
  );
}
