import { AnalysisRequest, ApiConfig, HealthCheckResponse } from '../types';
import { axiosInstance } from '../axios';
import { authService } from './auth';

export const api = {
  ...authService,
  /**
   * Start a new analysis
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
};
