import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

interface PasswordProps {
  error?: string;
}

function Password({ error }: PasswordProps) {
  const { password, setPassword } = useRegisterStore();

  return (
    <Input
      id="password"
      label="Password"
      type="password"
      value={password}
      onChange={setPassword}
      placeholder="Min. 8 characters"
      autoComplete="new-password"
      error={error}
    />
  );
}

export default Password;
