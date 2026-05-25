import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronRight, Plus, X, Save } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import InsuranceBadge from "../components/InsuranceBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getClients, getIntakeCases, getStaff, createIntakeCase } from "../api/client";

const STATUSES = [
  "New Referral", "Contact Attempted", "Forms Sent", "Forms Received",
  "Insurance Pending", "Insurance Verified", "Ready to Schedule", "Scheduled", "Closed",
];
const ACTIVE_STATUSES = STATUSES.filter(s => !["Scheduled", "Closed"].includes(s));
const INSURANCE_STATUSES = ["Not Started", "Pending", "Verified", "Issue Found"];
const DOC_OPTIONS = ["Intake Form", "Consent Form", "Insurance Card", "Guardian ID", "Referral Packet"];

const INITIAL_CASE_FORM = {
  client_id: "",
  status: "New Referral",
  assigned_to: "",
  insurance_status: "Not Started",
  missing_documents: [],
  last_contact_date: "",
  next_follow_up_date: "",
  notes: "",
};

function isOverdue(c) {
  if (!c.next_follow_up_date) return false;
  return new Date(c.next_follow_up_date) < new Date(new Date().toDateString());
}

function isStuck(c) {
  const closed = ["Closed", "Scheduled"];
  if (closed.includes(c.status)) return false;
  return (Date.now() - new Date(c.updated_at)) / 86400000 > 7;
}

function hasMissingDocuments(c) {
  return Array.isArray(c.missing_documents) && c.missing_documents.length > 0;
}

function staffName(staff, id) {
  if (!id) return null;
  return staff.find(s => Number(s.id) === Number(id))?.name || `Staff #${id}`;
}

function clientName(client) {
  if (!client) return "Unknown Client";
  return `${client.first_name} ${client.last_name}`;
}

