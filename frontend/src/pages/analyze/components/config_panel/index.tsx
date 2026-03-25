import { useState, useEffect } from "react";
import {
  ConfigFormData,
  AnalysisState,
  ApiConfig,
  LLMProvider,
} from "../../../../types";
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
  onStopAnalysis: () => void;
  analysisState: AnalysisState;
  config: ApiConfig | null;
}

export const ConfigPanel = ({
  onStartAnalysis,
  onStopAnalysis,
  analysisState,
  config,
}: ConfigPanelProps) => {
  const today = new Date().toISOString().split("T")[0];

  const analystMap: Record<string, keyof ConfigFormData["analysts"]> = {
    "Market Analyst": "market",
    "Social Media Analyst": "social",
    "News Analyst": "news",
    "Fundamentals Analyst": "fundamentals",
    "Momentum Analyst": "momentum",
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tickers.length === 0) return;
    onStartAnalysis(formData);
  };

  const isRunning = analysisState === "running";

  return (
    <div className="config-panel">
      <h2>Configuration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <TickerField
            value={formData.tickers}
            onChange={(v) => handleInputChange("tickers", v)}
            disabled={isRunning}
          />
          <DateField
            value={formData.analysisDate}
            onChange={(v) => handleInputChange("analysisDate", v)}
            disabled={isRunning}
          />
          <AnalystsField
            analysts={formData.analysts}
            availableAnalysts={config?.analysts || []}
            analystMap={analystMap}
            onChange={handleAnalystChange}
            disabled={isRunning}
          />
          <ResearchDepthField
            value={formData.researchDepth}
            depths={config?.depth || []}
            onChange={(v) => handleInputChange("researchDepth", v)}
            disabled={isRunning}
          />
          <LLMProviderField
            value={formData.llmProvider}
            providers={config?.provider || []}
            onChange={(v) => handleInputChange("llmProvider", v as LLMProvider)}
            disabled={isRunning}
          />
          <ModelSelector
            shallowModel={formData.shallowModel}
            deepModel={formData.deepModel}
            shallowModels={config?.shallow[formData.llmProvider] || []}
            deepModels={config?.deep[formData.llmProvider] || []}
            onShallowChange={(v) => handleInputChange("shallowModel", v)}
            onDeepChange={(v) => handleInputChange("deepModel", v)}
            disabled={isRunning}
          />
        </div>
        <ActionButtons isRunning={isRunning} onStop={onStopAnalysis} />
      </form>
    </div>
  );
};
