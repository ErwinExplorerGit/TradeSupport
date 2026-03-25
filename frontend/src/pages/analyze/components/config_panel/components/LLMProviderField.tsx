import { Dropdown } from "@/components";
import { LLMProvider, ProviderOption } from "@/types";

interface LLMProviderFieldProps {
  value: LLMProvider;
  providers: ProviderOption[];
  onChange: (value: LLMProvider) => void;
  disabled: boolean;
}

export const LLMProviderField = ({
  value,
  providers,
  onChange,
  disabled,
}: LLMProviderFieldProps) => (
  <Dropdown
    label="Provider"
    value={value}
    options={providers.map((p) => ({ label: p.name, value: p.value }))}
    onChange={(v) => onChange(v as LLMProvider)}
    disabled={disabled}
  />
);
