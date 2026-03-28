import { useNavigate } from "react-router";
import { FiTrendingUp, FiClock, FiUser, FiZap } from "react-icons/fi";
import { useAuthStore } from "@/stores";
import "./styles.scss";

const QUICK_ACTIONS = [
  {
    icon: FiTrendingUp,
    label: "New Analysis",
    description: "Run an AI-powered analysis on any stock ticker.",
    to: "/analyze",
    primary: true,
  },
  {
    icon: FiClock,
    label: "View History",
    description: "Browse your past analyses and results.",
    to: "/history",
    primary: false,
  },
  {
    icon: FiUser,
    label: "Account",
    description: "Manage your account settings and password.",
    to: "/account",
    primary: false,
  },
] as const;

const INFO_CARDS = [
  {
    title: "Multi-Agent Analysis",
    text: "Five specialized AI analysts. market, social, news, fundamentals, and momentum. collaborate to deliver comprehensive stock insights.",
  },
  {
    title: "Flexible LLM Support",
    text: "Choose from OpenAI, Anthropic, Google, OpenRouter, or local Ollama models to power your analysis pipeline.",
  },
  {
    title: "Real-Time Output",
    text: "Watch the analysis unfold live via WebSocket streaming, with detailed logs from each analyst agent.",
  },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const firstName = user?.username?.split(" ")[0] ?? "Trader";

  return (
    <div className="dashboard-page">
      <main className="dashboard-body">
        <div className="dashboard-container">
          {/* Welcome Banner */}
          <section className="dashboard-welcome">
            <div className="dashboard-welcome-text">
              <h1 className="dashboard-welcome-title">
                Welcome back, {firstName}
              </h1>
              <p className="dashboard-welcome-subtitle">
                Your AI-powered trading analysis platform is ready.
              </p>
            </div>
            <div className="dashboard-welcome-badge">
              <FiZap />
              <span>Powered by AI</span>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Quick Actions</h2>
            <div className="dashboard-actions">
              {QUICK_ACTIONS.map(
                ({ icon: Icon, label, description, to, primary }) => (
                  <button
                    key={to}
                    className={`dashboard-action-card${primary ? " dashboard-action-card--primary" : ""}`}
                    onClick={() => navigate(to)}
                  >
                    <div className="dashboard-action-icon">
                      <Icon />
                    </div>
                    <h3 className="dashboard-action-label">{label}</h3>
                    <p className="dashboard-action-desc">{description}</p>
                  </button>
                ),
              )}
            </div>
          </section>

          {/* About Section */}
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">About TradeSupport</h2>
            <div className="dashboard-info-cards">
              {INFO_CARDS.map(({ title, text }) => (
                <div className="dashboard-info-card" key={title}>
                  <h3 className="dashboard-info-title">{title}</h3>
                  <p className="dashboard-info-text">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
