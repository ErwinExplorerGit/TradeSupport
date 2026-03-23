import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

interface EmailProps {
  error?: string;
}

function Email({ error }: EmailProps) {
  const { email, setEmail } = useRegisterStore();

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
