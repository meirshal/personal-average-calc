"use client";

import type { SchoolConfig } from "@/lib/types";
import { useCalculator } from "@/hooks/useCalculator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SummaryBar from "./SummaryBar";
import CategoryGroup from "./CategoryGroup";

interface CalculatorProps {
  config: SchoolConfig;
}

export default function Calculator({ config }: CalculatorProps) {
  const calc = useCalculator(config);

  const sortedCategories = [...config.categories].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <div className="min-h-dvh bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-5 px-4 text-center">
        <h1 className="text-xl sm:text-[1.4rem] font-bold mb-1">
          מחשבון ממוצע בגרות
        </h1>
        <p className="text-[0.8rem] opacity-80">{config.name}</p>
      </header>

      {/* Summary Bar */}
      <SummaryBar summary={calc.summary} />

      {/* Main Content */}
      <main className="p-3 max-w-[600px] mx-auto">
        {sortedCategories.map((category) => {
          if (category.subjects.length === 0) return null;
          return (
            <CategoryGroup
              key={category.id}
              category={category}
              isEnabled={calc.isEnabled}
              getSubjectFinal={calc.getSubjectFinal}
              getSubjectUnits={calc.getSubjectUnits}
              getSelectedLevel={calc.getSelectedLevel}
              getGrade={calc.getGrade}
              onToggle={calc.toggleSubject}
              onGradeChange={calc.setGrade}
              onLevelChange={calc.setLevel}
              allSubjects={calc.allSubjects}
            />
          );
        })}

        {/* Extras */}
        <div className="bg-white rounded-xl p-3.5 mt-4 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] border border-slate-100">
          <h3 className="text-[0.85rem] text-slate-700 mb-2 font-semibold">
            פריטים נוספים (לא נכללים בממוצע)
          </h3>
          <label className="flex items-center gap-2 py-1.5 text-[0.85rem] cursor-pointer">
            <input
              type="checkbox"
              checked={calc.getExtra("pe")}
              onChange={(e) => calc.setExtra("pe", e.target.checked)}
              className="w-[18px] h-[18px] accent-blue-600 cursor-pointer"
            />
            חינוך גופני
          </label>
          <label className="flex items-center gap-2 py-1.5 text-[0.85rem] cursor-pointer">
            <input
              type="checkbox"
              checked={calc.getExtra("social_involvement")}
              onChange={(e) =>
                calc.setExtra("social_involvement", e.target.checked)
              }
              className="w-[18px] h-[18px] accent-blue-600 cursor-pointer"
            />
            מעורבות חברתית
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-center mt-5 px-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="py-2.5 px-5 rounded-lg text-[0.85rem] font-semibold cursor-pointer
                  border-[1.5px] border-red-100 bg-white text-red-600
                  transition-colors duration-150 active:bg-red-50"
              >
                איפוס נתונים
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>איפוס נתונים</AlertDialogTitle>
                <AlertDialogDescription>
                  פעולה זו תמחק את כל הציונים שהוזנו. האם להמשיך?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => calc.resetAll()}
                >
                  אישור מחיקה
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}
