import { useEffect, useState } from "react";
import { useBank } from "../context/BankContext";
import { TransactionAPI } from "../api/client";
import { EmptyState, Seal, Toast, VaultLoader } from "../components/Common";
import { useToast, formatINR, formatDate } from "../utils";
import { ArrowDownCircle, ArrowUpCircle, SendHorizontal, Filter } from "lucide-react";

const TABS = [
  { key: "deposit", label: "Deposit", icon: ArrowDownCircle, tone: "emerald" },
  { key: "withdraw", label: "Withdraw", icon: ArrowUpCircle, tone: "oxblood" },
  { key: "transfer", label: "Transfer", icon: SendHorizontal, tone: "brass" },
];

const TX_TYPES = ["DEPOSIT", "WITHDRAWAL", "TRANSFER_DEBIT", "TRANSFER_CREDIT", "INTEREST_CREDIT", "LOAN_DISBURSEMENT", "LOAN_REPAYMENT", "CHARGE"];

export default function Transactions() {
  const { activeAccount, refreshUser } = useBank();
  const { toast, show, close } = useToast();
  const [tab, setTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [busy, setBusy] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadHistory = async () => {
    if (!activeAccount) return;
    setLoadingHistory(true);
    try {
      const data = await TransactionAPI.history(activeAccount.accountNumber);
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setToAccount("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeAccount) {
      show("Please select an account first.", "oxblood");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      show("Enter a valid amount.", "oxblood");
      return;
    }
    setBusy(true);
    try {
      if (tab === "deposit") {
        await TransactionAPI.deposit({ accountNumber: activeAccount.accountNumber, amount: Number(amount), description });
        show("Deposit successful.", "emerald");
      } else if (tab === "withdraw") {
        await TransactionAPI.withdraw({ accountNumber: activeAccount.accountNumber, amount: Number(amount), description });
        show("Withdrawal successful.", "oxblood");
      } else {
        if (!toAccount) {
          show("Enter the recipient's account number.", "oxblood");
          setBusy(false);
          return;
        }
        await TransactionAPI.transfer({
          fromAccountNumber: activeAccount.accountNumber,
          toAccountNumber: toAccount,
          amount: Number(amount),
          description,
        });
        show("Transfer successful.", "brass");
      }
      resetForm();
      await refreshUser();
      await loadHistory();
    } catch (err) {
      show(err.message, "oxblood");
    } finally {
      setBusy(false);
    }
  };

  const applyFilter = async () => {
    if (!activeAccount) return;
    setLoadingHistory(true);
    try {
      const payload = {
        accountNumber: activeAccount.accountNumber,
        type: filterType || null,
        fromDate: fromDate ? new Date(fromDate).toISOString() : null,
        toDate: toDate ? new Date(toDate).toISOString() : null,
      };
      const data = await TransactionAPI.filter(payload);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      show(err.message, "oxblood");
    } finally {
      setLoadingHistory(false);
    }
  };

  const clearFilter = () => {
    setFilterType("");
    setFromDate("");
    setToDate("");
    loadHistory();
  };

  if (!activeAccount) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-16">
        <EmptyState title="No account selected" hint="Open or select an account from My Accounts to make a transaction." />
      </div>
    );
  }

  const activeTab = TABS.find((t) => t.key === tab);

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-10">
      <p className="font-mono text-[11px] tracking-[0.3em] text-brass/70 uppercase mb-2">Transactions</p>
      <h1 className="font-display text-3xl md:text-4xl mb-1">Move Money</h1>
      <p className="text-ink-text/50 text-sm mb-8 font-mono">{activeAccount.accountNumber} · {activeAccount.banktype} · {formatINR(activeAccount.amount)}</p>

      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); resetForm(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-display text-sm border transition-colors ${
              tab === key ? "bg-brass text-ink border-brass" : "border-brass/20 text-ink-text/60 hover:border-brass/50"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="ink-panel p-6 mb-10 space-y-4">
        {tab === "transfer" && (
          <div>
            <label className="label-vault">Recipient account number</label>
            <input className="input-vault" value={toAccount} onChange={(e) => setToAccount(e.target.value)} placeholder="e.g. 1231000000123" />
          </div>
        )}
        <div>
          <label className="label-vault">Amount (₹)</label>
          <input className="input-vault" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" inputMode="decimal" />
        </div>
        <div>
          <label className="label-vault">Note (optional)</label>
          <input className="input-vault" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Rent, salary, groceries" />
        </div>
        <button
          disabled={busy}
          className={
            activeTab.tone === "emerald" ? "stamp-btn-emerald w-full" : activeTab.tone === "oxblood" ? "stamp-btn-oxblood w-full" : "stamp-btn-brass w-full"
          }
        >
          {busy ? "Processing…" : `Confirm ${activeTab.label.toLowerCase()}`}
        </button>
      </form>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-display text-xl">Transaction History</h2>
        <button onClick={() => setFilterOpen((v) => !v)} className="stamp-btn-ghost !py-2 !px-4 text-sm">
          <Filter size={14} /> Filter
        </button>
      </div>

      {filterOpen && (
        <div className="ink-panel p-5 mb-6 grid md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="label-vault">Type</label>
            <select className="input-vault" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Any</option>
              {TX_TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label-vault">From</label>
            <input type="date" className="input-vault" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="label-vault">To</label>
            <input type="date" className="input-vault" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={applyFilter} className="stamp-btn-brass !py-2.5 flex-1 text-sm">Apply</button>
            <button onClick={clearFilter} className="stamp-btn-ghost !py-2.5 text-sm">Clear</button>
          </div>
        </div>
      )}

      {loadingHistory ? (
        <VaultLoader label="Loading history…" />
      ) : history.length === 0 ? (
        <EmptyState title="No transactions found" hint="Try clearing filters, or make your first transaction above." />
      ) : (
        <div className="passbook p-5">
          {history.map((t) => (
            <div key={t.transactionId} className="field-line flex-wrap">
              <span className="font-mono text-[11px] text-ink-text/50 w-full sm:w-32 shrink-0">{formatDate(t.createdAt)}</span>
              <span className="flex-1 font-display text-sm min-w-[120px]">{t.type?.replaceAll("_", " ")}</span>
              <span className="font-mono text-[10px] text-ink-text/40">{t.transactionId}</span>
              <Seal status={t.status} />
              <span className={`font-mono text-sm w-28 text-right ${
                ["DEPOSIT", "TRANSFER_CREDIT", "INTEREST_CREDIT"].includes(t.type) ? "text-emerald" : "text-oxblood"
              }`}>
                {["DEPOSIT", "TRANSFER_CREDIT", "INTEREST_CREDIT"].includes(t.type) ? "+" : "−"}{formatINR(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Toast message={toast?.message} tone={toast?.tone} onClose={close} />
    </div>
  );
}
