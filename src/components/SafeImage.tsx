"use client";

import { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export default function SafeImage({ src, alt, fill, width, height, sizes, priority, className }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`bg-sand flex items-center justify-center text-latte text-sm ${fill ? "absolute inset-0" : ""}`}
        style={!fill ? { width, height } : undefined}
      >
        📸
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
      onError={() => setError(true)}
    />
  );
}
