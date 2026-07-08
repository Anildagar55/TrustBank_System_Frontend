import { useEffect, useState } from "react";
import { LoanAPI, UserAPI, BankAPI } from "../api/client";
import { EmptyState, Seal, Toast, VaultLoader } from "../components/Common";
import { useToast, formatINR, formatDate } from "../utils";
import { ShieldCheck, Users, Landmark, HandCoins, Check, X } from "lucide-react";

const TABS = [
  { key: "pending", label: "Pending Loans", icon: HandCoins },
  { key: "loans", label: "All Loans", icon: ShieldCheck },
  { key: "users", label: "Customers", icon: Users },
  { key: "accounts", label: "Accounts", icon: Landmark },
];

const STATUSES = ["PENDING", "APPROVED", "REJECTED", "ACTIVE", "CLOSED", "DEFAULTED"];

export default function Admin() {
  const { toast, show, close } = useToast();
  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(false);

  const [pending, setPending] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [rejectReason, setRejectReason] = useState({});

  const load = async (which = tab) => {
    setLoading(true);
    try {
      if (which === "pending") setPending((await LoanAPI.pending()) || []);
      if (which === "loans") {
        const data = statusFilter ? await LoanAPI.byStatus(statusFilter) : await LoanAPI.all();
        setAllLoans(data || []);
      }
      if (which === "users") setUsers((await UserAPI.all()) || []);
      if (which === "accounts") setAccounts((await BankAPI.all()) || []);
    } catch (err) {
      show(err.message, "oxblood");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter]);

  const approve = async (loanNumber) => {
    try {
      await LoanAPI.approve({ loanNumber });
      show(`Loan ${loanNumber} approved.`, "emerald");
      load();
    } catch (err) {
      show(err.message, "oxblood");
    }
  };

  const reject = async (loanNumber) => {
    const reasonText = rejectReason[loanNumber];
    if (!reasonText || reasonText.length < 10) {
      show("Rejection reason needs at least 10 characters.", "oxblood");
      return;
    }
    try {
      await LoanAPI.reject({ loanNumber, rejectionReason: reasonText });
      show(`Loan ${loanNumber} rejected`, "brass");
      load();
    } catch (err) {
      show(err.message, "oxblood");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <p className="font-mono text-[11px] tracking-[0.3em] text-brass/70 uppercase mb-2">Administration</p>
      <h1 className="font-display text-3xl md:text-4xl mb-8">Admin Panel</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-display border transition-colors ${
              tab === key ? "bg-brass text-ink border-brass" : "border-brass/20 text-ink-text/60 hover:border-brass/50"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading && <VaultLoader label="Loading…" />}

      {!loading && tab === "pending" && (
        pending.length === 0 ? <EmptyState title="No loans pending review" /> : (
          <div className="grid md:grid-cols-2 gap-5">
            {pending.map((loan) => (
              <div key={loan.loanNumber} className="passbook p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-lg">{loan.loanType}</span>
                  <Seal status={loan.status} />
                </div>
                <div className="field-line"><span className="text-ink-text/50 text-xs">Loan No.</span><span className="flex-1 text-right font-mono text-xs">{loan.loanNumber}</span></div>
                <div className="field-line"><span className="text-ink-text/50 text-xs">Borrower</span><span className="flex-1 text-right text-sm">{loan.borrowerName}</span></div>
                <div className="field-line"><span className="text-ink-text/50 text-xs">Amount</span><span className="flex-1 text-right font-mono text-xs">{formatINR(loan.principalAmount)}</span></div>
                <div className="field-line"><span className="text-ink-text/50 text-xs">Tenure</span><span className="flex-1 text-right font-mono text-xs">{loan.tenureMonths} mo</span></div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => approve(loan.loanNumber)} className="stamp-btn-emerald !py-2 text-xs flex-1"><Check size={14} /> Approve</button>
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    className="input-vault  !py-2 text-xs"
                    placeholder="Rejection reason (10+ chars)"
                    value={rejectReason[loan.loanNumber] || ""}
                    onChange={(e) => setRejectReason((f) => ({ ...f, [loan.loanNumber]: e.target.value }))}
                  />
                  <button onClick={() => reject(loan.loanNumber)} className="stamp-btn-oxblood !py-2 text-xs whitespace-nowrap"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && tab === "loans" && (
        <>
          <div className="mb-5 flex items-center gap-3">
            <label className="label-vault mb-0">Status</label>
            <select className="input-vault max-w-[220px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {allLoans.length === 0 ? <EmptyState title="No loans found" /> : (
            <div className="passbook p-5 overflow-x-auto">
              {allLoans.map((loan) => (
                <div key={loan.loanNumber} className="field-line flex-wrap">
                  <span className="font-mono text-[11px] w-28 shrink-0">{loan.loanNumber}</span>
                  <span className="flex-1 font-display text-sm min-w-[100px]">{loan.borrowerName}</span>
                  <span className="text-xs text-ink-text/50 w-24">{loan.loanType}</span>
                  <span className="font-mono text-xs w-28 text-right">{formatINR(loan.principalAmount)}</span>
                  <Seal status={loan.status} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && tab === "users" && (
        users.length === 0 ? <EmptyState title="No customers registered" /> : (
          <div className="passbook p-5">
            {users.map((u) => (
              <div key={u.id} className="field-line">
                <span className="font-mono text-xs w-14 shrink-0">#{u.id}</span>
                <span className="flex-1 font-display text-sm">{u.name}</span>
                <span className="font-mono text-xs text-ink-text/50 w-32">{u.mobileNumber}</span>
                <span className="text-xs text-ink-text/50 w-20 text-right">{u.bankList?.length || 0} accts</span>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && tab === "accounts" && (
        accounts.length === 0 ? <EmptyState title="No accounts opened" /> : (
          <div className="passbook p-5">
            {accounts.map((acc) => (
              <div key={acc.customerId} className="field-line flex-wrap">
                <span className="font-mono text-[11px] w-24 shrink-0">{acc.customerId}</span>
                <span className="flex-1 font-display text-sm min-w-[100px]">{acc.holderName}</span>
                <span className="text-xs text-ink-text/50 w-16">{acc.banktype}</span>
                <span className="font-mono text-xs text-ink-text/50 w-36">{acc.accountNumber}</span>
                <span className="font-mono text-xs w-24 text-right">{formatINR(acc.amount)}</span>
              </div>
            ))}
          </div>
        )
      )}

      <Toast message={toast?.message} tone={toast?.tone} onClose={close} />
    </div>
  );
}
