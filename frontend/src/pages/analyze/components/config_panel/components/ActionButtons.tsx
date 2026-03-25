import { Button } from "../../../../../components";

interface ActionButtonsProps {
  isRunning: boolean;
  isAddingTicker?: boolean;
  isStarting?: boolean;
}

export const ActionButtons = ({
  isRunning,
  isAddingTicker = false,
  isStarting = false,
}: ActionButtonsProps) => (
  <div className="cp-actions">
    <Button
      type="submit"
      variant="primary"
      className="cp-btn-start"
      loading={isStarting || isAddingTicker}
      loadingText={isStarting ? "Starting..." : "Adding..."}
    >
      {isRunning && !isStarting ? "Add to Analysis" : "Run Analysis"}
    </Button>
  </div>
);
