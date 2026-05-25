import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert, UserX, AlertTriangle,
  FileX, UserMinus, ThumbsUp, Lightbulb, ArrowRight,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getInsights, getStaff } from "../api/client";

const SEVERITY_STYLES = {
  critical: {
    card:  "bg-red-50 border-red-200 hover:border-red-300",
    icon:  "bg-red-100 text-red-600",
    title: "text-red-800",
    msg:   "text-red-700",
    badge: "bg-red-100 text-red-600 border border-red-200",
    link:  "text-red-700 hover:text-red-900",
  },
  warning: {
    card:  "bg-amber-50 border-amber-200 hover:border-amber-300",
    icon:  "bg-amber-100 text-amber-600",
    title: "text-amber-800",
    msg:   "text-amber-700",
    badge: "bg-amber-100 text-amber-600 border border-amber-200",
    link:  "text-amber-700 hover:text-amber-900",
  },
  info: {
    card:  "bg-blue-50 border-blue-100 hover:border-blue-200",
    icon:  "bg-blue-100 text-blue-600",
    title: "text-blue-800",
    msg:   "text-blue-700",
    badge: "bg-blue-100 text-blue-600 border border-blue-100",
    link:  "text-blue-700 hover:text-blue-900",
  },
};

const TYPE_ICON = {
  insurance_waiting:           ShieldAlert,
  high_priority_not_contacted: AlertTriangle,
  workload_imbalance:          UserX,
  ready_to_schedule:           ThumbsUp,
  missing_docs_no_followup:    FileX,
  unassigned_cases:            UserMinus,
  insurance_issue:             ShieldAlert,
};

const TYPE_TITLE = {
  insurance_waiting:           "Insurance Verification Queue",
  high_priority_not_contacted: "High-Priority Follow-up Risk",
  workload_imbalance:          "Workload Imbalance",
  ready_to_schedule:           "Ready for Scheduling",
  missing_docs_no_followup:    "Missing Documents Without Follow-up",
  unassigned_cases:            "Unassigned Active Cases",
  insurance_issue:             "Insurance Issue Found",
};

function buildInsightLink(insight, staff) {
  const params = new URLSearchParams();

  switch (insight.type) {
    case "insurance_waiting":
      params.set("active", "true");
      params.set("insurance_status", "Pending");
      break;
    case "high_priority_not_contacted":
      params.set("active", "true");
      params.set("flag", "high_priority_not_contacted");
      break;
    case "workload_imbalance": {
      const matchedStaff = staff.find(s => insight.message?.startsWith(`${s.name} has`));
      params.set("active", "true");
      if (matchedStaff) params.set("assigned_to", matchedStaff.id);
      break;
    }
    case "ready_to_schedule":
      params.set("status", "Ready to Schedule");
      break;
    case "missing_docs_no_followup":
      params.set("active", "true");
      params.set("flag", "missing_docs_no_followup");
      break;
    case "unassigned_cases":
      params.set("active", "true");
      params.set("flag", "unassigned");
      break;
    case "insurance_issue":
      params.set("active", "true");
      params.set("insurance_status", "Issue Found");
      break;
    default:
      params.set("active", "true");
  }

  const qs = params.toString();
  return `/intake-cases${qs ? `?${qs}` : ""}`;
}

export default function Insights() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getInsights(), getStaff()])
      .then(([i, s]) => { setInsights(i); setStaff(s); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Analyzing operations…" />;

  if (error) {
    return (
      <div className="p-4 sm:p-8 text-red-600 bg-red-50 rounded-lg m-4 sm:m-8">
        Error: {error}
      </div>
    );
  }

  const counts = { critical: 0, warning: 0, info: 0 };
  insights.forEach(i => { if (counts[i.severity] !== undefined) counts[i.severity]++; });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-800">Operational Insights</h1>
        <p className="text-slate-500 text-sm mt-1">
          Rule-based analysis from current intake data
        </p>
      </div>

      {insights.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
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
            const title = insight.title || TYPE_TITLE[insight.type] || "Operational Insight";
            const target = buildInsightLink(insight, staff);

            return (
              <button
                key={i}
                onClick={() => navigate(target)}
                className={`w-full text-left rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-sm ${styles.card}`}
              >
                <div className={`rounded-lg p-2.5 h-fit w-fit shrink-0 ${styles.icon}`}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start sm:items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className={`font-semibold text-sm ${styles.title}`}>
                      {title}
                    </h3>

                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${styles.badge}`}>
                      {insight.severity}
                    </span>
                  </div>

                  <p className={`text-sm leading-relaxed ${styles.msg}`}>
                    {insight.message}
                  </p>

                  <span className={`inline-flex items-center gap-1 mt-3 text-xs font-semibold ${styles.link}`}>
                    View matching cases <ArrowRight size={13} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-xs text-slate-400 border-t border-slate-100 pt-4 leading-relaxed">
        Insights are generated from rule-based logic using live data. Click an insight to view the matching intake cases.
      </p>
    </div>
  );
}
