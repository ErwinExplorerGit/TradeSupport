import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../stores/authStore";

/**
 * Wraps routes that should only be accessible when NOT authenticated
 * (e.g. login, register). Redirects authenticated users to /analyze.
 */
export function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
