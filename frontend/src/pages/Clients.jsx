import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Plus, X, Save } from "lucide-react";
import { toast } from "sonner";
import PriorityBadge from "../components/PriorityBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getClients, getIntakeCases, createClient } from "../api/client";

const INITIAL_CLIENT_FORM = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  guardian_name: "",
  phone: "",
  email: "",
  referral_source: "",
  priority_level: "Normal",
};

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [clientForm, setClientForm] = useState(INITIAL_CLIENT_FORM);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cl, ca] = await Promise.all([getClients(), getIntakeCases()]);
      setClients(cl);
      setCases(ca);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const caseMap = cases.reduce((acc, c) => {
    acc[c.client_id] = c.id;
    return acc;
  }, {});

  const filtered = clients.filter(c => {
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  const updateForm = (field, value) => {
    setClientForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setClientForm(INITIAL_CLIENT_FORM);
    setFormError(null);
    setShowForm(false);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!clientForm.first_name.trim() || !clientForm.last_name.trim()) {
      setFormError("First name and last name are required.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...clientForm,
        first_name: clientForm.first_name.trim(),
        last_name: clientForm.last_name.trim(),
        date_of_birth: clientForm.date_of_birth || null,
        guardian_name: clientForm.guardian_name || null,
        phone: clientForm.phone || null,
        email: clientForm.email || null,
        referral_source: clientForm.referral_source || null,
      };
      await createClient(payload);
      toast.success("Client created successfully");
      resetForm();
      await loadData();
    } catch (e) {
      setFormError(e.message);
      toast.error("Unable to create client");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading clients…" />;

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
          <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">{clients.length} total clients</p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          New Client
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-800">Add New Client</h2>
              <p className="text-xs text-slate-400 mt-0.5">Demo data only — do not enter real patient information.</p>
            </div>

            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 shrink-0">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateClient} className="p-4 sm:p-6">
            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">First Name *</label>
                <input
                  value={clientForm.first_name}
                  onChange={e => updateForm("first_name", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Avery"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Last Name *</label>
                <input
                  value={clientForm.last_name}
                  onChange={e => updateForm("last_name", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Taylor"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={clientForm.date_of_birth}
                  onChange={e => updateForm("date_of_birth", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Priority</label>
                <select
                  value={clientForm.priority_level}
                  onChange={e => updateForm("priority_level", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {["Low", "Normal", "High", "Urgent"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Guardian</label>
                <input
                  value={clientForm.guardian_name}
                  onChange={e => updateForm("guardian_name", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone</label>
                <input
                  value={clientForm.phone}
                  onChange={e => updateForm("phone", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="555-0100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={e => updateForm("email", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="demo@email.test"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Referral Source</label>
                <input
                  value={clientForm.referral_source}
                  onChange={e => updateForm("referral_source", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Physician Referral"
                />
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
                {saving ? "Saving…" : "Save Client"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative w-full sm:w-auto">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search client…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <span className="sm:ml-auto text-xs text-slate-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No clients found" message="Try a different search term or add a new client." />
        ) : (
          <div className="overflow-x-auto rounded-b-xl">
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
                    <tr
                      key={c.id}
                      onClick={() => caseId && navigate(`/intake-cases/${caseId}`)}
                      className={`border-b border-slate-50 transition-colors ${caseId ? "hover:bg-slate-50 cursor-pointer" : ""}`}
                    >
                      <td className="px-6 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                        {c.first_name} {c.last_name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.date_of_birth || "—"}</td>
                      <td className="px-4 py-3.5"><PriorityBadge priority={c.priority_level} /></td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.referral_source || "—"}</td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.phone || "—"}</td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.guardian_name || "—"}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
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
