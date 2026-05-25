import { useState, useEffect } from "react";
import {
  ShieldAlert, UserX, AlertTriangle, CalendarX,
  FileX, UserMinus, ThumbsUp, Lightbulb,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getInsights } from "../api/client";

const SEVERITY_STYLES = {
  critical: {
    card:  "bg-red-50 border-red-200",
    icon:  "bg-red-100 text-red-600",
    title: "text-red-800",
    msg:   "text-red-700",
    badge: "bg-red-100 text-red-600 border border-red-200",
  },
  warning: {
    card:  "bg-amber-50 border-amber-200",
    icon:  "bg-amber-100 text-amber-600",
    title: "text-amber-800",
    msg:   "text-amber-700",
    badge: "bg-amber-100 text-amber-600 border border-amber-200",
  },
  info: {
    card:  "bg-blue-50 border-blue-100",
    icon:  "bg-blue-100 text-blue-600",
    title: "text-blue-800",
    msg:   "text-blue-700",
    badge: "bg-blue-100 text-blue-600 border border-blue-100",
  },
};

const TYPE_ICON = {
  insurance_waiting:          ShieldAlert,
  high_priority_not_contacted: AlertTriangle,
  workload_imbalance:          UserX,
  ready_to_schedule:           ThumbsUp,
  missing_docs_no_followup:    FileX,
  unassigned_cases:            UserMinus,
  insurance_issue:             ShieldAlert,
};

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Analyzing operations…" />;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg m-8">Error: {error}</div>;

  const counts = { critical: 0, warning: 0, info: 0 };
  insights.forEach(i => { if (counts[i.severity] !== undefined) counts[i.severity]++; });

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-800">Operational Insights</h1>
        <p className="text-slate-500 text-sm mt-1">Rule-based analysis from current intake data</p>
      </div>

      {/* Summary bar */}
      {insights.length > 0 && (
        <div className="flex gap-3 mb-6">
          {counts.critical > 0 && (
            <span className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-1 rounded-full font-medium">
              {counts.critical} critical
            </span>
          )}
          {counts.warning > 0 && (
            <span className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-3 py-1 rounded-full font-medium">
              {counts.warning} warning{counts.warning > 1 ? "s" : ""}
            </span>
          )}
          {counts.info > 0 && (
            <span className="bg-blue-50 border border-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
              {counts.info} info
            </span>
          )}
        </div>
      )}

      {insights.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No insights at this time"
          message="All operations look healthy. Check back as data changes."
        />
      ) : (
        <div className="space-y-4">
          {insights.map((insight, i) => {
            const styles = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info;
            const Icon = TYPE_ICON[insight.type] || Lightbulb;
            return (
              <div key={i} className={`rounded-xl border p-5 flex gap-4 ${styles.card}`}>
                <div className={`rounded-lg p-2.5 h-fit ${styles.icon}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className={`font-semibold text-sm ${styles.title}`}>{insight.title}</h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${styles.badge}`}>
                      {insight.severity}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${styles.msg}`}>{insight.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-xs text-slate-400 border-t border-slate-100 pt-4">
        Insights are generated from rule-based logic using live data. Refresh the page to recalculate.
      </p>
    </div>
  );
}
