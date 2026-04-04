import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { Building, GuideCategory, Guide, Contributor, AreaInfo } from "./types";
import { guidePillarSortIndex } from "./guide-pillars";

const CONTENT_DIR = path.join(process.cwd(), "content");

/* ------------------------------------------------------------------ */
/*  Buildings                                                          */
/* ------------------------------------------------------------------ */

export function getAllBuildings(): Building[] {
  const buildingsDir = path.join(CONTENT_DIR, "buildings");
  if (!fs.existsSync(buildingsDir)) return [];

  const buildings: Building[] = [];

  // Scan all subdirectories under content/buildings/
  const areaDirs = fs.readdirSync(buildingsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const areaDir of areaDirs) {
    const dirPath = path.join(buildingsDir, areaDir);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dirPath, file), "utf-8");
      const { data, content } = matter(raw);
      buildings.push({ ...data, content } as Building);
    }
  }

  return buildings;
}

export function getBuildingsByArea(area: string): Building[] {
  return getAllBuildings().filter((b) => b.area === area);
}

export function getBuildingBySlug(area: string, slug: string): Building | undefined {
  return getAllBuildings().find((b) => b.area === area && b.slug === slug);
}

/* ------------------------------------------------------------------ */
/*  Areas                                                              */
/* ------------------------------------------------------------------ */

export function getUniqueAreas(): string[] {
  const buildings = getAllBuildings();
  return [...new Set(buildings.map((b) => b.area))].sort();
}

export function getAreaMetadata(slug: string): AreaInfo {
  const areasFile = path.join(CONTENT_DIR, "areas.yml");
  if (fs.existsSync(areasFile)) {
    const raw = fs.readFileSync(areasFile, "utf-8");
    const areas = yaml.load(raw) as Record<string, { name: string; description: string; icon?: string }>;
    if (areas[slug]) {
      return {
        slug,
        name: areas[slug].name,
        description: areas[slug].description,
        icon: areas[slug].icon || "",
      };
    }
  }
  // Fallback: title-case the slug
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { slug, name, description: "", icon: "" };
}

export function getAllAreaMetadata(): AreaInfo[] {
  return getUniqueAreas().map(getAreaMetadata);
}

/* ------------------------------------------------------------------ */
/*  Guides                                                             */
/* ------------------------------------------------------------------ */

export function getAllGuides(): GuideCategory[] {
  const guidesDir = path.join(CONTENT_DIR, "guides");
  if (!fs.existsSync(guidesDir)) return [];

  const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith(".md"));
  const guides = files.map((file) => {
    const raw = fs.readFileSync(path.join(guidesDir, file), "utf-8");
    const { data, content } = matter(raw);
    return { ...data, content } as GuideCategory;
  });

  return guides.sort((a, b) => {
    const pa = guidePillarSortIndex(a.pillar);
    const pb = guidePillarSortIndex(b.pillar);
    if (pa !== pb) return pa - pb;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

export function getGuideByCategory(category: string): GuideCategory | undefined {
  return getAllGuides().find((g) => g.category === category);
}

export function getPlaybookContent(): { content: string } {
  const filePath = path.join(CONTENT_DIR, "playbook.md");
  if (!fs.existsSync(filePath)) return { content: "" };
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  return { content };
}

export function getAllArticles(): Guide[] {
  const dir = path.join(CONTENT_DIR, "articles");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);
      return { ...data, content } as Guide;
    })
    .sort(
      (a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime()
    );
}

export function getArticleBySlug(slug: string): Guide | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}

export function getAllContributors(): Contributor[] {
  const filePath = path.join(CONTENT_DIR, "contributors.md");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  return (data.contributors || []) as Contributor[];
}
