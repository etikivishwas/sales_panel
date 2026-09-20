import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import Leads from "./pages/Leads";
import Withdraw from "./pages/Withdraw";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import CommissionHistory from "./pages/CommissionHistory";
import AccountSettings from "./pages/AccountSettings";

const ProtectedPage = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedPage>
            <Dashboard />
          </ProtectedPage>
        }
      />

      <Route
        path="/vendors"
        element={
          <ProtectedPage>
            <Vendors />
          </ProtectedPage>
        }
      />

      <Route
        path="/leads"
        element={
          <ProtectedPage>
            <Leads />
          </ProtectedPage>
        }
      />

      <Route
        path="/withdraw"
        element={
          <ProtectedPage>
            <Withdraw />
          </ProtectedPage>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedPage>
            <Profile />
          </ProtectedPage>
        }
      />

      <Route
        path="/support"
        element={
          <ProtectedPage>
            <Support />
          </ProtectedPage>
        }
      />

      <Route
        path="/account-settings"
        element={
          <ProtectedPage>
            <AccountSettings />
          </ProtectedPage>
        }
      />

      <Route
        path="/commissions"
        element={
          <ProtectedPage>
            <CommissionHistory />
          </ProtectedPage>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}