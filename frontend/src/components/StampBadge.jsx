import React from "react";

const STYLES = {
  approved: "border-emerald-600 text-emerald-700",
  rejected: "border-rose-600 text-rose-700",
  pending: "border-amber-500 text-amber-600",
};

const LABELS = {
  approved: "Approved",
  rejected: "Declined",
  pending: "Awaiting review",
};

export default function StampBadge({ status, animate }) {
  const cls = STYLES[status] || STYLES.pending;
  return (
    <span
      className={`stamp-mark inline-block border-2 rounded-md px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest -rotate-6 ${cls}`}
      style={!animate ? { animation: "none" } : undefined}
    >
      {LABELS[status] || status}
    </span>
  );
}
