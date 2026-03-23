import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

interface ConfirmPasswordProps {
  error?: string;
}

function ConfirmPassword({ error }: ConfirmPasswordProps) {
  const { confirmPassword, setConfirmPassword } = useRegisterStore();

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
    />
  );
}

export default ConfirmPassword;
