import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBank } from "../context/BankContext";
import { TransactionAPI } from "../api/client";
import { VaultLoader, EmptyState, Seal } from "../components/Common";
import { formatINR, formatDate } from "../utils";
import { ArrowDownCircle, ArrowUpCircle, SendHorizontal, HandCoins, Landmark } from "lucide-react";

export default function Dashboard() {
  const { user, activeAccount, chooseAccount } = useBank();
  const [recent, setRecent] = useState(null);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    if (!activeAccount) {
      setRecent([]);
      return;
    }
    setLoadingRecent(true);
    TransactionAPI.recent(activeAccount.accountNumber, 5)
      .then((data) => setRecent(Array.isArray(data) ? data : []))
      .catch(() => setRecent([]))
      .finally(() => setLoadingRecent(false));
  }, [activeAccount]);

  if (!user) return <VaultLoader label="Loading your account…" />;

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <p className="font-mono text-[11px] tracking-[0.3em] text-brass/70 uppercase mb-2">
        Dashboard
      </p>
      <h1 className="font-display text-3xl md:text-4xl mb-8">
        Welcome back, {user.name?.split(" ")[0]}
      </h1>

      {user.bankList?.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          hint="Open your first account to start banking with us."
        />
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {user.bankList?.map((acc) => (
              <button
                key={acc.customerId}
                onClick={() => chooseAccount(acc)}
                className={`passbook p-5 text-left transition-transform hover:-translate-y-0.5 ${
                  activeAccount?.customerId === acc.customerId ? "ring-2 ring-brass" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-sm text-ink-text/60">{acc.banktype}</span>
                  <Landmark size={16} className="text-ink-text/40" />
                </div>
                <p className="font-mono text-xs text-ink-text/50 mb-1">{acc.accountNumber}</p>
                <p className="font-display text-2xl">{formatINR(acc.amount)}</p>
                <p className="font-mono text-[10px] text-ink-text/40 mt-2">ID {acc.customerId}</p>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link to="/transactions" className="stamp-btn-emerald">
              <ArrowDownCircle size={16} /> Deposit
            </Link>
            <Link to="/transactions" className="stamp-btn-oxblood">
              <ArrowUpCircle size={16} /> Withdraw
            </Link>
            <Link to="/transactions" className="stamp-btn-brass">
              <SendHorizontal size={16} /> Transfer
            </Link>
            <Link to="/loans" className="stamp-btn-ghost">
              <HandCoins size={16} /> Apply for a loan
            </Link>
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl">Recent transactions {activeAccount ? `· ${activeAccount.accountNumber}` : ""}</h2>
        <Link to="/transactions" className="text-sm text-brass hover:underline">
          View all transactions →
        </Link>
      </div>

      {loadingRecent ? (
        <VaultLoader label="Loading transactions…" />
      ) : !recent || recent.length === 0 ? (
        <EmptyState title="No transactions yet" hint="Your deposits, withdrawals and transfers will appear here." />
      ) : (
        <div className="passbook p-5">
          {recent.map((t) => (
            <div key={t.transactionId} className="field-line">
              <span className="font-mono text-xs text-ink-text/50 w-32 shrink-0">{formatDate(t.createdAt)}</span>
              <span className="flex-1 font-display text-sm">{t.type?.replaceAll("_", " ")}</span>
              <Seal status={t.status} />
              <span
                className={`font-mono text-sm w-28 text-right ${
                  t.type === "DEPOSIT" || t.type === "TRANSFER_CREDIT" || t.type== "LOAN_DISBURSEMENT"? "text-emerald" : "text-oxblood"
                }`}
              >
                {t.type === "DEPOSIT" || t.type === "TRANSFER_CREDIT" ||t.type== "LOAN_DISBURSEMENT" ? "+" : "−"}
                {formatINR(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
