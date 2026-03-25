import { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { api } from "@/services/api";
import { TickerSuggestion } from "@/types";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = value[0] ?? null;

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
    if (!upper) return;
    onChange([upper]);
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const removeTicker = () => {
    onChange([]);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
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
    } else if (e.key === "Backspace" && !query && selected) {
      removeTicker();
    }
  };

  return (
    <div className="ticker-field">
      <div className="ticker-search-wrap">
        {/* Selected ticker chip inside the input row */}
        {selected ? (
          <span className="ticker-inline-chip">
            {selected}
            {!disabled && (
              <button
                type="button"
                className="ticker-inline-remove"
                onClick={removeTicker}
                aria-label={`Remove ${selected}`}
              >
                <FiX size={10} />
              </button>
            )}
          </span>
        ) : (
          <span className="ticker-search-icon">
            <FiSearch size={14} />
          </span>
        )}

        <input
          ref={inputRef}
          type="text"
          className={`form-input ticker-search-input${selected ? " ticker-search-input--has-chip" : ""}`}
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          onFocus={() => query && suggestions.length > 0 && setIsOpen(true)}
          placeholder={
            selected ? "Search to change ticker…" : "Search ticker, e.g. TSLA"
          }
          autoComplete="off"
          disabled={disabled}
        />
      </div>

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
