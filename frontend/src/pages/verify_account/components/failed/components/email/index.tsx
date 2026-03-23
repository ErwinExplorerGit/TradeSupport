import { Input } from "../../../../../../components";
import { useVerifyAccountStore } from "../../../../../../stores/verifyAccountStore";

export default function Email() {
  const email = useVerifyAccountStore((s) => s.email);
  const emailError = useVerifyAccountStore((s) => s.emailError);
  const resendLoading = useVerifyAccountStore((s) => s.resendLoading);
  const setEmail = useVerifyAccountStore((s) => s.setEmail);

  return (
    <Input
      id="verify-email"
      label="Email address"
      type="email"
      value={email}
      onChange={setEmail}
      placeholder="you@example.com"
      autoComplete="email"
      disabled={resendLoading}
      error={emailError}
    />
  );
}
