const STATUS_STYLES = {
  "New Referral":       "bg-slate-100 text-slate-700 border border-slate-200",
  "Contact Attempted":  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "Forms Sent":         "bg-blue-50 text-blue-700 border border-blue-200",
  "Forms Received":     "bg-indigo-50 text-indigo-700 border border-indigo-200",
  "Insurance Pending":  "bg-orange-50 text-orange-700 border border-orange-200",
  "Insurance Verified": "bg-teal-50 text-teal-700 border border-teal-200",
  "Ready to Schedule":  "bg-green-50 text-green-700 border border-green-200",
  "Scheduled":          "bg-purple-50 text-purple-700 border border-purple-200",
  "Closed":             "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
