import axios from 'axios';
import { AnalysisRequest, ApiConfig, HealthCheckResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the stored auth token to every request
axiosInstance.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    const { state } = JSON.parse(stored) as { state: { token: string | null } };
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

// Normalise error responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Unknown error';
    return Promise.reject(new Error(message));
  },
);

export const api = {
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
