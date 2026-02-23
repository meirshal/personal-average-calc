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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
    <div className="min-h-dvh bg-slate-100 pb-24">
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
        <div className="bg-white rounded-xl p-3.5 mt-4 shadow-sm border border-slate-300">
          <h3 className="text-[0.85rem] text-slate-700 mb-2 font-semibold">
            פריטים נוספים (לא נכללים בממוצע)
          </h3>
          <label className="flex items-center gap-2 py-1.5 text-[0.85rem] cursor-pointer">
            <Switch
              checked={calc.getExtra("pe")}
              onCheckedChange={(checked) => calc.setExtra("pe", checked)}
              className="data-[state=checked]:bg-blue-600"
            />
            חינוך גופני
          </label>
          <label className="flex items-center gap-2 py-1.5 text-[0.85rem] cursor-pointer">
            <Switch
              checked={calc.getExtra("social_involvement")}
              onCheckedChange={(checked) => calc.setExtra("social_involvement", checked)}
              className="data-[state=checked]:bg-blue-600"
            />
            מעורבות חברתית
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-center mt-5 px-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                איפוס נתונים
              </Button>
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
