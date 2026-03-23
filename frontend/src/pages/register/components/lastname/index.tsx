import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

function LastName() {
  const lastName = useRegisterStore((s) => s.lastName);
  const error = useRegisterStore((s) => s.errors.lastName);
  const setLastName = useRegisterStore((s) => s.setLastName);

  return (
    <Input
      id="lastName"
      label="Last Name"
      value={lastName}
      onChange={setLastName}
      placeholder="Doe"
      autoComplete="family-name"
      error={error}
    />
  );
}

export default LastName;
