import { requireAdmin } from "@/lib/admin-auth";
import SubjectsClient from "@/components/admin/SubjectsClient";

export default async function SubjectsPage() {
  await requireAdmin();

  return (
    <div className="py-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            ניהול מקצועות
          </h1>
          <p className="text-sm text-slate-500">
            הגדרת מקצועות, מרכיבים ומשקלות
          </p>
        </div>
      </div>

      <SubjectsClient />
    </div>
  );
}
