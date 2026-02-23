import { ConfigFormData } from '../../types';

interface AnalystsFieldProps {
  analysts: ConfigFormData['analysts'];
  availableAnalysts: string[];
  analystMap: Record<string, keyof ConfigFormData['analysts']>;
  onChange: (analyst: keyof ConfigFormData['analysts']) => void;
  disabled: boolean;
}

export const AnalystsField = ({ 
  analysts, 
  availableAnalysts, 
  analystMap, 
  onChange, 
  disabled 
}: AnalystsFieldProps) => {
  return (
    <div className="form-section">
      <label className="form-label">
        Select Analysis
      </label>
      <div className="checkbox-group">
        {availableAnalysts.map((analystName) => {
          const fieldKey = analystMap[analystName];
          if (!fieldKey) return null;
          const displayName = analystName.replace(/ Analyst$/, '');
          return (
            <label key={analystName} className="checkbox-label">
              <input
                type="checkbox"
                checked={analysts[fieldKey] || false}
                onChange={() => onChange(fieldKey)}
                disabled={disabled}
              />
              <span>{displayName}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
