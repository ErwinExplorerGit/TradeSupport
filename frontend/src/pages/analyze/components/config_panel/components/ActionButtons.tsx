import { Button } from "../../../../../components";

interface ActionButtonsProps {
  isRunning: boolean;
  onStop: () => void;
}

export const ActionButtons = ({ isRunning, onStop }: ActionButtonsProps) => (
  <div className="button-group">
    <Button
      type="submit"
      variant="primary"
      loading={isRunning}
      loadingText="Analyzing..."
    >
      Start Analysis
    </Button>
    <Button variant="secondary" onClick={onStop} disabled={!isRunning}>
      Stop
    </Button>
  </div>
);
