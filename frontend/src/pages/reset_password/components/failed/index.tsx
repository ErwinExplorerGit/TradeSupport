import { useSearchParams } from "react-router";
import { useResetPasswordStore } from "../../../../stores/resetPasswordStore";
import FailedIcon from "./components/FailedIcon";
import FailedHeader from "./components/FailedHeader";
import ResendAction from "./components/ResendAction";
import FailedFooter from "./components/FailedFooter";

export default function Failed() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const reset = useResetPasswordStore((s) => s.reset);
  const resendState = useResetPasswordStore((s) => s.resendState);
  const resendByToken = useResetPasswordStore((s) => s.resendByToken);

  const handleResend = () => {
    if (token) {
      resendByToken(token);
    }
  };

  return (
    <>
      <FailedIcon />
      <FailedHeader />
      <ResendAction resendState={resendState} onResend={handleResend} />
      <FailedFooter onReset={reset} />
    </>
  );
}