export default function IntakeCases() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [caseForm, setCaseForm] = useState(INITIAL_CASE_FORM);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");
  const [filterPriority, setFilterPriority] = useState(searchParams.get("priority") || "");
  const [filterPriorityGroup, setFilterPriorityGroup] = useState(searchParams.get("priority_group") || "");
  const [filterStaff, setFilterStaff] = useState(searchParams.get("assigned_to") || "");
  const [filterInsurance, setFilterInsurance] = useState(searchParams.get("insurance_status") || "");
  const [filterFlag, setFilterFlag] = useState(searchParams.get("flag") || "");
  const [activeOnly, setActiveOnly] = useState(searchParams.get("active") === "true");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [caseRows, staffRows, clientRows] = await Promise.all([
        getIntakeCases(),
        getStaff(),
        getClients(),
      ]);
      setCases(caseRows);
      setStaff(staffRows);
      setClients(clientRows);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const next = {};
    if (search) next.search = search;
    if (filterStatus) next.status = filterStatus;
    if (filterPriority) next.priority = filterPriority;
    if (filterPriorityGroup) next.priority_group = filterPriorityGroup;
    if (filterStaff) next.assigned_to = filterStaff;
    if (filterInsurance) next.insurance_status = filterInsurance;
    if (filterFlag) next.flag = filterFlag;
    if (activeOnly) next.active = "true";
    setSearchParams(next, { replace: true });
  }, [search, filterStatus, filterPriority, filterPriorityGroup, filterStaff, filterInsurance, filterFlag, activeOnly, setSearchParams]);

  const filtered = cases.filter(c => {
    const name = `${c.client?.first_name || ""} ${c.client?.last_name || ""}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (activeOnly && !ACTIVE_STATUSES.includes(c.status)) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterPriority && c.client?.priority_level !== filterPriority) return false;
    if (filterPriorityGroup === "high_urgent" && !["High", "Urgent"].includes(c.client?.priority_level)) return false;
    if (filterStaff && Number(c.assigned_to) !== Number(filterStaff)) return false;
    if (filterInsurance && c.insurance_status !== filterInsurance) return false;

    if (filterFlag === "missing_documents" && !hasMissingDocuments(c)) return false;
    if (filterFlag === "stuck" && !isStuck(c)) return false;
    if (filterFlag === "overdue" && !isOverdue(c)) return false;
    if (filterFlag === "missing_docs_no_followup" && !(hasMissingDocuments(c) && !c.next_follow_up_date)) return false;
    if (filterFlag === "unassigned" && c.assigned_to) return false;
    if (filterFlag === "high_priority_not_contacted") {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const highPriority = ["High", "Urgent"].includes(c.client?.priority_level);
      const noRecentContact = !c.last_contact_date || new Date(c.last_contact_date) < threeDaysAgo;
      if (!(ACTIVE_STATUSES.includes(c.status) && highPriority && noRecentContact)) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterPriority("");
    setFilterPriorityGroup("");
    setFilterStaff("");
    setFilterInsurance("");
    setFilterFlag("");
    setActiveOnly(false);
  };

  const hasFilters = search || filterStatus || filterPriority || filterPriorityGroup || filterStaff || filterInsurance || filterFlag || activeOnly;

  const filterSummary = [];
  if (activeOnly) filterSummary.push("Active cases");
  if (filterStatus) filterSummary.push(filterStatus);
  if (filterPriority) filterSummary.push(`${filterPriority} priority`);
  if (filterPriorityGroup === "high_urgent") filterSummary.push("High / Urgent priority");
  if (filterStaff) filterSummary.push(`Assigned to ${staffName(staff, filterStaff)}`);
  if (filterInsurance) filterSummary.push(`${filterInsurance} insurance`);
  if (filterFlag === "missing_documents") filterSummary.push("Missing documents");
  if (filterFlag === "stuck") filterSummary.push("Stuck over 7 days");
  if (filterFlag === "overdue") filterSummary.push("Overdue follow-up");
  if (filterFlag === "missing_docs_no_followup") filterSummary.push("Missing docs + no follow-up");
  if (filterFlag === "unassigned") filterSummary.push("Unassigned");
  if (filterFlag === "high_priority_not_contacted") filterSummary.push("High priority not contacted");

  const updateForm = (field, value) => {
    setCaseForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setCaseForm(INITIAL_CASE_FORM);
    setFormError(null);
    setShowForm(false);
  };

  const toggleMissingDoc = (doc) => {
    setCaseForm(prev => {
      const docs = prev.missing_documents.includes(doc)
        ? prev.missing_documents.filter(item => item !== doc)
        : [...prev.missing_documents, doc];
      return { ...prev, missing_documents: docs };
    });
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!caseForm.client_id) {
      setFormError("Please select a client for this intake case.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        client_id: Number(caseForm.client_id),
        status: caseForm.status,
        assigned_to: caseForm.assigned_to ? Number(caseForm.assigned_to) : null,
        insurance_status: caseForm.insurance_status,
        missing_documents: caseForm.missing_documents,
        last_contact_date: caseForm.last_contact_date || null,
        next_follow_up_date: caseForm.next_follow_up_date || null,
        notes: caseForm.notes.trim(),
      };

      const created = await createIntakeCase(payload);
      resetForm();
      await loadData();
      navigate(`/intake-cases/${created.id}`);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading cases…" />;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg m-8">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Intake Cases</h1>
          <p className="text-slate-500 text-sm mt-1">
            {hasFilters ? `${filtered.length} matching cases` : `${cases.length} total cases`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Intake Case
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Create Intake Case</h2>
              <p className="text-xs text-slate-400 mt-0.5">Create a demo intake workflow record for an existing fake client.</p>
            </div>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateCase} className="p-6">
            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="xl:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Client *</label>
                <select
                  value={caseForm.client_id}
                  onChange={e => updateForm("client_id", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {clientName(client)} · {client.priority_level} priority
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                <select
                  value={caseForm.status}
                  onChange={e => updateForm("status", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Assigned To</label>
                <select
                  value={caseForm.assigned_to}
                  onChange={e => updateForm("assigned_to", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Insurance Status</label>
                <select
                  value={caseForm.insurance_status}
                  onChange={e => updateForm("insurance_status", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {INSURANCE_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Last Contact Date</label>
                <input
                  type="date"
                  value={caseForm.last_contact_date}
                  onChange={e => updateForm("last_contact_date", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Next Follow-up Date</label>
                <input
                  type="date"
                  value={caseForm.next_follow_up_date}
                  onChange={e => updateForm("next_follow_up_date", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 xl:col-span-4">
                <label className="block text-xs font-medium text-slate-500 mb-2">Missing Documents</label>
                <div className="flex flex-wrap gap-2">
                  {DOC_OPTIONS.map(doc => {
                    const selected = caseForm.missing_documents.includes(doc);
                    return (
                      <button
                        type="button"
                        key={doc}
                        onClick={() => toggleMissingDoc(doc)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                          selected
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {doc}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2 xl:col-span-4">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Notes</label>
                <textarea
                  value={caseForm.notes}
                  onChange={e => updateForm("notes", e.target.value)}
                  rows={3}
                  placeholder="Add operational intake notes…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? "Creating…" : "Create Case"}
              </button>
            </div>
          </form>
        </div>
      )}

      {hasFilters && filterSummary.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Viewing:</span>
          {filterSummary.map(item => (
            <span key={item} className="text-xs bg-white text-blue-700 border border-blue-100 rounded-full px-2.5 py-1 font-medium">
              {item}
            </span>
          ))}
          <button onClick={clearFilters} className="ml-auto text-xs text-blue-600 hover:text-blue-800 underline">
            Clear view
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text" placeholder="Search client…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Status</option>
            {STATUSES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setFilterPriorityGroup(""); }} className="border border-slate-200 rounded-lg text-sm px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Priority</option>
            {["Low", "Normal", "High", "Urgent"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Staff</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterInsurance} onChange={e => setFilterInsurance(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Insurance</option>
            {INSURANCE_STATUSES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-slate-600 underline">
              Clear all
            </button>
          )}

          <span className="ml-auto text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No cases found" message="Try adjusting your search or filters, or create a new intake case." />
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
                        {staffName(staff, c.assigned_to) || <span className="text-slate-300 italic">Unassigned</span>}
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
                          {stuck && <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full border border-purple-100 font-medium">Stuck</span>}
                          {hasMissingDocuments(c) && <span className="bg-amber-50 text-amber-600 text-xs px-2 py-0.5 rounded-full border border-amber-100 font-medium">Docs</span>}
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
