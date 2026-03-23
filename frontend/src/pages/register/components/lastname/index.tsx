import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

interface LastNameProps {
  error?: string;
}

function LastName({ error }: LastNameProps) {
  const { lastName, setLastName } = useRegisterStore();

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
