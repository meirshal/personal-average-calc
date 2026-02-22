import { requireAdmin } from "@/lib/admin-auth";
import CategoriesClient from "@/components/admin/CategoriesClient";

export default async function CategoriesPage() {
  // Just verify auth, the client component will fetch data
  await requireAdmin();

  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          ניהול קטגוריות
        </h1>
        <p className="text-sm text-slate-500">
          הוספה, עריכה ומחיקה של קטגוריות מקצועות
        </p>
      </div>

      <CategoriesClient />
    </div>
  );
}
