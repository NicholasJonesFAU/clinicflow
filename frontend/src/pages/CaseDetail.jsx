import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, CheckSquare, Square } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import InsuranceBadge from "../components/InsuranceBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { getIntakeCase, updateIntakeCase, updateClient, deleteIntakeCase, getStaff } from "../api/client";

const DOC_OPTIONS = [
  "Intake Form", "Consent Form", "Insurance Card", "Guardian ID", "Referral Packet",
];

const STATUSES = [
  "New Referral","Contact Attempted","Forms Sent","Forms Received",
  "Insurance Pending","Insurance Verified","Ready to Schedule","Scheduled","Closed",
];

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const [status, setStatus]             = useState("");
  const [assignedTo, setAssignedTo]     = useState("");
  const [insuranceStatus, setInsurance] = useState("");
  const [priority, setPriority]         = useState("");
  const [missingDocs, setMissingDocs]   = useState([]);
  const [lastContact, setLastContact]   = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [notes, setNotes]               = useState("");

  useEffect(() => {
    Promise.all([getIntakeCase(id), getStaff()])
      .then(([c, s]) => {
        setCaseData(c);
        setStaff(s);
        setStatus(c.status);
        setAssignedTo(c.assigned_to ? String(c.assigned_to) : "");
        setInsurance(c.insurance_status);
        setPriority(c.client?.priority_level || "Normal");
        setMissingDocs(c.missing_documents || []);
        setLastContact(c.last_contact_date || "");
        setNextFollowUp(c.next_follow_up_date || "");
        setNotes(c.notes || "");
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleDoc = (doc) => {
    setMissingDocs(prev =>
      prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const savedCase = await updateIntakeCase(id, {
        status,
        assigned_to: assignedTo ? Number(assignedTo) : null,
        insurance_status: insuranceStatus,
        missing_documents: missingDocs,
        last_contact_date: lastContact || null,
        next_follow_up_date: nextFollowUp || null,
        notes,
      });

      await updateClient(caseData.client_id, { priority_level: priority });

      setCaseData(savedCase);
      setAssignedTo(savedCase.assigned_to ? String(savedCase.assigned_to) : "");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this intake case? This cannot be undone.")) return;
    try {
      await deleteIntakeCase(id);
      navigate("/intake-cases");
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading case…" />;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg m-8">Error: {error}</div>;
  if (!caseData) return null;

  const { client } = caseData;
  const isOverdue = nextFollowUp && new Date(nextFollowUp) < new Date(new Date().toDateString());
  const isStuck = !["Closed","Scheduled"].includes(status) &&
    (Date.now() - new Date(caseData.updated_at)) / 86400000 > 7;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-7">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm mb-3 transition-colors">
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800">
            {client?.first_name} {client?.last_name}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
            <InsuranceBadge status={insuranceStatus} />
            {isOverdue && <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full border border-red-100 font-medium">Overdue</span>}
            {isStuck   && <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full border border-purple-100 font-medium">Stuck</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
            <Trash2 size={15} /> Delete
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              saved
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}>
            <Save size={15} />
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Client Info</h3>
            <dl className="space-y-3 text-sm">
              {[
                ["Date of Birth",    client?.date_of_birth],
                ["Guardian",         client?.guardian_name || "—"],
                ["Phone",            client?.phone || "—"],
                ["Email",            client?.email || "—"],
                ["Referral Source",  client?.referral_source || "—"],
                ["Client Since",     client?.created_at?.slice(0,10)],
              ].map(([label, val]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-slate-400 text-xs font-medium">{label}</dt>
                  <dd className="text-slate-700">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Missing Documents</h3>
            <div className="space-y-2">
              {DOC_OPTIONS.map(doc => {
                const missing = missingDocs.includes(doc);
                return (
                  <button key={doc} onClick={() => toggleDoc(doc)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      missing ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100"
                    }`}>
                    {missing ? <CheckSquare size={15} className="text-amber-500 shrink-0" /> : <Square size={15} className="text-slate-300 shrink-0" />}
                    {doc}
                  </button>
                );
              })}
            </div>
            {missingDocs.length > 0 && (
              <p className="text-xs text-amber-600 mt-2.5">{missingDocs.length} document{missingDocs.length > 1 ? "s" : ""} missing</p>
            )}
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Intake Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {STATUSES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["Low","Normal","High","Urgent"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Insurance Status</label>
                <select value={insuranceStatus} onChange={e => setInsurance(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["Not Started","Pending","Verified","Issue Found"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Assigned To</label>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Unassigned</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Follow-up Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Last Contact Date",    value: lastContact,   set: setLastContact },
                { label: "Next Follow-up Date",  value: nextFollowUp,  set: setNextFollowUp },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                  <input type="date" value={value} onChange={e => set(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      label === "Next Follow-up Date" && isOverdue ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 text-slate-700"
                    }`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={5}
              placeholder="Add notes about this intake case…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-400 space-y-1">
            <p>Case ID: #{caseData.id} &nbsp;·&nbsp; Created: {caseData.created_at?.slice(0,10)}</p>
            <p>Last updated: {caseData.updated_at?.slice(0,10)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
