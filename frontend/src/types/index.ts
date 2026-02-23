export interface AnalystConfig {
  market: boolean;
  social: boolean;
  news: boolean;
  fundamentals: boolean;
  momentum: boolean;
}

export type ResearchDepth = 'quick' | 'standard' | 'deep';
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'ollama';
export type AnalysisState = 'idle' | 'running' | 'stopped' | 'error';

export interface AnalysisRequest {
  ticker: string;
  analysis_date: string;
  analysts: AnalystConfig;
  research_depth: number;
  llm_provider: LLMProvider;
  shallow_model: string;
  deep_model: string;
}

export interface LogMessage {
  type: 'log';
  message: string;
  ts: string;
}

export interface StatusMessage {
  type: 'status';
  state: AnalysisState;
}

export interface ResultMessage {
  type: 'result';
  payload: any;
}

export interface PingMessage {
  type: 'ping';
}

export type WebSocketMessage = LogMessage | StatusMessage | ResultMessage | PingMessage;

export interface ConfigFormData {
  ticker: string;
  analysisDate: string;
  analysts: AnalystConfig;
  researchDepth: ResearchDepth;
  llmProvider: LLMProvider;
  shallowModel: string;
  deepModel: string;
}

export interface ModelOption {
  name: string;
  value: string;
}

export interface ProviderOption {
  name: string;
  value: string;
}

export interface DepthOption {
  name: string;
  value: number;
}

export interface ApiConfig {
  tickers: Array<{ name: string; symbol: string }>;
  analysts: string[];
  depth: DepthOption[];
  provider: ProviderOption[];
  shallow: Record<string, ModelOption[]>;
  deep: Record<string, ModelOption[]>;
}

export interface HealthCheckResponse {
  status: string;
  state: string;
  trading_mode: string;
  active_connections: number;
}
