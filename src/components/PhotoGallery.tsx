"use client";

import { useState } from "react";
import Image from "next/image";

interface PhotoGalleryProps {
  photos: string[];
  basePath: string;
  alt: string;
}

export default function PhotoGallery({ photos, basePath, alt }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="bg-sand h-[260px] rounded-[14px] flex items-center justify-center text-latte">
        No photos yet
      </div>
    );
  }

  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 3);

  return (
    <>
      <div className="grid grid-cols-[1.6fr_1fr] gap-1 rounded-[14px] overflow-hidden h-[260px] md:h-[340px]">
        <button
          onClick={() => { setActiveIndex(0); setLightboxOpen(true); }}
          className="relative overflow-hidden group"
        >
          <Image
            src={`${basePath}/${mainPhoto}`}
            alt={`${alt} — main photo`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        </button>
        <div className="grid grid-rows-2 gap-1">
          {sidePhotos.map((photo, i) => (
            <button
              key={photo}
              onClick={() => { setActiveIndex(i + 1); setLightboxOpen(true); }}
              className="relative overflow-hidden group"
            >
              <Image
                src={`${basePath}/${photo}`}
                alt={`${alt} — photo ${i + 2}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {i === sidePhotos.length - 1 && photos.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    +{photos.length - 3} more
                  </span>
                </div>
              )}
            </button>
          ))}
          {sidePhotos.length < 2 && (
            <div className="bg-sand flex items-center justify-center text-latte text-sm">
              📸
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-2xl font-bold hover:opacity-70"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + photos.length) % photos.length); }}
          >
            ‹
          </button>
          <div className="relative w-[90vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={`${basePath}/${photos[activeIndex]}`}
              alt={`${alt} — photo ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % photos.length); }}
          >
            ›
          </button>
          <div className="absolute bottom-6 text-white text-sm">
            {activeIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
