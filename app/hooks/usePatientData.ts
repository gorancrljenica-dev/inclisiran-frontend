"use client";

import { useState, useEffect, useCallback } from "react";
import { PatientOverview, TherapyWithSchedules } from "../types";

interface PatientData {
  overview: PatientOverview | null;
  therapies: TherapyWithSchedules[];
  patientName: string | null;
}

export function usePatientData(patientId: string) {
  const [data, setData] = useState<PatientData>({
    overview: null,
    therapies: [],
    patientName: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch: overview + schedule + dashboard (for patient name)
      const [overviewRes, scheduleRes, dashboardRes] = await Promise.all([
        fetch(`/api/patient/${patientId}/overview`),
        fetch(`/api/schedule/${patientId}`),
        fetch("/api/dashboard"),
      ]);

      if (overviewRes.status === 404) {
        throw new Error("Pacijent nije pronađen.");
      }
      if (!overviewRes.ok) throw new Error(`Greška overview: ${overviewRes.status}`);
      if (!scheduleRes.ok) throw new Error(`Greška schedule: ${scheduleRes.status}`);

      const overview: PatientOverview = await overviewRes.json();
      const therapies: TherapyWithSchedules[] = await scheduleRes.json();

      // Extract patient name from dashboard (only source with ime_prezime)
      let patientName: string | null = null;
      if (dashboardRes.ok) {
        const dashEntries = await dashboardRes.json();
        const found = dashEntries.find((e: { patient_id: string; ime_prezime: string }) => e.patient_id === patientId);
        if (found) patientName = found.ime_prezime;
      }

      setData({ overview, therapies, patientName });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
