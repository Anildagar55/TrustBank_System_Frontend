import { useState } from "react";
import { useBank, BankAPI } from "../context/BankContext";
import { EmptyState, Toast } from "../components/Common";
import { useToast, formatINR } from "../utils";
import { Landmark, Plus, Pencil, Trash2, Check, X } from "lucide-react";

const BANK_TYPES = ["SBI", "HDFC", "BOB", "BOI", "CANARA", "PNB", "UCO"];

export default function Accounts() {
  const { user, activeAccount, chooseAccount, refreshUser } = useBank();
  const { toast, show, close } = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [newAcc, setNewAcc] = useState({ banktype: "SBI", amount: "" });
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ holderName: "", mobileNumber: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAcc.amount) {
      show("Enter an opening amount first.", "oxblood");
      return;
    }
    setBusy(true);
    try {
      const msg = await BankAPI.create({
        userid: user.id,
        banktype: newAcc.banktype,
        amount: Number(newAcc.amount),
      });
      await refreshUser();
      setOpenForm(false);
      setNewAcc({ banktype: "SBI", amount: "" });
      show(typeof msg === "string" ? msg : "Account opened successfully.", "emerald");
    } catch (err) {
      show(err.message, "oxblood");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (acc) => {
    setEditingId(acc.customerId);
    setEditForm({ holderName: acc.holderName, mobileNumber: acc.mobileNumber });
  };

  const saveEdit = async (acc) => {
    setBusy(true);
    try {
      await BankAPI.update(acc.customerId, { ...acc, ...editForm });
      await refreshUser();
      setEditingId(null);
      show("Account details updated.", "emerald");
    } catch (err) {
      show(err.message, "oxblood");
    } finally {
      setBusy(false);
    }
  };

  const closeAccount = async (acc) => {
    if (!confirm(`Close account ${acc.accountNumber}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await BankAPI.remove(acc.customerId);
      if (activeAccount?.customerId === acc.customerId) chooseAccount(null);
      await refreshUser();
      show("Account closed successfully.", "brass");
    } catch (err) {
      show(err.message, "oxblood");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-brass/70 uppercase mb-2">My Accounts</p>
          <h1 className="font-display text-3xl md:text-4xl">Your accounts</h1>
        </div>
        <button onClick={() => setOpenForm((v) => !v)} className="stamp-btn-emerald">
          <Plus size={16} /> Open New Account
        </button>
      </div>

      {openForm && (
        <form onSubmit={handleCreate} className="ink-panel p-6 mb-8 grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label-vault">Bank</label>
            <select className="input-vault" value={newAcc.banktype} onChange={(e) => setNewAcc((f) => ({ ...f, banktype: e.target.value }))}>
              {BANK_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label-vault">Opening deposit (₹)</label>
            <input className="input-vault" value={newAcc.amount} onChange={(e) => setNewAcc((f) => ({ ...f, amount: e.target.value }))} placeholder="1000" inputMode="decimal" />
          </div>
          <button disabled={busy} className="stamp-btn-brass h-fit">{busy ? "Stamping…" : "Open Account"}</button>
        </form>
      )}

      {!user?.bankList || user.bankList.length === 0 ? (
        <EmptyState title="No accounts yet" hint="Open your first account above." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {user.bankList.map((acc) => (
            <div key={acc.customerId} className="passbook p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Landmark size={18} className="text-ink-text/50" />
                  <span className="font-display text-lg">{acc.banktype}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(acc)} className="text-ink-text/40 hover:text-emerald"><Pencil size={15} /></button>
                  <button onClick={() => closeAccount(acc)} className="text-ink-text/40 hover:text-oxblood"><Trash2 size={15} /></button>
                </div>
              </div>

              <div className="field-line"><span className="text-ink-text/50 text-xs">Customer ID</span><span className="flex-1 text-right font-mono text-xs">{acc.customerId}</span></div>
              <div className="field-line"><span className="text-ink-text/50 text-xs">Account No.</span><span className="flex-1 text-right font-mono text-xs">{acc.accountNumber}</span></div>

              {editingId === acc.customerId ? (
                <div className="mt-3 space-y-2">
                  <input className="input-vault " value={editForm.holderName} onChange={(e) => setEditForm((f) => ({ ...f, holderName: e.target.value }))} placeholder="Holder name" />
                  <input className="input-vault " value={editForm.mobileNumber} onChange={(e) => setEditForm((f) => ({ ...f, mobileNumber: e.target.value }))} placeholder="Mobile number" />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(acc)} className="stamp-btn-emerald flex-1 !py-2 text-sm"><Check size={14} /> Save</button>
                    <button onClick={() => setEditingId(null)} className="stamp-btn-ghost !py-2 text-sm"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="field-line"><span className="text-ink-text/50 text-xs">Holder</span><span className="flex-1 text-right text-sm">{acc.holderName}</span></div>
                  <div className="field-line"><span className="text-ink-text/50 text-xs">Mobile</span><span className="flex-1 text-right font-mono text-xs">{acc.mobileNumber}</span></div>
                </>
              )}

              <div className="flex items-center justify-between mt-4">
                <span className="font-display text-2xl">{formatINR(acc.amount)}</span>
                <button onClick={() => chooseAccount(acc)} className={`text-xs font-mono px-3 py-1.5 rounded-full border ${activeAccount?.customerId === acc.customerId ? "bg-brass text-ink border-brass" : "border-ink-text/20 text-ink-text/60"}`}>
                  {activeAccount?.customerId === acc.customerId ? "Active" : "Set active"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast message={toast?.message} tone={toast?.tone} onClose={close} />
    </div>
  );
}
