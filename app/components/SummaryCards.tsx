import { GroupedDashboard } from "../types";

interface Props {
  data: GroupedDashboard;
}

export function SummaryCards({ data }: Props) {
  const cards = [
    {
      label: "Kasni",
      count: data.overdue.length,
      color: "bg-red-50 border-red-200 text-red-700",
      countColor: "text-red-600",
    },
    {
      label: "Danas",
      count: data.today.length,
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
      countColor: "text-yellow-600",
    },
    {
      label: "Nadolazeće",
      count: data.upcoming.length,
      color: "bg-blue-50 border-blue-200 text-blue-700",
      countColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {cards.map((c) => (
        <div key={c.label} className={`border rounded-lg p-4 ${c.color}`}>
          <div className={`text-3xl font-bold ${c.countColor}`}>{c.count}</div>
          <div className="text-sm font-medium mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
