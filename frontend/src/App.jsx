import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import IntakeCases from "./pages/IntakeCases";
import CaseDetail from "./pages/CaseDetail";
import Clients from "./pages/Clients";
import Staff from "./pages/Staff";
import Insights from "./pages/Insights";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/intake-cases" element={<IntakeCases />} />
            <Route path="/intake-cases/:id" element={<CaseDetail />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>

        <Toaster richColors position="top-right" />
      </div>
    </BrowserRouter>
  );
}
