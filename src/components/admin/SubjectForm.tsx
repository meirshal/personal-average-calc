"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

    // Validate component weights sum to ~1.0 for subjects with components
    if (!data.hasLevels && data.components.length > 0) {
      const componentWeightSum = data.components.reduce(
        (sum, c) => sum + (c.weight || 0),
        0
      );
      const totalWeight =
        componentWeightSum + (data.depWeight ? data.depWeight : 0);
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        setError(
          `סכום המשקלים חייב להיות 1.0 (כרגע: ${totalWeight.toFixed(2)})`
        );
        return;
      }
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
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="size-4" />
          <AlertDescription>נשמר בהצלחה!</AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            פרטי מקצוע
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject-name">שם מקצוע *</Label>
              <Input
                id="subject-name"
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="למשל: מתמטיקה"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject-category">קטגוריה *</Label>
              <Select
                value={data.categoryId}
                onValueChange={(value) =>
                  setData({ ...data, categoryId: value })
                }
              >
                <SelectTrigger id="subject-category" className="w-full">
                  <SelectValue placeholder="בחר קטגוריה..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject-units">יחידות לימוד</Label>
              <Input
                id="subject-units"
                type="number"
                min="0"
                value={data.units}
                onChange={(e) =>
                  setData({ ...data, units: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">
                {data.hasLevels ? "יחידות נקבעות לפי רמה (0 כאן)" : ""}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject-sort">סדר מיון</Label>
              <Input
                id="subject-sort"
                type="number"
                min="0"
                value={data.sortOrder}
                onChange={(e) =>
                  setData({ ...data, sortOrder: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Has Levels Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="has-levels"
              checked={data.hasLevels}
              onCheckedChange={(checked) => {
                setData({
                  ...data,
                  hasLevels: checked,
                  // Clear the opposite when toggling
                  ...(checked ? { components: [] } : { levels: [] }),
                });
              }}
            />
            <Label htmlFor="has-levels" className="cursor-pointer">
              מקצוע עם רמות (למשל מתמטיקה 4/5 יח&quot;ל)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Components or Levels */}
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Dependency */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            תלות במקצוע אחר
          </h3>

          <div className="space-y-1.5">
            <Label htmlFor="depends-on">תלוי ב-</Label>
            <Select
              value={data.dependsOnId || "__none__"}
              onValueChange={(value) =>
                setData({
                  ...data,
                  dependsOnId: value === "__none__" ? null : value,
                  ...(value === "__none__"
                    ? { depLabel: null, depWeight: null }
                    : {}),
                })
              }
            >
              <SelectTrigger id="depends-on" className="w-full">
                <SelectValue placeholder="ללא תלות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">ללא תלות</SelectItem>
                {allSubjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasDependency && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dep-label">תווית תלות</Label>
                <Input
                  id="dep-label"
                  type="text"
                  value={data.depLabel || ""}
                  onChange={(e) =>
                    setData({ ...data, depLabel: e.target.value || null })
                  }
                  placeholder='למשל: ציון תנ"ך בסיסי'
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dep-weight">משקל תלות</Label>
                <Input
                  id="dep-weight"
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
                  placeholder="0.40"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "שומר..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
