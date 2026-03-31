"use client";

import { useState } from "react";
import { DashboardEntry } from "../types";
import { formatDate } from "../utils/formatDate";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { Toast, useToast } from "./Toast";
import { API_URL } from "../utils/api";

interface Props {
  entry: DashboardEntry;
  onClose: () => void;
  onSuccess: () => void;
}

interface LipidValues {
  ldl: string;
  hdl: string;
  trigliceridi: string;
  ukupni: string;
}

export function RecordDoseModal({ entry, onClose, onSuccess }: Props) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [showLipids, setShowLipids] = useState(false);
  const [lipids, setLipids] = useState<LipidValues>({ ldl: "", hdl: "", trigliceridi: "", ukupni: "" });
  const { loading, error, execute } = useAsyncAction();
  const { toast, show: showToast, hide: hideToast } = useToast();

  function handleLipidChange(field: keyof LipidValues, value: string) {
    setLipids((prev) => ({ ...prev, [field]: value }));
  }

  function buildLipidi(): object | undefined {
    const l = {
      ldl:          lipids.ldl          ? parseFloat(lipids.ldl)          : null,
      hdl:          lipids.hdl          ? parseFloat(lipids.hdl)          : null,
      trigliceridi: lipids.trigliceridi ? parseFloat(lipids.trigliceridi) : null,
      ukupni:       lipids.ukupni       ? parseFloat(lipids.ukupni)       : null,
    };
    const hasAny = Object.values(l).some((v) => v !== null);
    return hasAny ? l : undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const ok = await execute(async () => {
      const lipidi = showLipids ? buildLipidi() : undefined;
      const res = await fetch(`${API_URL}/dose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapy_id: entry.therapy_id,
          actual_date: date,
          ...(lipidi ? { lipidi } : {}),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Greška: ${res.status}`);
      }
      // 2xx — success; response body is not needed
    });

    if (ok) {
      showToast("Doza uspješno unesena", "success");
      onSuccess();
      onClose();
    } else {
      showToast("Greška pri unosu doze", "error");
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onHide={hideToast} />}

      <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">Unesi dozu</h2>
            <button
              type="button"
              aria-label="Zatvori"
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none disabled:opacity-50"
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

            {/* Collapsible lipid section */}
            <div>
              <button
                type="button"
                onClick={() => setShowLipids((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                <span>{showLipids ? "▲" : "▼"}</span>
                Lipidni nalaz (opcionalno)
              </button>

              {showLipids && (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {(["ldl", "hdl", "trigliceridi", "ukupni"] as (keyof LipidValues)[]).map((field) => (
                      <div key={field}>
                        <label className="block text-xs text-gray-500 mb-0.5 capitalize">
                          {field === "ukupni" ? "Ukupni kol." : field.toUpperCase()} (mmol/L)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={lipids[field]}
                          onChange={(e) => handleLipidChange(field, e.target.value)}
                          placeholder="npr. 3.5"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Odustani
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Spremanje..." : "Potvrdi dozu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
