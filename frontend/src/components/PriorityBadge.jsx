const PRIORITY_STYLES = {
  Low:    "bg-gray-100 text-gray-500 border border-gray-200",
  Normal: "bg-sky-50 text-sky-700 border border-sky-200",
  High:   "bg-amber-50 text-amber-700 border border-amber-200",
  Urgent: "bg-red-50 text-red-700 border border-red-200",
};

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {priority}
    </span>
  );
}
