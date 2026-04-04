import { redirect } from "next/navigation";
import { getAllBuildings } from "@/lib/content";

interface Props {
  params: Promise<{ area: string; slug: string }>;
}

export function generateStaticParams() {
  const buildings = getAllBuildings();
  return buildings.map((b) => ({ area: b.area, slug: b.slug }));
}

export default async function OldBuildingPage({ params }: Props) {
  const { area, slug } = await params;
  redirect(`/cribs/${area}/${slug}`);
}
