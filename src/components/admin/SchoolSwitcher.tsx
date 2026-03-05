"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface School {
  id: string;
  name: string;
  slug: string;
}

interface SchoolSwitcherProps {
  currentSchool: School;
  schools: School[];
}

const CREATE_NEW_VALUE = "__create_new__";

export function SchoolSwitcher({ currentSchool, schools }: SchoolSwitcherProps) {
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [error, setError] = useState("");

  const handleCreateSchool = async () => {
    setError("");

    if (!newName.trim()) {
      setError("שם בית ספר הוא שדה חובה");
      return;
    }

    if (!newSlug.trim()) {
      setError("מזהה (slug) הוא שדה חובה");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) {
      setError("מזהה חייב להכיל רק אותיות קטנות באנגלית, מספרים ומקפים");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), slug: newSlug.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "שגיאה ביצירת בית ספר");
        return;
      }

      setDialogOpen(false);
      setNewName("");
      setNewSlug("");
      router.refresh();
    } catch (err) {
      console.error("Create school error:", err);
      setError("שגיאת רשת");
    } finally {
      setIsCreating(false);
    }
  };

  const createSchoolDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader className="text-right">
          <DialogTitle>הוסף בית ספר חדש</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="school-name">שם בית הספר</Label>
            <Input
              id="school-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="לדוגמה: תיכון הרצליה"
              disabled={isCreating}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="school-slug">מזהה (slug)</Label>
            <Input
              id="school-slug"
              dir="ltr"
              className="text-left"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
              placeholder="herzliya"
              disabled={isCreating}
            />
            <p className="text-xs text-slate-400">
              אותיות קטנות באנגלית ומקפים בלבד
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter className="flex-row-reverse sm:flex-row-reverse gap-2">
          <Button
            onClick={handleCreateSchool}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                יוצר...
              </>
            ) : (
              "צור בית ספר"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isCreating}
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Single school: render static text + create button
  if (schools.length <= 1) {
    return (
      <>
        <span className="hidden sm:inline text-sm font-semibold text-slate-800">
          {currentSchool.name}
        </span>
        <button
          onClick={() => setDialogOpen(true)}
          className="hidden sm:inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          title="הוסף בית ספר חדש"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        {createSchoolDialog}
      </>
    );
  }

  const handleSchoolChange = async (value: string) => {
    if (value === CREATE_NEW_VALUE) {
      setDialogOpen(true);
      return;
    }

    if (value === currentSchool.id) return;

    setIsSwitching(true);
    try {
      const res = await fetch("/api/admin/switch-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: value }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Switch school error:", data.error);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error("Switch school error:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <>
      <Select
        value={currentSchool.id}
        onValueChange={handleSchoolChange}
        dir="rtl"
        disabled={isSwitching}
      >
        <SelectTrigger
          size="sm"
          className="h-7 border-none shadow-none bg-transparent text-sm font-semibold text-slate-800 gap-1 px-1 hover:text-blue-600 transition-colors"
        >
          {isSwitching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <SelectValue />
          )}
        </SelectTrigger>
        <SelectContent dir="rtl">
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id}>
              {school.name}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value={CREATE_NEW_VALUE}>
            <span className="flex items-center gap-1.5 text-blue-600">
              <Plus className="w-3.5 h-3.5" />
              בית ספר חדש
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
      {createSchoolDialog}
    </>
  );
}
