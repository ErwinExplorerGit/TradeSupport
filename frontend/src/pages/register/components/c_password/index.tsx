import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

function ConfirmPassword() {
  const confirmPassword = useRegisterStore((s) => s.confirmPassword);
  const error = useRegisterStore((s) => s.errors.confirmPassword);
  const setConfirmPassword = useRegisterStore((s) => s.setConfirmPassword);
  const loading = useRegisterStore((s) => s.loading);

  return (
    <Input
      id="confirmPassword"
      label="Confirm Password"
      type="password"
      value={confirmPassword}
      onChange={setConfirmPassword}
      placeholder="Re-enter your password"
      autoComplete="new-password"
      error={error}
      disabled={loading}
    />
  );
}

export default ConfirmPassword;
