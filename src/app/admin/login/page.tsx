import { neonAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "התחברות למערכת ניהול",
  description: "התחברות למערכת ניהול מחשבון ממוצע בגרות",
};

export default async function AdminLoginPage() {
  const { user } = await neonAuth();

  // If already logged in, redirect to admin dashboard
  if (user) {
    redirect("/admin");
  }

  return (
    <div
      dir="rtl"
      lang="he"
      className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center p-4"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-1">מערכת ניהול</h1>
        <p className="text-sm text-slate-500">מחשבון ממוצע בגרות</p>
      </div>

      {/* Neon Auth Sign-In UI */}
      <div className="w-full max-w-sm" dir="ltr">
        <LoginClient />
      </div>

      {/* Footer info */}
      <p className="mt-6 text-xs text-slate-400 text-center">
        רק מנהלים מורשים יכולים להיכנס למערכת.
        <br />
        פנה למנהל המערכת לקבלת הרשאות.
      </p>
    </div>
  );
}
