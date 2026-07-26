interface LocationCardProps {
  coordinates: [number, number];
  address: string;
  buildingName: string;
}

/**
 * Location is the biggest factor in a long-stay decision, so the map gets real
 * height instead of the 120px sliver it had. OpenStreetMap needs no API key and
 * paints immediately — the old Google embed used a hand-assembled `pb` string,
 * lazy-loaded, and showed a blank grey box for seconds.
 */
export default function LocationCard({ coordinates, address, buildingName }: LocationCardProps) {
  const [lat, lng] = coordinates;
  const bbox = [lng - 0.0045, lat - 0.003, lng + 0.0045, lat + 0.003].join(",");
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="bg-milk rounded-[14px] border border-sand overflow-hidden">
      <div className="h-[200px] bg-sand">
        <iframe src={embed} className="w-full h-full border-0" title={`Map showing ${buildingName}`} />
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-[15px] text-espresso">Location</h3>
        <p className="text-[13px] text-dark-roast leading-relaxed mt-1">{address}</p>
        <div className="flex gap-2 mt-4">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-cream border border-sand text-dark-roast py-2.5 px-3 rounded-lg text-[12px] font-bold text-center hover:bg-sand transition-colors"
          >
            Google Maps ↗
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-cream border border-sand text-dark-roast py-2.5 px-3 rounded-lg text-[12px] font-bold text-center hover:bg-sand transition-colors"
          >
            Directions ↗
          </a>
        </div>
      </div>
    </div>
  );
}
