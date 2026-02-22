import { NextRequest, NextResponse } from "next/server";
import { getSchoolConfig } from "@/lib/school-config";

/**
 * GET /api/schools/[slug]/config
 *
 * Returns the full school configuration for the calculator.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const config = await getSchoolConfig(slug);

    if (!config) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

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
