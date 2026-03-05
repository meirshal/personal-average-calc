import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------
export const adminKeys = {
  categories: ["admin", "categories"] as const,
  subjects: ["admin", "subjects"] as const,
  subject: (id: string) => ["admin", "subjects", id] as const,
};

// ---------------------------------------------------------------------------
// Shared fetch helper – throws on !res.ok with the error from response JSON
// ---------------------------------------------------------------------------
async function adminFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/** GET /api/admin/categories */
export function useCategories() {
  return useQuery({
    queryKey: adminKeys.categories,
    queryFn: () => adminFetch<Category[]>("/api/admin/categories"),
  });
}

/** GET /api/admin/subjects */
export function useSubjects() {
  return useQuery({
    queryKey: adminKeys.subjects,
    queryFn: () =>
      adminFetch<SubjectsResponse>("/api/admin/subjects"),
  });
}

/** GET /api/admin/subjects/[id] */
export function useSubject(id: string) {
  return useQuery({
    queryKey: adminKeys.subject(id),
    queryFn: () =>
      adminFetch<SubjectDetailResponse>(`/api/admin/subjects/${id}`),
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/** POST /api/admin/categories – invalidates categories on success */
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; icon?: string; sortOrder: number }) =>
      adminFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories });
    },
  });
}

/** PUT /api/admin/categories/[id] – invalidates categories on success */
export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      icon?: string;
      sortOrder?: number;
    }) =>
      adminFetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories });
    },
  });
}

/** DELETE /api/admin/categories/[id] – invalidates categories on success */
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/api/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories });
    },
  });
}

/**
 * Reorder two categories by swapping their sortOrder values.
 * Takes two {id, sortOrder} pairs, does 2 PUTs in parallel,
 * then invalidates categories on success.
 */
export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      pairs: [
        { id: string; sortOrder: number },
        { id: string; sortOrder: number },
      ]
    ) =>
      Promise.all(
        pairs.map(({ id, sortOrder }) =>
          adminFetch(`/api/admin/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder }),
          })
        )
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories });
    },
  });
}

/** POST /api/admin/subjects – invalidates subjects on success */
export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminFetch<{ id: string }>("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.subjects });
    },
  });
}

/** PUT /api/admin/subjects/[id] – invalidates subjects + subject(id) on success */
export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      [key: string]: unknown;
    }) =>
      adminFetch(`/api/admin/subjects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: adminKeys.subjects });
      qc.invalidateQueries({ queryKey: adminKeys.subject(variables.id) });
    },
  });
}

/** DELETE /api/admin/subjects/[id] – invalidates subjects on success */
export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/api/admin/subjects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.subjects });
    },
  });
}

/** POST /api/admin/seed – invalidates categories + subjects on success */
export function useSeedSubjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      adminFetch("/api/admin/seed", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories });
      qc.invalidateQueries({ queryKey: adminKeys.subjects });
    },
  });
}

// ---------------------------------------------------------------------------
// Types (matching API response shapes used by existing components)
// ---------------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  subjectCount: number;
}

interface Component {
  id: string;
  name: string;
  weight: number;
  sortOrder: number;
}

interface Level {
  id: string;
  label: string;
  units: number;
  sortOrder: number;
  components: Component[];
}

interface Subject {
  id: string;
  name: string;
  units: number;
  hasLevels: boolean;
  categoryId: string;
  sortOrder: number;
  dependsOnId: string | null;
  depLabel: string | null;
  depWeight: number | null;
  levels: Level[];
  components: Component[];
}

/** GET /api/admin/subjects response shape */
interface SubjectsResponse {
  categories: {
    id: string;
    name: string;
    icon: string | null;
    sortOrder: number;
    subjects: Subject[];
  }[];
  subjects: { id: string; name: string }[];
}

/** GET /api/admin/subjects/[id] response shape */
interface SubjectDetailResponse {
  subject: Subject;
  categories: { id: string; name: string }[];
  allSubjects: { id: string; name: string }[];
}
