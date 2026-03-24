import { IoCheckmark } from "react-icons/io5";
import { Button } from "../../../../../components";
import type { ResendState } from "../../../../../stores/resetPasswordStore";

interface ResendActionProps {
  resendState: ResendState;
  onResend: () => void;
}

export default function ResendAction({
  resendState,
  onResend,
}: ResendActionProps) {
  if (resendState === "sent") {
    return (
      <div className="reset-success">
        <IoCheckmark size={18} />
        <span>A new reset link has been sent. Check your inbox.</span>
      </div>
    );
  }

  return (
    <Button
      className="reset-btn reset-btn--primary"
      onClick={onResend}
      loading={resendState === "loading"}
      loadingText="Sending…"
    >
      Request new link
    </Button>
  );
}
