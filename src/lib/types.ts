export interface Building {
  name: string;
  area: "nimman" | "old-city";
  slug: string;
  address: string;
  type: "condo" | "serviced-condo" | "serviced-apartment" | "apartment";
  coordinates: [number, number];
  price_range: [number, number];
  deposit: number;
  electric_rate: number;
  water_rate: number;
  wifi: "included" | number;
  facilities: string[];
  contact: {
    phone: string | null;
    line: string | null;
    email: string | null;
    website: string | null;
  };
  photos: string[];
  verified: boolean;
  last_verified: string;
  contributed_by: string | null;
  contributor_note: string | null;
  units: Unit[];
  nearby_spots: NearbySpotRef[];
  content: string;
}

export interface Unit {
  type: string;
  sqm: number;
  price_range: [number, number];
  beds: number;
  bathrooms: number;
  features: string[];
  recommended_floor: string;
  recommended_facing: string;
  photos: string[];
}

export interface NearbySpotRef {
  slug: string;
  category: string;
  walk_minutes: number;
}

export interface GuideCategory {
  name: string;
  category: string;
  /** Hub grouping; must match `GUIDE_PILLAR_SEQUENCE` in guide-pillars.ts */
  pillar: string;
  /** Sort order within pillar (ascending) */
  order: number;
  icon: string;
  description: string;
  recommended_by: string | null;
  spots: GuideSpot[];
  content: string;
}

export interface GuideSpot {
  name: string;
  slug: string;
  area: string;
  address: string;
  coordinates: [number, number];
  one_liner: string;
  /** Filename under public/guides/{category}/ — webp, jpg, or png recommended */
  photo: string;
  /** Optional attribution (e.g. "Photo: name" or "© venue name") */
  photo_credit?: string | null;
}

export interface Contributor {
  name: string;
  slug: string;
  role: string;
  bio: string;
  photo: string | null;
  link: string | null;
  twitter: string | null;
  joined: string;
}

export type AreaSlug = "nimman" | "old-city";

export interface AreaInfo {
  slug: AreaSlug;
  name: string;
  description: string;
  photo: string;
}

export const AREAS: Record<AreaSlug, AreaInfo> = {
  nimman: {
    slug: "nimman",
    name: "Nimman",
    description: "The digital nomad heartland. Cafés, co-working, and condos within walking distance of everything.",
    photo: "/areas/nimman.jpg",
  },
  "old-city": {
    slug: "old-city",
    name: "Old City",
    description: "Temples, night markets, and affordable living inside the ancient moat. Quieter pace, rich culture.",
    photo: "/areas/old-city.jpg",
  },
};
