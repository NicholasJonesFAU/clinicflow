import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import PriorityBadge from "../components/PriorityBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getClients, getIntakeCases } from "../api/client";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([getClients(), getIntakeCases()])
      .then(([cl, ca]) => { setClients(cl); setCases(ca); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Map client_id → case id
  const caseMap = cases.reduce((acc, c) => {
    acc[c.client_id] = c.id;
    return acc;
  }, {});

  const filtered = clients.filter(c => {
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  if (loading) return <LoadingSpinner message="Loading clients…" />;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg m-8">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">{clients.length} total clients</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text" placeholder="Search client…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No clients found" message="Try a different search term." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Date of Birth</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Referral Source</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Guardian</th>
                  <th className="px-4 py-3 text-left font-medium">Case</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const caseId = caseMap[c.id];
                  return (
                    <tr key={c.id}
                      onClick={() => caseId && navigate(`/intake-cases/${caseId}`)}
                      className={`border-b border-slate-50 transition-colors ${caseId ? "hover:bg-slate-50 cursor-pointer" : ""}`}>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {c.first_name} {c.last_name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{c.date_of_birth || "—"}</td>
                      <td className="px-4 py-3.5"><PriorityBadge priority={c.priority_level} /></td>
                      <td className="px-4 py-3.5 text-slate-500">{c.referral_source || "—"}</td>
                      <td className="px-4 py-3.5 text-slate-500">{c.phone || "—"}</td>
                      <td className="px-4 py-3.5 text-slate-500">{c.guardian_name || "—"}</td>
                      <td className="px-4 py-3.5">
                        {caseId
                          ? <span className="text-blue-600 text-xs font-medium">View Case →</span>
                          : <span className="text-slate-300 text-xs italic">No case</span>
                        }
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {caseId && <ChevronRight size={16} />}
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
