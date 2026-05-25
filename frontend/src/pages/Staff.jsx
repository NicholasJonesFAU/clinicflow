import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getStaff, getIntakeCases } from "../api/client";

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getStaff(), getIntakeCases()])
      .then(([s, c]) => { setStaff(s); setCases(c); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Active (non-closed) cases per staff
  const activeCaseCount = cases.filter(c => c.status !== "Closed");
  const totalActive = activeCaseCount.length;

  const staffWithCounts = staff.map(s => {
    const count = activeCaseCount.filter(c => c.assigned_to === s.name).length;
    const pct = totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;
    return { ...s, caseCount: count, pct };
  });

  if (loading) return <LoadingSpinner message="Loading staff…" />;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg m-8">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-800">Staff</h1>
        <p className="text-slate-500 text-sm mt-1">{staff.length} team members</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {staff.length === 0 ? (
          <EmptyState title="No staff found" icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Active Cases</th>
                  <th className="px-4 py-3 text-left font-medium">Workload</th>
                </tr>
              </thead>
              <tbody>
                {staffWithCounts.map(s => (
                  <tr key={s.id} className="border-b border-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                    <td className="px-4 py-4 text-slate-500">{s.role}</td>
                    <td className="px-4 py-4 text-slate-500">{s.email}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        s.active
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}>
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${s.pct >= 33 ? "text-amber-600" : "text-slate-700"}`}>
                        {s.caseCount}
                      </span>
                      <span className="text-slate-400 text-xs ml-1">cases</span>
                    </td>
                    <td className="px-4 py-4 w-44">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${s.pct >= 33 ? "bg-amber-400" : "bg-blue-400"}`}
                            style={{ width: `${Math.min(s.pct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium w-8 text-right ${s.pct >= 33 ? "text-amber-600" : "text-slate-500"}`}>
                          {s.pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unassigned note */}
      {(() => {
        const unassigned = activeCaseCount.filter(c => !c.assigned_to).length;
        return unassigned > 0 ? (
          <p className="mt-4 text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            ⚠️ <span className="font-medium">{unassigned} active case{unassigned > 1 ? "s" : ""}</span> currently unassigned.
          </p>
        ) : null;
      })()}
    </div>
  );
}
