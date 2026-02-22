"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SubjectForm, { type SubjectFormData } from "./SubjectForm";

interface CategoryOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

const emptyFormData: SubjectFormData = {
  name: "",
  units: 0,
  categoryId: "",
  hasLevels: false,
  dependsOnId: null,
  depLabel: null,
  depWeight: null,
  sortOrder: 0,
  levels: [],
  components: [],
};

export default function NewSubjectClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([]);

  const fetchData = useCallback(async () => {
    try {
      // Fetch categories
      const catRes = await fetch("/api/admin/categories");
      if (!catRes.ok) throw new Error("שגיאה בטעינת קטגוריות");
      const catData = await catRes.json();
      setCategories(
        catData.map((c: { id: string; name: string }) => ({
          id: c.id,
          name: c.name,
        }))
      );

      // Fetch subjects for dependency picker
      const subjRes = await fetch("/api/admin/subjects");
      if (!subjRes.ok) throw new Error("שגיאה בטעינת מקצועות");
      const subjData = await subjRes.json();
      setAllSubjects(
        (subjData.subjects || []).map((s: { id: string; name: string }) => ({
          id: s.id,
          name: s.name,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: SubjectFormData) => {
    const res = await fetch("/api/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "שגיאה ביצירת מקצוע");
    }

    const created = await res.json();
    router.push(`/admin/subjects/${created.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <SubjectForm
      initialData={emptyFormData}
      categories={categories}
      allSubjects={allSubjects}
      onSubmit={handleSubmit}
      submitLabel="צור מקצוע"
      isNew
    />
  );
}
