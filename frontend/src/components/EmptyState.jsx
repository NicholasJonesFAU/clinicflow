import { Inbox } from "lucide-react";

export default function EmptyState({ title = "No results", message = "Nothing to show here yet.", icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Icon size={36} className="mb-3 text-slate-300" />
      <p className="font-medium text-slate-500">{title}</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}
