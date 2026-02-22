"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WeightValidator from "./WeightValidator";

export interface ComponentData {
  id?: string;
  name: string;
  weight: number;
  sortOrder: number;
}

interface ComponentEditorProps {
  components: ComponentData[];
  onChange: (components: ComponentData[]) => void;
  depWeight?: number | null;
}

export default function ComponentEditor({
  components,
  onChange,
  depWeight,
}: ComponentEditorProps) {
  const addComponent = () => {
    onChange([
      ...components,
      {
        name: "",
        weight: 0,
        sortOrder: components.length,
      },
    ]);
  };

  const removeComponent = (index: number) => {
    const updated = components.filter((_, i) => i !== index);
    onChange(updated.map((c, i) => ({ ...c, sortOrder: i })));
  };

  const updateComponent = (
    index: number,
    field: keyof ComponentData,
    value: string | number
  ) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          מרכיבי ציון
        </label>
        <WeightValidator
          weights={components.map((c) => c.weight)}
          depWeight={depWeight}
        />
      </div>

      {components.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">אין מרכיבים. הוסף מרכיב חדש.</p>
      )}

      {components.map((comp, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-muted/50 rounded-lg p-2.5 border"
        >
          <span className="text-xs text-muted-foreground w-5 shrink-0 text-center">
            {index + 1}
          </span>
          <Input
            type="text"
            placeholder="שם מרכיב"
            value={comp.name}
            onChange={(e) => updateComponent(index, "name", e.target.value)}
            className="flex-1 min-w-0 text-sm bg-background"
          />
          <div className="flex items-center gap-1 shrink-0">
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="משקל"
              value={comp.weight || ""}
              onChange={(e) =>
                updateComponent(index, "weight", parseFloat(e.target.value) || 0)
              }
              className="w-20 text-sm text-center bg-background"
            />
            <span className="text-xs text-muted-foreground">משקל</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeComponent(index)}
            className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="הסר מרכיב"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        onClick={addComponent}
        className="text-primary hover:text-primary hover:bg-primary/10"
      >
        <Plus className="size-4" />
        הוסף מרכיב
      </Button>
    </div>
  );
}
