"use client";

import { Check, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WeightValidatorProps {
  weights: number[];
  depWeight?: number | null;
}

export default function WeightValidator({ weights, depWeight }: WeightValidatorProps) {
  const sum = weights.reduce((acc, w) => acc + w, 0) + (depWeight ?? 0);
  const roundedSum = Math.round(sum * 1000) / 1000;
  const isValid = Math.abs(roundedSum - 1) < 0.01;

  return (
    <Badge variant={isValid ? "default" : "destructive"} className="gap-1.5">
      {isValid ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5" />
      )}
      <span>
        {isValid
          ? `סה"כ משקלות: ${roundedSum.toFixed(2)}`
          : `סה"כ משקלות: ${roundedSum.toFixed(3)} (צריך להיות 1.00)`}
      </span>
    </Badge>
  );
}
