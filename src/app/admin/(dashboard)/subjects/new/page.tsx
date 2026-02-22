import { requireAdmin } from "@/lib/admin-auth";
import NewSubjectClient from "@/components/admin/NewSubjectClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NewSubjectPage() {
  await requireAdmin();

  return (
    <div className="py-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Button variant="ghost" size="sm" asChild className="h-auto px-1 py-0.5 text-slate-500 hover:text-blue-600">
            <Link href="/admin/subjects">
              מקצועות
            </Link>
          </Button>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-slate-700">מקצוע חדש</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          הוסף מקצוע חדש
        </h1>
        <p className="text-sm text-slate-500">
          הגדר את פרטי המקצוע, מרכיבי הציון והמשקלות
        </p>
      </div>

      <NewSubjectClient />
    </div>
  );
}
