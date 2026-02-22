"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <button
        onClick={handleSeed}
        disabled={loading}
        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600
          hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50
          whitespace-nowrap cursor-pointer"
      >
        {loading ? "מוסיף מקצועות..." : "הוסף מקצועות ברירת מחדל"}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
