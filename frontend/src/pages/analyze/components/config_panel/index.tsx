import { useState, useEffect } from "react";
import { ConfigFormData, AnalysisState, ApiConfig, LLMProvider } from "@/types";
import {
  TickerField,
  DateField,
  AnalystsField,
  ResearchDepthField,
  LLMProviderField,
  ModelSelector,
  ActionButtons,
} from "./components";

interface ConfigPanelProps {
  onStartAnalysis: (config: ConfigFormData) => void;
  onAddTicker: (config: ConfigFormData) => Promise<void>;
  onStopAnalysis: () => void;
  analysisState: AnalysisState;
  config: ApiConfig | null;
  isStarting?: boolean;
}

export const ConfigPanel = ({
  onStartAnalysis,
  onAddTicker,
  onStopAnalysis: _onStopAnalysis,
  analysisState,
  config,
  isStarting = false,
}: ConfigPanelProps) => {
  const today = new Date().toISOString().split("T")[0];

  const analystMap: Record<string, keyof ConfigFormData["analysts"]> = {
    "Market Analyst": "market",
    "Social Media Analyst": "social",
    "News Analyst": "news",
    "Fundamentals Analyst": "fundamentals",
    "Momentum Analyst": "momentum",
  };

  const [isAddingTicker, setIsAddingTicker] = useState(false);

  const [formData, setFormData] = useState<ConfigFormData>({
    tickers: ["TSLA"],
    analysisDate: today,
    analysts: {
      market: true,
      social: true,
      news: false,
      fundamentals: false,
      momentum: false,
    },
    researchDepth: "quick",
    llmProvider: "openai",
    shallowModel: "gpt-4o-mini",
    deepModel: "gpt-4o-mini",
  });

  useEffect(() => {
    if (config && formData.llmProvider) {
      const shallowModels = config.shallow[formData.llmProvider];
      const deepModels = config.deep[formData.llmProvider];
      if (shallowModels?.[0] && deepModels?.[0]) {
        setFormData((prev) => ({
          ...prev,
          shallowModel: shallowModels[0].value,
          deepModel: deepModels[0].value,
        }));
      }
    }
  }, [config]);

  const handleInputChange = (field: keyof ConfigFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "llmProvider" && config) {
        const shallowModels = config.shallow[value as string];
        const deepModels = config.deep[value as string];
        if (shallowModels?.[0]) updated.shallowModel = shallowModels[0].value;
        if (deepModels?.[0]) updated.deepModel = deepModels[0].value;
      }
      return updated;
    });
  };

  const handleAnalystChange = (analyst: keyof ConfigFormData["analysts"]) => {
    setFormData((prev) => ({
      ...prev,
      analysts: { ...prev.analysts, [analyst]: !prev.analysts[analyst] },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tickers.length === 0) return;
    const anyAnalystEnabled = Object.values(formData.analysts).some(Boolean);
    if (!anyAnalystEnabled) return;
    if (!formData.analysisDate) return;
    if (isRunning) {
      setIsAddingTicker(true);
      try {
        await onAddTicker(formData);
      } finally {
        setIsAddingTicker(false);
      }
    } else {
      onStartAnalysis(formData);
    }
  };

  const isRunning = analysisState === "running";

  return (
    <section className="cp-section">
      <form onSubmit={handleSubmit}>
        <div className="cp-card">
          {/* Row 1 — Target Tickers */}
          <div>
            <h3 className="cp-card-title">Target Ticker</h3>
            <p className="cp-card-desc">
              Select a stock symbol to analyse. You can change it between runs.
            </p>
            <TickerField
              value={formData.tickers}
              onChange={(v) => handleInputChange("tickers", v)}
              disabled={isAddingTicker}
            />
          </div>

          <div className="cp-divider" />

          {/* Row 2 — Analysis Date */}
          <div>
            <h3 className="cp-card-title">Analysis Date</h3>
            <p className="cp-card-desc">The date the analysis is based on.</p>
            <DateField
              value={formData.analysisDate}
              onChange={(v) => handleInputChange("analysisDate", v)}
              disabled={isAddingTicker}
            />
          </div>

          <div className="cp-divider" />

          {/* Row 3 — Analyst Agents */}
          <div>
            <h3 className="cp-card-title">Analyst Agents</h3>
            <p className="cp-card-desc">
              Choose which AI analysts to activate.
            </p>
            <AnalystsField
              analysts={formData.analysts}
              availableAnalysts={config?.analysts || []}
              analystMap={analystMap}
              onChange={handleAnalystChange}
              disabled={isAddingTicker}
            />
          </div>

          <div className="cp-divider" />

          {/* Row 4 — Research Depth */}
          <div>
            <h3 className="cp-card-title">Research Depth</h3>
            <p className="cp-card-desc">How thorough should the analysis be.</p>
            <ResearchDepthField
              value={formData.researchDepth}
              depths={config?.depth || []}
              onChange={(v) => handleInputChange("researchDepth", v)}
              disabled={isAddingTicker}
            />
          </div>

          <div className="cp-divider" />

          {/* Row 5 — LLM Provider + Models */}
          <div>
            <h3 className="cp-card-title">AI Model Configuration</h3>
            <p className="cp-card-desc">
              Select the LLM provider and models for reasoning.
            </p>
            <div className="cp-model-grid">
              <LLMProviderField
                value={formData.llmProvider}
                providers={config?.provider || []}
                onChange={(v) =>
                  handleInputChange("llmProvider", v as LLMProvider)
                }
                disabled={isAddingTicker}
              />
              <ModelSelector
                shallowModel={formData.shallowModel}
                deepModel={formData.deepModel}
                shallowModels={config?.shallow[formData.llmProvider] || []}
                deepModels={config?.deep[formData.llmProvider] || []}
                onShallowChange={(v) => handleInputChange("shallowModel", v)}
                onDeepChange={(v) => handleInputChange("deepModel", v)}
                disabled={isAddingTicker}
              />
            </div>
          </div>

          <div className="cp-divider" />

          {/* Actions */}
          <ActionButtons
            isRunning={isRunning}
            isAddingTicker={isAddingTicker}
            isStarting={isStarting}
          />
        </div>
      </form>
    </section>
  );
};
