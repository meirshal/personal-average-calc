import { neonAuth } from "@/lib/auth/server";
import { getAdminSchool } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldOff, LayoutDashboard, Grid3X3, BookOpen } from "lucide-react";

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
        <Card className="w-full max-w-md p-8 text-center">
          <CardContent className="flex flex-col items-center gap-4 p-0">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldOff className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              אין הרשאת גישה
            </h1>
            <p className="text-sm text-slate-500">
              החשבון <span className="font-medium text-slate-700">{user.email}</span> אינו
              מורשה כמנהל במערכת.
            </p>
            <p className="text-xs text-slate-400">
              פנה למנהל המערכת כדי לקבל הרשאות גישה.
            </p>
            <SignOutButton
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200
                text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              התנתק ונסה חשבון אחר
            </SignOutButton>
          </CardContent>
        </Card>
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

            <Separator orientation="vertical" className="h-5" />

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin" className="text-xs text-slate-600">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  לוח בקרה
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/categories" className="text-xs text-slate-600">
                  <Grid3X3 className="w-3.5 h-3.5" />
                  קטגוריות
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/subjects" className="text-xs text-slate-600">
                  <BookOpen className="w-3.5 h-3.5" />
                  מקצועות
                </Link>
              </Button>
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
