import React, { useEffect, useRef, useState } from "react";
import { Send, Plus, Minus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ShieldCheck } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { Sidebar, TopBar } from "../components/AppShell.jsx";
import StatusPill from "../components/StatusPill.jsx";

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "KES", "INR", "JPY"];
const RATES_TO_USD = { USD: 1, EUR: 1.08, GBP: 1.27, NGN: 0.000645, KES: 0.0077, INR: 0.012, JPY: 0.0067 };
const previewConvert = (amount, from, to) => {
  if (from === to) return amount;
  const usd = amount * (RATES_TO_USD[from] ?? 1);
  return Math.round((usd / (RATES_TO_USD[to] ?? 1)) * 100) / 100;
};

function money(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function TxIcon({ type, outgoing }) {
  const Icon = type === "deposit" ? Plus : type === "withdraw" ? Minus : outgoing ? ArrowUpRight : ArrowDownLeft;
  const cls =
    type === "deposit" ? "bg-emerald-50 text-emerald-600" :
    type === "withdraw" ? "bg-slate-100 text-slate-500" :
    outgoing ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600";
  return (
    <span className={`h-10 w-10 shrink-0 rounded-full grid place-items-center ${cls}`}>
      <Icon size={18} strokeWidth={2.2} />
    </span>
  );
}

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [directory, setDirectory] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("send");
  const [form, setForm] = useState({ toUserId: "", amount: "", currency: user?.currency || "USD", note: "" });
  const [status, setStatus] = useState(null);

  const overviewRef = useRef(null);
  const formRef = useRef(null);
  const ledgerRef = useRef(null);

  function goTo(key) {
    const map = { overview: overviewRef, send: formRef, activity: ledgerRef };
    if (key === "send") setTab("send");
    map[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function loadAll() {
    const [{ data: dir }, { data: hist }] = await Promise.all([
      api.get("/transactions/directory"),
      api.get("/transactions"),
    ]);
    setDirectory(dir);
    setHistory(hist);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recipient = directory.find((d) => d.id === form.toUserId);
  const sendAmount = Number(form.amount);
  const showFxPreview = tab === "send" && recipient && sendAmount > 0 && recipient.currency !== user.currency;

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    try {
      const payload = {
        type: tab,
        amount: form.amount,
        currency: tab === "send" ? user.currency : form.currency,
        toUserId: tab === "send" ? form.toUserId : undefined,
        note: form.note,
      };
      await api.post("/transactions", payload);
      setStatus({ ok: true, msg: "Transfer submitted — you'll see it in your activity shortly." });
      setForm({ toUserId: "", amount: "", currency: user.currency, note: "" });
      await Promise.all([loadAll(), refresh()]);
    } catch (err) {
      setStatus({ ok: false, msg: err.response?.data?.error || "Something went wrong." });
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar active="overview" onNavigate={goTo} />
      <div className="flex-1 min-w-0">
        <TopBar label="Dashboard" />

        <main className="max-w-4xl mx-auto px-6 sm:px-8 py-8 space-y-8">
          <div ref={overviewRef} className="scroll-mt-6">
            <h1 className="font-extrabold text-2xl text-slate-900">Overview</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <p className="font-mono text-xs uppercase tracking-widest text-indigo-200">Available balance</p>
              <p className="font-extrabold text-4xl mt-2 tabular-nums">{money(user.balance, user.currency)}</p>
              <p className="text-indigo-200 text-xs mt-2 font-mono">{user.role} · {user.country}</p>
              <div className="flex gap-3 mt-6 relative">
                {[
                  { key: "send", label: "Send", icon: Send },
                  { key: "deposit", label: "Add money", icon: Plus },
                  { key: "withdraw", label: "Withdraw", icon: Minus },
                ].map((a) => (
                  <button
                    key={a.key}
                    onClick={() => { setTab(a.key); formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                    className="flex-1 bg-white/10 hover:bg-white/20 transition-colors rounded-xl py-2.5 flex flex-col items-center gap-1 text-xs font-medium"
                  >
                    <a.icon size={16} />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <p className="text-xs font-mono uppercase tracking-wide text-slate-400">Account</p>
              <div>
                <p className="text-sm text-slate-800 font-medium">{user.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 capitalize">{user.role} account</p>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-emerald-600" />
                Protected by real-time fraud monitoring
              </div>
            </div>
          </div>

          <div ref={formRef} className="bg-white rounded-2xl border border-slate-200 p-6 scroll-mt-6">
            <div className="flex gap-2 mb-5">
              {[
                { key: "send", label: "Send", icon: Send },
                { key: "deposit", label: "Deposit", icon: Plus },
                { key: "withdraw", label: "Withdraw", icon: Minus },
              ].map((t) => (
                <button key={t.key} type="button" onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-500"}`}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
              {tab === "send" && (
                <select
                  required
                  value={form.toUserId}
                  onChange={(e) => setForm((f) => ({ ...f, toUserId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white"
                >
                  <option value="">Choose a recipient…</option>
                  {directory.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.country} ({d.currency})
                    </option>
                  ))}
                </select>
              )}

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.amount}
                  placeholder="Amount"
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white font-mono"
                />
                <select
                  disabled={tab === "send"}
                  value={tab === "send" ? user.currency : form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white disabled:opacity-60"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {showFxPreview && (
                <div className="bg-indigo-50 rounded-lg px-3 py-2.5 text-sm text-indigo-800 flex items-center gap-2">
                  <ArrowLeftRight size={14} />
                  {recipient.name} receives ~{money(previewConvert(sendAmount, user.currency, recipient.currency), recipient.currency)}
                  <span className="text-indigo-400 font-mono text-xs ml-auto">
                    1 {user.currency} ≈ {previewConvert(1, user.currency, recipient.currency)} {recipient.currency}
                  </span>
                </div>
              )}

              <input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="What's this for?"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white"
              />

              {status && (
                <p className={`text-sm ${status.ok ? "text-emerald-700" : "text-rose-700"}`}>{status.msg}</p>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-lg py-2.5 font-medium capitalize"
              >
                {tab === "send" ? "Send money" : tab === "deposit" ? "Add money" : "Withdraw"}
              </button>
              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck size={12} /> Transfers are encrypted and monitored for your protection.
              </p>
            </form>
          </div>

          <div ref={ledgerRef} className="scroll-mt-6">
            <h2 className="font-extrabold text-xl text-slate-900 mb-4">Recent activity</h2>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {history.length === 0 && (
                <p className="p-6 text-sm text-slate-400">No transactions yet — send or deposit to get started.</p>
              )}
              {history.map((t) => {
                const outgoing = t.direction === "outgoing" || t.type === "withdraw";
                return (
                  <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <TxIcon type={t.type} outgoing={outgoing} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 capitalize truncate">
                        {t.type === "send" ? (outgoing ? "Sent" : "Received") : t.type}
                        {t.note ? ` · ${t.note}` : ""}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm text-slate-800">
                        {outgoing ? "-" : "+"}{money(t.amount, t.currency)}
                      </p>
                      <div className="mt-1"><StatusPill status={t.status} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
