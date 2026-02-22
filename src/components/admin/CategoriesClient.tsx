"use client";

import { useState, useEffect, useCallback } from "react";
import ConfirmDialog from "./ConfirmDialog";

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
            className="mr-2 text-red-500 hover:text-red-700 cursor-pointer"
          >
            x
          </button>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            קטגוריות ({categories.length})
          </h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700
              hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
            הוסף קטגוריה
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <form
            onSubmit={handleAdd}
            className="px-5 py-4 bg-blue-50 border-b border-blue-200 flex flex-wrap items-end gap-3"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                שם
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                placeholder="שם הקטגוריה"
                autoFocus
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                אייקון
              </label>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-center"
                placeholder="&#x1F4DA;"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600
                  hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {addLoading ? "מוסיף..." : "הוסף"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setNewName("");
                  setNewIcon("");
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white
                  hover:bg-slate-100 rounded-lg transition-colors border border-slate-300 cursor-pointer"
              >
                ביטול
              </button>
            </div>
          </form>
        )}

        {/* Category Items */}
        {categories.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            אין קטגוריות. הוסף קטגוריה חדשה או זרע מקצועות ברירת מחדל.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
              >
                {editingId === cat.id ? (
                  // Edit mode
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="w-12 text-center text-lg px-1 py-1 rounded border border-slate-300
                        focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-[150px] text-sm px-3 py-1.5 rounded-lg border border-slate-300
                        focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEdit(cat.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(cat.id)}
                        disabled={editLoading}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                        title="שמור"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md cursor-pointer"
                        title="ביטול"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
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
                      <button
                        onClick={() => handleReorder(cat.id, "up")}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100
                          rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="הזז למעלה"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleReorder(cat.id, "down")}
                        disabled={index === categories.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100
                          rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="הזז למטה"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50
                          rounded-md transition-colors cursor-pointer"
                        title="ערוך"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50
                          rounded-md transition-colors cursor-pointer"
                        title="מחק"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
