interface LocationCardProps {
  coordinates: [number, number];
  address: string;
}

export default function LocationCard({ coordinates, address }: LocationCardProps) {
  const mapsUrl = `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`;

  return (
    <div className="bg-milk rounded-[14px] p-6 border border-sand">
      <h3 className="font-serif font-bold text-[17px] text-espresso mb-3">Location</h3>
      <div className="bg-sand h-[120px] rounded-[10px] flex items-center justify-center text-latte text-sm mb-3 overflow-hidden">
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d${coordinates[1]}!3d${coordinates[0]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sth`}
          className="w-full h-full rounded-[10px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location map"
        />
      </div>
      <p className="text-sm text-dark-roast leading-relaxed">{address}</p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block bg-cream text-dark-roast py-2.5 px-4 rounded-lg text-sm font-semibold text-center hover:bg-sand transition-colors"
      >
        Open in Google Maps ↗
      </a>
    </div>
  );
}
