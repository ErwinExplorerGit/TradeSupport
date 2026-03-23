import { Button } from "../../../../components";
import { useLoginStore } from "../../../../stores";

function LoginButton() {
  const { loading } = useLoginStore();
  return (
    <Button type="submit" disabled={loading}>
      {loading ? "Signing in…" : "Sign In"}
    </Button>
  );
}

export default LoginButton;
