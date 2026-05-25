import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronRight } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import InsuranceBadge from "../components/InsuranceBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getIntakeCases, getStaff } from "../api/client";

function isOverdue(c) {
  if (!c.next_follow_up_date) return false;
  return new Date(c.next_follow_up_date) < new Date(new Date().toDateString());
}
function isStuck(c) {
  const closed = ["Closed", "Scheduled"];
  if (closed.includes(c.status)) return false;
  return (Date.now() - new Date(c.updated_at)) / 86400000 > 7;
}

export default function IntakeCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStaff, setFilterStaff] = useState("");
  const [filterInsurance, setFilterInsurance] = useState("");

  useEffect(() => {
    Promise.all([getIntakeCases(), getStaff()])
      .then(([c, s]) => { setCases(c); setStaff(s); })
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

  const clearFilters = () => {
    setSearch(""); setFilterStatus(""); setFilterPriority("");
    setFilterStaff(""); setFilterInsurance("");
  };
  const hasFilters = search || filterStatus || filterPriority || filterStaff || filterInsurance;

  if (loading) return <LoadingSpinner message="Loading cases…" />;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg m-8">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Intake Cases</h1>
          <p className="text-slate-500 text-sm mt-1">{cases.length} total cases</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Filters bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text" placeholder="Search client…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {[
            { val: filterStatus,    set: setFilterStatus,    label: "Status",
              opts: ["New Referral","Contact Attempted","Forms Sent","Forms Received","Insurance Pending","Insurance Verified","Ready to Schedule","Scheduled","Closed"] },
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

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-slate-600 underline">
              Clear all
            </button>
          )}

          <span className="ml-auto text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No cases found" message="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">Client</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Insurance</th>
                  <th className="px-4 py-3 text-left font-medium">Assigned To</th>
                  <th className="px-4 py-3 text-left font-medium">Follow-up</th>
                  <th className="px-4 py-3 text-left font-medium">Last Contact</th>
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
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-slate-800">{c.client?.first_name} {c.client?.last_name}</p>
                        <p className="text-xs text-slate-400">{c.client?.referral_source}</p>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3.5"><PriorityBadge priority={c.client?.priority_level} /></td>
                      <td className="px-4 py-3.5"><InsuranceBadge status={c.insurance_status} /></td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {c.assigned_to || <span className="text-slate-300 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {c.next_follow_up_date
                          ? <span className={overdue ? "text-red-600 font-medium" : "text-slate-500"}>{c.next_follow_up_date}</span>
                          : <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {c.last_contact_date || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5 flex-wrap">
                          {overdue && <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full border border-red-100 font-medium">Overdue</span>}
                          {stuck   && <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full border border-purple-100 font-medium">Stuck</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300"><ChevronRight size={16} /></td>
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
