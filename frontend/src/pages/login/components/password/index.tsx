import { Input } from "../../../../components";
import { useLoginStore } from "../../../../stores";

function Password() {
  const { password, setPassword } = useLoginStore();

  return (
    <Input
      id="password"
      label="Password"
      type="password"
      value={password}
      onChange={(value) => setPassword(value)}
      placeholder="Enter your password"
      autoComplete="current-password"
    />
  );
}

export default Password;
