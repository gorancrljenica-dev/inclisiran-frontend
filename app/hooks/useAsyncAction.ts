"use client";

import { useState, useCallback } from "react";

export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Returns true on success, false on failure
  const execute = useCallback(
    async (fn: () => Promise<void>): Promise<boolean> => {
      if (loading) return false; // Prevents double execution
      setLoading(true);
      setError(null);
      try {
        await fn();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nepoznata greška.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  return { loading, error, execute };
}
