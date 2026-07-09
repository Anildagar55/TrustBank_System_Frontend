import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://trustbank-system-backend-1.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// Normalize backend errors into a readable message string
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err?.response?.data;
    const message =
      (typeof data === "string" && data) ||
      data?.message ||
      err.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default client;

/* ---------------------------- Users -------------------------------- */
export const UserAPI = {
  all: () => client.get("/user").then((r) => r.data),
  // NOTE: backend's GET /user/{id} incorrectly requires a @RequestBody it never
  // actually uses, which browsers don't reliably send on GET requests. We fetch
  // the full (reliable, no-body) user list instead and pick the matching one.
  //
  // We also independently fetch this user's bank accounts via GET /bank/{userid}
  // (which keys off Bank's raw `userid` column) and use that as the source of
  // truth for bankList, instead of trusting the JPA-relationship-based bankList
  // that GET /user returns — some backend versions never populate that
  // relationship on account creation, which silently hides real accounts.
  get: async (id) => {
    const all = await client.get("/user").then((r) => r.data);
    const found = (all || []).find((u) => String(u.id) === String(id));
    if (!found) {
      throw new Error(`No customer found with ID ${id}.`);
    }
    try {
      const banks = await client.get(`/bank/${id}`).then((r) => r.data);
      found.bankList = Array.isArray(banks) ? banks : [];
    } catch {
      // backend returns an error when the user has zero accounts — treat as empty
      found.bankList = [];
    }
    return found;
  },
  create: (payload) => client.post("/user", payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/user/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/user/${id}`).then((r) => r.data),
};

/* ------------------------- Bank Accounts ---------------------------- */
export const BankAPI = {
  all: () => client.get("/bank").then((r) => r.data),
  byUser: (userId) => client.get(`/bank/${userId}`).then((r) => r.data),
  create: (payload) => client.post("/bank", payload).then((r) => r.data),
  update: (customerId, payload) => client.put(`/bank/${customerId}`, payload).then((r) => r.data),
  remove: (customerId) => client.delete(`/bank/${customerId}`).then((r) => r.data),
};

/* -------------------------- Transactions ---------------------------- */
export const TransactionAPI = {
  deposit: (payload) => client.post("/transactions/deposit", payload).then((r) => r.data),
  withdraw: (payload) => client.post("/transactions/withdraw", payload).then((r) => r.data),
  transfer: (payload) => client.post("/transactions/transfer", payload).then((r) => r.data),
  getById: (transactionId) => client.get(`/transactions/${transactionId}`).then((r) => r.data),
  all: () => client.get("/transactions").then((r) => r.data),
  history: (accountNumber) => client.get(`/transactions/Number/${accountNumber}`).then((r) => r.data),
  filter: (payload) => client.post("/transactions/filter", payload).then((r) => r.data),
  recent: (accountNumber, limit) =>
    client.get(`/transactions/ntransaction/${accountNumber}/${limit}`).then((r) => r.data),
};

/* ------------------------------ Loans -------------------------------- */
export const LoanAPI = {
  apply: (userId, payload) => client.post(`/api/loans/apply/${userId}`, payload).then((r) => r.data),
  approve: (payload) => client.put("/api/loans/approve", payload).then((r) => r.data),
  reject: (payload) => client.put("/api/loans/reject", payload).then((r) => r.data),
  payEmi: (payload) => client.post("/api/loans/emi/pay", payload).then((r) => r.data),
  calculator: (principal, annualRate, tenureMonths) =>
    client
      .get("/api/loans/calculator", { params: { principal, annualRate, tenureMonths } })
      .then((r) => r.data),
  byNumber: (loanNumber) => client.get(`/api/loans/${loanNumber}`).then((r) => r.data),
  byUser: (userId) => client.get(`/api/loans/user/${userId}`).then((r) => r.data),
  pending: () => client.get("/api/loans/admin/pending").then((r) => r.data),
  byStatus: (status) => client.get(`/api/loans/admin/status/${status}`).then((r) => r.data),
  all: () => client.get("/api/loans/admin/all").then((r) => r.data),
};
