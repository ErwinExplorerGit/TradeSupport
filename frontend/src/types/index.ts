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
export type TickerStatus = 'pending' | 'running' | 'done' | 'error';

export interface TickerProgress {
  ticker: string;
  percentage: number;
  step: string;
  status: TickerStatus;
  decision?: string | null;
  analysis_date?: string;
}

export interface AnalysisRequest {
  tickers: string[];
  analysis_date: string;
  analysts: AnalystConfig;
  research_depth: number;
  llm_provider: LLMProvider;
  shallow_model: string;
  deep_model: string;
}

export interface LogMessage {
  type: 'log';
  ticker: string;
  message: string;
  ts: string;
}

export interface StatusMessage {
  type: 'status';
  state: AnalysisState;
}

export interface ProgressMessage {
  type: 'progress';
  ticker: string;
  analysis_date?: string;
  percentage: number;
  step: string;
  status: TickerStatus;
}

export interface ResultMessage {
  type: 'result';
  ticker: string;
  analysis_date?: string;
  decision: string;
}

export interface BatchStatusMessage {
  type: 'batch_status';
  tickers: TickerProgress[];
}

export interface PingMessage {
  type: 'ping';
}

export type WebSocketMessage =
  | LogMessage
  | StatusMessage
  | ProgressMessage
  | ResultMessage
  | BatchStatusMessage
  | PingMessage;

export interface ConfigFormData {
  tickers: string[];
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
  analysts: string[];
  depth: DepthOption[];
  provider: ProviderOption[];
  shallow: Record<string, ModelOption[]>;
  deep: Record<string, ModelOption[]>;
}

export interface TickerSuggestion {
  name: string;
  symbol: string;
}

export interface HealthCheckResponse {
  status: string;
  state: string;
  trading_mode: string;
  active_connections: number;
}

export interface HistoryRecord {
  id: string;
  ticker: string;
  company_name: string;
  result: string | null;
  scanned_at: string;
  agent?: string | null;
  analysis_date?: string | null;
}

export interface HistoryResponse {
  items: HistoryRecord[];
  total: number;
  page: number;
  page_size: number;
}

