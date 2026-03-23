import { Input } from "../../../../components";
import { useForgotPasswordStore } from "../../../../stores/forgotPasswordStore";

function ForgotPasswordEmail() {
  const email = useForgotPasswordStore((s) => s.email);
  const emailError = useForgotPasswordStore((s) => s.emailError);
  const setEmail = useForgotPasswordStore((s) => s.setEmail);

  return (
    <Input
      id="forgot-email"
      label="Email address"
      type="email"
      value={email}
      onChange={setEmail}
      placeholder="you@example.com"
      autoComplete="email"
      error={emailError}
      autoFocus
    />
  );
}

export default ForgotPasswordEmail;
