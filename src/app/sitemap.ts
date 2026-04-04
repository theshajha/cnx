import { MetadataRoute } from "next";
import { getAllBuildings, getAllGuides, getAllArticles } from "@/lib/content";

export const dynamic = "force-static";

const BASE_URL = "https://cnxcribs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const buildings = getAllBuildings();
  const guides = getAllGuides();
  const articles = getAllArticles();

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/nimman`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/old-city`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/playbook`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/directory`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/guides`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/contributors`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const buildingPages = buildings.map((b) => ({
    url: `${BASE_URL}/${b.area}/${b.slug}`,
    lastModified: new Date(b.last_verified),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guidePages = guides.map((g) => ({
    url: `${BASE_URL}/directory/${g.category}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articlePages = articles.map((a) => ({
    url: `${BASE_URL}/guides/${a.slug}`,
    lastModified: new Date(a.updated),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...buildingPages, ...guidePages, ...articlePages];
}
