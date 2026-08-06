import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "KES", "INR", "JPY"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "individual",
    country: "",
    currency: "USD",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-sans font-extrabold text-3xl text-white tracking-tight">
            Open an account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-7 shadow-xl space-y-4">
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wide text-slate-400">
              Account type
            </span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {["individual", "business"].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => update("role", role)}
                  className={`rounded-lg border py-2 text-sm capitalize transition-colors ${
                    form.role === role
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wide text-slate-400">
              {form.role === "business" ? "Business name" : "Full name"}
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wide text-slate-400">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wide text-slate-400">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-wide text-slate-400">
                Country
              </span>
              <input
                placeholder="e.g. NG"
                value={form.country}
                onChange={(e) => update("country", e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-wide text-slate-400">
                Currency
              </span>
              <select
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="text-rose-700 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
