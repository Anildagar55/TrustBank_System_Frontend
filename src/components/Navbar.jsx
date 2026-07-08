import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Landmark, ArrowLeftRight, HandCoins, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useBank } from "../context/BankContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Landmark },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/loans", label: "Loans", icon: HandCoins },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];

export default function Navbar() {
  const { user, logout } = useBank();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = (user?.name || "")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-3 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-16">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 font-display font-bold text-lg text-ink-text"
        >
          <svg width="26" height="26" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="12" fill="#0F4C81" />
            <path d="M32 12l18 9v4H14v-4l18-9z" fill="#fff" />
            <rect x="16" y="27" width="6" height="18" fill="#fff" />
            <rect x="29" y="27" width="6" height="18" fill="#fff" />
            <rect x="42" y="27" width="6" height="18" fill="#fff" />
            <rect x="12" y="47" width="40" height="5" rx="1" fill="#fff" />
          </svg>
          TrustBank
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brass/10 text-brass"
                    : "text-slate-500 hover:text-ink-text hover:bg-paper-3"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brass text-white flex items-center justify-center text-xs font-semibold">
                {initials || "U"}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-ink-text">{user.name}</p>
                <p className="text-xs text-slate-400">Customer #{String(user.id).padStart(4, "0")}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-oxblood transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>

        <button className="md:hidden text-ink-text" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-3 bg-white px-5 py-3 flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-brass/10 text-brass" : "text-slate-500"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-oxblood font-medium"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
