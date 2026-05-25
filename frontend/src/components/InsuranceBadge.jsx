const INSURANCE_STYLES = {
  "Not Started": "bg-gray-100 text-gray-500 border border-gray-200",
  "Pending":     "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "Verified":    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Issue Found": "bg-red-50 text-red-700 border border-red-200",
};

export default function InsuranceBadge({ status }) {
  const style = INSURANCE_STYLES[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
