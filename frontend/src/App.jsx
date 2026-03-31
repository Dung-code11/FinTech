import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { CategoryProvider } from "./context/CategoryContext";
import { TransactionProvider } from "./context/TransactionContext";
import { DebtProvider } from "./context/DebtContext";
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";
// import CurrencyToolsPage from "./pages/CurrencyToolsPage";
// import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WalletProvider>
          <CategoryProvider>
            <TransactionProvider>
              <DebtProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/verify-otp" element={<VerifyOTPPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
              </Routes>
              </DebtProvider>
            </TransactionProvider>
          </CategoryProvider>
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
