import { AnalysisRequest, ApiConfig, HealthCheckResponse, HistoryResponse, TickerSuggestion } from '@/types';
import { axiosInstance } from '@/axios';
import { authService } from './auth';

export const api = {
  ...authService,
  /**
   * Start a new batch analysis (one or more tickers)
   */
  async startAnalysis(request: AnalysisRequest): Promise<void> {
    const { data } = await axiosInstance.post('/api/trading/start', request);
    return data;
  },

  /**
   * Stop the current analysis
   */
  async stopAnalysis(): Promise<void> {
    const { data } = await axiosInstance.post('/api/trading/stop');
    return data;
  },

  /**
   * Add a ticker to the current (or new) analysis session without resetting existing results
   */
  async addTicker(request: AnalysisRequest): Promise<void> {
    // The backend expects a single-ticker AnalysisRequest at /add-ticker
    const singleRequest = { ...request, ticker: request.tickers[0] };
    const { data } = await axiosInstance.post('/api/trading/add-ticker', singleRequest);
    return data;
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const { data } = await axiosInstance.get<HealthCheckResponse>('/api/health');
    return data;
  },

  /**
   * Get configuration options
   */
  async getConfig(): Promise<ApiConfig> {
    const { data } = await axiosInstance.get<ApiConfig>('/api/trading/config');
    return data;
  },

  /**
   * Search tickers from the database
   */
  async searchTickers(q: string): Promise<TickerSuggestion[]> {
    const { data } = await axiosInstance.get<TickerSuggestion[]>('/api/trading/tickers/search', {
      params: { q },
    });
    return data;
  },

  /**
   * Get current analysis status for the authenticated user
   */
  async getAnalysisStatus(): Promise<{ state: string; is_running: boolean; tickers: any[] }> {
    const { data } = await axiosInstance.get('/api/trading/status');
    return data;
  },

  /**
   * Get paginated scan history for the authenticated user
   */
  async getHistory(params?: { q?: string; page?: number; page_size?: number }): Promise<HistoryResponse> {
    const { data } = await axiosInstance.get<HistoryResponse>('/api/history', { params });
    return data;
  },
};

