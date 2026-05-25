const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("cf_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (res.status === 401) {
    localStorage.removeItem("cf_token");
    window.location.href = "/login";
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.status === 204 ? null : res.json();
}

// Auth
export const login = (username, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

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
