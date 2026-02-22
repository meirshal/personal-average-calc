"use client";

interface WeightValidatorProps {
  weights: number[];
  depWeight?: number | null;
}

export default function WeightValidator({ weights, depWeight }: WeightValidatorProps) {
  const sum = weights.reduce((acc, w) => acc + w, 0) + (depWeight ?? 0);
  const roundedSum = Math.round(sum * 1000) / 1000;
  const isValid = Math.abs(roundedSum - 1) < 0.01;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
        isValid
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      {isValid ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )}
      <span>
        {isValid
          ? `סה"כ משקלות: ${roundedSum.toFixed(2)}`
          : `סה"כ משקלות: ${roundedSum.toFixed(3)} (צריך להיות 1.00)`}
      </span>
    </div>
  );
}
