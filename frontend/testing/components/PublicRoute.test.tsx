import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { PublicRoute } from "@/components/public_route";
import { useAuthStore } from "@/stores/authStore";

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
        element: <PublicRoute />,
        children: [{ index: true, element: <div>Public Content</div> }],
      },
      { path: "/dashboard", element: <div>Dashboard Page</div> },
    ],
    { initialEntries: ["/"] },
  );
}

describe("PublicRoute", () => {
  it("renders the child outlet when the user is not authenticated", () => {
    render(<RouterProvider router={buildRouter(false)} />);
    expect(screen.getByText("Public Content")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
  });

  it("redirects to /dashboard when the user is authenticated", () => {
    render(<RouterProvider router={buildRouter(true)} />);
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    expect(screen.queryByText("Public Content")).not.toBeInTheDocument();
  });
});
