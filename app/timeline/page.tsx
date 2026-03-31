"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDate } from "../utils/formatDate";
import { API_URL } from "../utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineEntry {
  patient_id: string;
  ime_prezime: string;
  therapy_id: string;
  schedule_id: string;
  planned_date: string;
  type: string;
  status: "planirano" | "na_redu" | "kasni";
}

interface DateGroup {
  date: string;
  entries: TimelineEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  initial: "Inicijalna",
  "3m":    "3 mjeseca",
  "6m":    "6 mjeseci",
};

function typeLabel(type: string): string {
  return TYPE_LABEL[type] ?? type;
}

function datePriority(date: string, today: string): number {
  if (date < today) return 0; // kasni
  if (date === today) return 1; // today
  const diffDays =
    (new Date(date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 14) return 2; // na_redu window
  return 3; // planirano
}

function groupByDate(entries: TimelineEntry[], today: string): DateGroup[] {
  const map = new Map<string, TimelineEntry[]>();
  for (const e of entries) {
    const existing = map.get(e.planned_date) ?? [];
    existing.push(e);
    map.set(e.planned_date, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      const pa = datePriority(a, today);
      const pb = datePriority(b, today);
      if (pa !== pb) return pa - pb;       // urgency first
      return a.localeCompare(b);           // then date ascending within group
    })
    .map(([date, items]) => ({
      date,
      entries: (items as TimelineEntry[]).sort((a, b) => {
        const sp: Record<string, number> = { kasni: 0, na_redu: 1, planirano: 2 };
        const pa = sp[a.status] ?? 3;
        const pb = sp[b.status] ?? 3;
        if (pa !== pb) return pa - pb;
        return a.ime_prezime.localeCompare(b.ime_prezime);
      }),
    }));
}

function dateHeaderClass(date: string, today: string): string {
  if (date < today) return "text-red-600";
  if (date === today) return "text-yellow-700";
  return "text-gray-500";
}

function dateBgClass(date: string, today: string): string {
  if (date < today) return "border-red-200 bg-red-50";
  if (date === today) return "border-yellow-200 bg-yellow-50";
  return "border-gray-200 bg-white";
}

function statusPillClass(status: string): string {
  if (status === "kasni")   return "bg-red-100 text-red-700";
  if (status === "na_redu") return "bg-yellow-100 text-yellow-700";
  return "bg-blue-50 text-blue-600";
}

function statusLabel(status: string, date: string, today: string): string {
  if (status === "kasni")   return "Kasni";
  if (status === "na_redu") return date === today ? "Danas" : "Na redu";
  return "Planirano";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const [groups, setGroups] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/timeline`);
      if (!res.ok) throw new Error(`Greška: ${res.status}`);
      const entries: TimelineEntry[] = await res.json();
      const t = new Date().toISOString().split("T")[0];
      setGroups(groupByDate(entries, t));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Učitavanje rasporeda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-sm w-full text-center">
          <p className="text-red-600 font-semibold mb-1">Greška pri učitavanju</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button onClick={load} className="text-sm text-blue-600 underline">
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  const totalEntries = groups.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-1.5 mb-3 hover:border-gray-300"
            >
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              Raspored doza
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({totalEntries} planiranih)
              </span>
            </h1>
          </div>
          <button
            onClick={load}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Osvježi
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-400">Nema planiranih doza.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(({ date, entries }) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-2">
                  <p className={`text-xs font-semibold uppercase tracking-widest ${dateHeaderClass(date, today)}`}>
                    {date === today ? `Danas — ${formatDate(date)}` : formatDate(date)}
                  </p>
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-xs text-gray-400">{entries.length}</span>
                </div>

                {/* Entries for this date */}
                <div className="space-y-1.5">
                  {entries.map((e) => (
                    <Link
                      key={e.schedule_id}
                      href={`/patient/${encodeURIComponent(e.patient_id)}`}
                      className={`flex items-center justify-between border rounded-lg px-4 py-3 hover:shadow-sm transition-all ${dateBgClass(date, today)}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {e.ime_prezime}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{e.patient_id}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-xs text-gray-500">
                          {typeLabel(e.type)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusPillClass(e.status)}`}>
                          {statusLabel(e.status, date, today)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
