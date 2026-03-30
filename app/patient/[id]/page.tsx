"use client";

import { useState } from "react";
import { use } from "react";
import { usePatientData } from "../../hooks/usePatientData";
import { PatientHeader } from "../../components/PatientHeader";
import { PatientStatus } from "../../components/PatientStatus";
import { ScheduleList } from "../../components/ScheduleList";
import { DoseHistory } from "../../components/DoseHistory";
import { RecordDoseModal } from "../../components/RecordDoseModal";
import { DashboardEntry } from "../../types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PatientPage({ params }: Props) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const { data, loading, error, refresh } = usePatientData(decodedId);
  const [showModal, setShowModal] = useState(false);
  const [modalEntry, setModalEntry] = useState<DashboardEntry | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Učitavanje podataka...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-sm w-full text-center">
          <p className="text-red-600 font-semibold mb-1">
            Greška pri učitavanju podataka.
          </p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button onClick={refresh} className="text-sm text-blue-600 underline">
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  const canRecord = data.overview?.active_therapy != null;

  // Default entry for the top-level "Unesi novu dozu" button
  const defaultModalEntry: DashboardEntry | null = canRecord
    ? {
        patient_id: decodedId,
        ime_prezime: data.patientName ?? id,
        therapy_id: data.overview!.active_therapy!.id,
        schedule_id: data.overview!.next_dose?.schedule_id ?? "",
        planned_date:
          data.overview!.next_dose?.planned_date ??
          new Date().toISOString().split("T")[0],
        type: "manual",
        status: "na_redu",
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        <PatientHeader patientId={decodedId} patientName={data.patientName} />

        {data.overview && <PatientStatus overview={data.overview} />}

        {defaultModalEntry && (
          <div className="mb-8">
            <button
              onClick={() => { setModalEntry(defaultModalEntry); setShowModal(true); }}
              className="w-full py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800"
            >
              Unesi novu dozu
            </button>
          </div>
        )}

        <ScheduleList
          therapies={data.therapies}
          patientId={decodedId}
          patientName={data.patientName}
          onRecord={(entry) => { setShowModal(true); setModalEntry(entry); }}
        />

        <DoseHistory therapies={data.therapies} />

      </div>

      {showModal && modalEntry && (
        <RecordDoseModal
          entry={modalEntry}
          onClose={() => { setShowModal(false); setModalEntry(null); }}
          onSuccess={() => {
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
