"use client";

import type { LevelConfig } from "@/lib/types";

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

  return (
    <div className="flex gap-1.5 mb-2.5">
      {levels
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((level) => {
          const isActive = level.id === currentLevel;
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => onLevelChange(subjectId, level.id)}
              className={`flex-1 py-2 border-[1.5px] rounded-lg text-[0.85rem] font-semibold
                cursor-pointer text-center transition-all duration-150 font-sans
                ${
                  isActive
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
            >
              {level.label}
            </button>
          );
        })}
    </div>
  );
}
