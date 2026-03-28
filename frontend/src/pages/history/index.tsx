import { useEffect, useState, useCallback, useRef } from "react";
import {
  FiRefreshCw,
  FiSearch,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiFileText,
} from "react-icons/fi";
import { api } from "@/services/api";
import { HistoryRecord, TickerSuggestion } from "@/types";
import "./styles.scss";

const PAGE_SIZE = 6;

const SIGNAL_RE = /\b(BUY|SELL|HOLD)\b/i;

function extractSignal(result: string | null): string | null {
  if (!result) return null;
  const m = result.match(SIGNAL_RE);
  return m ? m[1].toUpperCase() : null;
}

function DecisionBadge({ result }: { result: string | null }) {
  const signal = extractSignal(result);
  if (signal === "BUY")
    return (
      <span className="history-badge history-badge--buy">
        <FiTrendingUp /> BUY
      </span>
    );
  if (signal === "SELL")
    return (
      <span className="history-badge history-badge--sell">
        <FiTrendingDown /> SELL
      </span>
    );
  if (signal === "HOLD")
    return (
      <span className="history-badge history-badge--hold">
        <FiMinus /> HOLD
      </span>
    );
  return <span className="history-badge history-badge--unknown">—</span>;
}

function formatDateOnly(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return dateStr.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function DetailModal({
  record,
  onClose,
}: {
  record: HistoryRecord;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="history-modal-backdrop" onMouseDown={onClose}>
      <div
        className="history-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="history-modal-header">
          <div className="history-modal-title-group">
            <span className="history-ticker">{record.ticker}</span>
            <span className="history-modal-company">{record.company_name}</span>
          </div>
          <button className="history-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="history-modal-meta">
          <DecisionBadge result={record.result} />
          {record.analysis_date && (
            <span className="history-modal-date">
              <FiClock /> {formatDateOnly(record.analysis_date)}
              {isToday(record.analysis_date) && (
                <span className="history-today-badge">Today</span>
              )}
            </span>
          )}
          {record.agent && (
            <span className="history-modal-agent">{record.agent}</span>
          )}
        </div>

        <div className="history-modal-body">
          <h4 className="history-modal-section">Full Decision</h4>
          <pre className="history-modal-result">
            {record.result ?? "No decision recorded."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // The committed filter that drives the actual history fetch
  const [activeFilter, setActiveFilter] = useState("");
  // The raw text in the input box
  const [inputValue, setInputValue] = useState("");

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<TickerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(
    null,
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Fetch history ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async (pg: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; page_size: number; q?: string } = {
        page: pg,
        page_size: PAGE_SIZE,
      };
      if (q) params.q = q;
      const response = await api.getHistory(params);
      setRecords(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page, activeFilter);
  }, [page, activeFilter, fetchHistory]);

  // ── Autocomplete fetch (debounced) ─────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await api.searchTickers(inputValue.trim());
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setHighlightIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Commit a filter value ──────────────────────────────────────────────────
  const commitFilter = (value: string) => {
    setShowSuggestions(false);
    setSuggestions([]);
    const trimmed = value.trim();
    setInputValue(trimmed);
    if (trimmed !== activeFilter) {
      setActiveFilter(trimmed);
      setPage(1);
    }
  };

  const handleSelectSuggestion = (s: TickerSuggestion) => {
    commitFilter(s.symbol);
  };

  const handleSearch = () => commitFilter(inputValue);

  const handleClear = () => {
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    if (activeFilter !== "") {
      setActiveFilter("");
      setPage(1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        handleSelectSuggestion(suggestions[highlightIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="history-page">
      {selectedRecord && (
        <DetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
      <div className="history-container">
        {/* Header */}
        <div className="history-header">
          <div className="history-header-left">
            <FiClock className="history-header-icon" />
            <div>
              <h1 className="history-title">Analysis History</h1>
              <p className="history-subtitle">
                {total > 0
                  ? `${total} scan${total !== 1 ? "s" : ""} on record`
                  : "No scans yet"}
              </p>
            </div>
          </div>
          <button
            className="history-refresh-btn"
            onClick={() => fetchHistory(page, activeFilter)}
            disabled={loading}
            title="Refresh"
          >
            <FiRefreshCw className={loading ? "spin" : ""} />
          </button>
        </div>

        {/* Filter */}
        <div className="history-filter">
          <div className="history-autocomplete-wrapper" ref={wrapperRef}>
            <div className="history-search-wrapper">
              <FiSearch className="history-search-icon" />
              <input
                type="text"
                className="history-search-input"
                placeholder="Search by ticker or company name…"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              {inputValue && (
                <button
                  className="history-input-clear"
                  onClick={handleClear}
                  tabIndex={-1}
                >
                  <FiX />
                </button>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="history-suggestions">
                {suggestions.map((s, i) => (
                  <li
                    key={s.symbol}
                    className={`history-suggestion-item${i === highlightIndex ? " history-suggestion-item--active" : ""}`}
                    onMouseDown={() => handleSelectSuggestion(s)}
                    onMouseEnter={() => setHighlightIndex(i)}
                  >
                    <span className="history-suggestion-ticker">
                      {s.symbol}
                    </span>
                    <span className="history-suggestion-name">{s.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button className="history-search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        {activeFilter && (
          <div className="history-active-filter">
            Showing results for <strong>{activeFilter}</strong>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="history-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="history-loading">
            <div className="history-spinner" />
            <span>Loading history…</span>
          </div>
        ) : records.length === 0 ? (
          <div className="history-empty">
            <FiClock size={40} />
            <p>
              No analysis history found
              {activeFilter ? ` for "${activeFilter}"` : ""}.
            </p>
            <p className="history-empty-hint">
              Run an analysis to see results here.
            </p>
          </div>
        ) : (
          <>
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Company</th>
                    <th>Decision</th>
                    <th>Agent</th>
                    <th>Analysis Date</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className="history-table-row"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <td>
                        <span className="history-ticker">{record.ticker}</span>
                      </td>
                      <td className="history-company">{record.company_name}</td>
                      <td>
                        <DecisionBadge result={record.result} />
                      </td>
                      <td className="history-agent">{record.agent ?? "—"}</td>
                      <td className="history-date">
                        {record.analysis_date ? (
                          <span className="history-analysis-date">
                            {formatDateOnly(record.analysis_date)}
                            {isToday(record.analysis_date) && (
                              <span className="history-today-badge">Today</span>
                            )}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <button
                          className="history-view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(record);
                          }}
                          title="View full decision"
                        >
                          <FiFileText /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="history-pagination">
              <button
                className="history-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <FiChevronLeft />
              </button>
              <span className="history-page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="history-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
