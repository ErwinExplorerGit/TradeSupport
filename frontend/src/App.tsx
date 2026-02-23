import { useState, useEffect } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { OutputPanel } from './components/OutputPanel';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/api';
import { ConfigFormData, ApiConfig, ResearchDepth } from './types';
import './styles/App.css';

function App() {
  const { isConnected, messages, state, clearMessages } = useWebSocket();
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.getConfig();
        setConfig(data);
      } catch (err) {
        console.error('Failed to fetch config:', err);
        setError('Failed to load configuration');
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  const handleStartAnalysis = async (config: ConfigFormData) => {
    try {
      setError(null);
      setIsStarting(true);
      clearMessages();

      // Map research depth to integer values
      const depthToValue: Record<ResearchDepth, number> = {
        quick: 1,
        standard: 3,
        deep: 5,
      };

      const request = {
        ticker: config.ticker,
        analysis_date: config.analysisDate,
        analysts: config.analysts,
        research_depth: depthToValue[config.researchDepth],
        llm_provider: config.llmProvider,
        shallow_model: config.shallowModel,
        deep_model: config.deepModel,
      };

      await api.startAnalysis(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start analysis';
      setError(message);
      console.error('Failed to start analysis:', err);
      setIsStarting(false);
    }
  };

  const handleStopAnalysis = async () => {
    try {
      setError(null);
      await api.stopAnalysis();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop analysis';
      setError(message);
      console.error('Failed to stop analysis:', err);
    }
  };

  // Clear isStarting flag when state updates to running or idle
  useEffect(() => {
    if (state === 'running' || state === 'idle' || state === 'stopped' || state === 'error') {
      setIsStarting(false);
    }
  }, [state]);

  // Compute effective analysis state
  const effectiveState = isStarting ? 'running' : state;

  return (
    <div className="app">
      <header className="app-header">
        <div className="nav-brand">
          <span className="nav-title">TradeSupport</span>
          <span className="nav-subtitle">Powered by AI</span>
        </div>
        {/* <nav className="nav-links">
          <a href="#about" className="nav-link">About</a>
          <a href="#compare" className="nav-link">Compare</a>
          <a href="#evaluate" className="nav-link">Evaluate</a>
        </nav> */}
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button className="error-close" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      {isLoadingConfig ? (
        <div className="loading-container">
          <div className="loading-spinner">Loading configuration...</div>
        </div>
      ) : (
        <div className="app-content">
          <div className="panel-container">
            <ConfigPanel
              onStartAnalysis={handleStartAnalysis}
              onStopAnalysis={handleStopAnalysis}
              analysisState={effectiveState}
              config={config}
            />
          </div>

          <div className="panel-container">
            <OutputPanel isConnected={isConnected} messages={messages} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
