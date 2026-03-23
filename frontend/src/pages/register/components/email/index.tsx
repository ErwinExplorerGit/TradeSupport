import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

function Email() {
  const email = useRegisterStore((s) => s.email);
  const error = useRegisterStore((s) => s.errors.email);
  const setEmail = useRegisterStore((s) => s.setEmail);

  return (
    <Input
      id="email"
      label="Email"
      type="email"
      value={email}
      onChange={setEmail}
      placeholder="john.doe@example.com"
      autoComplete="email"
      error={error}
    />
  );
}

export default Email;
