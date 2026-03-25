import { useLoginStore } from "@/stores";
import LoginForm from "./components/login";
import VerifyEmail from "./components/verify_email";
import "./styles.scss";

export default function LoginPage() {
  const unverified = useLoginStore((s) => s.unverified);

  if (unverified) {
    return (
      <div className="login-page">
        <main className="login-body">
          <VerifyEmail />
        </main>
      </div>
    );
  }

  return (
    <div className="login-page">
      <main className="login-body">
        <LoginForm />
      </main>
    </div>
  );
}
