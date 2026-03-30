import { TherapyWithSchedules, DashboardEntry } from "../types";
import { formatDate } from "../utils/formatDate";

interface Props {
  therapies: TherapyWithSchedules[];
  patientId: string;
  patientName: string | null;
  onRecord: (entry: DashboardEntry) => void;
}

const STATUS_CONFIG: Record<string, { label: string; pillClass: string; rowClass: string }> = {
  planirano:      { label: "Planirano",              pillClass: "bg-blue-100 text-blue-700",    rowClass: "" },
  na_redu:        { label: "Na redu",                pillClass: "bg-yellow-100 text-yellow-700", rowClass: "border-yellow-300 bg-yellow-50" },
  kasni:          { label: "Kasni",                  pillClass: "bg-red-100 text-red-700",       rowClass: "border-red-300 bg-red-50" },
  izvrseno:       { label: "Izvršeno",               pillClass: "bg-green-100 text-green-700",   rowClass: "" },
  propusteno:     { label: "Propušteno",             pillClass: "bg-gray-100 text-gray-400",     rowClass: "opacity-60" },
  reset_potreban: { label: "Potreban reset terapije", pillClass: "bg-red-100 text-red-700",      rowClass: "border-red-400 bg-red-50" },
};

// Statuses where dose entry is allowed
const ACTIONABLE = new Set(["kasni", "na_redu", "reset_potreban"]);

function StatusPill({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, pillClass: "bg-gray-100 text-gray-500", rowClass: "" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.pillClass}`}>
      {config.label}
    </span>
  );
}

export function ScheduleList({ therapies, patientId, patientName, onRecord }: Props) {
  const sorted = [...therapies].sort((a, b) =>
    b.therapy.start_date.localeCompare(a.therapy.start_date)
  );

  const allSchedules = sorted.flatMap((t) =>
    t.schedules.map((s) => ({ ...s, therapyId: t.therapy.id }))
  );

  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Raspored doza
      </h2>

      {allSchedules.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">Nema planiranih doza.</p>
      ) : (
        <div className="space-y-2">
          {allSchedules.map((s) => {
            const config = STATUS_CONFIG[s.status] ?? { rowClass: "", pillClass: "bg-gray-100 text-gray-500", label: s.status };
            const actionable = ACTIONABLE.has(s.status);

            return (
              <div
                key={s.id}
                className={`flex items-center justify-between border rounded-lg px-4 py-3 bg-white ${config.rowClass || "border-gray-200"}`}
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(s.planned_date)}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{s.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={s.status} />
                  {actionable && (
                    <button
                      onClick={() =>
                        onRecord({
                          patient_id: patientId,
                          ime_prezime: patientName ?? patientId,
                          therapy_id: s.therapyId,
                          schedule_id: s.id,
                          planned_date: s.planned_date,
                          type: s.type,
                          status: "kasni",
                        })
                      }
                      className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 shrink-0"
                    >
                      Unesi dozu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
