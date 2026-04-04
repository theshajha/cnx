/** Display labels for `GuideSpot.area` in guide cards and chips. */

const GUIDE_AREA_LABELS: Record<string, string> = {
  nimman: "Nimman",
  "old-city": "Old City",
  santitham: "Santitham",
  "nong-hoi": "Nong Hoi",
  "jed-yod": "Jed Yod",
  "chang-phueak": "Chang Phueak",
  hangdong: "Hang Dong",
  riverside: "Riverside",
  airport: "Airport area",
  "chang-khlan": "Chang Khlan",
  "fa-ham": "Fa Ham",
  "san-sai": "San Sai",
  "loi-kroh": "Loi Kroh",
  "super-highway": "Super Highway",
};

export function guideSpotAreaLabel(area: string): string {
  if (GUIDE_AREA_LABELS[area]) return GUIDE_AREA_LABELS[area];
  return area
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
