import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Users,
  UserCog, Lightbulb, Activity, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/",             label: "Dashboard",    icon: LayoutDashboard },
  { to: "/intake-cases", label: "Intake Cases", icon: ClipboardList },
  { to: "/clients",      label: "Clients",      icon: Users },
  { to: "/staff",        label: "Staff",        icon: UserCog },
  { to: "/insights",     label: "Insights",     icon: Lightbulb },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-60 min-h-screen bg-slate-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="bg-blue-500 rounded-lg p-1.5">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-base tracking-tight">ClinicFlow</span>
          <p className="text-slate-500 text-[10px] leading-none mt-0.5">Intake Operations</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut size={17} />
          Sign out
        </button>
        <p className="text-slate-600 text-[10px] px-3">Demo Mode · Fake Data Only</p>
      </div>
    </aside>
  );
}
