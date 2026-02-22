"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "שגיאה בזריעת נתונים");
        return;
      }

      router.refresh();
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shrink-0">
      <Button onClick={handleSeed} disabled={loading}>
        {loading ? "מוסיף מקצועות..." : "הוסף מקצועות ברירת מחדל"}
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
