import { useState, useRef, useEffect } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { TickerProgress, AnalysisState } from "@/types";

interface AnalysisProgressProps {
  tickerProgress: Record<string, TickerProgress>;
  messages: Array<{ ticker: string; text: string }>;
  analysisState: AnalysisState;
  isActive: boolean;
  onClear: () => void;
  onStop: () => void;
}

const decisionMeta = (decision?: string | null) => {
  if (!decision) return null;
  if (decision === "BUY")
    return { label: "BUY", cls: "ap-result--buy", Icon: FiTrendingUp };
  if (decision === "SELL")
    return { label: "SELL", cls: "ap-result--sell", Icon: FiTrendingDown };
  return { label: "HOLD", cls: "ap-result--hold", Icon: FiMinus };
};

const StatusIcon = ({ status }: { status: TickerProgress["status"] }) => {
  if (status === "done")
    return <FiCheckCircle className="ap-status-icon ap-status-icon--done" />;
  if (status === "error")
    return <FiAlertCircle className="ap-status-icon ap-status-icon--error" />;
  if (status === "running")
    return (
      <FiLoader className="ap-status-icon ap-status-icon--running ap-spin" />
    );
  return <FiClock className="ap-status-icon ap-status-icon--pending" />;
};

/** Mirrors backend _extract_final_decision_text — pulls the decision block from 'Ticker:' onward. */
const extractFinalDecision = (messages: string[]): string | null => {
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.includes("Ticker:") && msg.includes("FINAL TRADING DECISION")) {
      return msg.substring(msg.indexOf("Ticker:"));
    }
    if (msg.trim().startsWith("Ticker:")) {
      return messages.slice(i).join("\n");
    }
  }
  return null;
};

const TickerCard = ({
  progress,
  onStop,
  tickerMessages,
}: {
  progress: TickerProgress;
  onStop: () => void;
  tickerMessages: string[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const pct = Math.max(0, Math.min(100, progress.percentage));
  const isDone = progress.status === "done";
  const isError = progress.status === "error";
  const isRunning = progress.status === "running";
  const meta = decisionMeta(progress.decision);

  useEffect(() => {
    if (expanded && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [expanded, tickerMessages]);

  return (
    <div className={`ap-card ap-card--${progress.status}`}>
      <div className="ap-card-header">
        <div className="ap-card-left">
          <StatusIcon status={progress.status} />
          <div>
            <span className="ap-card-ticker">{progress.ticker}</span>
            {progress.analysis_date && (
              <span className="ap-card-date">{progress.analysis_date}</span>
            )}
            {isRunning && progress.step && (
              <span className="ap-card-step">{progress.step}</span>
            )}
            {isDone && !meta && (
              <span className="ap-card-step">Analysis complete</span>
            )}
            {isError && (
              <span className="ap-card-step ap-card-step--error">
                Analysis failed
              </span>
            )}
          </div>
        </div>

        <div className="ap-card-right">
          {isDone ? (
            <div className="ap-card-right-done">
              {meta && (
                <div className={`ap-result ${meta.cls}`}>
                  <meta.Icon className="ap-result-icon" />
                  <span>{meta.label}</span>
                </div>
              )}
              <button
                type="button"
                className="ap-view-btn"
                onClick={() => setExpanded((v) => !v)}
                title={expanded ? "Hide details" : "View analysis"}
              >
                {expanded ? (
                  <FiChevronUp className="ap-view-icon" />
                ) : (
                  <FiChevronDown className="ap-view-icon" />
                )}
                {expanded ? "Hide" : "View"}
              </button>
            </div>
          ) : isError ? (
            <div className="ap-result ap-result--failed">FAILED</div>
          ) : isRunning ? (
            <div className="ap-card-right-running">
              <span className="ap-card-pct">{pct}%</span>
              <button
                type="button"
                className="ap-stop-ticker-btn"
                onClick={onStop}
                title="Stop analysis"
                aria-label="Stop analysis"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <span className="ap-card-pct">{pct}%</span>
          )}
        </div>
      </div>

      <div className="ap-progress-track">
        <div
          className={`ap-progress-fill ${isError ? "ap-progress-fill--error" : isDone ? "ap-progress-fill--done" : ""}`}
          style={{ width: `${isError ? 100 : pct}%` }}
        />
      </div>

      {expanded &&
        (() => {
          if (isDone) {
            const finalText = extractFinalDecision(tickerMessages);
            return (
              <div className="ap-log" ref={logRef}>
                {finalText ? (
                  <pre className="ap-log-decision">{finalText}</pre>
                ) : (
                  <p className="ap-log-empty">No decision available.</p>
                )}
              </div>
            );
          }
          return (
            <div className="ap-log" ref={logRef}>
              {tickerMessages.length === 0 ? (
                <p className="ap-log-empty">No log available.</p>
              ) : (
                tickerMessages.map((line, i) => (
                  <div key={i} className="ap-log-line">
                    {line}
                  </div>
                ))
              )}
            </div>
          );
        })()}
    </div>
  );
};

export const AnalysisProgress = ({
  tickerProgress,
  messages,
  analysisState,
  isActive,
  onStop,
}: Omit<AnalysisProgressProps, "onClear">) => {
  const STATUS_ORDER: Record<TickerProgress["status"], number> = {
    running: 0,
    pending: 1,
    done: 2,
    error: 3,
  };
  const entries = Object.values(tickerProgress).sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    // Within the same status group, sort by analysis_date descending
    const dateA = a.analysis_date ?? "";
    const dateB = b.analysis_date ?? "";
    if (dateA < dateB) return 1;
    if (dateA > dateB) return -1;
    return a.ticker.localeCompare(b.ticker);
  });
  const doneCount = entries.filter(
    (e) => e.status === "done" || e.status === "error",
  ).length;
  const overallPct =
    entries.length > 0
      ? Math.round(
          entries.reduce((sum, e) => sum + Math.min(100, e.percentage), 0) /
            entries.length,
        )
      : 0;

  const sectionLabel =
    analysisState === "stopped"
      ? "Analysis Stopped"
      : analysisState === "error"
        ? "Analysis Error"
        : isActive
          ? "Analysis Running"
          : "Analysis Complete";

  return (
    <section className="ap-section">
      <div className="ap-section-header">
        <div className="ap-section-title-row">
          <h2 className="ap-section-title">{sectionLabel}</h2>
          {isActive && <span className="ap-pulse-dot" />}
        </div>
        <div className="ap-summary">
          <span className="ap-summary-count">
            {doneCount} / {entries.length} tickers complete
          </span>
          <div className="ap-summary-bar">
            <div
              className="ap-summary-fill"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <span className="ap-summary-pct">{overallPct}%</span>
        </div>
      </div>

      <div className="ap-grid">
        {entries.map((p) => (
          <TickerCard
            key={p.analysis_date ? `${p.ticker}:${p.analysis_date}` : p.ticker}
            progress={p}
            onStop={onStop}
            tickerMessages={messages
              .filter((m) => m.ticker === p.ticker)
              .map((m) => m.text)}
          />
        ))}
      </div>
    </section>
  );
};
