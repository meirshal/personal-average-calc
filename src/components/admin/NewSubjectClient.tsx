"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SubjectForm, { type SubjectFormData } from "./SubjectForm";
import {
  useCategories,
  useSubjects,
  useCreateSubject,
} from "@/hooks/useAdminQueries";

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
  const categoriesQuery = useCategories();
  const subjectsQuery = useSubjects();
  const createSubject = useCreateSubject();

  const categories = useMemo(
    () =>
      (categoriesQuery.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
      })),
    [categoriesQuery.data]
  );

  const allSubjects = useMemo(
    () =>
      (subjectsQuery.data?.subjects ?? []).map((s) => ({
        id: s.id,
        name: s.name,
      })),
    [subjectsQuery.data]
  );

  const handleSubmit = async (data: SubjectFormData) => {
    const result = await createSubject.mutateAsync(
      data as unknown as Record<string, unknown>
    );
    router.push(`/admin/subjects/${result.id}`);
  };

  if (categoriesQuery.isPending || subjectsQuery.isPending) {
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

  const error = categoriesQuery.error || subjectsQuery.error;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <SubjectForm
      initialData={emptyFormData}
      categories={categories}
      allSubjects={allSubjects}
      onSubmit={handleSubmit}
      submitLabel="צור מקצוע"
    />
  );
}
