import { Dropdown } from "../../../../../components";
import { ModelOption } from "../../../../../types";

interface ModelSelectorProps {
  shallowModel: string;
  deepModel: string;
  shallowModels: ModelOption[];
  deepModels: ModelOption[];
  onShallowChange: (value: string) => void;
  onDeepChange: (value: string) => void;
  disabled: boolean;
}

export const ModelSelector = ({
  shallowModel,
  deepModel,
  shallowModels,
  deepModels,
  onShallowChange,
  onDeepChange,
  disabled,
}: ModelSelectorProps) => (
  <>
    <Dropdown
      label="Shallow Thinker Model"
      value={shallowModel}
      options={shallowModels.map((m) => ({ label: m.name, value: m.value }))}
      onChange={onShallowChange}
      disabled={disabled}
    />
    <Dropdown
      label="Deep Thinker Model"
      value={deepModel}
      options={deepModels.map((m) => ({ label: m.name, value: m.value }))}
      onChange={onDeepChange}
      disabled={disabled}
    />
  </>
);
