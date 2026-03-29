"use client";

import { useState } from "react";
import { DashboardEntry } from "../types";
import { formatDate } from "../utils/formatDate";

interface Props {
  entry: DashboardEntry;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordDoseModal({ entry, onClose, onSuccess }: Props) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/dose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapy_id: entry.therapy_id,
          actual_date: date,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error ?? `Greška: ${res.status}`);
        return;
      }

      setSuccess(true);
      onSuccess();
      setTimeout(() => onClose(), 1500);
    } catch {
      setError("Greška pri slanju zahtjeva.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
          <div className="text-green-600 text-3xl mb-2">✓</div>
          <p className="font-semibold text-gray-900">Doza uspješno unesena</p>
          <p className="text-sm text-gray-500 mt-1">{entry.ime_prezime}</p>
        </div>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900">Unesi dozu</h2>
          <button
            type="button"
            aria-label="Zatvori"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {entry.ime_prezime} &mdash; planirana: {formatDate(entry.planned_date)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum primjene
            </label>
            <input
              type="date"
              value={date}
              max={todayStr}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              Greška pri unosu doze: {error}
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Spremanje..." : "Potvrdi dozu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
