import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { Topbar } from "@/components/layout";

/**
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to /login.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <Topbar />
      <Outlet />
    </div>
  );
}
