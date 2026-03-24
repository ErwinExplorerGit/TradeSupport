import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

function LastName() {
  const lastName = useRegisterStore((s) => s.lastName);
  const error = useRegisterStore((s) => s.errors.lastName);
  const setLastName = useRegisterStore((s) => s.setLastName);
  const loading = useRegisterStore((s) => s.loading);

  return (
    <Input
      id="lastName"
      label="Last Name"
      value={lastName}
      onChange={setLastName}
      placeholder="Doe"
      autoComplete="family-name"
      error={error}
      disabled={loading}
    />
  );
}

export default LastName;
