import { describe, it, expect, beforeEach } from 'vitest';
import { useAnalysisStore } from '@/stores/analysisStore';
import type { ApiConfig, AnalysisState } from '@/types';

const initialState = {
    config: null,
    isLoadingConfig: true,
    configError: null,
    analysisError: null,
    isStarting: false,
    analysisState: 'idle' as AnalysisState,
};

beforeEach(() => {
    useAnalysisStore.setState(initialState);
});

describe('analysisStore', () => {
    it('initialises with the correct default state', () => {
        expect(useAnalysisStore.getState()).toMatchObject(initialState);
    });

    describe('setConfig', () => {
        it('updates config', () => {
            const config = { llm_providers: [], shallow_models: {}, deep_models: {} } as unknown as ApiConfig;
            useAnalysisStore.getState().setConfig(config);
            expect(useAnalysisStore.getState().config).toBe(config);
        });
    });

    describe('setIsLoadingConfig', () => {
        it('updates isLoadingConfig to false', () => {
            useAnalysisStore.getState().setIsLoadingConfig(false);
            expect(useAnalysisStore.getState().isLoadingConfig).toBe(false);
        });

        it('updates isLoadingConfig back to true', () => {
            useAnalysisStore.setState({ isLoadingConfig: false });
            useAnalysisStore.getState().setIsLoadingConfig(true);
            expect(useAnalysisStore.getState().isLoadingConfig).toBe(true);
        });
    });

    describe('setConfigError', () => {
        it('updates configError with an error message', () => {
            useAnalysisStore.getState().setConfigError('Failed to load config');
            expect(useAnalysisStore.getState().configError).toBe('Failed to load config');
        });

        it('clears configError when set to null', () => {
            useAnalysisStore.setState({ configError: 'some error' });
            useAnalysisStore.getState().setConfigError(null);
            expect(useAnalysisStore.getState().configError).toBeNull();
        });
    });

    describe('setAnalysisError', () => {
        it('updates analysisError with an error message', () => {
            useAnalysisStore.getState().setAnalysisError('Analysis failed');
            expect(useAnalysisStore.getState().analysisError).toBe('Analysis failed');
        });

        it('clears analysisError when set to null', () => {
            useAnalysisStore.setState({ analysisError: 'some error' });
            useAnalysisStore.getState().setAnalysisError(null);
            expect(useAnalysisStore.getState().analysisError).toBeNull();
        });
    });

    describe('setIsStarting', () => {
        it('updates isStarting to true', () => {
            useAnalysisStore.getState().setIsStarting(true);
            expect(useAnalysisStore.getState().isStarting).toBe(true);
        });

        it('updates isStarting back to false', () => {
            useAnalysisStore.setState({ isStarting: true });
            useAnalysisStore.getState().setIsStarting(false);
            expect(useAnalysisStore.getState().isStarting).toBe(false);
        });
    });

    describe('setAnalysisState', () => {
        it('updates analysisState to running', () => {
            useAnalysisStore.getState().setAnalysisState('running');
            expect(useAnalysisStore.getState().analysisState).toBe('running');
        });

        it('updates analysisState to stopped', () => {
            useAnalysisStore.getState().setAnalysisState('stopped');
            expect(useAnalysisStore.getState().analysisState).toBe('stopped');
        });

        it('updates analysisState to error', () => {
            useAnalysisStore.getState().setAnalysisState('error');
            expect(useAnalysisStore.getState().analysisState).toBe('error');
        });
    });
});
