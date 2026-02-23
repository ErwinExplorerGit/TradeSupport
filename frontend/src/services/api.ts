import { AnalysisRequest, ApiConfig, HealthCheckResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const api = {
  /**
   * Start a new analysis
   */
  async startAnalysis(request: AnalysisRequest): Promise<void> {
    console.log(request);

    const response = await fetch(`${API_BASE_URL}/api/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });


    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to start analysis');
    }

    return response.json();
  },

  /**
   * Stop the current analysis
   */
  async stopAnalysis(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/stop`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to stop analysis');
    }

    return response.json();
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
  },

  /**
   * Get configuration options
   */
  async getConfig(): Promise<ApiConfig> {
    const response = await fetch(`${API_BASE_URL}/api/config`);

    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }

    return response.json();
  },
};
