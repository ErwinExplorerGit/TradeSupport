import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ProtectedRoute, PublicRoute } from "./components/index.ts";
import AnalyzePage from "./pages/analyze/index.tsx";
import ForgotPasswordPage from "./pages/forgot_password/index.tsx";
import HistoryPage from "./pages/history/index.tsx";
import LoginPage from "./pages/login/index.tsx";
import NotFoundPage from "./pages/not_found/index.tsx";
import RegisterPage from "./pages/register/index.tsx";
import VerifyPasswordPage from "./pages/verify_account/index.tsx";
import "./styles.scss";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to /analyze */}
          <Route path="/" element={<Navigate to="/analyze" replace />} />

          {/* Public-only routes: redirect to /analyze when already logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-account" element={<VerifyPasswordPage />} />
          </Route>

          {/* Protected routes: redirect to /login when not authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
