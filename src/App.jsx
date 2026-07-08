import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { BankProvider, useBank } from "./context/BankContext";
import Navbar from "./components/Navbar";
import { VaultLoader } from "./components/Common";

import Welcome from "./pages/Welcome";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Loans from "./pages/Loans";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function ProtectedLayout() {
  const { user, loading } = useBank();

  if (loading) return <VaultLoader label="Loading…" />;
  if (!user) return <Navigate to="/start" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/start" element={<GetStarted />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BankProvider>
      <AppRoutes />
    </BankProvider>
  );
}
