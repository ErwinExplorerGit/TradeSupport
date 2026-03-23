import { Button } from "../../../../components";
import { useRegisterStore } from "../../../../stores";

function RegisterButton() {
  const loading = useRegisterStore((s) => s.loading);
  return (
    <Button type="submit" loading={loading} loadingText="Creating account…">
      Create Account
    </Button>
  );
}

export default RegisterButton;
