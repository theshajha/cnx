import { Building, GuideCategory } from "./types";
import { Metadata } from "next";

const SITE_NAME = "CNX Cribs";
const SITE_URL = "https://cnxcribs.com";

export function buildingMetadata(building: Building): Metadata {
  const minPrice = building.price_range[0].toLocaleString();
  return {
    title: `${building.name} — Monthly Rental from ฿${minPrice} | ${SITE_NAME}`,
    description: `${building.name} in ${building.area === "nimman" ? "Nimman" : "Old City"}, Chiang Mai. ${building.units.map((u) => u.type).join(" & ")} from ฿${minPrice}/mo. Verified expat reviews, tips, and real pricing.`,
    openGraph: {
      title: `${building.name} — Monthly Rental from ฿${minPrice} | ${SITE_NAME}`,
      description: `Verified monthly rental in Chiang Mai. ${building.units.map((u) => u.type).join(" & ")} from ฿${minPrice}/mo.`,
      images: building.photos[0] ? [`${SITE_URL}/buildings/${building.slug}/${building.photos[0]}`] : [],
    },
  };
}

export function areaMetadata(area: "nimman" | "old-city", buildingCount: number): Metadata {
  const areaName = area === "nimman" ? "Nimman" : "Old City";
  return {
    title: `${areaName} Rentals — Monthly Condos & Apartments | ${SITE_NAME}`,
    description: `${buildingCount} verified monthly rentals in ${areaName}, Chiang Mai. Real prices, expat tips, and honest reviews.`,
  };
}

export function guideMetadata(guide: GuideCategory): Metadata {
  return {
    title: `Best ${guide.name} in Chiang Mai for Expats | ${SITE_NAME}`,
    description: guide.description,
  };
}

export function buildingJsonLd(building: Building) {
  return {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: building.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: building.address,
      addressLocality: "Chiang Mai",
      addressCountry: "TH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: building.coordinates[0],
      longitude: building.coordinates[1],
    },
    priceRange: `฿${building.price_range[0]}–${building.price_range[1]}/month`,
    amenityFeature: building.facilities.map((f) => ({
      "@type": "LocationFeatureSpecification",
      name: f,
      value: true,
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Curated, verified monthly rentals in Chiang Mai. Built by an expat, for expats.",
  };
}
