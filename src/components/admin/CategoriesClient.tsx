"use client";

import { useState, useEffect, useCallback } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Check, X, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  subjectCount: number;
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("שגיאה בטעינת קטגוריות");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAddLoading(true);
    try {
      const maxOrder = categories.length > 0
        ? Math.max(...categories.map((c) => c.sortOrder))
        : -1;

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          icon: newIcon.trim() || undefined,
          sortOrder: maxOrder + 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה ביצירת קטגוריה");
      }

      setNewName("");
      setNewIcon("");
      setShowAdd(false);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;

    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          icon: editIcon.trim() || "",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בעדכון קטגוריה");
      }

      setEditingId(null);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה במחיקת קטגוריה");
      }

      setDeleteTarget(null);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= categories.length) return;

    const current = categories[index];
    const swap = categories[swapIndex];

    try {
      await Promise.all([
        fetch(`/api/admin/categories/${current.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: swap.sortOrder }),
        }),
        fetch(`/api/admin/categories/${swap.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: current.sortOrder }),
        }),
      ]);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon || "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">טוען...</div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="ms-2 text-red-500 hover:text-red-700 cursor-pointer"
          >
            <X className="w-4 h-4 inline" />
          </button>
        </div>
      )}

      {/* Categories List */}
      <Card className="overflow-hidden py-0">
        <CardHeader className="px-5 py-4 border-b">
          <CardTitle className="text-sm text-slate-800">
            קטגוריות ({categories.length})
          </CardTitle>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdd(!showAdd)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              הוסף קטגוריה
            </Button>
          </CardAction>
        </CardHeader>

        {/* Add Form */}
        {showAdd && (
          <form
            onSubmit={handleAdd}
            className="px-5 py-4 bg-blue-50 border-b flex flex-wrap items-end gap-3"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                שם
              </label>
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="שם הקטגוריה"
                autoFocus
                className="bg-white"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                אייקון
              </label>
              <Input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="&#x1F4DA;"
                className="text-center bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addLoading} size="sm">
                {addLoading ? "מוסיף..." : "הוסף"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAdd(false);
                  setNewName("");
                  setNewIcon("");
                }}
              >
                ביטול
              </Button>
            </div>
          </form>
        )}

        {/* Category Items */}
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">
              אין קטגוריות. הוסף קטגוריה חדשה או זרע מקצועות ברירת מחדל.
            </div>
          ) : (
            <div>
              {categories.map((cat, index) => (
                <div key={cat.id}>
                  {index > 0 && <Separator />}
                  <div className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    {editingId === cat.id ? (
                      // Edit mode
                      <div className="flex-1 flex flex-wrap items-center gap-3">
                        <Input
                          type="text"
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.target.value)}
                          className="w-12 text-center text-lg px-1 py-1"
                        />
                        <Input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 min-w-[150px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEdit(cat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(cat.id)}
                            disabled={editLoading}
                            className="text-emerald-600 hover:bg-emerald-50"
                            title="שמור"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditingId(null)}
                            className="text-slate-400 hover:bg-slate-100"
                            title="ביטול"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <span className="text-lg w-8 text-center shrink-0">
                          {cat.icon || "-"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {cat.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {cat.subjectCount} מקצועות
                          </p>
                        </div>

                        {/* Reorder buttons */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleReorder(cat.id, "up")}
                            disabled={index === 0}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="הזז למעלה"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleReorder(cat.id, "down")}
                            disabled={index === categories.length - 1}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="הזז למטה"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => startEdit(cat)}
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="ערוך"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(cat)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="מחק"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="מחיקת קטגוריה"
        message={
          deleteTarget
            ? `האם למחוק את הקטגוריה "${deleteTarget.name}"? פעולה זו תמחק גם את כל ${deleteTarget.subjectCount} המקצועות בקטגוריה.`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
