import React from "react";
import { useAuth } from "../AuthContext.jsx";

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-100 bg-white/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-sans font-extrabold text-xl text-indigo-600 tracking-tight">Recnuvia Pro</span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
            {user?.role === "admin" ? "Control desk" : "Prototype"}
          </span>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right leading-tight">
              <p className="text-sm text-slate-800 font-medium">{user.name}</p>
              <p className="text-xs text-slate-400 font-mono">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-xs font-mono uppercase tracking-wide text-slate-400 hover:text-indigo-600 border border-slate-200 rounded-full px-3 py-1.5 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
