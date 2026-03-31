"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboardData } from "../hooks/useDashboardData";
import { SummaryCards } from "../components/SummaryCards";
import { PatientCard } from "../components/PatientCard";
import { PatientList } from "../components/PatientList";
import { RecordDoseModal } from "../components/RecordDoseModal";
import { DashboardEntry } from "../types";

function SubSection({
  label,
  labelClass,
  entries,
  onRecord,
}: {
  label: string;
  labelClass: string;
  entries: DashboardEntry[];
  onRecord: (e: DashboardEntry) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="mb-4">
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>
        {label}
      </p>
      <div className="space-y-2">
        {entries.map((e) => (
          <PatientCard key={e.schedule_id} entry={e} onRecord={onRecord} />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, refresh } = useDashboardData();
  const [selected, setSelected] = useState<DashboardEntry | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Učitavanje...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-sm w-full text-center">
          <p className="text-red-600 font-medium mb-1">Greška pri učitavanju</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button onClick={refresh} className="text-sm text-blue-600 underline">
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  const hasActionItems = data.overdue.length > 0 || data.today.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Inclisiran Dose Tracker
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/timeline"
              className="text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg"
            >
              Raspored
            </Link>
            <Link
              href="/patients"
              className="text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg"
            >
              Svi pacijenti
            </Link>
            <Link
              href="/patient/new"
              className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg"
            >
              + Novi pacijent
            </Link>
            <button
              onClick={refresh}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Osvježi
            </button>
          </div>
        </div>

        <SummaryCards data={data} />

        {/* Za akciju */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Za akciju
          </h2>

          {!hasActionItems && (
            <p className="text-sm text-gray-400 py-2">
              Nema pacijenata koji kasne ili su na redu danas.
            </p>
          )}

          <SubSection
            label="Kasni"
            labelClass="text-red-500"
            entries={data.overdue}
            onRecord={setSelected}
          />

          <SubSection
            label="Danas"
            labelClass="text-yellow-600"
            entries={data.today}
            onRecord={setSelected}
          />
        </section>

        {/* Sljedeće */}
        <PatientList
          title="Sljedeće"
          entries={data.upcoming}
          emptyText="Nema nadolazećih termina u narednih 14 dana."
          onRecord={setSelected}
        />

      </div>

      {selected && (
        <RecordDoseModal
          entry={selected}
          onClose={() => setSelected(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
