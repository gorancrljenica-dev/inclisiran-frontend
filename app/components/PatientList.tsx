import { DashboardEntry } from "../types";
import { PatientCard } from "./PatientCard";

interface Props {
  title: string;
  entries: DashboardEntry[];
  emptyText: string;
  onRecord: (entry: DashboardEntry) => void;
}

export function PatientList({ title, entries, emptyText, onRecord }: Props) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <PatientCard key={e.schedule_id} entry={e} onRecord={onRecord} />
          ))}
        </div>
      )}
    </section>
  );
}
