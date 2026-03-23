interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const DateField = ({ value, onChange, disabled }: DateFieldProps) => {
  return (
    <div className="form-section">
      <label className="form-label">
        Analysis Date
      </label>
      <input
        type="date"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
      />
    </div>
  );
};
