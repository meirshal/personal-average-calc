"use client";

import type { SummaryStats } from "@/lib/types";

interface SummaryBarProps {
  summary: SummaryStats;
}

export default function SummaryBar({ summary }: SummaryBarProps) {
  return (
    <div className="sticky top-0 z-[100] bg-white border-b border-slate-200 py-3 px-4 shadow">
      <div className="max-w-[600px] mx-auto flex gap-3 justify-center items-center">
        <div className="flex flex-col items-center flex-1 max-w-[160px]">
          <span className="text-[0.7rem] text-slate-500 mb-0.5">
            יחידות לימוד
          </span>
          <span className="text-2xl font-extrabold text-blue-600 tabular-nums">
            {summary.totalUnits}
          </span>
        </div>
        <div className="w-px h-9 bg-slate-200" />
        <div className="flex flex-col items-center flex-1 max-w-[160px]">
          <span className="text-[0.7rem] text-slate-500 mb-0.5">
            ממוצע משוקלל
          </span>
          <span className="text-2xl font-extrabold text-blue-600 tabular-nums">
            {summary.avg > 0 ? summary.avg.toFixed(1) : "\u2014"}
          </span>
        </div>
      </div>
    </div>
  );
}
