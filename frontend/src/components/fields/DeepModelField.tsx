import { ModelOption } from '../../types';

interface DeepModelFieldProps {
  value: string;
  availableModels: ModelOption[];
  onChange: (value: string) => void;
  disabled: boolean;
}

export const DeepModelField = ({ 
  value, 
  availableModels, 
  onChange, 
  disabled 
}: DeepModelFieldProps) => {
  return (
    <div className="form-section">
      <label className="form-label">
        Deep Thinker Model
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
