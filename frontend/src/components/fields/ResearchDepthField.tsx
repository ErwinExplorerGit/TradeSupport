import { ResearchDepth, DepthOption } from '../../types';

interface ResearchDepthFieldProps {
  value: ResearchDepth;
  availableDepths: DepthOption[];
  depthMap: Record<number, ResearchDepth>;
  onChange: (value: ResearchDepth) => void;
  disabled: boolean;
}

export const ResearchDepthField = ({ 
  value, 
  availableDepths, 
  depthMap, 
  onChange, 
  disabled 
}: ResearchDepthFieldProps) => {
  return (
    <div className="form-section">
      <label className="form-label">
        Research Depth
      </label>
      <select
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value as ResearchDepth)}
        disabled={disabled}
      >
        {availableDepths.map((depth) => {
          const mappedValue = depthMap[depth.value];
          return (
            <option key={depth.value} value={mappedValue}>
              {depth.name}
            </option>
          );
        })}
      </select>
    </div>
  );
};
