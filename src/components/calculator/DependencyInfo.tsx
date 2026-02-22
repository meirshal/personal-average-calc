"use client";

import type { SubjectConfig } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
    <Alert className="text-[0.72rem] text-slate-500 bg-slate-50 border-slate-200 py-1.5 px-2.5 rounded-md mb-2 leading-relaxed">
      <Info className="!size-3.5 text-slate-400" />
      <AlertDescription className="text-[0.72rem] text-slate-500">
        {pct}% מהציון מגיע מ{subject.depLabel}
        {baseSubjectEnabled
          ? baseSubjectFinal > 0
            ? ` (${baseSubjectFinal.toFixed(1)})`
            : ""
          : " - יש להפעיל את מקצוע הבסיס"}
      </AlertDescription>
    </Alert>
  );
}
