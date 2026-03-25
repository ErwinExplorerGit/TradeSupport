import { NavLink, useNavigate } from "react-router";
import { useAuthStore } from "../../../stores/authStore";
import "./styles.scss";

const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Analyze", to: "/analyze" },
  { label: "History", to: "/history" },
  { label: "Account", to: "/account" },
] as const;

export function Topbar() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="nav-brand">
        <span className="nav-title">TradeSupport</span>
        <span className="nav-subtitle">POWERED BY AI</span>
      </div>

      <nav className="nav-links">
        {NAV_LINKS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link${isActive ? " nav-link--active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}

        <button className="nav-link nav-link--logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}
