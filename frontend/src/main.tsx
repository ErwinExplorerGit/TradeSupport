import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ProtectedRoute, PublicRoute } from "./components/index.ts";
import AccountPage from "./pages/account/index.tsx";
import AnalyzePage from "./pages/analyze/index.tsx";
import DashboardPage from "./pages/dashboard/index.tsx";
import ForgotPasswordPage from "./pages/forgot_password/index.tsx";
import HistoryPage from "./pages/history/index.tsx";
import LoginPage from "./pages/login/index.tsx";
import NotFoundPage from "./pages/not_found/index.tsx";
import RegisterPage from "./pages/register/index.tsx";
import ResetPasswordPage from "./pages/reset_password/index.tsx";
import VerifyPasswordPage from "./pages/verify_account/index.tsx";
import "./styles.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public-only routes: redirect to /analyze when already logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-account" element={<VerifyPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected routes: redirect to /login when not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
