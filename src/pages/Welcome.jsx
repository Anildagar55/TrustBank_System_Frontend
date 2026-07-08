import { useNavigate } from "react-router-dom";
import { ShieldCheck, Landmark, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Landmark, title: "Multiple accounts", desc: "Open and manage accounts across all major banks in one place." },
  { icon: ArrowRight, title: "Instant transfers", desc: "Deposit, withdraw, and transfer funds in real time." },
  { icon: ShieldCheck, title: "Secure by design", desc: "Every transaction is logged and traceable end to end." },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <header className="border-b border-ink-3 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="30" height="30" viewBox="0 0 64 64">
              <rect width="64" height="64" rx="12" fill="#0F4C81" />
              <path d="M32 12l18 9v4H14v-4l18-9z" fill="#fff" />
              <rect x="16" y="27" width="6" height="18" fill="#fff" />
              <rect x="29" y="27" width="6" height="18" fill="#fff" />
              <rect x="42" y="27" width="6" height="18" fill="#fff" />
              <rect x="12" y="47" width="40" height="5" rx="1" fill="#fff" />
            </svg>
            <span className="font-display font-bold text-lg text-ink-text">TrustBank</span>
          </div>
          <button onClick={() => navigate("/login")} className="stamp-btn-ghost !py-2 !px-4 text-sm">
            Sign In
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="animate-riseIn">
            <span className="inline-block bg-brass/10 text-brass font-medium text-xs px-3 py-1 rounded-full mb-5">
              Online Banking, Simplified
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink-text leading-tight mb-5">
              Banking that fits your life, not the other way around.
            </h1>
            <p className="text-slate-500 text-base md:text-lg mb-8 max-w-md">
              Open an account, move money, and manage loans — all from one clean, secure dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/start")} className="stamp-btn-brass text-base px-7 py-3">
                Get Started <ArrowRight size={17} />
              </button>
              <button onClick={() => navigate("/login")} className="stamp-btn-ghost text-base px-7 py-3">
                Sign In
              </button>
            </div>
          </div>

          <div className="grid gap-4 animate-riseIn" style={{ animationDelay: "0.1s" }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="passbook p-5 flex items-start gap-4">
                <div className="bg-brass/10 text-brass rounded-lg p-2.5 shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink-text mb-1">{title}</h3>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-ink-3 py-6">
        <p className="text-center text-xs text-slate-400">
          TrustBank is a demo banking interface. Not a real financial institution.
        </p>
      </footer>
    </div>
  );
}
