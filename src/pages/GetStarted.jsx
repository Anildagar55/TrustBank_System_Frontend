import { useNavigate } from "react-router-dom";
import { BookOpenCheck, UserPlus } from "lucide-react";

export default function GetStarted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full">
        <p className="font-mono text-[11px] tracking-[0.3em] text-brass/70 uppercase mb-3 text-center">
          Welcome
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-center mb-3">
          How would you like to continue?
        </h1>
        <p className="text-ink-text/50 text-center mb-12 max-w-lg mx-auto">
          TrustBank keeps one page per customer. Pick up where you left off, or open a fresh page in the book.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/login")}
            className="group text-left ink-panel p-7 hover:border-brass/50 transition-colors"
          >
            <BookOpenCheck className="text-brass mb-4" size={28} />
            <h2 className="font-display text-xl mb-2">Sign In</h2>
            <p className="text-sm text-ink-text/50">
              I already have a customer ID with TrustBank. Take me to my accounts.
            </p>
            <span className="inline-block mt-5 text-brass text-sm font-mono group-hover:translate-x-1 transition-transform">
              Continue →
            </span>
          </button>

          <button
            onClick={() => navigate("/register")}
            className="group text-left ink-panel p-7 hover:border-brass/50 transition-colors"
          >
            <UserPlus className="text-emerald mb-4" size={28} />
            <h2 className="font-display text-xl mb-2">Open New Account</h2>
            <p className="text-sm text-ink-text/50">
              First time here? Register your details and open your first account.
            </p>
            <span className="inline-block mt-5 text-emerald text-sm font-mono group-hover:translate-x-1 transition-transform">
              Register →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
