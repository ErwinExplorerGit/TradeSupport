import { useState, useEffect } from 'react';
import { ConfigFormData, AnalysisState, ApiConfig, ResearchDepth } from '../types';
import { 
  TickerField, 
  DateField, 
  AnalystsField, 
  ResearchDepthField, 
  LLMProviderField, 
  ShallowModelField, 
  DeepModelField
} from './fields';

interface ConfigPanelProps {
  onStartAnalysis: (config: ConfigFormData) => void;
  onStopAnalysis: () => void;
  analysisState: AnalysisState;
  config: ApiConfig | null;
}

export const ConfigPanel = ({ onStartAnalysis, onStopAnalysis, analysisState, config }: ConfigPanelProps) => {
  const today = new Date().toISOString().split('T')[0];

  // Map analyst display names to form field keys
  const analystMap: Record<string, keyof ConfigFormData['analysts']> = {
    'Market Analyst': 'market',
    'Social Media Analyst': 'social',
    'News Analyst': 'news',
    'Fundamentals Analyst': 'fundamentals',
    'Momentum Analyst': 'momentum',
  };

  // Map depth to research depth values
  const depthMap: Record<number, ResearchDepth> = {
    1: 'quick',
    3: 'standard',
    5: 'deep',
  };

  const [formData, setFormData] = useState<ConfigFormData>({
    ticker: 'TSLA',
    analysisDate: today,
    analysts: {
      market: true,
      social: true,
      news: false,
      fundamentals: false,
      momentum: false,
    },
    researchDepth: 'quick',
    llmProvider: 'openai',
    shallowModel: 'gpt-4o-mini',
    deepModel: 'gpt-4o-mini',
  });

  // Initialize models when config loads
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
      
      // When provider changes, reset models to first option
      if (field === 'llmProvider' && config) {
        const newProvider = value as string;
        const shallowModels = config.shallow[newProvider];
        const deepModels = config.deep[newProvider];
        
        if (shallowModels?.[0]) {
          updated.shallowModel = shallowModels[0].value;
        }
        if (deepModels?.[0]) {
          updated.deepModel = deepModels[0].value;
        }
      }
      
      return updated;
    });
  };

  const handleAnalystChange = (analyst: keyof ConfigFormData['analysts']) => {
    setFormData((prev) => ({
      ...prev,
      analysts: {
        ...prev.analysts,
        [analyst]: !prev.analysts[analyst],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartAnalysis(formData);
  };

  const isRunning = analysisState === 'running';

  return (
    <div className="config-panel">
      <h2>Configuration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <TickerField
            value={formData.ticker}
            onChange={(value) => handleInputChange('ticker', value)}
            disabled={isRunning}
          />

          <DateField
            value={formData.analysisDate}
            onChange={(value) => handleInputChange('analysisDate', value)}
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
            availableDepths={config?.depth || []}
            depthMap={depthMap}
            onChange={(value) => handleInputChange('researchDepth', value)}
            disabled={isRunning}
          />

          <LLMProviderField
            value={formData.llmProvider}
            availableProviders={config?.provider || []}
            onChange={(value) => handleInputChange('llmProvider', value)}
            disabled={isRunning}
          />

          <ShallowModelField
            value={formData.shallowModel}
            availableModels={config?.shallow[formData.llmProvider] || []}
            onChange={(value) => handleInputChange('shallowModel', value)}
            disabled={isRunning}
          />

          <DeepModelField
            value={formData.deepModel}
            availableModels={config?.deep[formData.llmProvider] || []}
            onChange={(value) => handleInputChange('deepModel', value)}
            disabled={isRunning}
          />

        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isRunning}
          >
            Start Analysis
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onStopAnalysis}
            disabled={!isRunning}
          >
            Stop
          </button>
        </div>
      </form>
    </div>
  );
};
