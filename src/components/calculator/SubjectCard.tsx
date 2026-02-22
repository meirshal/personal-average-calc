"use client";

import type { SubjectConfig } from "@/lib/types";
import { getActiveComponents } from "@/lib/calculator";
import { Switch } from "@/components/ui/switch";
import ComponentInput from "./ComponentInput";
import LevelSelector from "./LevelSelector";
import DependencyInfo from "./DependencyInfo";

interface SubjectCardProps {
  subject: SubjectConfig;
  isActive: boolean;
  units: number;
  finalGrade: number;
  selectedLevel: string | undefined;
  getGrade: (subjectId: string, componentId: string) => number;
  onToggle: (subjectId: string) => void;
  onGradeChange: (subjectId: string, componentId: string, value: number) => void;
  onLevelChange: (subjectId: string, levelId: string) => void;
  baseSubjectEnabled: boolean;
  baseSubjectFinal: number;
}

export default function SubjectCard({
  subject,
  isActive,
  units,
  finalGrade,
  selectedLevel,
  getGrade,
  onToggle,
  onGradeChange,
  onLevelChange,
  baseSubjectEnabled,
  baseSubjectFinal,
}: SubjectCardProps) {
  const components = getActiveComponents(subject, selectedLevel);

  return (
    <div
      className={`bg-white rounded-xl mb-2 overflow-hidden transition-shadow duration-200
        ${
          isActive
            ? "border-[1.5px] border-blue-600 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]"
            : "border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]"
        }`}
    >
      {/* Card Header */}
      <div
        className={`flex items-center py-3 px-3.5 gap-2.5 cursor-pointer select-none
          transition-colors duration-150 active:bg-slate-100
          ${isActive ? "bg-blue-50" : ""}`}
        onClick={() => onToggle(subject.id)}
      >
        <span className="flex-1 text-[0.95rem] font-semibold">{subject.name}</span>
        <span
          className={`text-[0.7rem] py-0.5 px-2 rounded-full whitespace-nowrap
            ${
              isActive
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-500"
            }`}
        >
          {units} יח&quot;ל
        </span>
        {/* Toggle switch */}
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={isActive}
            onCheckedChange={() => onToggle(subject.id)}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>

      {/* Card Body - only shown when active */}
      {isActive && (
        <div className="px-3.5 pb-3.5">
          {/* Level selector for multi-level subjects */}
          {subject.hasLevels && subject.levels.length > 0 && (
            <LevelSelector
              subjectId={subject.id}
              levels={subject.levels}
              selectedLevelId={selectedLevel}
              onLevelChange={onLevelChange}
            />
          )}

          {/* Dependency info */}
          {subject.dependsOnId && (
            <DependencyInfo
              subject={subject}
              baseSubjectEnabled={baseSubjectEnabled}
              baseSubjectFinal={baseSubjectFinal}
            />
          )}

          {/* Component inputs */}
          {components
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((comp) => (
              <ComponentInput
                key={comp.id}
                subjectId={subject.id}
                component={comp}
                grade={getGrade(subject.id, comp.id)}
                onGradeChange={onGradeChange}
              />
            ))}

          {/* Final grade */}
          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-dashed border-slate-200">
            <span className="text-[0.82rem] font-semibold text-slate-700">
              ציון סופי
            </span>
            <span className="text-[1.15rem] font-extrabold text-blue-600 bg-blue-50 py-1 px-3.5 rounded-lg min-w-[60px] text-center">
              {finalGrade > 0 ? finalGrade.toFixed(1) : "\u2014"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
