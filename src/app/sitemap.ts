import { MetadataRoute } from "next";
import { getAllBuildings, getAllGuides } from "@/lib/content";

export const dynamic = "force-static";

const BASE_URL = "https://cnxcribs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const buildings = getAllBuildings();
  const guides = getAllGuides();

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/nimman`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/old-city`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/playbook`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/guide`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const buildingPages = buildings.map((b) => ({
    url: `${BASE_URL}/${b.area}/${b.slug}`,
    lastModified: new Date(b.last_verified),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guidePages = guides.map((g) => ({
    url: `${BASE_URL}/guide/${g.category}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...buildingPages, ...guidePages];
}
