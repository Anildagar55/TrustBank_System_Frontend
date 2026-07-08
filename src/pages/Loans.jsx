import { useEffect, useState } from "react";
import { useBank } from "../context/BankContext";
import { LoanAPI } from "../api/client";
import { EmptyState, Seal, Toast, VaultLoader } from "../components/Common";
import { useToast, formatINR, formatDate } from "../utils";
import { Calculator, HandCoins, ReceiptText } from "lucide-react";

const LOAN_TYPES = ["HOME", "PERSONAL", "VEHICLE", "EDUCATION", "BUSINESS"];

export default function Loans() {
  const { user, activeAccount } = useBank();
  const { toast, show, close } = useToast();

  const [myLoans, setMyLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  const [calc, setCalc] = useState({ principal: "500000", annualRate: "8.5", tenureMonths: "120" });
  const [calcResult, setCalcResult] = useState(null);
  const [calcBusy, setCalcBusy] = useState(false);

  const [apply, setApply] = useState({ loanType: "PERSONAL", principalAmount: "", tenureMonths: "", purpose: "" });
  const [applyBusy, setApplyBusy] = useState(false);

  const [emiForm, setEmiForm] = useState({});

  const loadLoans = async () => {
    if (!user) return;
    setLoadingLoans(true);
    try {
      const data = await LoanAPI.byUser(user.id);
      setMyLoans(Array.isArray(data) ? data : []);
    } catch {
      setMyLoans([]);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    loadLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const runCalculator = async (e) => {
    e.preventDefault();
    setCalcBusy(true);
    try {
      const res = await LoanAPI.calculator(calc.principal, calc.annualRate, calc.tenureMonths);
      setCalcResult(res);
    } catch (err) {
      show(err.message, "oxblood");
    } finally {
      setCalcBusy(false);
    }
  };

  const submitApply = async (e) => {
    e.preventDefault();
    if (!activeAccount) {
      show("Select an active account to disburse the loan into.", "oxblood");
      return;
    }
    if (!apply.principalAmount || !apply.tenureMonths) {
      show("Enter loan amount and tenure.", "oxblood");
      return;
    }
    setApplyBusy(true);
    try {
      await LoanAPI.apply(user.id, {
        loanType: apply.loanType,
        principalAmount: Number(apply.principalAmount),
        tenureMonths: Number(apply.tenureMonths),
        disbursementAccountNumber: activeAccount.accountNumber,
        purpose: apply.purpose,
      });
      show("Loan application submitted. It's pending review.", "brass");
      setApply({ loanType: "PERSONAL", principalAmount: "", tenureMonths: "", purpose: "" });
      loadLoans();
    } catch (err) {
      show(err.message, "oxblood");
    } finally {
      setApplyBusy(false);
    }
  };

  const payEmi = async (loanNumber) => {
    const accountNumber = emiForm[loanNumber] || activeAccount?.accountNumber;
    if (!accountNumber) {
      show("Enter an account number to pay from.", "oxblood");
      return;
    }
    try {
      await LoanAPI.payEmi({ loanNumber, accountNumber });
      show("EMI payment successful.", "emerald");
      loadLoans();
    } catch (err) {
      show(err.message, "oxblood");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <p className="font-mono text-[11px] tracking-[0.3em] text-brass/70 uppercase mb-2">Loans</p>
      <h1 className="font-display text-3xl md:text-4xl mb-8">Apply, calculate, and manage your loans</h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        {/* EMI calculator */}
        <div className="ink-panel p-6">
          <h2 className="font-display text-lg mb-4 flex items-center gap-2"><Calculator size={18} className="text-brass" /> EMI calculator</h2>
          <form onSubmit={runCalculator} className="space-y-3">
            <div>
              <label className="label-vault">Principal (₹)</label>
              <input className="input-vault" value={calc.principal} onChange={(e) => setCalc((f) => ({ ...f, principal: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-vault">Annual rate (%)</label>
                <input className="input-vault" value={calc.annualRate} onChange={(e) => setCalc((f) => ({ ...f, annualRate: e.target.value }))} />
              </div>
              <div>
                <label className="label-vault">Tenure (months)</label>
                <input className="input-vault" value={calc.tenureMonths} onChange={(e) => setCalc((f) => ({ ...f, tenureMonths: e.target.value }))} />
              </div>
            </div>
            <button disabled={calcBusy} className="stamp-btn-ghost w-full">{calcBusy ? "Calculating…" : "Calculate EMI"}</button>
          </form>
          {calcResult && (
            <div className="mt-4 pt-4 border-t border-dashed border-brass/20 space-y-1.5 font-mono text-sm">
              <div className="flex justify-between"><span className="text-ink-text/50">Monthly EMI</span><span className="text-brass text-base">{formatINR(calcResult.monthlyEmi)}</span></div>
              <div className="flex justify-between"><span className="text-ink-text/50">Total interest</span><span>{formatINR(calcResult.totalInterest)}</span></div>
              <div className="flex justify-between"><span className="text-ink-text/50">Total payable</span><span>{formatINR(calcResult.totalAmount)}</span></div>
            </div>
          )}
        </div>

        {/* Apply */}
        <div className="ink-panel p-6">
          <h2 className="font-display text-lg mb-4 flex items-center gap-2"><HandCoins size={18} className="text-emerald" /> Apply for a loan</h2>
          <form onSubmit={submitApply} className="space-y-3">
            <div>
              <label className="label-vault">Loan type</label>
              <select className="input-vault" value={apply.loanType} onChange={(e) => setApply((f) => ({ ...f, loanType: e.target.value }))}>
                {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-vault">Amount (₹)</label>
              <input
                type="number"
                className="input-vault"
                min={1000}
                max={10000000}
                value={apply.principalAmount}
                onChange={(e) =>
                  setApply((prev) => ({
                    ...prev,
                    principalAmount: e.target.value,
                  }))
                }
              />  </div>
              <div>
                <label className="label-vault">Tenure (months)</label>
                <input className="input-vault" value={apply.tenureMonths} onChange={(e) => setApply((f) => ({ ...f, tenureMonths: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label-vault">Purpose (optional)</label>
              <input className="input-vault" value={apply.purpose} onChange={(e) => setApply((f) => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Home renovation" />
            </div>
            <p className="text-xs text-ink-text/40 font-mono">Disburses to: {activeAccount?.accountNumber || "no active account selected"}</p>
            <button disabled={applyBusy} className="stamp-btn-emerald w-full">{applyBusy ? "Submitting…" : "Submit application"}</button>
          </form>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <ReceiptText size={18} className="text-brass" />
        <h2 className="font-display text-xl">My Loans</h2>
      </div>

      {loadingLoans ? (
        <VaultLoader label="Loading your loans…" />
      ) : myLoans.length === 0 ? (
        <EmptyState title="No loans yet" hint="Apply above to see your loan status here." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
            {[...myLoans]
                .sort((a,b)=>{
                    const priority = {
                        ACTIVE: 1,
                                  PENDING: 2,
                                  APPROVED: 3,
                                  CLOSED: 4,
                                  REJECTED: 5,
                                  DEFAULTED: 6,
                        };
                    return (priority[a.status] ?? 99)-(priority[b.status]??99)
                    })
         .map((loan) => (
            <div key={loan.loanNumber} className="passbook p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-lg">{loan.loanType}</span>
                <Seal status={loan.status} />
              </div>
              <div className="field-line"><span className="text-ink-text/50 text-xs">Loan No.</span><span className="flex-1 text-right font-mono text-xs">{loan.loanNumber}</span></div>
              <div className="field-line"><span className="text-ink-text/50 text-xs">Principal</span><span className="flex-1 text-right font-mono text-xs">{formatINR(loan.principalAmount)}</span></div>
              <div className="field-line"><span className="text-ink-text/50 text-xs">Outstanding</span><span className="flex-1 text-right font-mono text-xs">{formatINR(loan.outstandingAmount)}</span></div>
              <div className="field-line"><span className="text-ink-text/50 text-xs">EMI</span><span className="flex-1 text-right font-mono text-xs">{formatINR(loan.emiAmount)}</span></div>
              <div className="field-line"><span className="text-ink-text/50 text-xs">Next EMI</span><span className="flex-1 text-right font-mono text-xs">{loan.nextEmiDate || "—"}</span></div>
              {loan.rejectionReason && (
                <p className="text-oxblood text-xs mt-2 font-mono">Reason: {loan.rejectionReason}</p>
              )}
              {(loan.status === "ACTIVE" || loan.status === "APPROVED") && (
                <div className="mt-4 flex gap-2">
                  <input
                    className="input-vault  !py-2 text-xs"
                    placeholder={activeAccount?.accountNumber || "Account number"}
                    value={emiForm[loan.loanNumber] || ""}
                    onChange={(e) => setEmiForm((f) => ({ ...f, [loan.loanNumber]: e.target.value }))}
                  />
                  <button onClick={() => payEmi(loan.loanNumber)} className="stamp-btn-brass !py-2 text-xs whitespace-nowrap">Pay EMI</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Toast message={toast?.message} tone={toast?.tone} onClose={close} />
    </div>
  );
}
