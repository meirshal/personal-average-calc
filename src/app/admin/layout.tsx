import { neonAuth } from "@/lib/auth/server";
import { getAdminSchool } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const metadata: Metadata = {
  title: "מערכת ניהול - מחשבון ממוצע בגרות",
  description: "מערכת ניהול מקצועות ומשקלות למחשבון ממוצע בגרות",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await neonAuth();

  // No session -- middleware should redirect, but just in case
  if (!user) {
    redirect("/admin/login");
  }

  // Check admin status
  const adminSchool = await getAdminSchool(user.email);

  if (!adminSchool) {
    return (
      <div dir="rtl" lang="he" className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            אין הרשאת גישה
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            החשבון <span className="font-medium text-slate-700">{user.email}</span> אינו
            מורשה כמנהל במערכת.
          </p>
          <p className="text-xs text-slate-400 mb-6">
            פנה למנהל המערכת כדי לקבל הרשאות גישה.
          </p>
          <SignOutButton
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200
              text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            התנתק ונסה חשבון אחר
          </SignOutButton>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" lang="he" className="min-h-dvh bg-slate-50">
      {/* Admin Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Right side: School name + nav links */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-slate-800 font-semibold text-sm hover:text-blue-600 transition-colors"
            >
              <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                {adminSchool.school.name.charAt(0)}
              </span>
              <span className="hidden sm:inline">{adminSchool.school.name}</span>
            </Link>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-1">
              <Link
                href="/admin"
                className="text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors"
              >
                לוח בקרה
              </Link>
              <Link
                href="/admin/categories"
                className="text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors"
              >
                קטגוריות
              </Link>
              <Link
                href="/admin/subjects"
                className="text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors"
              >
                מקצועות
              </Link>
            </div>
          </div>

          {/* Left side: User info + logout */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              {user.email}
            </span>
            <SignOutButton
              className="text-xs text-slate-500 hover:text-red-600 hover:bg-red-50
                px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              התנתק
            </SignOutButton>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
