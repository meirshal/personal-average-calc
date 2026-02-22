import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מחשבון ממוצע בגרות",
  description: "מחשבון ממוצע בגרות משוקלל - בחר את בית הספר שלך",
};

export default function Home() {
  // For now, show a single default school.
  // In the future, this will fetch available schools from the database.
  const schools = [
    {
      slug: "default",
      name: 'משחוק מצויינות מנכ"ל תשפ"ו',
    },
  ];

  return (
    <div dir="rtl" lang="he" className="min-h-dvh bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12 px-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          מחשבון ממוצע בגרות
        </h1>
        <p className="text-sm sm:text-base opacity-80">
          בחר את בית הספר שלך כדי להתחיל
        </p>
      </header>

      {/* School List */}
      <main className="p-4 max-w-[600px] mx-auto mt-6">
        <div className="space-y-3">
          {schools.map((school) => (
            <Link
              key={school.slug}
              href={`/school/${school.slug}`}
              className="block bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]
                border border-slate-100 transition-all duration-200
                hover:border-blue-300 hover:shadow-md active:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-800 mb-1">
                    {school.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    לחץ כדי לפתוח את המחשבון
                  </p>
                </div>
                <div className="shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600 rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            בית ספר לא מופיע? פנה למנהל המערכת להוספת בית הספר שלך.
          </p>
        </div>
      </main>
    </div>
  );
}
