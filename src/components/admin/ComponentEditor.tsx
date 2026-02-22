"use client";

import WeightValidator from "./WeightValidator";

export interface ComponentData {
  id?: string;
  name: string;
  weight: number;
  sortOrder: number;
}

interface ComponentEditorProps {
  components: ComponentData[];
  onChange: (components: ComponentData[]) => void;
  depWeight?: number | null;
}

export default function ComponentEditor({
  components,
  onChange,
  depWeight,
}: ComponentEditorProps) {
  const addComponent = () => {
    onChange([
      ...components,
      {
        name: "",
        weight: 0,
        sortOrder: components.length,
      },
    ]);
  };

  const removeComponent = (index: number) => {
    const updated = components.filter((_, i) => i !== index);
    onChange(updated.map((c, i) => ({ ...c, sortOrder: i })));
  };

  const updateComponent = (
    index: number,
    field: keyof ComponentData,
    value: string | number
  ) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          מרכיבי ציון
        </label>
        <WeightValidator
          weights={components.map((c) => c.weight)}
          depWeight={depWeight}
        />
      </div>

      {components.length === 0 && (
        <p className="text-xs text-slate-400 py-2">אין מרכיבים. הוסף מרכיב חדש.</p>
      )}

      {components.map((comp, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5 border border-slate-200"
        >
          <span className="text-xs text-slate-400 w-5 shrink-0 text-center">
            {index + 1}
          </span>
          <input
            type="text"
            placeholder="שם מרכיב"
            value={comp.name}
            onChange={(e) => updateComponent(index, "name", e.target.value)}
            className="flex-1 min-w-0 text-sm px-3 py-1.5 rounded-md border border-slate-300
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="משקל"
              value={comp.weight || ""}
              onChange={(e) =>
                updateComponent(index, "weight", parseFloat(e.target.value) || 0)
              }
              className="w-20 text-sm px-2 py-1.5 rounded-md border border-slate-300
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-center"
            />
            <span className="text-xs text-slate-400">משקל</span>
          </div>
          <button
            type="button"
            onClick={() => removeComponent(index)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50
              rounded-md transition-colors shrink-0 cursor-pointer"
            title="הסר מרכיב"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addComponent}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700
          hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        הוסף מרכיב
      </button>
    </div>
  );
}
