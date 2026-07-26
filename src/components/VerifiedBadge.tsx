import { freshnessOf } from "@/lib/freshness";

interface VerifiedBadgeProps {
  date: string;
  variant?: "light" | "dark";
}

/**
 * Degrades with age rather than asserting "verified" forever. A listing checked
 * four months ago says so, and stops using the checkmark.
 */
export default function VerifiedBadge({ date, variant = "dark" }: VerifiedBadgeProps) {
  const { tier, label } = freshnessOf(date);
  const mark = tier === "fresh" ? "✓ " : "";

  if (variant === "light") {
    return (
      <span className="bg-white/15 text-sand px-3.5 py-1.5 rounded-lg text-xs font-medium">
        {mark}
        {label}
      </span>
    );
  }

  const tone =
    tier === "fresh"
      ? "bg-verified/12 text-verified"
      : tier === "aging"
        ? "bg-sand/70 text-dark-roast"
        : "bg-sand/70 text-latte";

  return (
    <span className={`${tone} px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap`}>
      {mark}
      {label}
    </span>
  );
}
