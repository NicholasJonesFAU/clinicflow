import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "No results",
  message = "Nothing to show here yet.",
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>

      <h3 className="text-sm font-semibold text-slate-700">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
