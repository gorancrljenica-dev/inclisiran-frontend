"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardEntry, GroupedDashboard } from "../types";
import { API_URL } from "../utils/api";

const today = () => new Date().toISOString().split("T")[0];

function groupEntries(entries: DashboardEntry[]): GroupedDashboard {
  const t = today();
  const overdue: DashboardEntry[] = [];
  const todayList: DashboardEntry[] = [];
  const upcoming: DashboardEntry[] = [];

  for (const e of entries) {
    if (e.status === "kasni") {
      overdue.push(e);
    } else if (e.planned_date === t) {
      todayList.push(e);
    } else {
      upcoming.push(e);
    }
  }

  return { overdue, today: todayList, upcoming };
}

export function useDashboardData() {
  const [data, setData] = useState<GroupedDashboard>({
    overdue: [],
    today: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/dashboard`);
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const entries: DashboardEntry[] = await res.json();
      setData(groupEntries(entries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
