import { Button } from "../../../../components";
import { useForgotPasswordStore } from "../../../../stores/forgotPasswordStore";

function ForgotPasswordButton() {
  const loading = useForgotPasswordStore((s) => s.loading);

  return (
    <Button type="submit" disabled={loading}>
      {loading ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export default ForgotPasswordButton;
