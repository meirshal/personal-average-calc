"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSeedSubjects } from "@/hooks/useAdminQueries";

export default function SeedButton() {
  const router = useRouter();
  const seedMutation = useSeedSubjects();

  const handleSeed = () => {
    seedMutation.mutate(undefined, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  return (
    <div className="shrink-0">
      <Button onClick={handleSeed} disabled={seedMutation.isPending}>
        {seedMutation.isPending ? "מוסיף מקצועות..." : "הוסף מקצועות ברירת מחדל"}
      </Button>
      {seedMutation.error && (
        <p className="text-xs text-red-600 mt-2">{seedMutation.error.message}</p>
      )}
    </div>
  );
}
