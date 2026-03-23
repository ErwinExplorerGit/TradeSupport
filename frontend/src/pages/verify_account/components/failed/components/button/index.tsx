import { Button } from "../../../../../../components";
import { useVerifyAccountStore } from "../../../../../../stores/verifyAccountStore";

export default function ResendButton() {
  const resendLoading = useVerifyAccountStore((s) => s.resendLoading);

  return (
    <Button type="submit" loading={resendLoading}>
      Resend verification email
    </Button>
  );
}
