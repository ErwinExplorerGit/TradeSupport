import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage, AnalysisState, TickerProgress } from '@/types';
import { useAuthStore } from '@/stores/authStore';

const WS_BASE = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws';
const RECONNECT_DELAY = 3000;

export interface UseWebSocketResult {
  isConnected: boolean;
  messages: Array<{ ticker: string; text: string }>;
  state: AnalysisState;
  tickerProgress: Record<string, TickerProgress>;
  clearMessages: () => void;
  clearProgress: () => void;
  initProgress: (entries: TickerProgress[]) => void;
}

export const useWebSocket = (): UseWebSocketResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<{ ticker: string; text: string }>>([]);
  const [state, setState] = useState<AnalysisState>('idle');
  const [tickerProgress, setTickerProgress] = useState<Record<string, TickerProgress>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldConnectRef = useRef(true);

  const updateProgress = useCallback((key: string, update: Partial<TickerProgress>) => {
    setTickerProgress((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { ticker: update.ticker ?? key, percentage: 0, step: '', status: 'pending' }), ...update },
    }));
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || !shouldConnectRef.current) {
      return;
    }

    // Attach auth token so the server can identify the user
    const token = useAuthStore.getState().token;
    const url = token ? `${WS_BASE}?token=${encodeURIComponent(token)}` : WS_BASE;

    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        if (data.type === 'ping') {
          // Server keepalive — ignore
        } else if (data.type === 'log') {
          const timestamp = new Date(data.ts).toLocaleTimeString();
          setMessages((prev) => [
            ...prev,
            { ticker: data.ticker ?? '', text: `[${timestamp}] ${data.message}` },
          ]);
        } else if (data.type === 'status') {
          setState(data.state);
        } else if (data.type === 'progress') {
          const key = data.analysis_date ? `${data.ticker}:${data.analysis_date}` : data.ticker;
          updateProgress(key, {
            ticker: data.ticker,
            analysis_date: data.analysis_date,
            percentage: data.percentage,
            step: data.step,
            status: data.status,
          });
        } else if (data.type === 'result') {
          const key = data.analysis_date ? `${data.ticker}:${data.analysis_date}` : data.ticker;
          updateProgress(key, { decision: data.decision, status: 'done', percentage: 100 });
        } else if (data.type === 'batch_status') {
          // Snapshot sent on reconnect — only restore tickers that are still active
          setTickerProgress((prev) => {
            const next = { ...prev };
            for (const tp of data.tickers) {
              if (tp.status === 'running' || tp.status === 'pending') {
                const key = tp.analysis_date ? `${tp.ticker}:${tp.analysis_date}` : tp.ticker;
                next[key] = { ...prev[key], ...tp };
              }
            }
            return next;
          });
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      wsRef.current = null;

      if (shouldConnectRef.current) {
        console.log(`Reconnecting in ${RECONNECT_DELAY}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY);
      }
    };

    wsRef.current = ws;
  }, [updateProgress]);

  useEffect(() => {
    shouldConnectRef.current = true;
    connect();

    return () => {
      shouldConnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearProgress = useCallback(() => {
    setMessages([]);
    setTickerProgress({});
  }, []);

  // Seed completed tickers (e.g. today's history) without overwriting live entries
  const initProgress = useCallback((entries: TickerProgress[]) => {
    setTickerProgress((prev) => {
      const next = { ...prev };
      for (const entry of entries) {
        const key = entry.analysis_date ? `${entry.ticker}:${entry.analysis_date}` : entry.ticker;
        if (!next[key]) {
          next[key] = entry;
        }
      }
      return next;
    });
  }, []);

  return { isConnected, messages, state, tickerProgress, clearMessages, clearProgress, initProgress };
};

