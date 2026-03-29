import Link from "next/link";

interface Props {
  patientId: string;
  patientName: string | null;
}

export function PatientHeader({ patientId, patientName }: Props) {
  return (
    <div className="mb-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-4 hover:border-gray-300"
      >
        ← Povratak na Dashboard
      </Link>
      <h1 className="text-xl font-bold text-gray-900">
        {patientName ?? patientId}
      </h1>
      {patientName && (
        <p className="text-xs text-gray-400 mt-0.5">{patientId}</p>
      )}
    </div>
  );
}
