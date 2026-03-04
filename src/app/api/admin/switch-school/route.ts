import { NextResponse } from "next/server";
import { neonAuth } from "@/lib/auth/server";
import { getAdminSchools } from "@/lib/admin-auth";
import { setSelectedSchoolId } from "@/lib/school-selection";
import { z } from "zod";

const switchSchoolSchema = z.object({
  schoolId: z.string().uuid("מזהה בית ספר לא תקין"),
});

// POST: Switch to a different school
export async function POST(request: Request) {
  try {
    const { user } = await neonAuth();

    if (!user?.email) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = switchSchoolSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "נתונים לא תקינים", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { schoolId } = parsed.data;

    // Verify admin has access to this school
    const result = await getAdminSchools(user.email);

    if (!result || result.schools.length === 0) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
    }

    const hasAccess = result.schools.some((s) => s.id === schoolId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "אין גישה לבית ספר זה" },
        { status: 403 }
      );
    }

    await setSelectedSchoolId(schoolId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHENTICATED") {
        return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
      }
      if (error.message === "NOT_ADMIN") {
        return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
