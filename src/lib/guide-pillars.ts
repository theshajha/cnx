/** Pillar slugs must match `pillar` in `content/guides/*.md` frontmatter. Order = sections on /guide. */

export const GUIDE_PILLAR_SEQUENCE = [
  "work",
  "daily-life",
  "wellness",
  "health",
  "family",
  "professional",
  "explore",
] as const;

export type GuidePillarSlug = (typeof GUIDE_PILLAR_SEQUENCE)[number];

const PILLAR_TITLES: Record<GuidePillarSlug, string> = {
  work: "Work & connect",
  "daily-life": "Daily life",
  wellness: "Wellness",
  health: "Health",
  family: "Family & learning",
  professional: "Visas, legal & pros",
  explore: "Eat, drink & explore",
};

export function guidePillarTitle(slug: string): string {
  if ((GUIDE_PILLAR_SEQUENCE as readonly string[]).includes(slug)) {
    return PILLAR_TITLES[slug as GuidePillarSlug];
  }
  return slug;
}

export function guidePillarSortIndex(slug: string): number {
  const i = (GUIDE_PILLAR_SEQUENCE as readonly string[]).indexOf(slug);
  return i === -1 ? 999 : i;
}
