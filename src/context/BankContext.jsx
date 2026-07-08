import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserAPI, BankAPI } from "../api/client";

const BankContext = createContext(null);

const STORAGE_KEY = "kosha.session.v1";

export function BankProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, aadhar, mobileNumber, email, bankList }
  const [activeAccount, setActiveAccount] = useState(null); // one Bank record
  const [adminMode, setAdminMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.userId) {
          UserAPI.get(parsed.userId)
            .then((u) => {
              setUser(u);
              if (u?.bankList?.length) {
                const found =
                  u.bankList.find((b) => b.customerId === parsed.accountId) ||
                  u.bankList[0];
                setActiveAccount(found || null);
              }
            })
            .catch(() => localStorage.removeItem(STORAGE_KEY))
            .finally(() => setLoading(false));
          return;
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setLoading(false);
  }, []);

  const persist = useCallback((u, acc) => {
    if (u) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ userId: u.id, accountId: acc?.customerId })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (userId) => {
      const u = await UserAPI.get(userId);
      setUser(u);
      const acc = u?.bankList?.[0] || null;
      setActiveAccount(acc);
      persist(u, acc);
      return u;
    },
    [persist]
  );

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const u = await UserAPI.get(user.id);
    setUser(u);
    if (activeAccount) {
      const stillThere = u?.bankList?.find((b) => b.customerId === activeAccount.customerId);
      setActiveAccount(stillThere || u?.bankList?.[0] || null);
    }
    return u;
  }, [user, activeAccount]);

  const chooseAccount = useCallback(
    (acc) => {
      setActiveAccount(acc);
      persist(user, acc);
    },
    [user, persist]
  );

  const logout = useCallback(() => {
    setUser(null);
    setActiveAccount(null);
    setAdminMode(false);
    persist(null);
  }, [persist]);

  const value = {
    user,
    activeAccount,
    adminMode,
    loading,
    setAdminMode,
    login,
    logout,
    refreshUser,
    chooseAccount,
  };

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBank must be used within BankProvider");
  return ctx;
}

export { BankAPI };
