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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasNoTherapy(overview: PatientOverview | null): boolean {
  return !overview || overview.status === "no_active_therapy";
}

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

// ─── StartTherapyForm (inline, appears inside the row) ────────────────────────

function StartTherapyForm({
  patientId,
  onSuccess,
  onCancel,
}: {
  patientId: string;
  onSuccess: (overview: PatientOverview) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/therapy/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, start_date: startDate }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Greška pri pokretanju terapije.");

      // Refresh this patient's overview
      const overviewRes = await fetch(
        `${API_URL}/patient/${encodeURIComponent(patientId)}/overview`
      );
      const overview: PatientOverview = overviewRes.ok ? await overviewRes.json() : null;
      onSuccess(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepoznata greška.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      className="mt-3 pt-3 border-t border-gray-100"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs text-gray-500 shrink-0">Datum početka:</label>
        <input
          type="date"
          value={startDate}
          max={today}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Pokretanje..." : "Potvrdi"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="text-xs px-3 py-1.5 text-gray-500 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Odustani
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listRes = await fetch(`${API_URL}/patients`);
      if (!listRes.ok) throw new Error(`Greška pri učitavanju pacijenata: ${listRes.status}`);
      const patients: PatientListItem[] = await listRes.json();

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

  function handleTherapySuccess(patientId: string, overview: PatientOverview) {
    setRows((prev) =>
      prev.map((r) => (r.patient.id === patientId ? { ...r, overview } : r))
    );
    setExpandedId(null);
  }

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
            {rows.map(({ patient, overview }) => {
              const noTherapy = hasNoTherapy(overview);
              const isExpanded = expandedId === patient.id;

              if (noTherapy) {
                // Not a link — needs inline action
                return (
                  <div
                    key={patient.id}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/patient/${encodeURIComponent(patient.id)}`}
                          className="font-semibold text-gray-900 truncate hover:text-blue-600"
                        >
                          {patient.ime_prezime}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">{patient.id}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-sm ${statusClass(overview)}`}>
                          {statusLabel(overview)}
                        </span>
                        {!isExpanded && (
                          <button
                            onClick={() => setExpandedId(patient.id)}
                            className="text-xs px-2.5 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Pokreni terapiju
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <StartTherapyForm
                        patientId={patient.id}
                        onSuccess={(ov) => handleTherapySuccess(patient.id, ov)}
                        onCancel={() => setExpandedId(null)}
                      />
                    )}
                  </div>
                );
              }

              // Has therapy — full row is a link
              return (
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
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
