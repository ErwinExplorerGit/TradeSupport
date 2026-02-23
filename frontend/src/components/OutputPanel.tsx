import { useEffect, useRef } from 'react';

interface OutputPanelProps {
  isConnected: boolean;
  messages: string[];
}

// Parse inline **bold** segments
const parseInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
};

const renderLine = (line: string, index: number) => {
  // ===...=== or ---...--- divider lines
  if (/^[=]{4,}$/.test(line.trim())) {
    return <div key={index} className="terminal-divider" />;
  }
  // ___...___  or ---...--- horizontal rule (e.g. under "Final Decision:")
  if (/^[_\-]{4,}$/.test(line.trim())) {
    return <div key={index} className="terminal-rule" />;
  }
  // Empty line → paragraph spacer
  if (line.trim() === '') {
    return <div key={index} className="terminal-spacer" />;
  }
  // ALL CAPS short header line (e.g. "FINAL TRADING DECISION")
  if (/^[A-Z][A-Z\s:&,()-]{3,}$/.test(line.trim()) && !line.includes('**')) {
    return <div key={index} className="terminal-heading">{line.trim()}</div>;
  }
  return (
    <div key={index} className="terminal-line">
      {parseInline(line)}
    </div>
  );
};

export const OutputPanel = ({ isConnected, messages }: OutputPanelProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="output-panel">
      <div className="output-title">Final Trading Support</div>

      <div className="terminal-wrapper">
        <div className="terminal" ref={terminalRef}>
          {messages.length === 0 ? (
            <div className="terminal-placeholder">
              {isConnected ? 'Connected. Waiting for analysis to start...' : 'Waiting to connect...'}
            </div>
          ) : (
            messages.map((message, index) => renderLine(message, index))
          )}
        </div>
      </div>

      <div className={`status-bar ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-indicator" />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
};


