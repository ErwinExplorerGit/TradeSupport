import { useEffect, useRef } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiClock,
} from "react-icons/fi";
import { TickerProgress, AnalysisState } from "../../../types";

interface OutputPanelProps {
  isConnected: boolean;
  messages: Array<{ ticker: string; text: string }>;
  tickerProgress: Record<string, TickerProgress>;
  analysisState: AnalysisState;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const decisionColor = (d?: string | null) => {
  if (!d) return "";
  if (d === "BUY") return "decision-buy";
  if (d === "SELL") return "decision-sell";
  return "decision-hold";
};

const parseInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatusIcon = ({ status }: { status: TickerProgress["status"] }) => {
  if (status === "done")
    return <FiCheckCircle className="ticker-status-icon done" />;
  if (status === "error")
    return <FiAlertCircle className="ticker-status-icon error" />;
  if (status === "running")
    return <FiLoader className="ticker-status-icon running spin" />;
  return <FiClock className="ticker-status-icon pending" />;
};

interface TickerCardProps {
  progress: TickerProgress;
}

const TickerCard = ({ progress }: TickerCardProps) => {
  const pct = Math.max(0, Math.min(100, progress.percentage));
  const isDone = progress.status === "done";
  const isError = progress.status === "error";

  return (
    <div className={`ticker-card ticker-card--${progress.status}`}>
      <div className="ticker-card-header">
        <div className="ticker-card-left">
          <StatusIcon status={progress.status} />
          <span className="ticker-card-symbol">{progress.ticker}</span>
        </div>
        <div className="ticker-card-right">
          {isDone && progress.decision && (
            <span
              className={`decision-badge ${decisionColor(progress.decision)}`}
            >
              {progress.decision}
            </span>
          )}
          {isError && (
            <span className="decision-badge decision-error">FAILED</span>
          )}
          {!isDone && !isError && (
            <span className="ticker-card-pct">{pct}%</span>
          )}
        </div>
      </div>

      <div className="ticker-progress-bar">
        <div
          className={`ticker-progress-fill ${isError ? "error" : isDone ? "done" : ""}`}
          style={{ width: `${isError ? 100 : pct}%` }}
        />
      </div>

      {!isDone && !isError && (
        <div className="ticker-card-step">{progress.step}</div>
      )}
      {isDone && !progress.decision && (
        <div className="ticker-card-step">Analysis complete</div>
      )}
    </div>
  );
};

// ── Main panel ─────────────────────────────────────────────────────────────────

export const OutputPanel = ({
  isConnected,
  messages,
  tickerProgress,
  analysisState,
}: OutputPanelProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const progressEntries = Object.values(tickerProgress);
  const hasProgress = progressEntries.length > 0;
  const isActive = analysisState === "running";

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="output-panel">
      <div className="output-title">Trading Analysis</div>

      {/* Per-ticker progress cards */}
      {hasProgress && (
        <div className={`ticker-progress-section ${isActive ? "active" : ""}`}>
          {progressEntries.map((p) => (
            <TickerCard key={p.ticker} progress={p} />
          ))}
        </div>
      )}

      {/* Log terminal */}
      <div className="terminal-wrapper">
        <div className="terminal" ref={terminalRef}>
          {messages.length === 0 ? (
            <div className="terminal-placeholder">
              {isConnected
                ? hasProgress
                  ? "Analysis running..."
                  : "Connected. Waiting for analysis to start..."
                : "Waiting to connect..."}
            </div>
          ) : (
            messages.map((msg, index) => {
              const prefix = msg.ticker ? (
                <span className="terminal-ticker-label">[{msg.ticker}] </span>
              ) : null;
              const line = msg.text;
              if (/^[=]{4,}$/.test(line.trim()))
                return <div key={index} className="terminal-divider" />;
              if (/^[_\-]{4,}$/.test(line.trim()))
                return <div key={index} className="terminal-rule" />;
              if (line.trim() === "")
                return <div key={index} className="terminal-spacer" />;
              if (
                /^[A-Z][A-Z\s:&,()-]{3,}$/.test(line.trim()) &&
                !line.includes("**")
              ) {
                return (
                  <div key={index} className="terminal-heading">
                    {prefix}
                    {line.trim()}
                  </div>
                );
              }
              return (
                <div key={index} className="terminal-line">
                  {prefix}
                  {parseInline(line)}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div
        className={`status-bar ${isConnected ? "connected" : "disconnected"}`}
      >
        <div className="status-indicator" />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
        {isActive && <span className="status-running-label">● Analyzing…</span>}
      </div>
    </div>
  );
};
