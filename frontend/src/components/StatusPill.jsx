import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

// Customer-facing status — deliberately generic. No mention of admin review
// or approval; that language is reserved for the admin control desk.
export default function StatusPill({ status }) {
  const map = {
    pending: { label: "Processing", icon: Clock, cls: "bg-slate-100 text-slate-500" },
    approved: { label: "Completed", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700" },
    rejected: { label: "Unsuccessful", icon: XCircle, cls: "bg-rose-50 text-rose-700" },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      <Icon size={13} strokeWidth={2.4} />
      {s.label}
    </span>
  );
}
