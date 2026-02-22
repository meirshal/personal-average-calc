"use client";

import type { LevelConfig } from "@/lib/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface LevelSelectorProps {
  subjectId: string;
  levels: LevelConfig[];
  selectedLevelId: string | undefined;
  onLevelChange: (subjectId: string, levelId: string) => void;
}

export default function LevelSelector({
  subjectId,
  levels,
  selectedLevelId,
  onLevelChange,
}: LevelSelectorProps) {
  // Default to first level if none selected
  const currentLevel = selectedLevelId || (levels.length > 0 ? levels[0].id : "");

  const sortedLevels = [...levels].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <ToggleGroup
      type="single"
      value={currentLevel}
      onValueChange={(value) => {
        if (value) onLevelChange(subjectId, value);
      }}
      className="flex w-full gap-1.5 mb-2.5"
    >
      {sortedLevels.map((level) => (
        <ToggleGroupItem
          key={level.id}
          value={level.id}
          className="flex-1 py-2 border-[1.5px] rounded-lg text-[0.85rem] font-semibold
            cursor-pointer text-center transition-all duration-150 font-sans
            border-slate-200 bg-white text-slate-700 hover:border-slate-300
            data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600"
        >
          {level.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
