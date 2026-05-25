import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, CalendarCheck, ShieldCheck, FileWarning,
  AlertTriangle, Clock, Search, ChevronRight,
} from "lucide-react";
import KPICard from "../components/KPICard";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import InsuranceBadge from "../components/InsuranceBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getDashboardMetrics, getIntakeCases, getStaff } from "../api/client";

const STATUSES = [
  "New Referral","Contact Attempted","Forms Sent","Forms Received",
  "Insurance Pending","Insurance Verified","Ready to Schedule","Scheduled","Closed",
];

const STATUS_DOT = {
  "New Referral":"bg-slate-400","Contact Attempted":"bg-yellow-400","Forms Sent":"bg-blue-400",
  "Forms Received":"bg-indigo-400","Insurance Pending":"bg-orange-400","Insurance Verified":"bg-teal-400",
  "Ready to Schedule":"bg-green-400","Scheduled":"bg-purple-400","Closed":"bg-gray-300",
};

function isOverdue(c) {
  if (!c.next_follow_up_date) return false;
  return new Date(c.next_follow_up_date) < new Date(new Date().toDateString());
}
function isStuck(c) {
  const closed = ["Closed","Scheduled"];
  if (closed.includes(c.status)) return false;
  const diff = (Date.now() - new Date(c.updated_at)) / 86400000;
  return diff > 7;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [cases, setCases] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStaff, setFilterStaff] = useState("");
  const [filterInsurance, setFilterInsurance] = useState("");

  useEffect(() => {
    Promise.all([getDashboardMetrics(), getIntakeCases(), getStaff()])
      .then(([m, c, s]) => { setMetrics(m); setCases(c); setStaff(s); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter(c => {
    const name = `${c.client?.first_name} ${c.client?.last_name}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterPriority && c.client?.priority_level !== filterPriority) return false;
    if (filterStaff && c.assigned_to !== filterStaff) return false;
    if (filterInsurance && c.insurance_status !== filterInsurance) return false;
    return true;
  });

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;
  if (error) return (
    <div className="p-8 text-red-600 bg-red-50 rounded-lg m-8">Error: {error}</div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Intake operations overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <KPICard title="Active Intakes"       value={metrics.total_active}          icon={ClipboardList}  color="blue"   />
        <KPICard title="Ready to Schedule"    value={metrics.ready_to_schedule}     icon={CalendarCheck}  color="green"  />
        <KPICard title="Insurance Pending"    value={metrics.insurance_pending}     icon={ShieldCheck}    color="orange" />
        <KPICard title="Missing Documents"    value={metrics.missing_documents}     icon={FileWarning}    color="amber"  />
        <KPICard title="High / Urgent"        value={metrics.high_urgent_priority}  icon={AlertTriangle}  color="red"    />
        <KPICard title="Stuck Over 7 Days"    value={metrics.stuck_over_7_days}     icon={Clock}          color="purple" />
      </div>

      {/* Pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Intake Pipeline</h2>
        </div>
        <div className="px-6 py-4 flex flex-wrap gap-3">
          {STATUSES.map(s => {
            const count = metrics.pipeline[s] ?? 0;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                  filterStatus === s
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
                <span className="font-medium">{s}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${count > 0 ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <h2 className="font-semibold text-slate-700 mr-2">Active Cases</h2>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text" placeholder="Search client…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          {[
            { val: filterStatus,    set: setFilterStatus,    label: "Status",    opts: STATUSES },
            { val: filterPriority,  set: setFilterPriority,  label: "Priority",  opts: ["Low","Normal","High","Urgent"] },
            { val: filterStaff,     set: setFilterStaff,     label: "Staff",     opts: staff.map(s => s.name) },
            { val: filterInsurance, set: setFilterInsurance, label: "Insurance", opts: ["Not Started","Pending","Verified","Issue Found"] },
          ].map(({ val, set, label, opts }) => (
            <select key={label} value={val} onChange={e => set(e.target.value)}
              className="border border-slate-200 rounded-lg text-sm px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">{label}</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          {(search || filterStatus || filterPriority || filterStaff || filterInsurance) && (
            <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterPriority(""); setFilterStaff(""); setFilterInsurance(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 underline">Clear</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No cases match" message="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">Client</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Insurance</th>
                  <th className="px-4 py-3 text-left font-medium">Assigned</th>
                  <th className="px-4 py-3 text-left font-medium">Follow-up</th>
                  <th className="px-4 py-3 text-left font-medium">Flags</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const overdue = isOverdue(c);
                  const stuck = isStuck(c);
                  return (
                    <tr key={c.id} onClick={() => navigate(`/intake-cases/${c.id}`)}
                      className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {c.client?.first_name} {c.client?.last_name}
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3.5"><PriorityBadge priority={c.client?.priority_level} /></td>
                      <td className="px-4 py-3.5"><InsuranceBadge status={c.insurance_status} /></td>
                      <td className="px-4 py-3.5 text-slate-500">{c.assigned_to || <span className="text-slate-300 italic">Unassigned</span>}</td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {c.next_follow_up_date
                          ? <span className={overdue ? "text-red-600 font-medium" : ""}>{c.next_follow_up_date}</span>
                          : <span className="text-slate-300 italic">None</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5 flex-wrap">
                          {overdue && <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full border border-red-100 font-medium">Overdue</span>}
                          {stuck   && <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full border border-purple-100 font-medium">Stuck</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        <ChevronRight size={16} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
