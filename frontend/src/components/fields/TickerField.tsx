interface TickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const TickerField = ({ value, onChange, disabled }: TickerFieldProps) => {
  return (
    <div className="form-section">
      <label className="form-label">
        Ticker Symbol
      </label>
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="TSLA"
        required
        disabled={disabled}
      />
    </div>
  );
};
