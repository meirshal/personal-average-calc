import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { subjects, categories } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import SeedButton from "@/components/admin/SeedButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Grid3X3,
  BookOpen,
  ExternalLink,
  Zap,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const adminSchool = await requireAdmin();

  // Count subjects for this school
  const [subjectCount] = await getDb()
    .select({ count: count() })
    .from(subjects)
    .where(eq(subjects.schoolId, adminSchool.schoolId));

  // Count categories for this school
  const [categoryCount] = await getDb()
    .select({ count: count() })
    .from(categories)
    .where(eq(categories.schoolId, adminSchool.schoolId));

  const totalSubjects = subjectCount?.count ?? 0;
  const totalCategories = categoryCount?.count ?? 0;
  const calculatorUrl = `/school/${adminSchool.school.slug}`;

  return (
    <div className="py-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">לוח בקרה</h1>
        <p className="text-sm text-slate-500">
          ניהול מחשבון ממוצע בגרות עבור {adminSchool.school.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* School Name */}
        <Card className="py-0 gap-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">בית ספר</p>
                <p className="text-base font-semibold text-slate-800">
                  {adminSchool.school.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Count */}
        <Card className="py-0 gap-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                <Grid3X3 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">קטגוריות</p>
                <p className="text-base font-semibold text-slate-800">
                  {totalCategories}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Count */}
        <Card className="py-0 gap-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">מקצועות</p>
                <p className="text-base font-semibold text-slate-800">
                  {totalSubjects}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculator Link */}
        <Card className="py-0 gap-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">קישור למחשבון</p>
                <Button variant="link" size="sm" asChild className="h-auto p-0 text-sm">
                  <Link href={calculatorUrl} target="_blank">
                    פתח את המחשבון
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Seed Default Subjects */}
        {totalSubjects === 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 py-0 gap-0 lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-800 mb-1">
                    התחל עם מקצועות ברירת מחדל
                  </h3>
                  <p className="text-sm text-slate-600">
                    הוסף את 29 מקצועות הבגרות הסטנדרטיים עם כל המרכיבים והמשקלות.
                    ניתן לערוך אותם לאחר מכן.
                  </p>
                </div>
                <SeedButton />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="py-0 gap-0">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-base">
              פעולות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="space-y-3">
              <Link
                href="/admin/categories"
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200
                  hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-9 h-9 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                  <Grid3X3 className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                    ניהול קטגוריות
                  </p>
                  <p className="text-xs text-slate-500">
                    הוספה, עריכה ומחיקה של קטגוריות
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/subjects"
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200
                  hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-9 h-9 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                  <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                    ניהול מקצועות
                  </p>
                  <p className="text-xs text-slate-500">
                    הגדרת מקצועות, רמות ומשקלות
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="py-0 gap-0">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-base">
              מידע
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">1.</span>
                <p>ודא שהגדרת את כל <strong>הקטגוריות</strong> הנדרשות.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">2.</span>
                <p>הוסף <strong>מקצועות</strong> לכל קטגוריה עם מרכיבי ציון ומשקלות.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">3.</span>
                <p>ודא שסכום המשקלות בכל מקצוע שווה ל-<strong>1.00</strong>.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">4.</span>
                <p>שלח לתלמידים את <strong>קישור המחשבון</strong> לעיל.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
