import { neonAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
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
      className="min-h-dvh bg-slate-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-1">
              מערכת ניהול
            </h1>
            <p className="text-sm text-slate-500">מחשבון ממוצע בגרות</p>
          </div>

          {/* Neon Auth Sign-In UI */}
          <LoginClient />

          {/* Footer info */}
          <p className="mt-6 text-xs text-slate-400 text-center">
            רק מנהלים מורשים יכולים להיכנס למערכת.
            <br />
            פנה למנהל המערכת לקבלת הרשאות.
          </p>
        </div>
      </div>
    </div>
  );
}
