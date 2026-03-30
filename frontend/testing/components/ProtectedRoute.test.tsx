import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { ProtectedRoute } from "@/components/protected_route";
import { useAuthStore } from "@/stores/authStore";

// Stub the Topbar to avoid its own router/store dependencies in this test.
vi.mock("@/components/layout", () => ({
  Topbar: () => <nav data-testid="topbar">Topbar</nav>,
}));

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
});

function buildRouter(isAuthenticated: boolean) {
  useAuthStore.setState({ isAuthenticated, user: null, token: null });
  return createMemoryRouter(
    [
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [{ index: true, element: <div>Protected Content</div> }],
      },
      { path: "/login", element: <div>Login Page</div> },
    ],
    { initialEntries: ["/"] },
  );
}

describe("ProtectedRoute", () => {
  it("redirects to /login when the user is not authenticated", () => {
    render(<RouterProvider router={buildRouter(false)} />);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders the Topbar and child outlet when the user is authenticated", () => {
    render(<RouterProvider router={buildRouter(true)} />);
    expect(screen.getByTestId("topbar")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("does not render the Topbar when the user is not authenticated", () => {
    render(<RouterProvider router={buildRouter(false)} />);
    expect(screen.queryByTestId("topbar")).not.toBeInTheDocument();
  });
});
