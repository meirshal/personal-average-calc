"use client";

import ComponentEditor, { type ComponentData } from "./ComponentEditor";

export interface LevelData {
  id?: string;
  label: string;
  units: number;
  sortOrder: number;
  components: ComponentData[];
}

interface LevelEditorProps {
  levels: LevelData[];
  onChange: (levels: LevelData[]) => void;
}

export default function LevelEditor({ levels, onChange }: LevelEditorProps) {
  const addLevel = () => {
    onChange([
      ...levels,
      {
        label: "",
        units: 0,
        sortOrder: levels.length,
        components: [],
      },
    ]);
  };

  const removeLevel = (index: number) => {
    const updated = levels.filter((_, i) => i !== index);
    onChange(updated.map((l, i) => ({ ...l, sortOrder: i })));
  };

  const updateLevel = (
    index: number,
    field: keyof Omit<LevelData, "components">,
    value: string | number
  ) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateLevelComponents = (index: number, comps: ComponentData[]) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], components: comps };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">רמות</label>
        <button
          type="button"
          onClick={addLevel}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700
            hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          הוסף רמה
        </button>
      </div>

      {levels.length === 0 && (
        <p className="text-xs text-slate-400 py-2">
          אין רמות. הוסף רמה חדשה (למשל 4 יח&quot;ל, 5 יח&quot;ל).
        </p>
      )}

      {levels.map((level, index) => (
        <div
          key={index}
          className="border border-slate-200 rounded-xl bg-white overflow-hidden"
        >
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400">
                רמה {index + 1}
              </span>
              <input
                type="text"
                placeholder='תווית (למשל 5 יח"ל)'
                value={level.label}
                onChange={(e) => updateLevel(index, "label", e.target.value)}
                className="text-sm px-3 py-1 rounded-md border border-slate-300
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white w-40"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  placeholder='יח"ל'
                  value={level.units || ""}
                  onChange={(e) =>
                    updateLevel(index, "units", parseInt(e.target.value) || 0)
                  }
                  className="w-16 text-sm px-2 py-1 rounded-md border border-slate-300
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-center"
                />
                <span className="text-xs text-slate-400">יח&quot;ל</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeLevel(index)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50
                rounded-md transition-colors cursor-pointer"
              title="הסר רמה"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <ComponentEditor
              components={level.components}
              onChange={(comps) => updateLevelComponents(index, comps)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
