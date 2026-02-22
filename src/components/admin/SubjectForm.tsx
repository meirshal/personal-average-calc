"use client";

import { useState } from "react";
import ComponentEditor, { type ComponentData } from "./ComponentEditor";
import LevelEditor, { type LevelData } from "./LevelEditor";

interface CategoryOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

export interface SubjectFormData {
  name: string;
  units: number;
  categoryId: string;
  hasLevels: boolean;
  dependsOnId: string | null;
  depLabel: string | null;
  depWeight: number | null;
  sortOrder: number;
  levels: LevelData[];
  components: ComponentData[];
}

interface SubjectFormProps {
  initialData: SubjectFormData;
  categories: CategoryOption[];
  allSubjects: SubjectOption[];
  onSubmit: (data: SubjectFormData) => Promise<void>;
  submitLabel: string;
  isNew?: boolean;
}

export default function SubjectForm({
  initialData,
  categories,
  allSubjects,
  onSubmit,
  submitLabel,
}: SubjectFormProps) {
  const [data, setData] = useState<SubjectFormData>(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate
    if (!data.name.trim()) {
      setError("שם מקצוע הוא שדה חובה");
      return;
    }
    if (!data.categoryId) {
      setError("יש לבחור קטגוריה");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const hasDependency = data.dependsOnId !== null && data.dependsOnId !== "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
          נשמר בהצלחה!
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          פרטי מקצוע
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              שם מקצוע *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="למשל: מתמטיקה"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              קטגוריה *
            </label>
            <select
              value={data.categoryId}
              onChange={(e) => setData({ ...data, categoryId: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">בחר קטגוריה...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              יחידות לימוד
            </label>
            <input
              type="number"
              min="0"
              value={data.units}
              onChange={(e) =>
                setData({ ...data, units: parseInt(e.target.value) || 0 })
              }
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              {data.hasLevels ? "יחידות נקבעות לפי רמה (0 כאן)" : ""}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              סדר מיון
            </label>
            <input
              type="number"
              min="0"
              value={data.sortOrder}
              onChange={(e) =>
                setData({ ...data, sortOrder: parseInt(e.target.value) || 0 })
              }
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Has Levels Toggle */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              const newHasLevels = !data.hasLevels;
              setData({
                ...data,
                hasLevels: newHasLevels,
                // Clear the opposite when toggling
                ...(newHasLevels ? { components: [] } : { levels: [] }),
              });
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              data.hasLevels ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                data.hasLevels ? "-translate-x-6" : "-translate-x-1"
              }`}
            />
          </button>
          <label className="text-sm text-slate-700">
            מקצוע עם רמות (למשל מתמטיקה 4/5 יח&quot;ל)
          </label>
        </div>
      </div>

      {/* Components or Levels */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        {data.hasLevels ? (
          <LevelEditor
            levels={data.levels}
            onChange={(levels) => setData({ ...data, levels })}
          />
        ) : (
          <ComponentEditor
            components={data.components}
            onChange={(components) => setData({ ...data, components })}
            depWeight={data.depWeight}
          />
        )}
      </div>

      {/* Dependency */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          תלות במקצוע אחר
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            תלוי ב-
          </label>
          <select
            value={data.dependsOnId || ""}
            onChange={(e) =>
              setData({
                ...data,
                dependsOnId: e.target.value || null,
                ...(e.target.value
                  ? {}
                  : { depLabel: null, depWeight: null }),
              })
            }
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">ללא תלות</option>
            {allSubjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))}
          </select>
        </div>

        {hasDependency && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                תווית תלות
              </label>
              <input
                type="text"
                value={data.depLabel || ""}
                onChange={(e) =>
                  setData({ ...data, depLabel: e.target.value || null })
                }
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder='למשל: ציון תנ"ך בסיסי'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                משקל תלות
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={data.depWeight ?? ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    depWeight: parseFloat(e.target.value) || null,
                  })
                }
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="0.40"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600
            hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "שומר..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
