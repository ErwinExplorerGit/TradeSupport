import { Input } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

function FirstName() {
  const firstName = useRegisterStore((s) => s.firstName);
  const error = useRegisterStore((s) => s.errors.firstName);
  const setFirstName = useRegisterStore((s) => s.setFirstName);
  const loading = useRegisterStore((s) => s.loading);

  return (
    <Input
      id="firstName"
      label="First Name"
      value={firstName}
      onChange={setFirstName}
      placeholder="John"
      autoComplete="given-name"
      error={error}
      disabled={loading}
    />
  );
}

export default FirstName;
