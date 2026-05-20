"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SubjectForm, { type SubjectFormData } from "./SubjectForm";
import { useSubject, useUpdateSubject } from "@/hooks/useAdminQueries";

interface SubjectEditorClientProps {
  subjectId: string;
}

export default function SubjectEditorClient({
  subjectId,
}: SubjectEditorClientProps) {
  const router = useRouter();
  const subjectQuery = useSubject(subjectId);
  const updateSubject = useUpdateSubject();

  const formData = useMemo<SubjectFormData | null>(() => {
    if (!subjectQuery.data) return null;
    const s = subjectQuery.data.subject;
    return {
      name: s.name,
      units: s.units,
      categoryId: s.categoryId,
      hasLevels: s.hasLevels,
      dependsOnId: s.dependsOnId,
      depLabel: s.depLabel,
      depWeight: s.depWeight,
      sortOrder: s.sortOrder,
      levels: s.levels.map((l) => ({
        id: l.id,
        label: l.label,
        units: l.units,
        sortOrder: l.sortOrder,
        components: l.components.map((c) => ({
          id: c.id,
          name: c.name,
          weight: c.weight,
          sortOrder: c.sortOrder,
        })),
      })),
      components: s.components.map((c) => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
        sortOrder: c.sortOrder,
      })),
    };
  }, [subjectQuery.data]);

  const categories = subjectQuery.data?.categories ?? [];
  const allSubjects = subjectQuery.data?.allSubjects ?? [];

  const handleSubmit = async (data: SubjectFormData) => {
    await updateSubject.mutateAsync({ id: subjectId, ...data });
    router.refresh();
  };

  if (subjectQuery.isPending) {
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

  if (subjectQuery.error || !formData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>
          {subjectQuery.error?.message || "מקצוע לא נמצא"}
        </AlertDescription>
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
