import { PatientOverview } from "../types";
import { formatDate } from "../utils/formatDate";

interface Props {
  overview: PatientOverview;
}

export function PatientStatus({ overview }: Props) {
  if (!overview.active_therapy) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
        <p className="text-sm font-medium text-gray-500">Nema aktivne terapije.</p>
      </div>
    );
  }

  const status = overview.status;
  const isOverdue = typeof status === "object" && status.label === "overdue";
  const delayedDays = typeof status === "object" ? status.delayed_days : null;

  if (isOverdue) {
    return (
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-5 mb-6">
        <div className="mb-4">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">
            Status
          </p>
          <p className="text-2xl font-bold text-red-700">
            Kasni{delayedDays != null ? ` — ${delayedDays} dana` : ""}
          </p>
        </div>
        <div className="border-t border-red-200 pt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-red-400 mb-0.5">Zadnja doza</p>
            <p className="text-sm font-semibold text-red-900">
              {overview.last_dose ? formatDate(overview.last_dose.planned_date) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-red-400 mb-0.5">Planirana doza</p>
            <p className="text-sm font-semibold text-red-900">
              {overview.next_dose ? formatDate(overview.next_dose.planned_date) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-red-400 mb-0.5">Terapija počela</p>
            <p className="text-sm font-semibold text-red-900">
              {formatDate(overview.active_therapy.start_date)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-300 rounded-lg p-5 mb-6">
      <div className="mb-4">
        <p className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-1">
          Status
        </p>
        <p className="text-2xl font-bold text-green-700">Na terapiji</p>
      </div>
      <div className="border-t border-green-200 pt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-green-500 mb-0.5">Zadnja doza</p>
          <p className="text-sm font-semibold text-green-900">
            {overview.last_dose ? formatDate(overview.last_dose.planned_date) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-green-500 mb-0.5">Sljedeća doza</p>
          <p className="text-sm font-semibold text-green-900">
            {overview.next_dose ? formatDate(overview.next_dose.planned_date) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-green-500 mb-0.5">Terapija počela</p>
          <p className="text-sm font-semibold text-green-900">
            {formatDate(overview.active_therapy.start_date)}
          </p>
        </div>
      </div>
    </div>
  );
}
