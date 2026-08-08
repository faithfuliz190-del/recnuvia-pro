import React, { useEffect, useState } from "react";
import api from "../api.js";
import Nav from "../components/Nav.jsx";
import StampBadge from "../components/StampBadge.jsx";

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "KES", "INR", "JPY"];

function money(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function CreateAccountForm({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "individual", country: "", currency: "USD" });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      await api.post("/admin/users", form);
      setStatus({ ok: true, msg: `Account created for ${form.name}. Share their email and password with them to log in.` });
      setForm({ name: "", email: "", password: "", role: "individual", country: "", currency: "USD" });
      onCreated();
    } catch (err) {
      setStatus({ ok: false, msg: err.response?.data?.error || "Couldn't create that account." });
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-full"
      >
        + Create account
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">New customer account</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {["individual", "business"].map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => setForm((f) => ({ ...f, role: r }))}
            className={`rounded-lg border py-2 text-sm capitalize ${form.role === r ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <input
        required
        placeholder={form.role === "business" ? "Business name" : "Full name"}
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="w-full rounded-lg border border-slate-200 px-3 py-2"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className="w-full rounded-lg border border-slate-200 px-3 py-2"
      />
      <input
        required
        type="text"
        placeholder="Set a password for them"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        className="w-full rounded-lg border border-slate-200 px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Country (e.g. NG)"
          value={form.country}
          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
        />
        <select
          value={form.currency}
          onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
        >
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {status && <p className={`text-sm ${status.ok ? "text-emerald-700" : "text-rose-700"}`}>{status.msg}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-lg py-2.5 font-medium disabled:opacity-60"
      >
        {busy ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

function AccountRow({ u, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(u.balance);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setError("");
    setBusy(true);
    try {
      await api.patch(`/admin/users/${u.id}/balance`, { balance: Number(value) });
      setEditing(false);
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update balance.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{u.name}</p>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          {u.email} · {u.role} · {u.country}
        </p>
        {error && <p className="text-xs text-rose-700 mt-1">{error}</p>}
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-28 rounded-lg border border-slate-200 px-2 py-1 font-mono text-sm text-right"
          />
          <button onClick={save} disabled={busy} className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-3 py-1.5 disabled:opacity-60">
            {busy ? "Saving…" : "Save"}
          </button>
          <button onClick={() => { setEditing(false); setValue(u.balance); setError(""); }} className="text-xs text-slate-400 hover:text-slate-600">
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <p className="font-mono text-sm text-indigo-600">{money(u.balance, u.currency)}</p>
          <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-indigo-600 underline underline-offset-2">
            Edit
          </button>
        </div>
      )}
    </div>
  );
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
          <div>
            <CreateAccountForm onCreated={loadAll} />
            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
              {users.map((u) => (
                <AccountRow key={u.id} u={u} onUpdated={loadAll} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
