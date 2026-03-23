import { Link, useNavigate } from "react-router";
import { useLoginStore } from "../../stores/loginStore";
import LoginButton from "./components/button";
import Error from "./components/error";
import Password from "./components/password";
import Username from "./components/username";
import "./styles.scss";

export default function LoginPage() {
  //Handle Navigation
  const navigate = useNavigate();

  const reset = useLoginStore((s) => s.reset);

  //Handle form actions
  const submit = useLoginStore((s) => s.submit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(() => navigate("/analyze"));
  };

  return (
    <div className="login-page">
      <main className="login-body">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-card-title">Welcome back</h1>
            <p className="login-card-subtitle">
              Sign in to your account to continue
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <Error />

            <div className="login-field">
              <Username />
            </div>

            <div className="login-field">
              <Password />
            </div>

            <LoginButton />
          </form>

          <div className="login-footer">
            <Link to="/forgot-password" className="login-link">
              Forgot your password?
            </Link>
            <span className="login-divider">·</span>
            <p className="login-register-text">
              Don't have an account?{" "}
              <Link to="/register" onClick={reset}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
