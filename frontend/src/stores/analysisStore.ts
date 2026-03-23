import { create } from 'zustand';
import { ApiConfig, AnalysisState } from '../types';

interface AnalysisStore {
    config: ApiConfig | null;
    isLoadingConfig: boolean;
    configError: string | null;
    analysisError: string | null;
    isStarting: boolean;
    analysisState: AnalysisState;
    setConfig: (config: ApiConfig) => void;
    setIsLoadingConfig: (loading: boolean) => void;
    setConfigError: (error: string | null) => void;
    setAnalysisError: (error: string | null) => void;
    setIsStarting: (starting: boolean) => void;
    setAnalysisState: (state: AnalysisState) => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
    config: null,
    isLoadingConfig: true,
    configError: null,
    analysisError: null,
    isStarting: false,
    analysisState: 'idle',
    setConfig: (config) => set({ config }),
    setIsLoadingConfig: (isLoadingConfig) => set({ isLoadingConfig }),
    setConfigError: (configError) => set({ configError }),
    setAnalysisError: (analysisError) => set({ analysisError }),
    setIsStarting: (isStarting) => set({ isStarting }),
    setAnalysisState: (analysisState) => set({ analysisState }),
}));
