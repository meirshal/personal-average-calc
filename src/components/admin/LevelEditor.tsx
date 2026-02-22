"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ComponentEditor, { type ComponentData } from "./ComponentEditor";

export interface LevelData {
  id?: string;
  label: string;
  units: number;
  sortOrder: number;
  components: ComponentData[];
}

interface LevelEditorProps {
  levels: LevelData[];
  onChange: (levels: LevelData[]) => void;
}

export default function LevelEditor({ levels, onChange }: LevelEditorProps) {
  const addLevel = () => {
    onChange([
      ...levels,
      {
        label: "",
        units: 0,
        sortOrder: levels.length,
        components: [],
      },
    ]);
  };

  const removeLevel = (index: number) => {
    const updated = levels.filter((_, i) => i !== index);
    onChange(updated.map((l, i) => ({ ...l, sortOrder: i })));
  };

  const updateLevel = (
    index: number,
    field: keyof Omit<LevelData, "components">,
    value: string | number
  ) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateLevelComponents = (index: number, comps: ComponentData[]) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], components: comps };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">רמות</label>
        <Button
          type="button"
          variant="ghost"
          onClick={addLevel}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <Plus className="size-4" />
          הוסף רמה
        </Button>
      </div>

      {levels.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">
          אין רמות. הוסף רמה חדשה (למשל 4 יח&quot;ל, 5 יח&quot;ל).
        </p>
      )}

      {levels.map((level, index) => (
        <Card key={index} className="py-0 overflow-hidden">
          <CardHeader className="bg-muted/50 px-4 py-3 border-b flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                רמה {index + 1}
              </span>
              <Input
                type="text"
                placeholder='תווית (למשל 5 יח"ל)'
                value={level.label}
                onChange={(e) => updateLevel(index, "label", e.target.value)}
                className="text-sm w-40 bg-background"
              />
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  placeholder='יח"ל'
                  value={level.units || ""}
                  onChange={(e) =>
                    updateLevel(index, "units", parseInt(e.target.value) || 0)
                  }
                  className="w-16 text-sm text-center bg-background"
                />
                <span className="text-xs text-muted-foreground">יח&quot;ל</span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLevel(index)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="הסר רמה"
            >
              <Trash2 className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <ComponentEditor
              components={level.components}
              onChange={(comps) => updateLevelComponents(index, comps)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
