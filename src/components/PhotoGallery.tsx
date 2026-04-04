"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface PhotoGalleryProps {
  photos: string[];
  basePath: string;
  alt: string;
}

function GalleryImage({ src, alt, sizes, priority, className }: {
  src: string; alt: string; sizes: string; priority?: boolean; className?: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return <div className="w-full h-full bg-sand flex items-center justify-center text-latte text-sm">No photo</div>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className || ""}`}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onError={() => setError(true)}
    />
  );
}

export default function PhotoGallery({ photos, basePath, alt }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setDirection(null);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setDirection(null);
  }, []);

  const goNext = useCallback(() => {
    if (isAnimating || photos.length <= 1) return;
    setDirection("left");
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % photos.length);
      setDirection("right");
      setTimeout(() => {
        setDirection(null);
        setIsAnimating(false);
      }, 20);
    }, 150);
  }, [isAnimating, photos.length]);

  const goPrev = useCallback(() => {
    if (isAnimating || photos.length <= 1) return;
    setDirection("right");
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
      setDirection("left");
      setTimeout(() => {
        setDirection(null);
        setIsAnimating(false);
      }, 20);
    }, 150);
  }, [isAnimating, photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "Escape":
          e.preventDefault();
          closeLightbox();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goNext, goPrev, closeLightbox]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [lightboxOpen]);

  // Focus trap
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      lightboxRef.current.focus();
    }
  }, [lightboxOpen]);

  // Touch / swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  // Preload adjacent images
  const preloadIndices = lightboxOpen
    ? [(activeIndex + 1) % photos.length, (activeIndex - 1 + photos.length) % photos.length]
    : [];

  if (photos.length === 0) {
    return (
      <div className="bg-sand h-[240px] md:h-[300px] rounded-[14px] flex items-center justify-center text-latte">
        No photos yet
      </div>
    );
  }

  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 3);

  // Slide animation classes
  const getSlideClass = () => {
    if (!direction) return "opacity-100 translate-x-0";
    if (direction === "left") return "opacity-0 -translate-x-8";
    if (direction === "right") return "opacity-0 translate-x-8";
    return "";
  };

  return (
    <>
      {/* Desktop: grid layout */}
      <div className="hidden md:grid grid-cols-[1.6fr_1fr] gap-1 rounded-[14px] overflow-hidden h-[340px]">
        <button
          onClick={() => openLightbox(0)}
          className="relative overflow-hidden group cursor-pointer"
        >
          <GalleryImage
            src={`${basePath}/${mainPhoto}`}
            alt={`${alt} — main photo`}
            sizes="60vw"
            priority
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </button>
        <div className="grid grid-rows-2 gap-1">
          {sidePhotos.map((photo, i) => (
            <button
              key={photo}
              onClick={() => openLightbox(i + 1)}
              className="relative overflow-hidden group cursor-pointer"
            >
              <GalleryImage
                src={`${basePath}/${photo}`}
                alt={`${alt} — photo ${i + 2}`}
                sizes="25vw"
                className="group-hover:scale-105 transition-transform duration-300"
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
              No photo
            </div>
          )}
        </div>
      </div>

      {/* Mobile: single hero image + "View all photos" */}
      <div className="md:hidden">
        <button
          onClick={() => openLightbox(0)}
          className="relative w-full h-[240px] overflow-hidden rounded-[14px]"
        >
          <GalleryImage
            src={`${basePath}/${mainPhoto}`}
            alt={`${alt} — main photo`}
            sizes="100vw"
            priority
          />
        </button>
        {photos.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="mt-2 w-full text-center text-sm font-semibold text-terracotta hover:underline py-2"
          >
            View all {photos.length} photos
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          ref={lightboxRef}
          tabIndex={-1}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center outline-none select-none"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white text-xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            onClick={closeLightbox}
            aria-label="Close gallery"
          >
            ✕
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">
            {activeIndex + 1} / {photos.length}
          </div>

          {/* Previous button */}
          {photos.length > 1 && (
            <button
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Main image with slide animation */}
          <div
            className={`relative w-[92vw] h-[75vh] md:w-[85vw] md:h-[80vh] transition-all duration-150 ease-out ${getSlideClass()}`}
            onClick={(e) => e.stopPropagation()}
          >
            <GalleryImage
              src={`${basePath}/${photos[activeIndex]}`}
              alt={`${alt} — photo ${activeIndex + 1}`}
              sizes="90vw"
              className="object-contain !object-center"
            />
          </div>

          {/* Next button */}
          {photos.length > 1 && (
            <button
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto py-1 px-2 rounded-lg bg-black/40 z-10">
              {photos.map((photo, i) => (
                <button
                  key={`thumb-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (i !== activeIndex) {
                      setDirection(i > activeIndex ? "left" : "right");
                      setIsAnimating(true);
                      setTimeout(() => {
                        setActiveIndex(i);
                        setDirection(i > activeIndex ? "right" : "left");
                        setTimeout(() => {
                          setDirection(null);
                          setIsAnimating(false);
                        }, 20);
                      }, 150);
                    }
                  }}
                  className={`relative w-12 h-9 md:w-14 md:h-10 rounded overflow-hidden flex-shrink-0 transition-all duration-200 ${
                    i === activeIndex
                      ? "ring-2 ring-white opacity-100 scale-105"
                      : "opacity-50 hover:opacity-80"
                  }`}
                  aria-label={`View photo ${i + 1}`}
                >
                  <GalleryImage
                    src={`${basePath}/${photo}`}
                    alt=""
                    sizes="60px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Preload adjacent images */}
          {preloadIndices.map((i) => (
            <link
              key={`preload-${i}`}
              rel="preload"
              as="image"
              href={`${basePath}/${photos[i]}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
