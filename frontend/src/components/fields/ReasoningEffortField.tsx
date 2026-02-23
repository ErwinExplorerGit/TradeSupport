import { ReasoningEffort } from '../../types';

interface ReasoningEffortFieldProps {
  value: ReasoningEffort;
  onChange: (value: ReasoningEffort) => void;
  disabled: boolean;
}

export const ReasoningEffortField = ({ value, onChange, disabled }: ReasoningEffortFieldProps) => {
  return (
    <div className="form-section">
      <label className="form-label">
        Reasoning Effort
      </label>
      <select
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value as ReasoningEffort)}
        disabled={disabled}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <small className="form-help">Only use with o1-preview or o1-mini models</small>
    </div>
  );
};
