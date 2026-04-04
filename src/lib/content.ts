import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Building, GuideCategory, Guide, Contributor, AreaSlug } from "./types";
import { guidePillarSortIndex } from "./guide-pillars";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getAllBuildings(): Building[] {
  const areas: AreaSlug[] = ["nimman", "old-city"];
  const buildings: Building[] = [];

  for (const area of areas) {
    const areaDir = path.join(CONTENT_DIR, "buildings", area);
    if (!fs.existsSync(areaDir)) continue;

    const files = fs.readdirSync(areaDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(areaDir, file), "utf-8");
      const { data, content } = matter(raw);
      buildings.push({ ...data, content } as Building);
    }
  }

  return buildings;
}

export function getBuildingsByArea(area: AreaSlug): Building[] {
  return getAllBuildings().filter((b) => b.area === area);
}

export function getBuildingBySlug(area: string, slug: string): Building | undefined {
  return getAllBuildings().find((b) => b.area === area && b.slug === slug);
}

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
