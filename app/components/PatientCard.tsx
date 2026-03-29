"use client";

import Link from "next/link";
import { DashboardEntry } from "../types";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../utils/formatDate";

interface Props {
  entry: DashboardEntry;
  onRecord: (entry: DashboardEntry) => void;
}

function resolveDisplayStatus(entry: DashboardEntry): "kasni" | "danas" | "nadolazece" {
  if (entry.status === "kasni") return "kasni";
  const today = new Date().toISOString().split("T")[0];
  if (entry.planned_date === today) return "danas";
  return "nadolazece";
}

export function PatientCard({ entry, onRecord }: Props) {
  const displayStatus = resolveDisplayStatus(entry);

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/patient/${entry.patient_id}`}
            className="font-semibold text-gray-900 truncate hover:text-blue-600"
          >
            {entry.ime_prezime}
          </Link>
          <StatusBadge status={displayStatus} />
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{entry.patient_id}</div>
        <div className="text-sm text-gray-600 mt-1">
          Planirana: <span className="font-medium">{formatDate(entry.planned_date)}</span>
        </div>
      </div>
      <button
        onClick={() => onRecord(entry)}
        className="shrink-0 text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800"
      >
        Unesi dozu
      </button>
    </div>
  );
}
