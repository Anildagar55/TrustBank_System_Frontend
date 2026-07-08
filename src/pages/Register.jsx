import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserAPI, BankAPI } from "../api/client";
import { useBank } from "../context/BankContext";

const BANK_TYPES = ["SBI", "HDFC", "BOB", "BOI", "CANARA", "PNB", "UCO"];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", aadhar: "", mobileNumber: "", email: "" });
  const [bankForm, setBankForm] = useState({ banktype: "SBI", amount: "" });
  const [createdUser, setCreatedUser] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useBank();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setBank = (k) => (e) => setBankForm((f) => ({ ...f, [k]: e.target.value }));

  const submitDetails = async (e) => {
    e.preventDefault();
    if (!form.name || !form.aadhar || !form.mobileNumber) {
      setError("Name, Aadhar, and mobile number are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const user = await UserAPI.create(form);
      setCreatedUser(user);
      setStep(2);
    } catch (err) {
      setError(err.message || "Could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitAccount = async (e) => {
    e.preventDefault();
    if (!bankForm.amount || Number(bankForm.amount) < 0) {
      setError("Enter an opening deposit amount.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await BankAPI.create({
        userid: createdUser.id,
        banktype: bankForm.banktype,
        amount: Number(bankForm.amount),
      });
      await login(createdUser.id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Could not open the account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">
        <p className="font-mono text-[11px] tracking-[0.3em] text-brass/70 uppercase mb-3 text-center">
          {step === 1 ? "Step 1 of 2 · Your Details" : "Step 2 of 2 · Open Account"}
        </p>
        <h1 className="font-display text-3xl text-center mb-2">
          {step === 1 ? "Create your account" : `Welcome, ${createdUser?.name?.split(" ")[0] || ""}`}
        </h1>
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className={`h-1.5 w-8 rounded-full ${step >= 1 ? "bg-brass" : "bg-ink-3"}`} />
          <span className={`h-1.5 w-8 rounded-full ${step >= 2 ? "bg-brass" : "bg-ink-3"}`} />
        </div>

        {step === 1 && (
          <form onSubmit={submitDetails} className="ink-panel p-7 space-y-4">
            <div>
              <label className="label-vault">Full name</label>
              <input className="input-vault" value={form.name} onChange={set("name")} placeholder="Ramesh Kumar" />
            </div>
            <div>
              <label className="label-vault">Aadhar number</label>
              <input
                className="input-vault"
                value={form.aadhar}
                onChange={set("aadhar")}
                placeholder="12-digit Aadhar"
                maxLength={12}
              />
            </div>
            <div>
              <label className="label-vault">Mobile number</label>
              <input className="input-vault" value={form.mobileNumber} onChange={set("mobileNumber")} placeholder="9876543210" />
            </div>
            <div>
              <label className="label-vault">Email (optional)</label>
              <input className="input-vault" value={form.email} onChange={set("email")} placeholder="ramesh@example.com" />
            </div>
            {error && <p className="text-oxblood text-sm font-mono">{error}</p>}
            <button type="submit" disabled={busy} className="stamp-btn-brass w-full">
              {busy ? "Saving…" : "Continue →"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitAccount} className="ink-panel p-7 space-y-4">
            <div>
              <label className="label-vault">Select bank</label>
              <select className="input-vault" value={bankForm.banktype} onChange={setBank("banktype")}>
                {BANK_TYPES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-vault">Opening deposit (₹)</label>
              <input
                className="input-vault"
                value={bankForm.amount}
                onChange={setBank("amount")}
                placeholder="5000"
                inputMode="decimal"
              />
            </div>
            {error && <p className="text-oxblood text-sm font-mono">{error}</p>}
            <button type="submit" disabled={busy} className="stamp-btn-emerald w-full">
              {busy ? "Processing…" : "Open account →"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-ink-text/40 mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-brass hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
