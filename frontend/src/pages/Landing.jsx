import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, ArrowLeftRight, Building2, Headphones, CheckCircle2, Play,
} from "lucide-react";

function useCountUp(target, active, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(target * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, active]);
  return val;
}

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

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

function RouteAnimation() {
  return (
    <svg viewBox="0 0 320 120" className="w-full h-auto">
      <path d="M20,90 Q160,10 300,80" fill="none" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="4 6" />
      <circle cx="20" cy="90" r="5" fill="#4f46e5" />
      <circle cx="300" cy="80" r="5" fill="#4f46e5" />
      <text x="6" y="108" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">LOS</text>
      <text x="284" y="98" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">LDN</text>
      <circle r="4" fill="#f59e0b">
        <animateMotion dur="2.6s" repeatCount="indefinite" path="M20,90 Q160,10 300,80" />
      </circle>
    </svg>
  );
}

export default function Landing() {
  const [statsRef, statsIn] = useInView();
  const transfers = useCountUp(12.4, statsIn);
  const countries = useCountUp(184, statsIn);
  const speed = useCountUp(9, statsIn);

  const features = [
    { title: "Real-time FX", desc: "See the exact rate before you send — no hidden markups.", icon: ArrowLeftRight },
    { title: "Fraud-monitored", desc: "Every transfer is screened in real time to keep your money safe.", icon: ShieldCheck },
    { title: "Personal & business", desc: "One platform for individuals and companies moving money abroad.", icon: Building2 },
    { title: "Always-on support", desc: "A human on the other end, day or night, wherever you're sending from.", icon: Headphones },
  ];

  return (
    <div className="bg-white">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#security" className="hover:text-slate-900">Security</a>
          </nav>
          <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-full">
            Log in
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-200 opacity-40 blur-3xl" />
        <div className="absolute top-40 -left-20 h-56 w-56 rounded-full bg-amber-200 opacity-40 blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-14 relative grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-[fadeUp_.7s_ease-out]">
            <p className="text-indigo-600 font-mono text-xs tracking-[0.25em] font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> SIMPLE · QUICK · SECURED
            </p>
            <h1 className="font-extrabold text-4xl sm:text-5xl text-slate-900 tracking-tight leading-[1.05]">
              Transfer money across the world in real time.
            </h1>
            <p className="text-slate-500 mt-5 max-w-md leading-relaxed">
              Recnuvia Pro moves money between people and businesses everywhere —
              encrypted, monitored, and delivered in real time, at a rate you can see upfront.
            </p>
            <div className="flex items-center gap-5 mt-7">
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all text-white font-semibold px-6 py-3 rounded-full shadow-lg shadow-indigo-200">
                Open an account →
              </Link>
              <button className="flex items-center gap-2 text-slate-700 font-medium group">
                <span className="h-10 w-10 rounded-full bg-white shadow grid place-items-center group-hover:scale-110 transition-transform">
                  <Play size={14} fill="currentColor" />
                </span>
                Watch video
              </button>
            </div>

            <div className="flex items-center gap-3 mt-9">
              <div className="flex -space-x-3">
                {[
                  { initials: "AK", bg: "bg-indigo-500" },
                  { initials: "TB", bg: "bg-amber-500" },
                  { initials: "SC", bg: "bg-emerald-500" },
                ].map((a) => (
                  <div key={a.initials} className={`h-9 w-9 rounded-full border-2 border-white ${a.bg} text-white text-xs font-semibold grid place-items-center`}>
                    {a.initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                Need help? <span className="text-indigo-600 underline underline-offset-2 cursor-pointer">Contact digital support</span>.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl w-full h-64 sm:h-80 shadow-xl -translate-y-4 bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10" />
                <p className="text-indigo-100 font-mono text-xs uppercase tracking-widest">This month</p>
                <div className="flex items-end gap-2 h-24">
                  {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/30 rounded-t-md" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <p className="text-white font-extrabold text-xl sm:text-2xl">$482,900 sent</p>
              </div>
              <div className="rounded-3xl w-full h-64 sm:h-80 shadow-xl translate-y-4 bg-gradient-to-br from-slate-800 to-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(135deg, white 0 2px, transparent 2px 12px)" }} />
                <div className="flex justify-between items-start relative">
                  <span className="h-8 w-11 rounded-md bg-amber-400" />
                  <span className="text-white font-extrabold tracking-tight">RECNUVIA</span>
                </div>
                <div className="relative">
                  <p className="text-slate-400 font-mono text-xs tracking-widest mb-1">CARD NUMBER</p>
                  <p className="text-white font-mono text-base sm:text-lg tracking-widest">•••• •••• •••• 4471</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-5 py-4 w-56">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wide mb-2">Latest transfer</p>
              <p className="font-mono text-sm text-slate-800 mb-2">$500.00 → €463.00</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-medium">
                <CheckCircle2 size={13} /> Completed
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white/60">
          <div ref={statsRef} className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="font-extrabold text-3xl text-slate-900">${transfers.toFixed(1)}M+</p>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wide mt-1">Moved for customers</p>
            </div>
            <div>
              <p className="font-extrabold text-3xl text-slate-900">{Math.round(countries)}+</p>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wide mt-1">Countries reached</p>
            </div>
            <div>
              <p className="font-extrabold text-3xl text-slate-900">~{Math.round(speed)}s</p>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wide mt-1">Avg. transfer time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center" id="security">
        <div className="order-2 md:order-1 bg-slate-50 rounded-3xl p-6">
          <RouteAnimation />
          <p className="text-center text-xs text-slate-400 font-mono mt-2">Every route, tracked end to end</p>
        </div>
        <div className="order-1 md:order-2">
          <p className="text-indigo-600 font-mono text-xs tracking-[0.25em] font-semibold mb-3">HOW IT WORKS</p>
          <h2 className="font-extrabold text-3xl text-slate-900 tracking-tight mb-4">
            Send once, land anywhere — in real time.
          </h2>
          <p className="text-slate-500 leading-relaxed">
            Every transfer moves through encrypted, monitored rails the moment you hit send.
            We convert at a transparent rate, route it through local payment networks, and
            confirm delivery — usually in minutes, not days.
          </p>
        </div>
      </section>

      <section className="bg-slate-900" id="features">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-amber-400 font-mono text-xs tracking-[0.25em] font-semibold mb-3">FEATURES</p>
          <h2 className="font-extrabold text-3xl text-white tracking-tight mb-10 max-w-lg">
            Built for people and businesses sending money abroad.
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-slate-800 hover:bg-slate-700 transition-colors rounded-2xl p-6 hover:-translate-y-1 duration-200">
                <span className="h-10 w-10 rounded-xl bg-amber-400/10 text-amber-400 grid place-items-center">
                  <f.icon size={19} />
                </span>
                <h3 className="text-white font-semibold mt-4">{f.title}</h3>
                <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight max-w-xl mx-auto">
          Ready to send your first transfer?
        </h2>
        <p className="text-slate-500 mt-4">Create an account and try a transfer — funds move automatically once it clears.</p>
        <Link to="/register" className="inline-block mt-7 bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all text-white font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-indigo-200">
          Open an account →
        </Link>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400">
          <Logo />
        </div>
      </footer>
    </div>
  );
}
