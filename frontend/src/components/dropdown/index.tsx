import "./styles.scss";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const Dropdown = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder,
  className = "",
}: DropdownProps) => {
  return (
    <div className={`dropdown-section ${className}`.trim()}>
      {label && <label className="dropdown-label">{label}</label>}
      <select
        className="dropdown-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
