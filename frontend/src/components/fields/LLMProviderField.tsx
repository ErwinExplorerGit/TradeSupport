import { LLMProvider, ProviderOption } from '../../types';

interface LLMProviderFieldProps {
  value: LLMProvider;
  availableProviders: ProviderOption[];
  onChange: (value: LLMProvider) => void;
  disabled: boolean;
}

export const LLMProviderField = ({ 
  value, 
  availableProviders, 
  onChange, 
  disabled 
}: LLMProviderFieldProps) => {
  return (
    <div className="form-section">
      <label className="form-label">
        LLM Provider
      </label>
      <select
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value as LLMProvider)}
        disabled={disabled}
      >
        {availableProviders.map((provider) => (
          <option key={provider.value} value={provider.value}>
            {provider.name}
          </option>
        ))}
      </select>
    </div>
  );
};
