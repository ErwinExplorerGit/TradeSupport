import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

interface FirstNameProps {
  error?: string;
}

function FirstName({ error }: FirstNameProps) {
  const { firstName, setFirstName } = useRegisterStore();

  return (
    <Input
      id="firstName"
      label="First Name"
      value={firstName}
      onChange={setFirstName}
      placeholder="John"
      autoComplete="given-name"
      error={error}
    />
  );
}

export default FirstName;
