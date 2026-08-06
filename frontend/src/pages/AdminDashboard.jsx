import React, { useEffect, useState } from "react";
import api from "../api.js";
import Nav from "../components/Nav.jsx";
import StampBadge from "../components/StampBadge.jsx";

function money(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [users, setUsers] = useState([]);
  const [justDecided, setJustDecided] = useState({}); // id -> status, for stamp animation
  const [error, setError] = useState("");

  async function loadAll() {
    const [{ data: p }, { data: a }, { data: u }] = await Promise.all([
      api.get("/admin/transactions/pending"),
      api.get("/admin/transactions"),
      api.get("/admin/users"),
    ]);
    setPending(p);
    setAll(a);
    setUsers(u);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function userName(id) {
    return users.find((u) => u.id === id)?.name || (id ? id : "External account");
  }

  async function decide(tx, action) {
    setError("");
    try {
      await api.post(`/admin/transactions/${tx.id}/${action}`);
      setJustDecided((m) => ({ ...m, [tx.id]: action === "approve" ? "approved" : "rejected" }));
      setTimeout(async () => {
        await loadAll();
      }, 550);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't process that decision.");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-sans font-extrabold text-2xl text-indigo-600">Control desk</h1>
          <div className="flex gap-2">
            {[
              ["pending", `Pending (${pending.length})`],
              ["ledger", "Full ledger"],
              ["users", "Accounts"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === key ? "bg-indigo-600 text-white" : "bg-white text-slate-500 border border-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-rose-700 text-sm mb-4">{error}</p>}

        {tab === "pending" && (
          <div className="space-y-4">
            {pending.length === 0 && (
              <p className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
                Nothing waiting on review right now.
              </p>
            )}
            {pending.map((t) => {
              const decided = justDecided[t.id];
              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 capitalize">
                      {t.type}
                      {t.note ? ` · ${t.note}` : ""}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {t.fromUserId ? userName(t.fromUserId) : "—"}
                      {t.type === "send" ? " → " : ""}
                      {t.type === "send" ? userName(t.toUserId) : ""}
                    </p>
                    <p className="font-mono text-sm text-indigo-600 mt-2">
                      {money(t.amount, t.currency)}
                      {t.convertedCurrency && t.convertedCurrency !== t.currency
                        ? ` → ${money(t.convertedAmount, t.convertedCurrency)}`
                        : ""}
                    </p>
                    <p className="text-xs text-slate-300 font-mono mt-1">
                      #{t.id} · {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {decided ? (
                    <StampBadge status={decided} animate />
                  ) : (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => decide(t, "reject")}
                        className="rounded-full border border-rose-600 text-rose-700 px-4 py-1.5 text-sm font-medium hover:bg-rose-600/5"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => decide(t, "approve")}
                        className="rounded-full bg-emerald-600 text-white px-4 py-1.5 text-sm font-medium hover:opacity-90"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "ledger" && (
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
            {all.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {t.type}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.fromUserId ? userName(t.fromUserId) : "—"}
                    {t.type === "send" ? ` → ${userName(t.toUserId)}` : ""}
                  </p>
                  <p className="text-xs text-slate-300 font-mono mt-1">#{t.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-slate-800">{money(t.amount, t.currency)}</p>
                  <div className="mt-1">
                    <StampBadge status={t.status} animate={false} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {u.email} · {u.role} · {u.country}
                  </p>
                </div>
                <p className="font-mono text-sm text-indigo-600">{money(u.balance, u.currency)}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
