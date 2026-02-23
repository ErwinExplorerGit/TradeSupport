import { ModelOption } from '../../types';

interface ShallowModelFieldProps {
  value: string;
  availableModels: ModelOption[];
  onChange: (value: string) => void;
  disabled: boolean;
}

export const ShallowModelField = ({ 
  value, 
  availableModels, 
  onChange, 
  disabled 
}: ShallowModelFieldProps) => {
  return (
    <div className="form-section">
      <label className="form-label">
        Shallow Thinker Model
      </label>
      <select
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {availableModels?.map((model) => (
          <option key={model.value} value={model.value}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
};
