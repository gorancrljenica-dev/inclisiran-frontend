import { LipidEntry } from "../types";
import { formatDate } from "../utils/formatDate";

interface Props {
  history: LipidEntry[];
}

const TYPE_LABEL: Record<string, string> = {
  initial: "Inicijalna",
  "3m":    "3 mj.",
  "6m":    "6 mj.",
};

function trend(current: number | null, previous: number | null): string {
  if (current === null || previous === null) return "";
  if (current < previous) return " ↓";
  if (current > previous) return " ↑";
  return " —";
}

function trendClass(current: number | null, previous: number | null): string {
  if (current === null || previous === null) return "";
  if (current < previous) return "text-green-600";
  if (current > previous) return "text-red-600";
  return "text-gray-400";
}

function Val({
  label,
  value,
  prev,
}: {
  label: string;
  value: number | null;
  prev: number | null;
}) {
  if (value === null) return null;
  const t = trend(value, prev);
  const tc = trendClass(value, prev);
  return (
    <span className="text-xs text-gray-600">
      <span className="text-gray-400">{label} </span>
      {value.toFixed(1)}
      {t && <span className={`font-semibold ${tc}`}>{t}</span>}
    </span>
  );
}

export function LipidHistory({ history }: Props) {
  if (history.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Lipidni trend
      </h2>
      <div className="space-y-2">
        {history.map((entry, i) => {
          const prev = history[i + 1] ?? null;
          return (
            <div
              key={entry.date + i}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(entry.date)}
                </span>
                {entry.dose_type && (
                  <span className="text-xs text-gray-400">
                    {TYPE_LABEL[entry.dose_type] ?? entry.dose_type}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <Val label="LDL"   value={entry.ldl}          prev={prev?.ldl ?? null} />
                <Val label="HDL"   value={entry.hdl}          prev={prev?.hdl ?? null} />
                <Val label="Trig." value={entry.trigliceridi} prev={prev?.trigliceridi ?? null} />
                <Val label="Ukup." value={entry.ukupni}       prev={prev?.ukupni ?? null} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
