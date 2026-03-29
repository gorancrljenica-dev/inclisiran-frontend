import { TherapyWithSchedules } from "../types";
import { formatDate } from "../utils/formatDate";

interface Props {
  therapies: TherapyWithSchedules[];
}

export function DoseHistory({ therapies }: Props) {
  // Executed doses = schedule entries with status "izvrseno"
  const executed = therapies
    .flatMap((t) =>
      t.schedules
        .filter((s) => s.status === "izvrseno")
        .map((s) => ({ ...s, therapyId: t.therapy.id }))
    )
    .sort((a, b) => b.planned_date.localeCompare(a.planned_date));

  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Historija doza
      </h2>

      {executed.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">Nema zabilježenih doza.</p>
      ) : (
        <div className="space-y-2">
          {executed.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
            >
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(s.planned_date)}
                </span>
                <span className="text-xs text-gray-400 ml-2">{s.type}</span>
              </div>
              <span className="text-xs text-gray-400">#{executed.length - i}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
