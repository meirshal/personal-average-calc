"use client";

import type { CategoryConfig, SubjectConfig } from "@/lib/types";
import SubjectCard from "./SubjectCard";

interface CategoryGroupProps {
  category: CategoryConfig;
  isEnabled: (subjectId: string) => boolean;
  getSubjectFinal: (subject: SubjectConfig) => number;
  getSubjectUnits: (subject: SubjectConfig) => number;
  getSelectedLevel: (subjectId: string) => string | undefined;
  getGrade: (subjectId: string, componentId: string) => number;
  onToggle: (subjectId: string) => void;
  onGradeChange: (subjectId: string, componentId: string, value: number) => void;
  onLevelChange: (subjectId: string, levelId: string) => void;
  allSubjects: SubjectConfig[];
}

export default function CategoryGroup({
  category,
  isEnabled,
  getSubjectFinal,
  getSubjectUnits,
  getSelectedLevel,
  getGrade,
  onToggle,
  onGradeChange,
  onLevelChange,
  allSubjects,
}: CategoryGroupProps) {
  const sortedSubjects = [...category.subjects].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <div className="mb-4">
      <div className="text-[0.8rem] font-bold text-slate-500 uppercase tracking-wider py-2 px-1 border-b-2 border-slate-200 mb-2 flex items-center gap-1.5">
        {category.icon && <span className="text-base">{category.icon}</span>}
        {category.name}
      </div>
      {sortedSubjects.map((subject) => {
        const active = isEnabled(subject.id);
        const final = active ? getSubjectFinal(subject) : 0;
        const units = getSubjectUnits(subject);
        const selectedLevel = getSelectedLevel(subject.id);

        // Get base subject info for dependencies
        let baseSubjectEnabled = false;
        let baseSubjectFinal = 0;
        if (subject.dependsOnId) {
          const baseSub = allSubjects.find(
            (s) => s.id === subject.dependsOnId
          );
          if (baseSub) {
            baseSubjectEnabled = isEnabled(baseSub.id);
            baseSubjectFinal = baseSubjectEnabled
              ? getSubjectFinal(baseSub)
              : 0;
          }
        }

        return (
          <SubjectCard
            key={subject.id}
            subject={subject}
            isActive={active}
            units={units}
            finalGrade={final}
            selectedLevel={selectedLevel}
            getGrade={getGrade}
            onToggle={onToggle}
            onGradeChange={onGradeChange}
            onLevelChange={onLevelChange}
            baseSubjectEnabled={baseSubjectEnabled}
            baseSubjectFinal={baseSubjectFinal}
          />
        );
      })}
    </div>
  );
}
