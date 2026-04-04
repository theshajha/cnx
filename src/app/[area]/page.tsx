import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ area: string }>;
}

export function generateStaticParams() {
  return [{ area: "nimman" }, { area: "old-city" }];
}

export default async function OldAreaPage({ params }: Props) {
  const { area } = await params;
  redirect(`/cribs/${area}`);
}
