import { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiX, FiPlus } from "react-icons/fi";
import { api } from "../../../../../services/api";
import { TickerSuggestion } from "../../../../../types";

const MAX_TICKERS = 5;

interface TickerFieldProps {
  value: string[];
  onChange: (tickers: string[]) => void;
  disabled: boolean;
}

export const TickerField = ({
  value,
  onChange,
  disabled,
}: TickerFieldProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TickerSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      setLoading(true);
      try {
        const results = await api.searchTickers(q);
        // Filter out already-selected tickers
        const filtered = results.filter(
          (r) => !value.includes(r.symbol.toUpperCase()),
        );
        setSuggestions(filtered.slice(0, 8));
        setIsOpen(filtered.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [value],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTicker = (symbol: string) => {
    const upper = symbol.toUpperCase().trim();
    if (!upper || value.includes(upper) || value.length >= MAX_TICKERS) return;
    onChange([...value, upper]);
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeTicker = (ticker: string) => {
    onChange(value.filter((t) => t !== ticker));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        addTicker(suggestions[activeIndex].symbol);
      } else if (query.trim()) {
        addTicker(query.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const canAdd = value.length < MAX_TICKERS && !disabled;

  return (
    <div className="form-section ticker-field">
      <label className="form-label">Ticker Symbols</label>

      {/* Selected tickers as tags */}
      {value.length > 0 && (
        <div className="ticker-tags">
          {value.map((t) => (
            <span key={t} className="ticker-tag">
              {t}
              {!disabled && (
                <button
                  type="button"
                  className="ticker-tag-remove"
                  onClick={() => removeTicker(t)}
                  aria-label={`Remove ${t}`}
                >
                  <FiX size={11} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      {canAdd && (
        <div className="ticker-search-wrap">
          <span className="ticker-search-icon">
            <FiSearch size={14} />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="form-input ticker-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setSuggestions.length && setIsOpen(true)}
            placeholder={
              value.length === 0 ? "Search ticker, e.g. TSLA" : "Add another…"
            }
            disabled={disabled}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="ticker-add-btn"
              onClick={() => addTicker(query)}
              title={`Add ${query}`}
            >
              <FiPlus size={14} />
            </button>
          )}
        </div>
      )}

      {!canAdd && !disabled && (
        <p className="form-help">Maximum {MAX_TICKERS} tickers selected.</p>
      )}

      {/* Suggestions dropdown */}
      {isOpen && (
        <div className="ticker-dropdown" ref={dropdownRef}>
          {loading && <div className="ticker-dropdown-loading">Searching…</div>}
          {!loading &&
            suggestions.map((s, i) => (
              <button
                key={s.symbol}
                type="button"
                className={`ticker-dropdown-item ${i === activeIndex ? "active" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTicker(s.symbol);
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="ticker-dropdown-symbol">{s.symbol}</span>
                <span className="ticker-dropdown-name">{s.name}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
