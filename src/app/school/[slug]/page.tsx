import type { Metadata } from "next";
import { DEFAULT_SCHOOL_CONFIG } from "@/lib/default-config";
import Calculator from "@/components/calculator/Calculator";

interface SchoolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: SchoolPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Try to get school config; for now just use default
  const config =
    slug === "default" || slug === DEFAULT_SCHOOL_CONFIG.slug
      ? DEFAULT_SCHOOL_CONFIG
      : { ...DEFAULT_SCHOOL_CONFIG, slug };

  return {
    title: `מחשבון ממוצע בגרות - ${config.name}`,
    description: `מחשבון ממוצע בגרות משוקלל עבור ${config.name}`,
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { slug } = await params;

  // Try to fetch from API, fall back to default config
  let config = DEFAULT_SCHOOL_CONFIG;

  // If the slug matches or is "default", use the default config directly
  // In the future, this will fetch from the DB via the API route
  if (slug !== "default" && slug !== DEFAULT_SCHOOL_CONFIG.slug) {
    // For now, just use default config with the slug overridden
    config = { ...DEFAULT_SCHOOL_CONFIG, slug };
  }

  return (
    <div dir="rtl" lang="he">
      <Calculator config={config} />
    </div>
  );
}
