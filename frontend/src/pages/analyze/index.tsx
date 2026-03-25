import { useState, useEffect } from "react";
import { ConfigPanel } from "./components/config_panel";
import { OutputPanel } from "./components/OutputPanel";
import { useWebSocket } from "../../hooks/useWebSocket";
import { api } from "../../services/api";
import { ConfigFormData, ApiConfig, ResearchDepth } from "../../types";

const depthToValue: Record<ResearchDepth, number> = {
  quick: 1,
  standard: 3,
  deep: 5,
};

export default function AnalyzePage() {
  const { isConnected, messages, state, tickerProgress, clearMessages } =
    useWebSocket();
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
      clearMessages();

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

  const effectiveState = isStarting ? "running" : state;

  return (
    <>
      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button className="error-close" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      {isLoadingConfig ? (
        <div className="loading-container">
          <div className="loading-spinner">Loading configuration...</div>
        </div>
      ) : (
        <div className="app-content">
          <div className="panel-container">
            <ConfigPanel
              onStartAnalysis={handleStartAnalysis}
              onStopAnalysis={handleStopAnalysis}
              analysisState={effectiveState}
              config={config}
            />
          </div>

          <div className="panel-container">
            <OutputPanel
              isConnected={isConnected}
              messages={messages}
              tickerProgress={tickerProgress}
              analysisState={effectiveState}
            />
          </div>
        </div>
      )}
    </>
  );
}
