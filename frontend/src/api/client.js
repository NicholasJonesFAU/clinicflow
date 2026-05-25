const BASE = "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.status === 204 ? null : res.json();
}

// Clients
export const getClients = (search = "") =>
  request(`/clients${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const getClient = (id) => request(`/clients/${id}`);
export const createClient = (data) =>
  request("/clients", { method: "POST", body: JSON.stringify(data) });
export const updateClient = (id, data) =>
  request(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteClient = (id) =>
  request(`/clients/${id}`, { method: "DELETE" });

// Intake Cases
export const getIntakeCases = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return request(`/intake-cases${qs ? `?${qs}` : ""}`);
};
export const getIntakeCase = (id) => request(`/intake-cases/${id}`);
export const createIntakeCase = (data) =>
  request("/intake-cases", { method: "POST", body: JSON.stringify(data) });
export const updateIntakeCase = (id, data) =>
  request(`/intake-cases/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteIntakeCase = (id) =>
  request(`/intake-cases/${id}`, { method: "DELETE" });

// Staff
export const getStaff = () => request("/staff");
export const createStaff = (data) =>
  request("/staff", { method: "POST", body: JSON.stringify(data) });
export const updateStaff = (id, data) =>
  request(`/staff/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteStaff = (id) =>
  request(`/staff/${id}`, { method: "DELETE" });

// Dashboard & Insights
export const getDashboardMetrics = () => request("/dashboard/metrics");
export const getInsights = () => request("/insights");
