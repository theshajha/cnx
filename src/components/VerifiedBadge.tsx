interface VerifiedBadgeProps {
  date: string;
  variant?: "light" | "dark";
}

export default function VerifiedBadge({ date, variant = "dark" }: VerifiedBadgeProps) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (variant === "light") {
    return (
      <span className="bg-white/15 text-sand px-3.5 py-1.5 rounded-lg text-xs font-medium">
        ✓ Verified {formatted}
      </span>
    );
  }

  return (
    <span className="bg-sand/60 text-dark-roast px-3 py-1 rounded text-[11px] font-semibold">
      ✓ Verified {formatted}
    </span>
  );
}
