import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSchoolConfig } from "@/lib/school-config";
import Calculator from "@/components/calculator/Calculator";

interface SchoolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: SchoolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = await getSchoolConfig(slug);

  if (!config) {
    return {
      title: "בית ספר לא נמצא",
    };
  }

  return {
    title: `מחשבון ממוצע בגרות - ${config.name}`,
    description: `מחשבון ממוצע בגרות משוקלל עבור ${config.name}`,
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { slug } = await params;
  const config = await getSchoolConfig(slug);

  if (!config) {
    notFound();
  }

  return (
    <div dir="rtl" lang="he">
      <Calculator config={config} />
    </div>
  );
}
