import type { Metadata } from "next";
import { getSchoolConfig } from "@/lib/school-config";
import { DEFAULT_SCHOOL_CONFIG } from "@/lib/default-config";
import Calculator from "@/components/calculator/Calculator";

interface SchoolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: SchoolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = (await getSchoolConfig(slug)) || DEFAULT_SCHOOL_CONFIG;

  return {
    title: `מחשבון ממוצע בגרות - ${config.name}`,
    description: `מחשבון ממוצע בגרות משוקלל עבור ${config.name}`,
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { slug } = await params;
  const config = (await getSchoolConfig(slug)) || DEFAULT_SCHOOL_CONFIG;

  return (
    <div dir="rtl" lang="he">
      <Calculator config={config} />
    </div>
  );
}
