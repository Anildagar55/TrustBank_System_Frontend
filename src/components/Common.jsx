import { Loader2, Inbox } from "lucide-react";

export function Seal({ status }) {
  const map = {
    APPROVED: "seal-approved",
    ACTIVE: "seal-approved",
    SUCCESS: "seal-approved",
    CLOSED: "seal-closed",
    PENDING: "seal-pending",
    REJECTED: "seal-rejected",
    FAILED: "seal-rejected",
    DEFAULTED: "seal-rejected",
    REVERSED: "seal-pending",
  };
  return (
    <span className={map[status] || "seal-pending"}>
      {status || "UNKNOWN"}
    </span>
  );
}

export function VaultLoader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-text/60">
      <Loader2 className="animate-spin text-brass" size={28} />
      <p className="font-mono text-xs tracking-widest uppercase">{label}</p>
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center text-ink-text/50 border border-dashed border-brass/20 rounded-md">
      <Inbox size={26} className="text-brass/50" />
      <p className="font-display text-base text-ink-text/70">{title}</p>
      {hint && <p className="text-xs max-w-xs">{hint}</p>}
    </div>
  );
}

export function Toast({ message, tone = "emerald", onClose }) {
  if (!message) return null;
  const toneClass =
    tone === "oxblood"
      ? "border-oxblood text-oxblood"
      : tone === "brass"
      ? "border-brass text-brass"
      : "border-emerald text-emerald";
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink-2 border ${toneClass} px-5 py-3 rounded-md shadow-card font-mono text-sm animate-riseIn flex items-center gap-3`}
      role="status"
    >
      {message}
      <button onClick={onClose} className="text-ink-text/40 hover:text-ink-text">
        ✕
      </button>
    </div>
  );
}
