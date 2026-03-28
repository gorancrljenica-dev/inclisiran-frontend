type StatusKey = "kasni" | "danas" | "nadolazece";

const config: Record<StatusKey, { label: string; classes: string }> = {
  kasni: {
    label: "Kasni",
    classes: "bg-red-100 text-red-700 border border-red-200",
  },
  danas: {
    label: "Danas",
    classes: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  nadolazece: {
    label: "Nadolazeće",
    classes: "bg-blue-100 text-blue-700 border border-blue-200",
  },
};

interface Props {
  status: StatusKey;
}

export function StatusBadge({ status }: Props) {
  const { label, classes } = config[status];
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${classes}`}>
      {label}
    </span>
  );
}
