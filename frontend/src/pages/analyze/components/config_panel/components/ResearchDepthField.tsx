import { Dropdown } from "../../../../../components";
import { ResearchDepth, DepthOption } from "../../../../../types";

const depthMap: Record<number, ResearchDepth> = {
  1: "quick",
  3: "standard",
  5: "deep",
};

interface ResearchDepthFieldProps {
  value: ResearchDepth;
  depths: DepthOption[];
  onChange: (value: ResearchDepth) => void;
  disabled: boolean;
}

export const ResearchDepthField = ({
  value,
  depths,
  onChange,
  disabled,
}: ResearchDepthFieldProps) => (
  <Dropdown
    label="Research Depth"
    value={value}
    options={depths.map((d) => ({ label: d.name, value: depthMap[d.value] }))}
    onChange={(v) => onChange(v as ResearchDepth)}
    disabled={disabled}
  />
);
