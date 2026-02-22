"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ConfirmDialog from "./ConfirmDialog";

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
  components: Component[];
}

interface Subject {
  id: string;
  name: string;
  units: number;
  hasLevels: boolean;
  categoryId: string;
  sortOrder: number;
  levels: Level[];
  components: Component[];
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  subjects: Subject[];
}

export default function SubjectsClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subjects");
      if (!res.ok) throw new Error("שגיאה בטעינת מקצועות");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/subjects/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה במחיקה");
      }

      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getComponentCount = (subject: Subject): number => {
    if (subject.hasLevels) {
      return subject.levels.reduce(
        (acc, lvl) => acc + lvl.components.length,
        0
      );
    }
    return subject.components.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">טוען...</div>
      </div>
    );
  }

  const totalSubjects = categories.reduce(
    (acc, cat) => acc + cat.subjects.length,
    0
  );

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="mr-2 text-red-500 hover:text-red-700 cursor-pointer"
          >
            x
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {totalSubjects} מקצועות ב-{categories.length} קטגוריות
        </p>
        <Link
          href="/admin/subjects/new"
          className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600
            hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          הוסף מקצוע
        </Link>
      </div>

      {/* Categories with subjects */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-8 text-center text-sm text-slate-500">
          אין קטגוריות. צור קטגוריות תחילה ואז הוסף מקצועות.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span className="text-lg">{cat.icon || "-"}</span>
                <h3 className="text-sm font-semibold text-slate-700">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-400">
                  ({cat.subjects.length} מקצועות)
                </span>
              </div>

              {cat.subjects.length === 0 ? (
                <div className="px-5 py-4 text-center text-xs text-slate-400">
                  אין מקצועות בקטגוריה זו
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cat.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/subjects/${subject.id}`}
                          className="text-sm font-medium text-slate-800 hover:text-blue-600 transition-colors"
                        >
                          {subject.name}
                        </Link>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-slate-400">
                            {subject.hasLevels
                              ? `${subject.levels.length} רמות`
                              : `${subject.units} יח"ל`}
                          </span>
                          <span className="text-xs text-slate-400">
                            {getComponentCount(subject)} מרכיבים
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          href={`/admin/subjects/${subject.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50
                            rounded-md transition-colors"
                          title="ערוך"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(subject)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50
                            rounded-md transition-colors cursor-pointer"
                          title="מחק"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="מחיקת מקצוע"
        message={
          deleteTarget
            ? `האם למחוק את המקצוע "${deleteTarget.name}"? פעולה זו תמחק את כל המרכיבים, הרמות והתלויות.`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
