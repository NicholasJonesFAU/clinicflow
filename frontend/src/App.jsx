import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import IntakeCases from "./pages/IntakeCases";
import CaseDetail from "./pages/CaseDetail";
import Clients from "./pages/Clients";
import Staff from "./pages/Staff";
import Insights from "./pages/Insights";

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/"                 element={<Dashboard />} />
          <Route path="/intake-cases"     element={<IntakeCases />} />
          <Route path="/intake-cases/:id" element={<CaseDetail />} />
          <Route path="/clients"          element={<Clients />} />
          <Route path="/staff"            element={<Staff />} />
          <Route path="/insights"         element={<Insights />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*"     element={<ProtectedLayout />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
