import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage, AnalysisState } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws';
const RECONNECT_DELAY = 3000;

export interface UseWebSocketResult {
  isConnected: boolean;
  messages: string[];
  state: AnalysisState;
  clearMessages: () => void;
}

export const useWebSocket = (): UseWebSocketResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [state, setState] = useState<AnalysisState>('idle');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldConnectRef = useRef(true);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || !shouldConnectRef.current) {
      return;
    }

    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Clear any pending reconnect attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        if (data.type === 'ping') {
          // Server keepalive ping — ignore silently
        } else if (data.type === 'log') {
          const timestamp = new Date(data.ts).toLocaleTimeString();
          setMessages((prev) => [...prev, `[${timestamp}] ${data.message}`]);
        } else if (data.type === 'status') {
          setState(data.state);
        } else if (data.type === 'result') {
          console.log('Received result:', data.payload);
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

      // Attempt to reconnect if still mounted
      if (shouldConnectRef.current) {
        console.log(`Reconnecting in ${RECONNECT_DELAY}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY);
      }
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    shouldConnectRef.current = true;
    connect();

    // Cleanup on unmount
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

  return {
    isConnected,
    messages,
    state,
    clearMessages,
  };
};
