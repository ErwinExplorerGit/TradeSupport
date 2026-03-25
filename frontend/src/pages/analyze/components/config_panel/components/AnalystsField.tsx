import { ConfigFormData } from "@/types";

interface AnalystsFieldProps {
  analysts: ConfigFormData["analysts"];
  availableAnalysts: string[];
  analystMap: Record<string, keyof ConfigFormData["analysts"]>;
  onChange: (analyst: keyof ConfigFormData["analysts"]) => void;
  disabled: boolean;
}

export const AnalystsField = ({
  analysts,
  availableAnalysts,
  analystMap,
  onChange,
  disabled,
}: AnalystsFieldProps) => {
  return (
    <div className="cp-analysts">
      {availableAnalysts.map((analystName) => {
        const fieldKey = analystMap[analystName];
        if (!fieldKey) return null;
        const displayName = analystName.replace(/ Analyst$/, "");
        const isChecked = analysts[fieldKey] || false;
        return (
          <button
            key={analystName}
            type="button"
            className={`cp-analyst-pill${isChecked ? " cp-analyst-pill--on" : ""}`}
            onClick={() => !disabled && onChange(fieldKey)}
            disabled={disabled}
            aria-pressed={isChecked}
          >
            {displayName}
          </button>
        );
      })}
    </div>
  );
};
