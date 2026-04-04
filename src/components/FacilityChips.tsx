const FACILITY_ICONS: Record<string, string> = {
  pool: "🏊",
  gym: "💪",
  parking: "🅿️",
  keycard: "🔑",
  cctv: "📹",
  wifi: "📶",
  laundry: "🧺",
  kitchen: "🍳",
  elevator: "🛗",
  garden: "🌿",
};

interface FacilityChipsProps {
  facilities: string[];
  size?: "sm" | "md";
}

export default function FacilityChips({ facilities, size = "md" }: FacilityChipsProps) {
  const padding = size === "sm" ? "px-2.5 py-1" : "px-4 py-2";
  const text = size === "sm" ? "text-[11px]" : "text-[13px]";

  return (
    <div className="flex gap-2 flex-wrap">
      {facilities.map((f) => (
        <span key={f} className={`bg-sand text-dark-roast ${padding} rounded-full ${text} font-medium`}>
          {FACILITY_ICONS[f] || "•"} {f.charAt(0).toUpperCase() + f.slice(1)}
        </span>
      ))}
    </div>
  );
}
