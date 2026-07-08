import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserAPI } from "../api/client";
import { useBank } from "../context/BankContext";
import { VaultLoader } from "../components/Common";

export default function Login() {
  const [customerId, setCustomerId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [directory, setDirectory] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const { login } = useBank();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId.trim()) {
      setError("Please enter your customer ID.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await login(customerId.trim());
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "We couldn't find an account with that ID.");
    } finally {
      setBusy(false);
    }
  };

  const openDirectory = async () => {
    setBrowsing((v) => !v);
    if (!browsing && directory.length === 0) {
      setLoadingDirectory(true);
      try {
        const data = await UserAPI.all();
        setDirectory(data || []);
      } catch {
        setDirectory([]);
      } finally {
        setLoadingDirectory(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">
        <p className="font-mono text-[11px] tracking-[0.3em] text-brass/70 uppercase mb-3 text-center">
          Sign In
        </p>
        <h1 className="font-display text-3xl text-center mb-8">Sign in to your account</h1>

        <form onSubmit={handleSubmit} className="ink-panel p-7">
          <label className="label-vault">Customer ID</label>
          <input
            className="input-vault"
            placeholder="e.g. 1"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            inputMode="numeric"
          />
          {error && <p className="text-oxblood text-sm mt-3 font-mono">{error}</p>}
          <button type="submit" disabled={busy} className="stamp-btn-brass w-full mt-6">
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <button
          onClick={openDirectory}
          className="w-full text-center text-sm text-ink-text/50 hover:text-brass mt-5 font-mono"
        >
          {browsing ? "Hide customer list ▲" : "Don't know your customer ID? Browse customers ▼"}
        </button>

        {browsing && (
          <div className="mt-4 passbook p-4 max-h-72 overflow-y-auto">
            {loadingDirectory ? (
              <VaultLoader label="Loading customers…" />
            ) : directory.length === 0 ? (
              <p className="text-sm text-ink-text/60 py-4 text-center">No customers found.</p>
            ) : (
              directory.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setCustomerId(String(u.id))}
                  className="field-line w-full text-left hover:text-emerald"
                >
                  <span className="font-mono text-xs text-ink-text/50">#{u.id}</span>
                  <span className="flex-1 font-display">{u.name}</span>
                  <span className="font-mono text-xs text-ink-text/50">{u.mobileNumber}</span>
                </button>
              ))
            )}
          </div>
        )}

        <p className="text-center text-sm text-ink-text/40 mt-8">
          New here?{" "}
          <Link to="/register" className="text-emerald hover:underline">
            Create your account
          </Link>
        </p>
      </div>
    </div>
  );
}
