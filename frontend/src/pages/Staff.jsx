import { useState, useEffect } from "react";
import { Users, Plus, X, Save } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getStaff, getIntakeCases, createStaff } from "../api/client";

const INITIAL_STAFF_FORM = {
  name: "",
  role: "",
  email: "",
  active: true,
};

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [staffForm, setStaffForm] = useState(INITIAL_STAFF_FORM);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, c] = await Promise.all([getStaff(), getIntakeCases()]);
      setStaff(s);
      setCases(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCaseCount = cases.filter(c => c.status !== "Closed");
  const totalActive = activeCaseCount.length;

  const staffWithCounts = staff.map(s => {
    const count = activeCaseCount.filter(c => String(c.assigned_to || "") === String(s.id)).length;
    const pct = totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;
    return { ...s, caseCount: count, pct };
  });

  const updateForm = (field, value) => {
    setStaffForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setStaffForm(INITIAL_STAFF_FORM);
    setFormError(null);
    setShowForm(false);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!staffForm.name.trim() || !staffForm.role.trim() || !staffForm.email.trim()) {
      setFormError("Name, role, and email are required.");
      setSaving(false);
      return;
    }

    try {
      await createStaff({
        name: staffForm.name.trim(),
        role: staffForm.role.trim(),
        email: staffForm.email.trim(),
        active: staffForm.active,
      });
      toast.success("Staff member created");
      resetForm();
      await loadData();
    } catch (e) {
      setFormError(e.message);
      toast.error("Unable to create staff member");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading staff…" />;

  if (error) {
    return (
      <div className="p-4 sm:p-8 text-red-600 bg-red-50 rounded-lg m-4 sm:m-8">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff</h1>
          <p className="text-slate-500 text-sm mt-1">{staff.length} team members</p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          New Staff Member
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-800">Add Staff Member</h2>
              <p className="text-xs text-slate-400 mt-0.5">Create a demo intake team member.</p>
            </div>

            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 shrink-0">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateStaff} className="p-4 sm:p-6">
            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Name *</label>
                <input
                  value={staffForm.name}
                  onChange={e => updateForm("name", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Taylor Morgan"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Role *</label>
                <input
                  value={staffForm.role}
                  onChange={e => updateForm("role", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Intake Coordinator"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={e => updateForm("email", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@clinicflow.demo"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                <select
                  value={staffForm.active ? "active" : "inactive"}
                  onChange={e => updateForm("active", e.target.value === "active")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? "Saving…" : "Save Staff"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {staff.length === 0 ? (
          <EmptyState title="No staff found" icon={Users} message="Add your first intake team member." />
        ) : (
          <div className="overflow-x-auto rounded-xl">
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
                    <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{s.name}</td>
                    <td className="px-4 py-4 text-slate-500 whitespace-nowrap">{s.role}</td>
                    <td className="px-4 py-4 text-slate-500 whitespace-nowrap">{s.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        s.active
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}>
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${s.pct >= 33 ? "text-amber-600" : "text-slate-700"}`}>
                        {s.caseCount}
                      </span>
                      <span className="text-slate-400 text-xs ml-1">cases</span>
                    </td>
                    <td className="px-4 py-4 w-44 min-w-44">
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
