import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { subjects, categories } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import SeedButton from "@/components/admin/SeedButton";

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
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">בית ספר</p>
              <p className="text-base font-semibold text-slate-800">
                {adminSchool.school.name}
              </p>
            </div>
          </div>
        </div>

        {/* Category Count */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">קטגוריות</p>
              <p className="text-base font-semibold text-slate-800">
                {totalCategories}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Count */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">מקצועות</p>
              <p className="text-base font-semibold text-slate-800">
                {totalSubjects}
              </p>
            </div>
          </div>
        </div>

        {/* Calculator Link */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.03a4.5 4.5 0 010 6.364L10.5 20.25a4.5 4.5 0 01-6.364-6.364l4.5-4.5a4.5 4.5 0 017.244 1.242z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">קישור למחשבון</p>
              <Link
                href={calculatorUrl}
                target="_blank"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                פתח את המחשבון
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Seed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Seed Default Subjects */}
        {totalSubjects === 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-800 mb-1">
                  התחל עם מקצועות ברירת מחדל
                </h3>
                <p className="text-sm text-slate-600">
                  הוסף את 30 מקצועות הבגרות הסטנדרטיים עם כל המרכיבים והמשקלות.
                  ניתן לערוך אותם לאחר מכן.
                </p>
              </div>
              <SeedButton />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            פעולות מהירות
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200
                hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="w-9 h-9 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                <svg
                  className="w-4.5 h-4.5 text-slate-500 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
                </svg>
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
                <svg
                  className="w-4.5 h-4.5 text-slate-500 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
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
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            מידע
          </h2>
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
        </div>
      </div>
    </div>
  );
}
