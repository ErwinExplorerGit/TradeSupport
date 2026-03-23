import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../stores/authStore";

/**
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to /login.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
