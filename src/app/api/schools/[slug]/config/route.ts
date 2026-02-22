import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SCHOOL_CONFIG } from "@/lib/default-config";

/**
 * GET /api/schools/[slug]/config
 *
 * Returns the full school configuration for the calculator.
 * Currently returns the hardcoded default config as a fallback
 * since we don't have a database running yet.
 *
 * In the future, this will query the database for the school's
 * categories, subjects, levels, and components.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // TODO: Query database for school config
    // For now, return the default config for any slug
    if (slug === "default" || slug === DEFAULT_SCHOOL_CONFIG.slug) {
      return NextResponse.json(DEFAULT_SCHOOL_CONFIG, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    // For any other slug, return default config with the slug overridden
    // This allows the app to work without a database
    const config = {
      ...DEFAULT_SCHOOL_CONFIG,
      slug,
      name: `בית ספר ${slug}`,
    };

    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching school config:", error);
    return NextResponse.json(
      { error: "Failed to fetch school configuration" },
      { status: 500 }
    );
  }
}
