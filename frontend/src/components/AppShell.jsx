import React from "react";
import {
  Home, Send, ArrowLeftRight, Users, CreditCard, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "../AuthContext.jsx";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-7 w-7 rounded-lg grid place-items-center font-black text-sm bg-indigo-600 text-white">R</span>
      <span className="font-extrabold tracking-tight text-lg text-slate-900">
        RECNUVIA <span className="text-indigo-600">PRO</span>
      </span>
    </div>
  );
}

export function Sidebar({ active, onNavigate }) {
  const items = [
    { key: "overview", label: "Overview", icon: Home, soon: false },
    { key: "send", label: "Send money", icon: Send, soon: false },
    { key: "activity", label: "Transactions", icon: ArrowLeftRight, soon: false },
    { key: "recipients", label: "Recipients", icon: Users, soon: true },
    { key: "cards", label: "Cards", icon: CreditCard, soon: true },
    { key: "settings", label: "Settings", icon: Settings, soon: true },
  ];
  return (
    <aside className="hidden md:flex w-56 shrink-0 border-r border-slate-100 bg-white flex-col py-6 px-4">
      <div className="px-2 mb-8"><Logo /></div>
      <nav className="space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            disabled={it.soon}
            onClick={() => onNavigate && onNavigate(it.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active === it.key ? "bg-indigo-50 text-indigo-700" : it.soon ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <it.icon size={18} />
            <span className="flex-1 text-left">{it.label}</span>
            {it.soon && <span className="text-[10px] font-mono uppercase tracking-wide text-slate-300">Soon</span>}
          </button>
        ))}
      </nav>
      <div className="mt-auto px-3 py-2.5 text-xs text-slate-400 font-mono">Recnuvia Pro</div>
    </aside>
  );
}

export function TopBar({ label }) {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white">
      <div className="md:hidden"><Logo /></div>
      <div className="hidden md:block">
        <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-500">Welcome back, {user.name.split(" ")[0]}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-indigo-600 text-white text-xs font-semibold grid place-items-center">
          {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-full px-3 py-1.5">
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
}

export { Logo };
