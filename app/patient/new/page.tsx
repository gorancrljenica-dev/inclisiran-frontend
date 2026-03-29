"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
      {children}
    </h2>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function PatientForm({
  name,
  id,
  onChange,
}: {
  name: string;
  id: string;
  onChange: (field: "name" | "id", value: string) => void;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
      <SectionTitle>Pacijent</SectionTitle>
      <div className="space-y-4">
        <Field label="Ime i prezime" required>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="npr. Marko Marković"
            required
            className={inputClass}
          />
        </Field>
        <Field label="ID pacijenta" required>
          <input
            type="text"
            value={id}
            onChange={(e) => onChange("id", e.target.value)}
            placeholder="npr. PAT001"
            required
            className={inputClass}
          />
        </Field>
      </div>
    </section>
  );
}

function TherapyForm({
  startDate,
  onChange,
}: {
  startDate: string;
  onChange: (value: string) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
      <SectionTitle>Terapija</SectionTitle>
      <Field label="Datum početka terapije" required>
        <input
          type="date"
          value={startDate}
          max={today}
          onChange={(e) => onChange(e.target.value)}
          required
          className={inputClass}
        />
      </Field>
    </section>
  );
}

interface LipidValues {
  ukupniKolesterol: string;
  ldl: string;
  hdl: string;
  trigliceridi: string;
  datumMjerenja: string;
}

function LipidForm({
  values,
  onChange,
}: {
  values: LipidValues;
  onChange: (field: keyof LipidValues, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <SectionTitle>Lipidni status (opcionalno)</SectionTitle>
        <span className="text-xs text-gray-400 mb-4">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="space-y-4 mt-1">
          <Field label="Ukupni kolesterol (mmol/L)">
            <input
              type="number"
              step="0.1"
              min="0"
              value={values.ukupniKolesterol}
              onChange={(e) => onChange("ukupniKolesterol", e.target.value)}
              placeholder="npr. 5.8"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="LDL (mmol/L)">
              <input
                type="number"
                step="0.1"
                min="0"
                value={values.ldl}
                onChange={(e) => onChange("ldl", e.target.value)}
                placeholder="npr. 4.2"
                className={inputClass}
              />
            </Field>
            <Field label="HDL (mmol/L)">
              <input
                type="number"
                step="0.1"
                min="0"
                value={values.hdl}
                onChange={(e) => onChange("hdl", e.target.value)}
                placeholder="npr. 1.1"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Trigliceridi (mmol/L)">
            <input
              type="number"
              step="0.1"
              min="0"
              value={values.trigliceridi}
              onChange={(e) => onChange("trigliceridi", e.target.value)}
              placeholder="npr. 2.0"
              className={inputClass}
            />
          </Field>
          <Field label="Datum mjerenja">
            <input
              type="date"
              value={values.datumMjerenja}
              onChange={(e) => onChange("datumMjerenja", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      )}
    </section>
  );
}

function SubmitSection({
  submitting,
  error,
  success,
}: {
  submitting: boolean;
  error: string | null;
  success: boolean;
}) {
  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          Pacijent uspješno kreiran. Preusmjeravanje...
        </p>
      )}
      <button
        type="submit"
        disabled={submitting || success}
        className="w-full py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Kreiranje..." : "Kreiraj pacijenta"}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewPatientPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lipids, setLipids] = useState<LipidValues>({
    ukupniKolesterol: "",
    ldl: "",
    hdl: "",
    trigliceridi: "",
    datumMjerenja: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handlePatientChange(field: "name" | "id", value: string) {
    if (field === "name") setName(value);
    else setPatientId(value);
  }

  function handleLipidChange(field: keyof LipidValues, value: string) {
    setLipids((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // STEP 1 — Create patient
      const patientRes = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: patientId.trim(), ime_prezime: name.trim() }),
      });

      const patientBody = await patientRes.json();

      if (!patientRes.ok) {
        setError(patientBody.error ?? "Greška pri kreiranju pacijenta.");
        return;
      }

      // STEP 2 — Start therapy
      const therapyRes = await fetch("/api/therapy/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientBody.id,
          start_date: startDate,
        }),
      });

      const therapyBody = await therapyRes.json();

      if (!therapyRes.ok) {
        setError(therapyBody.error ?? "Greška pri pokretanju terapije.");
        return;
      }

      // Lipids stored in state — not sent to backend (not supported yet)

      setSuccess(true);
      setTimeout(() => router.push(`/patient/${patientBody.id}`), 1200);
    } catch {
      setError("Greška pri kreiranju pacijenta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-4 hover:border-gray-300"
          >
            ← Povratak na Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Novi pacijent</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <PatientForm
            name={name}
            id={patientId}
            onChange={handlePatientChange}
          />

          <TherapyForm startDate={startDate} onChange={setStartDate} />

          <LipidForm values={lipids} onChange={handleLipidChange} />

          <SubmitSection
            submitting={submitting}
            error={error}
            success={success}
          />
        </form>

      </div>
    </div>
  );
}
