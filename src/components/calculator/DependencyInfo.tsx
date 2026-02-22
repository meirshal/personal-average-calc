"use client";

import type { SubjectConfig } from "@/lib/types";

interface DependencyInfoProps {
  subject: SubjectConfig;
  baseSubjectEnabled: boolean;
  baseSubjectFinal: number;
}

export default function DependencyInfo({
  subject,
  baseSubjectEnabled,
  baseSubjectFinal,
}: DependencyInfoProps) {
  if (!subject.dependsOnId || subject.depWeight == null || !subject.depLabel) {
    return null;
  }

  const pct = subject.depWeight * 100;

  return (
    <div className="text-[0.72rem] text-slate-500 bg-slate-50 py-1.5 px-2.5 rounded-md mb-2 leading-relaxed">
      {pct}% מהציון מגיע מ{subject.depLabel}
      {baseSubjectEnabled
        ? baseSubjectFinal > 0
          ? ` (${baseSubjectFinal.toFixed(1)})`
          : ""
        : " - יש להפעיל את מקצוע הבסיס"}
    </div>
  );
}
