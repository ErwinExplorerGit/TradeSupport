import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

function Password() {
  const password = useRegisterStore((s) => s.password);
  const error = useRegisterStore((s) => s.errors.password);
  const setPassword = useRegisterStore((s) => s.setPassword);

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
