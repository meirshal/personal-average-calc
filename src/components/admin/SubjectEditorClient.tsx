"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SubjectForm, { type SubjectFormData } from "./SubjectForm";

interface SubjectEditorClientProps {
  subjectId: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

export default function SubjectEditorClient({
  subjectId,
}: SubjectEditorClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubjectFormData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([]);

  const fetchSubject = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/subjects/${subjectId}`);
      if (!res.ok) throw new Error("שגיאה בטעינת מקצוע");
      const data = await res.json();

      setFormData({
        name: data.subject.name,
        units: data.subject.units,
        categoryId: data.subject.categoryId,
        hasLevels: data.subject.hasLevels,
        dependsOnId: data.subject.dependsOnId,
        depLabel: data.subject.depLabel,
        depWeight: data.subject.depWeight,
        sortOrder: data.subject.sortOrder,
        levels: data.subject.levels.map(
          (l: { id: string; label: string; units: number; sortOrder: number; components: { id: string; name: string; weight: number; sortOrder: number }[] }) => ({
            id: l.id,
            label: l.label,
            units: l.units,
            sortOrder: l.sortOrder,
            components: l.components.map(
              (c: { id: string; name: string; weight: number; sortOrder: number }) => ({
                id: c.id,
                name: c.name,
                weight: c.weight,
                sortOrder: c.sortOrder,
              })
            ),
          })
        ),
        components: data.subject.components.map(
          (c: { id: string; name: string; weight: number; sortOrder: number }) => ({
            id: c.id,
            name: c.name,
            weight: c.weight,
            sortOrder: c.sortOrder,
          })
        ),
      });
      setCategories(data.categories);
      setAllSubjects(data.allSubjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  const handleSubmit = async (data: SubjectFormData) => {
    const res = await fetch(`/api/admin/subjects/${subjectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "שגיאה בשמירה");
    }

    router.refresh();
  };

  if (loading) {
    return (
      <div className="space-y-6 py-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !formData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>{error || "מקצוע לא נמצא"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <SubjectForm
      initialData={formData}
      categories={categories}
      allSubjects={allSubjects}
      onSubmit={handleSubmit}
      submitLabel="שמור שינויים"
    />
  );
}
