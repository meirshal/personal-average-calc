"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ConfirmDialog from "./ConfirmDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

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
            className="ms-2 text-red-500 hover:text-red-700 cursor-pointer"
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
        <Button asChild>
          <Link href="/admin/subjects/new">
            <Plus className="w-4 h-4" />
            הוסף מקצוע
          </Link>
        </Button>
      </div>

      {/* Categories with subjects */}
      {categories.length === 0 ? (
        <Card className="px-5 py-8 text-center text-sm text-slate-500">
          אין קטגוריות. צור קטגוריות תחילה ואז הוסף מקצועות.
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="overflow-hidden py-0">
              <CardHeader className="px-5 py-3 bg-slate-50 border-b flex-row items-center gap-2">
                <span className="text-lg">{cat.icon || "-"}</span>
                <CardTitle className="text-sm text-slate-700">
                  {cat.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {cat.subjects.length} מקצועות
                </Badge>
              </CardHeader>

              <CardContent className="p-0">
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
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <BookOpen className="w-3 h-3" />
                              {subject.hasLevels
                                ? `${subject.levels.length} רמות`
                                : `${subject.units} יח"ל`}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getComponentCount(subject)} מרכיבים
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="ערוך"
                          >
                            <Link href={`/admin/subjects/${subject.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(subject)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="מחק"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
