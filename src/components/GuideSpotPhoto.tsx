import Image from "next/image";

interface GuideSpotPhotoProps {
  category: string;
  photo: string;
  alt: string;
  /** First card on the page — helps LCP */
  priority?: boolean;
  photoCredit?: string | null;
}

/**
 * Fixed 4:3 frame to match guide cards; object-cover keeps photos looking good at any source aspect ratio.
 */
export default function GuideSpotPhoto({
  category,
  photo,
  alt,
  priority = false,
  photoCredit,
}: GuideSpotPhotoProps) {
  const src = `/guides/${category}/${photo}`;
  const isPlaceholder = photo === "guide-placeholder.png";
  const imageAlt = isPlaceholder ? `${alt} — venue photo coming soon` : alt;

  return (
    <div className="w-full md:w-72 shrink-0 flex flex-col bg-sand/30">
      <div className="relative w-full aspect-4/3">
        <Image
          src={src}
          alt={imageAlt}
          fill
          priority={priority}
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 288px"
        />
        {isPlaceholder ? (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-t from-espresso/25 to-transparent"
            aria-hidden
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-espresso/70 bg-milk/90 px-3 py-2 rounded-lg border border-sand shadow-sm">
              Venue photo soon
            </span>
          </div>
        ) : null}
        {!isPlaceholder && photoCredit?.trim() ? (
          <span className="absolute bottom-1.5 left-1.5 text-[9px] leading-tight text-white/90 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
            {photoCredit.trim()}
          </span>
        ) : null}
      </div>
    </div>
  );
}
