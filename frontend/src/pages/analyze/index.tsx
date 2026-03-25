import { useState, useEffect } from "react";
import { ConfigPanel } from "./components/config_panel";
import { AnalysisProgress } from "./components/AnalysisProgress";
import { useWebSocket } from "@/hooks/useWebSocket";
import { api } from "@/services/api";
import { ConfigFormData, ApiConfig, ResearchDepth } from "@/types";
import "./styles.scss";

const depthToValue: Record<ResearchDepth, number> = {
  quick: 1,
  standard: 3,
  deep: 5,
};

export default function AnalyzePage() {
  const {
    isConnected,
    state,
    tickerProgress,
    messages,
    clearMessages,
    initProgress,
  } = useWebSocket();
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.getConfig();
        setConfig(data);
      } catch (err) {
        console.error("Failed to fetch config:", err);
        setError("Failed to load configuration");
      } finally {
        setIsLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (
      state === "running" ||
      state === "idle" ||
      state === "stopped" ||
      state === "error"
    ) {
      setIsStarting(false);
    }
  }, [state]);

  const handleStartAnalysis = async (formConfig: ConfigFormData) => {
    try {
      setError(null);
      setIsStarting(true);
      clearMessages(); // clear log messages only — ticker cards persist

      await new Promise((resolve) => setTimeout(resolve, 3000));

      initProgress(
        formConfig.tickers.map((t) => ({
          ticker: t,
          percentage: 0,
          step: "Queued",
          status: "pending" as const,
          analysis_date: formConfig.analysisDate,
        })),
      );
      await api.startAnalysis({
        tickers: formConfig.tickers,
        analysis_date: formConfig.analysisDate,
        analysts: formConfig.analysts,
        research_depth: depthToValue[formConfig.researchDepth],
        llm_provider: formConfig.llmProvider,
        shallow_model: formConfig.shallowModel,
        deep_model: formConfig.deepModel,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start analysis";
      setError(message);
      console.error("Failed to start analysis:", err);
      setIsStarting(false);
    }
  };

  const handleStopAnalysis = async () => {
    try {
      setError(null);
      await api.stopAnalysis();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to stop analysis";
      setError(message);
      console.error("Failed to stop analysis:", err);
    }
  };

  const handleAddTicker = async (formConfig: ConfigFormData) => {
    try {
      setError(null);
      initProgress(
        formConfig.tickers.map((t) => ({
          ticker: t,
          percentage: 0,
          step: "Queued",
          status: "pending" as const,
          analysis_date: formConfig.analysisDate,
        })),
      );
      await api.addTicker({
        tickers: formConfig.tickers,
        analysis_date: formConfig.analysisDate,
        analysts: formConfig.analysts,
        research_depth: depthToValue[formConfig.researchDepth],
        llm_provider: formConfig.llmProvider,
        shallow_model: formConfig.shallowModel,
        deep_model: formConfig.deepModel,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add ticker";
      setError(message);
      console.error("Failed to add ticker:", err);
    }
  };

  const effectiveState = isStarting ? "running" : state;
  const progressEntries = Object.values(tickerProgress);
  const isActive = effectiveState === "running";
  const hasResults = progressEntries.length > 0;

  return (
    <div className="analyze-page">
      <main className="analyze-body">
        <div className="analyze-container">
          {/* Page header */}
          <section className="analyze-hero">
            <div className="analyze-hero-text">
              <h1 className="analyze-hero-title">Stock Analysis</h1>
              <p className="analyze-hero-subtitle">
                Configure your AI-powered analysis and get trading insights in
                real time.
              </p>
            </div>
            <div
              className={`analyze-connection-badge ${isConnected ? "connected" : "disconnected"}`}
            >
              <span className="analyze-connection-dot" />
              {isConnected ? "Connected" : "Disconnected"}
            </div>
          </section>

          {/* Error banner */}
          {error && (
            <div className="analyze-error">
              <strong>Error:</strong> {error}
              <button
                className="analyze-error-close"
                onClick={() => setError(null)}
              >
                ×
              </button>
            </div>
          )}

          {isLoadingConfig ? (
            <div className="analyze-loading">
              <div className="analyze-loading-spinner" />
              <span>Loading configuration…</span>
            </div>
          ) : (
            <div className="analyze-main-layout">
              {/* Left — configuration */}
              <div className="analyze-col-config">
                <ConfigPanel
                  onStartAnalysis={handleStartAnalysis}
                  onAddTicker={handleAddTicker}
                  onStopAnalysis={handleStopAnalysis}
                  analysisState={effectiveState}
                  config={config}
                  isStarting={isStarting}
                />
              </div>

              {/* Right — live progress / results */}
              <div className="analyze-col-progress">
                {hasResults ? (
                  <AnalysisProgress
                    tickerProgress={tickerProgress}
                    messages={messages}
                    analysisState={effectiveState}
                    isActive={isActive}
                    onStop={handleStopAnalysis}
                  />
                ) : (
                  <div className="analyze-progress-empty">
                    <span className="analyze-progress-empty-icon">📊</span>
                    <p>Results will appear here once analysis starts.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
