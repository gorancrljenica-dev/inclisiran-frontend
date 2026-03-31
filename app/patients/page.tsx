"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PatientListItem, PatientOverview } from "../types";
import { formatDate } from "../utils/formatDate";
import { API_URL } from "../utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientRow {
  patient: PatientListItem;
  overview: PatientOverview | null;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusLabel(overview: PatientOverview | null): string {
  if (!overview) return "—";
  const s = overview.status;
  if (s === "no_active_therapy") return "Nema terapije";
  if (s.label === "overdue") return `Kasni ${s.delayed_days ?? ""}d`;
  return "Na terapiji";
}

function statusClass(overview: PatientOverview | null): string {
  if (!overview) return "text-gray-400";
  const s = overview.status;
  if (s === "no_active_therapy") return "text-gray-400";
  if (s.label === "overdue") return "text-red-600 font-semibold";
  return "text-green-700 font-semibold";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listRes = await fetch(`${API_URL}/patients`);
      if (!listRes.ok) throw new Error(`Greška pri učitavanju pacijenata: ${listRes.status}`);
      const patients: PatientListItem[] = await listRes.json();

      // Fan-out: fetch overview for every patient in parallel
      const overviews = await Promise.all(
        patients.map((p) =>
          fetch(`${API_URL}/patient/${encodeURIComponent(p.id)}/overview`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );

      setRows(patients.map((p, i) => ({ patient: p, overview: overviews[i] })));
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
        <p className="text-sm text-gray-400">Učitavanje pacijenata...</p>
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
              Svi pacijenti
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({rows.length})
              </span>
            </h1>
          </div>
          <Link
            href="/patient/new"
            className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg"
          >
            + Novi pacijent
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-400 mb-3">Nema unesenih pacijenata.</p>
            <Link href="/patient/new" className="text-sm text-blue-600 underline">
              Dodaj prvog pacijenta
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map(({ patient, overview }) => (
              <Link
                key={patient.id}
                href={`/patient/${encodeURIComponent(patient.id)}`}
                className="block bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {patient.ime_prezime}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{patient.id}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm ${statusClass(overview)}`}>
                      {statusLabel(overview)}
                    </p>
                    {overview?.next_dose && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Sljedeća: {formatDate(overview.next_dose.planned_date)}
                      </p>
                    )}
                    {overview?.last_dose && (
                      <p className="text-xs text-gray-400">
                        Zadnja: {formatDate(overview.last_dose.planned_date)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
