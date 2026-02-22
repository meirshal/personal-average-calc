"use client";

import type { ComponentConfig } from "@/lib/types";

interface ComponentInputProps {
  subjectId: string;
  component: ComponentConfig;
  grade: number;
  onGradeChange: (subjectId: string, componentId: string, value: number) => void;
}

export default function ComponentInput({
  subjectId,
  component,
  grade,
  onGradeChange,
}: ComponentInputProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="flex-1 text-[0.82rem] text-slate-700">
        {component.name}
      </span>
      <span className="text-[0.7rem] text-slate-500 min-w-[36px] text-center">
        {Math.round(component.weight * 100)}%
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={100}
        placeholder="\u2014"
        value={grade || ""}
        onChange={(e) => {
          const val = e.target.value === "" ? 0 : Number(e.target.value);
          onGradeChange(subjectId, component.id, val);
        }}
        className="w-[72px] sm:w-[80px] py-2 px-2.5 border-[1.5px] border-slate-200 rounded-lg
          text-[0.95rem] font-semibold text-center font-sans text-slate-800
          transition-[border-color] duration-150
          focus:outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/10
          bg-white
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}
